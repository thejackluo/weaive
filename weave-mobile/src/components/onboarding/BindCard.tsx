/**
 * Bind Card Component (Story 1.8a - Task 5)
 *
 * Displays a single bind (action/habit) in the goal breakdown.
 * Features:
 * - Checkmark icon for actionability
 * - Bind name, description, and optional frequency
 * - Liquid-glass card aesthetic
 * - Staggered animation (appears after milestones)
 * - Inline edit capability
 * - Accessibility support
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4CAF50',
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
  },
  background: {
    card: 'rgba(255, 255, 255, 0.8)',
    input: '#FAFAFA',
    edited: 'rgba(255, 235, 59, 0.1)',
  },
  border: {
    card: 'rgba(255, 255, 255, 0.2)',
    default: '#E0E0E0',
  },
  shadow: '#000',
  action: '#4CAF50',
} as const;

const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
} as const;

// Animation timing
const FADE_DURATION = 300;
const STAGGER_DELAY = 100;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BindCardProps {
  /**
   * Bind name (action title)
   */
  name: string;

  /**
   * Bind description (1-2 sentences)
   */
  description: string;

  /**
   * Optional frequency indicator (e.g., "Daily", "3x/week")
   */
  frequency?: string;

  /**
   * Whether content has been edited by user
   */
  isEdited?: boolean;

  /**
   * Animation delay index (for staggered animation)
   */
  delayIndex?: number;

  /**
   * Whether to disable animations (reduced motion)
   */
  reducedMotionEnabled?: boolean;

  /**
   * Callback when user saves edited content
   */
  onSave?: (name: string, description: string, frequency?: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BindCard: React.FC<BindCardProps> = ({
  name,
  description,
  frequency,
  isEdited = false,
  delayIndex = 0,
  reducedMotionEnabled = false,
  onSave,
}) => {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedFrequency, setEditedFrequency] = useState(frequency || '');
  const [hasBeenEdited, setHasBeenEdited] = useState(isEdited);

  // Animation value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Staggered animation based on delayIndex
    const delay = reducedMotionEnabled ? 0 : delayIndex * STAGGER_DELAY;

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }, delay);
  }, [delayIndex, reducedMotionEnabled, fadeAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    setEditedName(name);
    setEditedDescription(description);
    setEditedFrequency(frequency || '');
    setIsEditMode(true);
  };

  const handleSave = () => {
    const trimmedName = editedName.trim();
    const trimmedDescription = editedDescription.trim();
    const trimmedFrequency = editedFrequency.trim();

    if (trimmedName && trimmedDescription) {
      setHasBeenEdited(true);
      setIsEditMode(false);
      if (onSave) {
        onSave(trimmedName, trimmedDescription, trimmedFrequency || undefined);
      }
    }
  };

  const handleCancel = () => {
    setEditedName(name);
    setEditedDescription(description);
    setEditedFrequency(frequency || '');
    setIsEditMode(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Animated.View
      style={[
        styles.card,
        hasBeenEdited && styles.cardEdited,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Header with Checkmark and Edit Button */}
      <View style={styles.header}>
        <View style={styles.checkmarkBadge}>
          <Text style={styles.checkmarkText}>✓</RNText>
        </View>
        {hasBeenEdited && !isEditMode && (
          <View style={styles.editedBadge}>
            <Text style={styles.editedBadgeText}>Edited</RNText>
          </View>
        )}
        {!isEditMode && (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel="Edit bind"
          >
            <Text style={styles.editButtonText}>Edit</RNText>
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode */}
      {!isEditMode ? (
        <>
          <Text style={styles.name}>{name}</RNText>
          <Text style={styles.description}>{description}</RNText>
          {frequency && (
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{frequency}</RNText>
            </View>
          )}
        </>
      ) : (
        /* Edit Mode */
        <>
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Bind name"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.nameInput}
            accessibilityLabel="Edit bind name"
            maxLength={60}
          />
          <TextInput
            value={editedDescription}
            onChangeText={setEditedDescription}
            placeholder="Bind description"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.descriptionInput}
            accessibilityLabel="Edit bind description"
            maxLength={150}
            multiline
          />
          <TextInput
            value={editedFrequency}
            onChangeText={setEditedFrequency}
            placeholder='Optional frequency (e.g., "Daily", "3x/week")'
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.frequencyInput}
            accessibilityLabel="Edit bind frequency"
            maxLength={30}
          />

          {/* Edit Actions */}
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.actionButton, styles.cancelButton]}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.cancelButtonText}>Cancel</RNText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionButton, styles.saveButton]}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
            >
              <Text style={styles.saveButtonText}>Save</RNText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: COLORS.border.card,
  },
  cardEdited: {
    backgroundColor: COLORS.background.edited,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  checkmarkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.action,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editedBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  editedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginLeft: 'auto',
  },
  editButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  description: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  frequencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  frequencyText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.action,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.input,
    marginBottom: SPACING.sm,
    minHeight: 44,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.input,
    marginBottom: SPACING.sm,
    minHeight: 60,
  },
  frequencyInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.input,
    marginBottom: SPACING.md,
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background.input,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
