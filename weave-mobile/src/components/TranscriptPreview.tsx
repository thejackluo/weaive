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
import { View, TextInput, StyleSheet, ActivityIndicator, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
    if (confidence >= 0.9) return '#10b981';
    if (confidence >= 0.7) return '#f59e0b';
    return '#ef4444';
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
    <View style={[styles.card, { padding: 16 }]}>
      {/* Header with confidence and provider */}
      <View style={[styles.header, { marginBottom: 12 }]}>
        <View style={styles.headerLeft}>
          {/* Confidence indicator */}
          <View style={styles.confidenceIndicator}>
            <MaterialIcons
              name={confidence >= 0.9 ? 'check-circle' : confidence >= 0.7 ? 'warning' : 'error'}
              size={16}
              color={getConfidenceColor()}
            />
            <Text style={{ fontSize: 14, color: getConfidenceColor(), marginLeft: 8 }}>
              {getConfidenceLabel()} confidence
            </Text>
          </View>

          {/* Provider badge */}
          <View
            style={[
              styles.providerBadge,
              {
                backgroundColor: '#3f3f46',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 4,
                marginLeft: 12,
              },
            ]}
          >
            <Text style={{ fontSize: 12, color: '#a1a1aa' }}>
              {getProviderName()}
            </Text>
          </View>
        </View>

        {/* Character count */}
        <Text
          style={{
            fontSize: 12,
            color: editedText.length > maxLength ? '#ef4444' : '#a1a1aa',
          }}
        >
          {editedText.length}/{maxLength}
        </Text>
      </View>

      {/* Transcript text */}
      {isLoading ? (
        <View style={[styles.loadingContainer, { paddingVertical: 32 }]}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, color: '#a1a1aa', marginTop: 16 }}>
            Transcribing audio...
          </Text>
        </View>
      ) : (
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: '#27272a',
              borderRadius: 8,
              color: '#fafafa',
              padding: 16,
              minHeight: 120,
            },
          ]}
          value={editedText}
          onChangeText={handleTextChange}
          placeholder="Transcript will appear here..."
          placeholderTextColor="#a1a1aa"
          multiline
          editable={isEditable}
          maxLength={maxLength}
        />
      )}

      {/* Action buttons */}
      {isEditable && hasChanges && !isLoading && (
        <View style={[styles.actions, { marginTop: 16, gap: 12 }]}>
          <Pressable
            onPress={handleCancel}
            style={[styles.button, { flex: 1, backgroundColor: '#27272a' }]}
          >
            <Text style={{ fontSize: 14, color: '#fafafa', fontWeight: '600' }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[styles.button, { flex: 1, backgroundColor: '#3b82f6' }]}
          >
            <Text style={{ fontSize: 14, color: '#ffffff', fontWeight: '600' }}>
              Save
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
