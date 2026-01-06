/**
 * API utilities for dynamic environment configuration
 */
import Constants from 'expo-constants';

/**
 * Get API base URL from app configuration
 *
 * @returns API base URL
 *
 * Production builds default to Railway backend.
 * Local dev can override with .env: API_BASE_URL=http://localhost:8000
 */
export function getApiBaseUrl(): string {
  const configUrl = Constants.expoConfig?.extra?.apiBaseUrl;

  // Default to production Railway backend for TestFlight builds
  const PRODUCTION_URL = 'https://weave-api-production.railway.app';

  // If no config URL or it's localhost, use production (for TestFlight builds)
  if (!configUrl || configUrl.includes('localhost')) {
    return PRODUCTION_URL;
  }

  // Log in dev mode (helps debugging different ports)
  if (__DEV__) {
    console.log(`[API] Using base URL: ${configUrl}`);
  }

  return configUrl;
}
