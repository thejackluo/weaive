/**
 * PainpointCard Component
 *
 * Selectable card for emotional state selection
 * NativeWind v5 styling
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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
  style?: any;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PainpointCard({
  painpoint,
  isSelected,
  onPress,
  style,
}: PainpointCardProps) {
  const screenWidth = Dimensions.get('window').width;

  // Press animation
  const scale = useSharedValue(1);

  // Check icon fade animation
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    checkOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
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

  // Dynamic width for responsive layout
  const cardWidth = screenWidth < 375 ? '100%' : '48%';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="min-h-[160px] mb-3 rounded-2xl overflow-hidden"
      style={[
        {
          width: cardWidth,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#3B72F6' : 'rgba(255, 255, 255, 0.1)',
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
      <View className="flex-1 items-center justify-center py-4 px-3">
        {/* Icon */}
        <View className="mb-3">
          <SymbolView
            name={painpoint.icon as any}
            size={32}
            tintColor={isSelected ? '#3B72F6' : '#A3A3A3'}
          />
        </View>

        {/* Title */}
        <Text
          className="text-center mb-2 text-lg font-semibold"
          style={{
            color: isSelected ? '#262626' : '#171717',
          }}
        >
          {painpoint.title}
        </Text>

        {/* Description */}
        <Text
          className="text-center text-sm leading-5"
          style={{
            color: isSelected ? '#525252' : '#737373',
          }}
        >
          {painpoint.description}
        </Text>

        {/* Check Icon Overlay */}
        {isSelected && (
          <Animated.View
            className="absolute top-2 right-2"
            style={checkAnimatedStyle}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#3B72F6"
            />
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}
