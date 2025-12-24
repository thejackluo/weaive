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
import { ActivityIndicator, TouchableOpacity } from 'react-native';
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

      const result = await signInWithGoogle();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in with Google');
      }

      // Show success toast
      // showSimpleToast('Signed in successfully! 🎉', 'success');

      // Success - navigate to next onboarding step
      router.push('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to sign in with Google. Please try again.';
      setError(errorMessage);
      // showSimpleToast(errorMessage, 'error');
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

      // Show success toast
      // showSimpleToast('Signed in successfully! 🎉', 'success');

      // Success - navigate to next onboarding step
      router.push('/(onboarding)/identity-bootup' as any);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to sign in with Apple. Please try again.';
      setError(errorMessage);
      // showSimpleToast(errorMessage, 'error');
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
    showSimpleToast('Continuing to next step...', 'success');
    router.push('/(onboarding)/identity-bootup' as any);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // showSimpleToast('Signed out successfully 👋', 'success');
      // Stay on authentication screen after sign out
    } catch (err: any) {
      console.error('[ONBOARDING_AUTH] Sign out error:', err);
      // showSimpleToast('Failed to sign out. Please try again.', 'error');
    } finally {
      setIsSigningOut(false);
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
                  Signed in as <Textstyle={{ fontWeight: '600' }}>{user.email}</Text>
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
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: (loading || isSigningOut) ? 0.5 : 1,
                  }}
                  onPress={handleContinueOnboarding}
                  disabled={loading || isSigningOut}
                >
                  <Textstyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    Continue to Next Step
                  </Text>
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
                    opacity: (loading || isSigningOut) ? 0.5 : 1,
                  }}
                  onPress={handleSignOut}
                  disabled={loading || isSigningOut}
                >
                  {isSigningOut ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Textstyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign Out
                    </Text>
                  )}
                </TouchableOpacity>
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
              <TouchableOpacity
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  opacity: loading ? 0.5 : 1,
                }}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                {loading && activeProvider === 'google' ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Textstyle={{ fontSize: 20 }}>G</Text>
                    <Textstyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-4" style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  opacity: loading ? 0.5 : 1,
                }}
                onPress={handleAppleSignIn}
                disabled={loading}
              >
                {loading && activeProvider === 'apple' ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Textstyle={{ fontSize: 20 }}></Text>
                    <Textstyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign in with Apple
                    </Text>
                  </>
                )}
              </TouchableOpacity>
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
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  opacity: loading ? 0.5 : 1,
                }}
                onPress={handleEmailSignIn}
                disabled={loading}
              >
                <Textstyle={{ fontSize: 20 }}>✉️</Text>
                <Textstyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  Sign in with Email
                </Text>
              </TouchableOpacity>
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
          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center',
              opacity: (loading || isSigningOut) ? 0.5 : 1,
            }}
            onPress={handleBack}
            disabled={loading || isSigningOut}
          >
            <Textstyle={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Back
            </Text>
          </TouchableOpacity>

          {/* Development Bypass Button - Only in DEV mode and not signed in */}
          {__DEV__ && !user && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                  alignItems: 'center',
                  opacity: loading ? 0.3 : 0.6,
                }}
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
                      // showSimpleToast('🔧 Dev bypass: Continuing to onboarding', 'success');
                      // For onboarding flow, continue to identity-bootup
                      router.push('/(onboarding)/identity-bootup' as any);
                    }
                  } catch (err) {
                    console.error('[ONBOARDING_AUTH] Dev bypass failed:', err);
                    // showSimpleToast('Dev bypass failed', 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Textstyle={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>
                  🔧 Skip Auth (Dev Only)
                </Text>
              </TouchableOpacity>
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
