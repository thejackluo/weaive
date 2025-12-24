import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

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
 * - Not authenticated → /(auth)/login
 * - Authenticated but onboarding incomplete → /(onboarding)/welcome
 * - Authenticated + onboarding complete → /(tabs) (main app)
 *
 * Epic 1.5: App Navigation Scaffolding
 *
 * @returns Redirect component or loading screen
 */
export default function Index() {
  const { user, isLoading } = useAuth();

  // Testing Mode: Bypass auth guards during development
  // Set EXPO_PUBLIC_DEV_SKIP_AUTH=true in .env to enable
  const devSkipAuth = __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true';

  if (devSkipAuth) {
    return (
      <>
        <Redirect href="/(tabs)" />
        {/* Dev Banner (invisible but helps debugging) */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <View style={{ backgroundColor: '#FF6B00', padding: 8 }}>
            <Textstyle={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              🧪 DEV MODE: Auth Bypassed
            </Text>
          </View>
        </View>
      </>
    );
  }

  // Loading Screen: Show while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 24, borderRadius: 12 }}>
          <ActivityIndicator size="large" color="#3B72F6" />
          <Textstyle={{ color: '#888888', marginTop: 16, textAlign: 'center' }}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Auth Guard 1: Not authenticated → Login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Auth Guard 2: Onboarding incomplete → Onboarding flow
  // TODO: Check user_metadata or user_profiles table for onboarding_completed_at
  // For now, check if user has user_metadata.onboarding_completed
  const onboardingComplete = user.user_metadata?.onboarding_completed === true;
  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // All checks passed → Main app
  return <Redirect href="/(tabs)" />;
}
