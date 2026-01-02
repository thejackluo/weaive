/**
 * Yesterday's Intention Card Component
 *
 * Shows the user's intention from yesterday's journal (tomorrow_focus field)
 * Two states:
 * 1. Intention exists: Display it prominently with edit icon
 * 2. No intention: Show quick-input field to set today's focus
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Card, Text, Input, Button } from '@/design-system';
import { useYesterdayIntention } from '@/hooks/useJournal';

interface YesterdayIntentionCardProps {
  onQuickIntention?: (intention: string) => void;
}

export function YesterdayIntentionCard({ onQuickIntention }: YesterdayIntentionCardProps) {
  const { colors, spacing } = useTheme();
  const { data, isLoading, isError, refetch } = useYesterdayIntention();
  const [quickIntention, setQuickIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntention, setEditedIntention] = useState('');
  const editInputRef = useRef<TextInput>(null);
  const quickInputRef = useRef<TextInput>(null);

  const handleSubmitQuickIntention = async () => {
    console.log('[YesterdayIntention] handleSubmitQuickIntention called', { quickIntention });
    if (!quickIntention.trim() || !onQuickIntention) {
      console.log('[YesterdayIntention] Skipping submit - empty or no handler');
      return;
    }

    console.log('[YesterdayIntention] Submitting quick intention...');
    setIsSubmitting(true);
    try {
      await onQuickIntention(quickIntention.trim());
      console.log('[YesterdayIntention] Quick intention saved successfully');
      setQuickIntention(''); // Clear input after successful submit
      // Refetch to update UI
      await refetch();
      console.log('[YesterdayIntention] Refetch complete');
    } catch (error) {
      console.error('[YesterdayIntention] Failed to save quick intention:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    console.log('[YesterdayIntention] Edit clicked, entering edit mode');
    setEditedIntention(data?.intention || '');
    setIsEditing(true);
  };

  // Handle saving via explicit Done button (better UX than auto-save on blur)
  const handleSaveEdit = async () => {
    console.log('[YesterdayIntention] Save button clicked', {
      editedIntention,
      originalIntention: data?.intention,
      hasChanged: editedIntention.trim() !== data?.intention,
    });

    // Only save if text changed and not empty
    const trimmed = editedIntention.trim();
    if (trimmed && trimmed !== data?.intention && onQuickIntention) {
      console.log('[YesterdayIntention] Saving edited intention...');
      setIsSubmitting(true);
      try {
        await onQuickIntention(trimmed);
        console.log('[YesterdayIntention] Save successful, refetching...');
        // Refetch to update UI
        await refetch();
        console.log('[YesterdayIntention] Refetch complete - exiting edit mode');
        // Exit edit mode on success
        setIsEditing(false);
        setEditedIntention('');
      } catch (error) {
        console.error('[YesterdayIntention] Failed to update intention:', error);
        // Stay in edit mode on error so user can retry
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('[YesterdayIntention] No changes to save - exiting edit mode');
      // No changes - just exit edit mode
      setIsEditing(false);
      setEditedIntention('');
    }
  };

  // Handle cancel
  const handleCancelEdit = () => {
    console.log('[YesterdayIntention] Cancel clicked');
    setIsEditing(false);
    setEditedIntention('');
  };

  // Note: We use onBlur instead of keyboard listener for edit mode
  // to prevent instant dismissal on focus. Keyboard listener is only
  // used for quick input mode below.

  // Listen for keyboard dismiss to trigger save (for quick input mode)
  useEffect(() => {
    if (hasIntention || !quickIntention.trim()) return;

    console.log('[YesterdayIntention] Setting up keyboard listener for quick input mode');
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', async () => {
      console.log('[YesterdayIntention] Keyboard dismissed in quick input mode, saving...');
      if (quickIntention.trim()) {
        await handleSubmitQuickIntention();
      }
    });

    return () => {
      console.log('[YesterdayIntention] Removing keyboard listener for quick input mode');
      keyboardDidHideListener.remove();
    };
  }, [hasIntention, quickIntention]);

  // Loading state
  if (isLoading) {
    return (
      <Card variant="default" style={[styles.card, { padding: spacing[4] }]}>
        <ActivityIndicator size="small" color={colors.text.secondary} />
      </Card>
    );
  }

  // Error state - don't show card
  if (isError) {
    return null;
  }

  const hasIntention = data?.intention && data.intention.trim().length > 0;

  // Wrap entire card in TouchableWithoutFeedback to dismiss keyboard when tapping outside
  const cardContent = (
    <Card
      variant={hasIntention ? 'default' : 'outline'}
      style={[
        styles.card,
        {
          padding: spacing[4],
          borderStyle: hasIntention ? 'solid' : 'dashed',
        },
      ]}
    >
      {/* Header with Edit Icon */}
      <View style={[styles.header, { marginBottom: spacing[2] }]}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: hasIntention ? colors.semantic.success.base : colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            flex: 1,
          }}
        >
          {hasIntention ? "🎯 Today's Focus" : '💭 Set Today\'s Focus'}
        </Text>
        {hasIntention && !isEditing && (
          <Pressable onPress={handleEditClick} hitSlop={8}>
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* State 1: Intention exists - Display Mode */}
      {hasIntention && !isEditing && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: colors.text.primary,
            lineHeight: 22,
          }}
        >
          {data.intention}
        </Text>
      )}

      {/* State 1b: Intention exists - Edit Mode */}
      {hasIntention && isEditing && (
        <View>
          <Input
            ref={editInputRef}
            value={editedIntention}
            onChangeText={setEditedIntention}
            returnKeyType="done"
            editable={!isSubmitting}
            autoFocus
            multiline
            style={{
              fontSize: 16,
              color: colors.text.primary,
              lineHeight: 22,
              textAlignVertical: 'center',
              paddingVertical: spacing[2],
              marginBottom: spacing[3],
            }}
          />
          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <Button
              variant="secondary"
              size="sm"
              onPress={handleCancelEdit}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={handleSaveEdit}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </View>
        </View>
      )}

      {/* State 2: No intention - quick input */}
      {!hasIntention && (
        <View>
          <Text
            style={{
              fontSize: 14,
              color: colors.text.secondary,
              marginBottom: spacing[3],
            }}
          >
            Set your intention for the day.
          </Text>
          <Input
            ref={quickInputRef}
            placeholder="e.g., Finish design mockups, go to gym..."
            value={quickIntention}
            onChangeText={setQuickIntention}
            returnKeyType="done"
            editable={!isSubmitting}
            multiline
            style={{
              fontSize: 16,
              color: colors.text.primary,
              lineHeight: 22,
              textAlignVertical: 'center',
              paddingVertical: spacing[2],
            }}
          />
          {isSubmitting && (
            <Text
              style={{
                fontSize: 12,
                color: colors.text.muted,
                marginTop: spacing[1],
                fontStyle: 'italic',
              }}
            >
              Saving...
            </Text>
          )}
        </View>
      )}
    </Card>
  );

  // Wrap in TouchableWithoutFeedback to dismiss keyboard on outside tap
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log('[YesterdayIntention] TouchableWithoutFeedback pressed, dismissing keyboard');
        Keyboard.dismiss();
      }}
    >
      <View>{cardContent}</View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
