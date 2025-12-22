/**
 * Story 0.11: Audio Recording Hook
 *
 * React hook for managing audio recording state
 * Wraps audioRecordingService with React state management
 *
 * Usage:
 * ```tsx
 * const {
 *   isRecording,
 *   isPaused,
 *   duration,
 *   metering,
 *   hasPermission,
 *   startRecording,
 *   pauseRecording,
 *   resumeRecording,
 *   stopRecording,
 *   cancelRecording,
 * } = useAudioRecording();
 * ```
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  audioRecordingService,
  RecordingState,
  RecordingResult,
  MeteringData,
  RecordingOptions,
} from '@/services/audioRecording';

export interface UseAudioRecordingReturn {
  /**
   * Whether recording is currently active
   */
  isRecording: boolean;

  /**
   * Whether recording is paused
   */
  isPaused: boolean;

  /**
   * Current recording state
   */
  state: RecordingState;

  /**
   * Current recording duration in seconds
   */
  duration: number;

  /**
   * Current audio metering data (for waveform visualization)
   */
  metering: MeteringData | null;

  /**
   * Whether microphone permission is granted
   */
  hasPermission: boolean;

  /**
   * Whether requesting permission
   */
  isRequestingPermission: boolean;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Start recording
   * Automatically requests permissions if needed
   */
  startRecording: (options?: RecordingOptions) => Promise<void>;

  /**
   * Pause current recording
   */
  pauseRecording: () => Promise<void>;

  /**
   * Resume paused recording
   */
  resumeRecording: () => Promise<void>;

  /**
   * Stop recording and return result
   */
  stopRecording: () => Promise<RecordingResult | null>;

  /**
   * Cancel recording and discard audio
   */
  cancelRecording: () => Promise<void>;

  /**
   * Request microphone permissions manually
   */
  requestPermissions: () => Promise<boolean>;
}

/**
 * Audio recording hook with state management
 * Automatically polls recording status while active
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [state, setState] = useState<RecordingState>(RecordingState.IDLE);
  const [duration, setDuration] = useState<number>(0);
  const [metering, setMetering] = useState<MeteringData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const statusInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Check permissions on mount
   */
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const granted = await audioRecordingService.checkPermissions();
        setHasPermission(granted);
        setState(audioRecordingService.getState());
      } catch (err) {
        console.error('[AUDIO_RECORDING_HOOK] ❌ Error checking permissions:', err);
      }
    };

    checkPermissions();
  }, []);

  /**
   * Start polling recording status when recording is active
   */
  useEffect(() => {
    if (state === RecordingState.RECORDING) {
      // Poll status every 100ms while recording
      statusInterval.current = setInterval(async () => {
        try {
          const status = await audioRecordingService.getStatus();

          if (status.isRecording) {
            setDuration(Math.floor(status.durationMillis / 1000));
            setMetering(status.metering ?? null);
          } else {
            // Recording stopped externally (e.g., max duration)
            setState(RecordingState.IDLE);
            setDuration(0);
            setMetering(null);
          }
        } catch (err) {
          console.error('[AUDIO_RECORDING_HOOK] ❌ Error polling status:', err);
        }
      }, 100);
    } else {
      // Clear interval when not recording
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
        statusInterval.current = null;
      }

      // Reset duration and metering when not recording
      if (state === RecordingState.IDLE) {
        setDuration(0);
        setMetering(null);
      }
    }

    return () => {
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, [state]);

  /**
   * Request microphone permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setState(RecordingState.REQUESTING_PERMISSION);

      const granted = await audioRecordingService.requestPermissions();
      setHasPermission(granted);
      setState(audioRecordingService.getState());

      if (!granted) {
        setError('Microphone permission denied');
      }

      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      setState(RecordingState.ERROR);
      return false;
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (options?: RecordingOptions): Promise<void> => {
    try {
      setError(null);

      await audioRecordingService.startRecording(options);
      setState(RecordingState.RECORDING);
      setDuration(0);
      setMetering(null);

      console.log('[AUDIO_RECORDING_HOOK] ✅ Recording started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('[AUDIO_RECORDING_HOOK] ❌ Error starting recording:', err);
      setError(errorMessage);
      setState(RecordingState.ERROR);
      throw err;
    }
  }, []);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      await audioRecordingService.pauseRecording();
      setState(RecordingState.PAUSED);

      console.log('[AUDIO_RECORDING_HOOK] ✅ Recording paused');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause recording';
      console.error('[AUDIO_RECORDING_HOOK] ❌ Error pausing recording:', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      await audioRecordingService.resumeRecording();
      setState(RecordingState.RECORDING);

      console.log('[AUDIO_RECORDING_HOOK] ✅ Recording resumed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume recording';
      console.error('[AUDIO_RECORDING_HOOK] ❌ Error resuming recording:', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Stop recording and return result
   */
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    try {
      setError(null);

      const result = await audioRecordingService.stopRecording();
      setState(RecordingState.IDLE);
      setDuration(0);
      setMetering(null);

      console.log('[AUDIO_RECORDING_HOOK] ✅ Recording stopped:', {
        duration: `${(result.durationMillis / 1000).toFixed(1)}s`,
        size: `${(result.size / 1024).toFixed(1)}KB`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      console.error('[AUDIO_RECORDING_HOOK] ❌ Error stopping recording:', err);
      setError(errorMessage);
      setState(RecordingState.ERROR);
      return null;
    }
  }, []);

  /**
   * Cancel recording and discard audio
   */
  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      await audioRecordingService.cancelRecording();
      setState(RecordingState.IDLE);
      setDuration(0);
      setMetering(null);

      console.log('[AUDIO_RECORDING_HOOK] ✅ Recording canceled');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel recording';
      console.error('[AUDIO_RECORDING_HOOK] ❌ Error canceling recording:', err);
      setError(errorMessage);
      setState(RecordingState.ERROR);
      throw err;
    }
  }, []);

  return {
    isRecording: state === RecordingState.RECORDING,
    isPaused: state === RecordingState.PAUSED,
    state,
    duration,
    metering,
    hasPermission,
    isRequestingPermission: state === RecordingState.REQUESTING_PERMISSION,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    requestPermissions,
  };
}
