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
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGoal } from '@/hooks/useActiveGoals';
import type { BindCreate, QGoalCreate } from '@/types/goals';

type CreationStep = 'input' | 'ai-generating' | 'review';

export function CreateNeedleScreen() {
  const router = useRouter();
  const createGoalMutation = useCreateGoal();

  const [currentStep, setCurrentStep] = useState<CreationStep>('input');
  const [goalTitle, setGoalTitle] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');

  // AI-generated suggestions (will be populated by AI API)
  const [suggestedQGoals, setSuggestedQGoals] = useState<Array<QGoalCreate>>([]);
  const [suggestedBinds, setSuggestedBinds] = useState<Array<BindCreate>>([]);
  const [editingQGoalIndex, setEditingQGoalIndex] = useState<number | null>(null);
  const [editingBindIndex, setEditingBindIndex] = useState<number | null>(null);

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
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: 18, fontWeight: '600', color: '#ffffff', textAlign: 'center' }]}>
            New Needle
          </RNText>
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
            <Text style={[styles.label, { fontSize: 14, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
              What's your goal?
            </RNText>
            <TextInput
              value={goalTitle}
              onChangeText={setGoalTitle}
              style={[
                styles.input,
                {
                  color: '#ffffff',
                  borderColor: '#27272A',
                  backgroundColor: '#18181b',
                },
              ]}
              placeholder="e.g., Get Ripped, Build a Startup, Learn Guitar"
              placeholderTextColor="#71717a"
              autoFocus
            />
          </View>

          {/* Why It Matters */}
          <View style={styles.section}>
            <Text style={[styles.label, { fontSize: 14, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
              Why is this goal important to you?
            </RNText>
            <TextInput
              value={whyItMatters}
              onChangeText={setWhyItMatters}
              multiline
              style={[
                styles.textAreaInput,
                {
                  color: '#ffffff',
                  borderColor: '#27272A',
                  backgroundColor: '#18181b',
                },
              ]}
              placeholder="Share your motivation... This helps the AI understand what success means to you."
              placeholderTextColor="#71717a"
            />
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <View style={styles.infoContent}>
              <Ionicons name="sparkles" size={20} color="#a78bfa" />
              <Text style={[styles.infoText, { fontSize: 14, color: '#a1a1aa' }]}>
                Tap "Generate Plan" and Weave AI will create milestones and daily habits for you.
                You can edit everything before saving.
              </RNText>
            </View>
          </View>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            onPress={handleAskAI}
            disabled={!goalTitle.trim() || !whyItMatters.trim()}
            style={[{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, opacity: (!goalTitle.trim() || !whyItMatters.trim()) ? 0.5 : 1 }]}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>
                Generate Plan
              </RNText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: AI Generating
  if (currentStep === 'ai-generating') {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { fontSize: 18, fontWeight: '600', color: '#ffffff', textAlign: 'center' }]}>
            Weave AI is creating your plan...
          </RNText>
          <Text style={[styles.loadingSubtext, { fontSize: 15, color: '#a1a1aa', textAlign: 'center' }]}>
            Analyzing your goal and generating milestones
          </RNText>
        </View>
      </View>
    );
  }

  // Step 3: Review AI Suggestions
  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => setCurrentStep('input')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: 18, fontWeight: '600', color: '#ffffff', textAlign: 'center' }]}>
          Review Your Plan
        </RNText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Title (Editable) */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: 14, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Goal
          </RNText>
          <TextInput
            value={goalTitle}
            onChangeText={setGoalTitle}
            style={[
              styles.input,
              {
                color: '#ffffff',
                borderColor: '#27272A',
                backgroundColor: '#18181b',
              },
            ]}
          />
        </View>

        {/* Why (Editable) */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: 14, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Why this matters
          </RNText>
          <TextInput
            value={whyItMatters}
            onChangeText={setWhyItMatters}
            multiline
            style={[
              styles.textAreaInput,
              {
                color: '#ffffff',
                borderColor: '#27272A',
                backgroundColor: '#18181b',
              },
            ]}
          />
        </View>

        {/* Milestones (Q-Goals) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
            Milestones
          </RNText>
          <Text style={[styles.sectionSubtitle, { fontSize: 14, color: '#a1a1aa' }]}>
            Measurable targets to track your progress
          </RNText>
          {suggestedQGoals.map((qgoal, index) => (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.selectionAsync();
                setEditingQGoalIndex(index);
              }}
            >
              <View style={[styles.listItemCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
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
                          { color: '#ffffff', borderColor: '#3b82f6' },
                        ]}
                      />
                    ) : (
                      <Text style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>
                        {qgoal.title}
                      </RNText>
                    )}
                    <Text style={{ fontSize: 14, color: '#a1a1aa' }}>
                      Target: {qgoal.target_value} {qgoal.unit}
                    </RNText>
                  </View>
                  <Ionicons name="pencil" size={20} color="#a1a1aa" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Daily Habits (Binds) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
            Daily Habits
          </RNText>
          <Text style={[styles.sectionSubtitle, { fontSize: 14, color: '#a1a1aa' }]}>
            Consistent actions that will get you there
          </RNText>
          {suggestedBinds.map((bind, index) => (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.selectionAsync();
                setEditingBindIndex(index);
              }}
            >
              <View style={[styles.listItemCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemInfo}>
                    {editingBindIndex === index ? (
                      <TextInput
                        value={bind.title}
                        onChangeText={(text) => {
                          const updated = [...suggestedBinds];
                          updated[index].title = text;
                          setSuggestedBinds(updated);
                        }}
                        onBlur={() => setEditingBindIndex(null)}
                        autoFocus
                        style={[
                          styles.inlineInput,
                          { color: '#ffffff', borderColor: '#3b82f6' },
                        ]}
                      />
                    ) : (
                      <Text style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>
                        {bind.title}
                      </RNText>
                    )}
                    <Text style={{ fontSize: 14, color: '#a1a1aa' }}>
                      {bind.frequency_value}x per{' '}
                      {bind.frequency_type === 'weekly' ? 'week' : 'day'}
                    </RNText>
                  </View>
                  <Ionicons name="pencil" size={20} color="#a1a1aa" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={20} color="#a78bfa" />
            <Text style={[styles.infoText, { fontSize: 14, color: '#a1a1aa' }]}>
              You can edit these later. Tap "Create Needle" to get started!
            </RNText>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={handleCreateGoal}
          disabled={createGoalMutation.isPending}
          style={[{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, opacity: createGoalMutation.isPending ? 0.5 : 1 }]}
        >
          {createGoalMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white', textAlign: 'center' }}>
              Create Needle
            </RNText>
          )}
        </TouchableOpacity>
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
  listItemCard: {
    padding: 16,
    marginBottom: 12,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemInfo: {
    flex: 1,
    gap: 4,
  },
  inlineInput: {
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
});
