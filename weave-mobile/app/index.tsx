import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';
import { Text, Card } from '@/design-system';

/**
 * Root index route
 *
 * Entry point that implements auth guards and redirects users based on:
 * 1. Testing mode (EXPO_PUBLIC_DEV_SKIP_AUTH environment variable)
 * 2. Authentication state (via AuthContext)
 * 3. Onboarding completion status
 *
 * Routing Logic:
 * - Testing mode enabled → Skip to /(tabs) (bypasses all checks)
 * - Not authenticated → /(onboarding)/welcome (first-time users see welcome screen)
 * - Authenticated but onboarding incomplete → /(onboarding)/welcome
 * - Authenticated + onboarding complete but in-app tutorial not started → /needles/create (first needle)
 * - Authenticated + onboarding complete + in-app tutorial started → /(tabs) (main app)
 *
 * Epic 1.5: App Navigation Scaffolding
 *
 * @returns Redirect component or loading screen
 */
export default function Index() {
  const { user, isLoading } = useAuth();
  const { currentStep, isLoading: isOnboardingLoading } = useInAppOnboarding();

  // 🐛 DEBUG: Log routing state
  console.log('[INDEX_ROUTE] 🔍 Routing check:', {
    isLoading,
    isOnboardingLoading,
    hasUser: !!user,
    currentStep,
    userMetadata: user?.user_metadata,
  });

  // Testing Mode: Bypass auth guards during development
  // Set EXPO_PUBLIC_DEV_SKIP_AUTH=true in .env to enable
  const devSkipAuth = __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true';

  if (devSkipAuth) {
    return (
      <>
        <Redirect href="/(onboarding)/welcome" />
        {/* Dev Banner (invisible but helps debugging) */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <View style={{ backgroundColor: '#FF6B00', padding: 8 }}>
            <Text
              variant="textSm"
              style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}
            >
              🧪 DEV MODE: Auth Bypassed (Onboarding)
            </Text>
          </View>
        </View>
      </>
    );
  }

  // Loading Screen: Show while checking auth state and onboarding state
  if (isLoading || isOnboardingLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Card variant="glass" padding="default">
          <ActivityIndicator size="large" color="#3B72F6" />
          <Text variant="textBase" className="text-muted mt-4">
            Loading...
          </Text>
        </Card>
      </View>
    );
  }

  // Auth Guard 1: Not authenticated → Welcome Screen (Start Onboarding)
  // First-time users see the welcome screen that leads to signup/login
  if (!user) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // Auth Guard 2: Onboarding incomplete → Onboarding flow
  // TODO: Check user_metadata or user_profiles table for onboarding_completed_at
  // For now, check if user has user_metadata.onboarding_completed
  const onboardingComplete = user.user_metadata?.onboarding_completed === true;
  if (!onboardingComplete) {
    console.log('[INDEX_ROUTE] ➡️ Redirecting to onboarding (incomplete)');
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // In-App Tutorial: First-time users → Create first needle
  // This redirects users who completed initial onboarding to the tutorial
  if (currentStep === 'create_first_needle') {
    console.log('[INDEX_ROUTE] ➡️ Redirecting to create first needle (tutorial)');
    return <Redirect href="/needles/create" />;
  }

  // All checks passed → Main app
  console.log('[INDEX_ROUTE] ➡️ Redirecting to main app (all complete)');
  return <Redirect href="/(tabs)" />;
}
