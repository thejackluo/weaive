/**
 * Personality API Service (Story 6.2: Dual Personality System + Story 6.1 Integration)
 *
 * Handles API communication for:
 * - Switching between Dream Self and Weave AI personalities
 * - Updating Weave AI preset (gen_z_default, supportive_coach, concise_mentor)
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * Personality types (Story 6.2)
 */
export type PersonalityType = 'dream_self' | 'weave_ai';

/**
 * Weave AI preset types (Story 6.1 + Extended Personalities)
 *
 * Core presets (Story 6.1): gen_z_default, supportive_coach, concise_mentor
 * Extended presets (23 from Claude Code personalities): abg, angry, anime-girl, etc.
 */
export type WeaveAIPreset =
  // Core presets
  | 'gen_z_default'
  | 'supportive_coach'
  | 'concise_mentor'
  // Extended presets - Supportive
  | 'abg'
  | 'anime-girl'
  | 'chinese-infj'
  | 'flirty'
  | 'funny'
  // Extended presets - Professional
  | 'normal'
  | 'professional'
  | 'robot'
  // Extended presets - Humorous
  | 'sarcastic'
  | 'dry-humor'
  | 'grandpa'
  | 'surfer-dude'
  // Extended presets - Edgy
  | 'angry'
  | 'annoying'
  | 'crass'
  | 'moody'
  | 'sassy'
  // Extended presets - Creative
  | 'dramatic'
  | 'poetic'
  | 'rapper'
  | 'zen'
  // Extended presets - Themed
  | 'millennial'
  | 'pirate';

/**
 * Personality details
 */
export interface PersonalityDetails {
  personality_type: PersonalityType;
  name: string;
  traits: string[];
  speaking_style: string;
  preset?: WeaveAIPreset; // Only present if personality_type === 'weave_ai'
  max_words?: number; // Only present if personality_type === 'weave_ai'
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
 * Update user's Weave AI preset (Story 6.1 + 6.2 Integration)
 *
 * Updates the weave_ai_preset column in user_profiles.
 * Only effective when active_personality = 'weave_ai'.
 *
 * @param accessToken - JWT access token for authentication
 * @param preset - Weave AI preset to switch to
 * @returns Promise with updated personality details
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await updateWeaveAIPreset(accessToken, 'supportive_coach');
 * // Returns updated personality details with new preset
 * ```
 */
export async function updateWeaveAIPreset(
  accessToken: string,
  preset: WeaveAIPreset
): Promise<SwitchPersonalityResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/user/personality/preset`;

  const requestBody = {
    weave_ai_preset: preset,
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
        `Failed to update Weave AI preset: ${response.status} ${response.statusText}`
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
export async function getCurrentPersonality(accessToken: string): Promise<PersonalityDetails> {
  // TODO: Implement if backend adds GET /api/user/personality endpoint
  // For now, personality is returned after switching
  throw new Error('getCurrentPersonality not yet implemented');
}
