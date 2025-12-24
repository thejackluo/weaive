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
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import {
  VoiceRecordModal, // NEW: Alternative modal without bottom-sheet dependency
  VoiceRecorder,
  AudioWaveform,
  TranscriptPreview,
  AudioPlayer,
  RateLimitIndicator,
  RecordingHistory,
} from '@/components/voice';
import { RecordingResult } from '@/services/audioRecording';

export default function VoiceDemoScreen() {
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
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: 24 }]}
      >
        {/* Header */}
        <Textstyle={{ fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>
          Voice/STT Demo
        </Text>
        <Textstyle={{ fontSize: 16, color: '#a1a1aa', marginBottom: 32 }}>
          Test all Story 0.11 voice components
        </Text>

        {/* Test 1: VoiceRecordModal - Complete Workflow */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 1: Complete Workflow
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            Test full recording workflow: Record → Transcribe → Preview → Save
            {'\n\n'}✅ Using React Native Modal (no bottom-sheet dependency)
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 24,
              alignItems: 'center',
            }}
            onPress={handleOpenModal}
          >
            <Textstyle={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
              Open Voice Recording Modal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test 2: Standalone VoiceRecorder */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 2: Standalone Recording
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
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
            <Textstyle={{ fontSize: 12, color: '#a1a1aa', marginTop: 12 }}>
              ✅ Last recording: {(recordingResult.durationMillis / 1000).toFixed(1)}s /{' '}
              {(recordingResult.size / 1024).toFixed(1)}KB
            </Text>
          )}
        </View>

        {/* Test 3: AudioWaveform */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 3: Waveform Visualization
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
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
            <Textstyle={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center' }}>
              Record audio above to see waveform
            </Text>
          )}
        </View>

        {/* Test 4: TranscriptPreview */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 4: Transcript Editing
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            Edit transcript, see confidence scoring
          </Text>
          <TranscriptPreview
            transcript={transcript}
            confidence={0.92}
            provider="assemblyai"
            onSave={handleTranscriptSave}
          />
        </View>

        {/* Test 5: AudioPlayer */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 5: Audio Playback
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            Play/pause, seek, speed controls
          </Text>
          {audioUri ? (
            <AudioPlayer audioUri={audioUri} onPlaybackComplete={handlePlaybackComplete} />
          ) : (
            <Textstyle={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center' }}>
              Record audio above to enable playback
            </Text>
          )}
        </View>

        {/* Test 6: RateLimitIndicator */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 6: Rate Limit Display
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            Visual progress bars for daily limits
          </Text>
          <RateLimitIndicator requestCount={requestCount} durationMinutes={durationMinutes} />
        </View>

        {/* Test 7: Rate Limit Compact */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 7: Rate Limit (Compact)
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            Minimal display for toolbars/headers
          </Text>
          <RateLimitIndicator
            requestCount={requestCount}
            durationMinutes={durationMinutes}
            compact
          />
        </View>

        {/* Test 8: Recording History */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Textstyle={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>
            Test 8: Recording History
          </Text>
          <Textstyle={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
            View all past audio recordings with transcripts and playback
          </Text>
          <RecordingHistory maxPreviewLength={80} scrollEnabled={false} />
        </View>

        {/* Testing Tips */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            marginBottom: 32,
          }}
        >
          <Text
            style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#ffffff' }}
          >
            📋 Testing Checklist
          </Text>
          <Textstyle={{ fontSize: 14, color: '#ffffff', lineHeight: 20 }}>
            1. Check microphone permissions (Settings → Expo Go → Microphone){'\n'}
            2. Test on real device (simulator has no mic){'\n'}
            3. Verify audio recording quality{'\n'}
            4. Test transcription with backend running{'\n'}
            5. Check offline queueing (airplane mode){'\n'}
            6. Verify rate limit display updates{'\n'}
            7. Test all playback speeds (0.5x - 2.0x){'\n'}
            8. Edit transcript and check character limit{'\n'}
            9. Check recording history updates after new recordings
          </Text>
        </View>
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
