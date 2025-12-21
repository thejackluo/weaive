/**
 * Needles Screen Route (Story 2.1: Needles List View)
 *
 * Displays list of active goals (needles) with progress metrics
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system';
import { NeedlesListScreen } from '@/screens/NeedlesListScreen';

export default function NeedlesRoute() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
    >
      <NeedlesListScreen />
    </SafeAreaView>
  );
}
