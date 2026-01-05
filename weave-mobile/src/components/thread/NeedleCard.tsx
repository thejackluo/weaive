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
  firstBindRef?: (ref: View | null) => void; // For onboarding position tracking
  isHighlightedFirstBind?: boolean; // For onboarding shimmer on first bind
  isTourActive?: boolean; // Disable interactions during tour (except first bind)
}

// Minimal aesthetic: All needles use subtle white accent bar (no color distinction)
const ACCENT_COLOR = '#FFFFFF';

export function NeedleCard({
  needle,
  binds,
  isExpanded,
  isVisible,
  onToggle,
  onBindPress,
  firstBindRef,
  isHighlightedFirstBind,
  isTourActive,
}: NeedleCardProps) {
  const { colors, spacing, radius } = useTheme();
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Update rotation and opacity when expanded state changes
  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0);
    opacity.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedBindsStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Don't render if not visible (hide-others behavior)
  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { marginBottom: spacing[2] }]}>
      {/* Needle Header (always visible) */}
      <Pressable
        style={[
          styles.header,
          {
            backgroundColor: colors.background.secondary,
            borderColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: radius.xl, // iOS 17 style (24px)
            padding: spacing[4],
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            opacity: isTourActive ? 0.5 : 1,
          },
        ]}
        onPress={isTourActive ? undefined : onToggle}
        disabled={isTourActive}
      >
        {/* Left accent bar - minimal white line */}
        <View
          style={[
            styles.accentBar,
            {
              backgroundColor: ACCENT_COLOR,
              opacity: 0.15, // Subtle presence
            },
          ]}
        />

        {/* Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Body
                weight="bold"
                style={{
                  color: '#FFFFFF', // Pure white for needle titles
                  fontSize: 17,
                  letterSpacing: -0.5,
                  fontWeight: '700',
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {needle.title}
              </Body>
              {/* Only show "Why:" when expanded - cleaner collapsed state */}
              {isExpanded && (
                <Caption
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginTop: spacing[2],
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  Why: {needle.why}
                </Caption>
              )}
            </View>

            <View style={styles.stats}>
              <Caption
                style={{
                  color: 'rgba(255, 255, 255, 0.7)', // Lighter gray for secondary info
                  fontSize: 14,
                  fontWeight: '600', // Less bold than titles
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {needle.completedBinds}/{needle.totalBinds}
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
            animatedBindsStyle,
          ]}
        >
          {binds.map((bind, index) => {
            if (index === 0 && firstBindRef) {
              // First bind with ref for position tracking
              return (
                <View
                  key={bind.id}
                  ref={firstBindRef}
                  collapsable={false}
                >
                  <BindItem
                    bind={bind}
                    onPress={() => onBindPress(bind)}
                    isHighlighted={isHighlightedFirstBind}
                    disabled={!isHighlightedFirstBind && isTourActive} // Only enabled when highlighted
                  />
                </View>
              );
            }
            // Other binds without ref
            return (
              <BindItem
                key={bind.id}
                bind={bind}
                onPress={() => onBindPress(bind)}
                isHighlighted={false}
                disabled={isTourActive} // Disable during tour
              />
            );
          })}
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
