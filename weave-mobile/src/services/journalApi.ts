/**
 * Journal API Service (Story 4.1)
 *
 * This file is a STUB for ATDD tests. Implementation pending.
 *
 * The tests in ReflectionFlow.integration.test.tsx mock these functions.
 */

export interface JournalEntryCreate {
  local_date: string;
  fulfillment_score: number;
  default_responses: {
    today_reflection: string;
    tomorrow_focus: string;
  };
  custom_responses: Record<string, { question_text: string; response: string | number }>;
}

export interface JournalEntryResponse {
  data: {
    id: string;
    user_id: string;
    local_date: string;
    fulfillment_score: number;
    default_responses: {
      today_reflection: string;
      tomorrow_focus: string;
    };
    custom_responses: Record<string, { question_text: string; response: string | number }>;
    created_at: string;
  };
  meta: {
    timestamp: string;
  };
}

/**
 * Submit a journal entry for today's reflection
 *
 * @param entry - Journal entry data
 * @returns Promise with journal entry response
 *
 * TODO: Implement actual API call to POST /api/journal-entries
 */
export async function submitJournalEntry(
  entry: JournalEntryCreate
): Promise<JournalEntryResponse> {
  throw new Error('submitJournalEntry not implemented - pending Story 4.1 development');
}

/**
 * Get current user profile (for personalized greeting)
 *
 * @returns Promise with user data
 *
 * TODO: Implement actual API call or use existing auth context
 */
export async function getCurrentUser(): Promise<any> {
  throw new Error('getCurrentUser not implemented - pending Story 4.1 development');
}
