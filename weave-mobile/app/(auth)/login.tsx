/**
 * Login Screen
 *
 * Story 0.3: Authentication Flow
 * Email/password login with OAuth options (Apple, Google)
 *
 * Features:
 * - Email/password authentication
 * - OAuth sign-in (Apple on iOS, Google)
 * - Form validation (email format, required fields)
 * - Loading states during authentication
 * - Error message display with user-friendly text
 * - Navigation to signup screen
 * - Auto-redirect to tabs on successful login
 *
 * UX Considerations:
 * - Clear error messages
 * - Accessible form inputs with labels
 * - Loading indicators prevent double-submission
 * - Keyboard-aware scrolling
 * - Platform-specific OAuth buttons (Apple only on iOS)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Text, useTheme, showSimpleToast } from '@/design-system';
import { AuthError } from '@supabase/supabase-js';
import { navigateAfterAuth, getAuthErrorMessage, bypassAuthForDev } from '@lib/authHelpers';
import { supabase } from '@lib/supabase';

/**
 * Email validation regex
 * Validates basic email format: user@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login Screen Component
 */
export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, signIn, signOut, signInWithOAuth, error: authError, clearError } = useAuth();
  const { colors } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  // Debug: Log auth error state
  React.useEffect(() => {
    console.log(
      '[LOGIN_SCREEN] Auth error state changed:',
      authError
        ? {
            message: authError.message,
            code: (authError as any).code,
            status: authError.status,
          }
        : 'null'
    );
  }, [authError]);

  // Form state - pre-fill email from params if provided (e.g., from signup screen)
  const [email, setEmail] = useState((params.email as string) || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'apple' | 'google' | null>(null);

  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validate email format
   */
  const validateEmail = useCallback((value: string): boolean => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }, []);

  /**
   * Validate password
   */
  const validatePassword = useCallback((value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  }, []);

  /**
   * Handle email change
   */
  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      if (emailError) {
        // Re-validate if there was an error
        validateEmail(value);
      }
      clearError();
    },
    [emailError, validateEmail, clearError]
  );

  /**
   * Handle password change
   */
  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (passwordError) {
        // Re-validate if there was an error
        validatePassword(value);
      }
      clearError();
    },
    [passwordError, validatePassword, clearError]
  );

  /**
   * Handle sign in
   */
  const handleSignIn = useCallback(async () => {
    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);

      // Show success toast
      console.log('[LOGIN] Sign in successful, calling showSimpleToast...');
      showSimpleToast('Welcome back! 🎉', 'success');

      // Get user ID and navigate appropriately based on onboarding status
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await navigateAfterAuth(user.id, false);
      }
    } catch (error: any) {
      console.error('[LOGIN] Sign in error:', error);
      console.log('[LOGIN] Calling showSimpleToast for error...');
      showSimpleToast(getAuthErrorMessage(error), 'error');
      // Error is also set in auth context, displayed in error card below
    } finally {
      setIsLoading(false);
    }
  }, [email, password, signIn, validateEmail, validatePassword]);

  /**
   * Handle OAuth sign in
   */
  const handleOAuthSignIn = useCallback(
    async (provider: 'apple' | 'google') => {
      try {
        setIsOAuthLoading(provider);
        await signInWithOAuth(provider);

        // Show success toast
        const providerName = provider === 'apple' ? 'Apple' : 'Google';
        showSimpleToast(`Signed in with ${providerName}! 🎉`, 'success');

        // Get user ID and navigate appropriately based on onboarding status
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await navigateAfterAuth(user.id, false);
        }
      } catch (error: any) {
        console.error(`[LOGIN] ${provider} sign in error:`, error);
        const providerName = provider === 'apple' ? 'Apple' : 'Google';
        showSimpleToast(`Failed to sign in with ${providerName}. Please try again.`, 'error');
        // Error is also set in auth context, displayed in error card below
      } finally {
        setIsOAuthLoading(null);
      }
    },
    [signInWithOAuth]
  );

  /**
   * Navigate to signup screen
   */
  const handleNavigateToSignup = useCallback(() => {
    router.push('/(auth)/signup');
  }, [router]);

  /**
   * Handle Continue when already signed in
   * Navigates to appropriate screen based on onboarding status
   */
  const handleContinue = useCallback(async () => {
    if (!user) return;

    try {
      setIsContinuing(true);
      await navigateAfterAuth(user.id, false);
    } catch (error) {
      console.error('[LOGIN] Continue navigation error:', error);
      showSimpleToast('Navigation failed. Please try again.', 'error');
    } finally {
      setIsContinuing(false);
    }
  }, [user]);

  /**
   * Handle Sign Out when already signed in
   */
  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on login screen after sign out
    } catch (error: any) {
      console.error('[LOGIN] Sign out error:', error);
      showSimpleToast('Failed to sign out. Please try again.', 'error');
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (error: AuthError | null): string => {
    if (!error) return '';

    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please verify your email address before signing in.';
      case 'Too many requests':
        return 'Too many login attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displayLg" color="primary">
              {user ? 'Already Signed In' : 'Welcome Back'}
            </Text>
            <Text variant="textLg" color="secondary" className="mt-2">
              {user ? 'You are currently signed in' : 'Sign in to continue your journey'}
            </Text>
          </View>

          {/* Already Signed In Card */}
          {user && (
            <View style={styles.alreadySignedInCard}>
              <View
                style={{
                  backgroundColor: `${colors.accent[500]}15`,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.accent[500],
                  borderRadius: 8,
                  padding: 20,
                  gap: 16,
                }}
              >
                <View style={{ gap: 8 }}>
                  <Text variant="textLg" weight="bold" style={{ color: colors.accent[500] }}>
                    ✅ You're Already Signed In
                  </Text>
                  <Text variant="textBase" color="secondary">
                    Signed in as <Text weight="semibold">{user.email}</Text>
                  </Text>
                  <Text variant="textSm" color="muted" style={{ marginTop: 4 }}>
                    You can continue to your account or sign out to use a different account.
                  </Text>
                </View>

                <View style={{ gap: 12 }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleContinue}
                    loading={isContinuing}
                    disabled={isContinuing || isSigningOut}
                    fullWidth
                  >
                    {isContinuing ? 'Loading...' : 'Continue to App'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    onPress={handleSignOut}
                    loading={isSigningOut}
                    disabled={isContinuing || isSigningOut}
                    fullWidth
                  >
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </Button>
                </View>
              </View>
            </View>
          )}

          {/* Error Message - Only show if not already signed in */}
          {authError && !user && (
            <View style={styles.errorCard}>
              <View
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderLeftWidth: 4,
                  borderLeftColor: '#EF4444',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <RNText
                  style={{
                    color: '#EF4444',
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  {getErrorMessage(authError)}
                </RNText>
              </View>
            </View>
          )}

          {/* Login Form - Only show if not signed in */}
          {!user && (
            <>
              <View style={styles.form}>
                {/* Email Input */}
                <Input
                  label="Email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  errorText={emailError}
                  variant={emailError ? 'error' : 'default'}
                  size="lg"
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address"
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  errorText={passwordError}
                  variant={passwordError ? 'error' : 'default'}
                  size="lg"
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <Text variant="textXs" color="muted">
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  }
                />

                {/* Sign In Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSignIn}
                  disabled={isLoading || isOAuthLoading !== null}
                  loading={isLoading}
                  fullWidth
                  style={styles.signInButton}
                  accessibilityLabel="Sign in"
                  accessibilityHint="Sign in with your email and password"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border.muted }]} />
                <Text variant="textXs" color="muted">
                  or continue with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border.muted }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthButtons}>
                {/* Sign in with Google - Fully Functional */}
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => handleOAuthSignIn('google')}
                  disabled={isLoading || isOAuthLoading !== null}
                  loading={isOAuthLoading === 'google'}
                  fullWidth
                  style={styles.oauthButton}
                  accessibilityLabel="Sign in with Google"
                >
                  {isOAuthLoading === 'google' ? (
                    <ActivityIndicator color={colors.accent[500]} />
                  ) : (
                    'Sign in with Google'
                  )}
                </Button>

                {/* Sign in with Apple - Disabled (requires Apple Developer Program) */}
                {Platform.OS === 'ios' && (
                  <View>
                    <Button
                      variant="secondary"
                      size="lg"
                      onPress={() => {}}
                      disabled={true}
                      fullWidth
                      style={[styles.oauthButton, { opacity: 0.5 }]}
                      accessibilityLabel="Sign in with Apple (currently disabled)"
                      accessibilityHint="Apple Sign-In requires Apple Developer Program membership"
                    >
                      Sign in with Apple (Coming Soon)
                    </Button>
                    <Text
                      variant="textXs"
                      color="muted"
                      style={{ textAlign: 'center', marginTop: 4 }}
                    >
                      Requires Apple Developer Program
                    </Text>
                  </View>
                )}
              </View>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text variant="textBase" color="secondary">
                  Don't have an account?{' '}
                </Text>
                <Pressable
                  onPress={handleNavigateToSignup}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Navigate to sign up"
                  accessibilityRole="button"
                  style={{ opacity: isLoading || isOAuthLoading !== null ? 0.5 : 1 }}
                >
                  <Text variant="textBase" weight="semibold" className="text-accent-500">
                    Sign Up
                  </Text>
                </Pressable>
              </View>

              {/* Development Bypass Button - Only in DEV mode */}
              {__DEV__ && (
                <View style={styles.devBypass}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => bypassAuthForDev()}
                    disabled={isLoading || isOAuthLoading !== null}
                    accessibilityLabel="Development bypass"
                    style={{ opacity: 0.6 }}
                  >
                    🔧 Skip Auth (Dev Only)
                  </Button>
                  <Text
                    variant="textXs"
                    color="muted"
                    style={{ textAlign: 'center', marginTop: 4 }}
                  >
                    Development mode only - bypasses authentication
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
  },
  alreadySignedInCard: {
    marginBottom: 24,
  },
  errorCard: {
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  signInButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  oauthButtons: {
    gap: 12,
  },
  oauthButton: {
    // Additional styles if needed
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  devBypass: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
});
