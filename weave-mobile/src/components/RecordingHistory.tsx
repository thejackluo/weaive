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
import { View, FlatList, StyleSheet, RefreshControl, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
      <View style={[styles.card, { padding: 24 }]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="mic-none" size={64} color="#a1a1aa" />
          <Text style={{ fontSize: 18, color: '#fafafa', marginTop: 16 }}>
            No recordings yet
          </RNText>
          <Text style={{ fontSize: 16, color: '#a1a1aa', marginTop: 8, textAlign: 'center' }}>
            Start recording to see your audio history here
          </RNText>
        </View>
      </View>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <View style={[styles.card, { padding: 24 }]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="error" size={64} color="#ef4444" />
          <Text style={{ fontSize: 18, color: '#ef4444', marginTop: 16, textAlign: 'center' }}>
            Failed to load recordings
          </RNText>
          <Text style={{ fontSize: 16, color: '#a1a1aa', marginTop: 8, textAlign: 'center' }}>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </RNText>
        </View>
      </View>
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
      <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
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
              <MaterialIcons name="mic" size={20} color="#3b82f6" />
              <Text style={{ fontSize: 14, color: '#a1a1aa', marginLeft: 8 }}>
                {formatDate(item.created_at)} at {formatTime(item.created_at)}
              </RNText>
            </View>
            <Text style={{ fontSize: 14, color: '#a1a1aa' }}>
              {formatDuration(item.duration_sec)}
            </RNText>
          </View>

          {/* Transcript preview */}
          <Text
            style={{
              fontSize: 16,
              color: hasTranscript ? '#fafafa' : '#a1a1aa',
              marginTop: 12,
              fontStyle: hasTranscript ? 'normal' : 'italic',
            }}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {transcriptPreview}
          </RNText>

          {/* Confidence badge (if transcribed) */}
          {hasTranscript && item.confidence_score !== undefined && (
            <View style={[styles.confidenceBadge, { marginTop: 12 }]}>
              <MaterialIcons
                name={item.confidence_score >= 0.9 ? 'check-circle' : 'warning'}
                size={14}
                color={item.confidence_score >= 0.9 ? '#10b981' : '#f59e0b'}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: item.confidence_score >= 0.9 ? '#10b981' : '#f59e0b',
                  marginLeft: 8,
                }}
              >
                {(item.confidence_score * 100).toFixed(0)}% confidence
                {item.provider ? ` · ${item.provider}` : ''}
              </RNText>
            </View>
          )}
        </Pressable>

        {/* Audio player (shown when expanded) */}
        {isExpanded && (
          <View style={{ marginTop: 16 }}>
            {getAudioUrl(item) ? (
              <AudioPlayer audioUri={getAudioUrl(item)!} showSpeedControl={true} />
            ) : (
              <View
                style={{
                  padding: 16,
                  backgroundColor: '#18181b',
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: '#a1a1aa', textAlign: 'center' }}>
                  Audio URL not available. Please refresh to reload.
                </RNText>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Header component
  const listHeader = (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#fafafa' }}>
        Recording History
      </RNText>
      <Text style={{ fontSize: 14, color: '#a1a1aa', marginTop: 8 }}>
        {recordings?.length || 0} recordings
      </RNText>
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
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
        />
      }
      ListHeaderComponent={listHeader}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
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
