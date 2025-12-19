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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Text, Card, useTheme, showToast } from '@/design-system';
import { AuthError } from '@supabase/supabase-js';

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
  const { signIn, signInWithOAuth, error: authError, clearError } = useAuth();
  const { colors } = useTheme();

  // Form state
  const [email, setEmail] = useState('');
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
      showToast('Welcome back! 🎉', 'success');

      // Navigation handled automatically by auth state change in _layout.tsx
    } catch (error) {
      console.error('[LOGIN] Sign in error:', error);
      // Error is set in auth context, displayed below
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
        showToast(`Signed in with ${providerName}! 🎉`, 'success');

        // Navigation handled automatically by auth state change in _layout.tsx
      } catch (error) {
        console.error(`[LOGIN] ${provider} sign in error:`, error);
        // Error is set in auth context, displayed below
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
            <Text variant="displayLg" color="primary">Welcome Back</Text>
            <Text variant="textLg" color="secondary" className="mt-2">
              Sign in to continue your journey
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

          {/* Login Form */}
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
            <Text variant="textXs" color="muted">or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.muted }]} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthButtons}>
            {/* Sign in with Apple (iOS only) */}
            {Platform.OS === 'ios' && (
              <Button
                variant="secondary"
                size="lg"
                onPress={() => handleOAuthSignIn('apple')}
                disabled={isLoading || isOAuthLoading !== null}
                loading={isOAuthLoading === 'apple'}
                fullWidth
                style={styles.oauthButton}
                accessibilityLabel="Sign in with Apple"
              >
                {isOAuthLoading === 'apple' ? (
                  <ActivityIndicator color={colors.accent[500]} />
                ) : (
                  'Sign in with Apple'
                )}
              </Button>
            )}

            {/* Sign in with Google */}
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
});
