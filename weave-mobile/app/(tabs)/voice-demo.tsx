/**
 * Voice/STT Demo & Testing Screen
 *
 * This screen allows testing all Story 0.11 voice components:
 * 1. VoiceRecordSheet (complete workflow)
 * 2. VoiceRecorder (standalone recording)
 * 3. AudioWaveform (live + static modes)
 * 4. TranscriptPreview (editing + confidence)
 * 5. AudioPlayer (playback controls)
 * 6. RateLimitIndicator (usage display)
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Button } from '@/design-system/components/Button/Button';
import { Card } from '@/design-system/components/Card/Card';
import {
  VoiceRecordModal, // NEW: Alternative modal without bottom-sheet dependency
  VoiceRecorder,
  AudioWaveform,
  TranscriptPreview,
  AudioPlayer,
  RateLimitIndicator,
} from '@/components/voice';
import { RecordingResult } from '@/services/audioRecording';

export default function VoiceDemoScreen() {
  const { colors, spacing } = useTheme();

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // State for standalone component testing
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [transcript, setTranscript] = useState('This is a sample transcript for testing purposes.');
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Mock rate limit data (replace with real data from API)
  const [requestCount] = useState(15);
  const [durationMinutes] = useState(45);

  /**
   * Test 1: VoiceRecordModal (Complete Workflow)
   * NEW: Using React Native Modal instead of bottom-sheet
   */
  const handleOpenModal = () => {
    console.log('[DEMO] Opening VoiceRecordModal...');
    setModalVisible(true);
  };

  const handleModalSave = (transcript: string, audioUri: string) => {
    console.log('[DEMO] ✅ Saved from modal:', { transcript, audioUri });
    setAudioUri(audioUri);
    setTranscript(transcript);
    Alert.alert(
      'Recording Saved!',
      `Transcript: ${transcript.substring(0, 50)}...\n\nAudio: ${audioUri}`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Test 2: VoiceRecorder (Standalone)
   */
  const handleStandaloneRecording = (result: RecordingResult) => {
    console.log('[DEMO] ✅ Standalone recording complete:', result);
    setRecordingResult(result);
    setAudioUri(result.uri);
    Alert.alert(
      'Recording Complete',
      `Duration: ${(result.durationMillis / 1000).toFixed(1)}s\nSize: ${(result.size / 1024).toFixed(1)}KB`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Test 3: TranscriptPreview (Editing)
   */
  const handleTranscriptSave = (editedText: string) => {
    console.log('[DEMO] ✅ Transcript edited:', editedText);
    setTranscript(editedText);
    Alert.alert('Transcript Updated', editedText.substring(0, 100) + '...', [{ text: 'OK' }]);
  };

  /**
   * Test 4: AudioPlayer (Playback Complete)
   */
  const handlePlaybackComplete = () => {
    console.log('[DEMO] ✅ Playback completed');
    Alert.alert('Playback Complete', 'Audio finished playing', [{ text: 'OK' }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[6] }]}
      >
        {/* Header */}
        <Text variant="displayMd" style={{ marginBottom: spacing[2] }}>
          Voice/STT Demo
        </Text>
        <Text variant="textBase" style={{ color: colors.text.secondary, marginBottom: spacing[8] }}>
          Test all Story 0.11 voice components
        </Text>

        {/* Test 1: VoiceRecordModal - Complete Workflow */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 1: Complete Workflow
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Test full recording workflow: Record → Transcribe → Preview → Save
            {'\n\n'}
            ✅ Using React Native Modal (no bottom-sheet dependency)
          </Text>
          <Button variant="primary" onPress={handleOpenModal}>
            Open Voice Recording Modal
          </Button>
        </Card>

        {/* Test 2: Standalone VoiceRecorder */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 2: Standalone Recording
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Test VoiceRecorder component in isolation (no transcription)
          </Text>
          <View style={styles.centerContent}>
            <VoiceRecorder
              onRecordingComplete={handleStandaloneRecording}
              maxDuration={60}
              size={100}
            />
          </View>
          {recordingResult && (
            <Text variant="textXs" style={{ color: colors.text.secondary, marginTop: spacing[3] }}>
              ✅ Last recording: {(recordingResult.durationMillis / 1000).toFixed(1)}s (
              {(recordingResult.size / 1024).toFixed(1)}KB)
            </Text>
          )}
        </Card>

        {/* Test 3: AudioWaveform */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 3: Waveform Visualization
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Static waveform (displays recording metering data)
          </Text>
          {recordingResult ? (
            <AudioWaveform
              meteringData={recordingResult.meteringData}
              isLive={false}
              barCount={30}
              height={80}
            />
          ) : (
            <Text variant="textXs" style={{ color: colors.text.secondary, textAlign: 'center' }}>
              Record audio above to see waveform
            </Text>
          )}
        </Card>

        {/* Test 4: TranscriptPreview */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 4: Transcript Editing
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Edit transcript, see confidence scoring
          </Text>
          <TranscriptPreview
            transcript={transcript}
            confidence={0.92}
            provider="assemblyai"
            onSave={handleTranscriptSave}
          />
        </Card>

        {/* Test 5: AudioPlayer */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 5: Audio Playback
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Play/pause, seek, speed controls
          </Text>
          {audioUri ? (
            <AudioPlayer audioUri={audioUri} onPlaybackComplete={handlePlaybackComplete} />
          ) : (
            <Text variant="textXs" style={{ color: colors.text.secondary, textAlign: 'center' }}>
              Record audio above to enable playback
            </Text>
          )}
        </Card>

        {/* Test 6: RateLimitIndicator */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 6: Rate Limit Display
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Visual progress bars for daily limits
          </Text>
          <RateLimitIndicator requestCount={requestCount} durationMinutes={durationMinutes} />
        </Card>

        {/* Test 7: Rate Limit Compact */}
        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Text variant="textLg" style={{ fontWeight: '600', marginBottom: spacing[3] }}>
            Test 7: Rate Limit (Compact)
          </Text>
          <Text variant="textSm" style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
            Minimal display for toolbars/headers
          </Text>
          <RateLimitIndicator
            requestCount={requestCount}
            durationMinutes={durationMinutes}
            compact
          />
        </Card>

        {/* Testing Tips */}
        <Card variant="subtle" style={{ padding: spacing[4], marginBottom: spacing[8] }}>
          <Text variant="textBase" style={{ fontWeight: '600', marginBottom: spacing[3], color: colors.text.primary }}>
            📋 Testing Checklist
          </Text>
          <Text variant="textSm" style={{ color: colors.text.primary, lineHeight: 20 }}>
            1. Check microphone permissions (Settings → Expo Go → Microphone){'\n'}
            2. Test on real device (simulator has no mic){'\n'}
            3. Verify audio recording quality{'\n'}
            4. Test transcription with backend running{'\n'}
            5. Check offline queueing (airplane mode){'\n'}
            6. Verify rate limit display updates{'\n'}
            7. Test all playback speeds (0.5x - 2.0x){'\n'}
            8. Edit transcript and check character limit
          </Text>
        </Card>
      </ScrollView>

      {/* VoiceRecordModal - Alternative to bottom-sheet */}
      <VoiceRecordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        maxDuration={300}
        language="en"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
