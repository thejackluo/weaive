/**
 * Story 0.11: RateLimitIndicator Component
 *
 * Displays STT usage against daily limits
 *
 * Limits:
 * - 50 transcription requests per day
 * - 300 minutes audio per day
 *
 * Features:
 * - Visual progress bar
 * - Usage text (e.g., "15/50 requests, 45/300 minutes")
 * - Warning state when approaching limit (>80%)
 * - Error state when limit exceeded
 * - Reset time countdown
 *
 * Usage:
 * ```tsx
 * <RateLimitIndicator
 *   requestCount={15}
 *   durationMinutes={45}
 *   onLimitExceeded={() => Alert.alert('Limit reached')}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface RateLimitIndicatorProps {
  /**
   * Current request count for today
   */
  requestCount: number;

  /**
   * Current audio duration in minutes for today
   */
  durationMinutes: number;

  /**
   * Maximum requests per day
   * Default: 50
   */
  maxRequests?: number;

  /**
   * Maximum audio minutes per day
   * Default: 300
   */
  maxMinutes?: number;

  /**
   * Whether to show compact view
   * Default: false
   */
  compact?: boolean;

  /**
   * Callback when limit is exceeded
   */
  onLimitExceeded?: () => void;
}

export function RateLimitIndicator({
  requestCount,
  durationMinutes,
  maxRequests = 50,
  maxMinutes = 300,
  compact = false,
  onLimitExceeded: _onLimitExceeded,
}: RateLimitIndicatorProps) {
  /**
   * Calculate usage percentages
   */
  const requestPercentage = Math.min(100, (requestCount / maxRequests) * 100);
  const durationPercentage = Math.min(100, (durationMinutes / maxMinutes) * 100);

  /**
   * Determine status level
   */
  const getStatusLevel = (percentage: number): 'normal' | 'warning' | 'error' => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'normal';
  };

  const requestStatus = getStatusLevel(requestPercentage);
  const durationStatus = getStatusLevel(durationPercentage);
  const overallStatus =
    requestStatus === 'error' || durationStatus === 'error'
      ? 'error'
      : requestStatus === 'warning' || durationStatus === 'warning'
        ? 'warning'
        : 'normal';

  /**
   * Get status color
   */
  const getStatusColor = (status: 'normal' | 'warning' | 'error'): string => {
    switch (status) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: 'normal' | 'warning' | 'error'): string => {
    switch (status) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'check-circle';
    }
  };

  /**
   * Calculate time until reset (midnight)
   */
  const getTimeUntilReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(
      ((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hoursUntilReset}h ${minutesUntilReset}m`;
  };

  /**
   * Render progress bar
   */
  const renderProgressBar = (percentage: number, status: 'normal' | 'warning' | 'error') => {
    return (
      <View
        style={[
          styles.progressBarContainer,
          {
            backgroundColor: '#3f3f46',
            borderRadius: 4,
          },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getStatusColor(status),
              borderRadius: 4,
            },
          ]}
        />
      </View>
    );
  };

  if (compact) {
    // Compact view - just show icon and percentage
    return (
      <View style={styles.compactContainer}>
        <MaterialIcons
          name={getStatusIcon(overallStatus) as any}
          size={20}
          color={getStatusColor(overallStatus)}
        />
        <RNText style={{ fontSize: 12, color: getStatusColor(overallStatus), marginLeft: 8 }}>
          {Math.max(requestPercentage, durationPercentage).toFixed(0)}%
        </RNText>
      </View>
    );
  }

  return (
    <View style={[styles.card, { padding: 16 }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: 12 }]}>
          <View style={styles.headerLeft}>
            <MaterialIcons
              name={getStatusIcon(overallStatus) as any}
              size={20}
              color={getStatusColor(overallStatus)}
            />
            <Text
              style={{
                fontSize: 16,
                color: '#fafafa',
                marginLeft: 8,
                fontWeight: '600',
              }}
            >
              Daily Usage
            </RNText>
          </View>

          {overallStatus !== 'normal' && (
            <RNText style={{ fontSize: 12, color: '#a1a1aa' }}>
              Resets in {getTimeUntilReset()}
            </RNText>
          )}
        </View>

        {/* Request count */}
        <View style={{ marginBottom: 12 }}>
          <View style={[styles.labelRow, { marginBottom: 8 }]}>
            <RNText style={{ fontSize: 14, color: '#a1a1aa' }}>
              Transcriptions
            </RNText>
            <Text
              style={{
                fontSize: 14,
                color: requestStatus === 'error' ? '#ef4444' : '#fafafa',
                fontWeight: '600',
              }}
            >
              {requestCount}/{maxRequests}
            </RNText>
          </View>
          {renderProgressBar(requestPercentage, requestStatus)}
        </View>

        {/* Duration */}
        <View>
          <View style={[styles.labelRow, { marginBottom: 8 }]}>
            <RNText style={{ fontSize: 14, color: '#a1a1aa' }}>
              Audio duration
            </RNText>
            <Text
              style={{
                fontSize: 14,
                color: durationStatus === 'error' ? '#ef4444' : '#fafafa',
                fontWeight: '600',
              }}
            >
              {durationMinutes.toFixed(0)}/{maxMinutes} min
            </RNText>
          </View>
          {renderProgressBar(durationPercentage, durationStatus)}
        </View>

        {/* Warning message */}
        {overallStatus === 'error' && (
          <View style={[styles.warningContainer, { marginTop: 12 }]}>
            <RNText style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>
              Daily limit reached. Limit resets at midnight.
            </RNText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  container: {
    width: '100%',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  warningContainer: {
    paddingVertical: 8,
  },
});
