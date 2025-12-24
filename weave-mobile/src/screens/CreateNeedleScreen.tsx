/**
 * CreateNeedleScreen (US-2.3: Create New Goal - AI-Assisted)
 *
 * AI-assisted goal creation flow:
 * 1. User enters goal title and why it matters
 * 2. AI generates Q-goals (milestones) and suggested binds
 * 3. User can edit AI suggestions
 * 4. Create goal with all associated data
 *
 * Wireframe: docs/pages/dashboard-page.md (US-2.3 section)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGoal } from '@/hooks/useActiveGoals';
import type { BindCreate, QGoalCreate } from '@/types/goals';

type CreationStep = 'input' | 'ai-generating' | 'review';

export function CreateNeedleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const createGoalMutation = useCreateGoal();

  const [currentStep, setCurrentStep] = useState<CreationStep>('input');
  const [goalTitle, setGoalTitle] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');

  // AI-generated suggestions (will be populated by AI API)
  const [suggestedQGoals, setSuggestedQGoals] = useState<Array<QGoalCreate>>([]);
  const [suggestedBinds, setSuggestedBinds] = useState<Array<BindCreate>>([]);
  const [editingQGoalIndex, setEditingQGoalIndex] = useState<number | null>(null);
  const [editingBindIndex, setEditingBindIndex] = useState<number | null>(null);
  const [editingBindTitle, setEditingBindTitle] = useState('');
  const [editingBindFrequency, setEditingBindFrequency] = useState<'daily' | 'weekly' | 'custom'>(
    'daily'
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAskAI = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a goal title first.');
      return;
    }

    if (!whyItMatters.trim()) {
      Alert.alert('Missing Information', 'Please tell us why this goal matters to you.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep('ai-generating');

    try {
      // TODO: Call AI API to generate Q-goals and binds
      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // Mock AI suggestions
      setSuggestedQGoals([
        {
          title: 'Reach target weight',
          target_value: 180,
          current_value: 165,
          unit: 'lbs',
        },
        {
          title: 'Strength milestone',
          target_value: 225,
          current_value: 185,
          unit: 'lbs',
        },
      ]);

      setSuggestedBinds([
        { title: 'Workout', frequency_type: 'weekly', frequency_value: 5 },
        { title: 'Meal Prep', frequency_type: 'daily', frequency_value: 1 },
        { title: 'Track Calories', frequency_type: 'daily', frequency_value: 1 },
      ]);

      setCurrentStep('review');
    } catch {
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
      setCurrentStep('input');
    }
  };

  const handleCreateGoal = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    createGoalMutation.mutate(
      {
        title: goalTitle,
        description: whyItMatters,
        qgoals: suggestedQGoals,
        binds: suggestedBinds,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Goal created successfully!', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create goal. Please try again.');
        },
      }
    );
  };

  // Step 1: Input
  if (currentStep === 'input') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text variant="textLg" weight="semibold" style={styles.headerTitle}>
            New Needle
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Goal Title Input */}
          <View style={styles.section}>
            <Text variant="textSm" color="secondary" style={styles.label}>
              What's your goal?
            </Text>
            <TextInput
              value={goalTitle}
              onChangeText={setGoalTitle}
              style={[
                styles.input,
                {
                  color: colors.text.primary,
                  borderColor: colors.border.muted,
                  backgroundColor: colors.background.secondary,
                },
              ]}
              placeholder="e.g., Get Ripped, Build a Startup, Learn Guitar"
              placeholderTextColor={colors.text.muted}
              autoFocus
            />
          </View>

          {/* Why It Matters */}
          <View style={styles.section}>
            <Text variant="textSm" color="secondary" style={styles.label}>
              Why is this goal important to you?
            </Text>
            <TextInput
              value={whyItMatters}
              onChangeText={setWhyItMatters}
              multiline
              style={[
                styles.textAreaInput,
                {
                  color: colors.text.primary,
                  borderColor: colors.border.muted,
                  backgroundColor: colors.background.secondary,
                },
              ]}
              placeholder="Share your motivation... This helps the AI understand what success means to you."
              placeholderTextColor={colors.text.muted}
            />
          </View>

          {/* Info Card */}
          <Card variant="glass" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="sparkles" size={20} color={colors.violet[400]} />
              <Text variant="textSm" style={[styles.infoText, { color: colors.text.secondary }]}>
                Tap "Generate Plan" and Weave AI will create milestones and daily habits for you.
                You can edit everything before saving.
              </Text>
            </View>
          </Card>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.bottomButtonContainer}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleAskAI}
            disabled={!goalTitle.trim() || !whyItMatters.trim()}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text variant="textBase" weight="semibold" style={{ color: 'white' }}>
                Generate Plan
              </Text>
            </View>
          </Button>
        </View>
      </View>
    );
  }

  // Step 2: AI Generating
  if (currentStep === 'ai-generating') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
          <Text variant="textLg" weight="semibold" style={styles.loadingText}>
            Weave AI is creating your plan...
          </Text>
          <Text variant="textBase" color="secondary" style={styles.loadingSubtext}>
            Analyzing your goal and generating milestones
          </Text>
        </View>
      </View>
    );
  }

  // Step 3: Review AI Suggestions
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => setCurrentStep('input')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text variant="textLg" weight="semibold" style={styles.headerTitle}>
          Review Your Plan
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Title (Editable) */}
        <View style={styles.section}>
          <Text variant="textSm" color="secondary" style={styles.label}>
            Goal
          </Text>
          <TextInput
            value={goalTitle}
            onChangeText={setGoalTitle}
            style={[
              styles.input,
              {
                color: colors.text.primary,
                borderColor: colors.border.muted,
                backgroundColor: colors.background.secondary,
              },
            ]}
          />
        </View>

        {/* Why (Editable) */}
        <View style={styles.section}>
          <Text variant="textSm" color="secondary" style={styles.label}>
            Why this matters
          </Text>
          <TextInput
            value={whyItMatters}
            onChangeText={setWhyItMatters}
            multiline
            style={[
              styles.textAreaInput,
              {
                color: colors.text.primary,
                borderColor: colors.border.muted,
                backgroundColor: colors.background.secondary,
              },
            ]}
          />
        </View>

        {/* Milestones (Q-Goals) */}
        <View style={styles.section}>
          <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
            Milestones
          </Text>
          <Text variant="textSm" color="secondary" style={styles.sectionSubtitle}>
            Measurable targets to track your progress
          </Text>
          {suggestedQGoals.map((qgoal, index) => (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.selectionAsync();
                setEditingQGoalIndex(index);
              }}
            >
              <Card variant="glass" style={styles.listItemCard}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemInfo}>
                    {editingQGoalIndex === index ? (
                      <TextInput
                        value={qgoal.title}
                        onChangeText={(text) => {
                          const updated = [...suggestedQGoals];
                          updated[index].title = text;
                          setSuggestedQGoals(updated);
                        }}
                        onBlur={() => setEditingQGoalIndex(null)}
                        autoFocus
                        style={[
                          styles.inlineInput,
                          { color: colors.text.primary, borderColor: colors.border.focus },
                        ]}
                      />
                    ) : (
                      <Text variant="textBase" weight="medium">
                        {qgoal.title}
                      </Text>
                    )}
                    <Text variant="textSm" color="secondary">
                      Target: {qgoal.target_value} {qgoal.unit}
                    </Text>
                  </View>
                  <Ionicons name="pencil" size={20} color={colors.text.secondary} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        {/* Daily Habits (Binds) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
                Daily Habits
              </Text>
              <Text variant="textSm" color="secondary" style={styles.sectionSubtitle}>
                Consistent actions that will get you there (max 3)
              </Text>
            </View>
            <Text variant="textSm" color="secondary">
              {suggestedBinds.length}/3
            </Text>
          </View>
          {suggestedBinds.map((bind, index) => {
            const isEditing = editingBindIndex === index;
            return (
              <Card key={index} variant="glass" style={styles.listItemCard}>
                {isEditing ? (
                  // Edit mode - expanded view with title and frequency
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
                        autoFocus
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
                        onPress={() => setEditingBindIndex(null)}
                        style={styles.bindEditButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => {
                          const trimmedTitle = editingBindTitle.trim();
                          if (!trimmedTitle) {
                            Alert.alert('Validation Error', 'Bind title cannot be empty.');
                            return;
                          }
                          const updated = [...suggestedBinds];
                          const newBind: BindCreate = {
                            title: trimmedTitle,
                            frequency_type:
                              editingBindFrequency === 'custom' ? 'daily' : editingBindFrequency,
                            frequency_value: editingBindFrequency === 'weekly' ? 5 : 1,
                          };
                          updated[index] = newBind;
                          setSuggestedBinds(updated);
                          setEditingBindIndex(null);
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                        style={styles.bindEditButton}
                      >
                        Save
                      </Button>
                    </View>
                  </View>
                ) : (
                  // View mode - collapsed view with edit/delete buttons
                  <View style={styles.listItemContent}>
                    <Pressable
                      style={styles.listItemInfo}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setEditingBindIndex(index);
                        setEditingBindTitle(bind.title);
                        setEditingBindFrequency(bind.frequency_type);
                      }}
                    >
                      <Text variant="textBase" weight="medium">
                        {bind.title}
                      </Text>
                      <Text variant="textSm" color="secondary">
                        {bind.frequency_type === 'daily' ? 'Daily' : 'Weekly'}
                      </Text>
                    </Pressable>
                    <View style={styles.listItemActions}>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          setEditingBindIndex(index);
                          setEditingBindTitle(bind.title);
                          setEditingBindFrequency(bind.frequency_type);
                        }}
                        style={styles.iconButton}
                      >
                        <Ionicons name="pencil" size={20} color={colors.text.secondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          const updated = suggestedBinds.filter((_, i) => i !== index);
                          setSuggestedBinds(updated);
                        }}
                        style={styles.iconButton}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.rose[500]} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}
          {/* Add Bind Button */}
          {suggestedBinds.length < 3 && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                const newBind: BindCreate = {
                  title: '',
                  frequency_type: 'daily',
                  frequency_value: 1,
                };
                setSuggestedBinds([...suggestedBinds, newBind]);
                setEditingBindIndex(suggestedBinds.length);
                setEditingBindTitle('');
                setEditingBindFrequency('daily');
              }}
            >
              <Card
                variant="glass"
                style={[styles.addBindCard, { borderColor: colors.border.muted }]}
              >
                <View style={styles.addBindContent}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.accent[500]} />
                  <Text variant="textBase" weight="medium" style={{ color: colors.accent[500] }}>
                    Add Bind
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
          {suggestedBinds.length === 0 && (
            <Card variant="glass" style={styles.emptyCard}>
              <Text variant="textSm" color="secondary" style={{ textAlign: 'center' }}>
                No habits yet. Add at least one to create your goal.
              </Text>
            </Card>
          )}
        </View>

        {/* Info Card */}
        <Card variant="glass" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={20} color={colors.violet[400]} />
            <Text variant="textSm" style={[styles.infoText, { color: colors.text.secondary }]}>
              You can edit these later. Tap "Create Needle" to get started!
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.bottomButtonContainer}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleCreateGoal}
          disabled={createGoalMutation.isPending || suggestedBinds.length === 0}
        >
          {createGoalMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text variant="textBase" weight="semibold" style={{ color: 'white' }}>
              Create Needle
            </Text>
          )}
        </Button>
      </View>
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
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
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
  label: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  textAreaInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  infoCard: {
    padding: 16,
    marginTop: 24,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    textAlign: 'center',
  },
  loadingSubtext: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listItemCard: {
    padding: 16,
    marginBottom: 12,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listItemInfo: {
    flex: 1,
    gap: 4,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  inlineInput: {
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  emptyCard: {
    padding: 24,
  },
  bindEditContainer: {
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
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  addBindCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addBindContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
