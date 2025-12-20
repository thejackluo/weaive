/**
 * Onboarding service for storing onboarding flow data (Stories 1.2, 1.3, 1.6)
 *
 * This service provides interfaces for storing onboarding selections
 * to the backend API during the onboarding flow.
 */

import { supabase } from '@lib/supabase';

// API endpoint (use environment variable in production)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Valid painpoint IDs from Story 1.2
 */
export type PainpointId = 'clarity' | 'action' | 'consistency' | 'alignment';

/**
 * Valid personality types from Story 1.6
 */
export type PersonalityType = 'supportive_direct' | 'tough_warm';

/**
 * Valid identity traits from Story 1.6
 */
export type IdentityTrait =
  | 'Clear Direction'
  | 'Intentional Time'
  | 'Decisive Action'
  | 'Consistent Effort'
  | 'High Standards'
  | 'Continuous Growth'
  | 'Self Aware'
  | 'Emotionally Grounded';

/**
 * Store selected painpoints (Story 1.2)
 *
 * @param painpoints - Array of 1-2 painpoint IDs
 * @param userId - Optional user ID (for authenticated users)
 * @param sessionId - Optional session identifier
 *
 * @returns Promise with success status and confirmed painpoints
 *
 * @example
 * ```ts
 * // Pre-auth selection
 * await storePainpointSelection(['clarity', 'action'], null, 'session-123');
 *
 * // Authenticated selection
 * await storePainpointSelection(['consistency'], userId, 'session-123');
 * ```
 */
export async function storePainpointSelection(
  painpoints: PainpointId[],
  userId?: string | null,
  sessionId?: string | null
): Promise<{
  success: boolean;
  painpoints: string[];
  user_id: string | null;
}> {
  try {
    const payload = {
      painpoints,
      user_id: userId || null,
      session_id: sessionId || null,
    };

    const response = await fetch(`${API_BASE_URL}/api/onboarding/painpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Onboarding] Painpoints stored: ${painpoints.join(', ')}`);
    return data;
  } catch (error) {
    console.error('[Onboarding] Failed to store painpoints:', error);
    throw error;
  }
}

/**
 * Store identity bootup data (Story 1.6)
 *
 * Submits the user's preferred name, selected personality type, and identity traits
 * to the backend API. Requires authentication.
 *
 * @param preferredName - User's chosen name/nickname (1-50 chars)
 * @param corePersonality - Selected Weave personality type
 * @param identityTraits - Array of 3-5 selected identity traits
 *
 * @returns Promise with success status and confirmed data
 *
 * @throws Error if user is not authenticated or API request fails
 *
 * @example
 * ```ts
 * await storeIdentityBootup(
 *   'Alex',
 *   'supportive_direct',
 *   ['Disciplined', 'Focused', 'Resilient']
 * );
 * ```
 */
export async function storeIdentityBootup(
  preferredName: string,
  corePersonality: PersonalityType,
  identityTraits: IdentityTrait[]
): Promise<{
  success: boolean;
  user_id: string;
  preferred_name: string;
  core_personality: string;
  identity_traits: string[];
  personality_selected_at: string;
}> {
  try {
    // Get current session and JWT token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('User is not authenticated. Please log in first.');
    }

    const accessToken = session.access_token;

    // Prepare payload
    const payload = {
      preferred_name: preferredName,
      core_personality: corePersonality,
      identity_traits: identityTraits,
    };

    // Make authenticated API request
    const response = await fetch(`${API_BASE_URL}/api/onboarding/identity-bootup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Include JWT token
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ API Error Response:', JSON.stringify(error, null, 2));
      console.log('❌ Response Status:', response.status);

      // Handle error.detail that might be an object or string
      const errorMessage = typeof error.detail === 'string'
        ? error.detail
        : JSON.stringify(error.detail) || `API error: ${response.status}`;

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(
      `[Onboarding] Identity bootup stored: name="${preferredName}", personality="${corePersonality}", traits=[${identityTraits.join(', ')}]`
    );
    return data;
  } catch (error) {
    console.error('[Onboarding] Failed to store identity bootup data:', error);
    throw error;
  }
}
