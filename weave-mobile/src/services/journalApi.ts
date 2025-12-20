/**
 * Story 4.1a: Journal API Client
 *
 * HTTP client for journal entry operations
 * Communicates with FastAPI backend: /api/journal-entries
 */

import { supabase } from '@lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface JournalEntryCreate {
  fulfillment_score: number;
  default_responses?: {
    today_reflection?: string;
    tomorrow_focus?: string;
  };
  custom_responses?: Record<string, any>;
}

export interface JournalEntryUpdate {
  fulfillment_score?: number;
  default_responses?: {
    today_reflection?: string;
    tomorrow_focus?: string;
  };
  custom_responses?: Record<string, any>;
}

export interface JournalEntryResponse {
  id: string;
  user_id: string;
  local_date: string;
  fulfillment_score: number;
  default_responses?: {
    today_reflection?: string;
    tomorrow_focus?: string;
  };
  custom_responses?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Get authenticated user's access token
 */
async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return session.access_token;
}

/**
 * GET /api/journal-entries/today
 * Fetch today's journal entry for authenticated user
 * Returns null if no entry exists (404)
 */
export async function getTodayJournal(): Promise<JournalEntryResponse | null> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/journal-entries/today`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch journal: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('getTodayJournal error:', error);
    throw error;
  }
}

/**
 * POST /api/journal-entries
 * Create new journal entry
 */
export async function createJournalEntry(
  entry: JournalEntryCreate
): Promise<JournalEntryResponse> {
  try {
    const token = await getAuthToken();

    // Calculate local_date on client (user's timezone)
    const localDate = new Date().toISOString().split('T')[0];

    const response = await fetch(`${API_BASE_URL}/api/journal-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...entry,
        local_date: localDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `Failed to create journal: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('createJournalEntry error:', error);
    throw error;
  }
}

/**
 * PATCH /api/journal-entries/{journal_id}
 * Update existing journal entry (partial update)
 */
export async function updateJournalEntry(
  journalId: string,
  update: JournalEntryUpdate
): Promise<JournalEntryResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/journal-entries/${journalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `Failed to update journal: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('updateJournalEntry error:', error);
    throw error;
  }
}

export const journalApi = {
  getTodayJournal,
  createJournalEntry,
  updateJournalEntry,
};
