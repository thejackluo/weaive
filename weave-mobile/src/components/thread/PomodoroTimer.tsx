/**
 * Pomodoro Timer Component (US-3.4: Timer Tracking)
 *
 * Features:
 * - iOS Clock app-style time picker (hours and minutes)
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
import { Picker } from '@react-native-picker/picker';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PomodoroTimerProps {
  visible: boolean;
  isRunning: boolean; // NEW: Controls whether timer is actually running
  selectedDuration: number | null; // NEW: Duration selected by user (in minutes)
  onPresetSelect: (durationMinutes: number) => void; // NEW: Called when user picks a preset
  onComplete: (durationMinutes: number) => void;
  onCancel: () => void;
}

const CIRCLE_RADIUS = 120;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Generate hour and minute options
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes

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
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25); // Default to 25 minutes
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

  // Handle start timer button press
  const handleStartTimer = () => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes > 0) {
      onPresetSelect(totalMinutes);
    }
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

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
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
          // Time Picker Screen (iOS Clock app style)
          <View style={styles.centerContent}>
            <Heading
              variant="displayLg"
              style={{ color: colors.text.primary, marginBottom: spacing[6] }}
            >
              Timer
            </Heading>

            {/* Time Picker Container */}
            <View style={styles.timePickerContainer}>
              <View style={styles.pickerRow}>
                {/* Hours Picker */}
                <View style={styles.pickerColumn}>
                  <Picker
                    selectedValue={hours}
                    onValueChange={(value) => setHours(value)}
                    style={[styles.picker, { color: colors.text.primary }]}
                    itemStyle={styles.pickerItem}
                  >
                    {HOURS.map((hour) => (
                      <Picker.Item
                        key={hour}
                        label={String(hour)}
                        value={hour}
                        color={colors.text.primary}
                      />
                    ))}
                  </Picker>
                  <Caption style={[styles.pickerLabel, { color: colors.text.secondary }]}>
                    hours
                  </Caption>
                </View>

                {/* Minutes Picker */}
                <View style={styles.pickerColumn}>
                  <Picker
                    selectedValue={minutes}
                    onValueChange={(value) => setMinutes(value)}
                    style={[styles.picker, { color: colors.text.primary }]}
                    itemStyle={styles.pickerItem}
                  >
                    {MINUTES.map((minute) => (
                      <Picker.Item
                        key={minute}
                        label={String(minute)}
                        value={minute}
                        color={colors.text.primary}
                      />
                    ))}
                  </Picker>
                  <Caption style={[styles.pickerLabel, { color: colors.text.secondary }]}>
                    min
                  </Caption>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.pickerButtons}>
              <Button
                variant="primary"
                size="lg"
                onPress={handleStartTimer}
                disabled={hours === 0 && minutes === 0}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onPress={onCancel}
                style={{ marginTop: spacing[3] }}
              >
                Cancel
              </Button>
            </View>
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
  timePickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  picker: {
    width: 100,
    height: 180,
  },
  pickerItem: {
    fontSize: 24,
    height: 180,
  },
  pickerLabel: {
    marginTop: -20,
    fontSize: 16,
  },
  pickerButtons: {
    width: '100%',
    maxWidth: 400,
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
