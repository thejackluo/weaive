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
  Text,
  TouchableOpacity,
} from 'react-native';
import { useConsistencyData } from '@/hooks/useConsistencyData';
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
  trendPercentage = 2,
}: ConsistencyHeatmapProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useConsistencyData(timeframe, filterType, filterId);
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

  // Temporary: Force sample data for demo purposes until user has real data
  const FORCE_SAMPLE_DATA = false;

  const timeframeOptions: ('7d' | '2w' | '1m')[] = ['7d', '2w', '1m'];

  if (isLoading && !FORCE_SAMPLE_DATA) {
    return (
      <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <RNText style={{ fontSize: 14, color: '#ef4444' }}>
          Error loading consistency data: {error?.message}
        </RNText>
      </View>
    );
  }

  let consistencyData = data?.data || [];

  // Calculate expected days for timeframe
  const timeframeDays = { '7d': 7, '2w': 14, '1m': 30 };
  const expectedDays = timeframeDays[timeframe];

  // If sparse or no data (less than 50% of expected days), show sample data
  const useSampleData = FORCE_SAMPLE_DATA || consistencyData.length < expectedDays * 0.5;

  if (useSampleData) {
    // Generate sample data for the selected timeframe
    consistencyData = Array.from({ length: expectedDays }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (expectedDays - 1 - i));

      // Generate realistic sample percentages (60-90% range with some variation)
      const basePercentage = 70;
      const variation = Math.sin(i * 0.5) * 15; // Wave pattern
      const percentage = Math.max(0, Math.min(100, basePercentage + variation));

      return {
        date: date.toISOString().split('T')[0],
        completion_percentage: Math.round(percentage),
        completed_count: percentage > 50 ? Math.floor(percentage / 25) : 0,
        total_count: 4,
      };
    });
  }

  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green - high
    if (percentage >= 50) return '#f59e0b'; // Yellow - medium
    return '#ef4444'; // Red - low
  };

  // Sample needle data (for needle view)
  const sampleNeedles: SampleNeedle[] = [
    {
      id: '1',
      title: 'Make $1 Million in Profit this Year',
      description: "Why: to live a free life that's not constrained to a job",
      binds: [
        { bindName: 'Deep Work', completions: [false, false, true, false, true, false, true] },
        { bindName: 'Reading', completions: [false, true, false, true, true, true, true] },
        { bindName: 'Meditation', completions: [true, true, true, true, false, true, true] },
      ],
    },
    {
      id: '2',
      title: 'Get in Best Physical Shape',
      description: 'Why: to feel confident and energized',
      binds: [
        { bindName: 'Workout', completions: [true, true, true, true, true, true, true] },
        { bindName: 'Meal Prep', completions: [true, false, true, true, false, true, true] },
      ],
    },
    {
      id: '3',
      title: 'Build Strong Relationships',
      description: 'Why: to have meaningful connections',
      binds: [
        { bindName: 'Daily Check-in', completions: [true, true, false, true, true, true, false] },
        { bindName: 'Quality Time', completions: [false, true, true, false, true, true, true] },
      ],
    },
  ];

  // All binds combined (for bind and overall views)
  const allBinds: BindCompletionData[] = sampleNeedles.flatMap((needle) => needle.binds);

  // Sample daily reflection data (for thread view)
  const dailyReflections: BindCompletionData = {
    bindName: 'Daily Reflection',
    completions: [false, true, false, true, false, true, true],
  };

  // Determine which binds to display based on filter type
  const getDisplayBinds = (): BindCompletionData[] => {
    switch (filterType) {
      case 'needle':
        return sampleNeedles[selectedNeedleIndex]?.binds || [];
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

  // Calculate consistency percentage (used in both views)
  const calculateConsistencyPercentage = () => {
    if (timeframe === '7d') {
      // For 7d bind view, calculate from displayed bind completions
      const totalCompletions = displayBinds.reduce(
        (sum, bind) => sum + bind.completions.filter((c) => c).length,
        0
      );
      const totalPossible = displayBinds.length * 7;
      return totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
    }
    // For heat map view, calculate from daily aggregates
    const totalDays = consistencyData.length;
    const completedDays = consistencyData.filter((d) => d.completion_percentage >= 50).length;
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };

  const consistencyPercentage = calculateConsistencyPercentage();

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
        <RNText style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
          {getHeaderTitle()}
        </RNText>
        {/* Timeframe Dropdown */}
        <View>
          <Pressable
            style={[styles.timeframeDropdown, { backgroundColor: '#18181b' }]}
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
          {showTimeframeDropdown && onTimeframeChange && (
            <View style={[styles.dropdownMenu, { backgroundColor: '#18181b' }]}>
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
      </View>
      <View style={styles.percentageRow}>
        <RNText style={[styles.percentageText, { fontSize: 64, fontWeight: 'bold', color: '#ffffff' }]}>
          {consistencyPercentage}%
        </RNText>
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
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: trendPercentage >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {trendPercentage >= 0 ? '+' : ''}
            {trendPercentage}%
          </RNText>
        </View>
      </View>
    </View>
  );

  // Handle needle scroll to update selected index
  const handleNeedleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = SCREEN_WIDTH - 48 + 16; // Card width + spacing
    const index = Math.round(offsetX / cardWidth);
    if (index !== selectedNeedleIndex && index >= 0 && index < sampleNeedles.length) {
      setSelectedNeedleIndex(index);
      Haptics.selectionAsync();
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
          data={sampleNeedles}
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
                  backgroundColor: '#18181b',
                  width: CARD_WIDTH,
                },
              ]}
            >
              <View style={styles.needleCardHeader}>
                <View
                  style={[styles.needleColorIndicator, { backgroundColor: '#10b981' }]}
                />
                <View style={{ flex: 1 }}>
                  <RNText style={{ fontSize: 15, fontWeight: '600', color: '#ffffff' }} numberOfLines={2}>
                    {needle.title}
                  </RNText>
                  <Text
                    style={{ fontSize: 14, color: '#71717a', marginTop: 4, fontStyle: 'italic' }}
                  >
                    {needle.description}
                  </RNText>
                </View>
              </View>

              {/* Pagination dots */}
              {sampleNeedles.length > 1 && (
                <View style={styles.paginationDots}>
                  {sampleNeedles.map((_, index) => (
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
                                ? '#ffffff'
                                : '#18181b',
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
                    index === selectedBindIndex ? '#ffffff' : '#18181b',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: index === selectedBindIndex ? '600' : '400',
                  color:
                    index === selectedBindIndex ? '#000000' : '#a1a1aa',
                }}
              >
                {bind.bindName}
              </RNText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search button */}
        <Pressable
          style={[styles.searchButton, { backgroundColor: '#18181b' }]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowSearchModal(true);
          }}
        >
          <Ionicons name="search" size={20} color={'#a1a1aa'} />
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
                filterType === filter ? '#ffffff' : '#18181b',
            },
          ]}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: filterType === filter ? '600' : '400',
              color: filterType === filter ? '#000000' : '#a1a1aa',
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </RNText>
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
    <View style={[styles.insightBanner, { backgroundColor: '#18181b' }]}>
      <View style={styles.insightContent}>
        <Ionicons name="fitness" size={24} color={'#3b82f6'} />
        <RNText style={{ flex: 1, fontStyle: 'italic', marginLeft: 12, fontSize: 15, color: '#ffffff' }}>
          {getInsightMessage()}
        </RNText>
        <Ionicons name="arrow-forward" size={20} color={'#71717a'} />
      </View>
    </View>
  );

  // 7d: Show bind grid view with daily checkmarks
  if (timeframe === '7d') {
    // Generate day headers for last 7 days
    const dayHeaders: DayHeader[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dayHeaders.push({
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        dayOfMonth: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
      });
    }

    return (
      <View style={[styles.sevenDayCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        {renderHeader()}

        {/* Separator line */}
        <View style={[styles.separator, { backgroundColor: '#27272A' }]} />

        {/* Needle card (for needle view) */}
        {renderNeedleCard()}

        {/* Bind selector (for bind view) */}
        {renderBindSelector()}

        {renderFilterTabs()}

        {/* Day headers */}
        <View style={styles.dayHeaderRow}>
          {/* Empty corner cell for bind names column */}
          <View style={styles.bindNameColumnHeader} />

          {/* Day header cells */}
          {dayHeaders.map((day) => (
            <View key={day.fullDate} style={styles.dayCell}>
              <RNText style={{ fontSize: 12, color: '#71717a' }}>
                {day.dayOfWeek}
              </RNText>
              <RNText style={{ fontSize: 15, fontWeight: '500', color: '#ffffff', marginTop: 2 }}>
                {day.dayOfMonth}
              </RNText>
            </View>
          ))}
        </View>

        {/* Bind rows */}
        {displayBinds.map((bind, bindIndex) => (
          <View key={bindIndex} style={styles.bindRow}>
            {/* Bind name */}
            <View style={styles.bindNameCell}>
              <RNText style={{ fontSize: 15, color: '#a1a1aa' }}>
                {bind.bindName}
              </RNText>
            </View>

            {/* Completion cells */}
            {bind.completions.map((completed, dayIndex) => {
              const dayDate = dayHeaders[dayIndex].fullDate;
              const completionRate = completed ? 100 : 0;
              return (
                <View key={dayIndex} style={styles.dayCell}>
                  <Pressable onPress={() => handleDayPress(dayDate, completionRate)}>
                    <View
                      style={[
                        styles.completionCircle,
                        {
                          backgroundColor: completed
                            ? '#18181b'
                            : '#18181b',
                        },
                      ]}
                    >
                      {completed && (
                        <Ionicons name="checkmark" size={18} color={'#ffffff'} />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
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
                      Completion Rate
                    </RNText>
                    <RNText style={[styles.modalPercentage, { fontSize: 28, fontWeight: 'bold', color: '#ffffff' }]}>
                      {selectedDayData.completionRate}%
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

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSearchModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowSearchModal(false)}>
            <Pressable
              style={[styles.searchModalContent, { backgroundColor: '#18181b' }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.searchModalHeader}>
                <RNText style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                  Search Binds
                </RNText>
                <Pressable onPress={() => setShowSearchModal(false)}>
                  <Ionicons name="close" size={24} color={'#a1a1aa'} />
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    borderColor: '#27272A',
                  },
                ]}
                placeholder="Search for a bind..."
                placeholderTextColor={'#71717a'}
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
                      style={[styles.searchResultItem, { borderBottomColor: '#27272A' }]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedBindIndex(allBinds.indexOf(bind));
                        setShowSearchModal(false);
                        setBindSearchQuery('');
                      }}
                    >
                      <RNText style={{ fontSize: 15, color: '#ffffff' }}>{bind.bindName}</RNText>
                      <Ionicons name="chevron-forward" size={20} color={'#71717a'} />
                    </Pressable>
                  ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // 2w/1m/90d: Show heat map grid
  return (
    <View style={[styles.sevenDayCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
      {renderHeader()}

      {/* Separator line */}
      <View style={[styles.separator, { backgroundColor: '#27272A' }]} />

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
                <RNText style={{ fontSize: 12, fontWeight: '500', color: 'white' }}>
                  {dayOfMonth}
                </RNText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <RNText variant="textXs" style={{ color: '#71717a' }}>
            80%+
          </RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <RNText variant="textXs" style={{ color: '#71717a' }}>
            50-79%
          </RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <RNText variant="textXs" style={{ color: '#71717a' }}>
            {'<'}50%
          </RNText>
        </View>
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
                    Completion Rate
                  </RNText>
                  <RNText style={[styles.modalPercentage, { fontSize: 28, fontWeight: 'bold', color: '#ffffff' }]}>
                    {selectedDayData.completionRate}%
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

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSearchModal(false)}>
          <Pressable
            style={[styles.searchModalContent, { backgroundColor: '#18181b' }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.searchModalHeader}>
              <RNText style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                Search Binds
              </RNText>
              <Pressable onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color={'#a1a1aa'} />
              </Pressable>
            </View>

            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  borderColor: '#27272A',
                },
              ]}
              placeholder="Search for a bind..."
              placeholderTextColor={'#71717a'}
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
                    style={[styles.searchResultItem, { borderBottomColor: '#27272A' }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedBindIndex(allBinds.indexOf(bind));
                      setShowSearchModal(false);
                      setBindSearchQuery('');
                    }}
                  >
                    <RNText style={{ fontSize: 15, color: '#ffffff' }}>{bind.bindName}</RNText>
                    <Ionicons name="chevron-forward" size={20} color={'#71717a'} />
                  </Pressable>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
