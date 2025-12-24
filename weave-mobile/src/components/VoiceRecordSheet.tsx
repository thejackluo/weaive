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
import { View, StyleSheet, ScrollView, Alert, Text, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    const [currentStep, setCurrentStep] = useState<WorkflowStep>('record');
    const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
    const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResponse | null>(
      null
    );
    const [editedTranscript, setEditedTranscript] = useState('');

    // Transcription mutation
    const { mutate: transcribeAudio, isPending: _isTranscribing } = useTranscribeAudio();

    // Snap points for bottom sheet
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    /**
     * Render backdrop
     */
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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
    const handleTranscriptSave = useCallback((transcript: string) => {
      setEditedTranscript(transcript);
    }, []);

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
            <View style={[styles.stepContainer, { padding: 24 }]}>
              <Text style={{ fontSize: 28, fontWeight: '600', textAlign: 'center', marginBottom: 24 }}>
                Record Voice Note
              </Text>

              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={maxDuration}
                size={100}
              />

              <Text
                style={{
                  fontSize: 14,
                  textAlign: 'center',
                  color: '#a1a1aa',
                  marginTop: 24,
                }}
              >
                Tap to start recording
              </Text>
            </View>
          );

        case 'transcribing':
          return (
            <View style={[styles.stepContainer, { padding: 24 }]}>
              <Text style={{ fontSize: 28, fontWeight: '600', textAlign: 'center', marginBottom: 24 }}>
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
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                  color: '#a1a1aa',
                  marginTop: 24,
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
              contentContainerStyle={[styles.stepContainer, { padding: 24 }]}
            >
              <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 24 }}>
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
                <View style={{ marginTop: 16 }}>
                  <AudioPlayer audioUri={recordingResult.uri} />
                </View>
              )}

              <View style={[styles.actions, { marginTop: 24, gap: 12 }]}>
                <Pressable
                  onPress={handleCancel}
                  style={[styles.button, { flex: 1, backgroundColor: '#27272a' }]}
                >
                  <Text style={{ fontSize: 16, color: '#fafafa', fontWeight: '600' }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleFinalSave}
                  style={[styles.button, { flex: 1, backgroundColor: '#3b82f6' }]}
                >
                  <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '600' }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          );

        case 'complete':
          return (
            <View style={[styles.stepContainer, { padding: 24 }]}>
              <Text style={{ fontSize: 28, fontWeight: '600', textAlign: 'center' }}>
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
            backgroundColor: '#18181b',
          }}
          handleIndicatorStyle={{
            backgroundColor: '#27272a',
          }}
        >
          <BottomSheetView>{renderContent()}</BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
