/**
 * PainpointCard Component
 *
 * Selectable card for emotional state selection
 * NativeWind v5 styling
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';

// =============================================================================
// TYPES
// =============================================================================

export interface Painpoint {
  id: string;
  title: string;
  description: string;
  icon: string; // SF Symbol name
}

export interface PainpointCardProps {
  painpoint: Painpoint;
  isSelected: boolean;
  onPress: (id: string) => void;
  style?: ViewStyle | ViewStyle[];
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PainpointCardComponent({ painpoint, isSelected, onPress, style }: PainpointCardProps) {
  // Press animation
  const scale = useSharedValue(1);

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, []);

  const handlePress = useCallback(() => {
    // Trigger haptic feedback ONLY on state change
    if (isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Deselect
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Select
    }

    onPress(painpoint.id);
  }, [isSelected, onPress, painpoint.id]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          minHeight: 160,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
        scaleAnimatedStyle,
        style,
      ]}
      accessibilityLabel={`${painpoint.title} painpoint. ${
        isSelected ? 'Selected. Double tap to deselect' : 'Double tap to select'
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Content Container */}
      <View className="flex-1 items-center justify-center py-6 px-4">
        {/* Icon */}
        <View className="mb-4">
          <SymbolView
            name={painpoint.icon as any}
            size={40}
            tintColor={isSelected ? '#FFFFFF' : '#A3A3A3'}
          />
        </View>

        {/* Title */}
        <Text
          className="text-center mb-4"
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: isSelected ? '#FFFFFF' : '#A3A3A3',
          }}
        >
          {painpoint.title}
        </Text>

        {/* Description */}
        <Text
          className="text-center"
          style={{
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '400',
            color: isSelected ? '#E5E5E5' : '#737373',
          }}
        >
          {painpoint.description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// Memoize to prevent unnecessary re-renders (4 cards = 4x performance impact)
export const PainpointCard = React.memo(PainpointCardComponent);
