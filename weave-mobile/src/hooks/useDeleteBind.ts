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
    onSuccess: async (data, variables) => {
      // Refetch goal queries to immediately update binds
      await queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.byId(variables.goalId) });

      // Refetch binds queries to refresh Thread view immediately
      await queryClient.refetchQueries({ queryKey: bindsQueryKeys.all });

      // Refetch consistency queries to refresh dashboard metrics immediately
      await queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all });

      // Refetch binds grid (7d consistency view)
      await queryClient.refetchQueries({ queryKey: ['bindsGrid'] });

      console.log('[DELETE_BIND] Refetched goal, bind, consistency, and grid queries');
    },
  });
}
