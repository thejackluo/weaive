/**
 * useCreateBind Hook
 * TanStack Query mutation for creating a bind (subtask template)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { createBind as createBindService } from '@/services/binds';
import type { CreateBindRequest, BindResponse } from '@/types/binds';
import { goalsQueryKeys } from './useActiveGoals';
import { bindsQueryKeys } from './useTodayBinds';
import { consistencyQueryKeys } from './useConsistencyData';

export function useCreateBind() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBindRequest): Promise<BindResponse> => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      return createBindService(request, session.access_token);
    },
    // Optimistic update: Add bind IMMEDIATELY (before API call finishes)
    onMutate: async (request: CreateBindRequest) => {
      console.log('[CREATE_BIND] Starting optimistic update for new bind:', request.title);

      const today = new Date().toISOString().split('T')[0];

      // Cancel outgoing queries to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: goalsQueryKeys.active() });
      await queryClient.cancelQueries({ queryKey: goalsQueryKeys.byId(request.goal_id) });
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.all, exact: false }); // Cancel all bind queries
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.today(today) }); // Explicitly cancel today's binds
      await queryClient.cancelQueries({ queryKey: ['bindsGrid'], exact: false });

      // Snapshot previous data for rollback
      const previousActiveGoals = queryClient.getQueryData(goalsQueryKeys.active());
      const previousGoalById = queryClient.getQueryData(goalsQueryKeys.byId(request.goal_id));
      const previousBinds = queryClient.getQueriesData({ queryKey: bindsQueryKeys.all });
      const previousTodayBinds = queryClient.getQueryData(bindsQueryKeys.today(today));
      const previousBindsGrid = queryClient.getQueriesData({ queryKey: ['bindsGrid'], exact: false });

      // Create temporary bind object (will be replaced with real data from server)
      const tempBind = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: request.title,
        times_per_week: request.times_per_week || 3,
        recurrence_rule: '',
        default_estimated_minutes: 25,
        goal_id: request.goal_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Optimistically add bind to active goals list
      queryClient.setQueryData(goalsQueryKeys.active(), (old: any) => {
        if (!old?.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((goal: any) =>
            goal.id === request.goal_id
              ? {
                  ...goal,
                  binds: [...(goal.binds || []), tempBind],
                }
              : goal
          ),
        };
      });

      // 2. Optimistically add bind to goal detail
      queryClient.setQueryData(goalsQueryKeys.byId(request.goal_id), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            binds: [...(old.data.binds || []), tempBind],
          },
        };
      });

      // 3. Optimistically add bind instance to today's binds (Thread screen)
      // Get goal info for needle context
      const goalData: any = queryClient.getQueryData(goalsQueryKeys.byId(request.goal_id));
      const needleTitle = goalData?.data?.title || 'New Needle';
      const needleColor = goalData?.data?.color || '#6366f1';

      queryClient.setQueryData(bindsQueryKeys.today(today), (old: any) => {
        if (!old?.data) return old;

        // Create temporary bind instance for today
        const tempInstance = {
          id: `temp-instance-${Date.now()}`,
          template_id: tempBind.id,
          title: tempBind.title,
          status: 'active' as const,
          completed: false,
          local_date: today,
          estimated_minutes: 25,
          needle_id: request.goal_id,
          needle_title: needleTitle,
          needle_color: needleColor,
          completion_details: null,
        };

        console.log('[CREATE_BIND] Optimistically adding to today binds. Old:', old.data?.length, 'New:', old.data?.length + 1);

        return {
          ...old,
          data: [...old.data, tempInstance],
          meta: {
            ...old.meta,
            total_binds: (old.meta.total_binds || 0) + 1,
          },
        };
      });

      // 4. Optimistically add bind to binds grid (Dashboard consistency view)
      queryClient.setQueriesData({ queryKey: ['bindsGrid'], exact: false }, (old: any) => {
        if (!old?.data?.needles) return old;
        return {
          ...old,
          data: {
            ...old.data,
            needles: old.data.needles.map((needle: any) =>
              needle.id === request.goal_id
                ? {
                    ...needle,
                    binds: [
                      ...(needle.binds || []),
                      {
                        id: tempBind.id,
                        name: tempBind.title,
                        completions: [false, false, false, false, false, false, false],
                      },
                    ],
                  }
                : needle
            ),
          },
          meta: {
            ...old.meta,
            total_binds: (old.meta.total_binds || 0) + 1,
          },
        };
      });

      console.log('[CREATE_BIND] Optimistic update complete');

      // Return context for rollback
      return { previousActiveGoals, previousGoalById, previousBinds, previousTodayBinds, previousBindsGrid };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      console.error('[CREATE_BIND] Error, rolling back optimistic update:', error);

      const today = new Date().toISOString().split('T')[0];

      if (context?.previousActiveGoals) {
        queryClient.setQueryData(goalsQueryKeys.active(), context.previousActiveGoals);
      }
      if (context?.previousGoalById) {
        queryClient.setQueryData(goalsQueryKeys.byId(variables.goal_id), context.previousGoalById);
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

      console.log('[CREATE_BIND] Rollback complete');
    },
    // Confirm with server
    onSuccess: async (data) => {
      console.log('[CREATE_BIND] Server confirmed, refetching for real data...');

      // Refetch to replace temp bind with real data from server
      await Promise.all([
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() }),
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.byId(data.data.goal_id) }),
        queryClient.refetchQueries({ queryKey: bindsQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false }),
      ]);

      console.log('[CREATE_BIND] Server refetch complete');
    },
  });
}
