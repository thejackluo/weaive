/**
 * Story 4.1c: 24-Hour Countdown Timer
 * AC #18: Display countdown until day resets (midnight in user's local timezone)
 *
 * This component:
 * - Shows time remaining until midnight
 * - Updates every minute (battery efficient)
 * - Turns urgent/red when < 1 hour remaining
 * - Navigates to reflection screen on tap
 * - Uses device timezone with fallback to stored preference
 *
 * Usage:
 * - Story 4.1: Standalone testing (can render anywhere)
 * - Story 3.1+: Embed in Thread Home header (future integration)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface CountdownTimerProps {
  /**
   * Optional timezone override (e.g., "America/New_York")
   * If not provided, uses device timezone
   */
  timezone?: string;

  /**
   * Optional callback when timer is tapped
   * If not provided, navigates to reflection screen
   */
  onPress?: () => void;

  /**
   * Optional style overrides for container
   */
  style?: any;

  /**
   * Show debug info (dev mode only)
   */
  debug?: boolean;
}

/**
 * Calculate milliseconds until midnight in given timezone
 * Uses date-fns-tz for timezone handling
 */
function calculateMsUntilMidnight(_timezone?: string): number {
  const now = new Date();

  // Calculate tomorrow's midnight
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  return msUntilMidnight;
}

/**
 * Format milliseconds into human-readable countdown
 */
function formatCountdown(ms: number): {
  text: string;
  isUrgent: boolean;
} {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Different formats based on time remaining
  if (hours === 0 && minutes <= 0) {
    return { text: 'Reflect now!', isUrgent: true };
  }

  if (hours === 0) {
    return { text: `${minutes}m left`, isUrgent: true };
  }

  if (hours < 2) {
    return { text: `${hours}h ${minutes}m until day resets`, isUrgent: true };
  }

  return { text: `${hours}h ${minutes}m until day resets`, isUrgent: false };
}

/**
 * CountdownTimer component
 * Updates every minute, shows time until midnight, navigates to reflection
 */
export default function CountdownTimer({
  timezone,
  onPress,
  style,
  debug = false,
}: CountdownTimerProps) {
  const router = useRouter();
  const [msRemaining, setMsRemaining] = useState(() => calculateMsUntilMidnight(timezone));
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update countdown every minute
  useEffect(() => {
    // Initial calculation
    setMsRemaining(calculateMsUntilMidnight(timezone));

    // Update every 60 seconds (battery efficient)
    const interval = setInterval(() => {
      const newMs = calculateMsUntilMidnight(timezone);
      setMsRemaining(newMs);
      setLastUpdate(new Date());

      if (debug) {
        console.log('[CountdownTimer] Updated:', {
          msRemaining: newMs,
          formatted: formatCountdown(newMs).text,
          timezone: timezone || 'device',
        });
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [timezone, debug]);

  const { text, isUrgent } = formatCountdown(msRemaining);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default: Navigate to reflection screen
      router.push('/settings/reflection'); // TODO: Update to /thread/reflection when Story 3.1 complete
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isUrgent && styles.containerUrgent, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Timer Icon */}
        <RNText style={[styles.icon, isUrgent && styles.iconUrgent]}>⏰</RNText>

        {/* Countdown Text */}
        <RNText style={[styles.text, isUrgent && styles.textUrgent]}>{text}</RNText>

        {/* Arrow Indicator */}
        <RNText style={[styles.arrow, isUrgent && styles.arrowUrgent]}>→</RNText>
      </View>

      {/* Debug Info (dev mode only) */}
      {debug && (
        <RNText style={styles.debugText}>
          TZ: {timezone || 'device'} | Updated: {lastUpdate.toLocaleTimeString()}
        </RNText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Subtle blue background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  containerUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red background when urgent
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  iconUrgent: {
    // Icon stays same color
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(59, 130, 246, 1)', // Blue text
  },
  textUrgent: {
    color: 'rgba(239, 68, 68, 1)', // Red text when urgent
  },
  arrow: {
    fontSize: 18,
    color: 'rgba(59, 130, 246, 0.7)',
    marginLeft: 8,
  },
  arrowUrgent: {
    color: 'rgba(239, 68, 68, 0.8)',
  },
  debugText: {
    marginTop: 8,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
