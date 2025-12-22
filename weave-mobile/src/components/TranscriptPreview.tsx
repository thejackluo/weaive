/**
 * Story 0.11: TranscriptPreview Component
 *
 * Displays and allows editing of transcribed text with confidence indicator
 *
 * Features:
 * - Editable multiline text input
 * - Confidence score indicator (color-coded)
 * - Character count
 * - Provider badge (AssemblyAI, Whisper, Manual)
 * - Save/Cancel actions
 * - Loading state during transcription
 *
 * Usage:
 * ```tsx
 * <TranscriptPreview
 *   transcript="Hello world"
 *   confidence={0.95}
 *   provider="assemblyai"
 *   isLoading={false}
 *   onSave={(editedText) => console.log(editedText)}
 *   onCancel={() => console.log('canceled')}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Button } from '@/design-system/components/Button/Button';
import { Card } from '@/design-system/components/Card/Card';

export interface TranscriptPreviewProps {
  /**
   * Transcribed text
   */
  transcript: string;

  /**
   * Confidence score (0.0-1.0)
   * Used for color-coding the indicator
   */
  confidence: number;

  /**
   * STT provider name
   */
  provider: 'assemblyai' | 'whisper' | 'manual';

  /**
   * Whether transcription is in progress
   * Default: false
   */
  isLoading?: boolean;

  /**
   * Whether text is editable
   * Default: true
   */
  isEditable?: boolean;

  /**
   * Callback when user saves edited text
   */
  onSave?: (editedText: string) => void;

  /**
   * Callback when user cancels editing
   */
  onCancel?: () => void;

  /**
   * Maximum character limit
   * Default: 2000
   */
  maxLength?: number;
}

export function TranscriptPreview({
  transcript,
  confidence,
  provider,
  isLoading = false,
  isEditable = true,
  onSave,
  onCancel,
  maxLength = 2000,
}: TranscriptPreviewProps) {
  const { colors, spacing, radius } = useTheme();

  const [editedText, setEditedText] = useState(transcript);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Update edited text when transcript changes
   */
  useEffect(() => {
    setEditedText(transcript);
    setHasChanges(false);
  }, [transcript]);

  /**
   * Handle text change
   */
  const handleTextChange = (text: string) => {
    setEditedText(text);
    setHasChanges(text !== transcript);
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(editedText);
      setHasChanges(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setEditedText(transcript);
    setHasChanges(false);

    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Get confidence color based on score
   */
  const getConfidenceColor = (): string => {
    if (confidence >= 0.9) return colors.success.default;
    if (confidence >= 0.7) return colors.warning.default;
    return colors.error.default;
  };

  /**
   * Get confidence label
   */
  const getConfidenceLabel = (): string => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  /**
   * Get provider display name
   */
  const getProviderName = (): string => {
    switch (provider) {
      case 'assemblyai':
        return 'AssemblyAI';
      case 'whisper':
        return 'Whisper';
      case 'manual':
        return 'Manual';
      default:
        return provider;
    }
  };

  return (
    <Card variant="glass" style={{ padding: spacing.md }}>
      {/* Header with confidence and provider */}
      <View style={[styles.header, { marginBottom: spacing.sm }]}>
        <View style={styles.headerLeft}>
          {/* Confidence indicator */}
          <View style={styles.confidenceIndicator}>
            <MaterialIcons
              name={confidence >= 0.9 ? 'check-circle' : confidence >= 0.7 ? 'warning' : 'error'}
              size={16}
              color={getConfidenceColor()}
            />
            <Text variant="bodySm" style={{ color: getConfidenceColor(), marginLeft: spacing.xs }}>
              {getConfidenceLabel()} confidence
            </Text>
          </View>

          {/* Provider badge */}
          <View
            style={[
              styles.providerBadge,
              {
                backgroundColor: colors.neutral.tertiary,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                marginLeft: spacing.sm,
              },
            ]}
          >
            <Text variant="bodyXs" style={{ color: colors.text.secondary }}>
              {getProviderName()}
            </Text>
          </View>
        </View>

        {/* Character count */}
        <Text
          variant="bodyXs"
          style={{
            color: editedText.length > maxLength ? colors.error.default : colors.text.secondary,
          }}
        >
          {editedText.length}/{maxLength}
        </Text>
      </View>

      {/* Transcript text */}
      {isLoading ? (
        <View style={[styles.loadingContainer, { paddingVertical: spacing.xl }]}>
          <ActivityIndicator size="large" color={colors.brand.primary.default} />
          <Text variant="bodyMd" style={{ color: colors.text.secondary, marginTop: spacing.md }}>
            Transcribing audio...
          </Text>
        </View>
      ) : (
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.neutral.border,
              borderRadius: radius.md,
              color: colors.text.primary,
              padding: spacing.md,
              minHeight: 120,
            },
          ]}
          value={editedText}
          onChangeText={handleTextChange}
          placeholder="Transcript will appear here..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          editable={isEditable}
          maxLength={maxLength}
        />
      )}

      {/* Action buttons */}
      {isEditable && hasChanges && !isLoading && (
        <View style={[styles.actions, { marginTop: spacing.md, gap: spacing.sm }]}>
          <Button variant="secondary" size="sm" onPress={handleCancel} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={handleSave} style={{ flex: 1 }}>
            Save
          </Button>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerBadge: {
    alignSelf: 'flex-start',
  },
  textInput: {
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
});
