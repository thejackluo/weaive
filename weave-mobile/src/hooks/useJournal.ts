/**
 * Story 4.1a: Journal Entry Hooks
 *
 * TanStack Query hooks for journal operations:
 * - useGetTodayJournal: Fetch today's journal entry (if exists)
 * - useSubmitJournal: Create new journal entry
 * - useUpdateJournal: Update existing journal entry
 *
 * Implements offline-first strategy with optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalApi, JournalEntryCreate, JournalEntryUpdate } from '@/services/journalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fulfillmentQueryKeys } from './useFulfillmentData';
import { userStatsQueryKeys } from './useUserStats';
import { historyQueryKeys } from './useHistory';
import { consistencyQueryKeys } from './useConsistencyData';

const OFFLINE_QUEUE_KEY = '@weave_journal_offline_queue';

// Query keys
export const journalKeys = {
  all: ['journal-entries'] as const,
  today: () => [...journalKeys.all, 'today'] as const,
  byDate: (date: string) => [...journalKeys.all, date] as const,
};

/**
 * Fetch today's journal entry
 * Returns null if no entry exists for today
 */
export function useGetTodayJournal() {
  console.log('[JOURNAL_HOOK] 🎣 useGetTodayJournal initialized');

  return useQuery({
    queryKey: journalKeys.today(),
    queryFn: async () => {
      console.log('[JOURNAL_HOOK] 🔄 Query function executing...');
      const start = performance.now();

      try {
        const result = await journalApi.getTodayJournal();
        const duration = (performance.now() - start).toFixed(2);
        console.log(
          `[JOURNAL_HOOK] ✅ Query completed in ${duration}ms - Result:`,
          result ? 'Journal found' : 'No journal (null)'
        );
        return result;
      } catch (error) {
        const duration = (performance.now() - start).toFixed(2);
        console.error(`[JOURNAL_HOOK] ❌ Query failed after ${duration}ms:`, error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0, // Always consider data stale (force refetch)
    gcTime: 0, // Don't cache data after component unmounts
    // Return null instead of throwing on 404
    throwOnError: (error: any) => {
      const shouldThrow = error?.response?.status !== 404;
      console.log(
        `[JOURNAL_HOOK] 🤔 throwOnError: ${shouldThrow} (status: ${error?.response?.status})`
      );
      return shouldThrow;
    },
  });
}

/**
 * Fetch journal entries within a date range
 * Returns empty array if no entries found
 */
export function useGetJournalsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...journalKeys.all, 'range', startDate, endDate],
    queryFn: () => journalApi.getJournalEntriesByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate, // Only run query when we have valid dates
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Submit new journal entry (CREATE mode)
 * Implements offline queueing and optimistic updates
 */
export function useSubmitJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.createJournalEntry,

    // Optimistic update
    onMutate: async (newJournal: JournalEntryCreate) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: journalKeys.today() });

      // Snapshot previous value
      const previousJournal = queryClient.getQueryData(journalKeys.today());

      // Optimistically update
      queryClient.setQueryData(journalKeys.today(), {
        id: 'temp-id',
        local_date: new Date().toISOString().split('T')[0],
        fulfillment_score: newJournal.fulfillment_score,
        default_responses: newJournal.default_responses,
        custom_responses: newJournal.custom_responses,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return { previousJournal };
    },

    // Rollback on error
    onError: (err, newJournal, context) => {
      console.error('[JOURNAL_HOOK] ❌ Submit mutation failed:', err);

      // Handle 409 Conflict: Entry already exists, fetch it instead
      if (err.message.includes('409') || err.message.includes('already exists')) {
        console.log(
          '[JOURNAL_HOOK] 🔄 409 Conflict - entry exists, invalidating cache to fetch real data'
        );
        // Clear the temp-id cache and refetch
        queryClient.removeQueries({ queryKey: journalKeys.today() });
        queryClient.invalidateQueries({ queryKey: journalKeys.today() });
        return; // Don't rollback, just refetch
      }

      // For other errors, rollback optimistic update
      if (context?.previousJournal) {
        queryClient.setQueryData(journalKeys.today(), context.previousJournal);
      }

      // Queue for offline sync if network error
      if (err.message.includes('Network') || err.message.includes('offline')) {
        queueOfflineSubmission(newJournal);
      }
    },

    // Refetch on success
    onSuccess: (response) => {
      // CRITICAL: Replace the temp-id optimistic cache with real server response
      // This fixes the bug where the screen tries to PATCH /api/journal-entries/temp-id
      // Extract data from response (API now returns { data, meta })
      queryClient.setQueryData(journalKeys.today(), response.data);

      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: ['daily-aggregates'] });

      // Invalidate dashboard stats (auto-refresh Dashboard after journal submission)
      queryClient.invalidateQueries({ queryKey: fulfillmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: consistencyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userStatsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });

      // Track analytics event
      // TODO: Add analytics tracking
    },

    // Offline support
    networkMode: 'offlineFirst',
  });
}

/**
 * Update existing journal entry (EDIT mode)
 * Similar offline/optimistic update logic as create
 */
export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journalId, data }: { journalId: string; data: JournalEntryUpdate }) =>
      journalApi.updateJournalEntry(journalId, data),

    // Optimistic update
    onMutate: async ({ journalId: _journalId, data }) => {
      await queryClient.cancelQueries({ queryKey: journalKeys.today() });

      const previousJournal = queryClient.getQueryData(journalKeys.today());

      // Optimistically update (only if old data exists)
      if (previousJournal) {
        queryClient.setQueryData(journalKeys.today(), (old: any) => ({
          ...old,
          fulfillment_score: data.fulfillment_score ?? old.fulfillment_score,
          default_responses: data.default_responses ?? old.default_responses,
          custom_responses: data.custom_responses ?? old.custom_responses,
          updated_at: new Date().toISOString(),
        }));
      }

      return { previousJournal };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousJournal) {
        queryClient.setQueryData(journalKeys.today(), context.previousJournal);
      }

      // Queue for offline sync if network error
      if (err.message.includes('Network') || err.message.includes('offline')) {
        queueOfflineUpdate(variables.journalId, variables.data);
      }
    },

    // Refetch on success
    onSuccess: (response) => {
      // Update cache with real data from server
      queryClient.setQueryData(journalKeys.today(), response.data);

      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: ['daily-aggregates'] });

      // Invalidate dashboard stats (auto-refresh Dashboard after journal update)
      queryClient.invalidateQueries({ queryKey: fulfillmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: consistencyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userStatsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });

      // Track analytics event
      // TODO: Add analytics tracking
    },

    networkMode: 'offlineFirst',
  });
}

// Offline queue helpers
async function queueOfflineSubmission(journal: JournalEntryCreate) {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const parsed = queue ? JSON.parse(queue) : [];
    parsed.push({ type: 'create', data: journal, timestamp: Date.now() });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to queue offline submission:', error);
  }
}

async function queueOfflineUpdate(journalId: string, data: JournalEntryUpdate) {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const parsed = queue ? JSON.parse(queue) : [];
    parsed.push({ type: 'update', journalId, data, timestamp: Date.now() });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to queue offline update:', error);
  }
}

/**
 * Process offline queue when connection restored
 * Called by app initialization or network state change
 */
export async function processOfflineQueue() {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queue) return;

    const parsed = JSON.parse(queue);
    for (const item of parsed) {
      if (item.type === 'create') {
        await journalApi.createJournalEntry(item.data);
      } else if (item.type === 'update') {
        await journalApi.updateJournalEntry(item.journalId, item.data);
      }
    }

    // Clear queue on success
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to process offline queue:', error);
    // Queue remains for next retry
  }
}
