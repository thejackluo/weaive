/**
 * Authentication Context
 *
 * Story 0.3: Authentication Flow
 * Provides authentication state and methods throughout the app
 *
 * Features:
 * - Email/password authentication
 * - OAuth providers (Apple, Google)
 * - Real-time auth state synchronization
 * - Automatic session restoration on app restart
 * - Secure token storage via react-native-keychain
 * - Automatic token refresh (handled by Supabase client)
 *
 * Usage:
 * ```tsx
 * import { useAuth } from '@/contexts/AuthContext';
 *
 * function MyComponent() {
 *   const { user, isLoading, signIn, signOut } = useAuth();
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (!user) return <LoginScreen />;
 *
 *   return <AuthenticatedContent />;
 * }
 * ```
 *
 * Architecture Notes:
 * - State management: React Context API (single source of truth)
 * - Token storage: react-native-keychain (encrypted)
 * - Token refresh: Automatic via Supabase client
 * - Session persistence: Automatic via Supabase auth.storage
 * - Auth state changes: Real-time via onAuthStateChange subscription
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from '@lib/supabase';
import { ensureUserProfile } from '@lib/auth';

// CRITICAL: Initialize WebBrowser for OAuth (required for web, doesn't hurt on mobile)
WebBrowser.maybeCompleteAuthSession();

// Debug: Log the redirect URI that will be used for OAuth
// CRITICAL: This URI must match EXACTLY in Supabase settings
// Even a trailing slash difference will cause the browser to stay open
const REDIRECT_URI = makeRedirectUri();
console.log('╔════════════════════════════════════════════════════════════');
console.log('║ 🔗 OAUTH REDIRECT URI CONFIGURATION');
console.log('╠════════════════════════════════════════════════════════════');
console.log('║ Generated Redirect URI:', REDIRECT_URI);
console.log('║');
console.log('║ ⚠️  CRITICAL: This URI must match EXACTLY in Supabase!');
console.log('║    - Copy the URI above EXACTLY (including scheme, no trailing slash)');
console.log('║    - Any mismatch will cause browser to stay open after OAuth');
console.log('║');
console.log('║ 📋 ADD THIS URL TO SUPABASE:');
console.log('║ 1. Go to: https://supabase.com/dashboard');
console.log('║ 2. Select your project');
console.log('║ 3. Navigate to: Authentication → URL Configuration');
console.log('║ 4. Add to "Redirect URLs":', REDIRECT_URI);
console.log('║ 5. Verify it matches EXACTLY (case-sensitive, no extra slashes)');
console.log('║');
console.log('║ 💡 COMMON REDIRECT URIs:');
console.log('║    Development (Expo Go): exp://192.168.x.x:8081');
console.log('║    Production (Custom): weavelight://');
console.log('║    iOS Simulator: exp://localhost:8081');
console.log('╚════════════════════════════════════════════════════════════');
/**
 * OAuth Provider Types
 * Supported providers for social authentication
 */
export type OAuthProvider = 'apple' | 'google';

/**
 * Authentication Context Type
 * Defines all auth state and methods available to consumers
 */
export interface AuthContextType {
  /**
   * Current authenticated user
   * Null if not authenticated
   */
  user: User | null;

  /**
   * Current session object
   * Contains access token, refresh token, and expiry
   * Null if not authenticated
   */
  session: Session | null;

  /**
   * Loading state for initial session check
   * True during app startup while checking for existing session
   * False once session check is complete
   */
  isLoading: boolean;

  /**
   * Error from last auth operation
   * Null if no error or after successful operation
   */
  error: AuthError | null;

  /**
   * Sign in with email and password
   * @param _email - User email address
   * @param _password - User password
   * @throws {AuthError} If authentication fails
   */
  signIn: (_email: string, _password: string) => Promise<void>;

  /**
   * Sign up new user with email and password
   * @param _email - User email address
   * @param _password - User password
   * @throws {AuthError} If sign up fails
   * @note User may need to verify email before login (Supabase setting)
   */
  signUp: (_email: string, _password: string) => Promise<void>;

  /**
   * Sign out current user
   * Clears session and removes tokens from keychain
   * @throws {AuthError} If sign out fails
   */
  signOut: () => Promise<void>;

  /**
   * Sign in with OAuth provider (Apple, Google)
   * @param _provider - OAuth provider name
   * @throws {AuthError} If OAuth sign in fails
   * @note Opens browser for OAuth flow, redirects back to app
   */
  signInWithOAuth: (_provider: OAuthProvider) => Promise<void>;

  /**
   * Clear error state
   * Call this to dismiss error messages after user acknowledges
   */
  clearError: () => void;

  /**
   * Get current auth token (access_token from session)
   * @returns Promise<string> - JWT access token
   * @throws {Error} If not authenticated
   *
   * Use this instead of calling supabase.auth.getSession() directly
   * to avoid duplicate network calls and request queueing.
   */
  getAuthToken: () => Promise<string>;
}

/**
 * Auth Context
 * Internal context - use useAuth() hook instead
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Wrap your app with this provider to enable auth throughout the tree
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * import { AuthProvider } from '@/contexts/AuthContext';
 *
 * export default function RootLayout() {
 *   return (
 *     <AuthProvider>
 *       <Stack />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Initialize auth state on mount
   * 1. Check for existing session in keychain
   * 2. Subscribe to auth state changes
   * 3. Clean up subscription on unmount
   */
  useEffect(() => {
    // Get initial session from keychain (if exists)
    supabase.auth
      .getSession()
      .then(
        ({
          data: { session },
          error,
        }: {
          data: { session: Session | null };
          error: AuthError | null;
        }) => {
          if (error) {
            console.error('[AUTH] Error getting initial session:', error);
            setError(error);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      )
      .catch((err: Error) => {
        console.error('[AUTH] Unexpected error during session check:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Subscribe to auth state changes
    // This fires when user signs in, signs out, token refreshes, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      console.log('[AUTH] Attempting sign in with email:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Supabase sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code,
          details: error,
        });
        console.log('[AUTH] Setting error state to:', error.message);
        setError(error);
        console.log('[AUTH] Error state set, throwing error');
        throw error;
      }

      console.log('[AUTH] Sign in successful:', {
        user: data.user?.id,
        session: !!data.session,
      });

      // Ensure user profile exists
      if (data.user) {
        console.log('[AUTH] Ensuring user profile exists...');
        await ensureUserProfile(data.user.id);
      }

      // State will be updated automatically via onAuthStateChange
    } catch (err) {
      console.error('[AUTH] Sign in exception:', err);
      throw err;
    }
  };

  /**
   * Sign up new user with email and password
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      console.log('[AUTH] Attempting signup with email:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Supabase signup error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code,
          details: error,
        });
        setError(error);
        throw error;
      }

      console.log('[AUTH] Signup successful:', {
        user: data.user?.id,
        session: !!data.session,
        needsConfirmation: !data.session && !!data.user,
      });

      // Ensure user profile exists
      if (data.user) {
        console.log('[AUTH] Ensuring user profile exists...');
        await ensureUserProfile(data.user.id);
      }

      // State will be updated automatically via onAuthStateChange
      // Note: User may need to verify email before session is active
    } catch (err) {
      console.error('[AUTH] Sign up exception:', err);
      throw err;
    }
  };

  /**
   * Sign out current user
   * Uses 'local' scope to avoid AuthSessionMissingError on React Native
   * See: https://github.com/supabase/supabase-js/issues/1543
   */
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        setError(error);
        throw error;
      }

      // State will be updated automatically via onAuthStateChange
      // Tokens will be cleared from keychain automatically
    } catch (err) {
      console.error('[AUTH] Sign out error:', err);
      throw err;
    }
  };

  /**
   * Sign in with OAuth provider
   * Opens browser for OAuth flow using expo-web-browser, then redirects back to app
   *
   * PATTERN: Following official Supabase docs for React Native OAuth
   * 1. Get OAuth URL with skipBrowserRedirect: true
   * 2. Open URL in expo-web-browser
   * 3. Manually extract tokens and set session
   */
  const signInWithOAuth = async (provider: OAuthProvider): Promise<void> => {
    try {
      setError(null);
      console.log('[AUTH_CONTEXT] Starting OAuth flow for provider:', provider);

      // Use the pre-computed redirect URI
      const redirectTo = REDIRECT_URI;
      console.log('[AUTH_CONTEXT] Using Redirect URI:', redirectTo);

      // Step 1: Get OAuth URL from Supabase (don't let Supabase handle redirect)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true, // CRITICAL: Let expo-web-browser handle the redirect
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'consent',
                }
              : provider === 'apple'
                ? {
                    scope: 'email name',
                  }
                : undefined,
        },
      });

      if (error) {
        console.error('[AUTH_CONTEXT] ❌ Supabase OAuth error:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        setError(error);
        throw error;
      }

      if (!data?.url) {
        const noUrlError = new Error('No OAuth URL returned from Supabase');
        console.error('[AUTH_CONTEXT] ❌ No OAuth URL returned from Supabase');
        console.error('[AUTH_CONTEXT] Data received:', JSON.stringify(data, null, 2));
        setError(noUrlError as AuthError);
        throw noUrlError;
      }

      console.log('[AUTH_CONTEXT] ✅ OAuth URL received:', data.url.substring(0, 100) + '...');
      console.log('[AUTH_CONTEXT] Opening OAuth URL in browser...');

      // Step 2: Open OAuth URL in in-app browser
      try {
        console.log('[AUTH_CONTEXT] 🔍 Opening browser with:');
        console.log('[AUTH_CONTEXT]   - OAuth URL:', data.url.substring(0, 150) + '...');
        console.log('[AUTH_CONTEXT]   - Expected redirect URI:', redirectTo);
        console.log('[AUTH_CONTEXT]   - Redirect URI must match EXACTLY for browser to close');
        console.log(
          '[AUTH_CONTEXT]   - Make sure this exact URI is added to Supabase redirect URLs'
        );

        // Use a timeout to detect if browser gets stuck
        const browserPromise = WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                'OAuth browser timeout - browser may be stuck. Check redirect URI configuration.'
              )
            );
          }, 60000); // 60 second timeout
        });

        const result = await Promise.race([browserPromise, timeoutPromise]);

        console.log('[AUTH_CONTEXT] 📥 Browser result received:', {
          type: result.type,
          url: 'url' in result && result.url ? result.url.substring(0, 200) : 'no URL',
          fullUrl: 'url' in result ? result.url : undefined, // Log full URL for debugging
        });

        // Log redirect URI comparison for debugging
        if ('url' in result && result.url) {
          // Extract origin and pathname for comparison
          const parseUrl = (urlString: string) => {
            try {
              // Use URLSearchParams and string manipulation since URL constructor may not be available
              const [baseUrl] = urlString.split('?');
              return baseUrl;
            } catch {
              return urlString;
            }
          };

          const receivedRedirect = parseUrl(result.url);
          const expectedRedirect = parseUrl(redirectTo);
          console.log('[AUTH_CONTEXT] 🔍 Redirect URI comparison:');
          console.log('[AUTH_CONTEXT]   - Received base:', receivedRedirect);
          console.log('[AUTH_CONTEXT]   - Expected base:', expectedRedirect);
          console.log('[AUTH_CONTEXT]   - Match:', receivedRedirect === expectedRedirect);
        }

        if (result.type === 'cancel') {
          console.log('[AUTH_CONTEXT] ⚠️ User cancelled OAuth flow');
          const cancelError = new Error('Sign in cancelled.');
          setError(cancelError as AuthError);
          throw cancelError;
        }

        if (result.type !== 'success') {
          const failError = new Error(`OAuth failed: ${result.type}`);
          console.error('[AUTH_CONTEXT] ❌ OAuth failed with result type:', result.type);
          console.error('[AUTH_CONTEXT] Full result:', JSON.stringify(result, null, 2));
          setError(failError as AuthError);
          throw failError;
        }

        // Type guard: at this point we know result.type === 'success', so result should have url
        if (!('url' in result) || !result.url) {
          const noCallbackError = new Error('No callback URL received from OAuth flow');
          console.error('[AUTH_CONTEXT] ❌ No URL in browser result');
          setError(noCallbackError as AuthError);
          throw noCallbackError;
        }

        // Step 3: Extract tokens from callback URL and set session
        console.log('[AUTH_CONTEXT] 🔑 Extracting tokens from callback URL...');
        const { params, errorCode } = QueryParams.getQueryParams(result.url);

        if (errorCode) {
          console.error('[AUTH_CONTEXT] ❌ Error code in callback:', errorCode);
          const paramsError = new Error(errorCode);
          setError(paramsError as AuthError);
          throw paramsError;
        }

        const { access_token, refresh_token } = params;

        if (!access_token) {
          console.error('[AUTH_CONTEXT] ❌ No access token found in callback URL');
          console.error('[AUTH_CONTEXT] Available params:', Object.keys(params));
          const noTokenError = new Error('No access token in OAuth callback URL');
          setError(noTokenError as AuthError);
          throw noTokenError;
        }

        console.log('[AUTH_CONTEXT] ✅ Tokens extracted successfully');
        console.log('[AUTH_CONTEXT] Setting session from OAuth tokens...');

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          console.error('[AUTH_CONTEXT] ❌ Failed to set session:', sessionError);
          setError(sessionError);
          throw sessionError;
        }

        console.log('[AUTH_CONTEXT] ✅ Session set successfully!');
        console.log('[AUTH_CONTEXT] User ID:', sessionData?.user?.id);
        console.log('[AUTH_CONTEXT] Session expires at:', sessionData?.session?.expires_at);

        // Ensure user profile exists (safety fallback if trigger didn't fire)
        if (sessionData?.user) {
          console.log('[AUTH_CONTEXT] Ensuring user profile exists...');
          const profileResult = await ensureUserProfile(sessionData.user.id);

          if (!profileResult.success) {
            console.error('[AUTH_CONTEXT] ⚠️ Failed to ensure user profile:', profileResult.error);
            // Don't throw error - user can still proceed, we'll retry later
          } else {
            console.log('[AUTH_CONTEXT] ✅ User profile confirmed');
          }
        }

        // State will be updated automatically via onAuthStateChange
        // The browser should have closed automatically when redirect matched
        console.log('[AUTH_CONTEXT] ✅ OAuth Sign In flow completed successfully!');
        console.log('[AUTH_CONTEXT] Waiting for onAuthStateChange to update user state...');

        // Force a small delay to ensure state updates propagate
        // This helps with navigation timing issues
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Double-check that session is actually set
        const {
          data: { session: verifySession },
        } = await supabase.auth.getSession();
        if (verifySession) {
          console.log('[AUTH_CONTEXT] ✅ Session verified - user is authenticated');
          console.log('[AUTH_CONTEXT] User ID:', verifySession.user.id);
        } else {
          console.error('[AUTH_CONTEXT] ⚠️ WARNING: Session not found after setSession!');
        }
      } catch (browserError: any) {
        console.error('[AUTH_CONTEXT] ❌ WebBrowser.openAuthSessionAsync failed:', {
          message: browserError.message,
          stack: browserError.stack,
          name: browserError.name,
        });
        setError(browserError as AuthError);
        throw browserError;
      }
    } catch (err: any) {
      console.error('[AUTH_CONTEXT] ❌ OAuth sign in exception:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      setError(err as AuthError);
      throw err;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Get current auth token from cached session
   * Avoids duplicate supabase.auth.getSession() calls
   */
  const getAuthToken = async (): Promise<string> => {
    // First try to use cached session from context
    if (session?.access_token) {
      return session.access_token;
    }

    // If session expired or not in context, refresh it
    const {
      data: { session: freshSession },
    } = await supabase.auth.getSession();

    if (!freshSession?.access_token) {
      throw new Error('Not authenticated');
    }

    return freshSession.access_token;
  };

  // Context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    clearError,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access authentication state and methods
 *
 * @throws {Error} If used outside AuthProvider
 * @returns {AuthContextType} Auth state and methods
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/contexts/AuthContext';
 *
 * function LoginScreen() {
 *   const { signIn, error } = useAuth();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await signIn(email, password);
 *       // Navigate to home on success
 *     } catch (err) {
 *       // Error state is automatically set in context
 *       console.error('Login failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       {error && <ErrorBanner message={error.message} />}
 *       <Button onPress={handleLogin}>Sign In</Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Helper: Check if user is authenticated
 * Convenience helper for conditional rendering
 *
 * @returns {boolean} True if user is authenticated
 *
 * @example
 * ```tsx
 * import { useAuth, isUserAuthenticated } from '@/contexts/AuthContext';
 *
 * function MyComponent() {
 *   const auth = useAuth();
 *
 *   if (!isUserAuthenticated(auth)) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return <ProtectedContent />;
 * }
 * ```
 */
export function isUserAuthenticated(auth: AuthContextType): boolean {
  return auth.user !== null && auth.session !== null;
}
