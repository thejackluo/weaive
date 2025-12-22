/**
 * Story 0.11: VoiceRecordSheet Component
 *
 * Bottom sheet container for voice recording workflow
 *
 * Workflow:
 * 1. Record audio (VoiceRecorder)
 * 2. Upload and transcribe (progress indicator)
 * 3. Preview transcript (TranscriptPreview)
 * 4. Playback audio (AudioPlayer)
 * 5. Save or retry transcription
 *
 * Features:
 * - Modal bottom sheet presentation
 * - Step-by-step workflow
 * - Loading states
 * - Error handling
 * - Offline queueing
 *
 * Usage:
 * ```tsx
 * const sheetRef = useRef<BottomSheet>(null);
 *
 * <VoiceRecordSheet
 *   ref={sheetRef}
 *   onSave={(transcript, audioUri) => console.log(transcript)}
 *   goalId="goal-123"
 *   subtaskInstanceId="subtask-456"
 * />
 *
 * // Open sheet
 * sheetRef.current?.expand();
 * ```
 */

import React, { useState, forwardRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Button } from '@/design-system/components/Button/Button';
import { VoiceRecorder } from './VoiceRecorder';
import { AudioWaveform } from './AudioWaveform';
import { TranscriptPreview } from './TranscriptPreview';
import { AudioPlayer } from './AudioPlayer';
import { RecordingResult } from '@/services/audioRecording';
import { useTranscribeAudio } from '@/hooks/useAudioUpload';
import { TranscriptionResponse } from '@/services/sttApi';

type WorkflowStep = 'record' | 'transcribing' | 'preview' | 'complete';

export interface VoiceRecordSheetProps {
  /**
   * Callback when transcript is saved
   */
  onSave: (transcript: string, audioUri: string) => void;

  /**
   * Optional goal ID to link audio
   */
  goalId?: string;

  /**
   * Optional subtask instance ID to link audio
   */
  subtaskInstanceId?: string;

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

export const VoiceRecordSheet = forwardRef<BottomSheet, VoiceRecordSheetProps>(
  ({ onSave, goalId, subtaskInstanceId, maxDuration = 300, language = 'en' }, ref) => {
    const { colors, spacing } = useTheme();

    const [currentStep, setCurrentStep] = useState<WorkflowStep>('record');
    const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
    const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResponse | null>(
      null
    );
    const [editedTranscript, setEditedTranscript] = useState('');

    // Transcription mutation
    const { mutate: transcribeAudio, isPending: isTranscribing } = useTranscribeAudio();

    // Snap points for bottom sheet
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    /**
     * Render backdrop
     */
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    /**
     * Handle recording complete
     */
    const handleRecordingComplete = useCallback(
      (result: RecordingResult) => {
        console.log('[VOICE_RECORD_SHEET] 🎤 Recording complete:', {
          duration: `${(result.durationMillis / 1000).toFixed(1)}s`,
          size: `${(result.size / 1024).toFixed(1)}KB`,
        });

        setRecordingResult(result);
        setCurrentStep('transcribing');

        // Start transcription
        transcribeAudio(
          {
            audioUri: result.uri,
            language,
            goalId,
            subtaskInstanceId,
          },
          {
            onSuccess: (data) => {
              console.log('[VOICE_RECORD_SHEET] ✅ Transcription complete');
              setTranscriptionResult(data);
              setEditedTranscript(data.transcript);
              setCurrentStep('preview');
            },
            onError: (error) => {
              console.error('[VOICE_RECORD_SHEET] ❌ Transcription failed:', error);
              Alert.alert(
                'Transcription Failed',
                'Audio saved. You can edit the transcript manually or retry transcription.',
                [
                  {
                    text: 'Retry',
                    onPress: () => {
                      setCurrentStep('record');
                      setRecordingResult(null);
                    },
                  },
                  {
                    text: 'Edit Manually',
                    onPress: () => {
                      // Allow manual transcript entry
                      setTranscriptionResult({
                        transcript: '',
                        confidence: 0,
                        duration_sec: Math.floor(result.durationMillis / 1000),
                        language,
                        provider: 'manual',
                        audio_url: result.uri,
                      });
                      setCurrentStep('preview');
                    },
                  },
                ]
              );
            },
          }
        );
      },
      [transcribeAudio, language, goalId, subtaskInstanceId]
    );

    /**
     * Handle transcript save
     */
    const handleTranscriptSave = useCallback(
      (transcript: string) => {
        setEditedTranscript(transcript);
      },
      []
    );

    /**
     * Handle final save
     */
    const handleFinalSave = useCallback(() => {
      if (!recordingResult) return;

      console.log('[VOICE_RECORD_SHEET] ✅ Saving transcript');
      onSave(editedTranscript, recordingResult.uri);

      // Close sheet and reset
      setCurrentStep('complete');
      setTimeout(() => {
        setCurrentStep('record');
        setRecordingResult(null);
        setTranscriptionResult(null);
        setEditedTranscript('');
      }, 500);
    }, [recordingResult, editedTranscript, onSave]);

    /**
     * Handle cancel
     */
    const handleCancel = useCallback(() => {
      Alert.alert('Cancel Recording?', 'This will discard the recording and transcript.', [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setCurrentStep('record');
            setRecordingResult(null);
            setTranscriptionResult(null);
            setEditedTranscript('');
          },
        },
      ]);
    }, []);

    /**
     * Render current step content
     */
    const renderContent = () => {
      switch (currentStep) {
        case 'record':
          return (
            <View style={[styles.stepContainer, { padding: spacing.lg }]}>
              <Text variant="displaySm" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
                Record Voice Note
              </Text>

              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={maxDuration}
                size={100}
              />

              <Text
                variant="bodySm"
                style={{
                  textAlign: 'center',
                  color: colors.text.secondary,
                  marginTop: spacing.lg,
                }}
              >
                Tap to start recording
              </Text>
            </View>
          );

        case 'transcribing':
          return (
            <View style={[styles.stepContainer, { padding: spacing.lg }]}>
              <Text variant="displaySm" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
                Transcribing...
              </Text>

              {recordingResult && (
                <AudioWaveform
                  meteringData={recordingResult.meteringData}
                  isLive={false}
                  barCount={30}
                  height={80}
                />
              )}

              <Text
                variant="bodyMd"
                style={{
                  textAlign: 'center',
                  color: colors.text.secondary,
                  marginTop: spacing.lg,
                }}
              >
                Processing audio...
              </Text>
            </View>
          );

        case 'preview':
          return (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.stepContainer, { padding: spacing.lg }]}
            >
              <Text variant="displaySm" style={{ marginBottom: spacing.lg }}>
                Review Transcript
              </Text>

              {transcriptionResult && (
                <TranscriptPreview
                  transcript={transcriptionResult.transcript}
                  confidence={transcriptionResult.confidence}
                  provider={transcriptionResult.provider}
                  onSave={handleTranscriptSave}
                />
              )}

              {recordingResult && (
                <View style={{ marginTop: spacing.md }}>
                  <AudioPlayer audioUri={recordingResult.uri} />
                </View>
              )}

              <View style={[styles.actions, { marginTop: spacing.lg, gap: spacing.sm }]}>
                <Button variant="secondary" size="md" onPress={handleCancel} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onPress={handleFinalSave} style={{ flex: 1 }}>
                  Save
                </Button>
              </View>
            </ScrollView>
          );

        case 'complete':
          return (
            <View style={[styles.stepContainer, { padding: spacing.lg }]}>
              <Text variant="displaySm" style={{ textAlign: 'center' }}>
                Saved!
              </Text>
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={ref}
          index={-1}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          backgroundStyle={{
            backgroundColor: colors.surface.secondary,
          }}
          handleIndicatorStyle={{
            backgroundColor: colors.neutral.border,
          }}
        >
          <BottomSheetView>{renderContent()}</BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  stepContainer: {
    alignItems: 'center',
    minHeight: 400,
  },
  scrollView: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
});
