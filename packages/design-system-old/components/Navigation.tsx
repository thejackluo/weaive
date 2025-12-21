/**
 * Weave Design System - Navigation Components
 *
 * Bottom tab bar and header bar for app navigation
 * Thumb-friendly, accessible, animated
 *
 * Usage:
 * <BottomTabBar
 *   tabs={[
 *     { id: 'home', icon: <HomeIcon />, label: 'Home' },
 *     { id: 'binds', icon: <ListIcon />, label: 'Binds' },
 *   ]}
 *   activeTab="home"
 *   onTabPress={(id) => navigate(id)}
 * />
 */

import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// BOTTOM TAB BAR
// =============================================================================

export interface Tab {
  /** Unique tab identifier */
  id: string;

  /** Tab icon component */
  icon: React.ReactNode;

  /** Tab label */
  label: string;

  /** Optional badge count */
  badge?: number;

  /** Disabled state */
  disabled?: boolean;
}

export interface BottomTabBarProps {
  /** Array of tabs */
  tabs: Tab[];

  /** Active tab ID */
  activeTab: string;

  /** Tab press handler */
  onTabPress: (tabId: string) => void;

  /** Custom style */
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BottomTabBar({
  tabs,
  activeTab,
  onTabPress,
  style,
}: BottomTabBarProps) {
  const { colors, spacing, shadows, blur } = useTheme();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.background.glass,
          borderTopWidth: 1,
          borderTopColor: colors.border.glass,
          paddingBottom: spacing[2],
          paddingTop: spacing[2],
          paddingHorizontal: spacing[2],
          ...shadows.lg,
        },
        style,
      ]}
    >
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          onPress={() => !tab.disabled && onTabPress(tab.id)}
        />
      ))}
    </View>
  );
}

// =============================================================================
// TAB BAR ITEM
// =============================================================================

interface TabBarItemProps {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}

function TabBarItem({ tab, active, onPress }: TabBarItemProps) {
  const { colors, spacing, layout, radius, springs, durations } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const indicatorWidth = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    indicatorWidth.value = withTiming(active ? 1 : 0, {
      duration: durations.fast,
    });
  }, [active, indicatorWidth, durations.fast]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(indicatorWidth.value, [0, 1], [0, 32]);
    const opacity = interpolate(indicatorWidth.value, [0, 1], [0, 1]);

    return {
      width,
      opacity,
    };
  });

  // Handlers
  const handlePressIn = useCallback(() => {
    if (!tab.disabled) {
      scale.value = withSpring(0.9, springs.press);
    }
  }, [scale, springs.press, tab.disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={tab.disabled}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active, disabled: tab.disabled }}
      style={[
        styles.tabItem,
        {
          flex: 1,
          minHeight: layout.touchTarget.recommended,
          opacity: tab.disabled ? 0.5 : 1,
        },
        containerAnimatedStyle,
      ]}
    >
      {/* Active indicator line */}
      <Animated.View
        style={[
          styles.indicator,
          {
            height: 2,
            backgroundColor: colors.accent[500],
            borderRadius: radius.full,
            marginBottom: spacing[1],
          },
          indicatorAnimatedStyle,
        ]}
      />

      {/* Icon with badge */}
      <View style={styles.iconContainer}>
        <View
          style={{
            opacity: active ? 1 : 0.6,
          }}
        >
          {tab.icon}
        </View>

        {/* Badge */}
        {tab.badge !== undefined && tab.badge > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.rose[600],
                borderRadius: radius.full,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 4,
                position: 'absolute',
                top: -4,
                right: -8,
              },
            ]}
          >
            <Text
              variant="labelXs"
              customColor={colors.dark[50]}
              weight="bold"
            >
              {tab.badge > 99 ? '99+' : tab.badge.toString()}
            </Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Text
        variant="labelXs"
        color={active ? 'accent' : 'muted'}
        weight={active ? 'medium' : 'regular'}
        style={{ marginTop: spacing[0.5] }}
      >
        {tab.label}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// HEADER BAR
// =============================================================================

export interface HeaderBarProps {
  /** Header title */
  title?: string;

  /** Left action (usually back button) */
  leftAction?: React.ReactNode;

  /** Right actions */
  rightActions?: React.ReactNode[];

  /** Subtitle */
  subtitle?: string;

  /** Custom style */
  style?: ViewStyle;
}

export function HeaderBar({
  title,
  leftAction,
  rightActions = [],
  subtitle,
  style,
}: HeaderBarProps) {
  const { colors, spacing, layout, shadows } = useTheme();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.background.glass,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.glass,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          minHeight: layout.touchTarget.large,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* Left section */}
      <View style={styles.headerLeft}>
        {leftAction && (
          <View style={{ marginRight: spacing[3] }}>{leftAction}</View>
        )}
      </View>

      {/* Center section */}
      <View style={styles.headerCenter}>
        {title && (
          <Text variant="textLg" color="primary" weight="semibold">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            variant="textSm"
            color="muted"
            style={{ marginTop: spacing[0.5] }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right section */}
      <View style={styles.headerRight}>
        {rightActions.map((action, i) => (
          <View
            key={i}
            style={{
              marginLeft: i > 0 ? spacing[2] : 0,
            }}
          >
            {action}
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BACK BUTTON
// =============================================================================

export interface BackButtonProps {
  /** Press handler */
  onPress: () => void;

  /** Custom label (default: "Back") */
  label?: string;

  /** Disabled state */
  disabled?: boolean;
}

export function BackButton({ onPress, label, disabled = false }: BackButtonProps) {
  const { colors, spacing, springs } = useTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.9, springs.press);
    }
  }, [scale, springs.press, disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label || 'Go back'}
      style={[
        styles.backButton,
        {
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
    >
      {/* Back arrow */}
      <View
        style={{
          width: 8,
          height: 8,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: colors.accent[400],
          transform: [{ rotate: '45deg' }],
          marginRight: spacing[1.5],
        }}
      />

      {label && (
        <Text variant="labelBase" color="accent" weight="medium">
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Bottom Tab Bar
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    alignSelf: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header Bar
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'flex-end',
  },

  // Back Button
  backButton: {
    alignItems: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default BottomTabBar;
