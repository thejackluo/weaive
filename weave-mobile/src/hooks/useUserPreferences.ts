/**
 * Story 4.1b: User Preferences Hook
 *
 * TanStack Query hook for managing user_profiles.preferences
 * Specifically for custom_reflection_questions storage
 *
 * AC #13: Custom question definitions storage
 * AC #14: Settings integration
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { CustomQuestion } from '@/components/features/journal/CustomQuestionInput';

export interface UserPreferences {
  custom_reflection_questions?: CustomQuestion[];
}

// Query keys
export const preferencesKeys = {
  all: ['user-preferences'] as const,
  customQuestions: () => [...preferencesKeys.all, 'custom-questions'] as const,
};

/**
 * Fetch user preferences (custom reflection questions)
 */
export function useUserPreferences() {
  return useQuery({
    queryKey: preferencesKeys.customQuestions(),
    queryFn: async (): Promise<CustomQuestion[]> => {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      // Fetch user profile with preferences
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.error('Failed to fetch user preferences:', error);
        throw error;
      }

      // Extract custom_reflection_questions from preferences JSONB
      const preferences = profile?.preferences as UserPreferences | null;
      return preferences?.custom_reflection_questions || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Update custom reflection questions in user preferences
 */
export function useUpdateCustomQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: CustomQuestion[]) => {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      // Update user_profiles.preferences
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          preferences: {
            custom_reflection_questions: questions,
          },
        })
        .eq('auth_user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update custom questions:', error);
        throw error;
      }

      return data;
    },

    // Optimistic update
    onMutate: async (newQuestions: CustomQuestion[]) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: preferencesKeys.customQuestions() });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData(preferencesKeys.customQuestions());

      // Optimistically update
      queryClient.setQueryData(preferencesKeys.customQuestions(), newQuestions);

      return { previousQuestions };
    },

    // Rollback on error
    onError: (err, newQuestions, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(preferencesKeys.customQuestions(), context.previousQuestions);
      }
      console.error('Failed to update custom questions:', err);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.all });
    },
  });
}
