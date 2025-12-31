/**
 * ExpandableCard Component
 *
 * Collapsible card wrapper with independent toggle behavior (not accordion style).
 * Used in Daily Detail page for Binds and Reflection sections.
 *
 * Tech-Spec: Task 4
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Heading, Caption, useTheme } from '@/design-system';

export interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function ExpandableCard({
  title,
  subtitle,
  defaultExpanded = false,
  children,
}: ExpandableCardProps) {
  const { colors, spacing } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Animated value for rotation (0 = down, 1 = up)
  const rotation = useSharedValue(defaultExpanded ? 1 : 0);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  };

  // Animated chevron rotation
  const chevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <Card variant="glass" padding="default" style={{ marginBottom: spacing[4] }}>
      {/* Header - Always Visible */}
      <Pressable
        onPress={handleToggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
      >
        <View style={styles.titleContainer}>
          <Heading variant="displayLg" style={{ color: colors.text.primary }}>
            {title}
          </Heading>
          {subtitle && (
            <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
              {subtitle}
            </Caption>
          )}
        </View>

        <Animated.View style={chevronStyle}>
          <MaterialIcons name="expand-more" size={24} color={colors.text.secondary} />
        </Animated.View>
      </Pressable>

      {/* Content - Conditionally Rendered */}
      {isExpanded && <View style={[styles.content, { marginTop: spacing[4] }]}>{children}</View>}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  content: {
    // Content spacing handled by marginTop prop
  },
});
