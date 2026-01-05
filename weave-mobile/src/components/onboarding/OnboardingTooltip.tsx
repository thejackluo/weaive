/**
 * OnboardingTooltip - Interactive tooltip for in-app onboarding
 *
 * Shows contextual messages to guide users through their first actions
 * Features:
 * - Animated entrance/exit
 * - Dismissible (tap outside or "Got it" button)
 * - Optional "Skip Tutorial" option
 * - Positioned at top of screen (below safe area)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text, Button, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingTooltipProps {
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Main message to display */
  message: string;
  /** Optional subtitle/description */
  description?: string;
  /** Icon to show (default: 'information-circle') */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Callback when user dismisses (taps "Got it") */
  onDismiss: () => void;
  /** Optional callback when user skips entire tutorial */
  onSkip?: () => void;
  /** Show "Skip Tutorial" button (default: true) */
  showSkipButton?: boolean;
}

export function OnboardingTooltip({
  visible,
  message,
  description,
  icon = 'information-circle',
  onDismiss,
  onSkip,
  showSkipButton = true,
}: OnboardingTooltipProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handleSkip = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onSkip?.();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={handleDismiss}
      >
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              paddingTop: insets.top + 16,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.tooltipContent}
          >
            <Card
              variant="default"
              style={[
                styles.card,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.accent[500],
                  borderWidth: 2,
                  shadowColor: colors.accent[500],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                },
              ]}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${colors.accent[500]}20` },
                ]}
              >
                <Ionicons name={icon} size={32} color={colors.accent[500]} />
              </View>

              {/* Message */}
              <Text
                variant="textLg"
                weight="semibold"
                style={[styles.message, { color: colors.text.primary }]}
              >
                {message}
              </Text>

              {/* Optional Description */}
              {description && (
                <Text
                  variant="textBase"
                  style={[styles.description, { color: colors.text.secondary }]}
                >
                  {description}
                </Text>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleDismiss}
                  style={styles.primaryButton}
                >
                  <Text
                    variant="textBase"
                    weight="semibold"
                    style={{ color: colors.text.inverse }}
                  >
                    Got it!
                  </Text>
                </Button>

                {showSkipButton && onSkip && (
                  <Pressable onPress={handleSkip} style={styles.skipButton}>
                    <Text
                      variant="textSm"
                      style={{ color: colors.text.muted, textDecorationLine: 'underline' }}
                    >
                      Skip Tutorial
                    </Text>
                  </Pressable>
                )}
              </View>
            </Card>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltipContainer: {
    paddingHorizontal: 20,
  },
  tooltipContent: {
    width: '100%',
  },
  card: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    fontSize: 20,
  },
  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
