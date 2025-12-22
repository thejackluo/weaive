/**
 * Image Capture Service
 *
 * Story 0.9: Image Handling with Supabase Storage
 * Epic 3: Daily Actions & Proof (US-3.4, US-3.5)
 *
 * Handles:
 * - Photo capture via camera or gallery
 * - Upload to Supabase Storage (captures bucket)
 * - Database record creation in captures table
 * - Proof attachment to completed binds
 */

import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@lib/supabase';
import { decode } from 'base64-arraybuffer';
import type {
  PhotoCaptureOptions,
  ImageUploadResult,
  CreateCaptureRequest,
  Capture,
  ProofCaptureContext,
} from '@/types/captures';

/**
 * Request camera permissions
 * Required before using camera for the first time
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[ImageCapture] Camera permission denied');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[ImageCapture] Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Request gallery/media library permissions
 * Required before accessing photo gallery
 */
export async function requestGalleryPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[ImageCapture] Gallery permission denied');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[ImageCapture] Error requesting gallery permission:', error);
    return false;
  }
}

/**
 * Launch camera to take a photo
 *
 * @param options - Photo capture options
 * @returns Image URI or null if cancelled/failed
 */
export async function launchCamera(options?: PhotoCaptureOptions): Promise<string | null> {
  try {
    // Check permissions
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Expo SDK 53 uses array format
      allowsEditing: options?.allowsEditing ?? true,
      quality: options?.quality ?? 0.8, // Balance between quality and file size
      aspect: options?.aspect,
    });

    if (result.canceled) {
      console.log('[ImageCapture] Camera capture cancelled');
      return null;
    }

    const imageUri = result.assets[0].uri;
    console.log('[ImageCapture] Photo captured:', imageUri);
    return imageUri;
  } catch (error) {
    console.error('[ImageCapture] Error launching camera:', error);
    throw error;
  }
}

/**
 * Launch gallery to pick a photo
 *
 * @param options - Photo capture options
 * @returns Image URI or null if cancelled/failed
 */
export async function launchGallery(options?: PhotoCaptureOptions): Promise<string | null> {
  try {
    // Check permissions
    const hasPermission = await requestGalleryPermissions();
    if (!hasPermission) {
      throw new Error('Gallery permission not granted');
    }

    // Launch gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: options?.allowsEditing ?? true,
      quality: options?.quality ?? 0.8,
      aspect: options?.aspect,
    });

    if (result.canceled) {
      console.log('[ImageCapture] Gallery selection cancelled');
      return null;
    }

    const imageUri = result.assets[0].uri;
    console.log('[ImageCapture] Photo selected from gallery:', imageUri);
    return imageUri;
  } catch (error) {
    console.error('[ImageCapture] Error launching gallery:', error);
    throw error;
  }
}

/**
 * Upload image to Supabase Storage (captures bucket)
 *
 * @param imageUri - Local file URI from ImagePicker
 * @param userId - User ID for folder isolation
 * @param prefix - File prefix ('proof' or 'quick')
 * @returns Upload result with storage key and URL
 */
export async function uploadImageToStorage(
  imageUri: string,
  userId: string,
  prefix: 'proof' | 'quick' = 'proof'
): Promise<ImageUploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = 'jpg'; // Always use jpg for consistency
    const fileName = `${prefix}_${timestamp}.${fileExtension}`;
    const storagePath = `${userId}/${fileName}`;

    console.log('[ImageCapture] Uploading image to:', storagePath);

    // Fetch image as blob (React Native)
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Read blob as base64 (required for Supabase upload in React Native)
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const base64 = await base64Promise;

    // Upload to Supabase Storage using base64
    const { data, error } = await supabase.storage
      .from('captures')
      .upload(storagePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('[ImageCapture] Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[ImageCapture] Upload successful:', data.path);

    // Get public/signed URL
    const { data: urlData } = supabase.storage.from('captures').getPublicUrl(storagePath);

    return {
      success: true,
      storage_key: storagePath,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('[ImageCapture] Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create capture record in database
 *
 * @param captureData - Capture metadata
 * @returns Created capture record
 */
export async function createCaptureRecord(
  captureData: CreateCaptureRequest
): Promise<Capture | null> {
  try {
    console.log('[ImageCapture] Creating capture record:', captureData);

    const { data, error } = await supabase.from('captures').insert(captureData).select().single();

    if (error) {
      console.error('[ImageCapture] Database insert error:', error);
      throw error;
    }

    console.log('[ImageCapture] Capture record created:', data.id);
    return data as Capture;
  } catch (error) {
    console.error('[ImageCapture] Failed to create capture record:', error);
    return null;
  }
}

/**
 * Complete flow: Capture photo + Upload + Create database record
 *
 * This is the main function to use for proof photos and quick captures.
 *
 * @param context - Proof context (subtask_instance_id, goal_id, local_date)
 * @param source - 'camera' or 'gallery'
 * @returns Created capture record or null if failed/cancelled
 */
export async function captureAndUploadProofPhoto(
  context: ProofCaptureContext,
  source: 'camera' | 'gallery' = 'camera'
): Promise<Capture | null> {
  try {
    // Step 1: Get user ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user_profile.id (not auth.uid) for captures table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const userId = profile.id;

    // Step 2: Capture photo
    const imageUri =
      source === 'camera'
        ? await launchCamera({ quality: 0.8, allowsEditing: true })
        : await launchGallery({ quality: 0.8, allowsEditing: true });

    if (!imageUri) {
      console.log('[ImageCapture] Photo capture cancelled');
      return null; // User cancelled
    }

    // Step 3: Upload to Supabase Storage
    const uploadResult = await uploadImageToStorage(imageUri, userId, 'proof');

    if (!uploadResult.success || !uploadResult.storage_key) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Step 4: Create database record
    const captureRecord = await createCaptureRecord({
      type: 'photo',
      storage_key: uploadResult.storage_key,
      content_text: context.note || null,
      goal_id: context.goal_id || null,
      subtask_instance_id: context.subtask_instance_id,
      local_date: context.local_date,
    });

    if (!captureRecord) {
      throw new Error('Failed to create database record');
    }

    console.log('[ImageCapture] ✅ Proof photo successfully captured and uploaded');
    return captureRecord;
  } catch (error) {
    console.error('[ImageCapture] Complete flow failed:', error);
    throw error;
  }
}

/**
 * Quick capture flow (no bind context)
 * For general memory capture not linked to specific tasks
 *
 * @param localDate - User's local date (YYYY-MM-DD)
 * @param source - 'camera' or 'gallery'
 * @param note - Optional caption/note
 * @returns Created capture record or null
 */
export async function captureQuickPhoto(
  localDate: string,
  source: 'camera' | 'gallery' = 'camera',
  note?: string
): Promise<Capture | null> {
  try {
    // Step 1: Get user ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const userId = profile.id;

    // Step 2: Capture photo
    const imageUri = source === 'camera' ? await launchCamera() : await launchGallery();

    if (!imageUri) {
      return null; // User cancelled
    }

    // Step 3: Upload to Supabase Storage
    const uploadResult = await uploadImageToStorage(imageUri, userId, 'quick');

    if (!uploadResult.success || !uploadResult.storage_key) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Step 4: Create database record (no subtask or goal link)
    const captureRecord = await createCaptureRecord({
      type: 'photo',
      storage_key: uploadResult.storage_key,
      content_text: note || null,
      local_date: localDate,
    });

    if (!captureRecord) {
      throw new Error('Failed to create database record');
    }

    console.log('[ImageCapture] ✅ Quick photo successfully captured and uploaded');
    return captureRecord;
  } catch (error) {
    console.error('[ImageCapture] Quick capture failed:', error);
    throw error;
  }
}

/**
 * Get signed URL for viewing a capture image
 * Use this to display images in the app
 *
 * @param storageKey - Storage key from capture record
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getImageUrl(
  storageKey: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('captures')
      .createSignedUrl(storageKey, expiresIn);

    if (error) {
      console.error('[ImageCapture] Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('[ImageCapture] Exception creating signed URL:', error);
    return null;
  }
}

/**
 * Get user's captures for a specific date
 *
 * @param localDate - User's local date (YYYY-MM-DD)
 * @param type - Optional filter by capture type
 * @returns Array of captures
 */
export async function getUserCaptures(
  localDate: string,
  type?: 'photo' | 'text' | 'audio'
): Promise<Capture[]> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    let query = supabase
      .from('captures')
      .select('*')
      .eq('user_id', profile.id)
      .eq('local_date', localDate)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ImageCapture] Error fetching captures:', error);
      throw error;
    }

    return (data as Capture[]) || [];
  } catch (error) {
    console.error('[ImageCapture] Failed to get user captures:', error);
    return [];
  }
}
