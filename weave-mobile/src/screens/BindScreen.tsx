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

import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, Modal, Image, Animated, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Card, Heading, Body, Caption, Button } from '@/design-system';
import { useTodayBinds } from '@/hooks/useTodayBinds';
import { useCompleteBind } from '@/hooks/useCompleteBind';
import { useUserStats } from '@/hooks/useUserStats';
import { PomodoroTimer } from '@/components/thread/PomodoroTimer';
import { CompletionCelebration } from '@/components/thread/CompletionCelebration';
import { ProofCaptureSheet } from '@/components/ProofCaptureSheet';
import { ImageLightbox } from '@/components/ImageLightbox';
import { WeaveLogoIcon } from '@/components/WeaveLogoIcon';
import { ProofCaptureContext } from '@/types/captures';
import { getLevelProgress } from '@/utils/levelProgression';
import { launchCamera } from '@/services/imageCapture';
import { supabase } from '@lib/supabase';

export function BindScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { id, fromOnboarding } = useLocalSearchParams<{ id: string; fromOnboarding?: string }>();

  // Onboarding popup state
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(fromOnboarding === 'true');
  const [onboardingPopupDismissed, setOnboardingPopupDismissed] = useState(false);

  // Shimmer animation for back button during onboarding
  const backButtonShimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (onboardingPopupDismissed) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(backButtonShimmer, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(backButtonShimmer, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [onboardingPopupDismissed]);

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
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState(false);
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
    // Open capture sheet (Story 6.2 ProofCaptureSheet component)
    setShowCaptureSheet(true);
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    console.log('Photo removed');
  };

  const handleViewPhoto = () => {
    if (photoUri) {
      setShowPhotoLightbox(true);
    }
  };

  const handleCaptureSuccess = (result: any) => {
    // Set the photo URI from the capture result (use signed_url for preview)
    setPhotoUri(result.data.signed_url);
    setShowCaptureSheet(false);
    console.log('Photo captured successfully:', {
      id: result.data.id,
      signed_url: result.data.signed_url,
    });
  };

  const handleCaptureCancel = () => {
    setShowCaptureSheet(false);
    console.log('Photo capture cancelled');
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
    // If notes were added, save them as a text capture record
    if (notes?.trim() && id) {
      try {
        console.log('[BIND] Saving notes as text capture:', notes);

        // Get user profile ID for captures table
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error('[BIND] No authenticated user found');
          return;
        }

        // Get user profile ID from auth_user_id
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!profileData) {
          console.error('[BIND] User profile not found');
          return;
        }

        // Create text capture record
        const { error } = await supabase.from('captures').insert({
          user_id: profileData.id,
          subtask_instance_id: id,
          type: 'text',
          content_text: notes.trim(),
          local_date: new Date().toISOString().split('T')[0],
          goal_id: bind?.needle_id || null,
        });

        if (error) {
          console.error('[BIND] Failed to save notes capture:', error);
        } else {
          console.log('[BIND] ✅ Notes saved successfully');
        }
      } catch (error) {
        console.error('[BIND] Error saving notes:', error);
        // Don't block user from completing - just log the error
      }
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
        contentContainerStyle={[styles.content, { padding: spacing[4], paddingTop: spacing[5] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <Animated.View
          style={[
            styles.backButton,
            {
              marginBottom: spacing[5],
              borderWidth: onboardingPopupDismissed ? 2 : 0,
              borderColor: onboardingPopupDismissed
                ? backButtonShimmer.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 1)'],
                  })
                : 'transparent',
              borderRadius: 12,
              padding: onboardingPopupDismissed ? 12 : 0,
              shadowColor: onboardingPopupDismissed ? '#FFFFFF' : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: onboardingPopupDismissed ? backButtonShimmer : 0,
              shadowRadius: onboardingPopupDismissed ? 8 : 0,
              elevation: onboardingPopupDismissed ? 8 : 0,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Body style={{ color: colors.text.primary }}>← Back</Body>
          </Pressable>
        </Animated.View>

        {/* Bind Title */}
        <Heading
          variant="displayLg"
          style={{
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[5],
            fontSize: 32,
            fontWeight: '700',
          }}
        >
          {bind.title}
        </Heading>

        {/* Needle Context Card */}
        <Card variant="ai" style={{ marginBottom: spacing[6] }}>
          <View style={styles.aiContext}>
            <MaterialIcons
              name="lightbulb"
              size={28}
              color={colors.violet[200]}
              style={{ marginRight: spacing[2] }}
            />
            <Body style={{ flex: 1, color: colors.violet[200], fontSize: 15, lineHeight: 22 }}>
              Remember, you are doing this to{' '}
              <Body weight="bold" style={{ color: colors.violet[100] }}>
                {bind.needle_title}
              </Body>
              . Lock in.
            </Body>
          </View>
        </Card>

        {/* Accountability Section */}
        <Card variant="default" style={{ marginBottom: spacing[6] }}>
          <Heading
            variant="displayLg"
            style={{
              color: colors.text.primary,
              marginBottom: spacing[2],
              fontSize: 20,
              fontWeight: '600',
            }}
          >
            Accountability
          </Heading>
          <Body style={{ color: colors.text.muted, marginBottom: spacing[4], fontSize: 14 }}>
            {bind.completed
              ? 'You used these accountability options:'
              : 'Set a timer and/or take a picture.'}
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
                        : colors.neutral[600],
                  borderRadius: radius.lg,
                  padding: spacing[4],
                  opacity: bind.completed && !bind.completion_details?.duration_minutes ? 0.5 : 1,
                },
              ]}
              onPress={bind.completed ? undefined : handleTimerSetup}
              disabled={bind.completed}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="schedule"
                  size={40}
                  color={
                    bind.completed && bind.completion_details?.duration_minutes
                      ? colors.semantic.success.dark
                      : timerDuration
                        ? 'black'
                        : colors.text.primary
                  }
                />
              </View>
              {bind.completed && bind.completion_details?.duration_minutes ? (
                <Caption style={{ color: colors.semantic.success.dark, fontSize: 13 }}>
                  {bind.completion_details.duration_minutes} min used
                </Caption>
              ) : timerDuration ? (
                <Caption style={{ color: colors.text.inverse, opacity: 0.8, fontSize: 13 }}>
                  {timerDuration} min selected
                </Caption>
              ) : (
                <Caption
                  style={{
                    color: bind.completed ? colors.text.muted : colors.text.secondary,
                    fontSize: 13,
                  }}
                >
                  {bind.completed ? 'Not used' : ''}
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
                        : colors.neutral[600],
                  borderRadius: radius.lg,
                  padding: spacing[4],
                  opacity: bind.completed && !bind.has_proof ? 0.5 : 1,
                },
              ]}
              onPress={bind.completed ? undefined : photoUri ? handleViewPhoto : handleOpenCamera}
              disabled={bind.completed}
            >
              {photoUri ? (
                // Show photo preview with trash icon
                <View style={styles.photoPreviewContainer}>
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
                  <Pressable
                    style={[
                      styles.trashIcon,
                      {
                        backgroundColor: colors.semantic.error.base,
                        borderRadius: radius.sm,
                      },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="delete" size={16} color="white" />
                  </Pressable>
                </View>
              ) : (
                // Show camera icon
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="camera-alt"
                    size={40}
                    color={
                      bind.completed && bind.has_proof
                        ? colors.semantic.success.dark
                        : photoUri
                          ? 'black'
                          : colors.text.primary
                    }
                  />
                </View>
              )}
              {bind.completed && bind.has_proof ? (
                <Caption style={{ color: colors.semantic.success.dark, fontSize: 13 }}>
                  Photo attached
                </Caption>
              ) : photoUri ? (
                <Caption style={{ color: colors.text.inverse, opacity: 0.8, fontSize: 13 }}>
                  Tap to view
                </Caption>
              ) : (
                <Caption
                  style={{
                    color: bind.completed ? colors.text.muted : colors.text.secondary,
                    fontSize: 13,
                  }}
                >
                  {bind.completed ? 'Not used' : ''}
                </Caption>
              )}
            </Pressable>
          </View>
        </Card>

        {/* Completion Notes or No Notes Card */}
        {bind.completed ? (
          <Card variant="default" style={{ marginBottom: spacing[6] }}>
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
              <Card variant="default" style={{ marginBottom: spacing[6] }}>
                <View style={styles.levelPreview}>
                  <WeaveLogoIcon size={48} color={colors.accent[500]} />
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <Body
                      weight="semibold"
                      style={{
                        color: colors.text.primary,
                        marginBottom: spacing[1],
                        fontSize: 18,
                        fontWeight: '600',
                      }}
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
                    <Caption
                      style={{ color: colors.text.muted, marginTop: spacing[1], fontSize: 13 }}
                    >
                      {progressPercent}% to Level {nextLevel}
                    </Caption>
                  </View>
                </View>
              </Card>
            );
          })()
        )}

        {/* Action Buttons */}
        <View style={[styles.actions, { marginTop: spacing[6] }]}>
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

      {/* Proof Capture Sheet */}
      <Modal
        visible={showCaptureSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCaptureCancel}
      >
        <ProofCaptureSheet
          context={{
            subtask_instance_id: id || null,
            goal_id: bind?.needle_id || null,
            local_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            bind_description: bind?.title,
          }}
          onSuccess={handleCaptureSuccess}
          onCancel={handleCaptureCancel}
          allowSkip={true}
        />
      </Modal>

      {/* Photo Lightbox */}
      {photoUri && (
        <ImageLightbox
          images={[{ id: 'proof-photo', signed_url: photoUri }]}
          initialIndex={0}
          visible={showPhotoLightbox}
          onClose={() => setShowPhotoLightbox(false)}
        />
      )}

      {/* Onboarding Popup */}
      <Modal
        visible={showOnboardingPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowOnboardingPopup(false);
          setOnboardingPopupDismissed(true);
        }}
      >
        <View style={styles.onboardingOverlay}>
          {/* Dark backdrop */}
          <View style={styles.onboardingBackdrop} />

          {/* Top-positioned popup */}
          <View style={styles.onboardingPopup}>
            <View style={[styles.onboardingContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.muted }]}>
              {/* Message */}
              <Heading
                variant="displayMd"
                style={{ color: colors.text.primary, textAlign: 'center', marginBottom: spacing[2] }}
              >
                Stay accountable
              </Heading>

              {/* Description */}
              <Body
                style={{ color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing[5] }}
              >
                Stay accountable through a lock-down timer and/or photo proof
              </Body>

              {/* Got it button */}
              <Button
                variant="primary"
                onPress={() => {
                  setShowOnboardingPopup(false);
                  setOnboardingPopupDismissed(true);
                }}
                fullWidth
              >
                Got it
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginTop: 12,
    marginBottom: 4,
  },
  photoPreviewContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 8,
  },
  photoPreview: {
    width: 60,
    height: 60,
  },
  trashIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
  onboardingOverlay: {
    flex: 1,
  },
  onboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  onboardingPopup: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: SCREEN_HEIGHT * 0.25, // Position at top like other tour popups
  },
  onboardingContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});
