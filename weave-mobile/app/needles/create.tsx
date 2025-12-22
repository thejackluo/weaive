/**
 * Create Needle Route (US-2.3: Create New Goal)
 *
 * AI-assisted goal creation flow
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system';
import { CreateNeedleScreen } from '@/screens/CreateNeedleScreen';

export default function CreateNeedleRoute() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
      edges={['top']}
    >
      <CreateNeedleScreen />
    </SafeAreaView>
  );
}
