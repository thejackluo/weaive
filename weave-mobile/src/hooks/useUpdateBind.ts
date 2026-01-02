/**
 * useUpdateBind Hook
 * TanStack Query mutation for updating a bind (subtask template)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';
import { goalsQueryKeys } from './useActiveGoals';
import { bindsQueryKeys } from './useTodayBinds';
import { consistencyQueryKeys } from './useConsistencyData';

interface UpdateBindRequest {
  bindId: string;
  title?: string;
  times_per_week?: number; // Number of times per week (1-7)
  recurrenceRule?: string; // iCal RRULE format (deprecated, use times_per_week)
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
    times_per_week?: number;
    recurrence_rule?: string;
    default_estimated_minutes?: number;
  } = {};

  if (request.title !== undefined) {
    body.title = request.title;
  }
  if (request.times_per_week !== undefined) {
    body.times_per_week = request.times_per_week;
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
    // Optimistic update: Update bind IMMEDIATELY (before API call finishes)
    onMutate: async (request: UpdateBindRequest) => {
      console.log('[UPDATE_BIND] Starting optimistic update for bind:', request.bindId);

      const today = new Date().toISOString().split('T')[0];

      // Cancel outgoing queries to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: goalsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.all, exact: false }); // Cancel all bind queries
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.today(today) }); // Explicitly cancel today's binds
      await queryClient.cancelQueries({ queryKey: ['bindsGrid'], exact: false });

      // Snapshot previous data for rollback
      const previousActiveGoals = queryClient.getQueryData(goalsQueryKeys.active());
      const previousAllGoals = queryClient.getQueriesData({ queryKey: goalsQueryKeys.all });
      const previousBinds = queryClient.getQueriesData({ queryKey: bindsQueryKeys.all });
      const previousTodayBinds = queryClient.getQueryData(bindsQueryKeys.today(today));
      const previousBindsGrid = queryClient.getQueriesData({ queryKey: ['bindsGrid'], exact: false });

      // Helper to update bind in data structure
      const updateBindInList = (binds: any[]) =>
        binds.map((bind: any) => {
          if (bind.id !== request.bindId) return bind;
          return {
            ...bind,
            ...(request.title !== undefined && { title: request.title }),
            ...(request.times_per_week !== undefined && { times_per_week: request.times_per_week }),
            ...(request.defaultEstimatedMinutes !== undefined && {
              default_estimated_minutes: request.defaultEstimatedMinutes,
            }),
            updated_at: new Date().toISOString(),
          };
        });

      // 1. Optimistically update bind in active goals list
      queryClient.setQueryData(goalsQueryKeys.active(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((goal: any) => ({
            ...goal,
            binds: goal.binds ? updateBindInList(goal.binds) : [],
          })),
        };
      });

      // 2. Optimistically update bind in all goal detail queries
      queryClient.setQueriesData({ queryKey: goalsQueryKeys.all }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            binds: old.data.binds ? updateBindInList(old.data.binds) : [],
          },
        };
      });

      // 3. Optimistically update bind instances in today's binds (Thread screen)
      queryClient.setQueryData(bindsQueryKeys.today(today), (old: any) => {
        if (!old?.data) return old;

        console.log('[UPDATE_BIND] Optimistically updating today binds. Old:', old.data?.length, 'binds');

        return {
          ...old,
          data: old.data.map((bind: any) => {
            // Match by template_id since today's binds are instances
            if (bind.template_id !== request.bindId) return bind;

            console.log('[UPDATE_BIND] Updating bind instance:', bind.id, 'title:', request.title);

            return {
              ...bind,
              ...(request.title !== undefined && { title: request.title }),
              // Note: times_per_week is on template, not instance
              updated_at: new Date().toISOString(),
            };
          }),
        };
      });

      // 4. Optimistically update bind in binds grid (Dashboard consistency view)
      queryClient.setQueriesData({ queryKey: ['bindsGrid'], exact: false }, (old: any) => {
        if (!old?.data?.needles) return old;
        return {
          ...old,
          data: {
            ...old.data,
            needles: old.data.needles.map((needle: any) => ({
              ...needle,
              binds: needle.binds
                ? needle.binds.map((bind: any) =>
                    bind.id !== request.bindId
                      ? bind
                      : {
                          ...bind,
                          ...(request.title !== undefined && { name: request.title }),
                        }
                  )
                : [],
            })),
          },
        };
      });

      console.log('[UPDATE_BIND] Optimistic update complete');

      // Return context for rollback
      return { previousActiveGoals, previousAllGoals, previousBinds, previousTodayBinds, previousBindsGrid };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      console.error('[UPDATE_BIND] Error, rolling back optimistic update:', error);

      const today = new Date().toISOString().split('T')[0];

      if (context?.previousActiveGoals) {
        queryClient.setQueryData(goalsQueryKeys.active(), context.previousActiveGoals);
      }
      if (context?.previousAllGoals) {
        context.previousAllGoals.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBinds) {
        context.previousBinds.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousTodayBinds) {
        queryClient.setQueryData(bindsQueryKeys.today(today), context.previousTodayBinds);
      }
      if (context?.previousBindsGrid) {
        context.previousBindsGrid.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }

      console.log('[UPDATE_BIND] Rollback complete');
    },
    // Confirm with server
    onSuccess: async () => {
      console.log('[UPDATE_BIND] Server confirmed, refetching for consistency...');

      // Refetch to confirm server state (background, won't block UI)
      await Promise.all([
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() }),
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: bindsQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false }),
      ]);

      console.log('[UPDATE_BIND] Server refetch complete');
    },
  });
}
