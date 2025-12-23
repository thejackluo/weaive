/**
 * useUpdateBind Hook
 * TanStack Query mutation for updating a bind (subtask template)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';
import { goalsQueryKeys } from './useActiveGoals';

interface UpdateBindRequest {
  bindId: string;
  title?: string;
  recurrenceRule?: string; // iCal RRULE format
  defaultEstimatedMinutes?: number;
}

interface UpdateBindResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    recurrence_rule: string;
    default_estimated_minutes: number;
    updated_at: string;
  };
}

async function updateBind(
  accessToken: string,
  request: UpdateBindRequest
): Promise<UpdateBindResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/${request.bindId}`;

  // Build request body, omitting undefined values
  const body: {
    title?: string;
    recurrence_rule?: string;
    default_estimated_minutes?: number;
  } = {};

  if (request.title !== undefined) {
    body.title = request.title;
  }
  if (request.recurrenceRule !== undefined) {
    body.recurrence_rule = request.recurrenceRule;
  }
  if (request.defaultEstimatedMinutes !== undefined) {
    body.default_estimated_minutes = request.defaultEstimatedMinutes;
  }

  console.log('[UPDATE_BIND] Request:', { url, bindId: request.bindId, body });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[UPDATE_BIND] API error:', response.status, error);
    throw new Error(error.detail || error.message || 'Failed to update bind');
  }

  const result = await response.json();
  console.log('[UPDATE_BIND] API success:', result);
  return result;
}

export function useUpdateBind() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateBindRequest) => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      return updateBind(session.access_token, request);
    },
    onSuccess: () => {
      // Invalidate goal queries to refetch updated binds
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.active() });
      console.log('[UPDATE_BIND] Invalidated goal queries');
    },
  });
}
