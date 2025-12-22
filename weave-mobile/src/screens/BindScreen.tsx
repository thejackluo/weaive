/**
 * Bind Screen (US-3.3: Start and Complete Bind with Proof)
 *
 * Flow:
 * 1. Tap Bind from Thread Home → Opens this screen
 * 2. Shows needle context + bind details
 * 3. Accountability options (Timer, Camera)
 * 4. "Start Bind" button → Begin work
 * 5. "Complete" button → Trigger completion flow
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, Card, Heading, Body, Caption, Button } from '@/design-system';
import { useTodayBinds } from '@/hooks/useTodayBinds';
import { useCompleteBind } from '@/hooks/useCompleteBind';
import { PomodoroTimer } from '@/components/thread/PomodoroTimer';

export function BindScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch bind details (using existing useTodayBinds hook)
  const { data } = useTodayBinds();
  const bind = data?.data.find((b) => b.id === id);

  // Completion mutation
  const completeMutation = useCompleteBind();

  // Local state for timer and photo - MUST be declared before early return
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showTimerPresets, setShowTimerPresets] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Get current week completion status (mock for now)
  const weekDays = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  const weekCompletions = [true, true, false, false, false, false, false]; // TODO: Get from API

  if (!bind) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <Body style={{ color: colors.text.secondary }}>Bind not found</Body>
          <Button variant="secondary" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleTimerSetup = () => {
    if (timerDuration) {
      // Deselect timer if already selected
      setTimerDuration(null);
      console.log('Timer deselected');
    } else {
      // Open preset selector
      setShowTimerPresets(true);
    }
  };

  const handleTimerPresetSelect = (duration: number) => {
    setTimerDuration(duration);
    setShowTimerPresets(false);
    console.log('Timer duration selected:', duration, 'minutes');
  };

  const handleTimerCancel = () => {
    setShowTimerPresets(false);
    setIsTimerRunning(false);
  };

  const handleTimerComplete = (duration: number) => {
    setIsTimerRunning(false);
    console.log('Timer completed:', duration, 'minutes');
    // Don't automatically complete - let user click "Complete Bind" button
    // The timer duration is already tracked in state
  };

  const handleOpenCamera = async () => {
    if (photoUri) {
      // Deselect photo if already selected
      setPhotoUri(null);
      console.log('Photo deselected');
    } else {
      // Select photo option
      console.log('Photo option selected');
      // For now, just mark that photo will be taken
      // TODO: Request camera permissions and open camera on completion
      setPhotoUri('mock-photo-uri');
    }
  };

  const handleStartBind = () => {
    if (timerDuration && !isTimerRunning) {
      // Start the timer
      setIsTimerRunning(true);
    } else if (photoUri && !timerDuration) {
      // Only photo selected, complete immediately with photo
      handleComplete();
    } else {
      // No timer or photo selected, just complete
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    // If photo option was selected, open camera first
    if (photoUri) {
      // TODO: Open camera to take actual photo
      console.log('Opening camera to capture photo...');
      // For now, simulate photo capture
      // In future: const photoResult = await openCamera();
    }

    try {
      await completeMutation.mutateAsync({
        bindId: id,
        timerDuration: timerDuration ?? undefined,
      });

      // TODO: Show confetti animation and level progress
      // For now, just navigate back with success message
      console.log('Bind completed successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to complete bind:', error);
      // TODO: Show error toast/alert
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { marginBottom: spacing[4] }]}
        >
          <Body style={{ color: colors.text.primary }}>← Back</Body>
        </Pressable>

        {/* Needle Context Card */}
        <Card variant="ai" style={{ marginBottom: spacing[5] }}>
          <View style={styles.aiContext}>
            <Body style={{ fontSize: 24, marginRight: spacing[2] }}>🧶</Body>
            <Body style={{ flex: 1, color: colors.violet[200] }}>
              Remember, you are doing this to{' '}
              <Body weight="bold" style={{ color: colors.violet[100] }}>
                {bind.needle_title}
              </Body>
              . Lock in.
            </Body>
          </View>
        </Card>

        {/* Bind Title */}
        <Heading
          variant="displayLg"
          style={{
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[2],
          }}
        >
          {bind.title}
        </Heading>

        {/* Subtitle */}
        <Body
          style={{
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing[5],
          }}
        >
          {bind.subtitle}
        </Body>

        {/* Week Completion Calendar */}
        <Card variant="default" style={{ marginBottom: spacing[5] }}>
          <Caption
            style={{ color: colors.text.secondary, marginBottom: spacing[3], textAlign: 'center' }}
          >
            This Week
          </Caption>
          <View style={styles.weekCalendar}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDay}>
                <Caption style={{ color: colors.text.muted, marginBottom: spacing[1] }}>
                  {day}
                </Caption>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: weekCompletions[index]
                        ? colors.semantic.success.base
                        : colors.background.secondary,
                      borderColor: colors.border.subtle,
                    },
                  ]}
                >
                  {weekCompletions[index] && (
                    <Body style={{ color: 'white', fontSize: 12 }}>✓</Body>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Accountability Section */}
        <Card variant="default" style={{ marginBottom: spacing[5] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Accountability
          </Heading>
          <Body style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Use timer or capture proof to lock in your progress.
          </Body>

          <View style={styles.accountabilityButtons}>
            {/* Timer Button */}
            <Pressable
              style={[
                styles.accountabilityButton,
                {
                  backgroundColor: timerDuration ? colors.accent[500] : colors.background.secondary,
                  borderColor: timerDuration ? colors.accent[600] : colors.border.subtle,
                  borderRadius: radius.lg,
                  padding: spacing[4],
                },
              ]}
              onPress={handleTimerSetup}
            >
              <Body style={{ fontSize: 32, marginBottom: spacing[2] }}>⏱️</Body>
              <Body
                weight="semibold"
                style={{ color: timerDuration ? 'white' : colors.text.primary }}
              >
                Timer
              </Body>
              {timerDuration ? (
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {timerDuration} min selected
                </Caption>
              ) : (
                <Caption style={{ color: colors.text.secondary }}>Set duration</Caption>
              )}
            </Pressable>

            {/* Camera Button */}
            <Pressable
              style={[
                styles.accountabilityButton,
                {
                  backgroundColor: photoUri ? colors.accent[500] : colors.background.secondary,
                  borderColor: photoUri ? colors.accent[600] : colors.border.subtle,
                  borderRadius: radius.lg,
                  padding: spacing[4],
                },
              ]}
              onPress={handleOpenCamera}
            >
              <Body style={{ fontSize: 32, marginBottom: spacing[2] }}>📸</Body>
              <Body weight="semibold" style={{ color: photoUri ? 'white' : colors.text.primary }}>
                Photo
              </Body>
              {photoUri ? (
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>Will attach photo</Caption>
              ) : (
                <Caption style={{ color: colors.text.secondary }}>Take photo</Caption>
              )}
            </Pressable>
          </View>
        </Card>

        {/* Weave Level Preview */}
        <Card variant="default" style={{ marginBottom: spacing[5] }}>
          <View style={styles.levelPreview}>
            <Body style={{ fontSize: 48 }}>🧵</Body>
            <View style={{ flex: 1, marginLeft: spacing[3] }}>
              <Body
                weight="semibold"
                style={{ color: colors.text.primary, marginBottom: spacing[1] }}
              >
                Level 2
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
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: '35%',
                      backgroundColor: colors.accent[500],
                      borderRadius: radius.sm,
                    },
                  ]}
                />
              </View>
              <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
                35% to Level 3
              </Caption>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!bind.completed ? (
            <>
              {isTimerRunning ? (
                // Timer is running - show Complete Bind button
                <Button variant="primary" size="lg" onPress={handleComplete}>
                  Complete Bind
                </Button>
              ) : timerDuration && !photoUri ? (
                // Only timer selected - show Start Bind
                <Button variant="primary" size="lg" onPress={handleStartBind}>
                  Start Bind
                </Button>
              ) : photoUri && !timerDuration ? (
                // Only photo selected - show Complete Bind
                <Button variant="primary" size="lg" onPress={handleStartBind}>
                  Complete Bind
                </Button>
              ) : timerDuration && photoUri ? (
                // Both selected - show Start Bind (will start timer)
                <Button variant="primary" size="lg" onPress={handleStartBind}>
                  Start Bind
                </Button>
              ) : (
                // Neither selected - show Complete Bind (can complete without proof)
                <Button variant="primary" size="lg" onPress={handleStartBind}>
                  Complete Bind
                </Button>
              )}
            </>
          ) : (
            <View
              style={[styles.completedBadge, { backgroundColor: colors.semantic.success.light }]}
            >
              <Body weight="bold" style={{ color: colors.semantic.success.dark }}>
                ✓ Completed
              </Body>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Timer Preset Selector Modal */}
      <PomodoroTimer
        visible={showTimerPresets || isTimerRunning}
        isRunning={isTimerRunning}
        selectedDuration={timerDuration}
        onPresetSelect={handleTimerPresetSelect}
        onComplete={handleTimerComplete}
        onCancel={handleTimerCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  aiContext: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountabilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  accountabilityButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
  },
  levelPreview: {
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
  actions: {
    marginBottom: 32,
  },
  completedBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
