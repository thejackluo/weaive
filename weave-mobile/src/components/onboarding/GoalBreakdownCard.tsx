/**
 * Goal Breakdown Card Component (Story 1.8a - Task 3)
 *
 * Displays AI-generated goal title and summary with inline editing capability.
 * Features:
 * - Liquid-glass card aesthetic
 * - Fade + upward drift animation on mount
 * - Inline edit mode with Save/Cancel
 * - Visual indicator for edited content
 * - Accessibility support
 *
 * Design Pattern: Reuses liquid-glass aesthetic from Story 1.6
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
    edited: 'rgba(255, 235, 59, 0.1)', // Subtle yellow tint for edited content
  },
  border: {
    card: 'rgba(255, 255, 255, 0.2)',
    default: '#E0E0E0',
  },
  shadow: '#000',
} as const;

const FONT_SIZE = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
} as const;

const SPACING = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

// Animation timing
const FADE_DURATION = 400;
const DRIFT_DISTANCE = 20;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GoalBreakdownCardProps {
  /**
   * AI-generated goal title
   */
  title: string;

  /**
   * AI-generated goal summary (2-4 sentences)
   */
  summary: string;

  /**
   * Whether content has been edited by user
   */
  isEdited?: boolean;

  /**
   * Whether to disable animations (reduced motion)
   */
  reducedMotionEnabled?: boolean;

  /**
   * Callback when user saves edited content
   */
  onSave?: (title: string, summary: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GoalBreakdownCard: React.FC<GoalBreakdownCardProps> = ({
  title,
  summary,
  isEdited = false,
  reducedMotionEnabled = false,
  onSave,
}) => {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedSummary, setEditedSummary] = useState(summary);
  const [hasBeenEdited, setHasBeenEdited] = useState(isEdited);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const driftAnim = useRef(new Animated.Value(DRIFT_DISTANCE)).current;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (reducedMotionEnabled) {
      // Simple fade-in only
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade + upward drift
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [reducedMotionEnabled, fadeAnim, driftAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Enter edit mode
   */
  const handleEdit = () => {
    setEditedTitle(title);
    setEditedSummary(summary);
    setIsEditMode(true);
  };

  /**
   * Save edited content
   */
  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    const trimmedSummary = editedSummary.trim();

    if (trimmedTitle && trimmedSummary) {
      setHasBeenEdited(true);
      setIsEditMode(false);
      if (onSave) {
        onSave(trimmedTitle, trimmedSummary);
      }
    }
  };

  /**
   * Cancel editing and revert to original content
   */
  const handleCancel = () => {
    setEditedTitle(title);
    setEditedSummary(summary);
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
          transform: [{ translateY: reducedMotionEnabled ? 0 : driftAnim }],
        },
      ]}
    >
      {/* Header with Edit Button */}
      <View style={styles.header}>
        {hasBeenEdited && !isEditMode && (
          <View style={styles.editedBadge}>
            <Text style={styles.editedBadgeText}>Edited</Text>
          </View>
        )}
        {!isEditMode && (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel="Edit goal"
            accessibilityHint="Opens edit mode for goal title and summary"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode */}
      {!isEditMode ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </>
      ) : (
        /* Edit Mode */
        <>
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            placeholder="Goal title"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.titleInput}
            accessibilityLabel="Edit goal title"
            maxLength={100}
            multiline
          />
          <TextInput
            value={editedSummary}
            onChangeText={setEditedSummary}
            placeholder="Goal summary"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.summaryInput}
            accessibilityLabel="Edit goal summary"
            maxLength={300}
            multiline
            numberOfLines={4}
          />

          {/* Edit Actions */}
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.actionButton, styles.cancelButton]}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionButton, styles.saveButton]}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
            >
              <Text style={styles.saveButtonText}>Save</Text>
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
    borderRadius: 24,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: COLORS.border.card,
  },
  cardEdited: {
    backgroundColor: COLORS.background.edited,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  editedBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  summary: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
    color: COLORS.text.secondary,
    opacity: 0.9,
    lineHeight: 24,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.input,
    marginBottom: SPACING.md,
    minHeight: 50,
  },
  summaryInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.input,
    marginBottom: SPACING.md,
    minHeight: 100,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minWidth: 80,
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
