/**
 * Onboarding service for storing onboarding flow data (Stories 1.2, 1.3)
 *
 * This service provides interfaces for storing onboarding selections
 * to the backend API during the onboarding flow.
 */

import { getApiBaseUrl } from '@/utils/api';

// API endpoint (loaded from .env via app.config.js)
const API_BASE_URL = getApiBaseUrl();

/**
 * Valid painpoint IDs from Story 1.2
 */
export type PainpointId = 'clarity' | 'action' | 'consistency' | 'alignment';

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
