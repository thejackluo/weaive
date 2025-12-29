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
import { View, ScrollView, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, Card, Heading, Body, Caption, Button } from '@/design-system';
import { useTodayBinds } from '@/hooks/useTodayBinds';
import { useCompleteBind } from '@/hooks/useCompleteBind';
import { useUserStats } from '@/hooks/useUserStats';
import { PomodoroTimer } from '@/components/thread/PomodoroTimer';
import { CompletionCelebration } from '@/components/thread/CompletionCelebration';
import { getLevelProgress } from '@/utils/levelProgression';
import { launchCamera } from '@/services/imageCapture';

export function BindScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch bind details (using existing useTodayBinds hook)
  const { data, isLoading: isLoadingBinds, refetch } = useTodayBinds();
  const bind = data?.data.find((b) => b.id === id);

  // Fetch user stats for level display
  const { data: userStatsData, isLoading: isLoadingStats } = useUserStats();

  // Auto-refetch if bind not found (handles newly created binds)
  const [hasAttemptedRefetch, setHasAttemptedRefetch] = React.useState(false);
  React.useEffect(() => {
    if (!isLoadingBinds && !bind && !hasAttemptedRefetch && data) {
      console.log('[BindScreen] Bind not found in cache, refetching...');
      setHasAttemptedRefetch(true);
      refetch();
    }
  }, [bind, isLoadingBinds, hasAttemptedRefetch, data, refetch]);

  // Debug logging
  React.useEffect(() => {
    console.log('[BindScreen] Route params:', { id });
    console.log('[BindScreen] Available binds:', data?.data?.length || 0);
    console.log(
      '[BindScreen] Bind IDs:',
      data?.data?.map((b) => b.id)
    );
    console.log('[BindScreen] Found bind:', bind ? 'YES' : 'NO');
  }, [id, data, bind]);

  // 🐛 FIX: Reset state when switching between binds
  // This ensures photos and timer settings don't carry over to other binds
  React.useEffect(() => {
    console.log('[BindScreen] Bind ID changed, resetting state for:', id);
    setPhotoUri(null);
    setTimerDuration(null);
    setShowTimerPresets(false);
    setIsTimerRunning(false);
    setShowCelebration(false);
    setCompletionData(null);
    setHasAttemptedRefetch(false);
  }, [id]); // Reset whenever the bind ID changes

  // Completion mutation
  const completeMutation = useCompleteBind();

  // Local state for timer and photo - MUST be declared before early return
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showTimerPresets, setShowTimerPresets] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionData, setCompletionData] = useState<{
    needleName: string;
    progressUpdate?: {
      level_before: number;
      level_after: number;
      level_up: boolean;
      xp_gained: number;
      total_xp: number;
      xp_to_next_level: number;
      streak_before: number;
      streak_after: number;
      streak_status: 'active' | 'at_risk' | 'broken';
      streak_milestone_reached: { day: number; message: string } | null;
      grace_period_saved: boolean;
    };
  } | null>(null);

  // Loading state
  if (isLoadingBinds || isLoadingStats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <Body style={{ color: colors.text.secondary }}>Loading bind...</Body>
        </View>
      </SafeAreaView>
    );
  }

  // Bind not found
  if (!bind) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <Body style={{ color: colors.text.secondary }}>Bind not found</Body>
          <Caption style={{ color: colors.text.muted, marginTop: spacing[2] }}>ID: {id}</Caption>
          <Caption style={{ color: colors.text.muted }}>
            Available binds: {data?.data?.length || 0}
          </Caption>
          <Button
            variant="secondary"
            onPress={() => router.back()}
            style={{ marginTop: spacing[4] }}
          >
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
    // Timer is done - automatically complete the bind
    handleComplete();
  };

  const handleOpenCamera = async () => {
    if (photoUri) {
      // Deselect photo if already selected
      setPhotoUri(null);
      console.log('Photo deselected');
    } else {
      try {
        // Launch camera
        console.log('Launching camera...');
        const result = await launchCamera();

        if (result.canceled || !result.assets || result.assets.length === 0) {
          console.log('Camera cancelled or no photo taken');
          return;
        }

        // Store photo URI for preview
        const capturedUri = result.assets[0].uri;
        setPhotoUri(capturedUri);
        console.log('Photo captured:', capturedUri);
      } catch (error) {
        console.error('Camera launch failed:', error);
        Alert.alert(
          'Camera Error',
          error instanceof Error ? error.message : 'Failed to open camera'
        );
      }
    }
  };

  const handleStartBind = () => {
    // Validate that at least one accountability method is selected
    if (!timerDuration && !photoUri) {
      // TODO: Show error alert/toast
      console.warn('Must select at least one accountability method (Timer or Photo)');
      Alert.alert(
        'Accountability Required',
        'Please select Timer or Photo before completing the bind'
      );
      return;
    }

    if (timerDuration && !isTimerRunning) {
      // Start the timer
      setIsTimerRunning(true);
    } else if (photoUri && !timerDuration) {
      // Only photo selected, complete immediately with photo
      handleComplete();
    } else {
      // Timer is running or both selected, complete
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    // Validate accountability selection
    if (!timerDuration && !photoUri) {
      Alert.alert(
        'Accountability Required',
        'Please select Timer or Photo before completing the bind'
      );
      return;
    }

    // If photo option was selected, open camera first
    if (photoUri) {
      // TODO: Open camera to take actual photo
      console.log('Opening camera to capture photo...');
      // For now, simulate photo capture
      // In future: const photoResult = await openCamera();
    }

    // ⚡ OPTIMISTIC: Show celebration modal IMMEDIATELY with optimistic data
    // This gives instant feedback while API call happens in background
    const userStats = userStatsData?.data;
    const optimisticProgress = {
      level_before: userStats?.level || 1,
      level_after: userStats?.level || 1, // Will update from API
      level_up: false, // Will update from API
      xp_gained: 1,
      total_xp: userStats?.total_xp || 0,
      xp_to_next_level: userStats?.xp_to_next_level || 4,
      streak_before: userStats?.current_streak || 0,
      streak_after: userStats?.current_streak || 0,
      streak_status: userStats?.streak_status || ('active' as const),
      streak_milestone_reached: null,
      grace_period_saved: false,
    };

    setCompletionData({
      needleName: bind.needle_title,
      progressUpdate: optimisticProgress,
    });
    setShowCelebration(true);

    // Call completion API in background (non-blocking)
    completeMutation.mutate(
      {
        bindId: id,
        timerDuration: timerDuration ?? undefined,
        photoUsed: photoUri ? true : undefined,
        notes: undefined, // Notes will be saved separately when Done is clicked
      },
      {
        onSuccess: (result) => {
          // Update celebration data with real server response
          setCompletionData({
            needleName: bind.needle_title,
            progressUpdate: result.data.progress_update,
          });
          console.log('[BIND_COMPLETE] ✅ API success - updated celebration with real data');
        },
        onError: (error) => {
          console.error('[BIND_COMPLETE] ❌ API error:', error);
          // Don't show error to user - celebration already showing
          // The optimistic update will remain, and background refetch will eventually sync
        },
      }
    );
  };

  const handleCelebrationComplete = async (notes?: string) => {
    // If notes were added, save them as a capture record
    if (notes?.trim() && id) {
      // TODO: Create capture record with notes via API
      console.log('Notes to save:', notes);
      // For now, just log. Will implement capture API call if needed.
    }

    // Close celebration modal
    setShowCelebration(false);

    // Navigate back to ThreadHomeScreen
    // The bind will show as completed when user navigates back to it later
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[3] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { marginBottom: spacing[3] }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Body style={{ color: colors.text.primary }}>← Back</Body>
        </Pressable>

        {/* Bind Title */}
        <Heading
          variant="displayLg"
          style={{
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[3],
            fontSize: 28,
          }}
        >
          {bind.title}
        </Heading>

        {/* Needle Context Card */}
        <Card variant="ai" style={{ marginBottom: spacing[4] }}>
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

        {/* Accountability Section */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Accountability
          </Heading>
          <Body style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            {bind.completed
              ? 'You used these accountability options:'
              : 'Use timer or capture proof to lock in your progress.'}
          </Body>

          <View style={styles.accountabilityButtons}>
            {/* Timer Button */}
            <Pressable
              style={[
                styles.accountabilityButton,
                {
                  backgroundColor:
                    bind.completed && bind.completion_details?.duration_minutes
                      ? colors.semantic.success.light
                      : timerDuration
                        ? colors.accent[500]
                        : colors.background.secondary,
                  borderColor:
                    bind.completed && bind.completion_details?.duration_minutes
                      ? colors.semantic.success.base
                      : timerDuration
                        ? colors.accent[600]
                        : colors.border.subtle,
                  borderRadius: radius.lg,
                  padding: spacing[4],
                  opacity: bind.completed && !bind.completion_details?.duration_minutes ? 0.5 : 1,
                },
              ]}
              onPress={bind.completed ? undefined : handleTimerSetup}
              disabled={bind.completed}
            >
              <Body style={{ fontSize: 32, marginBottom: spacing[2] }}>⏱️</Body>
              <Body
                weight="semibold"
                style={{
                  color:
                    bind.completed && bind.completion_details?.duration_minutes
                      ? colors.semantic.success.dark
                      : timerDuration
                        ? 'white'
                        : colors.text.primary,
                }}
              >
                Timer
              </Body>
              {bind.completed && bind.completion_details?.duration_minutes ? (
                <Caption style={{ color: colors.semantic.success.dark }}>
                  {bind.completion_details.duration_minutes} min used
                </Caption>
              ) : timerDuration ? (
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {timerDuration} min selected
                </Caption>
              ) : (
                <Caption
                  style={{
                    color: bind.completed ? colors.text.muted : colors.text.secondary,
                  }}
                >
                  {bind.completed ? 'Not used' : 'Set duration'}
                </Caption>
              )}
            </Pressable>

            {/* Camera Button */}
            <Pressable
              style={[
                styles.accountabilityButton,
                {
                  backgroundColor:
                    bind.completed && bind.has_proof
                      ? colors.semantic.success.light
                      : photoUri
                        ? colors.accent[500]
                        : colors.background.secondary,
                  borderColor:
                    bind.completed && bind.has_proof
                      ? colors.semantic.success.base
                      : photoUri
                        ? colors.accent[600]
                        : colors.border.subtle,
                  borderRadius: radius.lg,
                  padding: spacing[4],
                  opacity: bind.completed && !bind.has_proof ? 0.5 : 1,
                },
              ]}
              onPress={bind.completed ? undefined : handleOpenCamera}
              disabled={bind.completed}
            >
              {photoUri ? (
                // Show photo preview
                <Image
                  source={{ uri: photoUri }}
                  style={[
                    styles.photoPreview,
                    {
                      borderRadius: radius.md,
                      marginBottom: spacing[2],
                    },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                // Show camera icon
                <Body style={{ fontSize: 32, marginBottom: spacing[2] }}>📸</Body>
              )}
              <Body
                weight="semibold"
                style={{
                  color:
                    bind.completed && bind.has_proof
                      ? colors.semantic.success.dark
                      : photoUri
                        ? 'white'
                        : colors.text.primary,
                }}
              >
                Photo
              </Body>
              {bind.completed && bind.has_proof ? (
                <Caption style={{ color: colors.semantic.success.dark }}>Photo attached</Caption>
              ) : photoUri ? (
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>Tap to change</Caption>
              ) : (
                <Caption
                  style={{
                    color: bind.completed ? colors.text.muted : colors.text.secondary,
                  }}
                >
                  {bind.completed ? 'Not used' : 'Take photo'}
                </Caption>
              )}
            </Pressable>
          </View>
        </Card>

        {/* Completion Notes or No Notes Card */}
        {bind.completed ? (
          <Card variant="default" style={{ marginBottom: spacing[4] }}>
            <Caption style={{ color: colors.text.secondary, marginBottom: spacing[2] }}>
              {bind.completion_details?.notes ? 'Your Note' : 'Notes'}
            </Caption>
            {bind.completion_details?.notes ? (
              <Body style={{ color: colors.text.primary, lineHeight: 24 }}>
                {bind.completion_details.notes}
              </Body>
            ) : (
              <Body style={{ color: colors.text.muted, fontStyle: 'italic' }}>No notes</Body>
            )}
          </Card>
        ) : (
          // Show level preview if not completed
          (() => {
            // Calculate level progress from user stats
            const userStats = userStatsData?.data;
            const currentLevel = userStats?.level || 1;
            const totalXP = userStats?.total_xp || 0;
            const progressPercent = Math.round(getLevelProgress(totalXP, currentLevel));
            const nextLevel = currentLevel + 1;

            return (
              <Card variant="default" style={{ marginBottom: spacing[4] }}>
                <View style={styles.levelPreview}>
                  <Body style={{ fontSize: 48 }}>🧵</Body>
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
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: colors.accent[500],
                            borderRadius: radius.sm,
                          },
                        ]}
                      />
                    </View>
                    <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
                      {progressPercent}% to Level {nextLevel}
                    </Caption>
                  </View>
                </View>
              </Card>
            );
          })()
        )}

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

      {/* Completion Celebration Modal */}
      <CompletionCelebration
        visible={showCelebration}
        needleName={completionData?.needleName || 'your goal'}
        progressUpdate={completionData?.progressUpdate}
        onComplete={handleCelebrationComplete}
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
    paddingBottom: 16,
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
  accountabilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  accountabilityButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
  },
  photoPreview: {
    width: 60,
    height: 60,
    alignSelf: 'center',
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
    marginBottom: 16,
  },
  completedBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
});
