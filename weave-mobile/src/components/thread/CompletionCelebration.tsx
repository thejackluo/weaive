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
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme, Heading, Body, Caption, Button } from '@/design-system';
import { WeaveLogoIcon } from '@/components/WeaveLogoIcon';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { getLevelProgress } from '@/utils/levelProgression';

const { width } = Dimensions.get('window');

interface ProgressUpdate {
  level_before: number;
  level_after: number;
  level_up: boolean;
  xp_gained: number;
  total_xp: number;
  xp_to_next_level: number;
  grace_period_saved: boolean;
}

interface CompletionCelebrationProps {
  visible: boolean;
  needleName: string; // Goal title
  progressUpdate?: ProgressUpdate; // New progress data from API
  level?: number; // DEPRECATED: Use progressUpdate instead
  levelProgress?: number; // DEPRECATED: Use progressUpdate instead
  onComplete: (notes?: string) => void; // Now accepts optional notes parameter
  showNotes?: boolean; // Whether to show the optional notes input (default: true for binds, false for reflections)
}

export function CompletionCelebration({
  visible,
  needleName,
  progressUpdate,
  level,
  levelProgress,
  onComplete,
  showNotes = true, // Default to true for bind completion (backward compatible)
}: CompletionCelebrationProps) {
  const { colors, spacing, radius } = useTheme();
  const confettiRef = useRef<any>(null);

  // Local state for notes input
  const [notes, setNotes] = useState<string>('');

  // Extract progress data (support both new and deprecated props)
  const currentLevel = progressUpdate?.level_after ?? level ?? 1;
  const levelUp = progressUpdate?.level_up ?? false;
  const xpGained = progressUpdate?.xp_gained ?? 1;
  const totalXP = progressUpdate?.total_xp ?? 0;
  const xpToNext = progressUpdate?.xp_to_next_level ?? 4;
  const graceSaved = progressUpdate?.grace_period_saved;

  // Calculate level progress percentage using the correct utility function
  const calculatedProgress = progressUpdate
    ? getLevelProgress(totalXP, currentLevel)
    : (levelProgress ?? 0);

  // Animation values
  const progressWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Trigger confetti and animations when visible
  useEffect(() => {
    if (visible) {
      // Fire confetti
      confettiRef.current?.start();

      // Animate progress bar (faster with minimal delay)
      progressWidth.value = withDelay(50, withSpring(calculatedProgress, { damping: 15 }));

      // Fade in content immediately
      contentOpacity.value = withSpring(1);
    } else {
      // Reset animations and notes
      progressWidth.value = 0;
      contentOpacity.value = 0;
      setNotes(''); // Clear notes when modal closes
    }
  }, [visible, calculatedProgress]);

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
            {/* Confetti */}
            <ConfettiCannon
              ref={confettiRef}
              count={150}
              origin={{ x: width / 2, y: -10 }}
              autoStart={false}
              fadeOut
            />

            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
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
                <View style={[styles.affirmationSection, { marginBottom: spacing[4] }]}>
                  <Body style={{ fontSize: 40, marginBottom: spacing[3], textAlign: 'center' }}>
                    🎉
                  </Body>
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

                {/* Level Up Celebration */}
                {levelUp && (
                  <View
                    style={{
                      backgroundColor: colors.accent[500],
                      padding: spacing[4],
                      borderRadius: radius.md,
                      marginBottom: spacing[4],
                      alignItems: 'center',
                    }}
                  >
                    <Body style={{ fontSize: 32, marginBottom: spacing[2] }}>⬆️</Body>
                    <Heading
                      variant="displayLg"
                      style={{ color: colors.text.inverse, textAlign: 'center' }}
                    >
                      Level Up!
                    </Heading>
                    <Body
                      weight="bold"
                      style={{
                        color: colors.text.inverse,
                        textAlign: 'center',
                        fontSize: 18,
                        marginTop: spacing[1],
                      }}
                    >
                      → Level {currentLevel}
                    </Body>
                  </View>
                )}

                {/* Grace Period Warning */}
                {graceSaved && (
                  <View
                    style={{
                      backgroundColor: '#eab308',
                      padding: spacing[3],
                      borderRadius: radius.md,
                      marginBottom: spacing[4],
                      alignItems: 'center',
                    }}
                  >
                    <Body
                      weight="semibold"
                      style={{ color: colors.text.inverse, textAlign: 'center', fontSize: 14 }}
                    >
                      ⚠️ Grace period used - don't miss tomorrow!
                    </Body>
                  </View>
                )}

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
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <Caption
                      style={{
                        color: colors.text.muted,
                        marginTop: spacing[1],
                        textAlign: 'right',
                      }}
                    >
                      {notes.length}/500
                    </Caption>
                  </View>
                )}

                {/* Level & Streak Progress */}
                <View style={[styles.levelSection, { marginBottom: spacing[5] }]}>
                  {/* Level Progress */}
                  <View style={styles.levelHeader}>
                    <WeaveLogoIcon size={48} color={colors.accent[500]} />
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                      <Body
                        weight="semibold"
                        style={{ color: colors.text.primary, marginBottom: spacing[1] }}
                      >
                        Level {currentLevel}
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
                        {xpToNext} XP to Level {currentLevel + 1}
                      </Caption>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <Button variant="primary" size="lg" onPress={handleComplete}>
                    Done
                  </Button>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
