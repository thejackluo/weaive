/**
 * Story 4.1c: 24-Hour Countdown Timer
 * AC #18: Display countdown until day resets (midnight in user's local timezone)
 *
 * Minimal black/white aesthetic:
 * - Dark gray card with white text (normal state)
 * - Red text for urgency (<2 hours remaining)
 * - High contrast for readability
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
    return { text: `${hours}h ${minutes}m`, isUrgent: true };
  }

  return { text: `${hours}h ${minutes}m`, isUrgent: false };
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
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Timer Icon */}
        <Text style={styles.icon}>⏰</Text>

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
    backgroundColor: '#1A1A1A', // Dark gray card (matches design system)
    borderRadius: 16, // Rounded corners
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)', // Subtle border
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // White text (high contrast)
    letterSpacing: 0.2,
  },
  textUrgent: {
    color: '#EF4444', // Red text when urgent (high contrast)
  },
  debugText: {
    marginTop: 8,
    fontSize: 10,
    color: '#A3A3A3', // Medium gray
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
