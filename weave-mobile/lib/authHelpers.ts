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
export async function navigateAfterAuth(userId: string, fromOnboarding: boolean = false): Promise<void> {
  try {
    console.log('[AUTH_HELPERS] Determining post-auth navigation...', {
      userId,
      fromOnboarding,
    });

    const onboardingComplete = await hasCompletedOnboarding(userId);

    console.log('[AUTH_HELPERS] Onboarding status:', onboardingComplete);

    if (!onboardingComplete) {
      // User hasn't completed onboarding → continue onboarding flow
      console.log('[AUTH_HELPERS] Redirecting to onboarding...');
      router.replace('/(onboarding)/identity-bootup' as any);
    } else {
      // User has completed onboarding → go to main app
      console.log('[AUTH_HELPERS] Redirecting to main app...');
      router.replace('/(tabs)' as any);
    }
  } catch (err) {
    console.error('[AUTH_HELPERS] Navigation error:', err);
    // Fallback: go to tabs if error occurs
    router.replace('/(tabs)' as any);
  }
}

/**
 * Development bypass for authentication
 * Only available in __DEV__ mode
 * Signs in with test account or creates one if needed
 *
 * @param email - Test email (optional, defaults to test@weavelight.dev)
 * @param password - Test password (optional, defaults to testpass123)
 */
export async function bypassAuthForDev(
  email: string = 'test@weavelight.dev',
  password: string = 'testpass123'
): Promise<void> {
  if (!__DEV__) {
    console.warn('[AUTH_HELPERS] Development bypass is only available in DEV mode');
    return;
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

    // Show success toast
    showSimpleToast('🔧 Dev bypass: Signed in with test account', 'success');

    // Navigate to main app (bypass onboarding for dev)
    router.replace('/(tabs)' as any);
  } catch (err: any) {
    console.error('[AUTH_HELPERS] Development bypass failed:', err);
    showSimpleToast(`Dev bypass failed: ${err.message}`, 'error');
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

  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please verify your email address before signing in.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 8 characters': 'Password must be at least 8 characters long.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Too many requests': 'Too many attempts. Please try again later.',
    'Network request failed': 'Network error. Please check your connection and try again.',
  };

  // Check if error message matches any known patterns
  for (const [pattern, friendlyMessage] of Object.entries(errorMap)) {
    if (message.includes(pattern)) {
      return friendlyMessage;
    }
  }

  // Return original message if no match found
  return message || 'An error occurred. Please try again.';
}
