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
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
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
      // showSimpleToast('Welcome back! 🎉', 'success');

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
      // showSimpleToast(getAuthErrorMessage(error), 'error');
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
        // showSimpleToast(`Signed in with ${providerName}! 🎉`, 'success');

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
        // showSimpleToast(`Failed to sign in with ${providerName}. Please try again.`, 'error');
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
      // showSimpleToast('Navigation failed. Please try again.', 'error');
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
      // showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on login screen after sign out
    } catch (error: any) {
      console.error('[LOGIN] Sign out error:', error);
      // showSimpleToast('Failed to sign out. Please try again.', 'error');
    } finally{
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
      style={[styles.container, { backgroundColor: '#000000' }]}
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
            <RNText style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold' }}>
              {user ? 'Already Signed In' : 'Welcome Back'}
            </RNText>
            <RNText style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18, marginTop: 8 }}>
              {user ? 'You are currently signed in' : 'Sign in to continue your journey'}
            </RNText>
          </View>

          {/* Already Signed In Card */}
          {user && (
            <View style={styles.alreadySignedInCard}>
              <View
                style={{
                  backgroundColor: 'rgba(59, 114, 246, 0.15)',
                  borderLeftWidth: 4,
                  borderLeftColor: '#3b82f6',
                  borderRadius: 8,
                  padding: 20,
                  gap: 16,
                }}
              >
                <View style={{ gap: 8 }}>
                  <RNText style={{ fontSize: 18, fontWeight: 'bold', color: '#3b82f6' }}>
                    ✅ You're Already Signed In
                  </RNText>
                  <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Signed in as <RNText style={{ fontWeight: '600' }}>{user.email}</RNText>
                  </RNText>
                  <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', marginTop: 4 }}>
                    You can continue to your account or sign out to use a different account.
                  </RNText>
                </View>

                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleContinue}
                    disabled={isContinuing || isSigningOut}
                    style={{
                      backgroundColor: '#3b82f6',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isContinuing || isSigningOut ? 0.5 : 1,
                    }}
                  >
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      {isContinuing ? 'Loading...' : 'Continue to App'}
                    </RNText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSignOut}
                    disabled={isContinuing || isSigningOut}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isContinuing || isSigningOut ? 0.5 : 1,
                    }}
                  >
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </RNText>
                  </TouchableOpacity>
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
                <View>
                  <RNText style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Email</RNText>
                  <TextInput
                    placeholder="your.email@example.com"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!(isLoading || isOAuthLoading !== null)}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your email address"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: emailError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: '#ffffff',
                    }}
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                  {emailError ? <RNText style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{emailError}</RNText> : null}
                </View>

                {/* Password Input */}
                <View>
                  <RNText style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Password</RNText>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect={false}
                      editable={!(isLoading || isOAuthLoading !== null)}
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your password"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: passwordError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        paddingRight: 60,
                        fontSize: 16,
                        color: '#ffffff',
                      }}
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                      style={{ position: 'absolute', right: 16, top: 14 }}
                    >
                      <RNText style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                        {showPassword ? 'Hide' : 'Show'}
                      </RNText>
                    </Pressable>
                  </View>
                  {passwordError ? <RNText style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{passwordError}</RNText> : null}
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Sign in"
                  accessibilityHint="Sign in with your email and password"
                  style={[
                    styles.signInButton,
                    {
                      backgroundColor: '#3b82f6',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isLoading || isOAuthLoading !== null ? 0.5 : 1,
                    },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign In
                    </RNText>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
                  or continue with
                </RNText>
                <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthButtons}>
                {/* Sign in with Google - Fully Functional */}
                <TouchableOpacity
                  onPress={() => handleOAuthSignIn('google')}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Sign in with Google"
                  style={[
                    styles.oauthButton,
                    {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isLoading || isOAuthLoading !== null ? 0.5 : 1,
                    },
                  ]}
                >
                  {isOAuthLoading === 'google' ? (
                    <ActivityIndicator color="#3b82f6" />
                  ) : (
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign in with Google
                    </RNText>
                  )}
                </TouchableOpacity>

                {/* Sign in with Apple - Disabled (requires Apple Developer Program) */}
                {Platform.OS === 'ios' && (
                  <View>
                    <TouchableOpacity
                      onPress={() => {}}
                      disabled={true}
                      accessibilityLabel="Sign in with Apple (currently disabled)"
                      accessibilityHint="Apple Sign-In requires Apple Developer Program membership"
                      style={[
                        styles.oauthButton,
                        {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          paddingVertical: 16,
                          paddingHorizontal: 24,
                          borderRadius: 12,
                          alignItems: 'center',
                          opacity: 0.5,
                        },
                      ]}
                    >
                      <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                        Sign in with Apple (Coming Soon)
                      </RNText>
                    </TouchableOpacity>
                    <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: 4 }}>
                      Requires Apple Developer Program
                    </RNText>
                  </View>
                )}
              </View>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Don't have an account?{' '}
                </RNText>
                <Pressable
                  onPress={handleNavigateToSignup}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Navigate to sign up"
                  accessibilityRole="button"
                  style={{ opacity: isLoading || isOAuthLoading !== null ? 0.5 : 1 }}
                >
                  <RNText style={{ fontSize: 16, color: '#3b82f6', fontWeight: '600' }}>
                    Sign Up
                  </RNText>
                </Pressable>
              </View>

              {/* Development Bypass Button - Only in DEV mode */}
              {__DEV__ && (
                <View style={styles.devBypass}>
                  <TouchableOpacity
                    onPress={() => bypassAuthForDev()}
                    disabled={isLoading || isOAuthLoading !== null}
                    accessibilityLabel="Development bypass"
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                      opacity: 0.6,
                    }}
                  >
                    <RNText style={{ color: '#ffffff', fontSize: 14 }}>
                      🔧 Skip Auth (Dev Only)
                    </RNText>
                  </TouchableOpacity>
                  <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: 4 }}>
                    Development mode only - bypasses authentication
                  </RNText>
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
