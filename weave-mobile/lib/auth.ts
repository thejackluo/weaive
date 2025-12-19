/**
 * Authentication Helper Functions
 *
 * Story 1.5: Authentication
 * Provides OAuth sign-in handlers for Apple, Google, and Email
 *
 * FRONT-END ONLY: Backend integration deferred to Story 0-4
 * TODO (Story 0-4):
 * - Configure OAuth providers in Supabase Dashboard
 * - Add Apple Sign In credentials (Services ID, Key ID, Team ID, .p8 key)
 * - Add Google Sign In credentials (Client ID, Client Secret)
 * - Set up redirect URLs: https://[project-ref].supabase.co/auth/v1/callback
 * - Test OAuth flow on physical iOS device (required for Apple Sign In)
 */

import { supabase } from './supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with Apple
 * Uses Supabase OAuth with Apple provider
 *
 * AC #3: <3 seconds auth completion
 * TODO (Story 0-4): Implement user profile creation after successful auth
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'weavelight://auth/callback',
        scopes: 'email name',
      },
    });

    if (error) throw error;

    // TODO (Story 0-4): After successful auth, create user profile:
    // - Insert row into user_profiles table
    // - Store auth_user_id from auth.users
    // - Store selected_painpoints from onboarding store
    // - Track auth_completed analytics event

    return { success: true };
  } catch (err: any) {
    console.error('[AUTH] Apple Sign In failed:', err);
    return {
      success: false,
      error: err.message || 'Unable to sign in with Apple. Please try again.',
    };
  }
}

/**
 * Sign in with Google
 * Uses Supabase OAuth with Google provider
 *
 * AC #3: <3 seconds auth completion
 * TODO (Story 0-4): Implement user profile creation after successful auth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'weavelight://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    // TODO (Story 0-4): After successful auth, create user profile
    // Same steps as Apple Sign In

    return { success: true };
  } catch (err: any) {
    console.error('[AUTH] Google Sign In failed:', err);
    return {
      success: false,
      error: err.message || 'Unable to sign in with Google. Please try again.',
    };
  }
}

/**
 * Sign in with Email
 * TODO (Story 0-4): Implement email authentication
 * - Magic link (passwordless)
 * - OR password-based auth
 * - Configure email templates in Supabase Dashboard
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  try {
    // TODO (Story 0-4): Implement email sign-in
    // Option 1: Magic link
    // const { data, error } = await supabase.auth.signInWithOtp({
    //   email,
    //   options: {
    //     emailRedirectTo: 'weavelight://auth/callback',
    //   },
    // });

    // Option 2: Password-based
    // Requires additional UI for password input
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    return {
      success: false,
      error: 'Email authentication not yet implemented. Please use Apple or Google Sign In.',
    };
  } catch (err: any) {
    console.error('[AUTH] Email Sign In failed:', err);
    return {
      success: false,
      error: err.message || 'Unable to sign in with email. Please try again.',
    };
  }
}

/**
 * Create user profile after successful authentication
 * TODO (Story 0-4): Implement user profile creation
 *
 * @param authUserId - User ID from auth.users table
 * @param painpoints - Selected painpoints from onboarding (Story 1.2)
 */
export async function createUserProfile(
  authUserId: string,
  painpoints: string[]
): Promise<AuthResult> {
  try {
    // TODO (Story 0-4): Insert user profile
    // const { data, error } = await supabase
    //   .from('user_profiles')
    //   .insert({
    //     auth_user_id: authUserId,
    //     selected_painpoints: painpoints,
    //     onboarding_completed: false,
    //     created_at: new Date().toISOString(),
    //   });
    //
    // if (error) throw error;

    // TODO (Story 0-4): Track analytics event
    // trackEvent('auth_completed', {
    //   provider: 'apple' | 'google' | 'email',
    //   painpoints,
    // });

    return { success: true };
  } catch (err: any) {
    console.error('[AUTH] User profile creation failed:', err);
    return {
      success: false,
      error: err.message || 'Unable to create user profile.',
    };
  }
}
