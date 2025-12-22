/**
 * Hook: useRecordingHistory
 *
 * Fetches recording history from captures table (type = 'audio')
 * Uses TanStack Query for caching and automatic refetching
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';

/**
 * Recording capture from database
 */
export interface RecordingCapture {
  id: string;
  user_id: string;
  type: 'audio';
  storage_key: string;
  content_text: string | null; // Transcript (null if not transcribed)
  duration_sec: number;
  local_date: string;
  created_at: string;
  confidence_score?: number; // Transcription confidence
  provider?: 'assemblyai' | 'whisper' | 'manual';
  audio_url?: string; // Signed URL for playback (1-hour expiration)
}

/**
 * Fetch recording history
 */
async function fetchRecordingHistory(): Promise<RecordingCapture[]> {
  console.log('[RECORDING_HISTORY] Fetching recording history...');

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  // Get user_profile.id from auth.uid
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // Fetch audio captures
  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .eq('user_id', profile.id)
    .eq('type', 'audio')
    .order('created_at', { ascending: false })
    .limit(50); // Limit to last 50 recordings

  if (error) {
    console.error('[RECORDING_HISTORY] ❌ Error fetching recordings:', error);
    throw error;
  }

  console.log('[RECORDING_HISTORY] ✅ Fetched recordings:', data?.length || 0);

  // Generate signed URLs for each recording (1-hour expiration)
  const recordingsWithUrls = await Promise.all(
    (data || []).map(async (recording) => {
      try {
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('captures')
          .createSignedUrl(recording.storage_key, 3600); // 1 hour = 3600 seconds

        if (urlError || !signedUrlData?.signedUrl) {
          console.error(`[RECORDING_HISTORY] ⚠️  Failed to generate signed URL for ${recording.storage_key}:`, urlError);
          return {
            ...recording,
            audio_url: null,
          };
        }

        return {
          ...recording,
          audio_url: signedUrlData.signedUrl,
        };
      } catch (urlGenerationError) {
        console.error(`[RECORDING_HISTORY] ⚠️  Error generating signed URL:`, urlGenerationError);
        return {
          ...recording,
          audio_url: null,
        };
      }
    })
  );

  console.log(
    '[RECORDING_HISTORY] 🔗 Generated signed URLs:',
    recordingsWithUrls.filter((r) => r.audio_url).length,
    '/',
    recordingsWithUrls.length
  );

  return recordingsWithUrls as RecordingCapture[];
}

/**
 * Hook: useRecordingHistory
 *
 * Returns:
 * - data: Array of recording captures
 * - isLoading: Loading state
 * - error: Error if fetch failed
 * - refetch: Function to manually refetch
 */
export function useRecordingHistory() {
  return useQuery({
    queryKey: ['recordingHistory'],
    queryFn: fetchRecordingHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
