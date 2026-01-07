/**
 * NeedleDetailScreen (US-2.2: View Goal Details + US-2.4: Edit Needle)
 *
 * REDESIGNED LAYOUT WITH ENHANCED VISUAL HIERARCHY:
 * 1. Hero header with display2xl title and colored accent bar
 * 2. Collapsible motivation section with elegant design
 * 3. Enhanced bind cards with progress indicators and frequency badges
 * 4. Strategic use of color and animations
 * 5. Improved empty states with icons
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
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Text, Card, Button } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useGoalById, useUpdateGoal, useArchiveGoal } from '@/hooks/useActiveGoals';
import { useGoalMemories, useUploadMemory, useDeleteMemory } from '@/hooks/useGoalMemories';
import { useUpdateBind } from '@/hooks/useUpdateBind';
import { useCreateBind } from '@/hooks/useCreateBind';
import { useDeleteBind } from '@/hooks/useDeleteBind';
import { Ionicons } from '@expo/vector-icons';
import type { Memory } from '@/types/goals';

export function NeedleDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Animation values
  const motivationAnimation = useRef(new Animated.Value(0)).current;
  const bindCardAnimations = useRef<{ [key: string]: Animated.Value }>({});

  // State for editable fields
  const [titleValue, setTitleValue] = useState('');
  const [motivationValue, setMotivationValue] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isMotivationEditing, setIsMotivationEditing] = useState(false);
  const [isMotivationExpanded, setIsMotivationExpanded] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // State for editing binds
  const [editingBindId, setEditingBindId] = useState<string | null>(null);
  const [editingBindTitle, setEditingBindTitle] = useState('');
  const [editingBindTimesPerWeek, setEditingBindTimesPerWeek] = useState(3);

  // State for creating new bind
  const [isCreatingBind, setIsCreatingBind] = useState(false);
  const [newBindTitle, setNewBindTitle] = useState('');
  const [newBindTimesPerWeek, setNewBindTimesPerWeek] = useState(3);

  // Refs for tracking original values (for auto-save comparison)
  const originalTitleRef = useRef('');
  const originalMotivationRef = useRef('');

  // Queries and mutations
  const { data, isLoading, isError, error, refetch } = useGoalById(id || '');
  const { data: memoriesData, isLoading: isLoadingMemories, refetch: refetchMemories } = useGoalMemories(id || '');
  const updateGoalMutation = useUpdateGoal();
  const archiveGoalMutation = useArchiveGoal();
  const uploadMemoryMutation = useUploadMemory();
  const deleteMemoryMutation = useDeleteMemory();
  const updateBindMutation = useUpdateBind();
  const createBindMutation = useCreateBind();
  const deleteBindMutation = useDeleteBind();

  const goal = data?.data || null;
  const memories = Array.isArray(memoriesData?.data) ? memoriesData.data : [];
  const memoriesCount = memories.length;
  const maxMemories = 10;

  // Track first mount to avoid double-fetching
  const isFirstMount = useRef(true);

  // Refetch goal data when screen comes into focus
  // This ensures changes from other screens (bind completions, bind CRUD, etc.) are reflected
  useFocusEffect(
    React.useCallback(() => {
      // Skip refetch on first mount (initial query already handles it)
      if (isFirstMount.current) {
        isFirstMount.current = false;
        console.log('[NeedleDetail] First mount - skipping refetch (initial query handles it)');
        return;
      }

      console.log('[NeedleDetail] Screen refocused - refetching goal and memories');
      refetch();
      refetchMemories();
    }, [refetch, refetchMemories])
  );

  // Initialize editable fields when data loads
  React.useEffect(() => {
    if (goal) {
      setTitleValue(goal.title || '');
      setMotivationValue(goal.description || '');
      originalTitleRef.current = goal.title || '';
      originalMotivationRef.current = goal.description || '';
    }
  }, [goal]);

  // Toggle motivation section
  const toggleMotivation = () => {
    const toValue = isMotivationExpanded ? 0 : 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.spring(motivationAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    setIsMotivationExpanded(!isMotivationExpanded);
  };

  const motivationHeight = motivationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on content
  });

  const motivationOpacity = motivationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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

  // Start editing a bind
  const handleBindPress = (bind: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBindId(bind.id);
    setEditingBindTitle(bind.title || '');
    setEditingBindTimesPerWeek(bind.times_per_week || 3);
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
        times_per_week: editingBindTimesPerWeek,
      },
      {
        onSuccess: () => {
          setEditingBindId(null);
          refetch(); // Immediately refresh goal data to show updated bind
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
    setEditingBindTimesPerWeek(3);
  };

  // Start creating a new bind
  const handleStartCreateBind = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsCreatingBind(true);
    setNewBindTitle('');
    setNewBindTimesPerWeek(3);
  };

  // Save new bind
  const handleSaveNewBind = () => {
    const trimmedTitle = newBindTitle.trim();
    if (!trimmedTitle) {
      Alert.alert('Validation Error', 'Bind title cannot be empty.');
      return;
    }

    // Close form immediately (don't wait for API)
    setIsCreatingBind(false);
    setNewBindTitle('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fire mutation in background
    createBindMutation.mutate(
      {
        goal_id: id || '',
        title: trimmedTitle,
        times_per_week: newBindTimesPerWeek,
      },
      {
        onSuccess: () => {
          refetch(); // Refresh goal data to replace temp bind with real bind
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create bind.');
        },
      }
    );
  };

  // Cancel creating new bind
  const handleCancelCreateBind = () => {
    setIsCreatingBind(false);
    setNewBindTitle('');
    setNewBindTimesPerWeek(3);
  };

  // Delete a bind
  const handleDeleteBind = (bindId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Bind', 'Are you sure you want to delete this bind?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBindMutation.mutate(
            { bindId, goalId: id || '' },
            {
              onSuccess: () => {
                refetch(); // Immediately refresh goal data to remove deleted bind
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
              onError: (error) => {
                Alert.alert('Error', error.message || 'Failed to delete bind.');
              },
            }
          );
        },
      },
    ]);
  };

  const handleDeleteGoal = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Needle', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Keep modal open during deletion (loading state will show)
          archiveGoalMutation.mutate(id || '', {
            onSuccess: () => {
              setIsEditModalVisible(false);
              router.back();
            },
            onError: (error) => {
              Alert.alert('Error', error.message || 'Failed to delete goal.');
            },
          });
        },
      },
    ]);
  };

  const handleOpenEditModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditModalVisible(true);
    setTitleValue(originalTitleRef.current);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setTitleValue(originalTitleRef.current);
  };

  const handleSaveNeedleName = () => {
    const trimmedTitle = titleValue.trim();

    // Validation
    if (!trimmedTitle) {
      Alert.alert('Validation Error', 'Goal title cannot be empty.');
      return;
    }

    if (trimmedTitle.length > 200) {
      Alert.alert('Validation Error', 'Goal title must be 200 characters or less.');
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
            setIsEditModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update title.');
          },
        }
      );
    } else {
      setIsEditModalVisible(false);
    }
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

  // Get frequency badge details
  const getFrequencyBadge = (timesPerWeek: number) => {
    if (timesPerWeek === 7) {
      return { icon: 'calendar', label: 'Daily', color: colors.accent[500] };
    } else {
      return { icon: 'calendar', label: `${timesPerWeek}x/week`, color: colors.accent[500] };
    }
  };

  // Calculate completion progress for binds
  const getBindProgress = (bind: any) => {
    const completed = bind.completions_this_week || 0;
    const total = bind.times_per_week || 7;
    // Cap percentage at 100% (don't show over 100%)
    const percentage = Math.min((completed / total) * 100, 100);
    return { completed, total, percentage };
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
          <Text variant="textLg" color="secondary" style={{ marginTop: 16 }}>
            Loading your needle...
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
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.rose[500]} />
          <Text variant="textLg" weight="semibold" style={{ marginTop: 16 }}>
            Oops!
          </Text>
          <Text variant="textBase" color="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
            {error?.message || 'Goal not found'}
          </Text>
          <Button variant="primary" size="md" onPress={handleBack} style={{ marginTop: 24 }}>
            Back to Dashboard
          </Button>
        </View>
      </View>
    );
  }

  const binds = goal.binds || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header with Back Button, Title, and Edit Icon */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.secondary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text
            style={[styles.headerTitle, { color: colors.text.secondary }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {titleValue}
          </Text>
        </View>
        <Pressable onPress={handleOpenEditModal} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. MOTIVATION SECTION (Direct Display) */}
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: -0.5,
              marginBottom: 12,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Why This Matters
          </Text>
          <Pressable onPress={() => setIsMotivationEditing(true)} disabled={isMotivationEditing}>
            {isMotivationEditing ? (
              <View>
                <TextInput
                  value={motivationValue}
                  onChangeText={setMotivationValue}
                  autoFocus
                  multiline
                  style={[
                    styles.motivationInput,
                    {
                      color: colors.text.primary,
                      borderColor: colors.border.strong,
                      backgroundColor: colors.background.secondary,
                    },
                  ]}
                  placeholder="Your motivation for this goal..."
                  placeholderTextColor={colors.text.muted}
                />
                <Pressable
                  onPress={handleMotivationBlur}
                  style={[styles.doneButton, { backgroundColor: colors.accent[500] }]}
                >
                  <Text variant="textBase" weight="semibold" style={{ color: colors.text.inverse }}>
                    Done
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Card variant="glass" style={styles.motivationCard}>
                <Text variant="textBase" style={{ color: colors.text.secondary, lineHeight: 24 }}>
                  {motivationValue || 'Tap to add your motivation...'}
                </Text>
              </Card>
            )}
          </Pressable>
        </View>

        {/* 3. Milestones (Q-Goals) */}
        {goal.qgoals && goal.qgoals.length > 0 && (
          <View style={styles.section}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: -0.5,
                marginBottom: 16,
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Milestones
            </Text>
            {goal.qgoals.map((qgoal: any) => (
              <Card key={qgoal.id} variant="glass" style={styles.milestoneCard}>
                <View style={styles.milestoneContent}>
                  <Text variant="textLg" weight="semibold" style={{ color: colors.text.primary }}>
                    {qgoal.title}
                  </Text>
                  <View style={styles.milestoneProgress}>
                    <Text variant="displayMd" weight="bold" style={{ color: colors.accent[500] }}>
                      {qgoal.current_value || 0}
                    </Text>
                    <Text variant="textBase" color="muted" style={{ marginHorizontal: 8 }}>
                      /
                    </Text>
                    <Text variant="textLg" color="secondary">
                      {qgoal.target_value} {qgoal.unit}
                    </Text>
                  </View>
                  {qgoal.metric_name && (
                    <Text variant="textSm" color="muted" style={{ marginTop: 8 }}>
                      {qgoal.metric_name}
                    </Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* 4. ENHANCED BIND CARDS */}
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: -0.5,
              marginBottom: 16,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Your Binds
          </Text>
          {binds.length === 0 && !isCreatingBind ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Ionicons name="fitness-outline" size={48} color={colors.text.muted} />
              <Text
                variant="textLg"
                weight="semibold"
                style={{ color: colors.text.secondary, marginTop: 16 }}
              >
                No binds yet
              </Text>
              <Text variant="textBase" color="muted" style={{ marginTop: 8, textAlign: 'center' }}>
                Add consistent actions to work toward this goal
              </Text>
            </Card>
          ) : (
            binds.map((bind) => {
              const isEditing = editingBindId === bind.id;
              const progress = getBindProgress(bind);
              const frequencyBadge = getFrequencyBadge(bind.times_per_week);

              return (
                <Card key={bind.id} variant="glass" style={styles.enhancedBindCard}>
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
                                      ? colors.text.inverse
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
                      {/* Delete Button in Edit Mode */}
                      <Pressable
                        onPress={() => handleDeleteBind(editingBindId || '')}
                        style={styles.deleteBindButton}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.rose[500]} />
                        <Text
                          variant="textSm"
                          weight="semibold"
                          style={{ color: colors.rose[500], marginLeft: 8 }}
                        >
                          Delete Bind
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    // Enhanced View mode (No delete button - only in edit)
                    <Pressable onPress={() => handleBindPress(bind)}>
                      <View style={styles.enhancedBindContent}>
                        {/* Bind Info */}
                        <View style={styles.bindInfoSection}>
                          {/* Bind name and frequency on same row */}
                          <View style={styles.bindTitleRow}>
                            <Text
                              variant="textLg"
                              weight="semibold"
                              style={{ color: colors.text.primary, flex: 1 }}
                            >
                              {bind.title}
                            </Text>
                            {/* Frequency Badge */}
                            <View
                              style={[
                                styles.frequencyBadge,
                                { backgroundColor: `${frequencyBadge.color}20` },
                              ]}
                            >
                              <Ionicons
                                name={frequencyBadge.icon as any}
                                size={14}
                                color={frequencyBadge.color}
                              />
                              <Text
                                variant="textXs"
                                weight="semibold"
                                style={{ color: frequencyBadge.color, marginLeft: 4 }}
                              >
                                {frequencyBadge.label}
                              </Text>
                            </View>
                          </View>

                          {/* Progress Indicator */}
                          <View style={styles.progressSection}>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${progress.percentage}%`,
                                    backgroundColor: colors.green[500],
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              variant="textXs"
                              style={{ color: colors.text.primary, marginTop: 4 }}
                            >
                              {progress.completed} / {progress.total} this week
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  )}
                </Card>
              );
            })
          )}

          {/* Create New Bind Form */}
          {isCreatingBind && (
            <Card variant="glass" style={styles.enhancedBindCard}>
              <View style={styles.bindEditContainer}>
                <View style={styles.bindEditField}>
                  <Text variant="textSm" color="secondary" style={styles.bindEditLabel}>
                    Name
                  </Text>
                  <TextInput
                    value={newBindTitle}
                    onChangeText={setNewBindTitle}
                    style={[
                      styles.bindEditInput,
                      {
                        color: colors.text.primary,
                        backgroundColor: colors.background.primary,
                        borderColor: colors.border.muted,
                      },
                    ]}
                    placeholder="Track Calories"
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
                              newBindTimesPerWeek === num
                                ? colors.accent[500]
                                : colors.background.secondary,
                            borderColor: colors.border.muted,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setNewBindTimesPerWeek(num);
                        }}
                      >
                        <Text
                          variant="textSm"
                          weight="semibold"
                          style={{
                            color:
                              newBindTimesPerWeek === num
                                ? colors.text.inverse
                                : colors.text.secondary,
                          }}
                        >
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text variant="textXs" color="secondary" style={styles.helperText}>
                    {newBindTimesPerWeek === 7
                      ? 'Daily (every day)'
                      : newBindTimesPerWeek === 1
                        ? 'Once a week'
                        : `${newBindTimesPerWeek} times per week`}
                  </Text>
                </View>

                <View style={styles.bindEditActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={handleCancelCreateBind}
                    style={styles.bindEditButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={handleSaveNewBind}
                    disabled={createBindMutation.isPending}
                    style={styles.bindEditButton}
                  >
                    {createBindMutation.isPending ? 'Creating...' : 'Save'}
                  </Button>
                </View>
              </View>
            </Card>
          )}

          {/* Add Bind Button (only show when less than 3 binds and not creating) */}
          {binds.length < 3 && !isCreatingBind && (
            <Pressable onPress={handleStartCreateBind}>
              <Card variant="glass" style={styles.addBindCard}>
                <View style={styles.addBindContent}>
                  <Ionicons name="add-circle" size={24} color={colors.accent[500]} />
                  <Text
                    variant="textLg"
                    weight="semibold"
                    style={{ color: colors.text.primary, marginLeft: 8 }}
                  >
                    Add Bind
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        </View>

        {/* 5. ENHANCED MEMORIES SECTION */}
        <View style={styles.section}>
          <View style={styles.memoriesHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="images"
                size={20}
                color={colors.violet[500]}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  letterSpacing: -0.5,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Memories
              </Text>
            </View>
            <View
              style={[styles.memoryCountBadge, { backgroundColor: colors.background.secondary }]}
            >
              <Text variant="textSm" weight="semibold" style={{ color: colors.text.secondary }}>
                {memoriesCount} / {maxMemories}
              </Text>
            </View>
          </View>

          {isLoadingMemories ? (
            <View style={styles.memoriesLoading}>
              <ActivityIndicator size="small" color={colors.accent[500]} />
            </View>
          ) : memories.length === 0 ? (
            <Card variant="glass" style={styles.emptyMemoriesCard}>
              <View style={styles.emptyMemoriesContent}>
                <Ionicons name="image-outline" size={40} color={colors.text.muted} />
                <Text
                  variant="textBase"
                  weight="medium"
                  style={{
                    color: colors.text.secondary,
                    marginTop: 12,
                    textAlign: 'center',
                    lineHeight: 22,
                  }}
                >
                  Add moments during your{'\n'}journey to remember
                </Text>
              </View>
              <Pressable onPress={handleAddMemory} style={styles.addMemoryIconButton}>
                <Ionicons name="add-circle" size={40} color={colors.accent[500]} />
              </Pressable>
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
                  <View style={styles.memoryOverlay}>
                    <Ionicons name="trash" size={16} color="#FFFFFF" />
                  </View>
                </Pressable>
              )}
            />
          )}

          {/* Add Memory Button (only show when memories exist) */}
          {memories.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onPress={handleAddMemory}
              disabled={memoriesCount >= maxMemories || uploadMemoryMutation.isPending}
              style={styles.addMemoryButton}
            >
              {uploadMemoryMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.text.primary} />
                  <Text
                    variant="textBase"
                    weight="semibold"
                    style={[styles.addMemoryText, { color: colors.text.primary }]}
                  >
                    Add Memory
                  </Text>
                </View>
              )}
            </Button>
          )}
        </View>
      </ScrollView>

      {/* Edit Needle Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCloseEditModal}
            disabled={archiveGoalMutation.isPending}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background.secondary }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text variant="textLg" weight="bold" style={{ color: colors.text.primary }}>
                Edit Needle
              </Text>
            </View>

            {/* Name Field */}
            <View style={styles.modalField}>
              <Text
                variant="textSm"
                weight="semibold"
                style={[styles.modalLabel, { color: colors.text.secondary }]}
              >
                NAME
              </Text>
              <TextInput
                value={titleValue}
                onChangeText={setTitleValue}
                autoFocus
                style={[
                  styles.modalInput,
                  {
                    color: colors.text.primary,
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.muted,
                  },
                ]}
                placeholder="Needle name"
                placeholderTextColor={colors.text.muted}
                maxLength={200}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Button
                variant="secondary"
                size="md"
                onPress={handleCloseEditModal}
                style={styles.modalButton}
                disabled={updateGoalMutation.isPending || archiveGoalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onPress={handleSaveNeedleName}
                disabled={updateGoalMutation.isPending || archiveGoalMutation.isPending}
                style={styles.modalButton}
              >
                {updateGoalMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </View>

            {/* Delete Button */}
            <View
              style={[styles.divider, { backgroundColor: colors.border.muted, marginVertical: 24 }]}
            />
            <Button
              variant="secondary"
              size="md"
              onPress={handleDeleteGoal}
              style={[styles.deleteGoalButton, { borderColor: colors.rose[500] }]}
              disabled={archiveGoalMutation.isPending}
            >
              {archiveGoalMutation.isPending ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.rose[500]} />
                  <Text
                    variant="textBase"
                    weight="semibold"
                    style={{ color: colors.rose[500], marginLeft: 12 }}
                  >
                    Deleting...
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trash-outline" size={20} color={colors.rose[500]} />
                  <Text
                    variant="textBase"
                    weight="semibold"
                    style={{ color: colors.rose[500], marginLeft: 8 }}
                  >
                    Delete Needle
                  </Text>
                </View>
              )}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 32,
  },

  // Hero Section
  heroSection: {
    flexDirection: 'row',
    marginTop: 8,
  },
  accentBar: {
    width: 6,
    borderRadius: 3,
    marginRight: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    marginBottom: 8,
  },
  tapToEditHint: {
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  titleInput: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroStatHelper: {
    marginTop: 4,
    opacity: 0.7,
  },
  heroStatDivider: {
    width: 1,
    height: 48,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  // Collapsible Motivation
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  motivationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationContent: {
    overflow: 'hidden',
  },
  motivationCard: {
    padding: 16,
  },
  motivationInput: {
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // Section Titles
  sectionTitle: {
    marginBottom: 16,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Milestones
  milestoneCard: {
    padding: 20,
    marginBottom: 16,
  },
  milestoneContent: {
    gap: 12,
  },
  milestoneProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  // Enhanced Bind Cards
  enhancedBindCard: {
    padding: 20,
    marginBottom: 16,
  },
  enhancedBindContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bindInfoSection: {
    flex: 1,
    gap: 12,
  },
  bindTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressSection: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bindActionsVertical: {
    gap: 8,
    marginLeft: 12,
  },
  bindActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bind Edit
  bindEditContainer: {
    gap: 16,
  },
  bindEditField: {
    gap: 8,
  },
  bindEditLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9CA3AF', // Gray color for better visibility
  },
  bindEditInput: {
    fontSize: 15,
    lineHeight: 22,
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
    color: '#9CA3AF', // Gray color for better visibility
  },
  bindEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  bindEditButton: {
    flex: 1,
  },
  deleteBindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  // Add Bind Card
  addBindCard: {
    padding: 20,
    marginTop: 16,
  },
  addBindContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty States
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyMemoriesCard: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  emptyMemoriesContent: {
    alignItems: 'center',
  },
  addMemoryIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Memories
  memoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memoryCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  addMemoryButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemoryText: {
    marginLeft: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalField: {
    marginBottom: 24,
  },
  modalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalInput: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  divider: {
    height: 1,
  },
  deleteGoalButton: {
    borderWidth: 1,
  },
});
