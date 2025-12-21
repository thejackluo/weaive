/**
 * Weave Design System - ConsistencyHeatmap Component
 *
 * Calendar-style heatmap showing daily consistency
 * Color intensity based on completion percentage
 * Interactive tapping to view details
 *
 * Usage:
 * <ConsistencyHeatmap
 *   data={[
 *     { date: '2025-12-01', percentage: 100 },
 *     { date: '2025-12-02', percentage: 75 },
 *     { date: '2025-12-03', percentage: 50 },
 *   ]}
 *   onDayPress={(date) => showDetails(date)}
 * />
 */

import React, { useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export interface DayData {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;

  /** Consistency percentage (0-100) */
  percentage: number;
}

export interface ConsistencyHeatmapProps {
  /** Array of day data */
  data: DayData[];

  /** Number of weeks to show */
  weeks?: number;

  /** Day press handler */
  onDayPress?: (date: string, percentage: number) => void;

  /** Show month labels */
  showMonthLabels?: boolean;

  /** Show day labels (M, T, W, etc.) */
  showDayLabels?: boolean;

  /** Custom style */
  style?: ViewStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SIZE = 12;
const CELL_GAP = 4;

export function ConsistencyHeatmap({
  data,
  weeks = 8,
  onDayPress,
  showMonthLabels = true,
  showDayLabels = true,
  style,
}: ConsistencyHeatmapProps) {
  const { colors, radius, spacing } = useTheme();

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((day) => {
      map.set(day.date, day.percentage);
    });
    return map;
  }, [data]);

  // Generate calendar grid (7 rows x weeks columns)
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const grid: Array<Array<{ date: string; percentage: number }>> = [];
    const monthLabels: Array<{ col: number; label: string }> = [];

    let currentMonth = '';

    // Generate 7 rows (days of week) x weeks columns
    for (let col = 0; col < weeks; col++) {
      const column: Array<{ date: string; percentage: number }> = [];

      for (let row = 0; row < 7; row++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + col * 7 + row);

        const dateStr = date.toISOString().split('T')[0];
        const percentage = dataMap.get(dateStr) || 0;

        column.push({ date: dateStr, percentage });

        // Track month changes for labels
        if (row === 0) {
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          if (month !== currentMonth) {
            currentMonth = month;
            monthLabels.push({ col, label: month });
          }
        }
      }

      grid.push(column);
    }

    return { grid, monthLabels };
  }, [weeks, dataMap]);

  return (
    <View style={[styles.container, style]}>
      {/* Month labels */}
      {showMonthLabels && (
        <View style={[styles.monthLabels, { marginBottom: spacing[2] }]}>
          {monthLabels.map((label, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: label.col * (CELL_SIZE + CELL_GAP) + (showDayLabels ? 24 : 0),
              }}
            >
              <Text variant="labelXs" color="muted">
                {label.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Heatmap grid */}
      <View style={styles.gridContainer}>
        {/* Day labels */}
        {showDayLabels && (
          <View style={[styles.dayLabels, { marginRight: spacing[2] }]}>
            {DAYS_OF_WEEK.map((day, i) => (
              <View
                key={i}
                style={{
                  height: CELL_SIZE,
                  marginBottom: i < 6 ? CELL_GAP : 0,
                  justifyContent: 'center',
                }}
              >
                <Text variant="labelXs" color="muted">
                  {day}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Grid */}
        <View style={styles.grid}>
          {grid.map((column, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.column,
                { marginRight: colIndex < weeks - 1 ? CELL_GAP : 0 },
              ]}
            >
              {column.map((day, rowIndex) => (
                <HeatmapCell
                  key={`${colIndex}-${rowIndex}`}
                  date={day.date}
                  percentage={day.percentage}
                  size={CELL_SIZE}
                  radius={radius.sm}
                  colors={colors}
                  onPress={onDayPress}
                  style={{ marginBottom: rowIndex < 6 ? CELL_GAP : 0 }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { marginTop: spacing[4] }]}>
        <Text variant="labelXs" color="muted" style={{ marginRight: spacing[2] }}>
          Less
        </Text>
        {[0, 25, 50, 75, 100].map((pct, i) => (
          <View
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: radius.sm,
              backgroundColor: getHeatmapColor(pct, colors),
              marginRight: i < 4 ? CELL_GAP : spacing[2],
            }}
          />
        ))}
        <Text variant="labelXs" color="muted">
          More
        </Text>
      </View>
    </View>
  );
}

// =============================================================================
// HEATMAP CELL
// =============================================================================

interface HeatmapCellProps {
  date: string;
  percentage: number;
  size: number;
  radius: number;
  colors: any;
  onPress?: (date: string, percentage: number) => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function HeatmapCell({
  date,
  percentage,
  size,
  radius,
  colors,
  onPress,
  style,
}: HeatmapCellProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(1.2, {
      damping: 15,
      stiffness: 400,
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onPress && percentage > 0) {
      onPress(date, percentage);
    }
  }, [onPress, date, percentage]);

  const backgroundColor = getHeatmapColor(percentage, colors);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress || percentage === 0}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
          borderWidth: percentage === 0 ? 1 : 0,
          borderColor: colors.border.subtle,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getHeatmapColor(percentage: number, colors: any): string {
  if (percentage === 0) return 'transparent';
  if (percentage < 25) return colors.semantic.error.subtle;
  if (percentage < 50) return colors.semantic.error.emphasis;
  if (percentage < 75) return colors.semantic.warning.emphasis;
  if (percentage < 90) return colors.semantic.success.emphasis;
  return colors.semantic.success.strong;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  monthLabels: {
    flexDirection: 'row',
    position: 'relative',
    height: 16,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default ConsistencyHeatmap;
