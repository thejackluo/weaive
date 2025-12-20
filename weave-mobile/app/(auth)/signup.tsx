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
import { Button, Input, Text, Card, useTheme, Checkbox, showSimpleToast } from '@/design-system';
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
  const { colors } = useTheme();

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
      return { score: 0, label: '', color: colors.text.muted, progress: 0 };
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
        color: colors.rose[500],
        progress: 0.33,
      };
    } else if (score === 2) {
      return {
        score,
        label: 'Medium',
        color: colors.accent[500],
        progress: 0.66,
      };
    } else {
      return {
        score,
        label: 'Strong',
        color: colors.emerald[500],
        progress: 1,
      };
    }
  }, [password, colors]);

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
      showSimpleToast('Account created successfully! 🎉', 'success');

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
        showSimpleToast('Account already exists. Please sign in instead.', 'error');
        // Don't re-throw, let user see the UI
        return;
      }

      // For other errors, show generic error message
      showSimpleToast(getAuthErrorMessage(error), 'error');
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
        showSimpleToast(`Signed up with ${providerName}! 🎉`, 'success');

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
        showSimpleToast(`Failed to sign up with ${providerName}. Please try again.`, 'error');
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
      showSimpleToast('Navigation failed. Please try again.', 'error');
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
      showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on signup screen after sign out
    } catch (error: any) {
      console.error('[SIGNUP] Sign out error:', error);
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
              {user ? 'Already Signed In' : 'Create Account'}
            </Text>
            <Text variant="textLg" color="secondary" className="mt-2">
              {user ? 'You are currently signed in' : 'Start your journey with Weave'}
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
                    onPress={handleSignOutAction}
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

          {/* Account Already Exists Card */}
          {accountExists && !user && (
            <Card
              variant="glass"
              padding="default"
              style={{
                ...styles.errorCard,
                backgroundColor: `${colors.accent[500]}15`,
                borderLeftWidth: 4,
                borderLeftColor: colors.accent[500],
              }}
            >
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <Text variant="textLg" weight="bold" style={{ color: colors.accent[500] }}>
                    Account Already Exists
                  </Text>
                  <Text variant="textBase" color="secondary">
                    An account with <Text weight="semibold">{email}</Text> already exists. Please
                    sign in instead.
                  </Text>
                </View>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    router.push({
                      pathname: '/(auth)/login' as any,
                      params: { email },
                    });
                  }}
                  fullWidth
                >
                  Sign In Instead
                </Button>
              </View>
            </Card>
          )}

          {/* Signup Form - Only show if not signed in */}
          {!user && (
            <>
              {/* Error Message */}
              {authError && !accountExists && (
                <Card
                  variant="glass"
                  padding="default"
                  style={{ ...styles.errorCard, backgroundColor: `${colors.rose[500]}15` }}
                >
                  <Text color="error">{getErrorMessage(authError)}</Text>
                </Card>
              )}

              {/* Signup Form */}
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
                <View>
                  <Input
                    label="Password"
                    placeholder="Create a password (min 8 characters)"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    autoCorrect={false}
                    errorText={passwordError}
                    helperText={
                      !passwordError ? `Minimum ${MIN_PASSWORD_LENGTH} characters` : undefined
                    }
                    variant={passwordError ? 'error' : 'default'}
                    size="lg"
                    disabled={isLoading || isOAuthLoading !== null}
                    accessibilityLabel="Password"
                    accessibilityHint={`Enter a password with at least ${MIN_PASSWORD_LENGTH} characters`}
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
                      <Text
                        variant="textXs"
                        style={{ color: passwordStrength.color }}
                        accessibilityLabel={`Password strength: ${passwordStrength.label}`}
                      >
                        {passwordStrength.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  autoCorrect={false}
                  errorText={confirmPasswordError}
                  variant={confirmPasswordError ? 'error' : 'default'}
                  size="lg"
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Confirm password"
                  accessibilityHint="Re-enter your password to confirm"
                  rightIcon={
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <Text variant="textXs" color="muted">
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  }
                />

                {/* Terms & Privacy Agreement */}
                <View style={styles.termsCheckbox}>
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={setAgreedToTerms}
                    disabled={isLoading || isOAuthLoading !== null}
                    accessibilityLabel="Agree to Terms of Service and Privacy Policy"
                  />
                  <View style={styles.termsText}>
                    <Text variant="textSm" color="secondary">
                      I agree to the{' '}
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(auth)/terms-of-service')}
                      disabled={isLoading || isOAuthLoading !== null}
                      accessibilityLabel="Read Terms of Service"
                      accessibilityRole="link"
                    >
                      <Text
                        variant="textSm"
                        weight="semibold"
                        style={{ color: colors.accent[500] }}
                      >
                        Terms of Service
                      </Text>
                    </Pressable>
                    <Text variant="textSm" color="secondary">
                      {' '}
                      and{' '}
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(auth)/privacy-policy')}
                      disabled={isLoading || isOAuthLoading !== null}
                      accessibilityLabel="Read Privacy Policy"
                      accessibilityRole="link"
                    >
                      <Text
                        variant="textSm"
                        weight="semibold"
                        style={{ color: colors.accent[500] }}
                      >
                        Privacy Policy
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Create Account Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSignUp}
                  disabled={isLoading || !agreedToTerms || isOAuthLoading !== null}
                  loading={isLoading}
                  fullWidth
                  style={styles.signUpButton}
                  accessibilityLabel="Create account"
                  accessibilityHint="Create a new account with your email and password"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border.muted }]} />
                <Text variant="textSm" color="muted" style={styles.dividerText}>
                  or continue with
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border.muted }]} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthButtons}>
                {/* Sign up with Google - Fully Functional */}
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => handleOAuthSignIn('google')}
                  disabled={isLoading || isOAuthLoading !== null}
                  loading={isOAuthLoading === 'google'}
                  fullWidth
                  style={styles.oauthButton}
                  accessibilityLabel="Sign up with Google"
                >
                  {isOAuthLoading === 'google' ? (
                    <ActivityIndicator color={colors.accent[500]} />
                  ) : (
                    'Sign up with Google'
                  )}
                </Button>

                {/* Sign up with Apple - Disabled (requires Apple Developer Program) */}
                {Platform.OS === 'ios' && (
                  <View>
                    <Button
                      variant="secondary"
                      size="lg"
                      onPress={() => {}}
                      disabled={true}
                      fullWidth
                      style={[styles.oauthButton, { opacity: 0.5 }]}
                      accessibilityLabel="Sign up with Apple (currently disabled)"
                      accessibilityHint="Apple Sign-In requires Apple Developer Program membership"
                    >
                      Sign up with Apple (Coming Soon)
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

              {/* Login Link */}
              <View style={styles.footer}>
                <Text variant="textBase" color="secondary">
                  Already have an account?{' '}
                </Text>
                <Pressable
                  onPress={handleNavigateToLogin}
                  disabled={isLoading || isOAuthLoading !== null}
                  accessibilityLabel="Navigate to login"
                  accessibilityRole="button"
                >
                  <Text variant="textBase" weight="semibold" className="text-accent-500">
                    Log In
                  </Text>
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
    transition: 'width 0.3s ease',
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
