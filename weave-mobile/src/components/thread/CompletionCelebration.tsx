/**
 * CompletionCelebration Component (Phase 2d)
 *
 * Shows after bind completion with:
 * - Confetti animation
 * - Affirmation: "You're getting closer to [Needle Name]!"
 * - Level progress bar (animated increase)
 * - Optional description input (280 char max, skippable)
 * - Skip and Done buttons
 * - Auto-dismiss after 5 seconds if no interaction
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, TextInput, Dimensions } from 'react-native';
import { useTheme, Heading, Body, Caption, Button } from '@/design-system';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface CompletionCelebrationProps {
  visible: boolean;
  needleName: string; // Goal title
  level: number;
  levelProgress: number; // Percentage to next level (0-100)
  onComplete: (description?: string) => void;
  onSkip: () => void;
}

export function CompletionCelebration({
  visible,
  needleName,
  level,
  levelProgress,
  onComplete,
  onSkip,
}: CompletionCelebrationProps) {
  const { colors, spacing, radius } = useTheme();
  const [description, setDescription] = useState('');
  const [charCount, setCharCount] = useState(0);
  const confettiRef = useRef<any>(null);
  const autoDismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const progressWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Trigger confetti and animations when visible
  useEffect(() => {
    if (visible) {
      // Fire confetti
      confettiRef.current?.start();

      // Animate progress bar
      progressWidth.value = withDelay(300, withSpring(levelProgress, { damping: 15 }));

      // Fade in content
      contentOpacity.value = withDelay(100, withSpring(1));

      // Auto-dismiss after 5 seconds if no interaction
      autoDismissTimeout.current = setTimeout(() => {
        handleSkip();
      }, 5000);

      return () => {
        if (autoDismissTimeout.current) {
          clearTimeout(autoDismissTimeout.current);
        }
      };
    } else {
      // Reset animations
      progressWidth.value = 0;
      contentOpacity.value = 0;
      setDescription('');
      setCharCount(0);
    }
  }, [visible, levelProgress]);

  const handleDescriptionChange = (text: string) => {
    // Clear auto-dismiss when user interacts
    if (autoDismissTimeout.current) {
      clearTimeout(autoDismissTimeout.current);
      autoDismissTimeout.current = null;
    }

    // Limit to 280 characters
    if (text.length <= 280) {
      setDescription(text);
      setCharCount(text.length);
    }
  };

  const handleDone = () => {
    if (autoDismissTimeout.current) {
      clearTimeout(autoDismissTimeout.current);
    }
    onComplete(description.trim() || undefined);
  };

  const handleSkip = () => {
    if (autoDismissTimeout.current) {
      clearTimeout(autoDismissTimeout.current);
    }
    onSkip();
  };

  // Animated styles
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut
        />

        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.background.primary,
              borderRadius: radius.xl,
              padding: spacing[6],
            },
            animatedContentStyle,
          ]}
        >
          {/* Affirmation */}
          <View style={[styles.affirmationSection, { marginBottom: spacing[5] }]}>
            <Body style={{ fontSize: 40, marginBottom: spacing[3], textAlign: 'center' }}>🎉</Body>
            <Heading
              variant="displayLg"
              style={{
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: spacing[2],
              }}
            >
              Amazing!
            </Heading>
            <Body
              style={{
                color: colors.text.secondary,
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              You're getting closer to{' '}
              <Body weight="bold" style={{ color: colors.accent[500] }}>
                {needleName}
              </Body>
              !
            </Body>
          </View>

          {/* Level Progress */}
          <View style={[styles.levelSection, { marginBottom: spacing[5] }]}>
            <View style={styles.levelHeader}>
              <Body style={{ fontSize: 32 }}>🧵</Body>
              <View style={{ flex: 1, marginLeft: spacing[3] }}>
                <Body
                  weight="semibold"
                  style={{ color: colors.text.primary, marginBottom: spacing[1] }}
                >
                  Level {level}
                </Body>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: colors.background.secondary,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.accent[500],
                        borderRadius: radius.sm,
                      },
                      animatedProgressStyle,
                    ]}
                  />
                </View>
                <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
                  {Math.round(levelProgress)}% to Level {level + 1}
                </Caption>
              </View>
            </View>
          </View>

          {/* Optional Description */}
          <View style={{ marginBottom: spacing[5] }}>
            <Caption
              style={{
                color: colors.text.secondary,
                marginBottom: spacing[2],
              }}
            >
              Add a note (optional)
            </Caption>
            <TextInput
              style={[
                styles.descriptionInput,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.subtle,
                  borderRadius: radius.md,
                  color: colors.text.primary,
                  padding: spacing[3],
                },
              ]}
              placeholder="How did it go?"
              placeholderTextColor={colors.text.muted}
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              maxLength={280}
              textAlignVertical="top"
            />
            <Caption
              style={{
                color: charCount >= 280 ? colors.semantic.error.base : colors.text.muted,
                textAlign: 'right',
                marginTop: spacing[1],
              }}
            >
              {charCount}/280
            </Caption>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button variant="primary" size="lg" onPress={handleDone}>
              Done
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onPress={handleSkip}
              style={{ marginTop: spacing[3] }}
            >
              Skip
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  affirmationSection: {
    alignItems: 'center',
  },
  levelSection: {
    width: '100%',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  descriptionInput: {
    height: 80,
    borderWidth: 1,
  },
  actions: {
    width: '100%',
  },
});
