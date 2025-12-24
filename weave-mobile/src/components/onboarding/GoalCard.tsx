/**
 * GoalCard Component
 *
 * Reusable selectable card for displaying goal options in First Needle selection.
 * Features:
 * - Visual states: unselected, selected
 * - Tap feedback animation (0.98 scale)
 * - Accessibility support (VoiceOver, touch targets)
 * - Min 48px touch target
 *
 * Used in Story 1.7: Choose Your First Needle
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export interface GoalCardProps {
  id: number;
  text: string;
  selected: boolean;
  onPress: () => void;
  reducedMotionEnabled?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  id: _id,
  text,
  selected,
  onPress,
  reducedMotionEnabled = false,
}) => {
  // Animation for tap feedback (disabled if reduced motion is enabled)
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!reducedMotionEnabled) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!reducedMotionEnabled) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityState={{ selected }}
        accessibilityHint={selected ? 'Currently selected goal' : 'Tap to select this goal'}
        style={[styles.card, selected ? styles.cardSelected : styles.cardUnselected]}
      >
        <RNText style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
          {text}
        </RNText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 64, // Min 48px touch target + padding
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardUnselected: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green tint
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  textUnselected: {
    fontWeight: '400',
    color: '#333333',
  },
  textSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});
