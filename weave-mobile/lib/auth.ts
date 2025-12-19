/**
 * Authentication Helper Functions
 *
 * Story 0.3: Authentication Flow
 * Provides OAuth sign-in handlers for Apple, Google, and Email
 *
 * IMPLEMENTATION: Following official Supabase docs for React Native OAuth
 * https://supabase.com/docs/guides/auth/native-mobile-deep-linking
 *
 * Key Pattern:
 * 1. skipBrowserRedirect: true (let expo-web-browser handle the redirect)
 * 2. Use makeRedirectUri() for proper deep linking
 * 3. Manually extract tokens and set session after OAuth callback
 */

import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from './supabase';

// CRITICAL: Initialize WebBrowser for OAuth (required for web, doesn't hurt on mobile)
WebBrowser.maybeCompleteAuthSession();

// Get the redirect URI for OAuth callbacks
const redirectTo = makeRedirectUri();

// Debug logging for redirect URI
console.log('[LIB/AUTH] Redirect URI initialized:', redirectTo);

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Create session from OAuth callback URL
 * Extracts access_token and refresh_token from URL params and sets Supabase session
 *
 * This is called after the user completes OAuth in the browser and is redirected back
 * @param url - The redirect URL containing auth tokens
 */
async function createSessionFromUrl(url: string): Promise<AuthResult> {
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) {
      throw new Error(errorCode);
    }

    const { access_token, refresh_token } = params;

    if (!access_token) {
      throw new Error('No access token in OAuth callback URL');
    }

    console.log('[AUTH] Setting session from OAuth tokens...');

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;

    console.log('[AUTH] ✅ Session established successfully!');

    return { success: true };
  } catch (err: any) {
    console.error('[AUTH] Failed to create session from URL:', err);
    return {
      success: false,
      error: err.message || 'Failed to establish session',
    };
  }
}

/**
 * Sign in with Apple
 * Uses Supabase OAuth with Apple provider
 *
 * PATTERN: Following official Supabase docs
 * 1. Get OAuth URL with skipBrowserRedirect: true
 * 2. Open URL in expo-web-browser
 * 3. Manually extract tokens and set session
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    console.log('[AUTH] Starting Apple OAuth flow...');
    console.log('[AUTH] Redirect URI:', redirectTo);

    // Step 1: Get OAuth URL from Supabase (don't let Supabase handle redirect)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // CRITICAL: Let expo-web-browser handle the redirect
        scopes: 'email name',
      },
    });

    if (error) {
      console.error('[AUTH] ❌ Supabase OAuth error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    if (!data?.url) {
      console.error('[AUTH] ❌ No OAuth URL returned from Supabase');
      console.error('[AUTH] Data received:', JSON.stringify(data, null, 2));
      throw new Error('No OAuth URL returned from Supabase');
    }

    console.log('[AUTH] ✅ OAuth URL received:', data.url.substring(0, 100) + '...');
    console.log('[AUTH] Opening Apple OAuth URL in browser...');
    console.log('[AUTH] Using redirectTo:', redirectTo);

    // Step 2: Open OAuth URL in in-app browser
    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      console.log('[AUTH] Browser result received:', {
        type: result.type,
        url: result.url ? result.url.substring(0, 100) + '...' : 'no URL',
      });

      if (result.type === 'cancel') {
        console.log('[AUTH] ⚠️ User cancelled OAuth flow');
        return {
          success: false,
          error: 'Sign in cancelled.',
        };
      }

      if (result.type !== 'success') {
        console.error('[AUTH] ❌ OAuth failed with result type:', result.type);
        throw new Error(`OAuth failed: ${result.type}`);
      }

      if (!result.url) {
        console.error('[AUTH] ❌ No URL in browser result');
        throw new Error('No callback URL received from OAuth flow');
      }

      // Step 3: Extract tokens from callback URL and set session
      const sessionResult = await createSessionFromUrl(result.url);

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to create session');
      }

      console.log('[AUTH] ✅ Apple Sign In successful!');
      return { success: true };
    } catch (browserError: any) {
      console.error('[AUTH] ❌ WebBrowser.openAuthSessionAsync failed:', {
        message: browserError.message,
        stack: browserError.stack,
        name: browserError.name,
      });
      throw browserError;
    }
  } catch (err: any) {
    console.error('[AUTH] ❌ Apple Sign In failed:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return {
      success: false,
      error: err.message || 'Unable to sign in with Apple.',
    };
  }
}

/**
 * Sign in with Google
 * Uses Supabase OAuth with Google provider
 *
 * PATTERN: Following official Supabase docs
 * 1. Get OAuth URL with skipBrowserRedirect: true
 * 2. Open URL in expo-web-browser
 * 3. Manually extract tokens and set session
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    console.log('[AUTH] Starting Google OAuth flow...');
    console.log('[AUTH] Redirect URI:', redirectTo);

    // Step 1: Get OAuth URL from Supabase (don't let Supabase handle redirect)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // CRITICAL: Let expo-web-browser handle the redirect
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[AUTH] ❌ Supabase OAuth error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    if (!data?.url) {
      console.error('[AUTH] ❌ No OAuth URL returned from Supabase');
      console.error('[AUTH] Data received:', JSON.stringify(data, null, 2));
      throw new Error('No OAuth URL returned from Supabase');
    }

    console.log('[AUTH] ✅ OAuth URL received:', data.url.substring(0, 100) + '...');
    console.log('[AUTH] Opening Google OAuth URL in browser...');
    console.log('[AUTH] Using redirectTo:', redirectTo);

    // Step 2: Open OAuth URL in in-app browser
    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      console.log('[AUTH] Browser result received:', {
        type: result.type,
        url: result.url ? result.url.substring(0, 100) + '...' : 'no URL',
      });

      if (result.type === 'cancel') {
        console.log('[AUTH] ⚠️ User cancelled OAuth flow');
        return {
          success: false,
          error: 'Sign in cancelled.',
        };
      }

      if (result.type !== 'success') {
        console.error('[AUTH] ❌ OAuth failed with result type:', result.type);
        throw new Error(`OAuth failed: ${result.type}`);
      }

      if (!result.url) {
        console.error('[AUTH] ❌ No URL in browser result');
        throw new Error('No callback URL received from OAuth flow');
      }

      // Step 3: Extract tokens from callback URL and set session
      const sessionResult = await createSessionFromUrl(result.url);

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to create session');
      }

      console.log('[AUTH] ✅ Google Sign In successful!');
      return { success: true };
    } catch (browserError: any) {
      console.error('[AUTH] ❌ WebBrowser.openAuthSessionAsync failed:', {
        message: browserError.message,
        stack: browserError.stack,
        name: browserError.name,
      });
      throw browserError;
    }
  } catch (err: any) {
    console.error('[AUTH] ❌ Google Sign In failed:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return {
      success: false,
      error: err.message || 'Unable to sign in with Google.',
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
export async function signInWithEmail(_email: string): Promise<AuthResult> {
  // TODO (Story 0-4): Implement email sign-in
  // Option 1: Magic link
  // const { data, error } = await supabase.auth.signInWithOtp({
  //   email: _email,
  //   options: {
  //     emailRedirectTo: 'weavelight://auth/callback',
  //   },
  // });

  // Option 2: Password-based
  // Requires additional UI for password input
  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email: _email,
  //   password,
  // });

  return {
    success: false,
    error: 'Email authentication not yet implemented. Please use Apple or Google Sign In.',
  };
}

/**
 * Ensure user profile exists after authentication
 * Creates profile if it doesn't exist (idempotent)
 *
 * This is a safety fallback - the database trigger should handle this automatically,
 * but we check here to ensure profile exists before proceeding with onboarding.
 *
 * @param authUserId - User ID from auth.users table
 * @param painpoints - Selected painpoints from onboarding (optional)
 */
export async function ensureUserProfile(
  authUserId: string,
  painpoints?: string[]
): Promise<AuthResult> {
  try {
    console.log('[AUTH] Checking if user profile exists for:', authUserId);

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, onboarding_completed')
      .eq('auth_user_id', authUserId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if profile doesn't exist)
      console.error('[AUTH] Error checking existing profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      console.log('[AUTH] ✅ User profile already exists');
      return { success: true };
    }

    console.log('[AUTH] Creating new user profile...');

    // Auto-detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = 'en-US'; // TODO: Detect from device settings

    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        auth_user_id: authUserId,
        timezone,
        locale,
        selected_painpoints: painpoints || [],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // If error is duplicate key (profile was created by trigger), that's OK
      if (insertError.code === '23505') {
        console.log('[AUTH] ✅ Profile was created by database trigger (expected)');
        return { success: true };
      }
      console.error('[AUTH] Error creating profile:', insertError);
      throw insertError;
    }

    console.log('[AUTH] ✅ User profile created successfully:', newProfile.id);

    // TODO (Story 0-4): Track analytics event
    // trackEvent('profile_created', {
    //   user_id: authUserId,
    //   painpoints,
    //   timezone,
    // });

    return { success: true };
  } catch (err: any) {
    console.error('[AUTH] User profile check/creation failed:', err);
    return {
      success: false,
      error: err.message || 'Unable to ensure user profile exists.',
    };
  }
}
