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
  FlatList,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useConsistencyData } from '@/hooks/useConsistencyData';
import { useGetJournalsByDateRange } from '@/hooks/useJournal';
import { useBindsGrid } from '@/hooks/useBindsGrid';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DayDetailsModal } from '@/components/dashboard/DayDetailsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConsistencyHeatmapProps {
  timeframe: '7d' | '2w' | '1m';
  filterType: 'overall' | 'needle' | 'bind' | 'thread';
  filterId?: string;
  onFilterChange?: (filter: 'overall' | 'needle' | 'bind' | 'thread') => void;
  onTimeframeChange?: (timeframe: '7d' | '2w' | '1m') => void;
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
  trendPercentage: _trendPercentageProp,
}: ConsistencyHeatmapProps) {
  const { colors } = useTheme();
  const { data, isLoading, isError, error } = useConsistencyData(timeframe, filterType, filterId);
  const {
    data: bindsGridData,
    isLoading: isBindsGridLoading,
    isError: isBindsGridError,
  } = useBindsGrid();
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // Fetch journal entries for Thread consistency view (7d timeframe)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const { data: journalData, isLoading: journalLoading } = useGetJournalsByDateRange(
    startDate,
    endDate
  );

  // Debug journal data
  console.log('[CONSISTENCY_HEATMAP] Journal data debug:', {
    startDate,
    endDate,
    journalLoading,
    journalDataLength: journalData?.length || 0,
    journalData: journalData?.map((j) => ({ date: j.local_date, score: j.fulfillment_score })),
  });

  // State for modals
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [_showSearchModal, setShowSearchModal] = useState(false);
  const [_selectedDayData, _setSelectedDayData] = useState<{
    date: string;
    completionRate: number;
  } | null>(null);

  // State for needle/bind filtering
  const [selectedNeedleIndex, setSelectedNeedleIndex] = useState(0);
  const [selectedBindIndex, setSelectedBindIndex] = useState(0);
  const [bindSearchQuery, setBindSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Refs for scrolling
  const needleFlatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const consistencyData = data?.data || [];

  // Show empty state if no data
  if (consistencyData.length === 0) {
    return (
      <Card variant="glass" style={styles.card}>
        <View style={styles.headerSection}>
          <Text variant="textLg" weight="semibold">
            Overall Consistency
          </Text>
          <Text variant="displayLg" weight="bold" style={styles.percentageText}>
            0%
          </Text>
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={colors.text.muted} />
          <Text
            variant="textBase"
            style={{ color: colors.text.secondary, marginTop: 16, textAlign: 'center' }}
          >
            No consistency data yet. Complete some binds and your consistency will appear here!
          </Text>
        </View>
      </Card>
    );
  }

  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return colors.emerald[500]; // Green - high
    if (percentage >= 50) return colors.amber[500]; // Yellow - medium
    return colors.rose[500]; // Red - low
  };

  // Process journal data for thread consistency view
  // Convert journal entries to completion boolean array for last 7 days
  const getJournalCompletionData = (): BindCompletionData[] => {
    if (!journalData || journalData.length === 0) {
      console.log('[CONSISTENCY_HEATMAP] No journal data - returning empty completions');
      // Return empty array with no completions
      return [
        {
          bindName: 'Daily Check-in',
          completions: [false, false, false, false, false, false, false],
        },
      ];
    }

    // Create map of dates to journal entries
    const journalMap = new Map(journalData.map((j) => [j.local_date, j]));
    console.log('[CONSISTENCY_HEATMAP] Journal map:', Array.from(journalMap.keys()));

    // Generate completion array for last 7 days
    const completions: boolean[] = [];
    const dateChecks: { date: string; hasEntry: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasEntry = journalMap.has(dateStr);
      completions.push(hasEntry);
      dateChecks.push({ date: dateStr, hasEntry });
    }

    console.log('[CONSISTENCY_HEATMAP] Date checks:', dateChecks);
    console.log('[CONSISTENCY_HEATMAP] Final completions:', completions);

    return [
      {
        bindName: 'Daily Check-in',
        completions,
      },
    ];
  };
  // Get real needles data from API (for 7d view only)
  const needles: SampleNeedle[] =
    timeframe === '7d' && bindsGridData?.data.needles
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
  const _dailyReflections: BindCompletionData =
    timeframe === '7d' && bindsGridData?.data.daily_reflection
      ? {
          bindName: 'Daily Reflection',
          completions: bindsGridData.data.daily_reflection.completions,
        }
      : {
          bindName: 'Daily Reflection',
          completions: [false, false, false, false, false, false, false],
        };

  const dailyCheckInData: BindCompletionData[] = getJournalCompletionData();

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
        return dailyCheckInData;
      case 'overall':
      default:
        // For now, only show Daily Check-in until bind completion history API is added
        return dailyCheckInData;
    }
  };

  const displayBinds = getDisplayBinds();

  // Calculate consistency percentage from API data (all timeframes now use real data)
  const calculateConsistencyPercentage = () => {
    // Use API data for all timeframes (no more mock data calculations)
    const totalDays = consistencyData.length;
    const completedDays = consistencyData.filter((d) => d.completion_percentage >= 50).length;
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };

  const consistencyPercentage = calculateConsistencyPercentage();

  // Calculate trend percentage (comparing first half vs second half)
  const calculateTrendPercentage = (): number => {
    if (consistencyData.length === 0) return 0;
    if (consistencyData.length === 1) return 0; // Can't calculate trend with 1 point

    const midpoint = Math.floor(consistencyData.length / 2);
    const firstHalf = consistencyData.slice(0, midpoint);
    const secondHalf = consistencyData.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    // Count active days in each half
    const firstActiveCount = firstHalf.filter((d) => d.completion_percentage >= 50).length;
    const secondActiveCount = secondHalf.filter((d) => d.completion_percentage >= 50).length;

    const firstPercentage = (firstActiveCount / firstHalf.length) * 100;
    const secondPercentage = (secondActiveCount / secondHalf.length) * 100;

    if (firstPercentage === 0) return Math.round(secondPercentage);

    // Calculate percentage change
    const percentChange = ((secondPercentage - firstPercentage) / firstPercentage) * 100;
    return Math.round(percentChange);
  };

  const trendPercentage = calculateTrendPercentage();

  // Handler for opening day details modal
  const handleDayPress = (date: string, _completionRate: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(date);
    setShowDayDetailsModal(true);
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
    }
  };

  // Needle card header (for needle view) - now swipeable with clear segments
  const _renderNeedleCard = () => {
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
  const _renderBindSelector = () => {
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

  // Helper function to generate day headers for last 7 days
  const getDayHeaders = (): DayHeader[] => {
    const headers: DayHeader[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      headers.push({
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
      });
    }
    return headers;
  };

  const dayHeaders = getDayHeaders();

  // 7d: Show grid view with bind completion data
  if (timeframe === '7d') {
    const showLoadingState =
      (filterType === 'thread' && journalLoading) || (filterType === 'overall' && journalLoading);

    if (showLoadingState) {
      return (
        <Card variant="glass" style={styles.card}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
        </Card>
      );
    }

    // Show empty state for Needle and Bind views (no data available yet)
    if (filterType === 'needle' || filterType === 'bind') {
      return (
        <Card variant="glass" style={styles.sevenDayCard}>
          {renderHeader()}

          {/* Separator line */}
          <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

          {renderFilterTabs()}

          {/* Empty state message */}
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.text.muted} />
            <Text
              variant="textBase"
              style={{ color: colors.text.secondary, marginTop: 16, textAlign: 'center' }}
            >
              {filterType === 'needle'
                ? 'Needle-specific breakdown coming soon! Switch to Overall or Thread to see your consistency.'
                : 'Bind-specific breakdown coming soon! Switch to Overall or Thread to see your consistency.'}
            </Text>
          </View>

          {renderInsightBanner()}

          {/* Day Details Modal */}
          <DayDetailsModal
            visible={showDayDetailsModal}
            date={selectedDate}
            onClose={() => setShowDayDetailsModal(false)}
          />
        </Card>
      );
    }

    return (
      <Card variant="glass" style={styles.sevenDayCard}>
        {renderHeader()}

        {/* Separator line */}
        <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

        {renderFilterTabs()}

        {/* Day header row */}
        <View style={styles.dayHeaderRow}>
          <View style={styles.bindNameColumnHeader} />
          {dayHeaders.map((day, index) => (
            <View key={index} style={styles.dayCell}>
              <Text variant="textXs" style={{ color: colors.text.muted }} weight="medium">
                {day.dayOfWeek}
              </Text>
              <Text variant="textSm" weight="semibold">
                {day.dayOfMonth}
              </Text>
            </View>
          ))}
        </View>

        {/* Bind completion rows */}
        {displayBinds.map((bind, bindIndex) => (
          <View key={bindIndex} style={styles.bindRow}>
            <View style={styles.bindNameCell}>
              <Text variant="textSm" numberOfLines={2} style={{ color: colors.text.secondary }}>
                {bind.bindName}
              </Text>
            </View>
            {bind.completions.map((completed, dayIndex) => (
              <View key={dayIndex} style={styles.dayCell}>
                <View
                  style={[
                    styles.completionCircle,
                    {
                      backgroundColor: completed
                        ? colors.emerald[500]
                        : colors.background.secondary,
                    },
                  ]}
                >
                  {completed && <Ionicons name="checkmark" size={20} color="white" />}
                </View>
              </View>
            ))}
          </View>
        ))}

        {renderInsightBanner()}

        {/* Day Details Modal */}
        <DayDetailsModal
          visible={showDayDetailsModal}
          date={selectedDate}
          onClose={() => setShowDayDetailsModal(false)}
        />
      </Card>
    );
  }

  // 2w/1m/90d: Show heat map grid
  return (
    <Card variant="glass" style={styles.sevenDayCard}>
      {renderHeader()}

      {/* Separator line */}
      <View style={[styles.separator, { backgroundColor: colors.border.muted }]} />

      {renderFilterTabs()}
      <View style={styles.heatmapContainer}>
        {consistencyData.map((day) => {
          const cellColor = getColorForPercentage(day.completion_percentage);
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
                    opacity: day.completion_percentage === 0 ? 0.2 : 0.8,
                  },
                ]}
              >
                <Text variant="textXs" weight="medium" style={{ color: 'white' }}>
                  {dayOfMonth}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.emerald[500] }]} />
          <Text variant="textXs" style={{ color: colors.text.muted }}>
            80%+
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.amber[500] }]} />
          <Text variant="textXs" style={{ color: colors.text.muted }}>
            50-79%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.rose[500] }]} />
          <Text variant="textXs" style={{ color: colors.text.muted }}>
            {'<'}50%
          </Text>
        </View>
      </View>

      {renderInsightBanner()}

      {/* Day Details Modal */}
      <DayDetailsModal
        visible={showDayDetailsModal}
        date={selectedDate}
        onClose={() => setShowDayDetailsModal(false)}
      />
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
  bindNameColumnHeader: {
    width: 90,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bindNameCell: {
    width: 90,
    justifyContent: 'center',
  },
  completionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  // Needle swipe view styles
  needleSwipeContainer: {
    marginBottom: 20,
  },
  needleCard: {
    padding: 16,
    borderRadius: 12,
  },
  needleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  needleColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
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
    gap: 8,
    marginBottom: 16,
  },
  bindScrollContent: {
    flexDirection: 'row',
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
});
