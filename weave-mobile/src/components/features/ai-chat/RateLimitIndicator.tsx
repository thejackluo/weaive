/**
 * RateLimitIndicator - Usage Stats Display (Story 6.1)
 *
 * Features:
 * - Shows tiered usage: premium (10/day) + free (40/day) + monthly (500/month)
 * - Visual progress bars for each tier
 * - Countdown timer to midnight reset when rate limited
 * - Glassmorphism design
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface RateLimitIndicatorProps {
  premiumUsed: number;
  premiumLimit: number;
  freeUsed: number;
  freeLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  isRateLimited: boolean;
}

export default function RateLimitIndicator({
  premiumUsed,
  premiumLimit,
  freeUsed,
  freeLimit,
  monthlyUsed,
  monthlyLimit,
  isRateLimited,
}: RateLimitIndicatorProps) {
  const [timeToReset, setTimeToReset] = useState('');
  const [isExpanded, setIsExpanded] = useState(false); // ✅ FIX: Collapsed by default
  const heightValue = useSharedValue(0);

  useEffect(() => {
    if (isRateLimited) {
      // Calculate time until midnight
      const updateTimer = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        const diff = midnight.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeToReset(`${hours}h ${minutes}m`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [isRateLimited]);

  const premiumPercent = premiumLimit > 0 ? (premiumUsed / premiumLimit) * 100 : 0;
  const freePercent = freeLimit > 0 ? (freeUsed / freeLimit) * 100 : 0;
  const monthlyPercent = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;

  // Animated height for collapse/expand
  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(heightValue.value, { duration: 300 }),
    opacity: withTiming(heightValue.value > 0 ? 1 : 0, { duration: 200 }),
  }));

  // Update height when expanded state changes
  useEffect(() => {
    heightValue.value = isExpanded ? (isRateLimited ? 80 : 200) : 0;
  }, [isExpanded, isRateLimited]);

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <BlurView intensity={15} tint="dark" style={styles.container}>
        {/* ✅ FIX: Collapsible header */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitle}>Daily Usage</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerSummary}>
              {premiumUsed + freeUsed}/{premiumLimit + freeLimit}
            </Text>
            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* ✅ FIX: Animated collapsible content */}
        <Animated.View style={[styles.contentWrapper, animatedStyle]}>
          {isRateLimited ? (
            // Rate Limited View
            <View style={styles.rateLimitedContainer}>
              <Text style={styles.rateLimitedTitle}>⏳ Rate Limit Reached</Text>
              <Text style={styles.rateLimitedText}>Resets in {timeToReset}</Text>
            </View>
          ) : (
            // Usage Stats View
            <View style={styles.statsContainer}>
              <Text style={styles.title}>Daily Usage</Text>

              {/* Premium Messages */}
              <View style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Premium (Sonnet)</Text>
                  <Text style={styles.statValue}>
                    {premiumUsed}/{premiumLimit}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressPremium,
                      { width: `${Math.min(premiumPercent, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Free Messages */}
              <View style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Free (Haiku/Mini)</Text>
                  <Text style={styles.statValue}>
                    {freeUsed}/{freeLimit}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressFree,
                      { width: `${Math.min(freePercent, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Monthly Total */}
              <View style={[styles.statRow, styles.monthlyRow]}>
                <View style={styles.statHeader}>
                  <Text style={[styles.statLabel, styles.monthlyLabel]}>Monthly Total</Text>
                  <Text style={[styles.statValue, styles.monthlyValue]}>
                    {monthlyUsed}/{monthlyLimit}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressMonthly,
                      { width: `${Math.min(monthlyPercent, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSummary: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
  },
  contentWrapper: {
    overflow: 'hidden',
  },
  rateLimitedContainer: {
    padding: 16,
    alignItems: 'center',
  },
  rateLimitedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444', // Red
    marginBottom: 4,
  },
  rateLimitedText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  statsContainer: {
    padding: 14,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statRow: {
    marginBottom: 10,
  },
  monthlyRow: {
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#d1d5db',
  },
  monthlyLabel: {
    fontWeight: '600',
    color: '#e5e7eb',
  },
  statValue: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  monthlyValue: {
    color: '#a78bfa', // Purple
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPremium: {
    backgroundColor: '#3b82f6', // Blue
  },
  progressFree: {
    backgroundColor: '#10b981', // Green
  },
  progressMonthly: {
    backgroundColor: '#a78bfa', // Purple
  },
});
