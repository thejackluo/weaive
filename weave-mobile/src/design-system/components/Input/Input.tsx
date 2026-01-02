/**
 * Input Component - Weave Design System
 *
 * A beautiful, accessible text input with glass morphism effects.
 * Features:
 * - Glass morphism styling
 * - Focus state animations
 * - Error state with styling
 * - Optional icons (left/right)
 * - Secure text entry for passwords
 * - Character counter
 * - Helper text
 */

import React, { useState, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Pressable as _Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import type { InputVariant, InputSize } from './types';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

export function Input({
  variant = 'default',
  size = 'md',
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  showCharacterCount = false,
  maxCharacters,
  containerStyle,
  inputStyle,
  labelStyle,
  disabled = false,
  value,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const { colors, spacing, radius, typography, springs } = useTheme();
  const [_isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);

  // Animation values
  const borderOpacity = useSharedValue(0.1);
  const _borderColor = useSharedValue(colors.border.muted);
  const glassOpacity = useSharedValue(0.05);

  // Determine effective variant (error takes precedence)
  const effectiveVariant = errorText ? 'error' : variant;

  // Handle focus
  const handleFocus = useCallback(
    (event: any) => {
      setIsFocused(true);
      borderOpacity.value = withSpring(0.4, springs.default);
      glassOpacity.value = withTiming(0.1, { duration: 150 });
      onFocus?.(event);
    },
    [onFocus, borderOpacity, glassOpacity, springs]
  );

  // Handle blur
  const handleBlur = useCallback(
    (event: any) => {
      setIsFocused(false);
      borderOpacity.value = withSpring(0.1, springs.default);
      glassOpacity.value = withTiming(0.05, { duration: 150 });
      onBlur?.(event);
    },
    [onBlur, borderOpacity, glassOpacity, springs]
  );

  // Handle value change
  const handleChangeText = useCallback(
    (text: string) => {
      setCharacterCount(text.length);
      textInputProps.onChangeText?.(text);
    },
    [textInputProps.onChangeText]
  );

  // Get variant styles
  const variantStyles = getVariantStyles(effectiveVariant, colors);
  const sizeStyles = getSizeStyles(size, spacing, typography);

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: variantStyles.borderColor,
      borderWidth: 1.5,
      opacity: borderOpacity.value,
    };
  });

  // Animated glass style
  const animatedGlassStyle = useAnimatedStyle(() => {
    return {
      opacity: glassOpacity.value,
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={[typography.labelBase, styles.label, { color: colors.text.secondary }, labelStyle]}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          sizeStyles.container,
          { backgroundColor: colors.background.secondary },
          disabled && styles.disabled,
        ]}
      >
        {/* Glass effect background */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: variantStyles.glassColor,
              borderRadius: radius.lg,
            },
            animatedGlassStyle,
          ]}
        />

        {/* Animated border */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius.lg,
            },
            animatedBorderStyle,
          ]}
        />

        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <AnimatedTextInput
          {...textInputProps}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          editable={!disabled}
          style={[
            typography.textBase,
            styles.input,
            sizeStyles.input,
            {
              color: colors.text.primary,
            },
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            inputStyle,
          ]}
          placeholderTextColor={colors.text.muted}
          selectionColor={colors.accent[500]}
          maxLength={maxCharacters}
        />

        {/* Right Icon */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Helper/Error Text and Character Count */}
      <View style={styles.footer}>
        {(helperText || errorText) && (
          <Text
            style={[
              typography.textXs,
              styles.helperText,
              {
                color: errorText ? colors.text.error : colors.text.muted,
              },
            ]}
          >
            {errorText || helperText}
          </Text>
        )}

        {showCharacterCount && maxCharacters && (
          <Text
            style={[
              typography.textXs,
              styles.characterCount,
              {
                color: characterCount > maxCharacters ? colors.text.error : colors.text.muted,
              },
            ]}
          >
            {characterCount}/{maxCharacters}
          </Text>
        )}
      </View>
    </View>
  );
}

// Variant styles
function getVariantStyles(variant: InputVariant, colors: any) {
  const variants = {
    default: {
      borderColor: colors.border.muted,
      glassColor: colors.background.glass,
    },
    error: {
      borderColor: colors.border.error,
      glassColor: `${colors.rose[500]}15`,
    },
    success: {
      borderColor: colors.emerald[500],
      glassColor: `${colors.emerald[500]}15`,
    },
  };

  return variants[variant];
}

// Size styles
function getSizeStyles(size: InputSize, spacing: any, _typography: any) {
  const sizes = {
    sm: {
      container: {
        height: 36,
        paddingHorizontal: spacing[3],
      },
      input: {
        fontSize: 12,
        paddingVertical: 0,
      },
    },
    md: {
      container: {
        height: 48,
        paddingHorizontal: spacing[4],
      },
      input: {
        fontSize: 14,
        paddingVertical: 0,
      },
    },
    lg: {
      container: {
        height: 56,
        paddingHorizontal: spacing[5],
      },
      input: {
        fontSize: 16,
        paddingVertical: 0,
      },
    },
  };

  return sizes[size];
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    fontWeight: '400',
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
    zIndex: 1,
  },
  rightIcon: {
    marginLeft: 8,
    zIndex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    minHeight: 18,
  },
  helperText: {
    flex: 1,
  },
  characterCount: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
