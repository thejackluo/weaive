/**
 * Signup Screen
 *
 * Story 0.3: Authentication Flow
 * New user registration with email/password or OAuth (Apple, Google)
 *
 * Features:
 * - Email/password registration
 * - OAuth sign up (Apple on iOS, Google)
 * - Password strength indicator
 * - Password confirmation field
 * - Terms of Service & Privacy Policy agreement
 * - Form validation:
 *   - Email format validation
 *   - Password minimum length (8 characters)
 *   - Password match validation
 *   - Terms acceptance required
 * - Loading states during registration
 * - Error message display with user-friendly text
 * - Navigation to login screen, Terms, and Privacy screens
 * - Auto-redirect to tabs on successful signup (if email verification not required)
 *
 * UX Considerations:
 * - Clear error messages with specific requirements
 * - Real-time validation feedback
 * - Accessible form inputs with labels
 * - Loading indicators prevent double-submission
 * - Keyboard-aware scrolling
 * - Password visibility toggle
 * - OAuth buttons disabled during email/password flow (and vice versa)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Text as RNText, TextInput, TouchableOpacity } from 'react-native';
import { AuthError } from '@supabase/supabase-js';
import { navigateAfterAuth, getAuthErrorMessage } from '@lib/authHelpers';
import { supabase } from '@lib/supabase';

/**
 * Email validation regex
 * Validates basic email format: user@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation constants
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Signup Screen Component
 */
export default function SignupScreen() {
  const router = useRouter();
  const { user, signUp, signOut, signInWithOAuth, error: authError, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'apple' | 'google' | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [accountExists, setAccountExists] = useState(false);

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
    if (value.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return false;
    }
    setPasswordError('');
    return true;
  }, []);

  /**
   * Validate password confirmation
   */
  const validateConfirmPassword = useCallback(
    (value: string): boolean => {
      if (!value) {
        setConfirmPasswordError('Please confirm your password');
        return false;
      }
      if (value !== password) {
        setConfirmPasswordError('Passwords do not match');
        return false;
      }
      setConfirmPasswordError('');
      return true;
    },
    [password]
  );

  /**
   * Calculate password strength
   * Returns: { score: 0-3, label: 'Weak'|'Medium'|'Strong', color: string }
   */
  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, label: '', color: 'rgba(255, 255, 255, 0.4)', progress: 0 };
    }

    let score = 0;
    const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calculate score
    if (hasMinLength) score++;
    if (hasLowerCase && hasUpperCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    // Determine label and color
    if (score <= 1) {
      return {
        score,
        label: 'Weak',
        color: '#f43f5e',
        progress: 0.33,
      };
    } else if (score === 2) {
      return {
        score,
        label: 'Medium',
        color: '#3b82f6',
        progress: 0.66,
      };
    } else {
      return {
        score,
        label: 'Strong',
        color: '#10b981',
        progress: 1,
      };
    }
  }, [password]);

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
      // Re-validate confirm password if it has a value
      if (confirmPassword && confirmPasswordError) {
        validateConfirmPassword(confirmPassword);
      }
      clearError();
    },
    [
      passwordError,
      confirmPassword,
      confirmPasswordError,
      validatePassword,
      validateConfirmPassword,
      clearError,
    ]
  );

  /**
   * Handle confirm password change
   */
  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      if (confirmPasswordError) {
        // Re-validate if there was an error
        validateConfirmPassword(value);
      }
      clearError();
    },
    [confirmPasswordError, validateConfirmPassword, clearError]
  );

  /**
   * Handle sign up
   */
  const handleSignUp = useCallback(async () => {
    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    // Check Terms agreement
    if (!agreedToTerms) {
      Alert.alert(
        'Terms Required',
        'You must agree to the Terms of Service and Privacy Policy to create an account.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setAccountExists(false); // Reset account exists state
      await signUp(email, password);

      // Show success toast
      // showSimpleToast('Account created successfully! 🎉', 'success');

      // Get user ID and navigate appropriately
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await navigateAfterAuth(user.id, false);
      }

      // Note: If email verification is required, user may need to check email
    } catch (error: any) {
      console.error('[SIGNUP] Sign up error:', error);

      // Check if account already exists
      if (error.message === 'User already registered') {
        setAccountExists(true);
        // showSimpleToast('Account already exists. Please sign in instead.', 'error');
        // Don't re-throw, let user see the UI
        return;
      }

      // For other errors, show generic error message
      // showSimpleToast(getAuthErrorMessage(error), 'error');
      // Error is also set in auth context, displayed below
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    confirmPassword,
    agreedToTerms,
    signUp,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  ]);

  /**
   * Handle OAuth sign in
   * Note: OAuth automatically creates account if user doesn't exist
   */
  const handleOAuthSignIn = useCallback(
    async (provider: 'apple' | 'google') => {
      try {
        setIsOAuthLoading(provider);
        setAccountExists(false); // Reset account exists state
        await signInWithOAuth(provider);

        // Show success toast
        const providerName = provider === 'apple' ? 'Apple' : 'Google';
        // showSimpleToast(`Signed up with ${providerName}! 🎉`, 'success');

        // Get user ID and navigate appropriately
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await navigateAfterAuth(user.id, false);
        }
      } catch (error: any) {
        console.error(`[SIGNUP] ${provider} sign in error:`, error);
        const providerName = provider === 'apple' ? 'Apple' : 'Google';
        // showSimpleToast(`Failed to sign up with ${providerName}. Please try again.`, 'error');
        // Error is also set in auth context, displayed in error card below
      } finally {
        setIsOAuthLoading(null);
      }
    },
    [signInWithOAuth]
  );

  /**
   * Navigate to login screen
   */
  const handleNavigateToLogin = useCallback(() => {
    router.push('/(auth)/login');
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
      console.error('[SIGNUP] Continue navigation error:', error);
      // showSimpleToast('Navigation failed. Please try again.', 'error');
    } finally {
      setIsContinuing(false);
    }
  }, [user]);

  /**
   * Handle Sign Out when already signed in
   */
  const handleSignOutAction = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on signup screen after sign out
    } catch (error: any) {
      console.error('[SIGNUP] Sign out error:', error);
      // showSimpleToast('Failed to sign out. Please try again.', 'error');
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
      case 'User already registered':
        return 'An account with this email already exists. Please sign in.';
      case 'Password should be at least 8 characters':
        return 'Password must be at least 8 characters long.';
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: '#0a0a0a' }]}
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
            <RNText style={{ fontSize: 36, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>
              {user ? 'Already Signed In' : 'Create Account'}
            </RNText>
            <RNText style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', marginTop: 8 }}>
              {user ? 'You are currently signed in' : 'Start your journey with Weave'}
            </RNText>
          </View>

          {/* Already Signed In Card */}
          {user && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderLeftWidth: 4,
                  borderLeftColor: '#3b82f6',
                  borderRadius: 8,
                  padding: 20,
                  gap: 16,
                }}
              >
                <View style={{ gap: 8 }}>
                  <RNText style={{ fontSize: 18, fontWeight: '700', color: '#3b82f6' }}>
                    ✅ You're Already Signed In
                  </RNText>
                  <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Signed in as <RNText style={{ fontWeight: '600' }}>{user.email}</RNText>
                  </RNText>
                  <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4 }}>
                    You can continue to your account or sign out to use a different account.
                  </RNText>
                </View>

                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#3b82f6',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: (isContinuing || isSigningOut) ? 0.5 : 1,
                    }}
                    onPress={handleContinue}
                    disabled={isContinuing || isSigningOut}
                  >
                    {isContinuing ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                        Continue to App
                      </RNText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      opacity: (isContinuing || isSigningOut) ? 0.5 : 1,
                    }}
                    onPress={handleSignOutAction}
                    disabled={isContinuing || isSigningOut}
                  >
                    {isSigningOut ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                        Sign Out
                      </RNText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Account Already Exists Card */}
          {accountExists && !user && (
            <View
              style={{
                ...styles.errorCard,
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderLeftWidth: 4,
                borderLeftColor: '#3b82f6',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <RNText style={{ fontSize: 18, fontWeight: '700', color: '#3b82f6' }}>
                    Account Already Exists
                  </RNText>
                  <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
                    An account with <RNText style={{ fontWeight: '600' }}>{email}</RNText> already exists. Please
                    sign in instead.
                  </RNText>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    router.push({
                      pathname: '/(auth)/login' as any,
                      params: { email },
                    });
                  }}
                >
                  <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    Sign In Instead
                  </RNText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Signup Form - Only show if not signed in */}
          {!user && (
            <>
              {/* Error Message */}
              {authError && !accountExists && (
                <View
                  style={{
                    ...styles.errorCard,
                    backgroundColor: 'rgba(244, 63, 94, 0.08)',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <RNText style={{ color: '#f43f5e', fontSize: 14 }}>{getErrorMessage(authError)}</RNText>
                </View>
              )}

              {/* Signup Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View>
                  <RNText style={{ fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 8 }}>
                    Email
                  </RNText>
                  <TextInput
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: emailError ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: '#ffffff',
                    }}
                    placeholder="your.email@example.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!isLoading && isOAuthLoading === null}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your email address"
                  />
                  {emailError ? (
                    <RNText style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                      {emailError}
                    </RNText>
                  ) : null}
                </View>

                {/* Password Input */}
                <View>
                  <RNText style={{ fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 8 }}>
                    Password
                  </RNText>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: passwordError ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        paddingRight: 60,
                        fontSize: 16,
                        color: '#ffffff',
                      }}
                      placeholder="Create a password (min 8 characters)"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoCorrect={false}
                      editable={!isLoading && isOAuthLoading === null}
                      accessibilityLabel="Password"
                      accessibilityHint={`Enter a password with at least ${MIN_PASSWORD_LENGTH} characters`}
                    />
                    <Pressable
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
                        {showPassword ? 'Hide' : 'Show'}
                      </RNText>
                    </Pressable>
                  </View>
                  {passwordError ? (
                    <RNText style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                      {passwordError}
                    </RNText>
                  ) : (
                    <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginTop: 6 }}>
                      Minimum {MIN_PASSWORD_LENGTH} characters
                    </RNText>
                  )}

                  {/* Password Strength Indicator */}
                  {password && !passwordError && (
                    <View style={styles.passwordStrength} accessibilityLiveRegion="polite">
                      {/* Progress Bar */}
                      <View style={styles.strengthBarContainer}>
                        <View
                          style={[
                            styles.strengthBar,
                            {
                              width: `${passwordStrength.progress * 100}%`,
                              backgroundColor: passwordStrength.color,
                            },
                          ]}
                        />
                      </View>

                      {/* Strength Label */}
                      <RNText
                        style={{ fontSize: 12, color: passwordStrength.color }}
                        accessibilityLabel={`Password strength: ${passwordStrength.label}`}
                      >
                        {passwordStrength.label}
                      </RNText>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View>
                  <RNText style={{ fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 8 }}>
                    Confirm Password
                  </RNText>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: confirmPasswordError ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        paddingRight: 60,
                        fontSize: 16,
                        color: '#ffffff',
                      }}
                      placeholder="Re-enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={confirmPassword}
                      onChangeText={handleConfirmPasswordChange}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoCorrect={false}
                      editable={!isLoading && isOAuthLoading === null}
                      accessibilityLabel="Confirm password"
                      accessibilityHint="Re-enter your password to confirm"
                    />
                    <Pressable
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </RNText>
                    </Pressable>
                  </View>
                  {confirmPasswordError ? (
                    <RNText style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                      {confirmPasswordError}
                    </RNText>
                  ) : null}
                </View>

                {/* Terms & Privacy Agreement */}
                <View style={styles.termsCheckbox}>
                  <Pressable
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    disabled={isLoading || isOAuthLoading !== null}
                    accessibilityLabel="Agree to Terms of Service and Privacy Policy"
                    accessibilityRole="checkbox"
                    style={{
                      width: 24,
                      height: 24,
                      borderWidth: 2,
                      borderColor: agreedToTerms ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: agreedToTerms ? '#3b82f6' : 'transparent',
                      borderRadius: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {agreedToTerms && (
                      <RNText style={{ color: '#ffffff', fontSize: 16 }}>✓</RNText>
                    )}
                  </Pressable>
                  <View style={styles.termsText}>
                    <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>
                      I agree to the{' '}
                    </RNText>
                    <Pressable
                      onPress={() => router.push('/(auth)/terms-of-service')}
                      disabled={isLoading || isOAuthLoading !== null}
                      accessibilityLabel="Read Terms of Service"
                      accessibilityRole="link"
                    >
                      <RNText style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>
                        Terms of Service
                      </RNText>
                    </Pressable>
                    <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>
                      {' '}
                      and{' '}
                    </RNText>
                    <Pressable
                      onPress={() => router.push('/(auth)/privacy-policy')}
                      disabled={isLoading || isOAuthLoading !== null}
                      accessibilityLabel="Read Privacy Policy"
                      accessibilityRole="link"
                    >
                      <RNText style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>
                        Privacy Policy
                      </RNText>
                    </Pressable>
                  </View>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 8,
                    opacity: (isLoading || !agreedToTerms || isOAuthLoading !== null) ? 0.5 : 1,
                  }}
                  onPress={handleSignUp}
                  disabled={isLoading || !agreedToTerms || isOAuthLoading !== null}
                  accessibilityLabel="Create account"
                  accessibilityHint="Create a new account with your email and password"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Create Account
                    </RNText>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', marginHorizontal: 16 }}>
                  or continue with
                </RNText>
                <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthButtons}>
                {/* Sign up with Google - Fully Functional */}
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    opacity: (isLoading || isOAuthLoading !== null) ? 0.5 : 1,
                  }}
                  onPress={() => handleOAuthSignIn('google')}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Sign up with Google"
                >
                  {isOAuthLoading === 'google' ? (
                    <ActivityIndicator color="#3b82f6" />
                  ) : (
                    <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign up with Google
                    </RNText>
                  )}
                </TouchableOpacity>

                {/* Sign up with Apple - Disabled (requires Apple Developer Program) */}
                {Platform.OS === 'ios' && (
                  <View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        opacity: 0.5,
                      }}
                      disabled={true}
                      accessibilityLabel="Sign up with Apple (currently disabled)"
                      accessibilityHint="Apple Sign-In requires Apple Developer Program membership"
                    >
                      <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                        Sign up with Apple (Coming Soon)
                      </RNText>
                    </TouchableOpacity>
                    <RNText style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', marginTop: 4 }}>
                      Requires Apple Developer Program
                    </RNText>
                  </View>
                )}
              </View>

              {/* Login Link */}
              <View style={styles.footer}>
                <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Already have an account?{' '}
                </RNText>
                <Pressable
                  onPress={handleNavigateToLogin}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Navigate to login"
                  accessibilityRole="button"
                >
                  <RNText style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6' }}>
                    Log In
                  </RNText>
                </Pressable>
              </View>
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
  errorCard: {
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  passwordStrength: {
    marginTop: 8,
    gap: 6,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  termsText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  signUpButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  oauthButtons: {
    gap: 12,
    marginBottom: 24,
  },
  oauthButton: {
    marginBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});
