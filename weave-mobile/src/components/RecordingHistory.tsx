/**
 * RecordingHistory Component
 *
 * Displays a list of past audio recordings with transcripts and playback
 *
 * Features:
 * - List view with date grouping
 * - Show transcript preview (first 100 chars)
 * - Playback controls for each recording
 * - Empty state when no recordings
 * - Loading state
 * - Pull-to-refresh
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Card } from '@/design-system/components/Card/Card';
import { AudioPlayer } from './AudioPlayer';
import { useRecordingHistory, RecordingCapture } from '@/hooks/useRecordingHistory';

export interface RecordingHistoryProps {
  /**
   * Maximum number of characters to show in transcript preview
   * Default: 100
   */
  maxPreviewLength?: number;

  /**
   * Callback when a recording is selected
   */
  onRecordingPress?: (recording: RecordingCapture) => void;

  /**
   * Whether the list should be scrollable
   * Set to false when inside another ScrollView to avoid nested virtualized list warning
   * Default: true
   */
  scrollEnabled?: boolean;
}

export function RecordingHistory({
  maxPreviewLength = 100,
  onRecordingPress,
  scrollEnabled = true,
}: RecordingHistoryProps) {
  const { colors, spacing, radius } = useTheme();
  const { data: recordings, isLoading, error, refetch } = useRecordingHistory();

  const [expandedRecordingId, setExpandedRecordingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /**
   * Toggle recording expansion
   */
  const toggleExpand = (recordingId: string) => {
    setExpandedRecordingId(expandedRecordingId === recordingId ? null : recordingId);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get audio URL from recording item
   * Returns signed URL if available, null otherwise
   */
  const getAudioUrl = (item: RecordingCapture): string | null => {
    return item.audio_url || null;
  };

  /**
   * Render empty state
   */
  if (!isLoading && (!recordings || recordings.length === 0)) {
    return (
      <Card variant="glass" style={{ padding: spacing[6] }}>
        <View style={styles.emptyState}>
          <MaterialIcons name="mic-none" size={64} color={colors.text.secondary} />
          <Text variant="textLg" style={{ color: colors.text.primary, marginTop: spacing[4] }}>
            No recordings yet
          </Text>
          <Text
            variant="textBase"
            style={{ color: colors.text.secondary, marginTop: spacing[2], textAlign: 'center' }}
          >
            Start recording to see your audio history here
          </Text>
        </View>
      </Card>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Card variant="glass" style={{ padding: spacing[6] }}>
        <View style={styles.emptyState}>
          <MaterialIcons name="error" size={64} color={colors.text.error} />
          <Text
            variant="textLg"
            style={{ color: colors.text.error, marginTop: spacing[4], textAlign: 'center' }}
          >
            Failed to load recordings
          </Text>
          <Text
            variant="textBase"
            style={{ color: colors.text.secondary, marginTop: spacing[2], textAlign: 'center' }}
          >
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </Text>
        </View>
      </Card>
    );
  }

  /**
   * Render recording item
   */
  const renderRecording = ({ item }: { item: RecordingCapture }) => {
    const isExpanded = expandedRecordingId === item.id;
    const hasTranscript = item.content_text && item.content_text.length > 0;
    const transcriptPreview = hasTranscript
      ? item.content_text!.substring(0, maxPreviewLength) +
        (item.content_text!.length > maxPreviewLength ? '...' : '')
      : 'No transcript available';

    return (
      <Card variant="glass" style={{ padding: spacing[4], marginBottom: spacing[4] }}>
        <Pressable
          onPress={() => {
            toggleExpand(item.id);
            if (onRecordingPress) {
              onRecordingPress(item);
            }
          }}
        >
          {/* Header */}
          <View style={styles.recordingHeader}>
            <View style={styles.recordingHeaderLeft}>
              <MaterialIcons name="mic" size={20} color={colors.accent[500]} />
              <Text
                variant="textSm"
                style={{ color: colors.text.secondary, marginLeft: spacing[2] }}
              >
                {formatDate(item.created_at)} at {formatTime(item.created_at)}
              </Text>
            </View>
            <Text variant="textSm" style={{ color: colors.text.secondary }}>
              {formatDuration(item.duration_sec)}
            </Text>
          </View>

          {/* Transcript preview */}
          <Text
            variant="textBase"
            style={{
              color: hasTranscript ? colors.text.primary : colors.text.secondary,
              marginTop: spacing[3],
              fontStyle: hasTranscript ? 'normal' : 'italic',
            }}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {transcriptPreview}
          </Text>

          {/* Confidence badge (if transcribed) */}
          {hasTranscript && item.confidence_score !== undefined && (
            <View style={[styles.confidenceBadge, { marginTop: spacing[3] }]}>
              <MaterialIcons
                name={item.confidence_score >= 0.9 ? 'check-circle' : 'warning'}
                size={14}
                color={item.confidence_score >= 0.9 ? colors.text.success : colors.text.warning}
              />
              <Text
                variant="textXs"
                style={{
                  color: item.confidence_score >= 0.9 ? colors.text.success : colors.text.warning,
                  marginLeft: spacing[2],
                }}
              >
                {(item.confidence_score * 100).toFixed(0)}% confidence
                {item.provider ? ` · ${item.provider}` : ''}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Audio player (shown when expanded) */}
        {isExpanded && (
          <View style={{ marginTop: spacing[4] }}>
            {getAudioUrl(item) ? (
              <AudioPlayer audioUri={getAudioUrl(item)!} showSpeedControl={true} />
            ) : (
              <View
                style={{
                  padding: spacing[4],
                  backgroundColor: colors.background.tertiary,
                  borderRadius: 8,
                }}
              >
                <Text
                  variant="textSm"
                  style={{ color: colors.text.secondary, textAlign: 'center' }}
                >
                  Audio URL not available. Please refresh to reload.
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    );
  };

  // Header component
  const listHeader = (
    <View style={{ marginBottom: spacing[4] }}>
      <Text variant="textLg" style={{ fontWeight: '600', color: colors.text.primary }}>
        Recording History
      </Text>
      <Text variant="textSm" style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
        {recordings?.length || 0} recordings
      </Text>
    </View>
  );

  // If not scrollable, render as simple View (for use inside another ScrollView)
  if (!scrollEnabled) {
    return (
      <View>
        {listHeader}
        {recordings?.map((item) => (
          <View key={item.id}>{renderRecording({ item })}</View>
        ))}
      </View>
    );
  }

  // Otherwise, use FlatList with virtualization
  return (
    <FlatList
      data={recordings}
      renderItem={renderRecording}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: spacing[6] }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent[500]}
        />
      }
      ListHeaderComponent={listHeader}
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
