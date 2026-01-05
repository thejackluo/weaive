/**
 * Authentication Screen - NativeWind + Design System
 *
 * Story 0.3: OAuth Authentication
 *
 * Features:
 * - Google Sign In (primary) using Supabase OAuth
 * - Apple Sign In (optional) using Supabase OAuth
 * - Email Sign In (coming soon)
 * - Uses existing design system Button component (has built-in glass effects!)
 * - NativeWind for all layout and styling
 *
 * Pattern (following welcome.tsx):
 * - className prop for NativeWind classes
 * - style prop as fallback
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, showSimpleToast } from '@/design-system';
import { signInWithApple, signInWithGoogle } from '@lib/auth';
import { bypassAuthForDev } from '@lib/authHelpers';
import { supabase as _supabase } from '@lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type AuthProvider = 'apple' | 'google' | 'email';

export default function AuthenticationScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('google');
      setError(null);

      console.log('[ONBOARDING_AUTH] Starting Google sign in...');
      const result = await signInWithGoogle();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in with Google');
      }

      console.log('[ONBOARDING_AUTH] Google sign in successful, navigating to identity-bootup...');

      // Show success toast
      showSimpleToast('Signed in successfully! 🎉', 'success');

      // Give a brief moment for the session to fully establish
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success - navigate to next onboarding step using replace to avoid back navigation issues
      console.log('[ONBOARDING_AUTH] Navigating to identity-bootup...');
      router.replace('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      console.error('[ONBOARDING_AUTH] Google sign in failed:', err);
      const errorMessage = err.message || 'Unable to sign in with Google. Please try again.';
      setError(errorMessage);
      showSimpleToast(errorMessage, 'error');
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('apple');
      setError(null);

      console.log('[ONBOARDING_AUTH] Starting Apple sign in...');
      const result = await signInWithApple();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in with Apple');
      }

      console.log('[ONBOARDING_AUTH] Apple sign in successful, navigating to identity-bootup...');

      // Show success toast
      showSimpleToast('Signed in successfully! 🎉', 'success');

      // Give a brief moment for the session to fully establish
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success - navigate to next onboarding step using replace to avoid back navigation issues
      console.log('[ONBOARDING_AUTH] Navigating to identity-bootup...');
      router.replace('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      console.error('[ONBOARDING_AUTH] Apple sign in failed:', err);
      const errorMessage = err.message || 'Unable to sign in with Apple. Please try again.';
      setError(errorMessage);
      showSimpleToast(errorMessage, 'error');
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  const handleEmailSignIn = () => {
    // Navigate to the email login screen
    router.push('/(auth)/login' as any);
  };

  const handleBack = () => {
    try {
      router.back();
    } catch {
      router.push('/(onboarding)/weave-solution' as any);
    }
  };

  const handleContinueOnboarding = () => {
    // User is already signed in, continue to next onboarding step
    router.push('/(onboarding)/identity-bootup' as any);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on authentication screen after sign out
    } catch (err: any) {
      console.error('[ONBOARDING_AUTH] Sign out error:', err);
      showSimpleToast('Failed to sign out. Please try again.', 'error');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-6"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
      >
        {/* Header */}
        <View className="mb-8 mt-10" style={{ marginBottom: 32, marginTop: 40 }}>
          <Text
            className="text-3xl font-bold text-center text-white mb-3"
            style={{
              fontSize: 32,
              fontWeight: '700',
              textAlign: 'center',
              color: '#ffffff',
              marginBottom: 12,
            }}
          >
            Get Started
          </Text>

          <Text
            className="text-base text-center text-neutral-400 mb-6"
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: '#9ca3af',
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            Create your account to begin your transformation journey
          </Text>
        </View>

        {/* Already Signed In Card */}
        {user && (
          <View
            className="flex-1 justify-center mb-6"
            style={{ flex: 1, justifyContent: 'center', marginBottom: 24, paddingHorizontal: 24 }}
          >
            <View
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeftWidth: 4,
                borderLeftColor: '#10b981',
                borderRadius: 12,
                padding: 20,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#10b981',
                  }}
                >
                  ✅ You're Already Signed In
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#6b7280',
                  }}
                >
                  Signed in as <Text style={{ fontWeight: '600' }}>{user.email}</Text>
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#9ca3af',
                    marginTop: 4,
                  }}
                >
                  You can continue to the next step or sign out to use a different account.
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleContinueOnboarding}
                  disabled={loading || isSigningOut}
                >
                  Continue to Next Step
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onPress={handleSignOut}
                  loading={isSigningOut}
                  disabled={loading || isSigningOut}
                >
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Auth Buttons - Only show if not signed in */}
        {!user && (
          <View
            className="flex-1 justify-center mb-6"
            style={{ flex: 1, justifyContent: 'center', marginBottom: 24 }}
          >
            <View className="mb-4" style={{ marginBottom: 16 }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleGoogleSignIn}
                disabled={loading}
                loading={loading && activeProvider === 'google'}
                leftIcon={<Text style={{ fontSize: 20 }}>G</Text>}
              >
                Continue with Google
              </Button>
            </View>

            <View className="mb-4" style={{ marginBottom: 16 }}>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleAppleSignIn}
                disabled={loading}
                loading={loading && activeProvider === 'apple'}
                leftIcon={<Text style={{ fontSize: 20 }}></Text>}
              >
                Sign in with Apple
              </Button>
            </View>

            <View
              className="flex-row items-center my-6"
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}
            >
              <View
                className="flex-1 h-px bg-neutral-200"
                style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }}
              />
              <Text
                className="mx-4 text-sm text-neutral-400 font-medium"
                style={{ marginHorizontal: 16, fontSize: 14, color: '#9ca3af', fontWeight: '500' }}
              >
                or
              </Text>
              <View
                className="flex-1 h-px bg-neutral-200"
                style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }}
              />
            </View>

            <View className="mb-4" style={{ marginBottom: 16 }}>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleEmailSignIn}
                disabled={loading}
                leftIcon={<Text style={{ fontSize: 20 }}>✉️</Text>}
              >
                Sign in with Email
              </Button>
            </View>
          </View>
        )}

        {error && !user && (
          <View className="mt-4 px-4" style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text
              className="text-red-500 text-sm text-center leading-5"
              style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', lineHeight: 20 }}
            >
              {error}
            </Text>
          </View>
        )}

        <View
          className="mt-auto pt-6 items-center"
          style={{ marginTop: 'auto', paddingTop: 24, alignItems: 'center' }}
        >
          <Button variant="ghost" size="md" onPress={handleBack} disabled={loading || isSigningOut}>
            Back
          </Button>

          {/* Development Bypass Button - Only in DEV mode and not signed in */}
          {__DEV__ && !user && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="sm"
                onPress={async () => {
                  try {
                    setLoading(true);
                    // Use the proper bypass that creates a real session (skipNavigation=true so we handle it)
                    const success = await bypassAuthForDev(
                      'test@weavelight.dev',
                      'testpass123',
                      true // Skip navigation, we'll handle it
                    );

                    if (success) {
                      // For onboarding flow, continue to identity-bootup
                      router.replace('/(onboarding)/identity-bootup' as any);
                    }
                  } catch (err) {
                    console.error('[ONBOARDING_AUTH] Dev bypass failed:', err);
                    showSimpleToast('Dev bypass failed', 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{ opacity: 0.6 }}
              >
                🔧 Skip Auth (Dev Only)
              </Button>
              <Text
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                Development mode only - bypasses authentication
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
