/**
 * useCompleteBind Hook
 * TanStack Query mutation for completing a bind
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';
import { bindsQueryKeys } from './useTodayBinds';
import { consistencyQueryKeys } from './useConsistencyData';
import { userStatsQueryKeys } from './useUserStats';
import { historyQueryKeys } from './useHistory';
import { goalsQueryKeys } from './useActiveGoals';

interface CompleteBindRequest {
  bindId: string;
  timerDuration?: number; // Timer duration in minutes
  photoUsed?: boolean; // Whether photo accountability was used
  notes?: string; // Optional completion description (280 char max)
}

interface ProgressUpdate {
  level_before: number;
  level_after: number;
  level_up: boolean;
  xp_gained: number;
  total_xp: number;
  xp_to_next_level: number;
  streak_before: number;
  streak_after: number;
  streak_status: 'active' | 'at_risk' | 'broken';
  streak_milestone_reached: { day: number; message: string } | null;
  grace_period_saved: boolean;
}

interface CompleteBindResponse {
  success: boolean;
  data: {
    completion_id: string;
    bind_id: string;
    completed_at: string;
    affirmation: string;
    progress_update: ProgressUpdate;
  };
}

export type { ProgressUpdate, CompleteBindResponse };

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
      queryClient.invalidateQueries({ queryKey: bindsQueryKeys.today(today) });

      // Invalidate dashboard stats (auto-refresh Dashboard after completion)
      queryClient.invalidateQueries({ queryKey: consistencyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userStatsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });
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
