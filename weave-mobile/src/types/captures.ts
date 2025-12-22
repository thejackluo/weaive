/**
 * Capture Types - Image capture, upload, and AI vision analysis
 * Story: 0.9 - AI-Powered Image Service
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum CaptureType {
  TEXT = 'text',
  PHOTO = 'photo',
  AUDIO = 'audio',
  TIMER = 'timer',
  LINK = 'link',
}

export enum PhotoSource {
  CAMERA = 'camera',
  GALLERY = 'gallery',
}

// ============================================================================
// AI VISION ANALYSIS
// ============================================================================

export interface AIVisionCategory {
  label: 'gym' | 'food' | 'outdoor' | 'workspace' | 'social' | 'other';
  confidence: number; // 0.0-1.0
}

export interface AIVisionAnalysis {
  provider: string; // 'gemini-3-flash-preview' | 'gpt-4o'
  validation_score: number; // 0-100
  is_verified: boolean; // true if validation_score >= 80
  summary?: string | null; // 1-2 sentence description of image content
  ocr_text: string | null;
  categories: AIVisionCategory[];
  quality_score: number; // 1-5
  timestamp: string; // ISO8601
}

// ============================================================================
// CAPTURE RECORDS
// ============================================================================

export interface Capture {
  id: string; // UUID
  user_id: string; // UUID
  type: CaptureType;
  content_text?: string | null; // Note/caption for photos, or text content
  storage_key?: string | null; // Supabase Storage path
  transcript_text?: string | null; // For audio (future)
  goal_id?: string | null; // UUID
  subtask_instance_id?: string | null; // UUID (bind ID)
  local_date: string; // YYYY-MM-DD
  ai_analysis?: AIVisionAnalysis | null;
  ai_verified: boolean;
  ai_quality_score?: number | null; // 1-5
  created_at: string; // ISO8601
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface UploadImageRequest {
  file: Blob;
  subtask_instance_id?: string | null;
  goal_id?: string | null;
  local_date: string;
  note?: string | null;
  bind_description?: string | null; // Expected content for AI validation
  run_ai_analysis?: boolean; // Default: true
}

export interface UploadImageResponse {
  data: {
    id: string;
    storage_key: string;
    signed_url: string;
    ai_analysis: AIVisionAnalysis | null;
    ai_verified: boolean;
  };
  meta: {
    timestamp: string;
  };
}

export interface ListImagesRequest {
  goal_id?: string | null;
  subtask_instance_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  page?: number; // Default: 1
  per_page?: number; // Default: 20, max: 100
}

export interface ListImagesResponse {
  data: (Capture & { signed_url: string })[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    timestamp: string;
  };
}

export interface UploadUsageResponse {
  data: {
    upload_count: number; // 0-5
    upload_size_mb: number; // 0-5.0
    ai_vision_count: number; // 0-5
    local_date: string;
  };
  meta: {
    timestamp: string;
  };
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface ProofCaptureContext {
  subtask_instance_id: string | null;
  goal_id?: string | null;
  local_date: string;
  note?: string | null;
  bind_description?: string | null; // For AI validation
}

export interface PhotoCaptureOptions {
  quality?: number; // 0-1, default: 0.8
  allowsEditing?: boolean; // Default: false
  base64?: boolean; // Default: false
  exif?: boolean; // Default: false
}

// ============================================================================
// IMAGE COMPRESSION
// ============================================================================

export interface ImageCompressionOptions {
  maxWidth?: number; // Default: 1920px
  maxHeight?: number; // Default: 1920px
  quality?: number; // 0-1, default: 0.8
  format?: 'jpeg' | 'png'; // Default: 'jpeg'
}

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  // Note: File size calculated during upload, not during compression
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retryable: false;
  retry_after: number; // seconds until midnight
}

export interface UploadLimits {
  max_images_per_day: number; // 5 (free tier)
  max_size_per_day_mb: number; // 5.0 (free tier)
  max_ai_analyses_per_day: number; // 5 (free tier)
}
