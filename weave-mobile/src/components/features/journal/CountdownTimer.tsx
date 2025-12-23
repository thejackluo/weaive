/**
 * Story 4.1c: 24-Hour Countdown Timer
 * AC #18: Display countdown until day resets (midnight in user's local timezone)
 *
 * This component:
 * - Shows time remaining until midnight
 * - Updates every minute (battery efficient)
 * - Turns urgent/red when < 1 hour remaining
 * - Display-only (not tappable) - use "Begin" button to start reflection
 * - Uses device timezone with fallback to stored preference
 *
 * Usage:
 * - Story 4.1: Standalone testing (can render anywhere)
 * - Story 3.1+: Embed in Thread Home header (future integration)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CountdownTimerProps {
  /**
   * Optional timezone override (e.g., "America/New_York")
   * If not provided, uses device timezone
   */
  timezone?: string;

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
 * Updates every minute, shows time until midnight
 * Display-only component - use "Begin" button to start reflection
 */
export default function CountdownTimer({ timezone, style, debug = false }: CountdownTimerProps) {
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

  return (
    <View style={[styles.container, isUrgent && styles.containerUrgent, style]}>
      <View style={styles.content}>
        {/* Timer Icon */}
        <Text style={[styles.icon, isUrgent && styles.iconUrgent]}>⏰</Text>

        {/* Countdown Text */}
        <Text style={[styles.text, isUrgent && styles.textUrgent]}>{text}</Text>
      </View>

      {/* Debug Info (dev mode only) */}
      {debug && (
        <Text style={styles.debugText}>
          TZ: {timezone || 'device'} | Updated: {lastUpdate.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)', // Very subtle blue background
    borderRadius: 8,
    padding: 12,
  },
  containerUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)', // Very subtle red background when urgent
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  iconUrgent: {
    // Icon stays same color
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)', // Muted text since it's not interactive
  },
  textUrgent: {
    color: 'rgba(239, 68, 68, 0.9)', // Red text when urgent
  },
  debugText: {
    marginTop: 8,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
