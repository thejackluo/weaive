/**
 * API utilities for dynamic environment configuration
 */
import Constants from 'expo-constants';

/**
 * Get API base URL from app configuration (loaded from .env)
 *
 * @returns API base URL (e.g., "http://localhost:8000")
 * @throws Error if API_BASE_URL is not configured
 */
export function getApiBaseUrl(): string {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

  if (!apiBaseUrl) {
    throw new Error(
      '❌ API_BASE_URL is not configured.\n' +
      '   1. Create .env file in weave-mobile/\n' +
      '   2. Add: API_BASE_URL=http://localhost:8000\n' +
      '   3. Restart Expo with: npm run start:clean'
    );
  }

  // Log in dev mode (helps debugging different ports)
  if (__DEV__) {
    console.log(`[API] Using base URL: ${apiBaseUrl}`);
  }

  return apiBaseUrl;
}
