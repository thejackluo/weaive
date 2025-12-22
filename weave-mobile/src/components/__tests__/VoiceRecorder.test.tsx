/**
 * Component Tests for VoiceRecorder
 * Story: 0.11 - Voice/Speech-to-Text Infrastructure
 *
 * Tests cover:
 * - AC-4: Voice Recording UI (record, pause, cancel, max duration)
 * - AC-6: Error Handling (permissions, offline, timeout)
 * - AC-5: Rate Limiting UI (usage indicator, warnings)
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { VoiceRecorder } from '../VoiceRecorder';
import * as Audio from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ durationMillis: 45000 })),
      getURI: jest.fn(() => 'file://test-audio.m4a'),
    })),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

// Mock hooks
jest.mock('@/hooks/useAudioRecording', () => ({
  useAudioRecording: jest.fn(() => ({
    isRecording: false,
    isPaused: false,
    duration: 0,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    pauseRecording: jest.fn(),
    cancelRecording: jest.fn(),
    permissionStatus: 'granted',
  })),
}));

describe('VoiceRecorder Component', () => {
  // ============================================================================
  // AC-4: RECORDING INTERFACE
  // ============================================================================

  it('should render idle state with microphone button', () => {
    /**
     * GIVEN: VoiceRecorder component is mounted
     * WHEN: User views the component
     * THEN: Shows microphone button in idle state
     *       - Circular button (80px)
     *       - Neutral color
     *       - "Tap to record" hint
     */
    const { getByTestId, getByText } = render(<VoiceRecorder />);

    expect(getByTestId('mic-button')).toBeTruthy();
    expect(getByText('Tap to record')).toBeTruthy();
  });

  it('should start recording when microphone button is pressed', async () => {
    /**
     * GIVEN: VoiceRecorder is in idle state
     * WHEN: User presses microphone button
     * THEN: Starts recording
     *       - Button transforms to "Stop" button
     *       - Pulsing red circle animation
     *       - "Recording..." text appears
     *       - Elapsed time starts (00:00)
     */
    const mockStartRecording = jest.fn();
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: false,
      isPaused: false,
      duration: 0,
      startRecording: mockStartRecording,
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    const { getByTestId } = render(<VoiceRecorder />);
    const micButton = getByTestId('mic-button');

    fireEvent.press(micButton);

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });
  });

  it('should show 3-button layout during recording', async () => {
    /**
     * GIVEN: Recording is active
     * WHEN: User views the interface
     * THEN: Shows 3 buttons:
     *       - Cancel button (left) - ❌
     *       - Stop button (center) - 🎤
     *       - Pause button (right) - ⏸️
     */
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 10,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    const { getByTestId } = render(<VoiceRecorder />);

    expect(getByTestId('cancel-button')).toBeTruthy();
    expect(getByTestId('stop-button')).toBeTruthy();
    expect(getByTestId('pause-button')).toBeTruthy();
  });

  it('should display elapsed time during recording', async () => {
    /**
     * GIVEN: Recording is active for 45 seconds
     * WHEN: User views the interface
     * THEN: Shows elapsed time in MM:SS format (00:45)
     *       - Updates every second
     */
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 45,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    const { getByText } = render(<VoiceRecorder />);

    expect(getByText('00:45')).toBeTruthy();
  });

  // ============================================================================
  // AC-4: MAX DURATION ENFORCEMENT
  // ============================================================================

  it('should show warning at 4:30 remaining', async () => {
    /**
     * GIVEN: Recording is 4 minutes 30 seconds long
     * WHEN: User views the interface
     * THEN: Shows warning: "⚠️ 30 seconds remaining"
     */
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 270, // 4:30
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    const { getByText } = render(<VoiceRecorder />);

    expect(getByText('⚠️ 30 seconds remaining')).toBeTruthy();
  });

  it('should auto-stop at 5:00 limit', async () => {
    /**
     * GIVEN: Recording reaches 5 minutes (300 seconds)
     * WHEN: Duration hits max limit
     * THEN: Automatically stops recording
     *       - Shows completion animation
     *       - Proceeds to transcription
     */
    const mockStopRecording = jest.fn();
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 300, // 5:00 (max)
      startRecording: jest.fn(),
      stopRecording: mockStopRecording,
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    render(<VoiceRecorder />);

    // Auto-stop should be triggered
    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it('should cancel recording when cancel button is pressed', async () => {
    /**
     * GIVEN: Recording is active
     * WHEN: User presses cancel button (❌)
     * THEN: Discards recording
     *       - Returns to idle state
     *       - No transcription performed
     *       - No audio stored
     */
    const mockCancelRecording = jest.fn();
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 20,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: mockCancelRecording,
      permissionStatus: 'granted',
    });

    const { getByTestId } = render(<VoiceRecorder />);
    const cancelButton = getByTestId('cancel-button');

    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(mockCancelRecording).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // AC-6: MICROPHONE PERMISSIONS
  // ============================================================================

  it('should request microphone permissions on mount', async () => {
    /**
     * GIVEN: VoiceRecorder component is mounted
     * WHEN: Component initializes
     * THEN: Requests microphone permissions from user
     */
    const mockRequestPermissions = jest.fn(() => Promise.resolve({ status: 'granted' }));
    (Audio.Audio.requestPermissionsAsync as jest.Mock) = mockRequestPermissions;

    render(<VoiceRecorder />);

    await waitFor(() => {
      expect(mockRequestPermissions).toHaveBeenCalled();
    });
  });

  it('should show permission denied error when microphone access is denied', async () => {
    /**
     * GIVEN: User denies microphone permissions
     * WHEN: VoiceRecorder tries to start recording
     * THEN: Shows error: "Microphone access required. Enable in Settings."
     *       - Shows iOS Settings deep link
     *       - Error code: MICROPHONE_PERMISSION_DENIED
     */
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: false,
      isPaused: false,
      duration: 0,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'denied',
    });

    const { getByText } = render(<VoiceRecorder />);

    expect(getByText('Microphone access required. Enable in Settings.')).toBeTruthy();
  });

  // ============================================================================
  // AC-5: RATE LIMITING UI
  // ============================================================================

  it('should show daily usage indicator', async () => {
    /**
     * GIVEN: User has used 12 out of 50 transcriptions today
     * WHEN: VoiceRecorder is displayed
     * THEN: Shows: "12/50 transcriptions used today"
     */
    const mockProps = {
      dailyUsage: { used: 12, limit: 50 },
    };

    const { getByText } = render(<VoiceRecorder {...mockProps} />);

    expect(getByText('12/50 transcriptions used today')).toBeTruthy();
  });

  it('should show warning at 80% usage (40/50)', async () => {
    /**
     * GIVEN: User has used 40 out of 50 transcriptions today
     * WHEN: VoiceRecorder is displayed
     * THEN: Shows warning in yellow: "40/50 transcriptions used today"
     */
    const mockProps = {
      dailyUsage: { used: 40, limit: 50 },
    };

    const { getByText, getByTestId } = render(<VoiceRecorder {...mockProps} />);

    expect(getByText('40/50 transcriptions used today')).toBeTruthy();
    // Warning color indicator should be present
    expect(getByTestId('usage-indicator-warning')).toBeTruthy();
  });

  it('should show error at 100% usage (50/50)', async () => {
    /**
     * GIVEN: User has reached daily limit (50/50)
     * WHEN: VoiceRecorder is displayed
     * THEN: Shows error in red: "Daily limit reached. Resets at midnight."
     *       - Microphone button is disabled
     */
    const mockProps = {
      dailyUsage: { used: 50, limit: 50 },
    };

    const { getByText, getByTestId } = render(<VoiceRecorder {...mockProps} />);

    expect(getByText('Daily limit reached. Resets at midnight.')).toBeTruthy();

    const micButton = getByTestId('mic-button');
    expect(micButton.props.accessibilityState.disabled).toBe(true);
  });

  // ============================================================================
  // AC-6: OFFLINE HANDLING
  // ============================================================================

  it('should queue recording when offline', async () => {
    /**
     * GIVEN: Device is offline (no internet connection)
     * WHEN: User completes recording
     * THEN: Shows: "No internet connection. Recording saved locally."
     *       - Saves audio in AsyncStorage
     *       - Shows queued status: "1 transcription pending"
     */
    const mockProps = {
      isOnline: false,
    };

    const { getByText } = render(<VoiceRecorder {...mockProps} />);

    // Complete recording while offline
    const mockStopRecording = jest.fn();
    jest.spyOn(require('@/hooks/useAudioRecording'), 'useAudioRecording').mockReturnValue({
      isRecording: true,
      isPaused: false,
      duration: 30,
      startRecording: jest.fn(),
      stopRecording: mockStopRecording,
      pauseRecording: jest.fn(),
      cancelRecording: jest.fn(),
      permissionStatus: 'granted',
    });

    const { getByTestId } = render(<VoiceRecorder {...mockProps} />);
    const stopButton = getByTestId('stop-button');

    fireEvent.press(stopButton);

    await waitFor(() => {
      expect(getByText('No internet connection. Recording saved locally.')).toBeTruthy();
    });
  });
});
