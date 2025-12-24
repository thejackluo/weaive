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
  Modal,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useFulfillmentData } from '@/hooks/useFulfillmentData';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FulfillmentChartProps {
  timeframe: '7d' | '2w' | '1m';
  onTimeframeChange?: (timeframe: '7d' | '2w' | '1m') => void;
}

export function FulfillmentChart({ timeframe, onTimeframeChange }: FulfillmentChartProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useFulfillmentData(timeframe);

  // State for interactions
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    fulfillmentScore: number;
  } | null>(null);

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
  const handleTooltipPress = (date: string, fulfillmentScore: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDayData({ date, fulfillmentScore });
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

  // Temporary: Force sample data for demo purposes until user has real data
  const FORCE_SAMPLE_DATA = false;

  const timeframeOptions: ('7d' | '2w' | '1m')[] = ['7d', '2w', '1m'];

  if (isLoading && !FORCE_SAMPLE_DATA) {
    return (
      <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <RNText style={{ fontSize: 14, color: '#ef4444' }}>
          Error loading fulfillment data: {error?.message}
        </RNText>
      </View>
    );
  }

  let fulfillmentData = data?.data || [];
  let averageFulfillment = data?.meta?.average_fulfillment || 0;

  // Calculate expected days for timeframe
  const timeframeDays = { '7d': 7, '2w': 14, '1m': 30 };
  const expectedDays = timeframeDays[timeframe];

  // If sparse or no data (less than 50% of expected days), show sample data
  const useSampleData = FORCE_SAMPLE_DATA || fulfillmentData.length < expectedDays * 0.5;

  if (useSampleData) {
    // Generate sample data for the selected timeframe
    const sampleData: Array<{
      date: string;
      fulfillment_score: number;
      rolling_average_7d: number;
    }> = [];

    for (let i = 0; i < expectedDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (expectedDays - 1 - i));

      // Generate realistic sample scores (6-9 range with some variation)
      const baseScore = 7.5;
      const variation = Math.sin(i * 0.3) * 1.5; // Wave pattern
      const score = Math.max(1, Math.min(10, baseScore + variation));

      // Calculate rolling average for last 7 days
      const rollingWindow = sampleData.slice(Math.max(0, i - 6));
      const rollingAvg =
        rollingWindow.length > 0
          ? (rollingWindow.reduce((sum, d) => sum + d.fulfillment_score, 0) + score) /
            (rollingWindow.length + 1)
          : score;

      sampleData.push({
        date: date.toISOString().split('T')[0],
        fulfillment_score: Number(score.toFixed(1)),
        rolling_average_7d: Number(rollingAvg.toFixed(1)),
      });
    }

    fulfillmentData = sampleData;

    // Calculate average
    const sum = fulfillmentData.reduce((acc, d) => acc + d.fulfillment_score, 0);
    averageFulfillment = Number((sum / fulfillmentData.length).toFixed(1));
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

  // Handler for navigating to day's entries
  const handleViewDayEntries = () => {
    if (selectedDayData) {
      setShowDayDetailsModal(false);
      router.push(`/(tabs)/progress/${selectedDayData.date}`);
    }
  };

  return (
    <Pressable onPress={handleDismissTooltip}>
      <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleAndDropdownRow}>
            <RNText style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
              Average Fulfillment
            </RNText>

            {/* Timeframe Dropdown */}
            {onTimeframeChange && (
              <View>
                <Pressable
                  style={[
                    styles.timeframeDropdown,
                    { backgroundColor: '#18181b' },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowTimeframeDropdown(!showTimeframeDropdown);
                  }}
                >
                  <RNText style={{ fontSize: 14, color: '#a1a1aa' }}>
                    {timeframe}
                  </RNText>
                  <Ionicons
                    name={showTimeframeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#a1a1aa"
                  />
                </Pressable>

                {/* Dropdown Menu */}
                {showTimeframeDropdown && (
                  <View
                    style={[styles.dropdownMenu, { backgroundColor: '#18181b' }]}
                  >
                    {timeframeOptions.map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.dropdownItem,
                          timeframe === option && { backgroundColor: '#3b82f6' },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          onTimeframeChange(option);
                          setShowTimeframeDropdown(false);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: timeframe === option ? '600' : '400',
                            color: timeframe === option ? '#ffffff' : '#a1a1aa',
                          }}
                        >
                          {option}
                        </RNText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Average Score Display */}
          <View style={styles.averageContainer}>
            <RNText style={[styles.averageText, { fontSize: 64, fontWeight: 'bold', color: '#ffffff' }]}>
              {averageFulfillment.toFixed(1)}
            </RNText>
          </View>
        </View>

        {/* Separator line */}
        <View style={[styles.separator, { backgroundColor: '#27272A' }]} />

        {/* Chart with Y-axis */}
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <RNText style={{ fontSize: 12, color: '#71717a' }}>
              10
            </RNText>
            <RNText style={{ fontSize: 12, color: '#71717a' }}>
              5
            </RNText>
            <RNText style={{ fontSize: 12, color: '#71717a' }}>
              0
            </RNText>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Bars with drag interaction */}
            <View
              ref={barsContainerRef}
              style={styles.barsContainer}
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
                            { backgroundColor: '#71717a', opacity: 0.5 },
                          ]}
                        />
                      )}

                      {/* Tooltip */}
                      {isSelected && (
                        <Pressable
                          style={[styles.tooltip, { backgroundColor: '#18181b' }]}
                          onPress={() => handleTooltipPress(day.date, day.fulfillment_score)}
                        >
                          {/* Interactive icon indicator */}
                          <View style={styles.tooltipIcon}>
                            <Ionicons
                              name="arrow-forward-outline"
                              size={12}
                              color="#71717a"
                              style={{ transform: [{ rotate: '-45deg' }] }}
                            />
                          </View>

                          <Text
                            numberOfLines={1}
                            style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}
                          >
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </RNText>
                          <Text
                            style={{ fontSize: 18, fontWeight: 'bold', color: '#71717a', marginTop: 4 }}
                          >
                            {day.fulfillment_score.toFixed(1)}
                          </RNText>
                        </Pressable>
                      )}

                      {/* Bar */}
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${scoreHeight}%`,
                              backgroundColor: isSelected ? '#c4b5fd' : '#a78bfa',
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
                    style={{ fontSize: 12, color: '#71717a' }}
                  >
                    {formatDateLabel(displayData[labelIndex].date)}
                  </RNText>
                ))}
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View style={[styles.insightBanner, { backgroundColor: '#18181b' }]}>
          <View style={styles.insightContent}>
            <Ionicons name="sparkles" size={20} color="#a78bfa" />
            <RNText style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#a1a1aa' }}>
              AI insights coming soon
            </RNText>
          </View>
        </View>

        {/* Day Details Modal */}
        <Modal
          visible={showDayDetailsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDayDetailsModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDayDetailsModal(false)}>
            <Pressable
              style={[styles.modalContent, { backgroundColor: '#18181b' }]}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedDayData && (
                <>
                  <RNText style={[styles.modalDate, { fontSize: 18, fontWeight: 'bold', color: '#ffffff' }]}>
                    {new Date(selectedDayData.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </RNText>

                  <View style={styles.modalSection}>
                    <RNText style={{ fontSize: 15, color: '#a1a1aa' }}>
                      Fulfillment Score
                    </RNText>
                    <RNText style={[styles.modalPercentage, { fontSize: 28, fontWeight: 'bold', color: '#ffffff' }]}>
                      {selectedDayData.fulfillmentScore.toFixed(1)}
                    </RNText>
                  </View>

                  <TouchableOpacity
                    onPress={handleViewDayEntries}
                    style={[styles.modalButton, { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 }]}
                  >
                    <RNText style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
                      View Day&apos;s Entries →
                    </RNText>
                  </TouchableOpacity>

                  <Pressable
                    onPress={() => setShowDayDetailsModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <RNText style={{ fontSize: 15, color: '#a1a1aa' }}>
                      Close
                    </RNText>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
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
  averageText: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
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
});
