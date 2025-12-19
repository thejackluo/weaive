/**
 * Authentication Screen (Placeholder)
 *
 * Story 1.5: User Authentication
 * PRD US-1.5: Authentication Flow
 *
 * TODO: Implement full authentication flow
 * - Email/password or social login
 * - Account creation
 * - Password reset
 * - Session management
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthenticationScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '600',
            color: '#171717',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Authentication Screen
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          Story 1.5: User Authentication
          {'\n\n'}
          This screen is a placeholder.
          {'\n\n'}
          TODO: Implement authentication flow with Supabase.
        </Text>
      </View>
    </SafeAreaView>
  );
}
