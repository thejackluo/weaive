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
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();
console.log('[ImageCapture] Initialized with API_BASE_URL:', API_BASE_URL);

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
    mediaTypes: ['images'],
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
    mediaTypes: ['images'],
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
    console.log('📤 [UPLOAD START] imageUri:', imageUri);
    console.log('📤 [UPLOAD START] context:', JSON.stringify(context, null, 2));

    // Compress image first
    console.log('🔄 [COMPRESS] Compressing image...');
    const compressed = await compressImage(imageUri);
    console.log('✅ [COMPRESS] Compressed:', {
      uri: compressed.uri,
      width: compressed.width,
      height: compressed.height,
    });

    // Get auth token
    console.log('🔐 [AUTH] Getting session...');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    console.log('✅ [AUTH] Session valid, token length:', session.access_token.length);

    // Prepare form data
    console.log('📦 [FORMDATA] Preparing FormData...');
    const formData = new FormData();

    // Append file (React Native format)
    const fileObj = {
      uri: compressed.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    };
    console.log('📦 [FORMDATA] Appending file:', fileObj);
    formData.append('file', fileObj as any);

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

    console.log('📦 [FORMDATA] All fields added to FormData');

    // Upload to API
    const uploadUrl = `${API_BASE_URL}/api/captures/upload`;
    console.log('☁️  [FETCH] Uploading to:', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    console.log('☁️  [FETCH] Response status:', uploadResponse.status);
    console.log(
      '☁️  [FETCH] Response headers:',
      JSON.stringify(Object.fromEntries(uploadResponse.headers.entries()))
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [FETCH ERROR] Status:', uploadResponse.status);
      console.error('❌ [FETCH ERROR] Response:', errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (_e) {
        error = { error: { message: errorText } };
      }
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await uploadResponse.json();
    console.log('✅ [UPLOAD SUCCESS] Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ [UPLOAD FAIL] Error:', error);
    console.error(
      '❌ [UPLOAD FAIL] Error type:',
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      '❌ [UPLOAD FAIL] Error message:',
      error instanceof Error ? error.message : String(error)
    );
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
  subtaskInstanceId?: string,
  startDate?: string,
  endDate?: string
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
      // Single day query (localDate takes precedence)
      params.append('start_date', localDate);
      params.append('end_date', localDate);
    } else if (startDate || endDate) {
      // Range query
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
    }
    params.append('per_page', '100');

    const url = `${API_BASE_URL}/api/captures/images?${params.toString()}`;
    console.log('[ImageCapture] Fetching images from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log('[ImageCapture] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ImageCapture] Error response:', errorText);
      throw new Error(`Failed to fetch captures: ${response.status} ${errorText}`);
    }

    const result: ListImagesResponse = await response.json();
    console.log('[ImageCapture] Fetched', result.data.length, 'images');
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
