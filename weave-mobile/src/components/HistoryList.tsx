import React from 'react';
import { View, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';
import { useHistory } from '@/hooks/useHistory';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { HistoryItem, HistoryFilters } from '@/services/history';
import { Ionicons } from '@expo/vector-icons';
import { formatLocalDate, parseLocalDate } from '@/utils/dateUtils';

interface HistoryListProps {
  limit?: number;
  timeframe?: 'days' | 'weeks' | 'months';
  type?: 'all' | 'threads' | 'binds' | 'weave_chats';
}

/**
 * HistoryList - Displays recent user activity (bind completions, journal reflections)
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
        <ActivityIndicator size="large" color={colors.accent[500]} />
        <Text variant="textSm" className="mt-2" style={{ color: colors.text.secondary }}>
          Loading history...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-4">
        <Text variant="textSm" style={{ color: colors.text.error }}>
          {error?.message || 'Failed to load history'}
        </Text>
        <Text
          variant="textSm"
          className="mt-2"
          style={{ color: colors.accent[500] }}
          onPress={() => refetch()}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  const historyItems = Array.isArray(data?.data) ? data.data : [];

  // Filter out goal lifecycle events (only show threads, binds, weave_chats)
  const filteredItems = historyItems.filter(
    (item) => item.type === 'journal' || item.type === 'completion' || item.type === 'weave_chat'
  );

  if (filteredItems.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text variant="textSm" style={{ color: colors.text.secondary }}>
          No activity yet. Start completing binds to build your history!
        </Text>
      </View>
    );
  }

  // Group items by date
  const groupedItems = filteredItems.reduce(
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
    // Color scheme:
    // - Thread (journals/reflections): Violet (#9D71E8)
    // - Bind (completions): Emerald (#10D87E)
    // - Weave Chat (AI conversations): Blue (#5B8DEF)
    const getTypeConfig = (type: string) => {
      switch (type) {
        case 'journal':
          return { label: 'Thread', color: colors.violet[500], icon: 'book' as const };
        case 'completion':
          return { label: 'Bind', color: colors.emerald[500], icon: 'checkmark-circle' as const };
        case 'weave_chat':
          return { label: 'Weave', color: colors.accent[500], icon: 'chatbubbles' as const };
        default:
          return {
            label: 'Activity',
            color: colors.text.secondary,
            icon: 'ellipse' as const,
          };
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
      const dateStr = formatLocalDate(date);
      router.push(`/(tabs)/dashboard/daily/${dateStr}` as any);
    };

    return (
      <Pressable onPress={handlePress} style={styles.cardWrapper}>
        <Card variant="glass" style={styles.historyCard}>
          {/* Header row: Type badge and timestamp */}
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '30' }]}>
              <Ionicons name={config.icon} size={14} color={config.color} />
              <Text variant="textSm" weight="medium" style={{ color: config.color }}>
                {config.label}
              </Text>
            </View>
            <Text variant="textSm" style={{ color: colors.text.muted }}>
              {formatTime(item.timestamp)}
            </Text>
          </View>

          {/* Content */}
          <Text
            variant="textBase"
            weight="medium"
            numberOfLines={3}
            style={[styles.content, { color: colors.text.primary }]}
          >
            {getContent()}
          </Text>

          {/* Footer row: View arrow */}
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </View>
        </Card>
      </Pressable>
    );
  };

  // Render grouped by date
  return (
    <View style={styles.container}>
      {Object.entries(groupedItems).map(([date, items]) => (
        <View key={date} style={styles.dateGroup}>
          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.dateHeader, { color: colors.text.secondary }]}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
