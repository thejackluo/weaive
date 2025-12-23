/**
 * useCompleteBind Hook
 * TanStack Query mutation for completing a bind
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';
import { bindsQueryKeys } from './useTodayBinds';

interface CompleteBindRequest {
  bindId: string;
  timerDuration?: number; // Timer duration in minutes
  photoUsed?: boolean; // Whether photo accountability was used
  notes?: string; // Optional completion description (280 char max)
}

interface CompleteBindResponse {
  success: boolean;
  data: {
    completion_id: string;
    bind_id: string;
    completed_at: string;
    level: number;
    level_progress: number; // Percentage to next level (0-100)
    affirmation: string;
  };
}

async function completeBind(
  accessToken: string,
  request: CompleteBindRequest
): Promise<CompleteBindResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/${request.bindId}/complete`;

  // Build request body, omitting undefined values (not valid JSON)
  const body: { timer_duration?: number; photo_used?: boolean; notes?: string } = {};
  if (request.timerDuration !== undefined) {
    body.timer_duration = request.timerDuration;
  }
  if (request.photoUsed !== undefined) {
    body.photo_used = request.photoUsed;
  }
  if (request.notes !== undefined) {
    body.notes = request.notes;
  }

  console.log('[COMPLETE_BIND] Request:', { url, bindId: request.bindId, body });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[COMPLETE_BIND] API error:', response.status, error);
    throw new Error(error.detail || error.message || 'Failed to complete bind');
  }

  const result = await response.json();
  console.log('[COMPLETE_BIND] API success:', result);
  return result;
}

export function useCompleteBind() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CompleteBindRequest) => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      return completeBind(session.access_token, request);
    },
    onSuccess: () => {
      // Invalidate today's binds query to refetch updated data
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: bindsQueryKeys.today(today) });
    },
  });
}
