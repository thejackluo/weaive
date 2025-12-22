/**
 * NeedleDetailScreen (US-2.2: View Goal Details + US-2.4: Edit Needle)
 *
 * Combined View/Edit screen for a single needle (goal).
 *
 * Wireframe: docs/pages/dashboard-page.md (Combined View/Edit Needle Screen section)
 *
 * View Mode (Default):
 * - Shows: Title, Why, Stats (consistency/completions/streak), Milestones, Binds
 * - Archive button at bottom
 *
 * Edit Mode:
 * - All fields editable
 * - "Ask AI to Help" FAB
 * - Save changes with "Done" button
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useGoalById, useUpdateGoal, useArchiveGoal } from '@/hooks/useActiveGoals';
import { Ionicons } from '@expo/vector-icons';

export function NeedleDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedWhy, setEditedWhy] = useState('');

  const { data, isLoading, isError, error } = useGoalById(id || '');
  const updateGoalMutation = useUpdateGoal();
  const archiveGoalMutation = useArchiveGoal();

  // Extract goal data (mock structure for now - will be replaced with real API response)
  const goal = data?.data || null;

  // Initialize edit fields when data loads
  React.useEffect(() => {
    if (goal) {
      setEditedTitle(goal.title || '');
      setEditedWhy(goal.description || '');
    }
  }, [goal]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEditToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isEditMode) {
      // Save changes
      updateGoalMutation.mutate(
        {
          goalId: id || '',
          data: {
            title: editedTitle,
            description: editedWhy,
          },
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
            Alert.alert('Success', 'Goal updated successfully!');
          },
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update goal. Please try again.');
          },
        }
      );
    } else {
      setIsEditMode(true);
    }
  };

  const handleArchive = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Archive Needle', 'Are you sure? You can reactivate later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          archiveGoalMutation.mutate(id || '', {
            onSuccess: () => {
              Alert.alert('Success', 'Goal archived successfully!', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            },
            onError: (error) => {
              Alert.alert('Error', error.message || 'Failed to archive goal. Please try again.');
            },
          });
        },
      },
    ]);
  };

  const handleAskAI = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open Weave AI modal (will implement with Epic 6)
    // TODO: Navigate to Weave AI chat with needle context
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text variant="textLg" weight="semibold" style={styles.headerTitle}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (isError || !goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text variant="textLg" weight="semibold" style={styles.headerTitle}>
            Error
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text variant="textBase" color="error">
            {error?.message || 'Goal not found'}
          </Text>
          <Button variant="primary" size="sm" onPress={handleBack} style={styles.backToListButton}>
            Back to Dashboard
          </Button>
        </View>
      </View>
    );
  }

  // Mock data (will be replaced with real API data)
  const stats = {
    consistency_7d: goal.consistency_7d || 73,
    total_completions: goal.active_binds_count * 10 || 24, // Mock
    current_streak: 12, // Mock
  };

  const milestones = [
    { id: '1', title: 'Reach 180 lbs', progress: 60, current: 170, target: 180 },
    { id: '2', title: 'Bench 225 lbs', progress: 30, current: 185, target: 225 },
  ];

  const binds = [
    { id: '1', title: 'Workout', frequency: '5x per week', completedToday: true },
    { id: '2', title: 'Meal Prep', frequency: '7x per week', completedToday: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>

        {isEditMode ? (
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            style={[
              styles.headerTitleInput,
              { color: colors.text.primary, borderColor: colors.border.focus },
            ]}
            placeholder="Needle title"
            placeholderTextColor={colors.text.muted}
          />
        ) : (
          <Text
            variant="textLg"
            weight="semibold"
            style={[styles.headerTitle, { color: colors.text.primary }]}
          >
            {editedTitle}
          </Text>
        )}

        <Pressable
          onPress={handleEditToggle}
          style={styles.editButton}
          disabled={updateGoalMutation.isPending}
        >
          {updateGoalMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.accent[500]} />
          ) : (
            <Text variant="textSm" weight="semibold" style={{ color: colors.accent[500] }}>
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Needle Title Section (View Mode) */}
        {!isEditMode && (
          <View style={styles.section}>
            <View style={[styles.colorBar, { backgroundColor: colors.accent[500] }]} />
            <Text
              variant="displayMd"
              weight="bold"
              style={[styles.needleTitle, { color: colors.text.primary }]}
            >
              {editedTitle}
            </Text>
          </View>
        )}

        {/* Why Section */}
        <View style={styles.section}>
          <Text variant="textSm" color="secondary" style={styles.sectionLabel}>
            Why this matters
          </Text>
          {isEditMode ? (
            <TextInput
              value={editedWhy}
              onChangeText={setEditedWhy}
              multiline
              style={[
                styles.textAreaInput,
                {
                  color: colors.text.primary,
                  borderColor: colors.border.muted,
                  backgroundColor: colors.background.secondary,
                },
              ]}
              placeholder="Your motivation for this goal..."
              placeholderTextColor={colors.text.muted}
            />
          ) : (
            <Text variant="textBase" style={[styles.whyText, { color: colors.text.secondary }]}>
              {editedWhy || 'No description provided'}
            </Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="glass" style={styles.statCard}>
            <Text variant="textSm" color="secondary" style={styles.statLabel}>
              7-day consistency
            </Text>
            <Text variant="textLg" weight="bold">
              {stats.consistency_7d}%
            </Text>
          </Card>

          <Card variant="glass" style={styles.statCard}>
            <Text variant="textSm" color="secondary" style={styles.statLabel}>
              Total completions
            </Text>
            <Text variant="textLg" weight="bold">
              {stats.total_completions}
            </Text>
          </Card>

          <Card variant="glass" style={styles.statCard}>
            <Text variant="textSm" color="secondary" style={styles.statLabel}>
              Current streak
            </Text>
            <Text variant="textLg" weight="bold">
              {stats.current_streak}
            </Text>
          </Card>
        </View>

        {/* Milestones Section */}
        <View style={styles.section}>
          <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
            Milestones
          </Text>
          {milestones.map((milestone) => (
            <Card key={milestone.id} variant="glass" style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <Text variant="textBase" weight="medium">
                  {milestone.title}
                </Text>
                <Text variant="textSm" color="secondary">
                  {milestone.progress}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${milestone.progress}%`,
                      backgroundColor: colors.accent[500],
                    },
                  ]}
                />
              </View>
              <Text variant="textSm" color="secondary" style={styles.milestoneValues}>
                {milestone.current} / {milestone.target}
              </Text>
            </Card>
          ))}
        </View>

        {/* Binds Section */}
        <View style={styles.section}>
          <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
            Your Binds
          </Text>
          {binds.map((bind) => (
            <Card key={bind.id} variant="glass" style={styles.bindCard}>
              <View style={styles.bindContent}>
                <View style={styles.bindInfo}>
                  <Text variant="textBase" weight="medium">
                    {bind.title}
                  </Text>
                  <Text variant="textSm" color="secondary">
                    {bind.frequency}
                  </Text>
                </View>
                <View style={styles.bindStatus}>
                  {bind.completedToday ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.emerald[500]} />
                  ) : (
                    <View style={[styles.incompleteDot, { borderColor: colors.border.muted }]} />
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Archive Button */}
        {!isEditMode && (
          <View style={styles.section}>
            <Button
              variant="secondary"
              size="md"
              onPress={handleArchive}
              style={[styles.archiveButton, { borderColor: colors.rose[500] }]}
            >
              <Text variant="textBase" weight="medium" style={{ color: colors.rose[500] }}>
                Archive Needle
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Ask AI to Help FAB (Edit Mode Only) */}
      {isEditMode && (
        <Pressable
          onPress={handleAskAI}
          style={[styles.aiFab, { backgroundColor: colors.violet[500] }]}
        >
          <Ionicons name="sparkles" size={24} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  backToListButton: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  colorBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  needleTitle: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whyText: {
    lineHeight: 22,
  },
  textAreaInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  milestoneCard: {
    padding: 16,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#1F1F23',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneValues: {
    fontSize: 12,
  },
  bindCard: {
    padding: 16,
    marginBottom: 12,
  },
  bindContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bindInfo: {
    flex: 1,
    gap: 4,
  },
  bindStatus: {
    marginLeft: 12,
  },
  incompleteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  archiveButton: {
    marginTop: 8,
  },
  aiFab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
