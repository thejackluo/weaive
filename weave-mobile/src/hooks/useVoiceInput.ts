/**
 * useVoiceInput - Voice Recording + Transcription Hook
 *
 * Features:
 * - Record audio with expo-av
 * - Show dynamic upload progress (0-100%)
 * - Upload to /api/transcribe endpoint
 * - Return transcribed text
 * - Handle errors gracefully
 */

import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import apiClient from '@/services/apiClient';

interface VoiceInputState {
  isRecording: boolean;
  isTranscribing: boolean;
  uploadProgress: number; // 0-100
  error: string | null;
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isTranscribing: false,
    uploadProgress: 0,
    error: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Request microphone permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          error: 'Microphone permission denied',
        }));
        return false;
      }
      return true;
    } catch (error) {
      console.error('[VOICE_INPUT] Permission error:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to request microphone permission',
      }));
      return false;
    }
  };

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      console.log('[VOICE_INPUT] 🎤 Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setState((prev) => ({
        ...prev,
        isRecording: true,
        error: null,
      }));

      console.log('[VOICE_INPUT] ✅ Recording started');
    } catch (error) {
      console.error('[VOICE_INPUT] ❌ Failed to start recording:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to start recording',
      }));
    }
  }, []);

  /**
   * Simulate upload progress (since FormData doesn't support progress tracking)
   * Estimates progress based on time: 0% → 30% (recording) → 60% (uploading) → 100% (transcribing)
   */
  const simulateProgress = (phase: 'upload' | 'transcribe') => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    let currentProgress = phase === 'upload' ? 30 : 60;
    const targetProgress = phase === 'upload' ? 60 : 95;
    const step = 5;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= targetProgress) {
        clearInterval(progressIntervalRef.current!);
        progressIntervalRef.current = null;
      }
      setState((prev) => ({ ...prev, uploadProgress: Math.min(currentProgress, targetProgress) }));
    }, 200); // Update every 200ms
  };

  /**
   * Stop recording and transcribe
   */
  const stopRecordingAndTranscribe = useCallback(async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) {
        console.error('[VOICE_INPUT] No active recording');
        return null;
      }

      console.log('[VOICE_INPUT] 🛑 Stopping recording...');

      // Stop recording and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI available');
      }

      console.log('[VOICE_INPUT] ✅ Recording stopped, URI:', uri);

      // Update state: recording done, now transcribing
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isTranscribing: true,
        uploadProgress: 30, // Recording phase complete
      }));

      // Simulate upload progress
      simulateProgress('upload');

      // Prepare FormData
      const formData = new FormData();
      const fileExtension = Platform.OS === 'ios' ? 'm4a' : 'mp3';
      const fileName = `voice_${Date.now()}.${fileExtension}`;

      formData.append('audio', {
        uri,
        type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mpeg',
        name: fileName,
      } as any);

      formData.append('language', 'en');

      console.log('[VOICE_INPUT] 📤 Uploading to /api/transcribe...');

      // Switch to transcription progress simulation
      simulateProgress('transcribe');

      // Upload to backend (using fetch directly for FormData)
      const response = await fetch(`${apiClient.defaults.baseURL}/api/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await require('@/services/secureStorage').getAccessToken()}`,
          ...(apiClient.getAdminKey() ? { 'X-Admin-Key': apiClient.getAdminKey() } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'Transcription failed');
      }

      const data = await response.json();
      const transcribedText = data.data?.transcribed_text || '';

      console.log('[VOICE_INPUT] ✅ Transcription complete:', transcribedText);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Reset state immediately (don't delay)
      setState({
        isRecording: false,
        isTranscribing: false,
        uploadProgress: 0,
        error: null,
      });

      return transcribedText;
    } catch (error: any) {
      console.error('[VOICE_INPUT] ❌ Transcription failed:', error);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setState({
        isRecording: false,
        isTranscribing: false,
        uploadProgress: 0,
        error: error.message || 'Transcription failed',
      });

      return null;
    }
  }, []);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setState({
        isRecording: false,
        isTranscribing: false,
        uploadProgress: 0,
        error: null,
      });

      console.log('[VOICE_INPUT] 🚫 Recording cancelled');
    } catch (error) {
      console.error('[VOICE_INPUT] Error cancelling recording:', error);
    }
  }, []);

  return {
    isRecording: state.isRecording,
    isTranscribing: state.isTranscribing,
    uploadProgress: state.uploadProgress,
    error: state.error,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
  };
}
