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
import { View, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
        // Call real STT API
        const transcriptionResult: TranscriptionResult = await transcribeAudio({
          audioUri: result.uri,
          language: _language,
          onProgress: (progress) => {
            // Update upload progress (0-100%)
            setTranscriptionProgress(Math.round(progress * 100));
          },
        });

        console.log('[VOICE_MODAL] ✅ Transcription success:', transcriptionResult);

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
      <View style={[styles.stepIndicator, { marginBottom: 24 }]}>
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
                      ? '#3b82f6'
                      : isActive
                        ? '#3b82f6'
                        : '#3f3f46',
                    borderRadius: 9999,
                  },
                ]}
              >
                {isComplete ? (
                  <MaterialIcons name="check" size={16} color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 14, color: '#ffffff' }}>
                    {index + 1}
                  </RNText>
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: isActive ? '#fafafa' : '#a1a1aa',
                  marginTop: 8,
                }}
              >
                {s.label}
              </RNText>
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
            <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 24, textAlign: 'center' }}>
              Record Audio
            </RNText>
            <Text
              style={{
                fontSize: 16,
                color: '#a1a1aa',
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              Tap the microphone to start recording
            </RNText>
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
            <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 24, textAlign: 'center' }}>
              {transcriptionProgress < 100 ? 'Uploading...' : 'Transcribing...'}
            </RNText>
            <Text
              style={{
                fontSize: 16,
                color: '#a1a1aa',
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              {transcriptionProgress < 100
                ? `Uploading audio ${transcriptionProgress}%`
                : 'Converting your audio to text'}
            </RNText>

            {recordingResult && (
              <View style={[styles.card, { padding: 16, marginBottom: 24 }]}>
                <AudioWaveform
                  meteringData={recordingResult.meteringData}
                  isLive={false}
                  barCount={30}
                  height={80}
                />
              </View>
            )}

            <View style={styles.centerContent}>
              <MaterialIcons
                name="sync"
                size={48}
                color="#3b82f6"
                style={{ opacity: 0.6 }}
              />
              {transcriptionProgress > 0 && transcriptionProgress < 100 && (
                <Text
                  style={{ fontSize: 14, color: '#a1a1aa', marginTop: 12 }}
                >
                  {transcriptionProgress}%
                </RNText>
              )}
            </View>
          </View>
        );

      case 'preview':
        return (
          <View style={styles.stepContent}>
            <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 24, textAlign: 'center' }}>
              Review Transcript
            </RNText>
            <Text
              style={{
                fontSize: 16,
                color: '#a1a1aa',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Edit if needed, then save
            </RNText>

            {transcriptionError ? (
              <View style={[styles.card, { padding: 16, marginBottom: 24 }]}>
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={32} color="#ef4444" />
                  <Text
                    style={{ fontSize: 16, color: '#ef4444', marginTop: 12, textAlign: 'center' }}
                  >
                    {transcriptionError}
                  </RNText>
                  <Pressable
                    onPress={handleRetryTranscription}
                    style={[styles.button, { marginTop: 16, backgroundColor: '#27272a' }]}
                  >
                    <Text style={{ fontSize: 14, color: '#fafafa', fontWeight: '600' }}>
                      Retry Transcription
                    </RNText>
                  </Pressable>
                </View>
              </View>
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
                  <Pressable
                    onPress={() => handleSaveTranscript(transcript)}
                    style={[styles.button, { marginTop: 16, backgroundColor: '#3b82f6' }]}
                  >
                    <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '600' }}>
                      Continue
                    </RNText>
                  </Pressable>
                )}
              </>
            )}

            {recordingResult && !isTranscribing && (
              <View style={[styles.card, { padding: 16, marginTop: 24 }]}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 12,
                    color: '#fafafa',
                  }}
                >
                  Audio Playback
                </RNText>
                <AudioPlayer audioUri={recordingResult.uri} />
              </View>
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
                    backgroundColor: '#3b82f6',
                    borderRadius: 9999,
                    marginBottom: 24,
                  },
                ]}
              >
                <MaterialIcons name="check" size={64} color="#ffffff" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
                Saved!
              </RNText>
              <Text
                style={{ fontSize: 16, color: '#a1a1aa', textAlign: 'center' }}
              >
                Your recording has been saved
              </RNText>
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
      <SafeAreaView style={[styles.container, { backgroundColor: '#0a0a0a' }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#27272a',
            },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fafafa' }}>
            Voice Recording
          </RNText>
          <Pressable onPress={handleClose} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={24} color="#fafafa" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { padding: 24 }]}
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
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  button: {
    paddingVertical: 12,
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
