/**
 * CreateNeedleScreen (US-2.3: Create New Goal - Manual Entry)
 *
 * Multi-step manual needle creation flow:
 * Step 1: Needle Details (title, why, color)
 * Step 2: Add Binds (habits, 1-3 required)
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGoal } from '@/hooks/useActiveGoals';
import type { BindCreate } from '@/types/goals';

type CreationStep = 'details' | 'binds';

// Minimal aesthetic: No color distinction for needles
const DEFAULT_NEEDLE_COLOR = '#FFFFFF'; // White (neutral)

/**
 * Convert times_per_week to backend format (frequency_type + frequency_value)
 */
function convertTimesPerWeekToFrequency(timesPerWeek: number): {
  frequency_type: 'daily' | 'weekly' | 'custom';
  frequency_value: number;
} {
  if (timesPerWeek === 7) {
    return { frequency_type: 'daily', frequency_value: 1 };
  }
  return { frequency_type: 'weekly', frequency_value: timesPerWeek };
}

/**
 * Convert backend format back to times_per_week for display
 */
function convertFrequencyToTimesPerWeek(bind: BindCreate): number {
  if (bind.frequency_type === 'daily') {
    return 7;
  }
  return bind.frequency_value;
}

export function CreateNeedleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const createGoalMutation = useCreateGoal();

  // Step management
  const [currentStep, setCurrentStep] = useState<CreationStep>('details');

  // Step 1: Needle details
  const [goalTitle, setGoalTitle] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');

  // Step 2: Binds
  const [binds, setBinds] = useState<Array<BindCreate>>([]);
  const [editingBindIndex, setEditingBindIndex] = useState<number | null>(null);
  const [editingBindTitle, setEditingBindTitle] = useState('');
  const [editingBindTimesPerWeek, setEditingBindTimesPerWeek] = useState(3);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 'binds') {
      // Go back to Step 1
      setCurrentStep('details');
    } else {
      // Exit screen
      router.back();
    }
  };

  const handleNextToBinds = () => {
    if (!goalTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a goal title.');
      return;
    }

    if (!whyItMatters.trim()) {
      Alert.alert('Missing Information', 'Please tell us why this goal matters to you.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep('binds');
  };

  const handleCreateGoal = async () => {
    if (binds.length === 0) {
      Alert.alert(
        'No Binds Added',
        'Please add at least one bind to track your progress toward this goal.'
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    createGoalMutation.mutate(
      {
        title: goalTitle,
        description: whyItMatters,
        color: DEFAULT_NEEDLE_COLOR, // Minimal aesthetic: no color distinction
        qgoals: [], // No milestones for manual creation
        binds: binds,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Needle created successfully!', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create needle. Please try again.');
        },
      }
    );
  };

  // Step 1: Needle Details
  if (currentStep === 'details') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text
            variant="textLg"
            weight="semibold"
            style={[
              styles.headerTitle,
              { color: colors.text.primary, fontSize: 20, fontWeight: '600' },
            ]}
          >
            Create Your Needle
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section in Card */}
          <Card variant="default" style={styles.heroCard}>
            <View style={styles.heroSectionCompact}>
              <View style={styles.iconContainerSmall}>
                <Ionicons name="compass" size={36} color={colors.accent[500]} />
              </View>
              <Text
                variant="textBase"
                style={[
                  styles.heroDescriptionCompact,
                  { color: colors.text.secondary, fontSize: 14, lineHeight: 20 },
                ]}
              >
                A needle is your North Star - a meaningful goal that guides your daily actions and
                builds your future identity.
              </Text>
            </View>
          </Card>

          {/* Goal Title Input */}
          <View style={styles.inputSection}>
            <Text
              variant="textSm"
              style={[
                styles.label,
                { color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 6 },
              ]}
            >
              What's your goal?
            </Text>
            <Text
              variant="textXs"
              style={[
                styles.fieldHelper,
                { color: colors.text.muted, fontSize: 13, marginBottom: 12 },
              ]}
            >
              Be specific and measurable
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
              placeholder="e.g., Hit 225lb bench, Get 4.0 this semester"
              placeholderTextColor={colors.text.muted}
              autoFocus
              maxLength={100}
            />
          </View>

          {/* Why It Matters */}
          <View style={styles.section}>
            <Text
              variant="textSm"
              style={[
                styles.label,
                { color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 6 },
              ]}
            >
              Why does this matter to you?
            </Text>
            <Text
              variant="textXs"
              style={[
                styles.fieldDescription,
                { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: 12 },
              ]}
            >
              This keeps you motivated when things get tough. Be honest and specific.
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
              placeholder="e.g., To prove to myself I can commit to hard things and build the discipline I need to succeed"
              placeholderTextColor={colors.text.muted}
              maxLength={500}
            />
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.bottomButtonContainer}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleNextToBinds}
            disabled={!goalTitle.trim() || !whyItMatters.trim()}
          >
            <Text variant="textBase" weight="semibold" style={{ color: colors.text.inverse }}>
              Next
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Add Binds
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text
          variant="textLg"
          weight="semibold"
          style={[
            styles.headerTitle,
            { color: colors.text.primary, fontSize: 20, fontWeight: '600' },
          ]}
        >
          Add Binds
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section in Card */}
        <Card variant="default" style={styles.heroCard}>
          <View style={styles.heroSectionCompact}>
            <View style={styles.iconContainerSmall}>
              <Ionicons name="flash" size={36} color={colors.accent[500]} />
            </View>
            <Text
              variant="textBase"
              style={[
                styles.heroDescriptionCompact,
                { color: colors.text.secondary, fontSize: 14, lineHeight: 20 },
              ]}
            >
              Binds are the consistent actions that move you toward your needle. Add 1-3 binds
              you'll do regularly to build momentum.
            </Text>
          </View>
        </Card>

        {/* Example Card */}
        <Card variant="glass" style={styles.exampleCardCompact}>
          <View style={styles.exampleHeader}>
            <Ionicons name="bulb" size={20} color={colors.violet[400]} />
            <Text variant="textSm" weight="semibold" style={{ color: colors.violet[400] }}>
              Examples
            </Text>
          </View>
          <View style={styles.exampleList}>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald[500]} />
              <Text variant="textSm" color="secondary">
                "Morning Workout" - 5x per week
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald[500]} />
              <Text variant="textSm" color="secondary">
                "Read for 30 min" - Daily
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald[500]} />
              <Text variant="textSm" color="secondary">
                "Code for 2 hours" - 4x per week
              </Text>
            </View>
          </View>
        </Card>

        {/* Binds Section */}
        <View style={styles.bindsSection}>
          <View style={styles.sectionHeader}>
            <Text
              variant="textBase"
              weight="semibold"
              style={[
                styles.sectionTitle,
                { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
              ]}
            >
              Your Binds
            </Text>
            <Text variant="textSm" style={{ color: colors.text.muted, fontSize: 14 }}>
              {binds.length}/3
            </Text>
          </View>

          {binds.map((bind, index) => {
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
                        placeholder="e.g., Morning Workout, Read 30 min"
                        placeholderTextColor={colors.text.muted}
                        maxLength={200}
                        autoFocus
                      />
                    </View>

                    <View style={styles.bindEditField}>
                      <Text variant="textSm" color="secondary" style={styles.bindEditLabel}>
                        Times Per Week
                      </Text>
                      <View style={styles.timesPerWeekSlider}>
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <Pressable
                            key={num}
                            style={[
                              styles.sliderSegment,
                              {
                                backgroundColor:
                                  editingBindTimesPerWeek === num
                                    ? colors.accent[500]
                                    : colors.background.secondary,
                                borderColor: colors.border.muted,
                              },
                            ]}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setEditingBindTimesPerWeek(num);
                            }}
                          >
                            <Text
                              variant="textSm"
                              weight="semibold"
                              style={{
                                color:
                                  editingBindTimesPerWeek === num
                                    ? colors.background.primary
                                    : colors.text.secondary,
                              }}
                            >
                              {num}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text variant="textXs" color="secondary" style={styles.helperText}>
                        {editingBindTimesPerWeek === 7
                          ? 'Daily (every day)'
                          : editingBindTimesPerWeek === 1
                            ? 'Once a week'
                            : `${editingBindTimesPerWeek} times per week`}
                      </Text>
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
                            Alert.alert('Missing Information', 'Please enter a name for this bind.');
                            return;
                          }
                          const updated = [...binds];
                          const { frequency_type, frequency_value } =
                            convertTimesPerWeekToFrequency(editingBindTimesPerWeek);
                          const newBind: BindCreate = {
                            title: trimmedTitle,
                            frequency_type,
                            frequency_value,
                          };
                          updated[index] = newBind;
                          setBinds(updated);
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
                        setEditingBindTimesPerWeek(convertFrequencyToTimesPerWeek(bind));
                      }}
                    >
                      <Text variant="textBase" weight="medium">
                        {bind.title}
                      </Text>
                      <Text variant="textSm" color="secondary">
                        {convertFrequencyToTimesPerWeek(bind) === 7
                          ? 'Daily'
                          : convertFrequencyToTimesPerWeek(bind) === 1
                            ? 'Once a week'
                            : `${convertFrequencyToTimesPerWeek(bind)}x per week`}
                      </Text>
                    </Pressable>
                    <View style={styles.listItemActions}>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          setEditingBindIndex(index);
                          setEditingBindTitle(bind.title);
                          setEditingBindTimesPerWeek(convertFrequencyToTimesPerWeek(bind));
                        }}
                        style={styles.iconButton}
                      >
                        <Ionicons name="pencil" size={20} color={colors.text.secondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          const updated = binds.filter((_, i) => i !== index);
                          setBinds(updated);
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
          {binds.length < 3 && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                const { frequency_type, frequency_value } = convertTimesPerWeekToFrequency(3);
                const newBind: BindCreate = {
                  title: '',
                  frequency_type,
                  frequency_value,
                };
                setBinds([...binds, newBind]);
                setEditingBindIndex(binds.length);
                setEditingBindTitle('');
                setEditingBindTimesPerWeek(3);
              }}
            >
              <Card
                variant="glass"
                style={{
                  ...styles.addBindCard,
                  borderColor: colors.border.muted,
                }}
              >
                <View style={styles.addBindContent}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.accent[500]} />
                  <Text
                    variant="textBase"
                    weight="medium"
                    style={{ color: colors.accent[500], fontSize: 15 }}
                  >
                    Add Bind
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}

        </View>

        {/* Info Card */}
        <Card variant="glass" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={20} color={colors.violet[400]} />
            <Text
              variant="textSm"
              style={[styles.infoText, { color: colors.text.secondary, fontSize: 14 }]}
            >
              You can edit these binds later. Tap "Create Needle" when ready!
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
          disabled={createGoalMutation.isPending || binds.length === 0}
        >
          {createGoalMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text variant="textBase" weight="semibold" style={{ color: colors.text.inverse }}>
              Create Needle
            </Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
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
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
    zIndex: 10,
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroCard: {
    marginBottom: 20,
  },
  heroSectionCompact: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainerSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(91, 141, 239, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDescriptionCompact: {
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    marginTop: 0,
  },
  fieldHelper: {
    lineHeight: 16,
  },
  fieldDescription: {
    lineHeight: 18,
  },
  exampleCardCompact: {
    padding: 14,
    marginBottom: 24,
  },
  bindsSection: {
    marginTop: 0,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exampleList: {
    gap: 10,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  section: {
    marginTop: 40,
  },
  label: {
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
    marginTop: 16,
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
  sectionTitle: {
    marginBottom: 4,
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
  timesPerWeekSlider: {
    flexDirection: 'row',
    gap: 6,
  },
  sliderSegment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 8,
    textAlign: 'center',
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
