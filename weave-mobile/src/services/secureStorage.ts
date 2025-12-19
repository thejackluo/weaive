/**
 * Secure Storage Adapter for Supabase
 *
 * Story 0.3: Authentication Flow
 * Provides encrypted storage for JWT tokens using react-native-keychain
 *
 * CRITICAL SECURITY:
 * - JWT tokens MUST be stored in keychain (encrypted)
 * - NEVER use AsyncStorage for auth tokens (plain text)
 * - Tokens grant full access to user accounts
 *
 * Implementation Pattern:
 * - Compatible with Supabase AsyncStorage interface
 * - Uses react-native-keychain for encryption
 * - Stores multiple key-value pairs in single keychain entry
 * - Service name: 'weave-auth-tokens' for isolation
 */

import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'weave-auth-tokens';

/**
 * Secure Storage Adapter
 * Compatible with Supabase storage interface
 */
export const secureStorage = {
  /**
   * Get item from encrypted keychain storage
   * @param key - Storage key
   * @returns Promise<string | null> - Stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });

      if (credentials && credentials.password) {
        try {
          const data = JSON.parse(credentials.password);
          return data[key] || null;
        } catch (parseError) {
          // JSON parse error - this IS a real error (corrupted data)
          console.error('[SECURE_STORAGE] Error parsing keychain data:', parseError);
          return null;
        }
      }

      // No credentials found - this is NORMAL on first app load
      // Don't log as error, this is expected behavior
      return null;
    } catch (error) {
      // Keychain access error - log this as it's unexpected
      console.error('[SECURE_STORAGE] Error accessing keychain:', error);
      return null;
    }
  },

  /**
   * Set item in encrypted keychain storage
   * @param key - Storage key
   * @param value - Value to store
   * @returns Promise<void>
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Get existing data from keychain
      const existing = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      const data = existing ? JSON.parse(existing.password) : {};

      // Update with new key-value pair
      data[key] = value;

      // Store updated data back to keychain
      await Keychain.setGenericPassword('auth', JSON.stringify(data), {
        service: KEYCHAIN_SERVICE,
      });
    } catch (error) {
      console.error('[SECURE_STORAGE] Error setting item in keychain:', error);
      throw error;
    }
  },

  /**
   * Remove item from encrypted keychain storage
   * @param key - Storage key to remove
   * @returns Promise<void>
   */
  async removeItem(key: string): Promise<void> {
    try {
      const existing = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });

      if (existing) {
        const data = JSON.parse(existing.password);
        delete data[key];

        // If data is empty, clear entire keychain entry
        if (Object.keys(data).length > 0) {
          await Keychain.setGenericPassword('auth', JSON.stringify(data), {
            service: KEYCHAIN_SERVICE,
          });
        } else {
          await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
        }
      }
    } catch (error) {
      console.error('[SECURE_STORAGE] Error removing item from keychain:', error);
      throw error;
    }
  },
};

/**
 * Clear all auth tokens from keychain
 * Useful for logout and debugging
 * @returns Promise<boolean> - True if cleared successfully
 */
export async function clearAuthTokens(): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    return true;
  } catch (error) {
    console.error('[SECURE_STORAGE] Error clearing auth tokens:', error);
    return false;
  }
}
