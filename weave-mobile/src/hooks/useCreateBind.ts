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
    onSuccess: async (data) => {
      // Refetch goal queries to immediately update binds
      await queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.byId(data.data.goal_id) });

      // Refetch binds queries to refresh Thread view immediately
      await queryClient.refetchQueries({ queryKey: bindsQueryKeys.all });

      // Refetch consistency queries to refresh dashboard metrics immediately
      await queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all });

      // Refetch binds grid (7d consistency view) - use exact: false for partial matching
      await queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false });

      console.log('[CREATE_BIND] Refetched goal, bind, consistency, and grid queries');
    },
  });
}
