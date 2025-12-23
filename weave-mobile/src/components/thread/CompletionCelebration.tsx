/**
 * CompletionCelebration Component (Phase 2d)
 *
 * Shows after bind completion with:
 * - Confetti animation
 * - Affirmation: "You're getting closer to [Needle Name]!"
 * - Optional notes input (for post-completion reflection)
 * - Level progress bar (animated increase)
 * - Done button
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, StyleSheet, Dimensions, TextInput } from 'react-native';
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
  level?: number;
  levelProgress?: number; // Percentage to next level (0-100)
  onComplete: (notes?: string) => void; // Now accepts optional notes parameter
  showNotes?: boolean; // Whether to show the optional notes input (default: true for binds, false for reflections)
}

export function CompletionCelebration({
  visible,
  needleName,
  level,
  levelProgress,
  onComplete,
  showNotes = true, // Default to true for bind completion (backward compatible)
}: CompletionCelebrationProps) {
  const { colors, spacing, radius } = useTheme();
  const confettiRef = useRef<any>(null);

  // Local state for notes input
  const [notes, setNotes] = useState<string>('');

  // Animation values
  const progressWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Trigger confetti and animations when visible
  useEffect(() => {
    if (visible) {
      // Fire confetti
      confettiRef.current?.start();

      // Animate progress bar (if levelProgress is provided)
      if (levelProgress !== undefined) {
        progressWidth.value = withDelay(300, withSpring(levelProgress, { damping: 15 }));
      }

      // Fade in content
      contentOpacity.value = withDelay(100, withSpring(1));
    } else {
      // Reset animations and notes
      progressWidth.value = 0;
      contentOpacity.value = 0;
      setNotes(''); // Clear notes when modal closes
    }
  }, [visible, levelProgress]);

  const handleComplete = () => {
    onComplete(notes.trim() || undefined);
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

          {/* Optional Notes Input (only show for bind completion) */}
          {showNotes && (
            <View style={{ marginBottom: spacing[4] }}>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.subtle,
                    borderRadius: radius.md,
                    padding: spacing[3],
                    color: colors.text.primary,
                    fontSize: 16,
                    minHeight: 80,
                  },
                ]}
                placeholder="Add optional note"
                placeholderTextColor={colors.text.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
              <Caption
                style={{ color: colors.text.muted, marginTop: spacing[1], textAlign: 'right' }}
              >
                {notes.length}/500
              </Caption>
            </View>
          )}

          {/* Level Progress (only show if level data provided) */}
          {level !== undefined && levelProgress !== undefined && (
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
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button variant="primary" size="lg" onPress={handleComplete}>
              Done
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
  notesInput: {
    borderWidth: 1,
    textAlign: 'left',
  },
  actions: {
    width: '100%',
  },
});
