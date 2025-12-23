/**
 * useGoalMemories Hook
 *
 * TanStack Query hooks for fetching and managing goal memories (photos)
 *
 * Usage:
 * ```tsx
 * import { useGoalMemories, useUploadMemory } from '@/hooks/useGoalMemories';
 *
 * function MemoriesSection({ goalId }) {
 *   const { data, isLoading } = useGoalMemories(goalId);
 *   const uploadMutation = useUploadMemory();
 *
 *   const handleUpload = async (imageUri: string) => {
 *     uploadMutation.mutate({
 *       goalId,
 *       imageUri,
 *       fileName: `memory-${Date.now()}.jpg`
 *     });
 *   };
 *
 *   return (
 *     <View>
 *       {data?.data.map(memory => <Image key={memory.id} source={{uri: memory.image_url}} />)}
 *     </View>
 *   );
 * }
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { uploadMemory, fetchGoalMemories, deleteMemory } from '@/services/memories';
import type { MemoriesResponse, UploadMemoryRequest } from '@/services/memories';
import { goalsQueryKeys } from '@/hooks/useActiveGoals';

/**
 * Query key factory for memories
 */
export const memoriesQueryKeys = {
  all: ['memories'] as const,
  byGoal: (goalId: string) => [...memoriesQueryKeys.all, 'goal', goalId] as const,
};

/**
 * Hook to fetch memories for a specific goal
 *
 * @param goalId - Goal ID to fetch memories for
 * @returns TanStack Query result with memories data
 *
 * - data: MemoriesResponse with {data: Memory[], meta: {total, timestamp}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch memories
 */
export function useGoalMemories(goalId: string) {
  const { session } = useAuth();

  return useQuery<MemoriesResponse, Error>({
    queryKey: memoriesQueryKeys.byGoal(goalId),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchGoalMemories(goalId, session.access_token);
    },
    enabled: !!session?.access_token && !!goalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false,
  });
}

/**
 * Hook to upload a new memory (image) for a goal
 *
 * @returns TanStack Query mutation for uploading memories
 *
 * Usage:
 * ```tsx
 * const uploadMutation = useUploadMemory();
 *
 * uploadMutation.mutate({
 *   goalId: 'goal-123',
 *   imageUri: 'file:///path/to/image.jpg',
 *   fileName: 'memory-12345.jpg'
 * }, {
 *   onSuccess: (data) => console.log('Uploaded memory:', data),
 *   onError: (error) => console.error('Upload failed:', error)
 * });
 * ```
 */
export function useUploadMemory() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadMemoryRequest) => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return uploadMemory(params, session.access_token);
    },
    onSuccess: (data, variables) => {
      // Invalidate memories query for this goal to refetch the list
      queryClient.invalidateQueries({
        queryKey: memoriesQueryKeys.byGoal(variables.goalId),
      });

      // Also invalidate the goal detail query since it includes memories count
      queryClient.invalidateQueries({
        queryKey: goalsQueryKeys.byId(variables.goalId),
      });
    },
  });
}

/**
 * Hook to delete a memory
 *
 * @returns TanStack Query mutation for deleting memories
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteMemory();
 *
 * deleteMutation.mutate({
 *   goalId: 'goal-123',
 *   memoryId: 'memory-456'
 * }, {
 *   onSuccess: () => console.log('Memory deleted'),
 *   onError: (error) => console.error('Delete failed:', error)
 * });
 * ```
 */
export function useDeleteMemory() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, memoryId }: { goalId: string; memoryId: string }) => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return deleteMemory(goalId, memoryId, session.access_token);
    },
    onSuccess: (data, variables) => {
      // Invalidate memories query for this goal to refetch the list
      queryClient.invalidateQueries({
        queryKey: memoriesQueryKeys.byGoal(variables.goalId),
      });

      // Also invalidate the goal detail query
      queryClient.invalidateQueries({
        queryKey: goalsQueryKeys.byId(variables.goalId),
      });
    },
  });
}
