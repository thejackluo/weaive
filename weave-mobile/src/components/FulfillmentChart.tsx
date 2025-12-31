/**
 * FulfillmentChart Component (US-5.3: Average Fulfillment Chart)
 *
 * Displays fulfillment trend data with:
 * - Daily fulfillment scores (0-10)
 * - Interactive tooltip on tap
 * - Dynamic scaling based on timeframe
 * - Clean bar chart visualization
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useFulfillmentData } from '@/hooks/useFulfillmentData';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface FulfillmentChartProps {
  timeframe: '7d' | '2w' | '1m';
  onTimeframeChange?: (timeframe: '7d' | '2w' | '1m') => void;
}

export function FulfillmentChart({ timeframe, onTimeframeChange }: FulfillmentChartProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, isError, error } = useFulfillmentData(timeframe);

  // State for interactions
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  // Refs for drag calculations (using refs so PanResponder closure has access to current values)
  const chartWidthRef = useRef<number>(0);
  const displayDataRef = useRef<any[]>([]);
  const barsContainerRef = useRef<View>(null);
  const barsContainerXRef = useRef<number>(0); // Absolute X position of bars container

  // Calculate which bar index is under the touch position
  // pageX is the absolute screen position, we convert to relative position within bars
  const getBarIndexFromTouch = (pageX: number): number | null => {
    const chartWidth = chartWidthRef.current;
    const barCount = displayDataRef.current.length;
    const containerX = barsContainerXRef.current;

    if (chartWidth === 0 || barCount === 0 || containerX === 0) {
      return null;
    }

    // Convert absolute pageX to position within the bars container
    const relativeX = pageX - containerX;

    // Each bar gets an equal-width "zone" for selection
    const barZoneWidth = chartWidth / barCount;
    let barIndex = Math.floor(relativeX / barZoneWidth);

    // Clamp to valid range
    barIndex = Math.max(0, Math.min(barIndex, barCount - 1));

    return barIndex;
  };

  // Handler for navigating to day details page
  const handleTooltipPress = (date: string, _fulfillmentScore: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(tabs)/dashboard/daily/${date}` as any);
  };

  // PanResponder for drag interaction across bars (MUST be before any conditional returns)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const barIndex = getBarIndexFromTouch(evt.nativeEvent.pageX);
        if (barIndex !== null) {
          // If tapping same bar, open modal
          if (barIndex === selectedBarIndex) {
            const day = displayDataRef.current[barIndex];
            if (day && day.hasData && day.fulfillment_score !== null) {
              handleTooltipPress(day.date, day.fulfillment_score);
            }
          } else {
            // Show tooltip for new bar
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedBarIndex(barIndex);
          }
        }
      },
      onPanResponderMove: (evt) => {
        const barIndex = getBarIndexFromTouch(evt.nativeEvent.pageX);
        if (barIndex !== null && barIndex !== selectedBarIndex) {
          Haptics.selectionAsync();
          setSelectedBarIndex(barIndex);
        }
      },
      onPanResponderRelease: () => {
        // Keep tooltip visible
      },
    })
  ).current;

  const timeframeOptions: ('7d' | '2w' | '1m')[] = ['7d', '2w', '1m'];

  if (isLoading) {
    return (
      <Card variant="glass" style={styles.card}>
        <ActivityIndicator size="large" color={colors.accent[500]} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card variant="glass" style={styles.card}>
        <Text variant="textSm" style={{ color: colors.text.error }}>
          Error loading fulfillment data: {error?.message}
        </Text>
      </Card>
    );
  }

  const fulfillmentData = data?.data || [];
  const averageFulfillment = data?.meta?.average_fulfillment || 0;

  // Calculate expected days based on timeframe
  const timeframeDays = { '7d': 7, '2w': 14, '1m': 30 };
  const expectedDays = timeframeDays[timeframe];

  // Calculate bar width percentage (for consistent column widths regardless of data points)
  const barWidthPercentage = 100 / expectedDays;

  // Calculate trend percentage (comparing first half vs second half)
  const calculateTrendPercentage = (): number => {
    if (fulfillmentData.length === 0) return 0;
    if (fulfillmentData.length === 1) return 0; // Can't calculate trend with 1 point

    const midpoint = Math.floor(fulfillmentData.length / 2);
    const firstHalf = fulfillmentData.slice(0, midpoint);
    const secondHalf = fulfillmentData.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.fulfillment_score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.fulfillment_score, 0) / secondHalf.length;

    if (firstAvg === 0) return 0;

    // Calculate percentage change
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    return Math.round(percentChange);
  };

  const trendPercentage = calculateTrendPercentage();

  // Show empty state if no data
  if (fulfillmentData.length === 0) {
    return (
      <Card variant="glass" style={styles.card}>
        <View style={styles.headerSection}>
          <Text variant="textLg" weight="semibold">
            Average Fulfillment
          </Text>
          <Text variant="displayLg" weight="bold" style={styles.averageText}>
            0.0
          </Text>
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.text.muted} />
          <Text
            variant="textBase"
            style={{ color: colors.text.secondary, marginTop: 16, textAlign: 'center' }}
          >
            No fulfillment data yet. Submit a daily reflection and your fulfillment score will
            appear here!
          </Text>
        </View>
      </Card>
    );
  }

  // Always use 10 as max for consistent Y-axis scale

  // Generate full timeframe array with placeholders for missing days
  // Ordered chronologically from oldest (left) to most recent (right)
  const generateFullTimeframe = () => {
    const today = new Date();
    const result = [];

    for (let i = 0; i < expectedDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find data for this date
      const dayData = fulfillmentData.find((d) => d.date === dateStr);

      result.push({
        date: dateStr,
        fulfillment_score: dayData ? Math.min(dayData.fulfillment_score, 10) : null, // null = no data
        hasData: !!dayData,
      });
    }

    // Reverse to show chronological order (oldest → newest, left → right)
    return result.reverse();
  };

  const displayData = generateFullTimeframe();

  // Update ref so PanResponder has access to current data
  displayDataRef.current = displayData;

  // Note: dateLabelIndices logic removed - now showing all dates on X-axis

  // Format date label - numeric format MM/DD
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // Handler for chart layout measurement
  const handleChartLayout = () => {
    if (barsContainerRef.current) {
      barsContainerRef.current.measure((_fx, _fy, width, _height, px, _py) => {
        chartWidthRef.current = width;
        barsContainerXRef.current = px;
      });
    }
  };

  // Handler for dismissing tooltip (tap outside chart)
  const handleDismissTooltip = () => {
    if (selectedBarIndex !== null) {
      setSelectedBarIndex(null);
    }
  };

  return (
    <Pressable onPress={handleDismissTooltip}>
      <Card variant="glass" style={styles.card}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleAndDropdownRow}>
            <Text variant="textLg" weight="semibold">
              Average Fulfillment
            </Text>

            {/* Timeframe Dropdown */}
            {onTimeframeChange && (
              <View>
                <Pressable
                  style={[
                    styles.timeframeDropdown,
                    { backgroundColor: colors.background.elevated },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowTimeframeDropdown(!showTimeframeDropdown);
                  }}
                >
                  <Text variant="textSm" style={{ color: colors.text.secondary }}>
                    {timeframe}
                  </Text>
                  <Ionicons
                    name={showTimeframeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.text.secondary}
                  />
                </Pressable>

                {/* Dropdown Menu */}
                {showTimeframeDropdown && (
                  <View
                    style={[styles.dropdownMenu, { backgroundColor: colors.background.elevated }]}
                  >
                    {timeframeOptions.map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.dropdownItem,
                          timeframe === option && { backgroundColor: colors.accent[500] },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          onTimeframeChange(option);
                          setShowTimeframeDropdown(false);
                        }}
                      >
                        <Text
                          variant="textSm"
                          weight={timeframe === option ? 'semibold' : 'regular'}
                          style={{
                            color:
                              timeframe === option ? colors.text.primary : colors.text.secondary,
                          }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Average Score Display with Trend Badge */}
          <View style={styles.averageRow}>
            <Text variant="displayLg" weight="bold" style={styles.averageText}>
              {averageFulfillment.toFixed(1)}
            </Text>
            {fulfillmentData.length > 1 && (
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor:
                      trendPercentage >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  },
                ]}
              >
                <Text
                  variant="textSm"
                  weight="semibold"
                  style={{
                    color: trendPercentage >= 0 ? colors.emerald[500] : colors.rose[500],
                  }}
                >
                  {trendPercentage >= 0 ? '+' : ''}
                  {trendPercentage}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Separator line */}
        <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

        {/* Chart with Y-axis */}
        <View style={styles.chartWithLabelsContainer}>
          <View style={styles.chartRow}>
            {/* Y-axis labels - perfectly aligned */}
            <View style={styles.yAxis}>
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                10
              </Text>
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                5
              </Text>
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                0
              </Text>
            </View>

            {/* Bars container */}
            <View style={styles.chartArea}>
              <View
                ref={barsContainerRef}
                style={styles.barsContainer}
                onLayout={handleChartLayout}
                {...panResponder.panHandlers}
              >
                {displayData.map((day, index) => {
                  // Only calculate score height if there's data
                  const hasData = day.hasData && day.fulfillment_score !== null;
                  const score = day.fulfillment_score ?? 0;
                  const clampedScore = hasData ? Math.max(0, Math.min(score, 10)) : 0;
                  const scoreHeight = hasData ? Math.max(2, (clampedScore / 10) * 100) : 0;
                  const isSelected = selectedBarIndex === index && hasData;

                  return (
                    <View
                      key={day.date}
                      style={[styles.barColumn, { width: `${barWidthPercentage}%` }]}
                    >
                      {/* Tooltip - only show if there's data */}
                      {isSelected && (
                        <Pressable
                          style={[styles.tooltip, { backgroundColor: colors.background.elevated }]}
                          onPress={() => handleTooltipPress(day.date, day.fulfillment_score!)}
                        >
                          <View style={styles.tooltipIcon}>
                            <Ionicons
                              name="arrow-forward-outline"
                              size={12}
                              color={colors.text.muted}
                              style={{ transform: [{ rotate: '-45deg' }] }}
                            />
                          </View>
                          <Text
                            variant="textSm"
                            weight="semibold"
                            numberOfLines={1}
                            style={{ color: colors.text.primary }}
                          >
                            {formatDateLabel(day.date)}
                          </Text>
                          <Text
                            variant="textLg"
                            weight="bold"
                            style={{ color: colors.text.muted, marginTop: 4 }}
                          >
                            {clampedScore.toFixed(1)}
                          </Text>
                        </Pressable>
                      )}

                      {/* Vertical indicator line - only show if there's data */}
                      {isSelected && (
                        <View
                          style={[
                            styles.indicatorLine,
                            { backgroundColor: colors.text.muted, opacity: 0.5 },
                          ]}
                        />
                      )}

                      {/* Bar - only render if there's data */}
                      {hasData && (
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${scoreHeight}%`,
                              backgroundColor: isSelected ? colors.violet[300] : colors.violet[400],
                            },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* X-axis date labels - positioned below bars */}
          <View style={styles.xAxisRow}>
            <View style={styles.yAxisSpacer} />
            {timeframe === '7d' ? (
              // 7d: Show all dates aligned under their bars (one container per bar)
              <View style={styles.xAxisLabelsComplete}>
                {displayData.map((day) => (
                  <View
                    key={day.date}
                    style={[styles.xAxisLabelItem, { width: `${barWidthPercentage}%` }]}
                  >
                    {day.hasData && (
                      <Text
                        variant="textXs"
                        weight="medium"
                        numberOfLines={1}
                        style={{ color: colors.text.secondary }}
                      >
                        {formatDateLabel(day.date)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              // 2w/1m: Use absolute positioning for labels at specific indices
              <View style={styles.xAxisLabelsPositioned}>
                {(() => {
                  const labelIndices = timeframe === '2w' ? [0, 4, 9, 13] : [0, 15, 29];

                  return labelIndices.map((idx) => {
                    if (idx >= displayData.length) return null;

                    // Calculate position: center of the bar at this index
                    const positionPercent = ((idx + 0.5) / expectedDays) * 100;

                    return (
                      <View
                        key={displayData[idx].date}
                        style={[styles.absoluteLabel, { left: `${positionPercent}%` }]}
                      >
                        <Text
                          variant="textXs"
                          weight="medium"
                          style={{ color: colors.text.secondary }}
                        >
                          {formatDateLabel(displayData[idx].date)}
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>
            )}
          </View>
        </View>

        {/* AI Insight */}
        <View style={[styles.insightBanner, { backgroundColor: colors.background.elevated }]}>
          <View style={styles.insightContent}>
            <Ionicons name="sparkles" size={20} color={colors.violet[400]} />
            <Text variant="textSm" style={{ flex: 1, marginLeft: 8, color: colors.text.secondary }}>
              AI insights coming soon
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    marginTop: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleAndDropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeframeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    minWidth: 80,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  averageText: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  separator: {
    height: 1,
    marginVertical: 20,
    opacity: 0.1,
  },
  chartWithLabelsContainer: {
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 32,
    height: 160,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 2,
  },
  yAxisLabel: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  chartArea: {
    flex: 1,
  },
  barsContainer: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  barColumn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '90%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xAxisRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  yAxisSpacer: {
    width: 32,
  },
  indicatorLine: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: '100%',
    zIndex: 1,
  },
  tooltip: {
    position: 'absolute',
    top: -70,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingRight: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
    minWidth: 90,
    alignItems: 'center',
  },
  tooltipIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    height: 24,
    paddingHorizontal: 4,
  },
  xAxisLabelsComplete: {
    flex: 1,
    flexDirection: 'row',
  },
  xAxisLabelsPositioned: {
    flex: 1,
    position: 'relative',
    height: 24,
  },
  absoluteLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }], // Center the label (assuming ~40px label width)
    paddingTop: 4,
  },
  xAxisLabelItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    overflow: 'visible',
  },
  insightBanner: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
