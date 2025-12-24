/**
 * Dev Tools Screen
 * Development-only utilities for testing and debugging
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, Card, Heading, Body, Button } from '@/design-system';
import { clearAllCaches, logActiveQueries } from '@/utils/devTools';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

export default function DevToolsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(apiClient.getAdminKey() !== null);

  const handleClearAllCaches = () => {
    clearAllCaches(queryClient);
    Alert.alert('Success', 'All React Query caches cleared. Data will be refetched fresh.');
  };

  const handleLogQueries = () => {
    logActiveQueries(queryClient);
    Alert.alert('Check Console', 'Active queries logged to console');
  };

  const handleInvalidateBinds = () => {
    const today = new Date().toISOString().split('T')[0];
    queryClient.invalidateQueries({ queryKey: ['binds', 'today', today] });
    Alert.alert('Success', "Today's binds cache invalidated. Will refetch on next screen load.");
  };

  const handleToggleAdminMode = () => {
    const ADMIN_KEY = 'dev-admin-key-12345-change-in-production';
    if (adminModeEnabled) {
      apiClient.disableAdminMode();
      setAdminModeEnabled(false);
      Alert.alert('🔒 Admin Mode Disabled', 'Normal rate limits will apply.');
    } else {
      apiClient.enableAdminMode(ADMIN_KEY);
      setAdminModeEnabled(true);
      Alert.alert(
        '🔓 Admin Mode Enabled',
        'Unlimited rate limits active. Use for testing only.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setIsSendingNotification(true);

    try {
      // First, get user_profiles.id from auth_user_id
      const authUserId = user.id; // This is auth.uid from JWT

      // Query user_profiles to get the internal ID
      const response = await fetch(`http://192.168.1.112:8000/api/user/me`, {
        headers: {
          'Authorization': `Bearer ${await apiClient.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      // For now, we'll use a simplified approach: call the endpoint with auth_user_id
      // and let the backend handle the lookup
      // Note: Admin mode must be enabled manually in Dev Tools for this to work
      const { supabase } = await import('@lib/supabase');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (profileError || !profileData) {
        throw new Error('User profile not found');
      }

      const userProfileId = profileData.id;

      // Now call the trigger-checkin endpoint with user_profiles.id
      const result = await apiClient.post(
        `/admin/trigger-checkin/${userProfileId}`,
        {}
      );

      if (result.data?.data?.success) {
        Alert.alert(
          '✅ Notification Sent!',
          `Test notification triggered successfully!\n\nMessage: "${result.data.data.message}"\n\nCheck your device for the push notification.`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('[DEV_TOOLS] Test notification error:', error);
      Alert.alert(
        'Error',
        `Failed to send test notification:\n\n${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing[5] }}>
          <Button variant="ghost" onPress={() => router.back()}>
            ← Back
          </Button>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginTop: spacing[3] }}
          >
            Dev Tools
          </Heading>
          <Body style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
            Testing and debugging utilities
          </Body>
        </View>

        {/* Navigation */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Navigation
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={() => router.push('/(tabs)/sitemap')}>
              🗺️ Site Map (All Screens)
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Access all screens in the app, including new Story 6.2 screens (Personality Settings,
            AI Chat, etc.)
          </Body>
        </Card>

        {/* Cache Management */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Cache Management
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={handleClearAllCaches}>
              Clear All Caches
            </Button>

            <Button variant="secondary" onPress={handleInvalidateBinds}>
              Invalidate Today's Binds
            </Button>

            <Button variant="secondary" onPress={handleLogQueries}>
              Log Active Queries
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Use "Clear All Caches" when data seems stale or incorrect. This forces a fresh fetch
            from the API.
          </Body>
        </Card>

        {/* Admin Mode */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Admin Mode
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button
              variant={adminModeEnabled ? 'destructive' : 'primary'}
              onPress={handleToggleAdminMode}
            >
              {adminModeEnabled ? '🔓 Disable Admin Mode' : '🔒 Enable Admin Mode'}
            </Button>

            {adminModeEnabled && (
              <View
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.accent.warning + '20',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.accent.warning,
                }}
              >
                <Body
                  style={{
                    color: colors.accent.warning,
                    fontWeight: '600',
                  }}
                >
                  ⚠️ ADMIN MODE ACTIVE
                </Body>
                <Body
                  style={{
                    color: colors.text.secondary,
                    fontSize: 12,
                    marginTop: spacing[1],
                  }}
                >
                  • Unlimited AI requests (no rate limits){'\n'}
                  • All admin endpoints accessible{'\n'}
                  • Development only - DO NOT use in production
                </Body>
              </View>
            )}
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Enable admin mode to bypass rate limits during testing. This uses the dev admin key and
            grants unlimited access to AI endpoints.
          </Body>
        </Card>

        {/* Push Notifications */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Push Notifications
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button
              variant="primary"
              onPress={handleSendTestNotification}
              disabled={isSendingNotification || !user}
            >
              {isSendingNotification
                ? '⏳ Sending...'
                : '🔔 Send Test Notification'}
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Sends a test push notification to this device. Useful for testing check-in notifications
            and notification handling.
            {!user && '\n\n⚠️ You must be logged in to send test notifications.'}
          </Body>
        </Card>

        {/* Database Info */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Info
          </Heading>

          <Body style={{ color: colors.text.secondary, lineHeight: 20 }}>
            • Clear cache when bind completion status seems wrong{'\n'}• Check console for detailed
            query logs{'\n'}• Invalidate specific queries for targeted refresh
          </Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});
