/**
 * NeedleCard Component
 *
 * Collapsible card showing a needle (goal) with its binds
 *
 * Wireframe behavior:
 * - Default: All needles visible, all collapsed
 * - When expanded: This needle shows binds, OTHER needles hide completely
 * - When collapsed: Binds hide, other needles reappear
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme, Body, Caption } from '@/design-system';
import { BindItem } from './BindItem';
import type { Bind } from '@/types/binds';

interface Needle {
  id: string;
  title: string;
  why: string;
  color: 'blue' | 'green' | 'red' | 'violet' | 'emerald';
  completedBinds: number;
  totalBinds: number;
  consistency7d: number | null;
}

interface NeedleCardProps {
  needle: Needle;
  binds: Bind[];
  isExpanded: boolean;
  isVisible: boolean; // Controls whether the card shows at all (for hide-others behavior)
  onToggle: () => void;
  onBindPress: (bind: Bind) => void;
}

// Color mapping for needle accent bars
const COLOR_MAP = {
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  violet: '#8B5CF6',
  emerald: '#10B981',
};

export function NeedleCard({
  needle,
  binds,
  isExpanded,
  isVisible,
  onToggle,
  onBindPress,
}: NeedleCardProps) {
  const { colors, spacing, radius } = useTheme();
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  // Update rotation when expanded state changes
  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0);
  }, [isExpanded]);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: interpolate(height.value, [0, 100], [0, 1]),
  }));

  // Don't render if not visible (hide-others behavior)
  if (!isVisible) {
    return null;
  }

  const accentColor = COLOR_MAP[needle.color];

  return (
    <View style={[styles.container, { marginBottom: spacing[3] }]}>
      {/* Needle Header (always visible) */}
      <Pressable
        style={[
          styles.header,
          {
            backgroundColor: colors.background.secondary,
            borderColor: colors.border.subtle,
            borderRadius: radius.lg,
            padding: spacing[4],
          },
        ]}
        onPress={onToggle}
      >
        {/* Left accent bar */}
        <View
          style={[
            styles.accentBar,
            {
              backgroundColor: accentColor,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Body weight="bold" style={{ color: colors.text.primary }}>
                {needle.title}
              </Body>
              <Caption style={{ color: colors.text.muted, marginTop: spacing[1] }}>
                Why: {needle.why}
              </Caption>
            </View>

            <View style={styles.stats}>
              <Caption style={{ color: colors.text.secondary }}>
                {needle.completedBinds}/{needle.totalBinds} Completed
              </Caption>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <Animated.View style={[styles.chevron, animatedChevronStyle]}>
          <Body style={{ color: colors.text.muted }}>▼</Body>
        </Animated.View>
      </Pressable>

      {/* Binds List (shown when expanded) */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.bindsContainer,
            {
              marginTop: spacing[2],
              paddingHorizontal: spacing[2],
            },
            animatedHeightStyle,
          ]}
          onLayout={(event) => {
            const { height: measuredHeight } = event.nativeEvent.layout;
            height.value = withTiming(measuredHeight, { duration: 300 });
          }}
        >
          {binds.map((bind) => (
            <BindItem key={bind.id} bind={bind} onPress={() => onBindPress(bind)} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  stats: {
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
    width: 24,
    alignItems: 'center',
  },
  bindsContainer: {
    overflow: 'hidden',
  },
});
