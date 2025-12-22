/**
 * Story 0.11: AudioWaveform Component
 *
 * Displays audio waveform visualization as animated bars
 *
 * Modes:
 * - Live mode: Real-time waveform during recording (animated)
 * - Static mode: Fixed waveform from metering history (non-animated)
 *
 * Features:
 * - 20-30 bars with smooth spring animations
 * - Responsive width (fills container)
 * - Customizable colors and bar count
 * - Interpolates sparse metering data to fill all bars
 *
 * Usage:
 * ```tsx
 * // Live mode (during recording)
 * <AudioWaveform
 *   meteringData={meteringHistory}
 *   isLive={true}
 *   barCount={30}
 * />
 *
 * // Static mode (after recording)
 * <AudioWaveform
 *   meteringData={recordingResult.meteringData}
 *   isLive={false}
 *   barCount={30}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/design-system/theme/ThemeProvider';

export interface AudioWaveformProps {
  /**
   * Array of metering values (-160 to 0 dB)
   * Values are normalized to 0.0-1.0 internally
   */
  meteringData?: number[];

  /**
   * Whether waveform is live (animating with new data)
   * Default: false
   */
  isLive?: boolean;

  /**
   * Number of bars to display
   * Default: 30
   */
  barCount?: number;

  /**
   * Height of the waveform in pixels
   * Default: 60
   */
  height?: number;

  /**
   * Gap between bars in pixels
   * Default: 2
   */
  barGap?: number;

  /**
   * Color of the waveform bars
   * Default: theme primary color
   */
  color?: string;

  /**
   * Minimum bar height as fraction of total height
   * Default: 0.1 (10%)
   */
  minBarHeight?: number;
}

export function AudioWaveform({
  meteringData = [],
  isLive = false,
  barCount = 30,
  height = 60,
  barGap = 2,
  color,
  minBarHeight = 0.1,
}: AudioWaveformProps) {
  const { colors } = useTheme();

  const waveformColor = color ?? colors.brand.primary.default;

  /**
   * Normalize dB value (-160 to 0) to 0.0-1.0 scale
   */
  const normalizeDb = (db: number): number => {
    // Clamp to reasonable range (-60 to 0 dB)
    const clampedDb = Math.max(-60, Math.min(0, db));

    // Convert to 0.0-1.0 scale
    const normalized = (clampedDb + 60) / 60;

    return Math.max(0, Math.min(1, normalized));
  };

  /**
   * Interpolate metering data to match bar count
   * Handles sparse data by interpolating between points
   */
  const interpolatedData = useMemo(() => {
    if (meteringData.length === 0) {
      // No data - return flat line at min height
      return Array(barCount).fill(minBarHeight);
    }

    if (meteringData.length >= barCount) {
      // More data than bars - sample evenly
      const step = meteringData.length / barCount;
      return Array.from({ length: barCount }, (_, i) => {
        const index = Math.floor(i * step);
        return normalizeDb(meteringData[index]);
      });
    } else {
      // Less data than bars - interpolate
      const result: number[] = [];
      const step = (meteringData.length - 1) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const exactIndex = i * step;
        const lowerIndex = Math.floor(exactIndex);
        const upperIndex = Math.ceil(exactIndex);

        if (lowerIndex === upperIndex) {
          // Exact match
          result.push(normalizeDb(meteringData[lowerIndex]));
        } else {
          // Interpolate between points
          const fraction = exactIndex - lowerIndex;
          const lowerValue = normalizeDb(meteringData[lowerIndex]);
          const upperValue = normalizeDb(meteringData[upperIndex]);
          const interpolated = lowerValue + (upperValue - lowerValue) * fraction;
          result.push(interpolated);
        }
      }

      return result;
    }
  }, [meteringData, barCount, minBarHeight]);

  /**
   * Render individual waveform bar
   */
  const renderBar = (amplitude: number, index: number) => {
    const barHeight = Math.max(minBarHeight, amplitude) * height;

    return (
      <View
        key={index}
        style={[
          styles.bar,
          {
            height: barHeight,
            backgroundColor: waveformColor,
            marginHorizontal: barGap / 2,
          },
        ]}
      />
    );
  };

  /**
   * Render animated waveform bar (for live mode)
   */
  const renderAnimatedBar = (amplitude: number, index: number) => {
    const animatedHeight = useSharedValue(minBarHeight * height);

    // Animate to new height with spring
    const targetHeight = Math.max(minBarHeight, amplitude) * height;
    if (isLive) {
      animatedHeight.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      animatedHeight.value = targetHeight;
    }

    const animatedStyle = useAnimatedStyle(() => {
      return {
        height: animatedHeight.value,
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.bar,
          animatedStyle,
          {
            backgroundColor: waveformColor,
            marginHorizontal: barGap / 2,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {interpolatedData.map((amplitude, index) =>
        isLive ? renderAnimatedBar(amplitude, index) : renderBar(amplitude, index)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bar: {
    flex: 1,
    borderRadius: 1.5,
    minHeight: 4,
  },
});
