/**
 * Pomodoro Timer Component (US-3.4: Timer Tracking)
 *
 * Features:
 * - Duration presets: 15, 25, 45, 60 minutes
 * - Focus mode UI (minimal distractions)
 * - Circle progress visualization
 * - Pause/extend functionality
 * - Haptic + sound feedback on completion
 * - Returns duration on completion
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import { useTheme, Heading, Body, Caption, Button } from '@/design-system';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PomodoroTimerProps {
  visible: boolean;
  isRunning: boolean; // NEW: Controls whether timer is actually running
  selectedDuration: number | null; // NEW: Duration selected by user (in minutes)
  onPresetSelect: (durationMinutes: number) => void; // NEW: Called when user picks a preset
  onComplete: (durationMinutes: number) => void;
  onCancel: () => void;
}

const PRESET_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

const CIRCLE_RADIUS = 120;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function PomodoroTimer({
  visible,
  isRunning: isRunningProp,
  selectedDuration: selectedDurationProp,
  onPresetSelect,
  onComplete,
  onCancel,
}: PomodoroTimerProps) {
  const { colors, spacing } = useTheme();

  // State
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEarlyCompleteConfirm, setShowEarlyCompleteConfirm] = useState(false);

  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalSecondsRef = useRef<number>(0);

  // Animated progress
  const progress = useSharedValue(1);

  // Animated circle props
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value),
  }));

  // Start timer (called when isRunningProp becomes true)
  const startTimer = (minutes: number) => {
    const totalSeconds = minutes * 60;
    setSecondsRemaining(totalSeconds);
    startTimeRef.current = Date.now();
    totalSecondsRef.current = totalSeconds;
    progress.value = withTiming(0, { duration: totalSeconds * 1000 });
  };

  // Handle preset selection (does NOT start timer)
  const handlePresetSelect = (minutes: number) => {
    onPresetSelect(minutes);
    // Don't start timer here - wait for parent to set isRunning to true
  };

  // Effect: Start timer when isRunningProp becomes true
  useEffect(() => {
    if (isRunningProp && selectedDurationProp) {
      startTimer(selectedDurationProp);
    }
  }, [isRunningProp, selectedDurationProp]);

  // Complete bind early (before timer finishes)
  const handleCompleteBind = () => {
    const isEarlyCompletion = secondsRemaining > 0;
    if (isEarlyCompletion) {
      // Show warning if completing before timer ends
      setShowEarlyCompleteConfirm(true);
    } else {
      // Timer finished naturally, complete immediately
      confirmCompleteBind();
    }
  };

  const confirmCompleteBind = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowEarlyCompleteConfirm(false);

    // Call completion callback with duration
    if (selectedDurationProp) {
      onComplete(selectedDurationProp);
    }
  };

  const cancelCompleteBind = () => {
    setShowEarlyCompleteConfirm(false);
  };

  // Cancel timer - show confirmation
  const handleCancelTimer = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowCancelConfirm(false);
    setSecondsRemaining(0);
    progress.value = 1;
    onCancel();
  };

  const cancelCancelAction = () => {
    setShowCancelConfirm(false);
  };

  // Timer tick effect
  useEffect(() => {
    if (isRunningProp) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Timer complete
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            // TODO: Trigger haptic feedback and sound
            // import * as Haptics from 'expo-haptics';
            // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Call completion callback with duration
            if (selectedDurationProp) {
              onComplete(selectedDurationProp);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunningProp, selectedDurationProp, onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage =
    totalSecondsRef.current > 0
      ? ((totalSecondsRef.current - secondsRemaining) / totalSecondsRef.current) * 100
      : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {!isRunningProp ? (
          // Preset Selection Screen
          <View style={styles.centerContent}>
            <Heading
              variant="displayLg"
              style={{ color: colors.text.primary, marginBottom: spacing[6] }}
            >
              How long will you focus?
            </Heading>

            <View style={styles.presetGrid}>
              {PRESET_DURATIONS.map((preset) => (
                <Pressable
                  key={preset.minutes}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor:
                        selectedDurationProp === preset.minutes
                          ? colors.accent[500]
                          : colors.background.secondary,
                      borderColor:
                        selectedDurationProp === preset.minutes
                          ? colors.accent[600]
                          : colors.border.subtle,
                      borderRadius: 16,
                      padding: spacing[5],
                    },
                  ]}
                  onPress={() => handlePresetSelect(preset.minutes)}
                >
                  <Heading
                    variant="displayLg"
                    style={{
                      color:
                        selectedDurationProp === preset.minutes ? 'white' : colors.text.primary,
                    }}
                  >
                    {preset.label}
                  </Heading>
                </Pressable>
              ))}
            </View>

            <Button
              variant="secondary"
              size="lg"
              onPress={onCancel}
              style={{ marginTop: spacing[6] }}
            >
              Cancel
            </Button>
          </View>
        ) : (
          // Timer Running Screen
          <View style={styles.timerContent}>
            {/* Circle Progress */}
            <View style={styles.circleContainer}>
              <Svg width={CIRCLE_RADIUS * 2 + 40} height={CIRCLE_RADIUS * 2 + 40}>
                {/* Background circle */}
                <Circle
                  cx={CIRCLE_RADIUS + 20}
                  cy={CIRCLE_RADIUS + 20}
                  r={CIRCLE_RADIUS}
                  stroke={colors.border.subtle}
                  strokeWidth={8}
                  fill="none"
                />
                {/* Progress circle */}
                <AnimatedCircle
                  cx={CIRCLE_RADIUS + 20}
                  cy={CIRCLE_RADIUS + 20}
                  r={CIRCLE_RADIUS}
                  stroke={colors.accent[500]}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  animatedProps={animatedProps}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${CIRCLE_RADIUS + 20}, ${CIRCLE_RADIUS + 20}`}
                />
              </Svg>

              {/* Time Display */}
              <View style={styles.timeDisplay}>
                <Heading variant="displayLg" style={{ color: colors.text.primary, fontSize: 48 }}>
                  {formatTime(secondsRemaining)}
                </Heading>
                <Caption style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
                  {Math.round(progressPercentage)}% complete
                </Caption>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Button variant="primary" size="lg" onPress={handleCompleteBind}>
                Complete Bind
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onPress={handleCancelTimer}
                style={{ marginTop: spacing[3] }}
              >
                Cancel
              </Button>
            </View>

            {/* Early Complete Confirmation Modal */}
            {showEarlyCompleteConfirm && (
              <View style={[styles.confirmOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <View
                  style={[
                    styles.confirmCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderRadius: 16,
                      padding: spacing[5],
                    },
                  ]}
                >
                  <Heading
                    variant="displayLg"
                    style={{ color: colors.text.primary, marginBottom: spacing[3] }}
                  >
                    Complete early?
                  </Heading>
                  <Body
                    style={{
                      color: colors.text.secondary,
                      marginBottom: spacing[5],
                      textAlign: 'center',
                    }}
                  >
                    You haven't completed the full timer yet. You can still mark this bind as
                    complete.
                  </Body>
                  <Button variant="primary" size="lg" onPress={confirmCompleteBind}>
                    Yes, Complete Bind
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onPress={cancelCompleteBind}
                    style={{ marginTop: spacing[3] }}
                  >
                    Keep Going
                  </Button>
                </View>
              </View>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
              <View style={[styles.confirmOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <View
                  style={[
                    styles.confirmCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderRadius: 16,
                      padding: spacing[5],
                    },
                  ]}
                >
                  <Heading
                    variant="displayLg"
                    style={{ color: colors.text.primary, marginBottom: spacing[3] }}
                  >
                    Cancel timer?
                  </Heading>
                  <Body
                    style={{
                      color: colors.text.secondary,
                      marginBottom: spacing[5],
                      textAlign: 'center',
                    }}
                  >
                    Your progress will be lost and the bind won't be completed.
                  </Body>
                  <Button variant="primary" size="lg" onPress={confirmCancel}>
                    Yes, Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onPress={cancelCancelAction}
                    style={{ marginTop: spacing[3] }}
                  >
                    Keep Timer Running
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  presetButton: {
    width: 140,
    height: 120,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    position: 'absolute',
    alignItems: 'center',
  },
  controls: {
    width: '100%',
    maxWidth: 400,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: '80%',
    maxWidth: 400,
  },
});
