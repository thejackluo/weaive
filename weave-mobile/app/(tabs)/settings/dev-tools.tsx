/**
 * Dev Tools Screen
 * Development-only utilities for testing and debugging
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, Card, Heading, Body, Button } from '@/design-system';
import { clearAllCaches, logActiveQueries } from '@/utils/devTools';

export default function DevToolsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

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
