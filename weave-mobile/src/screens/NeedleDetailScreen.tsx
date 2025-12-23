/**
 * NeedleDetailScreen (US-2.2: View Goal Details + US-2.4: Edit Needle)
 *
 * RESTRUCTURED LAYOUT (top to bottom):
 * 1. Needle name (editable on tap, auto-save)
 * 2. Motivation text box ("Why this matters" - editable on tap, auto-save)
 * 3. Plan of Binds (tap bind to navigate to detail)
 * 4. Memories section (image gallery, max 10 images)
 * 5. Archive Needle button (bottom)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useGoalById, useUpdateGoal, useArchiveGoal } from '@/hooks/useActiveGoals';
import { useGoalMemories, useUploadMemory, useDeleteMemory } from '@/hooks/useGoalMemories';
import { useUpdateBind } from '@/hooks/useUpdateBind';
import { Ionicons } from '@expo/vector-icons';
import type { Memory } from '@/types/goals';

export function NeedleDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // State for editable fields
  const [titleValue, setTitleValue] = useState('');
  const [motivationValue, setMotivationValue] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isMotivationEditing, setIsMotivationEditing] = useState(false);

  // State for editing binds
  const [editingBindId, setEditingBindId] = useState<string | null>(null);
  const [editingBindTitle, setEditingBindTitle] = useState('');
  const [editingBindFrequency, setEditingBindFrequency] = useState('daily');

  // Refs for tracking original values (for auto-save comparison)
  const originalTitleRef = useRef('');
  const originalMotivationRef = useRef('');

  // Queries and mutations
  const { data, isLoading, isError, error } = useGoalById(id || '');
  const { data: memoriesData, isLoading: isLoadingMemories } = useGoalMemories(id || '');
  const updateGoalMutation = useUpdateGoal();
  const archiveGoalMutation = useArchiveGoal();
  const uploadMemoryMutation = useUploadMemory();
  const deleteMemoryMutation = useDeleteMemory();
  const updateBindMutation = useUpdateBind();

  const goal = data?.data || null;
  const memories = memoriesData?.data || [];
  const memoriesCount = memories.length;
  const maxMemories = 10;

  // Initialize editable fields when data loads
  React.useEffect(() => {
    if (goal) {
      setTitleValue(goal.title || '');
      setMotivationValue(goal.description || '');
      originalTitleRef.current = goal.title || '';
      originalMotivationRef.current = goal.description || '';
    }
  }, [goal]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Auto-save title on blur
  const handleTitleBlur = () => {
    setIsTitleEditing(false);

    const trimmedTitle = titleValue.trim();

    // Validation
    if (!trimmedTitle) {
      Alert.alert('Validation Error', 'Goal title cannot be empty.');
      setTitleValue(originalTitleRef.current); // Revert to original
      return;
    }

    if (trimmedTitle.length > 200) {
      Alert.alert('Validation Error', 'Goal title must be 200 characters or less.');
      setTitleValue(originalTitleRef.current); // Revert to original
      return;
    }

    // Only save if changed
    if (trimmedTitle !== originalTitleRef.current) {
      updateGoalMutation.mutate(
        {
          goalId: id || '',
          data: { title: trimmedTitle },
        },
        {
          onSuccess: () => {
            originalTitleRef.current = trimmedTitle;
          },
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update title.');
            setTitleValue(originalTitleRef.current); // Revert on error
          },
        }
      );
    }
  };

  // Auto-save motivation on blur
  const handleMotivationBlur = () => {
    setIsMotivationEditing(false);

    const trimmedMotivation = motivationValue.trim();

    // Only save if changed
    if (trimmedMotivation !== originalMotivationRef.current) {
      updateGoalMutation.mutate(
        {
          goalId: id || '',
          data: { description: trimmedMotivation },
        },
        {
          onSuccess: () => {
            originalMotivationRef.current = trimmedMotivation;
          },
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update motivation.');
            setMotivationValue(originalMotivationRef.current); // Revert on error
          },
        }
      );
    }
  };

  // Helper: Convert recurrence_rule to human-readable frequency
  const parseFrequency = (recurrenceRule: string | null | undefined): string => {
    if (!recurrenceRule) return 'daily';
    if (recurrenceRule.includes('DAILY')) return 'daily';
    if (recurrenceRule.includes('WEEKLY')) return 'weekly';
    return 'daily';
  };

  // Helper: Convert human-readable frequency to recurrence_rule
  const toRecurrenceRule = (frequency: string): string => {
    if (frequency === 'daily') return 'FREQ=DAILY;INTERVAL=1';
    if (frequency === 'weekly') return 'FREQ=WEEKLY;INTERVAL=1';
    return 'FREQ=DAILY;INTERVAL=1';
  };

  // Start editing a bind
  const handleBindPress = (bind: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBindId(bind.id);
    setEditingBindTitle(bind.title || '');
    setEditingBindFrequency(parseFrequency(bind.recurrence_rule));
  };

  // Save bind changes
  const handleSaveBind = () => {
    if (!editingBindId) return;

    const trimmedTitle = editingBindTitle.trim();
    if (!trimmedTitle) {
      Alert.alert('Validation Error', 'Bind title cannot be empty.');
      return;
    }

    updateBindMutation.mutate(
      {
        bindId: editingBindId,
        title: trimmedTitle,
        recurrenceRule: toRecurrenceRule(editingBindFrequency),
      },
      {
        onSuccess: () => {
          setEditingBindId(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update bind.');
        },
      }
    );
  };

  // Cancel bind editing
  const handleCancelBindEdit = () => {
    setEditingBindId(null);
    setEditingBindTitle('');
    setEditingBindFrequency('daily');
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
              router.back();
            },
            onError: (error) => {
              Alert.alert('Error', error.message || 'Failed to archive goal.');
            },
          });
        },
      },
    ]);
  };

  const handleAddMemory = async () => {
    if (memoriesCount >= maxMemories) {
      Alert.alert(
        'Memory Limit Reached',
        `You can only add up to ${maxMemories} memories per goal.`
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const { uri } = result.assets[0];
      const fileName = `memory-${Date.now()}.jpg`;

      uploadMemoryMutation.mutate(
        {
          goalId: id || '',
          imageUri: uri,
          fileName,
        },
        {
          onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          onError: (error) => {
            Alert.alert('Upload Failed', error.message || 'Failed to upload memory.');
          },
        }
      );
    }
  };

  const handleDeleteMemory = (memory: Memory) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Memory', 'Are you sure you want to delete this memory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMemoryMutation.mutate(
            { goalId: id || '', memoryId: memory.id },
            {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
              onError: (error) => {
                Alert.alert('Error', error.message || 'Failed to delete memory.');
              },
            }
          );
        },
      },
    ]);
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

  const binds = goal.binds || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Needle Name (editable on tap) */}
        <View style={styles.section}>
          <Pressable onPress={() => setIsTitleEditing(true)} disabled={isTitleEditing}>
            {isTitleEditing ? (
              <TextInput
                value={titleValue}
                onChangeText={setTitleValue}
                onBlur={handleTitleBlur}
                autoFocus
                multiline
                style={[
                  styles.titleInput,
                  {
                    color: colors.text.primary,
                    borderColor: colors.border.focus,
                  },
                ]}
                placeholder="Needle title"
                placeholderTextColor={colors.text.muted}
                maxLength={200}
              />
            ) : (
              <>
                <Text
                  variant="displayLg"
                  weight="bold"
                  style={[styles.title, { color: colors.text.primary }]}
                >
                  {titleValue}
                </Text>
                <Text variant="textSm" color="muted" style={styles.tapToEditHint}>
                  Tap to edit
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* 2. Motivation Box ("Why this matters") */}
        <View style={styles.section}>
          <Text variant="textSm" color="secondary" style={styles.sectionLabel}>
            Why this matters
          </Text>
          <Pressable onPress={() => setIsMotivationEditing(true)} disabled={isMotivationEditing}>
            {isMotivationEditing ? (
              <TextInput
                value={motivationValue}
                onChangeText={setMotivationValue}
                onBlur={handleMotivationBlur}
                autoFocus
                multiline
                style={[
                  styles.motivationInput,
                  {
                    color: colors.text.primary,
                    borderColor: colors.border.focus,
                    backgroundColor: colors.background.secondary,
                  },
                ]}
                placeholder="Your motivation for this goal..."
                placeholderTextColor={colors.text.muted}
              />
            ) : (
              <View
                style={[
                  styles.motivationBox,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.muted,
                  },
                ]}
              >
                <Text variant="textBase" style={{ color: colors.text.secondary }}>
                  {motivationValue || 'Tap to add your motivation...'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* 3. Milestones (Q-Goals) */}
        {goal.qgoals && goal.qgoals.length > 0 && (
          <View style={styles.section}>
            <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
              Milestones
            </Text>
            {goal.qgoals.map((qgoal: any) => (
              <Card key={qgoal.id} variant="glass" style={styles.milestoneCard}>
                <View style={styles.milestoneContent}>
                  <Text variant="textBase" weight="medium">
                    {qgoal.title}
                  </Text>
                  <View style={styles.milestoneProgress}>
                    <Text variant="textLg" weight="semibold" style={{ color: colors.accent[500] }}>
                      {qgoal.current_value || 0}
                    </Text>
                    <Text variant="textSm" color="secondary" style={{ marginHorizontal: 8 }}>
                      /
                    </Text>
                    <Text variant="textLg" color="secondary">
                      {qgoal.target_value} {qgoal.unit}
                    </Text>
                  </View>
                  {qgoal.metric_name && (
                    <Text variant="textSm" color="muted" style={{ marginTop: 4 }}>
                      {qgoal.metric_name}
                    </Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* 4. Plan of Binds */}
        <View style={styles.section}>
          <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
            Your Binds
          </Text>
          {binds.length === 0 ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Text variant="textBase" color="secondary" style={styles.emptyText}>
                No binds yet. Add consistent actions to work toward this goal.
              </Text>
            </Card>
          ) : (
            binds.map((bind) => {
              const isEditing = editingBindId === bind.id;
              return (
                <Card key={bind.id} variant="glass" style={styles.bindCard}>
                  {isEditing ? (
                    // Edit mode
                    <View style={styles.bindEditContainer}>
                      <View style={styles.bindEditField}>
                        <Text variant="textSm" color="secondary" style={styles.bindEditLabel}>
                          Name
                        </Text>
                        <TextInput
                          value={editingBindTitle}
                          onChangeText={setEditingBindTitle}
                          style={[
                            styles.bindEditInput,
                            {
                              color: colors.text.primary,
                              backgroundColor: colors.background.primary,
                              borderColor: colors.border.muted,
                            },
                          ]}
                          placeholder="Bind name"
                          placeholderTextColor={colors.text.muted}
                          maxLength={200}
                        />
                      </View>

                      <View style={styles.bindEditField}>
                        <Text variant="textSm" color="secondary" style={styles.bindEditLabel}>
                          Frequency
                        </Text>
                        <View style={styles.frequencyButtons}>
                          <Pressable
                            style={[
                              styles.frequencyButton,
                              {
                                backgroundColor:
                                  editingBindFrequency === 'daily'
                                    ? colors.accent[500]
                                    : colors.background.secondary,
                                borderColor: colors.border.muted,
                              },
                            ]}
                            onPress={() => setEditingBindFrequency('daily')}
                          >
                            <Text
                              variant="textSm"
                              weight="medium"
                              style={{
                                color:
                                  editingBindFrequency === 'daily'
                                    ? colors.background.primary
                                    : colors.text.secondary,
                              }}
                            >
                              Daily
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.frequencyButton,
                              {
                                backgroundColor:
                                  editingBindFrequency === 'weekly'
                                    ? colors.accent[500]
                                    : colors.background.secondary,
                                borderColor: colors.border.muted,
                              },
                            ]}
                            onPress={() => setEditingBindFrequency('weekly')}
                          >
                            <Text
                              variant="textSm"
                              weight="medium"
                              style={{
                                color:
                                  editingBindFrequency === 'weekly'
                                    ? colors.background.primary
                                    : colors.text.secondary,
                              }}
                            >
                              Weekly
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.bindEditActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={handleCancelBindEdit}
                          style={styles.bindEditButton}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={handleSaveBind}
                          disabled={updateBindMutation.isPending}
                          style={styles.bindEditButton}
                        >
                          {updateBindMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </View>
                    </View>
                  ) : (
                    // View mode
                    <Pressable onPress={() => handleBindPress(bind)}>
                      <View style={styles.bindContent}>
                        <View style={styles.bindInfo}>
                          <Text variant="textBase" weight="medium">
                            {bind.title}
                          </Text>
                          <Text variant="textSm" color="muted" style={styles.bindFrequency}>
                            {parseFrequency(bind.recurrence_rule) === 'daily' ? 'Daily' : 'Weekly'}
                          </Text>
                        </View>
                        <Ionicons name="pencil" size={20} color={colors.text.muted} />
                      </View>
                    </Pressable>
                  )}
                </Card>
              );
            })
          )}
        </View>

        {/* 4. Memories Section */}
        <View style={styles.section}>
          <View style={styles.memoriesHeader}>
            <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
              Memories
            </Text>
            <Text variant="textSm" color="muted">
              {memoriesCount} / {maxMemories}
            </Text>
          </View>

          {isLoadingMemories ? (
            <View style={styles.memoriesLoading}>
              <ActivityIndicator size="small" color={colors.accent[500]} />
            </View>
          ) : memories.length === 0 ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Text variant="textBase" color="secondary" style={styles.emptyText}>
                No memories yet. Add photos that remind you why this goal matters.
              </Text>
            </Card>
          ) : (
            <FlatList
              data={memories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.memoriesGrid}
              renderItem={({ item }) => (
                <Pressable onLongPress={() => handleDeleteMemory(item)} style={styles.memoryItem}>
                  <Image source={{ uri: item.image_url }} style={styles.memoryImage} />
                </Pressable>
              )}
            />
          )}

          {/* Add Memory Button */}
          <Button
            variant="secondary"
            size="md"
            onPress={handleAddMemory}
            disabled={memoriesCount >= maxMemories || uploadMemoryMutation.isPending}
            style={styles.addMemoryButton}
          >
            {uploadMemoryMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.accent[500]} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={colors.accent[500]} />
                <Text
                  variant="textBase"
                  weight="medium"
                  style={[styles.addMemoryText, { color: colors.accent[500] }]}
                >
                  Add Memory
                </Text>
              </>
            )}
          </Button>
        </View>

        {/* 5. Archive Button */}
        <View style={styles.section}>
          <Button
            variant="secondary"
            size="md"
            onPress={handleArchive}
            style={[styles.archiveButton, { borderColor: colors.rose[500] }]}
            disabled={archiveGoalMutation.isPending}
          >
            {archiveGoalMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.rose[500]} />
            ) : (
              <Text variant="textBase" weight="medium" style={{ color: colors.rose[500] }}>
                Archive Needle
              </Text>
            )}
          </Button>
        </View>
      </ScrollView>
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
    marginLeft: 12,
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
  title: {
    marginBottom: 4,
  },
  tapToEditHint: {
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motivationBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 100,
  },
  motivationInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  milestoneCard: {
    padding: 16,
    marginBottom: 12,
  },
  milestoneContent: {
    gap: 8,
  },
  milestoneProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
  bindDescription: {
    marginTop: 4,
  },
  bindFrequency: {
    marginTop: 2,
    fontSize: 12,
  },
  emptyCard: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  memoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoriesLoading: {
    padding: 32,
    alignItems: 'center',
  },
  memoriesGrid: {
    paddingVertical: 8,
    gap: 12,
  },
  memoryItem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addMemoryButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addMemoryText: {
    marginLeft: 4,
  },
  archiveButton: {
    marginTop: 8,
  },
  bindEditContainer: {
    padding: 16,
    gap: 16,
  },
  bindEditField: {
    gap: 8,
  },
  bindEditLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bindEditInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  bindEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  bindEditButton: {
    flex: 1,
  },
});
