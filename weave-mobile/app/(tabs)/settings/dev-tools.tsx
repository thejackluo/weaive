/**
 * Dev Tools Screen
 * Development-only utilities for testing and debugging
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useTheme, Card, Heading, Body, Button } from '@/design-system';
import { clearAllCaches, logActiveQueries } from '@/utils/devTools';
import { useSubscriptionStatus } from '@/hooks/usePurchase';
import apiClient from '@/services/apiClient';

export default function DevToolsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);

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

  const handleTestNotification = async () => {
    try {
      setIsSendingNotification(true);

      // Schedule a local notification (appears immediately)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from Weave Dev Tools',
          data: { type: 'test', screen: 'dev-tools' },
          sound: true,
        },
        trigger: null, // Send immediately
      });

      Alert.alert(
        'Notification Sent!',
        'Check your notification center. If you don\'t see it, check notification permissions in Settings.'
      );
    } catch (error) {
      Alert.alert(
        'Notification Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleTestSubscription = async () => {
    try {
      setIsTestingSubscription(true);

      // Fetch subscription status
      const response = await apiClient.get('/api/subscription/status');
      const status = response.data;

      Alert.alert(
        'Subscription Status',
        `Tier: ${status.subscription_tier}\n` +
        `Monthly Limit: ${status.monthly_limit}\n` +
        `Expires: ${status.subscription_expires_at || 'N/A'}\n` +
        `Product: ${status.subscription_product_id || 'N/A'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Subscription Test Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsTestingSubscription(false);
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

        {/* Story 9.4: App Store Readiness Testing */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Story 9.4 Testing
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button
              variant="primary"
              onPress={handleTestNotification}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? 'Sending...' : '🔔 Test Push Notification'}
            </Button>

            <Button
              variant="secondary"
              onPress={handleTestSubscription}
              disabled={isTestingSubscription}
            >
              {isTestingSubscription ? 'Loading...' : '💳 Test Subscription Status'}
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Test notification: Sends local push notification immediately{'\n'}
            Test subscription: Fetches current tier and limits from API
          </Body>

          {subscriptionStatus && (
            <View
              style={{
                marginTop: spacing[3],
                padding: spacing[3],
                backgroundColor: colors.background.secondary,
                borderRadius: 8,
              }}
            >
              <Body style={{ color: colors.text.secondary, fontSize: 12, lineHeight: 18 }}>
                Current Tier: {subscriptionStatus.subscription_tier.toUpperCase()}{'\n'}
                Monthly Limit: {
                  subscriptionStatus.subscription_tier === 'free' ? '500' :
                  subscriptionStatus.subscription_tier === 'pro' ? '5000' : 'Unlimited'
                }
              </Body>
            </View>
          )}
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
