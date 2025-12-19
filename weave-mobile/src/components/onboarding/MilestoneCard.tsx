/**
 * Milestone Card Component (Story 1.8a - Task 4)
 *
 * Displays a single milestone in the goal breakdown with sequential numbering.
 * Features:
 * - Numbered presentation (1, 2, 3)
 * - Liquid-glass card aesthetic
 * - Staggered animation (100ms delay per card)
 * - Inline edit capability
 * - Accessibility support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

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
} as const;

const FONT_SIZE = {
  sm: 14,
  md: 16,
  lg: 18,
} as const;

const SPACING = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

// Animation timing
const FADE_DURATION = 300;
const STAGGER_DELAY = 100; // Delay between cards

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface MilestoneCardProps {
  /**
   * Milestone sequential number (1, 2, 3)
   */
  number: number;

  /**
   * Milestone title
   */
  title: string;

  /**
   * Optional milestone description
   */
  description?: string;

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
  onSave?: (title: string, description?: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  number,
  title,
  description,
  isEdited = false,
  delayIndex = 0,
  reducedMotionEnabled = false,
  onSave,
}) => {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || '');
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
    setEditedTitle(title);
    setEditedDescription(description || '');
    setIsEditMode(true);
  };

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    const trimmedDescription = editedDescription.trim();

    if (trimmedTitle) {
      setHasBeenEdited(true);
      setIsEditMode(false);
      if (onSave) {
        onSave(trimmedTitle, trimmedDescription || undefined);
      }
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description || '');
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
      {/* Header with Number and Edit Button */}
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
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
            accessibilityLabel={`Edit milestone ${number}`}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode */}
      {!isEditMode ? (
        <>
          <Text style={[styles.title, description && { marginBottom: SPACING.sm }]}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </>
      ) : (
        /* Edit Mode */
        <>
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            placeholder="Milestone title"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.titleInput}
            accessibilityLabel={`Edit milestone ${number} title`}
            maxLength={80}
          />
          <TextInput
            value={editedDescription}
            onChangeText={setEditedDescription}
            placeholder="Optional description"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.descriptionInput}
            accessibilityLabel={`Edit milestone ${number} description`}
            maxLength={150}
            multiline
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
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: FONT_SIZE.sm,
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
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
    color: COLORS.text.tertiary,
    lineHeight: 20,
  },
  titleInput: {
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
    marginBottom: SPACING.md,
    minHeight: 60,
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
