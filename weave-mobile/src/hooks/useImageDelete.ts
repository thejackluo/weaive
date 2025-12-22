/**
 * useImageDelete - TanStack Query hook for deleting images with optimistic updates
 * Story: 0.9 - AI-Powered Image Service
 * Architecture: Story 1.5.1 (useMutation with cache invalidation)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImage } from '../services/imageCapture';
import type { ImagePage } from './useImageList';
import type { Capture } from '../types/captures';

interface DeleteContext {
  previousImages?: Array<[readonly unknown[], ImagePage[] | undefined]>;
}

/**
 * Hook: Delete image with optimistic updates and cache invalidation
 *
 * Features:
 * - Optimistic updates: Immediately remove from UI
 * - Rollback on error: Restore image if delete fails
 * - Cache invalidation: Refresh all image queries on success
 * - Usage tracking: Invalidate usage queries (free up quota)
 *
 * Usage:
 * ```tsx
 * const deleteImg = useImageDelete();
 *
 * // With confirmation dialog:
 * Alert.alert('Delete Image?', 'This cannot be undone.', [
 *   { text: 'Cancel', style: 'cancel' },
 *   {
 *     text: 'Delete',
 *     onPress: () => deleteImg.mutate(imageId),
 *   },
 * ]);
 * ```
 */
export function useImageDelete() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: async (imageId: string) => {
      await deleteImage(imageId);
    },

    // Optimistic update: Remove image from cache immediately
    onMutate: async (imageId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['images'] });

      // Snapshot previous values for rollback
      const previousImages = queryClient.getQueriesData<ImagePage[]>({
        queryKey: ['images'],
      });

      // Optimistically remove image from all cached queries
      queryClient.setQueriesData<{ pages: ImagePage[] }>({ queryKey: ['images'] }, (old) => {
        if (!old) return old;
        // For infinite queries, filter out the deleted image from all pages
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((img: Capture) => img.id !== imageId),
          })),
        };
      });

      // Return context for rollback
      return { previousImages };
    },

    // On error: Rollback optimistic update
    onError: (error, _imageId, context) => {
      console.error('Delete failed:', error);

      // Restore previous cache state
      if (context?.previousImages) {
        context.previousImages.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // On success: Invalidate all image-related queries
    onSuccess: () => {
      console.log('✅ Image deleted successfully');

      // Invalidate to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['upload-usage'] }); // Usage decreased
    },

    // Always refetch after mutation (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}

/**
 * Hook: Batch delete images
 *
 * Usage:
 * ```tsx
 * const batchDelete = useBatchImageDelete();
 * await batchDelete.mutateAsync(['id1', 'id2', 'id3']);
 * ```
 */
export function useBatchImageDelete() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (imageIds: string[]) => {
      // Delete images in parallel
      await Promise.all(imageIds.map((id) => deleteImage(id)));
    },

    onSuccess: () => {
      console.log('✅ Batch delete successful');
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['upload-usage'] });
    },

    onError: (error) => {
      console.error('Batch delete failed:', error);
    },
  });
}
