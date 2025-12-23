/**
 * Needles Screen Route (Story 2.1: Needles List View)
 *
 * Displays list of active goals (needles) with progress metrics
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeedlesListScreen } from '@/screens/NeedlesListScreen';
import { UserAvatarMenu } from '@/components/UserAvatarMenu';

export default function NeedlesRoute() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* User Avatar Menu - Top Right */}
      <UserAvatarMenu />

      <NeedlesListScreen />
    </SafeAreaView>
  );
}
