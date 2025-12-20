/**
 * Authentication Helper Functions
 *
 * Shared utilities for authentication flows across the app
 * Provides: onboarding status checks, smart navigation, development bypass
 */

import { router } from 'expo-router';
import { supabase } from './supabase';
import { showSimpleToast } from '@/design-system';

/**
 * Check if user has completed onboarding
 * @param userId - Auth user ID
 * @returns true if onboarding is complete, false otherwise
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('auth_user_id', userId)
      .single();

    if (error) {
      console.error('[AUTH_HELPERS] Error checking onboarding status:', error);
      // If error, assume onboarding not completed to be safe
      return false;
    }

    return data?.onboarding_completed === true;
  } catch (err) {
    console.error('[AUTH_HELPERS] Exception checking onboarding status:', err);
    return false;
  }
}

/**
 * Navigate user to appropriate screen after authentication
 * Checks onboarding status and routes accordingly
 *
 * @param userId - Auth user ID
 * @param fromOnboarding - Whether user came from onboarding flow
 */
export async function navigateAfterAuth(
  userId: string,
  fromOnboarding: boolean = false
): Promise<void> {
  try {
    console.log('[AUTH_HELPERS] Determining post-auth navigation...', {
      userId,
      fromOnboarding,
    });

    // Validate userId
    if (!userId) {
      console.error('[AUTH_HELPERS] No userId provided, cannot navigate');
      showSimpleToast('Unable to navigate. Please try signing in again.', 'error');
      return;
    }

    const onboardingComplete = await hasCompletedOnboarding(userId);

    console.log('[AUTH_HELPERS] Onboarding status:', onboardingComplete);

    if (!onboardingComplete) {
      // User hasn't completed onboarding → continue onboarding flow
      console.log('[AUTH_HELPERS] Redirecting to onboarding...');
      try {
        router.replace('/(onboarding)/identity-bootup' as any);
      } catch (navError) {
        console.error('[AUTH_HELPERS] Navigation to onboarding failed, trying push:', navError);
        router.push('/(onboarding)/identity-bootup' as any);
      }
    } else {
      // User has completed onboarding → go to main app
      console.log('[AUTH_HELPERS] Redirecting to main app...');
      try {
        router.replace('/(tabs)' as any);
      } catch (navError) {
        console.error('[AUTH_HELPERS] Navigation to tabs failed, trying push:', navError);
        router.push('/(tabs)' as any);
      }
    }
  } catch (err) {
    console.error('[AUTH_HELPERS] Navigation error:', err);
    showSimpleToast('Navigation failed. Redirecting to main app...', 'error');
    // Fallback: go to tabs if error occurs
    try {
      router.replace('/(tabs)' as any);
    } catch (fallbackError) {
      console.error('[AUTH_HELPERS] Fallback navigation also failed:', fallbackError);
      router.push('/(tabs)' as any);
    }
  }
}

/**
 * Development bypass for authentication
 * Only available in __DEV__ mode
 * Signs in with test account or creates one if needed
 *
 * @param email - Test email (optional, defaults to test@weavelight.dev)
 * @param password - Test password (optional, defaults to testpass123)
 * @param skipNavigation - If true, doesn't navigate after auth (caller handles navigation)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function bypassAuthForDev(
  email: string = 'test@weavelight.dev',
  password: string = 'testpass123',
  skipNavigation: boolean = false
): Promise<boolean> {
  if (!__DEV__) {
    console.warn('[AUTH_HELPERS] Development bypass is only available in DEV mode');
    return false;
  }

  try {
    console.log('[AUTH_HELPERS] 🔧 Development bypass: Signing in with test account...');

    // Try to sign in with test account
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign in fails (account doesn't exist), create the account
    if (error && error.message.includes('Invalid login credentials')) {
      console.log('[AUTH_HELPERS] 🔧 Test account does not exist, creating...');

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      console.log('[AUTH_HELPERS] ✅ Test account created and signed in');
    } else if (error) {
      throw error;
    } else {
      console.log('[AUTH_HELPERS] ✅ Signed in with existing test account');
    }

    // Show success toast (only if not skipping navigation, caller will show their own)
    if (!skipNavigation) {
      showSimpleToast('🔧 Dev bypass: Signed in with test account', 'success');
      // Navigate to main app (bypass onboarding for dev)
      router.replace('/(tabs)' as any);
    }

    return true;
  } catch (err: any) {
    console.error('[AUTH_HELPERS] Development bypass failed:', err);
    showSimpleToast(`Dev bypass failed: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Get user-friendly error message for auth errors
 * @param error - Auth error
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return '';

  const message = error.message || '';
  const errorCode = error.code || '';
  const errorStatus = error.status || 0;

  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    // Authentication errors
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please verify your email address before signing in.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 8 characters': 'Password must be at least 8 characters long.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Too many requests': 'Too many attempts. Please try again later.',

    // Network errors
    'Network request failed': 'Network error. Please check your connection and try again.',
    'Failed to fetch': 'Unable to connect. Please check your internet connection.',
    'NetworkError': 'Network error. Please check your connection and try again.',
    'ECONNREFUSED': 'Unable to reach server. Please try again later.',
    'ETIMEDOUT': 'Connection timed out. Please check your connection and try again.',
    'ENOTFOUND': 'Unable to reach server. Please check your connection.',
    'timeout': 'Request timed out. Please try again.',
    'net::ERR_INTERNET_DISCONNECTED': 'No internet connection. Please check your network.',
    'net::ERR_NAME_NOT_RESOLVED': 'Unable to reach server. Please check your connection.',
    'net::ERR_CONNECTION_REFUSED': 'Unable to connect to server. Please try again later.',
  };

  // Check if error message matches any known patterns
  for (const [pattern, friendlyMessage] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }

  // Handle HTTP status code errors
  if (errorStatus >= 500) {
    return 'Server error. Please try again later.';
  }
  if (errorStatus === 429) {
    return 'Too many attempts. Please try again later.';
  }
  if (errorStatus === 408) {
    return 'Request timed out. Please try again.';
  }
  if (errorStatus === 0 || !errorStatus) {
    // Status 0 usually indicates network failure
    return 'Network error. Please check your connection and try again.';
  }

  // Return original message if no match found
  return message || 'An error occurred. Please try again.';
}
