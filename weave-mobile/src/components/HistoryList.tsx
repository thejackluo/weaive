import React from 'react';
import { View, FlatList, ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useHistory } from '@/hooks/useHistory';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { HistoryItem, HistoryFilters } from '@/services/history';
import { Ionicons } from '@expo/vector-icons';

interface HistoryListProps {
  limit?: number;
  timeframe?: 'days' | 'weeks' | 'months';
  type?: 'all' | 'threads' | 'binds' | 'weave_chats';
}

/**
 * HistoryList - Displays recent user activity (completions, journal entries, goal changes)
 *
 * US-5.5: History Section
 */
export function HistoryList({ limit = 10, timeframe = 'days', type = 'all' }: HistoryListProps) {
  const router = useRouter();

  const filters: HistoryFilters = {
    timeframe,
    type,
  };

  const { data, isLoading, isError, error, refetch } = useHistory(limit, filters);

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2" style={{ fontSize: 14, color: '#a1a1aa' }}>
          Loading history...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-4">
        <Text style={{ fontSize: 14, color: '#ef4444' }}>
          {error?.message || 'Failed to load history'}
        </Text>
        <Text
          className="mt-2"
          style={{ fontSize: 14, color: '#3b82f6' }}
          onPress={() => refetch()}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  const historyItems = data?.data || [];

  if (historyItems.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text style={{ fontSize: 14, color: '#a1a1aa' }}>
          No activity yet. Start completing binds to build your history!
        </Text>
      </View>
    );
  }

  // Group items by date
  const groupedItems = historyItems.reduce(
    (acc, item) => {
      const date = new Date(item.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, HistoryItem[]>
  );

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    // Get type label and badge color
    const getTypeConfig = (type: string) => {
      switch (type) {
        case 'journal':
          return { label: 'Thread', color: '#8b5cf6' };
        case 'completion':
          return { label: 'Bind', color: '#10b981' };
        case 'goal_created':
          return { label: 'Thread', color: '#3b82f6' };
        case 'goal_archived':
          return { label: 'Thread', color: '#71717a' };
        default:
          return { label: 'Activity', color: '#a1a1aa' };
      }
    };

    const config = getTypeConfig(item.type);

    // Format time
    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    // Get content to display
    const getContent = () => {
      return item.description;
    };

    // Handle press to view full record
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Navigate to day detail page for the item's date
      const date = new Date(item.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      router.push(`/(tabs)/progress/${dateStr}`);
    };

    return (
      <Pressable onPress={handlePress} style={styles.cardWrapper}>
        <View
          style={[
            styles.historyCard,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          {/* Header row: Type badge and timestamp */}
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '30' }]}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: config.color }}>
                {config.label}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#71717a' }}>
              {formatTime(item.timestamp)}
            </Text>
          </View>

          {/* Content */}
          <Text
            numberOfLines={3}
            style={[styles.content, { fontSize: 16, fontWeight: '500', color: '#ffffff' }]}
          >
            {getContent()}
          </Text>

          {/* Footer row: View arrow */}
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={16} color="#71717a" />
          </View>
        </View>
      </Pressable>
    );
  };

  // Render grouped by date
  return (
    <View style={styles.container}>
      {Object.entries(groupedItems).map(([date, items]) => (
        <View key={date} style={styles.dateGroup}>
          <Text
            style={[styles.dateHeader, { fontSize: 16, fontWeight: '600', color: '#a1a1aa' }]}
          >
            {date}
          </Text>
          <FlatList
            data={items}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item.id}-${index}-${date}`}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  dateGroup: {
    gap: 12,
  },
  dateHeader: {
    marginBottom: 4,
  },
  listContent: {
    gap: 8,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  historyCard: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
