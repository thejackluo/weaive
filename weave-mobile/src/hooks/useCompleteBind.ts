/**
 * useCompleteBind Hook
 * TanStack Query mutation for completing a bind
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { completeBind as completeBindAPI } from '@/services/binds';
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

export function useCompleteBind() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CompleteBindRequest) => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Get user's local date to pass to backend (ensures timezone-accurate completion)
      const localDate = new Date().toISOString().split('T')[0];

      // Call API service with local_date parameter
      return completeBindAPI(
        request.bindId,
        session.access_token,
        localDate,
        request.timerDuration,
        request.photoUsed,
        request.notes
      );
    },
    // Optimistic update: Mark bind as completed IMMEDIATELY (before API call finishes)
    onMutate: async (request: CompleteBindRequest) => {
      const today = new Date().toISOString().split('T')[0];
      const queryKey = bindsQueryKeys.today(today);

      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ['bindsGrid'], exact: false });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData(queryKey);
      const previousGridData = queryClient.getQueriesData({
        queryKey: ['bindsGrid'],
        exact: false,
      });

      // Get template_id BEFORE updating (from original data)
      const originalThreadData: any = previousData;
      const completedBind = originalThreadData?.data?.find((b: any) => b.id === request.bindId);
      const templateId = completedBind?.template_id;

      // 1. Optimistically update the Thread screen bind list
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((bind: any) =>
            bind.id === request.bindId
              ? {
                  ...bind,
                  completed: true,
                  status: 'done',
                  completion_details: {
                    completed_at: new Date().toISOString(),
                    duration_minutes: request.timerDuration || null,
                    notes: request.notes || null,
                  },
                }
              : bind
          ),
          meta: {
            ...old.meta,
            completed_count: old.meta.completed_count + 1,
          },
        };
      });

      // 2. Optimistically update the binds grid (7-day view)
      // IMPORTANT: Grid uses template_id, Thread screen uses instance_id

      if (templateId) {
        previousGridData.forEach(([key, data]: [any, any]) => {
          if (!data?.data?.needles || !data?.meta?.start_date) return;

          // Calculate which day index today is in the 7-day grid
          const startDate = new Date(data.meta.start_date);
          const todayDate = new Date(today);
          const dayIndex = Math.floor(
            (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Only update if today is within the grid's date range (0-6)
          if (dayIndex < 0 || dayIndex > 6) return;

          queryClient.setQueryData(key, {
            ...data,
            data: {
              ...data.data,
              needles: data.data.needles.map((needle: any) => ({
                ...needle,
                binds: needle.binds.map((bind: any) => {
                  if (bind.id === templateId) {
                    const newCompletions = [...bind.completions];
                    newCompletions[dayIndex] = true;
                    if (__DEV__) {
                      console.log(
                        `[COMPLETE_BIND] Updated grid for template ${templateId} on day ${dayIndex}`
                      );
                    }
                    return { ...bind, completions: newCompletions };
                  }
                  return bind;
                }),
              })),
            },
          });
        });

        if (__DEV__) {
          console.log('[COMPLETE_BIND] Optimistic updates applied (Thread + Grid)');
        }
      } else {
        if (__DEV__) {
          console.warn('[COMPLETE_BIND] No template_id found - grid not updated optimistically');
          console.log('[COMPLETE_BIND] Optimistic update applied (Thread only)');
        }
      }

      // Return context for rollback on error
      return { previousData, previousGridData };
    },
    // Rollback on error
    onError: (err, request, context: any) => {
      const today = new Date().toISOString().split('T')[0];

      // Rollback Thread screen
      if (context?.previousData) {
        queryClient.setQueryData(bindsQueryKeys.today(today), context.previousData);
      }

      // Rollback grid
      if (context?.previousGridData) {
        context.previousGridData.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }

      if (__DEV__) {
        console.log('[COMPLETE_BIND] Rolled back optimistic updates (Thread + Grid) due to error');
      }
    },
    onSuccess: async () => {
      console.log('[COMPLETE_BIND] Bind completed successfully, refetching queries...');

      const today = new Date().toISOString().split('T')[0];

      // Refetch all related queries in parallel for instant updates (same pattern as goal mutations)
      await Promise.all([
        queryClient.refetchQueries({ queryKey: bindsQueryKeys.today(today) }),
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() }),
        queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false }),
        queryClient.refetchQueries({ queryKey: ['userStats'] }),
        queryClient.refetchQueries({ queryKey: historyQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ['daily-detail', today] }),
      ]);

      console.log('[COMPLETE_BIND] All queries refetched successfully');
    },
  });
}
