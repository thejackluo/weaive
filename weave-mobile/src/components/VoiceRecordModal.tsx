/**
 * Story 0.11: VoiceRecordModal Component
 *
 * Alternative to VoiceRecordSheet using React Native Modal instead of @gorhom/bottom-sheet
 * This avoids React 19 + Reanimated incompatibility issues
 *
 * Complete voice recording workflow in a modal:
 * 1. Record audio with VoiceRecorder
 * 2. Transcribe with STT provider
 * 3. Preview/edit transcript
 * 4. Save and return result
 *
 * Features:
 * - Full-screen modal with smooth animations
 * - 4-step workflow with visual progress
 * - Editable AI transcription
 * - Audio playback controls
 * - Error handling and retry logic
 *
 * Usage:
 * ```tsx
 * const [modalVisible, setModalVisible] = useState(false);
 *
 * <VoiceRecordModal
 *   visible={modalVisible}
 *   onClose={() => setModalVisible(false)}
 *   onSave={(transcript, audioUri) => {
 *     console.log({ transcript, audioUri });
 *     setModalVisible(false);
 *   }}
 *   maxDuration={300}
 *   language="en"
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Button } from '@/design-system/components/Button/Button';
import { Card } from '@/design-system/components/Card/Card';
import { VoiceRecorder } from './VoiceRecorder';
import { AudioWaveform } from './AudioWaveform';
import { TranscriptPreview } from './TranscriptPreview';
import { AudioPlayer } from './AudioPlayer';
import { RecordingResult } from '@/services/audioRecording';
import { transcribeAudio, TranscriptionResult } from '@/services/sttService';

export interface VoiceRecordModalProps {
  /**
   * Whether modal is visible
   */
  visible: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Callback when user saves the recording
   * Returns transcript and audio URI
   */
  onSave: (transcript: string, audioUri: string) => void;

  /**
   * Maximum recording duration in seconds
   * Default: 300 (5 minutes)
   */
  maxDuration?: number;

  /**
   * Language code for transcription
   * Default: 'en'
   */
  language?: string;
}

type WorkflowStep = 'record' | 'transcribing' | 'preview' | 'complete';

export function VoiceRecordModal({
  visible,
  onClose,
  onSave,
  maxDuration = 300,
  language: _language = 'en',
}: VoiceRecordModalProps) {
  const { colors, spacing, radius } = useTheme();

  // Workflow state
  const [step, setStep] = useState<WorkflowStep>('record');
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [transcriptConfidence, setTranscriptConfidence] = useState(0.0);
  const [transcriptProvider, setTranscriptProvider] = useState<'assemblyai' | 'whisper' | 'manual'>(
    'assemblyai'
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  /**
   * Reset modal state when closed
   */
  const handleClose = useCallback(() => {
    setStep('record');
    setRecordingResult(null);
    setTranscript('');
    setTranscriptConfidence(0.0);
    setIsTranscribing(false);
    setTranscriptionError(null);
    onClose();
  }, [onClose]);

  /**
   * Step 1: Recording completed
   */
  const handleRecordingComplete = useCallback(
    async (result: RecordingResult) => {
      console.log('[VOICE_MODAL] ✅ Recording complete:', result);
      setRecordingResult(result);

      // Move to transcribing step
      setStep('transcribing');
      setIsTranscribing(true);
      setTranscriptionProgress(0);
      setTranscriptionError(null);

      try {
        // Simulate initial progress to show activity
        setTranscriptionProgress(5);

        // Call real STT API
        const transcriptionResult: TranscriptionResult = await transcribeAudio({
          audioUri: result.uri,
          language: _language,
          onProgress: (progress) => {
            // Map upload progress (0-1) to UI progress (5-90%)
            // Reserve 0-5% for initial state and 90-100% for processing
            const uiProgress = 5 + Math.round(progress * 85);
            setTranscriptionProgress(uiProgress);
          },
        });

        console.log('[VOICE_MODAL] ✅ Transcription success:', transcriptionResult);

        // Show final processing step
        setTranscriptionProgress(100);

        // Small delay to show 100% completion before transitioning
        await new Promise((resolve) => setTimeout(resolve, 300));

        setTranscript(transcriptionResult.transcript);
        setTranscriptConfidence(transcriptionResult.confidence);
        setTranscriptProvider(transcriptionResult.provider);
        setIsTranscribing(false);
        setStep('preview');
      } catch (err: any) {
        console.error('[VOICE_MODAL] ❌ Transcription error:', err);

        // Provide user-friendly error messages
        let errorMessage = 'Failed to transcribe audio';

        if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'No internet connection. Recording saved locally.';
        } else if (err.code === 'UPLOAD_TIMEOUT') {
          errorMessage = 'Upload timed out. Please check your connection and try again.';
        } else if (err.code === 'STT_RATE_LIMIT_EXCEEDED') {
          errorMessage = err.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setTranscriptionError(errorMessage);
        setIsTranscribing(false);
        setStep('preview'); // Show preview anyway with error message
      }
    },
    [_language]
  );

  /**
   * Step 3: User saves edited transcript
   */
  const handleSaveTranscript = useCallback(
    (editedTranscript: string) => {
      console.log('[VOICE_MODAL] ✅ Saving transcript:', editedTranscript);

      if (!recordingResult) {
        Alert.alert('Error', 'No recording found');
        return;
      }

      onSave(editedTranscript, recordingResult.uri);
      setStep('complete');

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    },
    [recordingResult, onSave, handleClose]
  );

  /**
   * Retry transcription
   */
  const handleRetryTranscription = useCallback(() => {
    if (recordingResult) {
      handleRecordingComplete(recordingResult);
    }
  }, [recordingResult, handleRecordingComplete]);

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => {
    const steps = [
      { key: 'record', label: 'Record' },
      { key: 'transcribing', label: 'Transcribe' },
      { key: 'preview', label: 'Preview' },
      { key: 'complete', label: 'Complete' },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    return (
      <View style={[styles.stepIndicator, { marginBottom: spacing[6] }]}>
        {steps.map((s, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;

          return (
            <View key={s.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isComplete
                      ? colors.accent[500]
                      : isActive
                        ? colors.accent[500]
                        : colors.neutral[700],
                    borderRadius: radius.full,
                  },
                ]}
              >
                {isComplete ? (
                  <MaterialIcons name="check" size={16} color={colors.text.inverse} />
                ) : (
                  <Text variant="textSm" style={{ color: colors.text.inverse }}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                variant="textXs"
                style={{
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  marginTop: spacing[2],
                }}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * Render content based on current step
   */
  const renderContent = () => {
    switch (step) {
      case 'record':
        return (
          <View style={styles.stepContent}>
            <Text variant="displayMd" style={{ marginBottom: spacing[6], textAlign: 'center' }}>
              Record Audio
            </Text>
            <Text
              variant="textBase"
              style={{
                color: colors.text.secondary,
                marginBottom: spacing[8],
                textAlign: 'center',
              }}
            >
              Tap the microphone to start recording
            </Text>
            <View style={styles.centerContent}>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={maxDuration}
                size={120}
              />
            </View>
          </View>
        );

      case 'transcribing':
        return (
          <View style={styles.stepContent}>
            <Text variant="displayMd" style={{ marginBottom: spacing[6], textAlign: 'center' }}>
              {transcriptionProgress < 100 ? 'Uploading...' : 'Transcribing...'}
            </Text>
            <Text
              variant="textBase"
              style={{
                color: colors.text.secondary,
                marginBottom: spacing[8],
                textAlign: 'center',
              }}
            >
              {transcriptionProgress < 100
                ? `Uploading audio ${transcriptionProgress}%`
                : 'Converting your audio to text'}
            </Text>

            {recordingResult && (
              <Card variant="glass" style={{ padding: spacing[4], marginBottom: spacing[6] }}>
                <AudioWaveform
                  meteringData={recordingResult.meteringData}
                  isLive={false}
                  barCount={30}
                  height={80}
                />
              </Card>
            )}

            <View style={styles.centerContent}>
              <MaterialIcons
                name="sync"
                size={48}
                color={colors.accent[500]}
                style={{ opacity: 0.6 }}
              />
              {transcriptionProgress > 0 && transcriptionProgress < 100 && (
                <Text
                  variant="textSm"
                  style={{ color: colors.text.secondary, marginTop: spacing[3] }}
                >
                  {transcriptionProgress}%
                </Text>
              )}
            </View>
          </View>
        );

      case 'preview':
        return (
          <View style={styles.stepContent}>
            <Text variant="displayMd" style={{ marginBottom: spacing[6], textAlign: 'center' }}>
              Review Transcript
            </Text>
            <Text
              variant="textBase"
              style={{
                color: colors.text.secondary,
                marginBottom: spacing[6],
                textAlign: 'center',
              }}
            >
              Edit if needed, then save
            </Text>

            {transcriptionError ? (
              <Card variant="outlined" style={{ padding: spacing[4], marginBottom: spacing[6] }}>
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={32} color={colors.text.error} />
                  <Text
                    variant="textBase"
                    style={{ color: colors.text.error, marginTop: spacing[3], textAlign: 'center' }}
                  >
                    {transcriptionError}
                  </Text>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={handleRetryTranscription}
                    style={{ marginTop: spacing[4] }}
                  >
                    Retry Transcription
                  </Button>
                </View>
              </Card>
            ) : (
              <>
                <TranscriptPreview
                  transcript={transcript}
                  confidence={transcriptConfidence}
                  provider={transcriptProvider}
                  isLoading={isTranscribing}
                  onSave={handleSaveTranscript}
                />

                {/* Continue button - save without editing */}
                {transcript && !isTranscribing && (
                  <Button
                    variant="primary"
                    size="md"
                    onPress={() => handleSaveTranscript(transcript)}
                    style={{ marginTop: spacing[4] }}
                  >
                    Continue
                  </Button>
                )}
              </>
            )}

            {recordingResult && !isTranscribing && (
              <Card variant="glass" style={{ padding: spacing[4], marginTop: spacing[6] }}>
                <Text
                  variant="textBase"
                  style={{
                    fontWeight: '600',
                    marginBottom: spacing[3],
                    color: colors.text.primary,
                  }}
                >
                  Audio Playback
                </Text>
                <AudioPlayer audioUri={recordingResult.uri} />
              </Card>
            )}
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContent}>
            <View style={styles.centerContent}>
              <View
                style={[
                  styles.successCircle,
                  {
                    backgroundColor: colors.accent[500],
                    borderRadius: radius.full,
                    marginBottom: spacing[6],
                  },
                ]}
              >
                <MaterialIcons name="check" size={64} color={colors.text.inverse} />
              </View>
              <Text variant="displayMd" style={{ marginBottom: spacing[4], textAlign: 'center' }}>
                Saved!
              </Text>
              <Text
                variant="textBase"
                style={{ color: colors.text.secondary, textAlign: 'center' }}
              >
                Your recording has been saved
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing[6],
              paddingVertical: spacing[4],
              borderBottomWidth: 1,
              borderBottomColor: colors.border.muted,
            },
          ]}
        >
          <Text variant="textLg" style={{ fontWeight: '600', color: colors.text.primary }}>
            Voice Recording
          </Text>
          <Button variant="ghost" size="sm" onPress={handleClose}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </Button>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { padding: spacing[6] }]}
        >
          {renderStepIndicator()}
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  successCircle: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
