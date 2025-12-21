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
 * Uses Supabase client directly (no AuthContext needed)
 */
export function useUserPreferences() {
  console.log('[PREFERENCES_HOOK] 🎣 useUserPreferences initialized');

  return useQuery({
    queryKey: preferencesKeys.customQuestions(),
    queryFn: async (): Promise<CustomQuestion[]> => {
      const overallStart = performance.now();
      console.log('[PREFERENCES_HOOK] 🔄 Query function executing...');

      // Step 1: Get current user from Supabase client
      const authStart = performance.now();
      console.log('[PREFERENCES_HOOK] 🔑 Calling supabase.auth.getUser()...');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const authDuration = (performance.now() - authStart).toFixed(2);
      console.log(`[PREFERENCES_HOOK] ✅ Auth user retrieved in ${authDuration}ms`);

      if (!user) {
        console.error('[PREFERENCES_HOOK] ❌ Not authenticated!');
        throw new Error('Not authenticated');
      }

      console.log('[PREFERENCES_HOOK] 👤 User ID:', user.id);

      // Step 2: Fetch user profile with preferences
      const queryStart = performance.now();
      console.log('[PREFERENCES_HOOK] 🗄️  Querying user_profiles...');

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('auth_user_id', user.id)
        .single();

      const queryDuration = (performance.now() - queryStart).toFixed(2);

      if (error) {
        console.error(
          `[PREFERENCES_HOOK] ❌ Supabase query failed after ${queryDuration}ms:`,
          error
        );
        throw error;
      }

      console.log(`[PREFERENCES_HOOK] ✅ Profile fetched in ${queryDuration}ms`);

      // Step 3: Extract custom_reflection_questions from preferences JSONB
      const preferences = profile?.preferences as UserPreferences | null;
      const questions = preferences?.custom_reflection_questions || [];

      const totalDuration = (performance.now() - overallStart).toFixed(2);
      console.log(
        `[PREFERENCES_HOOK] ✅ Total operation: ${totalDuration}ms - Questions found: ${questions.length}`
      );

      return questions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Update custom reflection questions in user preferences
 * Uses Supabase client directly (no AuthContext needed)
 */
export function useUpdateCustomQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: CustomQuestion[]) => {
      // Get current user from Supabase client (uses cached session)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
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
        .eq('auth_user_id', user.id)
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
