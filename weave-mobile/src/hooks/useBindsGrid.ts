/**
 * useBindsGrid Hook
 * Fetches bind-level consistency data for 7d grid view
 *
 * Returns needles with binds and their completion status for last 7 days
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/utils/api';

export interface BindCompletion {
  id: string;
  name: string;
  completions: boolean[]; // 7 days
}

export interface NeedleWithBinds {
  id: string;
  title: string;
  description: string;
  binds: BindCompletion[];
}

export interface BindsGridResponse {
  data: {
    needles: NeedleWithBinds[];
    daily_reflection: {
      completions: boolean[]; // 7 days
    };
  };
  meta: {
    start_date: string;
    end_date: string;
    total_needles: number;
    total_binds: number;
  };
}

async function fetchBindsGrid(accessToken: string, startDate?: string): Promise<BindsGridResponse> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();
  if (startDate) {
    params.append('start_date', startDate);
  }
  const url = `${baseUrl}/api/stats/binds-grid${params.toString() ? `?${params.toString()}` : ''}`;

  console.log('[BINDS_GRID] Fetching:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[BINDS_GRID] API error:', response.status, error);
    throw new Error(error.detail || error.message || 'Failed to fetch binds grid');
  }

  const result = await response.json();
  console.log('[BINDS_GRID] API success:', result);
  return result;
}

export function useBindsGrid(startDate?: string) {
  const { session } = useAuth();

  return useQuery<BindsGridResponse, Error>({
    queryKey: ['bindsGrid', startDate],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      return fetchBindsGrid(session.access_token, startDate);
    },
    enabled: !!session?.access_token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}
