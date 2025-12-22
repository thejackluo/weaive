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
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Card } from '@/design-system/components/Card/Card';

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
  const { colors, spacing, radius } = useTheme();

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
        return colors.text.error;
      case 'warning':
        return colors.text.warning;
      default:
        return colors.text.success;
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
            backgroundColor: colors.neutral[700],
            borderRadius: radius.sm,
          },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getStatusColor(status),
              borderRadius: radius.sm,
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
        <Text
          variant="textXs"
          style={{ color: getStatusColor(overallStatus), marginLeft: spacing[2] }}
        >
          {Math.max(requestPercentage, durationPercentage).toFixed(0)}%
        </Text>
      </View>
    );
  }

  return (
    <Card variant="subtle" style={{ padding: spacing[4] }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing[3] }]}>
          <View style={styles.headerLeft}>
            <MaterialIcons
              name={getStatusIcon(overallStatus) as any}
              size={20}
              color={getStatusColor(overallStatus)}
            />
            <Text
              variant="textBase"
              style={{
                color: colors.text.primary,
                marginLeft: spacing[2],
                fontWeight: '600',
              }}
            >
              Daily Usage
            </Text>
          </View>

          {overallStatus !== 'normal' && (
            <Text variant="textXs" style={{ color: colors.text.secondary }}>
              Resets in {getTimeUntilReset()}
            </Text>
          )}
        </View>

        {/* Request count */}
        <View style={{ marginBottom: spacing[3] }}>
          <View style={[styles.labelRow, { marginBottom: spacing[2] }]}>
            <Text variant="textSm" style={{ color: colors.text.secondary }}>
              Transcriptions
            </Text>
            <Text
              variant="textSm"
              style={{
                color: requestStatus === 'error' ? colors.text.error : colors.text.primary,
                fontWeight: '600',
              }}
            >
              {requestCount}/{maxRequests}
            </Text>
          </View>
          {renderProgressBar(requestPercentage, requestStatus)}
        </View>

        {/* Duration */}
        <View>
          <View style={[styles.labelRow, { marginBottom: spacing[2] }]}>
            <Text variant="textSm" style={{ color: colors.text.secondary }}>
              Audio duration
            </Text>
            <Text
              variant="textSm"
              style={{
                color: durationStatus === 'error' ? colors.text.error : colors.text.primary,
                fontWeight: '600',
              }}
            >
              {durationMinutes.toFixed(0)}/{maxMinutes} min
            </Text>
          </View>
          {renderProgressBar(durationPercentage, durationStatus)}
        </View>

        {/* Warning message */}
        {overallStatus === 'error' && (
          <View style={[styles.warningContainer, { marginTop: spacing[3] }]}>
            <Text variant="textXs" style={{ color: colors.text.error, textAlign: 'center' }}>
              Daily limit reached. Limit resets at midnight.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
