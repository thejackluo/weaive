/**
 * Signup Screen
 *
 * Story 0.3: Authentication Flow
 * New user registration with email/password
 *
 * Features:
 * - Email/password registration
 * - Password confirmation field
 * - Form validation:
 *   - Email format validation
 *   - Password minimum length (8 characters)
 *   - Password match validation
 * - Loading states during registration
 * - Error message display with user-friendly text
 * - Navigation to login screen
 * - Auto-redirect to tabs on successful signup (if email verification not required)
 *
 * UX Considerations:
 * - Clear error messages with specific requirements
 * - Real-time validation feedback
 * - Accessible form inputs with labels
 * - Loading indicators prevent double-submission
 * - Keyboard-aware scrolling
 * - Password visibility toggle
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Text, Card, useTheme, Checkbox } from '@/design-system';
import { AuthError } from '@supabase/supabase-js';

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
  const { signUp, error: authError, clearError } = useAuth();
  const { colors } = useTheme();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      await signUp(email, password);
      // Navigation handled automatically by auth state change in _layout.tsx
      // Note: If email verification is required, user may need to check email
    } catch (error) {
      console.error('[SIGNUP] Sign up error:', error);
      // Error is set in auth context, displayed below
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
   * Navigate to login screen
   */
  const handleNavigateToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

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
              Create Account
            </Text>
            <Text variant="textLg" color="secondary" className="mt-2">
              Start your journey with Weave
            </Text>
          </View>

          {/* Error Message */}
          {authError && (
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
              disabled={isLoading}
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
                helperText={!passwordError ? `Minimum ${MIN_PASSWORD_LENGTH} characters` : undefined}
                variant={passwordError ? 'error' : 'default'}
                size="lg"
                disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
                accessibilityLabel="Agree to Terms of Service and Privacy Policy"
              />
              <View style={styles.termsText}>
                <Text variant="textSm" color="secondary">
                  I agree to the{' '}
                </Text>
                <Pressable
                  onPress={() => router.push('/(auth)/terms-of-service')}
                  disabled={isLoading}
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
                  {' '}and{' '}
                </Text>
                <Pressable
                  onPress={() => router.push('/(auth)/privacy-policy')}
                  disabled={isLoading}
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
              disabled={isLoading || !agreedToTerms}
              loading={isLoading}
              fullWidth
              style={styles.signUpButton}
              accessibilityLabel="Create account"
              accessibilityHint="Create a new account with your email and password"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text variant="textBase" color="secondary">
              Already have an account?{' '}
            </Text>
            <Pressable
              onPress={handleNavigateToLogin}
              disabled={isLoading}
              accessibilityLabel="Navigate to login"
              accessibilityRole="button"
            >
              <Text variant="textBase" weight="semibold" className="text-accent-500">
                Log In
              </Text>
            </Pressable>
          </View>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});
