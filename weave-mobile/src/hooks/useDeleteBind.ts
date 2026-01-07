/**
 * useDeleteBind Hook
 * TanStack Query mutation for deleting a bind (subtask template)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { deleteBind as deleteBindService } from '@/services/binds';
import type { BindResponse } from '@/types/binds';
import { goalsQueryKeys } from './useActiveGoals';
import { bindsQueryKeys } from './useTodayBinds';
import { consistencyQueryKeys } from './useConsistencyData';

interface DeleteBindRequest {
  bindId: string;
  goalId: string; // For cache invalidation
}

export function useDeleteBind() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteBindRequest): Promise<BindResponse> => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      return deleteBindService(request.bindId, session.access_token);
    },
    // Optimistic update: Remove bind IMMEDIATELY (before API call finishes)
    onMutate: async (request: DeleteBindRequest) => {
      console.log('[DELETE_BIND] Starting optimistic update for bind:', request.bindId);

      const today = new Date().toISOString().split('T')[0];

      // Cancel outgoing queries to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: goalsQueryKeys.active() });
      await queryClient.cancelQueries({ queryKey: goalsQueryKeys.byId(request.goalId) });
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.all, exact: false }); // Cancel all bind queries including today's
      await queryClient.cancelQueries({ queryKey: bindsQueryKeys.today(today) }); // Explicitly cancel today's binds
      await queryClient.cancelQueries({ queryKey: ['bindsGrid'], exact: false });

      // Snapshot previous data for rollback
      const previousActiveGoals = queryClient.getQueryData(goalsQueryKeys.active());
      const previousGoalById = queryClient.getQueryData(goalsQueryKeys.byId(request.goalId));
      const previousBinds = queryClient.getQueriesData({ queryKey: bindsQueryKeys.all });
      const previousTodayBinds = queryClient.getQueryData(bindsQueryKeys.today(today));
      const previousBindsGrid = queryClient.getQueriesData({ queryKey: ['bindsGrid'], exact: false });

      // 1. Optimistically remove bind from active goals list
      queryClient.setQueryData(goalsQueryKeys.active(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((goal: any) =>
            goal.id === request.goalId
              ? {
                  ...goal,
                  binds: goal.binds?.filter((bind: any) => bind.id !== request.bindId) || [],
                }
              : goal
          ),
        };
      });

      // 2. Optimistically remove bind from goal detail
      queryClient.setQueryData(goalsQueryKeys.byId(request.goalId), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            binds: old.data.binds?.filter((bind: any) => bind.id !== request.bindId) || [],
          },
        };
      });

      // 3. Optimistically remove bind from today's binds (Thread screen)
      queryClient.setQueryData(bindsQueryKeys.today(today), (old: any) => {
        if (!old?.data) return old;
        console.log('[DELETE_BIND] Optimistically removing from today binds. Old data:', old.data?.length, 'binds');
        const newData = old.data.filter((bind: any) => bind.template_id !== request.bindId);
        console.log('[DELETE_BIND] After filter:', newData.length, 'binds');
        return {
          ...old,
          data: newData,
          meta: {
            ...old.meta,
            total_binds: newData.length,
            completed_count: newData.filter((b: any) => b.completed).length,
          },
        };
      });

      // 4. Optimistically remove bind from binds grid (Dashboard consistency view)
      queryClient.setQueriesData({ queryKey: ['bindsGrid'], exact: false }, (old: any) => {
        if (!old?.data?.needles) return old;
        return {
          ...old,
          data: {
            ...old.data,
            needles: old.data.needles.map((needle: any) =>
              needle.id === request.goalId
                ? {
                    ...needle,
                    binds: needle.binds?.filter((bind: any) => bind.id !== request.bindId) || [],
                  }
                : needle
            ),
          },
          meta: {
            ...old.meta,
            total_binds: (old.meta.total_binds || 0) - 1,
          },
        };
      });

      console.log('[DELETE_BIND] Optimistic update complete');

      // Return context for rollback
      return { previousActiveGoals, previousGoalById, previousBinds, previousTodayBinds, previousBindsGrid };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      console.error('[DELETE_BIND] Error, rolling back optimistic update:', error);

      const today = new Date().toISOString().split('T')[0];

      if (context?.previousActiveGoals) {
        queryClient.setQueryData(goalsQueryKeys.active(), context.previousActiveGoals);
      }
      if (context?.previousGoalById) {
        queryClient.setQueryData(goalsQueryKeys.byId(variables.goalId), context.previousGoalById);
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

      console.log('[DELETE_BIND] Rollback complete');
    },
    // Confirm with server
    onSuccess: async (data, variables) => {
      console.log('[DELETE_BIND] Server confirmed, refetching for consistency...');

      // Invalidate other queries to mark as stale
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: bindsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bindsGrid'] });

      // Refetch to confirm server state (background, won't block UI)
      await Promise.all([
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() }),
        queryClient.refetchQueries({ queryKey: goalsQueryKeys.byId(variables.goalId) }),
        queryClient.refetchQueries({ queryKey: bindsQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false }),
      ]);

      // CRITICAL: Wait 300ms for database transaction to propagate before resetting consistency
      // This prevents race condition where consistency recalculates before deletion commits
      await new Promise(resolve => setTimeout(resolve, 300));

      // Now reset consistency queries (clears cache AND triggers refetch with updated data)
      await queryClient.resetQueries({ queryKey: ['consistency'] });

      console.log('[DELETE_BIND] Server refetch complete with delayed consistency update');
    },
  });
}
