/**
 * Needle Detail Route (US-2.2: View Goal Details)
 *
 * Dynamic route for viewing and editing a specific needle (goal)
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeedleDetailScreen } from '@/screens/NeedleDetailScreen';

export default function NeedleDetailRoute() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0a0a0a',
      }}
      edges={['top']}
    >
      <NeedleDetailScreen />
    </SafeAreaView>
  );
}
