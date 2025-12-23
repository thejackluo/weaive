/**
 * AnimatedText Component
 * Text with entrance animations using Reanimated
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { AnimatedTextProps } from './types';
import { useReducedMotion, springs } from '../../animations';

/**
 * AnimatedText component with entrance animations
 *
 * @example
 * ```tsx
 * <AnimatedText animation="fadeIn" variant="titleLg">
 *   Welcome!
 * </AnimatedText>
 * ```
 */
export function AnimatedText({
  animation = 'fadeIn',
  delay = 0,
  children,
  ...textProps
}: AnimatedTextProps) {
  const reducedMotion = useReducedMotion();
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (reducedMotion) {
      // Skip animations if reduced motion enabled
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    const animationDelay = delay;

    switch (animation) {
      case 'fadeIn':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 300 }));
        break;

      case 'slideUp':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 300 }));
        translateY.value = withDelay(animationDelay, withSpring(0, springs.smooth));
        break;

      case 'typewriter':
        // Typewriter effect approximated with fast fade
        opacity.value = withDelay(animationDelay, withTiming(1, {
          duration: 500,
          easing: Easing.linear,
        }));
        break;
    }
  }, [animation, delay, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text {...textProps}>{children}</Text>
    </Animated.View>
  );
}

AnimatedText.displayName = 'AnimatedText';
