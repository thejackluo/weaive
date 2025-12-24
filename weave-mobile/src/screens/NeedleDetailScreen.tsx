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
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGoalById, useUpdateGoal, useArchiveGoal } from '@/hooks/useActiveGoals';
import { Ionicons } from '@expo/vector-icons';

export function NeedleDetailScreen() {
  const router = useRouter();
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
      // Client-side validation before saving
      const trimmedTitle = editedTitle.trim();

      if (!trimmedTitle) {
        Alert.alert('Validation Error', 'Goal title cannot be empty.');
        return;
      }

      if (trimmedTitle.length > 200) {
        Alert.alert('Validation Error', 'Goal title must be 200 characters or less.');
        return;
      }

      // Save changes
      updateGoalMutation.mutate(
        {
          goalId: id || '',
          data: {
            title: trimmedTitle,
            description: editedWhy.trim(),
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
              // Navigate back immediately without showing success alert
              // The mutation already invalidates the cache, so the list will update
              router.back();
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
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <RNText style={[styles.headerTitle, { fontSize: 18, fontWeight: '600', color: '#ffffff' }]}>
            Loading...
          </RNText>
        </View>
      </View>
    );
  }

  // Error state
  if (isError || !goal) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <RNText style={[styles.headerTitle, { fontSize: 18, fontWeight: '600', color: '#ffffff' }]}>
            Error
          </RNText>
        </View>
        <View style={styles.errorContainer}>
          <RNText style={{ fontSize: 15, color: '#ef4444' }}>
            {error?.message || 'Goal not found'}
          </RNText>
          <TouchableOpacity onPress={handleBack} style={[styles.backToListButton, { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 }]}>
            <RNText style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>Back to Dashboard</RNText>
          </TouchableOpacity>
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
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>

        {isEditMode ? (
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            style={[
              styles.headerTitleInput,
              { color: '#ffffff', borderColor: '#3b82f6' },
            ]}
            placeholder="Needle title"
            placeholderTextColor="#71717a"
          />
        ) : (
          <Text
            style={[styles.headerTitle, { fontSize: 18, fontWeight: '600', color: '#ffffff' }]}
          >
            {editedTitle}
          </RNText>
        )}

        <Pressable
          onPress={handleEditToggle}
          style={styles.editButton}
          disabled={updateGoalMutation.isPending}
        >
          {updateGoalMutation.isPending ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>
              {isEditMode ? 'Done' : 'Edit'}
            </RNText>
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
            <View style={[styles.colorBar, { backgroundColor: '#3b82f6' }]} />
            <Text
              style={[styles.needleTitle, { fontSize: 28, fontWeight: 'bold', color: '#ffffff' }]}
            >
              {editedTitle}
            </RNText>
          </View>
        )}

        {/* Why Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionLabel, { fontSize: 14, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Why this matters
          </RNText>
          {isEditMode ? (
            <TextInput
              value={editedWhy}
              onChangeText={setEditedWhy}
              multiline
              style={[
                styles.textAreaInput,
                {
                  color: '#ffffff',
                  borderColor: '#27272A',
                  backgroundColor: '#18181b',
                },
              ]}
              placeholder="Your motivation for this goal..."
              placeholderTextColor="#71717a"
            />
          ) : (
            <RNText style={[styles.whyText, { fontSize: 15, color: '#a1a1aa' }]}>
              {editedWhy || 'No description provided'}
            </RNText>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <RNText style={[styles.statLabel, { fontSize: 14, color: '#a1a1aa', textAlign: 'center' }]}>
              7-day consistency
            </RNText>
            <RNText style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>
              {stats.consistency_7d}%
            </RNText>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <RNText style={[styles.statLabel, { fontSize: 14, color: '#a1a1aa', textAlign: 'center' }]}>
              Total completions
            </RNText>
            <RNText style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>
              {stats.total_completions}
            </RNText>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <RNText style={[styles.statLabel, { fontSize: 14, color: '#a1a1aa', textAlign: 'center' }]}>
              Current streak
            </RNText>
            <RNText style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>
              {stats.current_streak}
            </RNText>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
            Milestones
          </RNText>
          {milestones.map((milestone) => (
            <View key={milestone.id} style={[styles.milestoneCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <View style={styles.milestoneHeader}>
                <RNText style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>
                  {milestone.title}
                </RNText>
                <RNText style={{ fontSize: 14, color: '#a1a1aa' }}>
                  {milestone.progress}%
                </RNText>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${milestone.progress}%`,
                      backgroundColor: '#3b82f6',
                    },
                  ]}
                />
              </View>
              <RNText style={[styles.milestoneValues, { fontSize: 14, color: '#a1a1aa' }]}>
                {milestone.current} / {milestone.target}
              </RNText>
            </View>
          ))}
        </View>

        {/* Binds Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
            Your Binds
          </RNText>
          {binds.map((bind) => (
            <View key={bind.id} style={[styles.bindCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <View style={styles.bindContent}>
                <View style={styles.bindInfo}>
                  <RNText style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>
                    {bind.title}
                  </RNText>
                  <RNText style={{ fontSize: 14, color: '#a1a1aa' }}>
                    {bind.frequency}
                  </RNText>
                </View>
                <View style={styles.bindStatus}>
                  {bind.completedToday ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : (
                    <View style={[styles.incompleteDot, { borderColor: '#27272A' }]} />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Archive Button */}
        {!isEditMode && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={handleArchive}
              style={[styles.archiveButton, { borderColor: '#ef4444', borderWidth: 1, padding: 12, borderRadius: 8, backgroundColor: 'transparent' }]}
              disabled={archiveGoalMutation.isPending}
            >
              {archiveGoalMutation.isPending ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <RNText style={{ fontSize: 15, fontWeight: '500', color: '#ef4444', textAlign: 'center' }}>
                  Archive Needle
                </RNText>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Ask AI to Help FAB (Edit Mode Only) */}
      {isEditMode && (
        <Pressable
          onPress={handleAskAI}
          style={[styles.aiFab, { backgroundColor: '#8b5cf6' }]}
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
