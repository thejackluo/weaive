/**
 * Personality API Service (Story 6.2: Dual Personality System)
 *
 * Handles API communication for switching between Dream Self and Weave AI personalities
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * Personality types
 */
export type PersonalityType = 'dream_self' | 'weave_ai';

/**
 * Personality details
 */
export interface PersonalityDetails {
  personality_type: PersonalityType;
  name: string;
  traits: string[];
  speaking_style: string;
}

/**
 * Switch personality request
 */
export interface SwitchPersonalityRequest {
  active_personality: PersonalityType;
}

/**
 * Switch personality response
 */
export interface SwitchPersonalityResponse {
  data: {
    active_personality: PersonalityType;
    personality_details: PersonalityDetails;
  };
  meta: {
    timestamp: string;
  };
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Switch user's active AI personality
 *
 * @param accessToken - JWT access token for authentication
 * @param personality - Personality type to switch to ('dream_self' or 'weave_ai')
 * @returns Promise with personality details
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await switchPersonality(accessToken, 'dream_self');
 * // Returns: {
 * //   data: {
 * //     active_personality: 'dream_self',
 * //     personality_details: {
 * //       personality_type: 'dream_self',
 * //       name: 'Alex the Disciplined',
 * //       traits: ['analytical', 'supportive'],
 * //       speaking_style: 'Direct but encouraging'
 * //     }
 * //   },
 * //   meta: { timestamp: '2025-12-23T10:00:00Z' }
 * // }
 * ```
 */
export async function switchPersonality(
  accessToken: string,
  personality: PersonalityType
): Promise<SwitchPersonalityResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/user/personality`;

  const requestBody: SwitchPersonalityRequest = {
    active_personality: personality,
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Parse error response
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message ||
        `Failed to switch personality: ${response.status} ${response.statusText}`
    );
  }

  const data: SwitchPersonalityResponse = await response.json();
  return data;
}

/**
 * Get current active personality (fetched from user profile endpoint)
 *
 * Note: The active personality is typically fetched as part of the user profile.
 * This function is a placeholder for future implementation if needed.
 *
 * For now, personality state is managed locally after switching.
 */
export async function getCurrentPersonality(
  accessToken: string
): Promise<PersonalityDetails> {
  // TODO: Implement if backend adds GET /api/user/personality endpoint
  // For now, personality is returned after switching
  throw new Error('getCurrentPersonality not yet implemented');
}
