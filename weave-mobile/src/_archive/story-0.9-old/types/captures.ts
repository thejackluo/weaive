/**
 * Captures Types
 *
 * Story 0.9: Image Handling with Supabase Storage
 * Epic 3: Daily Actions & Proof (US-3.4, US-3.5)
 *
 * Types for proof photos, quick captures, and memory documentation
 */

/**
 * Capture type enum matching database capture_type
 * MVP focuses on 'photo' type for proof images
 */
export type CaptureType = 'text' | 'photo' | 'audio' | 'timer' | 'link';

/**
 * Capture database record
 * Matches the captures table schema from migration 007
 */
export interface Capture {
  /** UUID primary key */
  id: string;

  /** User who created this capture (user_profiles.id) */
  user_id: string;

  /** Type of capture */
  type: CaptureType;

  /** Text content for 'text' and 'link' types */
  content_text?: string | null;

  /** Supabase Storage key for 'photo' and 'audio' files
   * Format: {user_id}/proof_{timestamp}.jpg or {user_id}/quick_{timestamp}.jpg
   */
  storage_key?: string | null;

  /** AI transcription for 'audio' type (future feature) */
  transcript_text?: string | null;

  /** Optional link to goal */
  goal_id?: string | null;

  /** Optional link to subtask instance (for proof photos) */
  subtask_instance_id?: string | null;

  /** User's local date when captured (YYYY-MM-DD) */
  local_date: string;

  /** Server timestamp */
  created_at: string;
}

/**
 * Request payload for creating a new capture
 * Used when uploading image proof or quick capture
 */
export interface CreateCaptureRequest {
  /** Capture type - MVP focuses on 'photo' */
  type: CaptureType;

  /** Text content (optional for photos, required for text/link) */
  content_text?: string;

  /** Storage key after successful upload to Supabase Storage */
  storage_key?: string;

  /** Optional link to goal */
  goal_id?: string | null;

  /** Optional link to subtask (for proof photos) */
  subtask_instance_id?: string | null;

  /** User's local date (YYYY-MM-DD) */
  local_date: string;
}

/**
 * Image upload result from Supabase Storage
 */
export interface ImageUploadResult {
  /** Success status */
  success: boolean;

  /** Storage key/path in Supabase Storage */
  storage_key?: string;

  /** Public or signed URL to access the image */
  url?: string;

  /** Error message if upload failed */
  error?: string;
}

/**
 * Photo capture options for camera/gallery picker
 */
export interface PhotoCaptureOptions {
  /** Allow editing the photo before upload */
  allowsEditing?: boolean;

  /** Photo quality (0-1) */
  quality?: number;

  /** Image aspect ratio [width, height] */
  aspect?: [number, number];

  /** Max width in pixels (for compression) */
  maxWidth?: number;

  /** Max height in pixels (for compression) */
  maxHeight?: number;
}

/**
 * Proof capture context
 * Passed when capturing proof after completing a bind
 */
export interface ProofCaptureContext {
  /** Subtask instance ID being proven */
  subtask_instance_id: string;

  /** Optional goal ID for context */
  goal_id?: string;

  /** Local date of the completion */
  local_date: string;

  /** Optional caption/note */
  note?: string;
}
