/**
 * useDailyDetail Hook
 *
 * TanStack Query hook for fetching complete daily summary data.
 * Used in Daily Detail page (app/(tabs)/dashboard/daily/[date].tsx)
 *
 * Tech-Spec: Task 8
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

// Cache configuration constants
const STALE_TIME_MS = 30 * 1000; // 30 seconds (invalidated by bind completion)
const GC_TIME_MS = 5 * 60 * 1000; // 5 minutes cache

export interface CaptureData {
  id: string;
  capture_type: 'photo' | 'audio' | 'text';
  storage_path: string | null;
  signed_url: string | null;
  content_text: string | null;
  created_at: string;
}

export interface BindData {
  id: string;
  title: string;
  goal_name: string;
  goal_color: string;
  completed: boolean;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  captures: CaptureData[];
}

export interface JournalEntryData {
  id: string;
  fulfillment_score: number;
  default_responses: {
    today_reflection?: string;
    tomorrow_focus?: string;
  } | null;
  custom_responses: Record<string, { question_text: string; response: string }> | null;
  submitted_at: string;
}

export interface DailyAggregates {
  completed_count: number;
  total_binds: number;
  has_proof: boolean;
  has_journal: boolean;
}

export interface DailySummaryData {
  date: string;
  aggregates: DailyAggregates;
  binds: BindData[];
  journal_entry: JournalEntryData | null;
}

export interface DailySummaryResponse {
  data: DailySummaryData;
  meta: {
    timestamp: string;
  };
}

/**
 * Fetch daily summary from API
 */
async function fetchDailySummary(date: string): Promise<DailySummaryResponse> {
  const response = await apiClient.get<DailySummaryResponse>(`/api/daily-summary/${date}`);
  return response.data;
}

/**
 * Hook to fetch daily detail data
 */
export function useDailyDetail(date: string) {
  return useQuery({
    queryKey: ['daily-detail', date],
    queryFn: () => fetchDailySummary(date),
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    enabled: !!date, // Only fetch if date is provided
    retry: 2, // Retry failed requests twice
  });
}
