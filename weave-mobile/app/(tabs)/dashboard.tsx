import React, { useEffect } from 'react';

/**
 * Dashboard Route (Epic 2 + 5)
 *
 * Main dashboard showing goal management and progress visualization
 */
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/design-system';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';

export default function DashboardRoute() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentStep, isLoading } = useInAppOnboarding();

  // 🎯 In-App Tutorial: Redirect to create needle if user should be in tutorial
  useEffect(() => {
    if (!isLoading && currentStep === 'create_first_needle') {
      console.log('[DASHBOARD_ROUTE] 🎯 Redirecting to create first needle (tutorial)');
      router.replace('/needles/create');
    }
  }, [currentStep, isLoading, router]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
      edges={['top']}
    >
      <DashboardScreen />
    </SafeAreaView>
  );
}
