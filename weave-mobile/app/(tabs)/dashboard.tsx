/**
 * Dashboard Route (Epic 2 + 5)
 *
 * Main dashboard showing goal management and progress visualization
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system';
import { DashboardScreen } from '@/screens/DashboardScreen';

export default function DashboardRoute() {
  const { colors } = useTheme();

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
