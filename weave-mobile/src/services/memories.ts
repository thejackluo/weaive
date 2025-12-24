/**
 * Memories API Service
 *
 * Handles API communication for goal memories (photos/images associated with goals)
 */

import { getApiBaseUrl } from '@/utils/api';
import type { Memory } from '@/types/goals';

export interface UploadMemoryRequest {
  goalId: string;
  imageUri: string;
  fileName: string;
}

export interface MemoriesResponse {
  data: Memory[];
  meta?: {
    timestamp: string;
    total: number;
  };
}

export interface MemoryResponse {
  data: Memory;
  meta?: {
    timestamp: string;
  };
}

/**
 * Upload image to Supabase Storage and create memory record
 *
 * @param params - Upload parameters (goalId, imageUri, fileName)
 * @param accessToken - JWT access token for authentication
 * @returns Promise with created memory data
 * @throws Error if upload or API call fails
 *
 * @example
 * ```ts
 * const memory = await uploadMemory({
 *   goalId: 'goal-123',
 *   imageUri: 'file:///path/to/image.jpg',
 *   fileName: 'memory-12345.jpg'
 * }, accessToken);
 * ```
 */
export async function uploadMemory(
  params: UploadMemoryRequest,
  accessToken: string
): Promise<MemoryResponse> {
  const { goalId, imageUri } = params;

  // 1. Create FormData with the image file (React Native compatible)
  // FormData handles file:// URIs properly in React Native
  const formData = new FormData();
  const uniqueFileName = `memory-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

  // React Native FormData accepts file URIs with this format
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: uniqueFileName,
  } as any);

  // 2. Upload to Supabase Storage using fetch (FormData approach)
  // This is more reliable than Supabase client for React Native
  const storagePath = `${goalId}/${uniqueFileName}`;
  const uploadUrl = `https://jywfusrgwybljusuofnp.supabase.co/storage/v1/object/goal-memories/${storagePath}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Failed to upload image: ${errorText}`);
  }

  // 3. Get public URL for uploaded image
  const publicUrl = `https://jywfusrgwybljusuofnp.supabase.co/storage/v1/object/public/goal-memories/${storagePath}`;

  // 4. Create memory record via API
  const baseUrl = getApiBaseUrl();
  const apiUrl = `${baseUrl}/api/goals/${goalId}/memories`;

  const apiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      image_url: publicUrl,
      storage_path: storagePath,
    }),
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.json();
    throw new Error(
      errorData.error?.message ||
        `Failed to create memory record: ${apiResponse.status} ${apiResponse.statusText}`
    );
  }

  const data: MemoryResponse = await apiResponse.json();
  return data;
}

/**
 * Fetch memories for a goal
 *
 * @param goalId - Goal ID
 * @param accessToken - JWT access token for authentication
 * @returns Promise with memories data
 * @throws Error if API call fails
 *
 * @example
 * ```ts
 * const memories = await fetchGoalMemories('goal-123', accessToken);
 * ```
 */
export async function fetchGoalMemories(
  goalId: string,
  accessToken: string
): Promise<MemoriesResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals/${goalId}/memories`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message ||
        `Failed to fetch memories: ${response.status} ${response.statusText}`
    );
  }

  const data: MemoriesResponse = await response.json();
  return data;
}

/**
 * Delete a memory (removes from storage and database)
 *
 * @param goalId - Goal ID
 * @param memoryId - Memory ID to delete
 * @param accessToken - JWT access token for authentication
 * @returns Promise with success status
 * @throws Error if API call fails
 *
 * @example
 * ```ts
 * await deleteMemory('goal-123', 'memory-456', accessToken);
 * ```
 */
export async function deleteMemory(
  goalId: string,
  memoryId: string,
  accessToken: string
): Promise<{ success: boolean }> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals/${goalId}/memories/${memoryId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message ||
        `Failed to delete memory: ${response.status} ${response.statusText}`
    );
  }

  return { success: true };
}
