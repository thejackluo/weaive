/**
 * Weave Design System - Input Component
 *
 * Text input with label, helper text, and error states
 * Dark mode optimized
 *
 * Usage:
 * <Input label="Email" placeholder="Enter email" />
 * <Input error="Invalid email" />
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  /** Input label */
  label?: string;

  /** Helper text below input */
  helperText?: string;

  /** Error message (shows error state) */
  error?: string;

  /** Input size */
  size?: InputSize;

  /** Left icon/element */
  leftElement?: React.ReactNode;

  /** Right icon/element */
  rightElement?: React.ReactNode;

  /** Disabled state */
  disabled?: boolean;

  /** Container style */
  containerStyle?: any;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);

export const Input = forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftElement,
      rightElement,
      disabled = false,
      containerStyle,
      ...textInputProps
    },
    ref
  ) => {
    const { colors, radius, spacing, layout, typography, durations } =
      useTheme();

    // Focus state
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: durations.fast });
        textInputProps.onFocus?.(e);
      },
      [focusAnim, durations.fast, textInputProps]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: durations.fast });
        textInputProps.onBlur?.(e);
      },
      [focusAnim, durations.fast, textInputProps]
    );

    // Determine state
    const hasError = !!error;
    const showHelper = helperText && !hasError;

    // Get size values
    const sizeConfig = getSizeConfig(size, layout, spacing);

    // Animated border color
    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = hasError
        ? colors.border.error
        : interpolateColor(
            focusAnim.value,
            [0, 1],
            [colors.border.muted, colors.border.focus]
          );

      return {
        borderColor,
      };
    });

    return (
      <View style={containerStyle}>
        {/* Label */}
        {label && (
          <Text
            variant="labelSm"
            color={hasError ? 'error' : 'secondary'}
            style={{ marginBottom: spacing[1.5] }}
          >
            {label}
          </Text>
        )}

        {/* Input container */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              height: sizeConfig.height,
              borderRadius: radius.lg,
              backgroundColor: disabled
                ? colors.background.muted
                : colors.background.elevated,
              borderWidth: 1.5,
              paddingHorizontal: spacing[4],
            },
            animatedContainerStyle,
          ]}
        >
          {/* Left element */}
          {leftElement && (
            <View style={[styles.element, { marginRight: spacing[3] }]}>
              {leftElement}
            </View>
          )}

          {/* Text input */}
          <AnimatedTextInput
            ref={ref}
            {...textInputProps}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            placeholderTextColor={colors.text.placeholder}
            style={[
              styles.input,
              typography.textBase,
              {
                color: disabled ? colors.text.disabled : colors.text.primary,
              },
            ]}
          />

          {/* Right element */}
          {rightElement && (
            <View style={[styles.element, { marginLeft: spacing[3] }]}>
              {rightElement}
            </View>
          )}
        </Animated.View>

        {/* Error message */}
        {hasError && (
          <Text
            variant="textXs"
            color="error"
            style={{ marginTop: spacing[1] }}
          >
            {error}
          </Text>
        )}

        {/* Helper text */}
        {showHelper && (
          <Text
            variant="textXs"
            color="muted"
            style={{ marginTop: spacing[1] }}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// =============================================================================
// TEXTAREA
// =============================================================================

export interface TextAreaProps extends Omit<InputProps, 'size'> {
  /** Number of visible lines */
  lines?: number;

  /** Maximum height */
  maxHeight?: number;
}

export const TextArea = forwardRef<RNTextInput, TextAreaProps>(
  ({ lines = 4, maxHeight = 200, ...props }, ref) => {
    const { spacing, typography } = useTheme();

    const lineHeight = typography.textBase.lineHeight || 24;
    const minHeight = lineHeight * lines + spacing[3] * 2;

    return (
      <Input
        ref={ref}
        {...props}
        multiline
        textAlignVertical="top"
        containerStyle={[
          props.containerStyle,
          {
            minHeight,
            maxHeight,
          },
        ]}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

// =============================================================================
// SEARCH INPUT
// =============================================================================

export interface SearchInputProps extends Omit<InputProps, 'leftElement'> {
  /** Clear button handler */
  onClear?: () => void;
}

export const SearchInput = forwardRef<RNTextInput, SearchInputProps>(
  ({ onClear, value, ...props }, ref) => {
    const { colors, spacing } = useTheme();

    const showClear = value && value.length > 0;

    return (
      <Input
        ref={ref}
        {...props}
        value={value}
        leftElement={
          // Search icon placeholder
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: colors.text.muted,
            }}
          />
        }
        rightElement={
          showClear ? (
            <Pressable onPress={onClear}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.dark[700],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="labelXs" color="secondary">
                  ×
                </Text>
              </View>
            </Pressable>
          ) : undefined
        }
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// =============================================================================
// HELPERS
// =============================================================================

interface SizeConfig {
  height: number;
}

function getSizeConfig(
  size: InputSize,
  layout: any,
  spacing: any
): SizeConfig {
  switch (size) {
    case 'sm':
      return { height: layout.input.height.sm };
    case 'lg':
      return { height: layout.input.height.lg };
    case 'md':
    default:
      return { height: layout.input.height.md };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  element: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default Input;
