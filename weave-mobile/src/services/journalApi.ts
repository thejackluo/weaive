/**
 * Story 4.1a: Journal API Client
 *
 * HTTP client for journal entry operations
 * Communicates with FastAPI backend: /api/journal-entries
 *
 * PERFORMANCE FIX: Uses shared getAuthToken from AuthContext
 * instead of calling supabase.auth.getSession() independently.
 * This avoids network request queueing and timeouts on mobile devices.
 */

import { getApiBaseUrl } from '@/utils/api';

// Auth token getter (set by initJournalApi)
let getAuthTokenFn: (() => Promise<string>) | null = null;

/**
 * Initialize journal API with auth token getter from AuthContext
 * MUST be called before using any API methods
 */
export function initJournalApi(getAuthToken: () => Promise<string>) {
  getAuthTokenFn = getAuthToken;
}

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
 * Get authenticated user's access token from AuthContext
 * Uses cached session to avoid duplicate network calls
 */
async function getAuthToken(): Promise<string> {
  const start = performance.now();
  console.log('[JOURNAL_API] 🔑 Getting auth token...');

  if (!getAuthTokenFn) {
    console.error('[JOURNAL_API] ❌ journalApi not initialized!');
    throw new Error(
      'journalApi not initialized. Call initJournalApi(getAuthToken) in app/_layout.tsx'
    );
  }

  const token = await getAuthTokenFn();
  const duration = (performance.now() - start).toFixed(2);
  console.log(`[JOURNAL_API] ✅ Auth token retrieved in ${duration}ms`);
  return token;
}

/**
 * GET /api/journal-entries/today
 * Fetch today's journal entry for authenticated user
 * Returns null if no entry exists (404)
 */
export async function getTodayJournal(): Promise<JournalEntryResponse | null> {
  const overallStart = performance.now();
  console.log("[JOURNAL_API] 📖 Fetching today's journal...");

  try {
    // Step 1: Get API base URL
    const baseUrl = getApiBaseUrl();
    console.log('[JOURNAL_API] 🌐 API Base URL:', baseUrl);

    // Step 2: Get auth token
    const token = await getAuthToken();

    // Step 3: Make API request with timeout
    const fetchStart = performance.now();
    console.log('[JOURNAL_API] 🚀 Sending GET request to /api/journal-entries/today');

    // Create AbortController for 30-second timeout (increased for dev debugging)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('[JOURNAL_API] ⏱️  Request timeout - aborting after 30s');
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${baseUrl}/api/journal-entries/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const fetchDuration = (performance.now() - fetchStart).toFixed(2);
      console.log(
        `[JOURNAL_API] 📡 Response received in ${fetchDuration}ms - Status: ${response.status}`
      );

      if (response.status === 404) {
        console.log(
          '[JOURNAL_API] ℹ️  No journal entry found for today (404 - this is normal for first entry)'
        );
        const totalDuration = (performance.now() - overallStart).toFixed(2);
        console.log(`[JOURNAL_API] ✅ Total operation time: ${totalDuration}ms`);
        return null;
      }

      if (!response.ok) {
        console.error(`[JOURNAL_API] ❌ API error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch journal: ${response.statusText}`);
      }

      // Step 3: Parse response
      const parseStart = performance.now();
      const result = await response.json();
      const parseDuration = (performance.now() - parseStart).toFixed(2);
      console.log(`[JOURNAL_API] 📄 Response parsed in ${parseDuration}ms`);

      const totalDuration = (performance.now() - overallStart).toFixed(2);
      console.log(`[JOURNAL_API] ✅ Journal loaded successfully in ${totalDuration}ms`);
      console.log('[JOURNAL_API] 📊 Journal data:', {
        id: result.data?.id,
        local_date: result.data?.local_date,
      });

      return result.data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle abort error specially
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[JOURNAL_API] ⏱️  Request aborted after 30s timeout');
        throw new Error('Request timeout - backend not responding (waited 30s)');
      }

      throw fetchError;
    }
  } catch (error) {
    const totalDuration = (performance.now() - overallStart).toFixed(2);
    console.error(`[JOURNAL_API] ❌ getTodayJournal error after ${totalDuration}ms:`, error);

    // Enhanced error diagnostics
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('[JOURNAL_API] 🔴 NETWORK ERROR: Cannot reach backend server');
      console.error(
        '[JOURNAL_API] 💡 Check: 1) Backend is running, 2) API URL is correct, 3) Network connectivity'
      );
    } else if (error instanceof Error && error.message.includes('timeout')) {
      console.error('[JOURNAL_API] ⏱️  TIMEOUT ERROR: Request took too long');
    }

    throw error;
  }
}

/**
 * POST /api/journal-entries
 * Create new journal entry
 * Returns full response with data + meta (includes level/progress for celebration)
 */
export async function createJournalEntry(entry: JournalEntryCreate): Promise<any> {
  try {
    const baseUrl = getApiBaseUrl();
    const token = await getAuthToken();

    // Calculate local_date on client (user's timezone)
    const localDate = new Date().toISOString().split('T')[0];

    const response = await fetch(`${baseUrl}/api/journal-entries`, {
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
      // FastAPI returns errors in "detail" field, not "error.message"
      const errorMessage = errorData?.detail || errorData?.error?.message || response.statusText;
      throw new Error(`Failed to create journal: ${errorMessage}`);
    }

    const result = await response.json();
    // Return full response (data + meta with level info)
    return result;
  } catch (error) {
    console.error('createJournalEntry error:', error);
    throw error;
  }
}

/**
 * PATCH /api/journal-entries/{journal_id}
 * Update existing journal entry (partial update)
 * Returns full response with data + meta (includes level/progress for celebration)
 */
export async function updateJournalEntry(
  journalId: string,
  update: JournalEntryUpdate
): Promise<any> {
  try {
    const baseUrl = getApiBaseUrl();
    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/journal-entries/${journalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      // FastAPI returns errors in "detail" field, not "error.message"
      const errorMessage = errorData?.detail || errorData?.error?.message || response.statusText;
      throw new Error(`Failed to update journal: ${errorMessage}`);
    }

    const result = await response.json();
    // Return full response (data + meta with level info)
    return result;
  } catch (error) {
    console.error('updateJournalEntry error:', error);
    throw error;
  }
}

/**
 * Wrapper function for creating journal entries (used by tests)
 * Maps to createJournalEntry or updateJournalEntry based on whether entry exists
 */
export async function submitJournalEntry(entry: JournalEntryCreate): Promise<JournalEntryResponse> {
  // Check if today's journal exists
  const existingJournal = await getTodayJournal();

  if (existingJournal) {
    // Update existing entry
    return updateJournalEntry(existingJournal.id, entry);
  } else {
    // Create new entry
    return createJournalEntry(entry);
  }
}

/**
 * Get journal entry for a specific date
 * Currently only supports "today" - to be expanded for historical dates
 */
export async function getJournalEntryForDate(_date: string): Promise<JournalEntryResponse | null> {
  // For now, only supports today's date
  // Future: Add backend endpoint for historical dates
  return getTodayJournal();
}

/**
 * Get journal entries within a date range
 * Returns empty array if no entries found
 */
export async function getJournalEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<JournalEntryResponse[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const token = await getAuthToken();

    const response = await fetch(
      `${baseUrl}/api/journal-entries?start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || errorData?.error?.message || response.statusText;
      throw new Error(`Failed to fetch journal entries: ${errorMessage}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('getJournalEntriesByDateRange error:', error);
    throw error;
  }
}

/**
 * Get current authenticated user
 * Note: This is a stub for tests - actual user data comes from AuthContext
 */
export async function getCurrentUser(): Promise<{ id: string; preferred_name?: string }> {
  // This is a test stub - real implementation would get user from AuthContext
  throw new Error('getCurrentUser should not be called in production - use AuthContext instead');
}

export const journalApi = {
  getTodayJournal,
  createJournalEntry,
  updateJournalEntry,
  submitJournalEntry,
  getJournalEntryForDate,
  getJournalEntriesByDateRange,
  getCurrentUser,
};
