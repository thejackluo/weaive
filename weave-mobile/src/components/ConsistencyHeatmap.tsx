/**
 * ConsistencyHeatmap Component (US-5.2: Overall Consistency Visualization)
 *
 * Displays consistency data as either:
 * - 7d: Grid with rows for each bind + daily reflections, columns for days
 * - 2w/1m/90d: Heat map calendar view
 *
 * Filter types:
 * - Overall: All binds + daily reflections
 * - Needle: Binds grouped by needle (swipeable cards)
 * - Bind: Individual bind view with horizontal scrollable menu
 * - Thread: Daily reflections only
 *
 * Color coding:
 * - Green (high): >= 80% completion
 * - Yellow (medium): 50-79% completion
 * - Red (low): < 50% completion
 * - Gray: No data
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  TextInput,
} from 'react-native';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useConsistencyData } from '@/hooks/useConsistencyData';
import { useBindsGrid } from '@/hooks/useBindsGrid';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConsistencyHeatmapProps {
  timeframe: '7d' | '2w' | '1m';
  filterType: 'overall' | 'needle' | 'bind' | 'thread';
  filterId?: string;
  onFilterChange?: (filter: 'overall' | 'needle' | 'bind' | 'thread') => void;
  onTimeframeChange?: (timeframe: '7d' | '2w' | '1m') => void;
  onNeedleChange?: (needleId: string) => void; // Callback when needle selection changes
  trendPercentage?: number;
}

interface BindCompletionData {
  bindName: string;
  completions: boolean[]; // 7 days
}

interface DayHeader {
  dayOfWeek: string;
  dayOfMonth: number;
  fullDate: string;
}

// Sample needle/bind data structure for demo
interface SampleNeedle {
  id: string;
  title: string;
  description: string;
  binds: BindCompletionData[];
}

export function ConsistencyHeatmap({
  timeframe,
  filterType,
  filterId,
  onFilterChange,
  onTimeframeChange,
  onNeedleChange,
  trendPercentage = 0, // Fallback value (will use API delta if available)
}: ConsistencyHeatmapProps) {
  const router = useRouter();
  const { colors } = useTheme();

  // State for date navigation (7d view)
  const [currentStartDate, setCurrentStartDate] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useConsistencyData(
    timeframe,
    filterType,
    filterId,
    currentStartDate
  );

  // Debug: Log consistency data
  console.log('[CONSISTENCY_HEATMAP] API Response:', {
    isLoading,
    isError,
    percentage: data?.meta?.consistency_percentage,
    delta: data?.meta?.consistency_delta,
    totalScheduled: data?.meta?.total_scheduled,
    totalCompleted: data?.meta?.total_completed,
    dataLength: data?.data?.length,
  });

  // Use delta from API if available, otherwise use prop fallback
  const actualTrendPercentage = data?.meta?.consistency_delta ?? trendPercentage;

  const {
    data: bindsGridData,
    isPending: isBindsGridLoading,
    isError: isBindsGridError,
  } = useBindsGrid(currentStartDate);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // State for needle/bind filtering
  const [selectedNeedleIndex, setSelectedNeedleIndex] = useState(0);
  const [selectedBindIndex, setSelectedBindIndex] = useState(0);
  const [bindSearchQuery, setBindSearchQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const needleFlatListRef = useRef<FlatList>(null);

  // State for modals
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    completionRate: number;
  } | null>(null);

  const timeframeOptions: ('7d' | '2w' | '1m')[] = ['7d', '2w', '1m'];

  // For 7d grid view, we need binds grid data (not daily aggregates)
  if (timeframe === '7d') {
    if (isBindsGridLoading) {
      return (
        <Card variant="glass" style={styles.card}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </Card>
      );
    }

    if (isBindsGridError) {
      return (
        <Card variant="glass" style={styles.card}>
          <Text variant="textSm" style={{ color: colors.text.error }}>
            Error loading bind data
          </Text>
        </Card>
      );
    }
  } else {
    // For heat map views (2w/1m), use daily aggregates
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
            Error loading consistency data: {error?.message}
          </Text>
        </Card>
      );
    }
  }

  let consistencyData = data?.data || [];

  /**
   * Get color for completion percentage based on filter type
   *
   * Overall & Needle: Gradient of green shades (lighter → darker as percentage increases)
   * Bind & Thread: Binary gray (incomplete) or dark green (complete)
   */
  const getColorForPercentage = (percentage: number, type: typeof filterType) => {
    // Binary states for Bind and Thread (single metric: completed or not)
    if (type === 'bind' || type === 'thread') {
      return percentage > 0 ? colors.emerald[700] : colors.background.secondary; // Dark green or gray
    }

    // Gradient shades for Overall and Needle (multiple binds/metrics)
    // Lighter green → Darker green as completion increases
    if (percentage === 0) return colors.background.secondary; // Gray for no completion
    if (percentage <= 20) return colors.emerald[200]; // Very light green
    if (percentage <= 40) return colors.emerald[300]; // Light green
    if (percentage <= 60) return colors.emerald[400]; // Medium green
    if (percentage <= 80) return colors.emerald[500]; // Green
    return colors.emerald[700]; // Dark green (80-100%)
  };

  // Get real needles data from API (for all timeframes)
  // For 7d: Use binds grid data with daily completions
  // For 2w/1m: Use binds grid to get needle list (consistency data is filtered by API)
  const needles: SampleNeedle[] = bindsGridData?.data.needles
    ? bindsGridData.data.needles.map((needle) => ({
        id: needle.id,
        title: needle.title,
        description: needle.description,
        binds: needle.binds.map((bind) => ({
          bindName: bind.name,
          completions: bind.completions,
        })),
      }))
    : [];

  // All binds combined (for bind and overall views)
  const allBinds: BindCompletionData[] = needles.flatMap((needle) => needle.binds);

  // Real daily reflection data (for thread view)
  const dailyReflections: BindCompletionData =
    timeframe === '7d' && bindsGridData?.data.daily_reflection
      ? {
          bindName: 'Daily Reflection',
          completions: bindsGridData.data.daily_reflection.completions,
        }
      : {
          bindName: 'Daily Reflection',
          completions: [false, false, false, false, false, false, false],
        };

  // Determine which binds to display based on filter type
  const getDisplayBinds = (): BindCompletionData[] => {
    switch (filterType) {
      case 'needle':
        return needles[selectedNeedleIndex]?.binds || [];
      case 'bind': {
        const filtered = bindSearchQuery
          ? allBinds.filter((bind) =>
              bind.bindName.toLowerCase().includes(bindSearchQuery.toLowerCase())
            )
          : allBinds;
        return filtered.length > 0 ? [filtered[selectedBindIndex]] : [];
      }
      case 'thread':
        return [dailyReflections];
      case 'overall':
      default:
        return [...allBinds, dailyReflections];
    }
  };

  const displayBinds = getDisplayBinds();

  // Use consistency percentage from API (rolling historical - excludes today)
  // The backend already calculates this correctly, excluding today from the percentage
  const consistencyPercentage = data?.meta?.consistency_percentage ?? 0;

  // Handler for opening day details modal
  const handleDayPress = (date: string, completionRate: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDayData({ date, completionRate });
    setShowDayDetailsModal(true);
  };

  // Handler for navigating to day's entries
  const handleViewDayEntries = () => {
    if (selectedDayData) {
      setShowDayDetailsModal(false);
      router.push(`/(tabs)/progress/${selectedDayData.date}`);
    }
  };

  // Get title based on filter type
  const getHeaderTitle = () => {
    switch (filterType) {
      case 'needle':
        return 'Needle Consistency';
      case 'bind':
        return 'Bind Consistency';
      case 'thread':
        return 'Thread Consistency';
      default:
        return 'Overall Consistency';
    }
  };

  // Common header component
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.titleAndDropdownRow}>
        <Text variant="textLg" weight="semibold">
          {getHeaderTitle()}
        </Text>
        {/* Timeframe Dropdown */}
        <View>
          <Pressable
            style={[styles.timeframeDropdown, { backgroundColor: colors.background.elevated }]}
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
          {showTimeframeDropdown && onTimeframeChange && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.background.elevated }]}>
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
                      color: timeframe === option ? colors.text.primary : colors.text.secondary,
                    }}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={styles.percentageRow}>
        <Text variant="displayLg" weight="bold" style={styles.percentageText}>
          {consistencyPercentage}%
        </Text>
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor:
                actualTrendPercentage >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            },
          ]}
        >
          <Text
            variant="textSm"
            weight="semibold"
            style={{
              color: actualTrendPercentage >= 0 ? colors.emerald[500] : colors.rose[500],
            }}
          >
            {actualTrendPercentage >= 0 ? '+' : ''}
            {actualTrendPercentage}%
          </Text>
        </View>
      </View>
    </View>
  );

  // Handle needle scroll to update selected index
  const handleNeedleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = SCREEN_WIDTH - 48 + 16; // Card width + spacing
    const index = Math.round(offsetX / cardWidth);
    if (index !== selectedNeedleIndex && index >= 0 && index < needles.length) {
      setSelectedNeedleIndex(index);
      Haptics.selectionAsync();
      // Notify parent of needle change (for 2w/1m to re-fetch data)
      if (onNeedleChange && needles[index]) {
        onNeedleChange(needles[index].id);
      }
    }
  };

  // Needle card header (for needle view) - now swipeable with clear segments
  const renderNeedleCard = () => {
    if (filterType !== 'needle') return null;

    const CARD_WIDTH = SCREEN_WIDTH - 80; // Width of each card (with margins)
    const CARD_SPACING = 16; // Space between cards

    return (
      <View style={styles.needleSwipeContainer}>
        <FlatList
          ref={needleFlatListRef}
          data={needles}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleNeedleScroll}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          snapToAlignment="start"
          contentContainerStyle={{ paddingHorizontal: 24 }}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
          renderItem={({ item: needle }) => (
            <View
              style={[
                styles.needleCard,
                {
                  backgroundColor: colors.background.elevated,
                  width: CARD_WIDTH,
                },
              ]}
            >
              <View style={styles.needleCardHeader}>
                <View
                  style={[styles.needleColorIndicator, { backgroundColor: colors.emerald[500] }]}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="textBase" weight="semibold" numberOfLines={2}>
                    {needle.title}
                  </Text>
                  <Text
                    variant="textSm"
                    style={{ color: colors.text.muted, marginTop: 4, fontStyle: 'italic' }}
                  >
                    {needle.description}
                  </Text>
                </View>
              </View>

              {/* Pagination dots */}
              {needles.length > 1 && (
                <View style={styles.paginationDots}>
                  {needles.map((_, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Haptics.selectionAsync();
                        needleFlatListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setSelectedNeedleIndex(index);
                        // Notify parent of needle change (for 2w/1m to re-fetch data)
                        if (onNeedleChange && needles[index]) {
                          onNeedleChange(needles[index].id);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.paginationDot,
                          {
                            backgroundColor:
                              index === selectedNeedleIndex
                                ? colors.text.primary
                                : colors.background.secondary,
                          },
                        ]}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </View>
    );
  };

  // Bind selector (for bind view)
  const renderBindSelector = () => {
    if (filterType !== 'bind') return null;

    return (
      <View style={styles.bindSelectorContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bindScrollContent}
        >
          {allBinds.map((bind, index) => (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedBindIndex(index);
                setBindSearchQuery('');
              }}
              style={[
                styles.bindChip,
                {
                  backgroundColor:
                    index === selectedBindIndex ? colors.text.primary : colors.background.elevated,
                },
              ]}
            >
              <Text
                variant="textSm"
                weight={index === selectedBindIndex ? 'semibold' : 'regular'}
                style={{
                  color:
                    index === selectedBindIndex ? colors.background.primary : colors.text.secondary,
                }}
              >
                {bind.bindName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search button */}
        <Pressable
          style={[styles.searchButton, { backgroundColor: colors.background.elevated }]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowSearchModal(true);
          }}
        >
          <Ionicons name="search" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>
    );
  };

  // Common filter tabs component
  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {(['overall', 'needle', 'bind', 'thread'] as const).map((filter) => (
        <Pressable
          key={filter}
          onPress={() => {
            if (onFilterChange) {
              Haptics.selectionAsync();
              onFilterChange(filter);
            }
          }}
          style={[
            styles.filterTab,
            {
              backgroundColor:
                filterType === filter ? colors.text.primary : colors.background.elevated,
            },
          ]}
        >
          <Text
            variant="textSm"
            weight={filterType === filter ? 'semibold' : 'regular'}
            style={{
              color: filterType === filter ? colors.background.primary : colors.text.secondary,
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // Get insight message based on filter type
  const getInsightMessage = () => {
    switch (filterType) {
      case 'needle':
        return "Let's try to stack deep work right after meditation.";
      case 'bind':
        return 'You got ADHD or something? We gotta lock in twin :/';
      case 'thread':
        return "Daily journaling is how we make sure you don't go back to October 2023 version of you";
      default:
        return 'Your workout streak has gotten better!';
    }
  };

  // Common insight banner component
  const renderInsightBanner = () => (
    <View style={[styles.insightBanner, { backgroundColor: colors.background.elevated }]}>
      <View style={styles.insightContent}>
        <Ionicons name="fitness" size={24} color={colors.accent[500]} />
        <Text variant="textBase" style={{ flex: 1, fontStyle: 'italic', marginLeft: 12 }}>
          {getInsightMessage()}
        </Text>
        <Ionicons name="arrow-forward" size={20} color={colors.text.muted} />
      </View>
    </View>
  );

  // 7d: Show bind grid view with daily checkmarks
  if (timeframe === '7d') {
    // Generate day headers from API's date range (starts from user's first instance)
    const dayHeaders: DayHeader[] = [];
    if (bindsGridData?.meta?.start_date && bindsGridData?.meta?.end_date) {
      const startDate = new Date(bindsGridData.meta.start_date);
      const endDate = new Date(bindsGridData.meta.end_date);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dayHeaders.push({
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
          dayOfMonth: currentDate.getDate(),
          fullDate: currentDate.toISOString().split('T')[0],
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return (
      <Card variant="glass" style={styles.sevenDayCard}>
        {renderHeader()}

        {/* Separator line */}
        <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

        {/* Needle card (for needle view) */}
        {renderNeedleCard()}

        {/* Bind selector (for bind view) */}
        {renderBindSelector()}

        {renderFilterTabs()}

        {/* Day headers with navigation arrows */}
        <View style={styles.dayHeaderRow}>
          {/* Empty corner cell for bind names column */}
          <View style={styles.bindNameColumn} />

          {/* Left arrow */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const currentDate = bindsGridData?.meta.start_date
                ? new Date(bindsGridData.meta.start_date)
                : new Date();
              currentDate.setDate(currentDate.getDate() - 1);
              setCurrentStartDate(currentDate.toISOString().split('T')[0]);
            }}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-back" size={16} color={colors.text.secondary} />
          </Pressable>

          {/* Day header cells */}
          {dayHeaders.map((day) => (
            <View key={day.fullDate} style={styles.dayHeaderCell}>
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                {day.dayOfWeek}
              </Text>
              <Text variant="textSm" weight="medium" style={{ marginTop: 2 }}>
                {day.dayOfMonth}
              </Text>
            </View>
          ))}

          {/* Right arrow */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const currentDate = bindsGridData?.meta.start_date
                ? new Date(bindsGridData.meta.start_date)
                : new Date();
              currentDate.setDate(currentDate.getDate() + 1);
              setCurrentStartDate(currentDate.toISOString().split('T')[0]);
            }}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Bind rows */}
        {displayBinds.map((bind, bindIndex) => (
          <View key={bindIndex} style={styles.bindRow}>
            {/* Bind name */}
            <View style={styles.bindNameColumn}>
              <Text variant="textXs" style={{ color: colors.text.secondary }} numberOfLines={2}>
                {bind.bindName}
              </Text>
            </View>

            {/* Left arrow spacer */}
            <View style={styles.arrowButton} />

            {/* Completion cells */}
            {bind.completions.map((completed, dayIndex) => {
              const dayDate = dayHeaders[dayIndex].fullDate;
              const completionRate = completed ? 100 : 0;
              return (
                <Pressable
                  key={dayIndex}
                  onPress={() => handleDayPress(dayDate, completionRate)}
                  style={styles.dayHeaderCell}
                >
                  <View
                    style={[
                      styles.completionSquare,
                      {
                        backgroundColor: completed
                          ? colors.emerald[600]
                          : colors.background.elevated,
                        borderWidth: 1,
                        borderColor: completed ? colors.emerald[700] : colors.border.muted,
                      },
                    ]}
                  >
                    {completed && (
                      <Ionicons name="checkmark" size={16} color={colors.text.primary} />
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Right arrow spacer */}
            <View style={styles.arrowButton} />
          </View>
        ))}

        {renderInsightBanner()}

        {/* Day Details Modal */}
        <Modal
          visible={showDayDetailsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDayDetailsModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDayDetailsModal(false)}>
            <Pressable
              style={[styles.modalContent, { backgroundColor: colors.background.elevated }]}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedDayData && (
                <>
                  <Text variant="textLg" weight="bold" style={styles.modalDate}>
                    {new Date(selectedDayData.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text variant="textBase" style={{ color: colors.text.secondary }}>
                      Completion Rate
                    </Text>
                    <Text variant="displayMd" weight="bold" style={styles.modalPercentage}>
                      {selectedDayData.completionRate}%
                    </Text>
                  </View>

                  <Button
                    onPress={handleViewDayEntries}
                    variant="primary"
                    style={styles.modalButton}
                  >
                    View Day&apos;s Entries →
                  </Button>

                  <Pressable
                    onPress={() => setShowDayDetailsModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text variant="textBase" style={{ color: colors.text.secondary }}>
                      Close
                    </Text>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSearchModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowSearchModal(false)}>
            <Pressable
              style={[styles.searchModalContent, { backgroundColor: colors.background.elevated }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.searchModalHeader}>
                <Text variant="textLg" weight="semibold">
                  Search Binds
                </Text>
                <Pressable onPress={() => setShowSearchModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                    borderColor: colors.border.muted,
                  },
                ]}
                placeholder="Search for a bind..."
                placeholderTextColor={colors.text.muted}
                value={bindSearchQuery}
                onChangeText={setBindSearchQuery}
                autoFocus
              />

              <ScrollView style={styles.searchResults}>
                {allBinds
                  .filter((bind) =>
                    bind.bindName.toLowerCase().includes(bindSearchQuery.toLowerCase())
                  )
                  .map((bind, index) => (
                    <Pressable
                      key={index}
                      style={[styles.searchResultItem, { borderBottomColor: colors.border.muted }]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedBindIndex(allBinds.indexOf(bind));
                        setShowSearchModal(false);
                        setBindSearchQuery('');
                      }}
                    >
                      <Text variant="textBase">{bind.bindName}</Text>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </Pressable>
                  ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </Card>
    );
  }

  // 2w/1m/90d: Show heat map grid
  // Calculate day-of-week headers and layout
  const firstDate = consistencyData.length > 0 ? new Date(consistencyData[0].date) : new Date();
  const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 6 = Saturday
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card variant="glass" style={styles.sevenDayCard}>
      {renderHeader()}

      {/* Separator line */}
      <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

      {/* Needle card (for needle view) */}
      {renderNeedleCard()}

      {/* Bind selector (for bind view) */}
      {renderBindSelector()}

      {renderFilterTabs()}

      {/* Day of week headers */}
      <View style={styles.weekDayHeaderRow}>
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.weekDayHeaderCell}>
            <Text variant="textXs" weight="medium" style={{ color: colors.text.muted }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.heatmapContainer}>
        {/* Add empty cells to align first date with correct day of week */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <View key={`spacer-${index}`} style={styles.heatmapCell} />
        ))}

        {/* Render actual data cells */}
        {consistencyData.map((day) => {
          const cellColor = getColorForPercentage(day.completion_percentage, filterType);
          const dayOfMonth = new Date(day.date).getDate();

          return (
            <Pressable
              key={day.date}
              onPress={() => handleDayPress(day.date, day.completion_percentage)}
            >
              <View
                style={[
                  styles.heatmapCell,
                  {
                    backgroundColor: cellColor,
                    opacity: 1, // Full opacity for all cells (color already conveys completion)
                  },
                ]}
              >
                <Text
                  variant="textXs"
                  weight="medium"
                  style={{
                    color:
                      day.completion_percentage === 0 ? colors.text.muted : colors.text.primary,
                  }}
                >
                  {dayOfMonth}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {filterType === 'bind' || filterType === 'thread' ? (
          // Binary legend for Bind and Thread
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.emerald[700] }]} />
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                Completed
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: colors.background.secondary }]}
              />
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                Not completed
              </Text>
            </View>
          </>
        ) : (
          // Gradient legend for Overall and Needle
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.emerald[700] }]} />
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                80%+
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.emerald[400] }]} />
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                40-60%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.emerald[200] }]} />
              <Text variant="textXs" style={{ color: colors.text.muted }}>
                {'<'}20%
              </Text>
            </View>
          </>
        )}
      </View>

      {renderInsightBanner()}

      {/* Day Details Modal */}
      <Modal
        visible={showDayDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayDetailsModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDayDetailsModal(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background.elevated }]}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedDayData && (
              <>
                <Text variant="textLg" weight="bold" style={styles.modalDate}>
                  {new Date(selectedDayData.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>

                <View style={styles.modalSection}>
                  <Text variant="textBase" style={{ color: colors.text.secondary }}>
                    Completion Rate
                  </Text>
                  <Text variant="displayMd" weight="bold" style={styles.modalPercentage}>
                    {selectedDayData.completionRate}%
                  </Text>
                </View>

                <Button onPress={handleViewDayEntries} variant="primary" style={styles.modalButton}>
                  View Day&apos;s Entries →
                </Button>

                <Pressable
                  onPress={() => setShowDayDetailsModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text variant="textBase" style={{ color: colors.text.secondary }}>
                    Close
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSearchModal(false)}>
          <Pressable
            style={[styles.searchModalContent, { backgroundColor: colors.background.elevated }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.searchModalHeader}>
              <Text variant="textLg" weight="semibold">
                Search Binds
              </Text>
              <Pressable onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  borderColor: colors.border.muted,
                },
              ]}
              placeholder="Search for a bind..."
              placeholderTextColor={colors.text.muted}
              value={bindSearchQuery}
              onChangeText={setBindSearchQuery}
              autoFocus
            />

            <ScrollView style={styles.searchResults}>
              {allBinds
                .filter((bind) =>
                  bind.bindName.toLowerCase().includes(bindSearchQuery.toLowerCase())
                )
                .map((bind, index) => (
                  <Pressable
                    key={index}
                    style={[styles.searchResultItem, { borderBottomColor: colors.border.muted }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedBindIndex(allBinds.indexOf(bind));
                      setShowSearchModal(false);
                      setBindSearchQuery('');
                    }}
                  >
                    <Text variant="textBase">{bind.bindName}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                  </Pressable>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginTop: 16,
  },
  // 7d card layout
  sevenDayCard: {
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
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  percentageText: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  separator: {
    height: 1,
    marginVertical: 20,
    opacity: 0.1,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bindNameColumn: {
    width: 80,
    paddingRight: 8,
    justifyContent: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionSquare: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Heat map view (2w/1m/90d)
  weekDayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  weekDayHeaderCell: {
    width: 40,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  // Needle card styles
  needleSwipeContainer: {
    marginBottom: 16,
    marginHorizontal: -24, // Extend to edges for full-width swipe
  },
  needleCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  needleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  needleColorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Bind selector styles
  bindSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bindScrollContent: {
    gap: 8,
    paddingRight: 8,
  },
  bindChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Search modal styles
  searchModalContent: {
    width: SCREEN_WIDTH,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    marginTop: 'auto',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
});
