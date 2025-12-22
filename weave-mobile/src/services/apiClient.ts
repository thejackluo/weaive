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
  private adminKey: string | null = null;

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

  /**
   * Enable admin mode for unlimited rate limits (DEVELOPMENT ONLY)
   * @param key - Admin API key from backend .env
   */
  public enableAdminMode(key: string): void {
    this.adminKey = key;
    console.log('[API_CLIENT] 🔓 Admin mode enabled - unlimited rate limits');
    console.log('[API_CLIENT] 🔑 Admin key set to:', key); // DEBUG: Verify key value
  }

  /**
   * Disable admin mode
   */
  public disableAdminMode(): void {
    this.adminKey = null;
    console.log('[API_CLIENT] 🔒 Admin mode disabled - normal rate limits');
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      ...this.defaults.headers.common,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Add admin key if enabled
    if (this.adminKey) {
      headers['X-Admin-Key'] = this.adminKey;
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
