/**
 * useCompleteBind Hook
 * TanStack Query mutation for completing a bind
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';
import { bindsQueryKeys } from './useTodayBinds';
import { goalsQueryKeys } from './useActiveGoals';

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
      // Refetch today's binds query immediately (not just invalidate)
      const today = new Date().toISOString().split('T')[0];
      queryClient.refetchQueries({ queryKey: bindsQueryKeys.today(today) });

      // Refetch Dashboard queries to update consistency and stats immediately
      queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() });
      queryClient.refetchQueries({ queryKey: ['userStats'] });

      // Refetch Dashboard section queries (Epic 5 - Progress Visualization) immediately
      queryClient.refetchQueries({ queryKey: ['consistency'] }); // All consistency data
      queryClient.refetchQueries({ queryKey: ['bindsGrid'] }); // 7d grid view
      queryClient.refetchQueries({ queryKey: ['history'] }); // History list

      console.log('[COMPLETE_BIND] Refetched Thread, Dashboard, and History queries');
    },
  });
}
