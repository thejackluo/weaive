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
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useFulfillmentData } from '@/hooks/useFulfillmentData';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { DayDetailsModal } from '@/components/dashboard/DayDetailsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FulfillmentChartProps {
  timeframe: '7d' | '2w' | '1m';
  onTimeframeChange?: (timeframe: '7d' | '2w' | '1m') => void;
}

export function FulfillmentChart({ timeframe, onTimeframeChange }: FulfillmentChartProps) {
  const { colors } = useTheme();
  const { data, isLoading, isError, error } = useFulfillmentData(timeframe);

  // State for interactions
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  // Handler for opening day details modal
  const handleTooltipPress = (date: string, _fulfillmentScore: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(date);
    setShowDayDetailsModal(true);
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
            if (day) {
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
  const range = 10;

  // Show all data points as bars
  const displayData = fulfillmentData;

  // Update ref so PanResponder has access to current data
  displayDataRef.current = displayData;

  // Determine which date labels to show based on timeframe (reduce count for space)
  const getDateLabelIndices = () => {
    const totalBars = displayData.length;

    if (timeframe === '7d') {
      // Show all 7 labels (day numbers only)
      return Array.from({ length: totalBars }, (_, i) => i);
    }

    if (timeframe === '2w') {
      // Show 4 labels with full dates (start, 1/3, 2/3, end)
      return [0, Math.floor(totalBars / 3), Math.floor((2 * totalBars) / 3), totalBars - 1];
    }

    if (timeframe === '1m') {
      // Show 3 labels with full dates (start, middle, end)
      return [0, Math.floor(totalBars / 2), totalBars - 1];
    }

    return [];
  };

  const dateLabelIndices = new Set(getDateLabelIndices());

  // Format date label based on timeframe
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeframe === '7d') {
      return date.getDate().toString();
    }
    // For longer timeframes, show M/D format
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
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

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Bars with drag interaction - proportional to actual data */}
            <View
              ref={barsContainerRef}
              style={[
                styles.barsContainer,
                {
                  // Bars only take up proportional space based on actual data
                  width: `${(displayData.length / expectedDays) * 100}%`,
                },
              ]}
              onLayout={handleChartLayout}
              {...panResponder.panHandlers}
            >
              {displayData.map((day, index) => {
                const scoreHeight = (day.fulfillment_score / range) * 100;
                const isSelected = selectedBarIndex === index;

                return (
                  <View key={day.date} style={styles.barWrapper}>
                    <View style={styles.barPressable}>
                      {/* Vertical indicator line */}
                      {isSelected && (
                        <View
                          style={[
                            styles.indicatorLine,
                            { backgroundColor: colors.text.muted, opacity: 0.5 },
                          ]}
                        />
                      )}

                      {/* Tooltip */}
                      {isSelected && (
                        <Pressable
                          style={[styles.tooltip, { backgroundColor: colors.background.elevated }]}
                          onPress={() => handleTooltipPress(day.date, day.fulfillment_score)}
                        >
                          {/* Interactive icon indicator */}
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
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                          <Text
                            variant="textLg"
                            weight="bold"
                            style={{ color: colors.text.muted, marginTop: 4 }}
                          >
                            {day.fulfillment_score.toFixed(1)}
                          </Text>
                        </Pressable>
                      )}

                      {/* Bar */}
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${scoreHeight}%`,
                              backgroundColor: isSelected ? colors.violet[300] : colors.violet[400],
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* X-axis date labels - only render containers for actual labels */}
            <View style={styles.xAxisLabels}>
              {Array.from(dateLabelIndices)
                .sort((a, b) => a - b)
                .map((labelIndex) => (
                  <Text
                    key={displayData[labelIndex].date}
                    variant="textXs"
                    style={{ color: colors.text.muted }}
                  >
                    {formatDateLabel(displayData[labelIndex].date)}
                  </Text>
                ))}
            </View>
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

        {/* Day Details Modal */}
        <DayDetailsModal
          visible={showDayDetailsModal}
          date={selectedDate}
          onClose={() => setShowDayDetailsModal(false)}
        />
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
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 40,
    height: 140,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 0,
  },
  chartArea: {
    flex: 1,
  },
  barsContainer: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0.5,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  barPressable: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 4,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  modalDate: {
    marginBottom: 24,
  },
  modalSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalPercentage: {
    marginTop: 8,
  },
  modalButton: {
    width: '100%',
    marginBottom: 16,
  },
  modalCloseButton: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
