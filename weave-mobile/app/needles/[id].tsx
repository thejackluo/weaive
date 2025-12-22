/**
 * Needle Detail Route (US-2.2: View Goal Details)
 *
 * Dynamic route for viewing and editing a specific needle (goal)
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system';
import { NeedleDetailScreen } from '@/screens/NeedleDetailScreen';

export default function NeedleDetailRoute() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
      edges={['top']}
    >
      <NeedleDetailScreen />
    </SafeAreaView>
  );
}
