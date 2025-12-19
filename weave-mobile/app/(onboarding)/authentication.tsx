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
import { Button } from '@/design-system';
import { signInWithApple, signInWithGoogle } from '@lib/auth';

type AuthProvider = 'apple' | 'google' | 'email';

export default function AuthenticationScreen() {
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setActiveProvider('google');
      setError(null);

      const result = await signInWithGoogle();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in with Google');
      }

      // Success - navigate to next onboarding step
      router.push('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to sign in with Google. Please try again.';
      setError(errorMessage);
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

      const result = await signInWithApple();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in with Apple');
      }

      // Success - navigate to next onboarding step
      router.push('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to sign in with Apple. Please try again.';
      setError(errorMessage);
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  const handleEmailSignIn = async () => {
    Alert.alert(
      'Coming Soon',
      'Email authentication will be available soon. Please use Google or Apple Sign In for now.'
    );
  };

  const handleBack = () => {
    try {
      router.back();
    } catch {
      router.push('/(onboarding)/weave-solution' as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, backgroundColor: '#ffffff' }}>
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
            className="text-3xl font-bold text-center text-neutral-900 mb-3"
            style={{
              fontSize: 32,
              fontWeight: '700',
              textAlign: 'center',
              color: '#1a1a1a',
              marginBottom: 12,
            }}
          >
            Get Started
          </Text>

          <Text
            className="text-base text-center text-neutral-600 mb-6"
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            Create your account to begin your transformation journey
          </Text>

          <View className="items-center" style={{ alignItems: 'center' }}>
            <View
              className="bg-emerald-50 px-6 py-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text
                className="text-emerald-600 font-semibold text-sm"
                style={{ color: '#10b981', fontWeight: '600', fontSize: 15 }}
              >
                ✨ 7-day free trial. No commitment.
              </Text>
            </View>
          </View>
        </View>

        {/* Auth Buttons - Using Design System Button Component */}
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
              variant="ghost"
              size="lg"
              fullWidth
              onPress={handleEmailSignIn}
              disabled={loading}
              leftIcon={<Text style={{ fontSize: 20 }}>✉️</Text>}
            >
              Continue with Email
            </Button>
          </View>
        </View>

        {error && (
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
          <Button variant="ghost" size="md" onPress={handleBack} disabled={loading}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
