/**
 * API Client - Axios-like Fetch Wrapper (Story 6.1)
 *
 * Provides axios-like interface for API calls with automatic JWT authentication
 * Uses fetch under the hood for React Native compatibility
 */

import { getApiBaseUrl } from '@/utils/api';
import { getAccessToken } from './secureStorage';

interface ApiClientConfig {
  baseURL: string;
  headers: {
    common: Record<string, string>;
  };
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class ApiClient {
  public defaults: ApiClientConfig;

  constructor() {
    this.defaults = {
      baseURL: getApiBaseUrl(),
      headers: {
        common: {
          'Content-Type': 'application/json',
        },
      },
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      ...this.defaults.headers.common,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    const authHeaders = await this.getAuthHeaders();
    const headers = {
      ...authHeaders,
      ...(config?.headers || {}),
    };

    const fullUrl = url.startsWith('http') ? url : `${this.defaults.baseURL}${url}`;

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData?.error?.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  async get<T = any>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
