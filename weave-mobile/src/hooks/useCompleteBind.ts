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
  notes?: string; // Optional description
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      timer_duration: request.timerDuration,
      notes: request.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to complete bind');
  }

  return response.json();
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
