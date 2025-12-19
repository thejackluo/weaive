/**
 * GlassButton Component
 *
 * Beautiful gradient glass morphism button with smooth animations
 * Used throughout the app for primary actions, especially in auth flows
 *
 * Features:
 * - Gradient backgrounds (customizable)
 * - Glass morphism effect with blur
 * - Smooth press animations
 * - Loading states with spinner
 * - Accessibility support
 * - Multiple variants: primary, secondary, ghost
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// =============================================================================
// TYPES
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Press handler */
  onPress: () => void;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom gradient colors (overrides variant) */
  gradientColors?: string[];
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Icon component (rendered before text) */
  icon?: React.ReactNode;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const VARIANT_GRADIENTS = {
  primary: ['#6366f1', '#8b5cf6'], // Indigo to Purple
  secondary: ['#10b981', '#14b8a6'], // Green to Teal
  ghost: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'], // Subtle glass
  glass: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'], // Glass morphism
};

const SIZE_CONFIG = {
  sm: { height: 44, paddingHorizontal: 20, fontSize: 15 },
  md: { height: 52, paddingHorizontal: 24, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: 32, fontSize: 18 },
};

// =============================================================================
// ANIMATED TOUCHABLE
// =============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// =============================================================================
// COMPONENT
// =============================================================================

export function GlassButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  gradientColors,
  style,
  textStyle,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: GlassButtonProps) {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Get size config
  const sizeConfig = SIZE_CONFIG[size];

  // Get gradient colors
  const colors = gradientColors || VARIANT_GRADIENTS[variant];

  // =============================================================================
  // ANIMATIONS
  // =============================================================================

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // =============================================================================
  // RENDER
  // =============================================================================

  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
        ]}
      >
        {/* Glass overlay effect */}
        <View style={styles.glassOverlay} />

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              color={variant === 'ghost' || variant === 'glass' ? '#000' : '#fff'}
              size="small"
            />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  { fontSize: sizeConfig.fontSize },
                  (variant === 'ghost' || variant === 'glass') && styles.darkText,
                  textStyle,
                ]}
              >
                {children}
              </Text>
            </>
          )}
        </View>

        {/* Inner shadow for depth */}
        <View style={styles.innerShadow} />
      </LinearGradient>
    </AnimatedTouchable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Glass effect shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  darkText: {
    color: '#1a1a1a',
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    pointerEvents: 'none',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

// =============================================================================
// PRESET VARIANTS
// =============================================================================

/**
 * Primary action button (gradient indigo to purple)
 */
export function PrimaryGlassButton(props: Omit<GlassButtonProps, 'variant'>) {
  return <GlassButton variant="primary" {...props} />;
}

/**
 * Secondary action button (gradient green to teal)
 */
export function SecondaryGlassButton(props: Omit<GlassButtonProps, 'variant'>) {
  return <GlassButton variant="secondary" {...props} />;
}

/**
 * Ghost button with subtle glass effect
 */
export function GhostGlassButton(props: Omit<GlassButtonProps, 'variant'>) {
  return <GlassButton variant="ghost" {...props} />;
}

/**
 * Full glass morphism button
 */
export function GlassMorphButton(props: Omit<GlassButtonProps, 'variant'>) {
  return <GlassButton variant="glass" {...props} />;
}
