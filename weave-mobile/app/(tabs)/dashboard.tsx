import React from 'react';

/**
 * Dashboard Route (Epic 2 + 5)
 *
 * Main dashboard showing goal management and progress visualization
 */
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from '@/screens/DashboardScreen';

export default function DashboardRoute() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0a0a0a',
      }}
      edges={['top']}
    >
      <DashboardScreen />
    </SafeAreaView>
  );
}
