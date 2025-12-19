/**
 * Authentication Screen
 *
 * Story 1.5: User Authentication
 * PRD US-1.5: OAuth Authentication Flow
 *
 * Features:
 * - Apple Sign In (iOS native button styling)
 * - Google Sign In
 * - Email Sign In
 * - Trial messaging: "7-day free trial. No commitment."
 * - Loading states during authentication
 * - Error handling with user-friendly messages
 *
 * FRONT-END ONLY: Backend integration (user profile creation, analytics)
 * deferred to Story 0-4.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// TODO: Uncomment when Supabase client is configured
// import { supabase } from '@/lib/supabase';
// import { signInWithApple, signInWithGoogle, signInWithEmail } from '@/lib/auth';

// =============================================================================
// TYPES
// =============================================================================

type AuthProvider = 'apple' | 'google' | 'email';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AuthenticationScreen() {
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for reduced motion preference (accessibility)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  // =============================================================================
  // AUTH HANDLERS
  // =============================================================================

  /**
   * Handle Apple Sign In
   * AC #3: <3 seconds auth completion
   * AC #4: DEFERRED - User profile creation in Story 0-4
   */
  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('apple');
      setError(null);

      // TODO: Implement Supabase Apple Sign In (Story 0-4)
      // const { data, error } = await supabase.auth.signInWithOAuth({
      //   provider: 'apple',
      //   options: {
      //     redirectTo: 'weavelight://auth/callback',
      //     scopes: 'email name',
      //   },
      // });
      //
      // if (error) throw error;

      // TEMPORARY: Simulate auth for front-end testing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success: Navigate to Story 1.6 (Identity Traits Selection)
      // TODO: Backend integration in Story 0-4 will:
      // - Create user row in user_profiles table
      // - Store selected_painpoints from onboarding
      // - Track auth_completed analytics event
      router.push('/(onboarding)/identity-traits' as any);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in with Apple. Please try again.');
      Alert.alert(
        'Authentication Error',
        err.message || 'Unable to sign in with Apple. Please try again.'
      );
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  /**
   * Handle Google Sign In
   * AC #3: <3 seconds auth completion
   */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('google');
      setError(null);

      // TODO: Implement Supabase Google Sign In (Story 0-4)
      // const { data, error } = await supabase.auth.signInWithOAuth({
      //   provider: 'google',
      //   options: {
      //     redirectTo: 'weavelight://auth/callback',
      //     queryParams: {
      //       access_type: 'offline',
      //       prompt: 'consent',
      //     },
      //   },
      // });
      //
      // if (error) throw error;

      // TEMPORARY: Simulate auth for front-end testing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success: Navigate to Story 1.6
      router.push('/(onboarding)/identity-traits' as any);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in with Google. Please try again.');
      Alert.alert(
        'Authentication Error',
        err.message || 'Unable to sign in with Google. Please try again.'
      );
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  /**
   * Handle Email Sign In
   * AC #3: <3 seconds auth completion
   */
  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('email');
      setError(null);

      // TODO: Implement Email Sign In (Story 0-4)
      // Could use magic link or password-based auth
      // For now, show alert that this is not implemented yet
      Alert.alert(
        'Coming Soon',
        'Email authentication will be available soon. Please use Apple or Google Sign In for now.'
      );

      setLoading(false);
      setActiveProvider(null);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in with email. Please try again.');
      Alert.alert(
        'Authentication Error',
        err.message || 'Unable to sign in with email. Please try again.'
      );
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  /**
   * Handle back navigation to Story 1.4 (Solution Screen)
   * AC #6: Allow user to return to previous screen
   */
  const handleBack = () => {
    try {
      router.back();
    } catch (err) {
      // Fallback to solution screen if back navigation fails
      router.push('/(onboarding)/weave-solution' as any);
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 24,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(400)}
          style={{ marginBottom: 32, marginTop: 40 }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#171717',
              marginBottom: 12,
              textAlign: 'center',
            }}
            accessibilityRole="header"
          >
            Get Started
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Create your account to begin your transformation journey
          </Text>

          {/* Trial Messaging (AC #2) */}
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: '#10b981',
              textAlign: 'center',
            }}
          >
            7-day free trial. No commitment.
          </Text>
        </Animated.View>

        {/* Authentication Buttons (AC #1) */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(200)}
          style={{ flex: 1, justifyContent: 'center', minHeight: 300 }}
        >
          {/* Apple Sign In Button (Priority 1) */}
          <Pressable
            onPress={handleAppleSignIn}
            disabled={loading}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: 56,
              backgroundColor: '#000000',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              opacity: pressed ? 0.8 : loading ? 0.6 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Apple"
            accessibilityHint="Authenticate using your Apple ID"
          >
            {loading && activeProvider === 'apple' ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                {/* Apple Icon Placeholder */}
                <Text style={{ fontSize: 20, marginRight: 12, color: '#ffffff' }}></Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#ffffff',
                  }}
                >
                  Sign in with Apple
                </Text>
              </>
            )}
          </Pressable>

          {/* Google Sign In Button (Priority 2) */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: 56,
              backgroundColor: '#ffffff',
              borderWidth: 1.5,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              opacity: pressed ? 0.8 : loading ? 0.6 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            accessibilityHint="Authenticate using your Google account"
          >
            {loading && activeProvider === 'google' ? (
              <ActivityIndicator color="#171717" size="small" />
            ) : (
              <>
                {/* Google Icon Placeholder */}
                <Text style={{ fontSize: 20, marginRight: 12 }}>G</Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#171717',
                  }}
                >
                  Sign in with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Email Sign In Button (Priority 3) */}
          <Pressable
            onPress={handleEmailSignIn}
            disabled={loading}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: 56,
              backgroundColor: '#f9fafb',
              borderWidth: 1.5,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              opacity: pressed ? 0.8 : loading ? 0.6 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Continue with Email"
            accessibilityHint="Authenticate using your email address"
          >
            {loading && activeProvider === 'email' ? (
              <ActivityIndicator color="#171717" size="small" />
            ) : (
              <>
                {/* Email Icon Placeholder */}
                <Text style={{ fontSize: 20, marginRight: 12 }}>✉️</Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#171717',
                  }}
                >
                  Continue with Email
                </Text>
              </>
            )}
          </Pressable>

          {/* Error Message */}
          {error && (
            <Text
              style={{
                fontSize: 14,
                color: '#ef4444',
                textAlign: 'center',
                marginTop: 16,
                paddingHorizontal: 16,
              }}
            >
              {error}
            </Text>
          )}
        </Animated.View>

        {/* Back Button */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(400)}
          style={{ marginTop: 'auto', paddingTop: 24 }}
        >
          <Pressable
            onPress={handleBack}
            disabled={loading}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Return to previous screen"
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#6b7280',
              }}
            >
              Back
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Loading Overlay (AC #3) */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              minWidth: 150,
            }}
          >
            <ActivityIndicator size="large" color="#10b981" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#171717',
                marginTop: 16,
              }}
            >
              Signing in...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
