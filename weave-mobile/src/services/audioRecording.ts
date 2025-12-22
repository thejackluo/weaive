/**
 * Story 0.11: Audio Recording Service
 *
 * Low-level service for audio recording using expo-av
 * Handles microphone permissions, recording lifecycle, and audio file management
 *
 * Recording Settings:
 * - Format: M4A (AAC codec)
 * - Sample Rate: 44.1kHz
 * - Bit Rate: 128kbps
 * - Channels: Mono
 * - Quality: High
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface RecordingOptions {
  /**
   * Maximum recording duration in seconds
   * Default: 300 (5 minutes)
   */
  maxDuration?: number;

  /**
   * Enable metering (for waveform visualization)
   * Default: true
   */
  enableMetering?: boolean;
}

export interface RecordingResult {
  /**
   * File URI of the recorded audio
   */
  uri: string;

  /**
   * Duration in milliseconds
   */
  durationMillis: number;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * Audio metering data (for waveform visualization)
   * Array of RMS values (-160 to 0 dB)
   */
  meteringData?: number[];
}

export interface MeteringData {
  /**
   * Current metering level (-160 to 0 dB)
   * -160 = silence, 0 = max volume
   */
  level: number;

  /**
   * Normalized level (0.0 to 1.0)
   * Useful for UI visualization
   */
  normalizedLevel: number;
}

/**
 * Audio recording state machine states
 */
export enum RecordingState {
  IDLE = 'idle',
  REQUESTING_PERMISSION = 'requesting_permission',
  PERMISSION_DENIED = 'permission_denied',
  READY = 'ready',
  RECORDING = 'recording',
  PAUSED = 'paused',
  PROCESSING = 'processing',
  ERROR = 'error',
}

class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private state: RecordingState = RecordingState.IDLE;
  private meteringInterval: NodeJS.Timeout | null = null;
  private meteringHistory: number[] = [];

  /**
   * Request microphone permissions
   * Required before starting any recording
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('[AUDIO_RECORDING] 🎤 Requesting microphone permissions...');
      this.state = RecordingState.REQUESTING_PERMISSION;

      const { status } = await Audio.requestPermissionsAsync();

      if (status === 'granted') {
        console.log('[AUDIO_RECORDING] ✅ Microphone permission granted');
        this.state = RecordingState.READY;
        return true;
      } else {
        console.log('[AUDIO_RECORDING] ❌ Microphone permission denied');
        this.state = RecordingState.PERMISSION_DENIED;
        return false;
      }
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error requesting permissions:', error);
      this.state = RecordingState.ERROR;
      return false;
    }
  }

  /**
   * Check if microphone permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      const granted = status === 'granted';

      if (granted) {
        this.state = RecordingState.READY;
      } else {
        this.state = RecordingState.PERMISSION_DENIED;
      }

      return granted;
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error checking permissions:', error);
      this.state = RecordingState.ERROR;
      return false;
    }
  }

  /**
   * Start audio recording
   * Automatically requests permissions if not granted
   */
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    try {
      console.log('[AUDIO_RECORDING] 🎙️  Starting recording...');

      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Microphone permission denied');
        }
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Recording options
      const recordingOptions: Audio.RecordingOptions = {
        isMeteringEnabled: options.enableMetering ?? true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      // Create recording instance
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
      this.state = RecordingState.RECORDING;
      this.meteringHistory = [];

      // Start metering interval if enabled
      if (options.enableMetering ?? true) {
        this.startMeteringInterval();
      }

      // Set max duration timer if specified
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.state === RecordingState.RECORDING) {
            console.log('[AUDIO_RECORDING] ⏱️  Max duration reached, stopping recording');
            this.stopRecording();
          }
        }, options.maxDuration * 1000);
      }

      console.log('[AUDIO_RECORDING] ✅ Recording started');
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error starting recording:', error);
      this.state = RecordingState.ERROR;
      throw error;
    }
  }

  /**
   * Pause current recording
   * Can be resumed with resumeRecording()
   */
  async pauseRecording(): Promise<void> {
    try {
      if (!this.recording || this.state !== RecordingState.RECORDING) {
        throw new Error('No active recording to pause');
      }

      console.log('[AUDIO_RECORDING] ⏸️  Pausing recording...');

      await this.recording.pauseAsync();
      this.state = RecordingState.PAUSED;
      this.stopMeteringInterval();

      console.log('[AUDIO_RECORDING] ✅ Recording paused');
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error pausing recording:', error);
      throw error;
    }
  }

  /**
   * Resume paused recording
   */
  async resumeRecording(): Promise<void> {
    try {
      if (!this.recording || this.state !== RecordingState.PAUSED) {
        throw new Error('No paused recording to resume');
      }

      console.log('[AUDIO_RECORDING] ▶️  Resuming recording...');

      await this.recording.startAsync();
      this.state = RecordingState.RECORDING;
      this.startMeteringInterval();

      console.log('[AUDIO_RECORDING] ✅ Recording resumed');
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error resuming recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return result
   * Recording file is saved to a temporary location
   */
  async stopRecording(): Promise<RecordingResult> {
    try {
      if (!this.recording) {
        throw new Error('No active recording to stop');
      }

      console.log('[AUDIO_RECORDING] ⏹️  Stopping recording...');
      this.state = RecordingState.PROCESSING;
      this.stopMeteringInterval();

      // Stop recording
      await this.recording.stopAndUnloadAsync();

      // Get recording status
      const status = await this.recording.getStatusAsync();
      const uri = this.recording.getURI();

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      // Clean up
      const result: RecordingResult = {
        uri,
        durationMillis: status.durationMillis,
        size,
        meteringData: [...this.meteringHistory],
      };

      this.recording = null;
      this.meteringHistory = [];
      this.state = RecordingState.IDLE;

      console.log('[AUDIO_RECORDING] ✅ Recording stopped:', {
        duration: `${(result.durationMillis / 1000).toFixed(1)}s`,
        size: `${(result.size / 1024).toFixed(1)}KB`,
      });

      return result;
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error stopping recording:', error);
      this.state = RecordingState.ERROR;
      throw error;
    }
  }

  /**
   * Cancel current recording and discard audio file
   */
  async cancelRecording(): Promise<void> {
    try {
      if (!this.recording) {
        return;
      }

      console.log('[AUDIO_RECORDING] 🗑️  Canceling recording...');
      this.stopMeteringInterval();

      const uri = this.recording.getURI();
      await this.recording.stopAndUnloadAsync();

      // Delete recording file
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      this.recording = null;
      this.meteringHistory = [];
      this.state = RecordingState.IDLE;

      console.log('[AUDIO_RECORDING] ✅ Recording canceled');
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error canceling recording:', error);
      this.state = RecordingState.ERROR;
      throw error;
    }
  }

  /**
   * Get current recording status
   * Returns duration and metering data while recording
   */
  async getStatus(): Promise<{
    isRecording: boolean;
    durationMillis: number;
    metering?: MeteringData;
  }> {
    try {
      if (!this.recording) {
        return {
          isRecording: false,
          durationMillis: 0,
        };
      }

      const status = await this.recording.getStatusAsync();

      let metering: MeteringData | undefined;
      if (status.isRecording && status.metering) {
        const rawLevel = status.metering;
        metering = {
          level: rawLevel,
          normalizedLevel: this.normalizeMeteringLevel(rawLevel),
        };
      }

      return {
        isRecording: status.isRecording,
        durationMillis: status.durationMillis,
        metering,
      };
    } catch (error) {
      console.error('[AUDIO_RECORDING] ❌ Error getting status:', error);
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): RecordingState {
    return this.state;
  }

  /**
   * Start metering interval for waveform visualization
   * Samples audio level every 100ms
   */
  private startMeteringInterval(): void {
    this.stopMeteringInterval();

    this.meteringInterval = setInterval(async () => {
      try {
        if (!this.recording || this.state !== RecordingState.RECORDING) {
          this.stopMeteringInterval();
          return;
        }

        const status = await this.recording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          this.meteringHistory.push(status.metering);

          // Limit history to last 300 samples (30 seconds at 100ms intervals)
          if (this.meteringHistory.length > 300) {
            this.meteringHistory.shift();
          }
        }
      } catch (error) {
        console.error('[AUDIO_RECORDING] ❌ Error reading metering:', error);
      }
    }, 100);
  }

  /**
   * Stop metering interval
   */
  private stopMeteringInterval(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = null;
    }
  }

  /**
   * Normalize metering level from dB (-160 to 0) to 0.0-1.0
   * Uses logarithmic scaling for better visual representation
   */
  private normalizeMeteringLevel(dbLevel: number): number {
    // Clamp to reasonable range (-60 to 0 dB)
    const clampedDb = Math.max(-60, Math.min(0, dbLevel));

    // Convert to 0.0-1.0 scale
    const normalized = (clampedDb + 60) / 60;

    return Math.max(0, Math.min(1, normalized));
  }
}

// Export singleton instance
export const audioRecordingService = new AudioRecordingService();
