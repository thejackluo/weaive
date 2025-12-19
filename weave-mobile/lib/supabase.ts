/**
 * Supabase Client Singleton
 *
 * Story 0.3: Authentication Flow (UPDATED from Story 1.5)
 * Provides configured Supabase client for auth and database operations
 *
 * SECURITY FIX (Story 0.3):
 * - Replaced AsyncStorage with react-native-keychain for encrypted token storage
 * - JWT tokens now stored in device keychain (encrypted), not plain text
 * - This is a CRITICAL security requirement
 *
 * TODO:
 * - Configure Supabase project and obtain credentials
 * - Add EXPO_PUBLIC_SUPABASE_URL to .env
 * - Add EXPO_PUBLIC_SUPABASE_ANON_KEY to .env
 * - Enable OAuth providers in Supabase Dashboard (Apple, Google)
 * - Configure redirect URLs in Supabase Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import { secureStorage } from '@/src/services/secureStorage';

// Environment variables (set in .env)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client configuration
 * - Uses react-native-keychain for ENCRYPTED session persistence (Story 0.3)
 * - Auto-refresh tokens for seamless auth
 * - Detects session from URL disabled for mobile (no browser URL sessions)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage, // SECURITY: Encrypted keychain storage (not AsyncStorage)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile doesn't use URL sessions
  },
});

/**
 * Helper: Check if user is authenticated
 * @returns Promise<boolean> - True if user has active session
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !error && data.session !== null;
  } catch (err) {
    console.error('[SUPABASE] Error checking auth session:', err);
    return false;
  }
}

/**
 * Helper: Get current user
 * @returns Current authenticated user or null
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.error('[SUPABASE] Error getting current user:', err);
    return null;
  }
}

/**
 * Helper: Sign out user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[SUPABASE] Error signing out:', err);
    return { success: false, error: err };
  }
}
