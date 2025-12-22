/**
 * Image Capture Service - Camera/gallery access, compression, upload, AI analysis
 * Story: 0.9 - AI-Powered Image Service
 */

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@lib/supabase';
import {
  CaptureType,
  PhotoSource,
  ProofCaptureContext,
  UploadImageResponse,
  UploadUsageResponse,
  ListImagesResponse,
  CompressedImage,
  Capture,
} from '../types/captures';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// PERMISSIONS
// ============================================================================

export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Camera permission denied');
    return false;
  }
  return true;
}

export async function requestGalleryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Gallery permission denied');
    return false;
  }
  return true;
}

// ============================================================================
// IMAGE CAPTURE/SELECTION
// ============================================================================

export async function launchCamera(): Promise<ImagePicker.ImagePickerResult> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    throw new Error('Camera permission required');
  }

  return await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
  });
}

export async function launchGallery(): Promise<ImagePicker.ImagePickerResult> {
  const hasPermission = await requestGalleryPermissions();
  if (!hasPermission) {
    throw new Error('Gallery permission required');
  }

  return await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
  });
}

// ============================================================================
// IMAGE COMPRESSION
// ============================================================================

export async function compressImage(uri: string): Promise<CompressedImage> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }], // Max 1920px width, maintains aspect ratio
      {
        compress: 0.8, // 80% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: 0, // Size not available from manipulator, will be calculated on upload
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

export async function uploadImageToAPI(
  imageUri: string,
  context: ProofCaptureContext,
  runAIAnalysis: boolean = true
): Promise<UploadImageResponse> {
  try {
    // Compress image first
    const compressed = await compressImage(imageUri);

    // Get auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Prepare form data
    const formData = new FormData();

    // Fetch image as blob
    const response = await fetch(compressed.uri);
    const blob = await response.blob();
    formData.append('file', blob, 'photo.jpg');

    // Add context
    if (context.subtask_instance_id) {
      formData.append('subtask_instance_id', context.subtask_instance_id);
    }
    if (context.goal_id) {
      formData.append('goal_id', context.goal_id);
    }
    formData.append('local_date', context.local_date);
    if (context.note) {
      formData.append('note', context.note);
    }
    if (context.bind_description) {
      formData.append('bind_description', context.bind_description);
    }
    formData.append('run_ai_analysis', String(runAIAnalysis));

    // Upload to API
    const uploadResponse = await fetch(`${API_BASE_URL}/api/captures/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    return await uploadResponse.json();
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

// ============================================================================
// MAIN CAPTURE FLOWS
// ============================================================================

export async function captureAndUploadProofPhoto(
  context: ProofCaptureContext,
  source: PhotoSource
): Promise<UploadImageResponse | null> {
  try {
    // Launch camera or gallery
    const result = source === PhotoSource.CAMERA ? await launchCamera() : await launchGallery();

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null; // User canceled
    }

    const imageUri = result.assets[0].uri;

    // Upload with context
    return await uploadImageToAPI(imageUri, context, true);
  } catch (error) {
    console.error('Proof photo capture failed:', error);
    throw error;
  }
}

export async function captureQuickPhoto(
  localDate: string,
  source: PhotoSource,
  note?: string
): Promise<UploadImageResponse | null> {
  try {
    // Launch camera or gallery
    const result = source === PhotoSource.CAMERA ? await launchCamera() : await launchGallery();

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null; // User canceled
    }

    const imageUri = result.assets[0].uri;

    // Upload without bind context
    return await uploadImageToAPI(
      imageUri,
      { subtask_instance_id: '', local_date: localDate, note },
      true
    );
  } catch (error) {
    console.error('Quick photo capture failed:', error);
    throw error;
  }
}

// ============================================================================
// IMAGE RETRIEVAL
// ============================================================================

export async function getUserCaptures(
  localDate?: string,
  type?: CaptureType,
  goalId?: string,
  subtaskInstanceId?: string
): Promise<Capture[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Build query params
    const params = new URLSearchParams();
    if (goalId) params.append('goal_id', goalId);
    if (subtaskInstanceId) params.append('subtask_instance_id', subtaskInstanceId);
    if (localDate) {
      params.append('start_date', localDate);
      params.append('end_date', localDate);
    }
    params.append('per_page', '100');

    const response = await fetch(`${API_BASE_URL}/api/captures/images?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch captures');
    }

    const result: ListImagesResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get captures:', error);
    throw error;
  }
}

export async function getImageSignedUrl(
  storageKey: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('captures')
      .createSignedUrl(storageKey, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to get signed URL:', error);
    throw error;
  }
}

// ============================================================================
// IMAGE DELETION
// ============================================================================

export async function deleteImage(imageId: string): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/captures/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw error;
  }
}

// ============================================================================
// UPLOAD USAGE
// ============================================================================

export async function getUploadUsage(): Promise<UploadUsageResponse['data']> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/captures/usage`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get usage');
    }

    const result: UploadUsageResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get upload usage:', error);
    throw error;
  }
}
