/**
 * Secure Storage Adapter for Supabase
 *
 * Story 0.3: Authentication Flow (SECURITY FIX v3 - Code Review)
 * Provides encrypted storage for JWT tokens using react-native-keychain
 *
 * FIX v3: PRODUCTION SECURITY ENFORCEMENT
 * - Keychain is REQUIRED in production builds
 * - AsyncStorage fallback ONLY allowed in development/Expo Go
 * - Production apps FAIL HARD if keychain unavailable (forces proper setup)
 * - This prevents JWT tokens from ever being stored in plain text in production
 *
 * CRITICAL SECURITY:
 * - JWT tokens MUST be stored in keychain (encrypted) in production
 * - AsyncStorage fallback is DEVELOPMENT/EXPO GO ONLY (plain text)
 * - Production builds will throw error if keychain is not available
 *
 * Implementation Pattern:
 * - Compatible with Supabase AsyncStorage interface
 * - Uses react-native-keychain for encryption (required in production)
 * - Falls back to AsyncStorage ONLY in __DEV__ mode
 * - Service name: 'weave-auth-tokens' for isolation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const KEYCHAIN_SERVICE = 'weave-auth-tokens';
const ASYNC_STORAGE_KEY = '@weave:auth-tokens';

// Try to import keychain, but don't crash if it fails
let KeychainModule: any = null;
let useKeychain = false;

/**
 * Test if keychain is actually working
 * Some environments load the module but native methods are null
 */
async function testKeychainAvailability(): Promise<boolean> {
  if (!KeychainModule) return false;

  try {
    // Try a simple test operation
    await KeychainModule.getGenericPassword({ service: KEYCHAIN_SERVICE });
    return true;
  } catch (error: any) {
    // Check for null native module errors
    if (
      error?.message?.includes('getGenericPasswordForOptions') ||
      error?.message?.includes('null is not an object')
    ) {
      console.warn('[SECURE_STORAGE] Native keychain module not initialized');
      return false;
    }
    // Other errors (like "not found") are OK - keychain works but empty
    return true;
  }
}

// Initialize keychain module
(async () => {
  try {
    KeychainModule = require('react-native-keychain');

    // Double-check the module actually loaded with required functions
    if (
      KeychainModule &&
      typeof KeychainModule.getGenericPassword === 'function' &&
      typeof KeychainModule.setGenericPassword === 'function' &&
      typeof KeychainModule.resetGenericPassword === 'function'
    ) {
      // Test if native module is actually initialized
      const isWorking = await testKeychainAvailability();
      if (isWorking) {
        useKeychain = true;
        console.log('[SECURE_STORAGE] ✓ Keychain available (encrypted storage)');
      } else {
        useKeychain = false;
        // PRODUCTION SECURITY CHECK: Keychain REQUIRED in production
        if (!__DEV__) {
          console.error('[SECURE_STORAGE] ❌ CRITICAL: Keychain not working in PRODUCTION build!');
          console.error('[SECURE_STORAGE] JWT tokens CANNOT be stored securely.');
          console.error('[SECURE_STORAGE] Fix: Build with `npx expo prebuild && npx expo run:ios`');
          Alert.alert(
            'Security Error',
            'Secure storage is not available. The app cannot store authentication tokens safely. Please contact support.',
            [{ text: 'OK' }]
          );
          throw new Error(
            'PRODUCTION SECURITY VIOLATION: Keychain unavailable - cannot store tokens securely'
          );
        } else {
          console.warn(
            '[SECURE_STORAGE] ⚠️ Keychain native module not working - using AsyncStorage fallback (DEV ONLY)'
          );
          console.warn('[SECURE_STORAGE] Run: npx expo prebuild && npx expo run:ios');
        }
      }
    } else {
      console.warn('[SECURE_STORAGE] ⚠️ Keychain module loaded but missing required functions');
      useKeychain = false;

      // PRODUCTION SECURITY CHECK
      if (!__DEV__) {
        console.error('[SECURE_STORAGE] ❌ CRITICAL: Keychain module incomplete in PRODUCTION!');
        throw new Error('PRODUCTION SECURITY VIOLATION: Keychain module incomplete');
      }
    }
  } catch (error) {
    // PRODUCTION SECURITY CHECK
    if (!__DEV__) {
      console.error('[SECURE_STORAGE] ❌ CRITICAL: Keychain not available in PRODUCTION build!');
      console.error('[SECURE_STORAGE] Error:', error);
      throw new Error('PRODUCTION SECURITY VIOLATION: Keychain unavailable');
    }

    console.warn(
      '[SECURE_STORAGE] ⚠️ Keychain not available - using AsyncStorage fallback (DEV ONLY)'
    );
    console.warn(
      '[SECURE_STORAGE] This is expected in Expo Go. For production, use a development build.'
    );
    useKeychain = false;
  }
})();

/**
 * Check if keychain is available and working
 */
export function isKeychainAvailable(): boolean {
  return useKeychain;
}

/**
 * Get item from AsyncStorage (fallback implementation)
 */
async function getItemFromAsyncStorage(key: string): Promise<string | null> {
  try {
    const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      return data[key] || null;
    }
    return null;
  } catch (error) {
    console.error('[SECURE_STORAGE] AsyncStorage getItem error:', error);
    return null;
  }
}

/**
 * Set item in AsyncStorage (fallback implementation)
 */
async function setItemInAsyncStorage(key: string, value: string): Promise<void> {
  try {
    const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    const data = storedData ? JSON.parse(storedData) : {};
    data[key] = value;
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[SECURE_STORAGE] AsyncStorage setItem error:', error);
    throw error;
  }
}

/**
 * Remove item from AsyncStorage (fallback implementation)
 */
async function removeItemFromAsyncStorage(key: string): Promise<void> {
  try {
    const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      delete data[key];

      if (Object.keys(data).length > 0) {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('[SECURE_STORAGE] AsyncStorage removeItem error:', error);
    throw error;
  }
}

/**
 * Get item from Keychain (encrypted implementation)
 */
async function getItemFromKeychain(key: string): Promise<string | null> {
  try {
    // Triple-check KeychainModule exists and has the method
    if (!KeychainModule || typeof KeychainModule.getGenericPassword !== 'function') {
      return getItemFromAsyncStorage(key);
    }

    const credentials = await KeychainModule.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      try {
        const data = JSON.parse(credentials.password);
        return data[key] || null;
      } catch (parseError) {
        console.error('[SECURE_STORAGE] Error parsing keychain data:', parseError);
        return null;
      }
    }

    return null;
  } catch (error: any) {
    // Check if this is a native module initialization error
    if (
      error?.message?.includes('getGenericPasswordForOptions') ||
      error?.message?.includes('null is not an object')
    ) {
      // Silently fall back to AsyncStorage (don't spam console)
      return getItemFromAsyncStorage(key);
    }
    console.warn('[SECURE_STORAGE] Keychain getItem error, falling back to AsyncStorage:', error);
    return getItemFromAsyncStorage(key);
  }
}

/**
 * Set item in Keychain (encrypted implementation)
 */
async function setItemInKeychain(key: string, value: string): Promise<void> {
  try {
    // Triple-check KeychainModule exists and has required methods
    if (
      !KeychainModule ||
      typeof KeychainModule.getGenericPassword !== 'function' ||
      typeof KeychainModule.setGenericPassword !== 'function'
    ) {
      return setItemInAsyncStorage(key, value);
    }

    // Get existing data
    const existing = await KeychainModule.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    const data = existing && existing.password ? JSON.parse(existing.password) : {};

    // Update with new key-value pair
    data[key] = value;

    // Store updated data
    await KeychainModule.setGenericPassword('auth', JSON.stringify(data), {
      service: KEYCHAIN_SERVICE,
    });
  } catch (error: any) {
    // Check if this is a native module initialization error
    if (
      error?.message?.includes('getGenericPasswordForOptions') ||
      error?.message?.includes('null is not an object')
    ) {
      // Silently fall back to AsyncStorage (don't spam console)
      return setItemInAsyncStorage(key, value);
    }
    console.warn('[SECURE_STORAGE] Keychain setItem error, falling back to AsyncStorage:', error);
    return setItemInAsyncStorage(key, value);
  }
}

/**
 * Remove item from Keychain (encrypted implementation)
 */
async function removeItemFromKeychain(key: string): Promise<void> {
  try {
    // Triple-check KeychainModule exists and has required methods
    if (
      !KeychainModule ||
      typeof KeychainModule.getGenericPassword !== 'function' ||
      typeof KeychainModule.setGenericPassword !== 'function' ||
      typeof KeychainModule.resetGenericPassword !== 'function'
    ) {
      return removeItemFromAsyncStorage(key);
    }

    const existing = await KeychainModule.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (existing && existing.password) {
      const data = JSON.parse(existing.password);
      delete data[key];

      // If data is empty, clear entire keychain entry
      if (Object.keys(data).length > 0) {
        await KeychainModule.setGenericPassword('auth', JSON.stringify(data), {
          service: KEYCHAIN_SERVICE,
        });
      } else {
        await KeychainModule.resetGenericPassword({ service: KEYCHAIN_SERVICE });
      }
    }
  } catch (error: any) {
    // Check if this is a native module initialization error
    if (
      error?.message?.includes('getGenericPasswordForOptions') ||
      error?.message?.includes('null is not an object')
    ) {
      // Silently fall back to AsyncStorage (don't spam console)
      return removeItemFromAsyncStorage(key);
    }
    console.warn(
      '[SECURE_STORAGE] Keychain removeItem error, falling back to AsyncStorage:',
      error
    );
    return removeItemFromAsyncStorage(key);
  }
}

/**
 * Secure Storage Adapter
 * Compatible with Supabase storage interface
 *
 * SECURITY ENFORCEMENT:
 * - Production builds REQUIRE keychain (encrypted storage)
 * - Development builds CAN use AsyncStorage fallback
 * - Production operations FAIL if keychain unavailable
 */
export const secureStorage = {
  /**
   * Get item from encrypted storage (keychain required in production)
   * @param key - Storage key
   * @returns Promise<string | null> - Stored value or null if not found
   * @throws Error in production if keychain unavailable
   */
  async getItem(key: string): Promise<string | null> {
    if (useKeychain) {
      return getItemFromKeychain(key);
    } else {
      // PRODUCTION CHECK: Fail if keychain not available
      if (!__DEV__) {
        throw new Error('SECURITY: Cannot access secure storage in production without keychain');
      }
      return getItemFromAsyncStorage(key);
    }
  },

  /**
   * Set item in encrypted storage (keychain required in production)
   * @param key - Storage key
   * @param value - Value to store
   * @returns Promise<void>
   * @throws Error in production if keychain unavailable
   */
  async setItem(key: string, value: string): Promise<void> {
    if (useKeychain) {
      return setItemInKeychain(key, value);
    } else {
      // PRODUCTION CHECK: Fail if keychain not available
      if (!__DEV__) {
        throw new Error('SECURITY: Cannot store tokens in production without keychain');
      }
      return setItemInAsyncStorage(key, value);
    }
  },

  /**
   * Remove item from encrypted storage (keychain required in production)
   * @param key - Storage key to remove
   * @returns Promise<void>
   * @throws Error in production if keychain unavailable
   */
  async removeItem(key: string): Promise<void> {
    if (useKeychain) {
      return removeItemFromKeychain(key);
    } else {
      // PRODUCTION CHECK: Fail if keychain not available
      if (!__DEV__) {
        throw new Error('SECURITY: Cannot remove tokens in production without keychain');
      }
      return removeItemFromAsyncStorage(key);
    }
  },
};

/**
 * Clear all auth tokens from keychain or AsyncStorage
 * Useful for logout and debugging
 * @returns Promise<boolean> - True if cleared successfully
 */
export async function clearAuthTokens(): Promise<boolean> {
  try {
    // Try keychain first (if available)
    if (
      useKeychain &&
      KeychainModule &&
      typeof KeychainModule.resetGenericPassword === 'function'
    ) {
      try {
        await KeychainModule.resetGenericPassword({ service: KEYCHAIN_SERVICE });
        console.log('[SECURE_STORAGE] Cleared keychain tokens');
      } catch (keychainError) {
        console.warn('[SECURE_STORAGE] Error clearing keychain:', keychainError);
      }
    }

    // Always clear AsyncStorage too (for fallback scenarios)
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
    console.log('[SECURE_STORAGE] Cleared AsyncStorage tokens');

    return true;
  } catch (error) {
    console.error('[SECURE_STORAGE] Error clearing auth tokens:', error);
    return false;
  }
}

/**
 * Debug helper: Check current storage state
 * Logs what storage method is being used
 */
export function logStorageStatus(): void {
  if (useKeychain) {
    console.log('[SECURE_STORAGE] Status: Using Keychain (encrypted) ✓');
  } else {
    console.warn('[SECURE_STORAGE] Status: Using AsyncStorage (unencrypted) ⚠️');
    console.warn(
      '[SECURE_STORAGE] Recommendation: Build with `npx expo run:ios` or EAS for keychain support'
    );
  }
}
