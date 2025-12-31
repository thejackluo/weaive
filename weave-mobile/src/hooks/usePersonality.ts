/**
 * usePersonality Hook (Story 6.2: Dual Personality System)
 *
 * Manages AI personality state and switching logic
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  switchPersonality as apiSwitchPersonality,
  PersonalityType,
  PersonalityDetails,
} from '@/services/personalityApi';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

/**
 * Hook state
 */
interface UsePersonalityState {
  /** Current active personality details */
  personality: PersonalityDetails | null;
  /** Whether switch operation is in progress */
  isSwitching: boolean;
  /** Error message if switch failed */
  error: string | null;
}

/**
 * Hook return value
 */
interface UsePersonalityReturn extends UsePersonalityState {
  /** Switch to a different personality */
  switchTo: (newPersonality: PersonalityType) => Promise<void>;
  /** Clear error message */
  clearError: () => void;
}

/**
 * Default Weave AI personality (fallback)
 */
const DEFAULT_WEAVE_PERSONALITY: PersonalityDetails = {
  personality_type: 'weave_ai',
  name: 'Weave',
  traits: ['encouraging', 'supportive', 'motivating', 'general'],
  speaking_style: 'Friendly and empowering, uses positive reinforcement',
};

/**
 * Custom hook for managing AI personality
 *
 * @returns Personality state and actions
 *
 * @example
 * ```tsx
 * const { personality, isSwitching, error, switchTo, clearError } = usePersonality();
 *
 * // Display current personality
 * <Text>{personality?.name}</Text>
 *
 * // Switch personality
 * await switchTo('dream_self');
 * ```
 */
export function usePersonality(): UsePersonalityReturn {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [personality, setPersonality] = useState<PersonalityDetails | null>(
    DEFAULT_WEAVE_PERSONALITY
  );
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Fetch personality from backend on mount
  const { data: personalityData, isLoading } = useQuery({
    queryKey: ['personality'],
    queryFn: async () => {
      if (!session?.access_token) return null;
      try {
        const response = await apiClient.get('/api/personality');
        return response.data.data as PersonalityDetails;
      } catch (err) {
        if (__DEV__) console.error('[PERSONALITY] Failed to fetch:', err);
        return DEFAULT_WEAVE_PERSONALITY;
      }
    },
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // ✅ FIX: Update local state when query data changes
  useEffect(() => {
    if (personalityData) {
      setPersonality(personalityData);
      if (__DEV__)
        console.log(
          '[PERSONALITY] Loaded:',
          personalityData.personality_type,
          personalityData.name
        );
    }
  }, [personalityData]);

  /**
   * Switch to a different personality
   */
  const switchTo = useCallback(
    async (newPersonality: PersonalityType) => {
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      // Don't switch if already using this personality
      if (personality?.personality_type === newPersonality) {
        return;
      }

      setIsSwitching(true);
      setError(null);

      try {
        const response = await apiSwitchPersonality(session.access_token, newPersonality);

        setPersonality(response.data.personality_details);

        // ✅ FIX: Invalidate query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['personality'] });
        if (__DEV__) console.log('[PERSONALITY] Switched to:', newPersonality);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to switch personality';
        setError(errorMessage);
        console.error('Personality switch failed:', err);
      } finally {
        setIsSwitching(false);
      }
    },
    [session, personality, queryClient]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    personality,
    isSwitching: isSwitching || isLoading,
    error,
    switchTo,
    clearError,
  };
}
