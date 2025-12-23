/**
 * Story 0.11: AudioPlayer Component (Redesigned)
 *
 * Completely rebuilt audio playback component with better UX
 *
 * Features:
 * - Large, prominent progress bar with visual fill
 * - Clear time display (current / total)
 * - Smooth scrubbing and seeking
 * - Playback speed control
 * - Loading and error states
 *
 * Design improvements:
 * - Vertical stacked layout (no cramped horizontal)
 * - Full-width progress bar with large touch target
 * - Larger text and controls for better visibility
 * - Visual progress fill animation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface AudioPlayerProps {
  /**
   * Audio file URI (local or remote)
   */
  audioUri: string;

  /**
   * Whether to show playback speed control
   * Default: true
   */
  showSpeedControl?: boolean;

  /**
   * Callback when playback completes
   */
  onPlaybackComplete?: () => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

type PlaybackSpeed = 0.5 | 1.0 | 1.5 | 2.0;

export function AudioPlayer({
  audioUri,
  showSpeedControl = true,
  onPlaybackComplete,
  onError,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0); // milliseconds
  const [duration, setDuration] = useState(0); // milliseconds
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [error, setError] = useState<string | null>(null);

  const isSeeking = useRef(false);

  /**
   * Load audio on mount
   */
  useEffect(() => {
    loadAudio();

    return () => {
      // Cleanup on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  /**
   * Load audio file
   */
  const loadAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[AUDIO_PLAYER] 📂 Loading audio:', audioUri);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load sound
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: false,
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 100, // Update every 100ms for smooth progress
        },
        onPlaybackStatusUpdate
      );

      setSound(loadedSound);
      setIsLoading(false);

      console.log('[AUDIO_PLAYER] ✅ Audio loaded successfully');
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error loading audio:', err);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to load audio');

      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  /**
   * Playback status update callback
   */
  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.isLoaded) {
        setIsPlaying(status.isPlaying);
        setDuration(status.durationMillis ?? 0);

        // Only update position if not seeking
        if (!isSeeking.current) {
          setPosition(status.positionMillis ?? 0);
        }

        // Handle playback completion
        if (status.didJustFinish && !status.isLooping) {
          console.log('[AUDIO_PLAYER] ✅ Playback completed');
          setIsPlaying(false);
          setPosition(0);

          if (onPlaybackComplete) {
            onPlaybackComplete();
          }
        }
      } else if (status.error) {
        console.error('[AUDIO_PLAYER] ❌ Playback error:', status.error);
        setError('Playback error occurred');

        if (onError) {
          onError(new Error(status.error));
        }
      }
    },
    [onPlaybackComplete, onError]
  );

  /**
   * Toggle play/pause
   */
  const togglePlayPause = async () => {
    try {
      if (!sound) {
        console.error('[AUDIO_PLAYER] ❌ No sound loaded');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (isPlaying) {
        console.log('[AUDIO_PLAYER] ⏸️  Pausing playback');
        await sound.pauseAsync();
      } else {
        console.log('[AUDIO_PLAYER] ▶️  Starting playback');
        await sound.playAsync();
      }
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error toggling playback:', err);
      setError('Playback control error');
    }
  };

  /**
   * Handle seek (slider change)
   */
  const handleSeek = async (value: number) => {
    try {
      if (!sound) return;

      const newPosition = value * duration;
      isSeeking.current = true;

      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);

      // Delay resetting seeking flag to avoid position jumps
      setTimeout(() => {
        isSeeking.current = false;
      }, 100);
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error seeking:', err);
    }
  };

  /**
   * Skip forward 10 seconds
   */
  const skipForward = async () => {
    try {
      if (!sound) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newPosition = Math.min(position + 10000, duration);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error skipping forward:', err);
    }
  };

  /**
   * Skip backward 10 seconds
   */
  const skipBackward = async () => {
    try {
      if (!sound) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newPosition = Math.max(position - 10000, 0);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error skipping backward:', err);
    }
  };

  /**
   * Change playback speed
   */
  const changeSpeed = async (speed: PlaybackSpeed) => {
    try {
      if (!sound) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      console.log('[AUDIO_PLAYER] ⚡ Changing speed to', speed);
      await sound.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
    } catch (err) {
      console.error('[AUDIO_PLAYER] ❌ Error changing speed:', err);
    }
  };

  /**
   * Format time as MM:SS
   */
  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate progress percentage
   */
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  if (error) {
    return (
      <View style={[styles.card, { padding: 24 }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#ef4444" />
          <Text style={{ fontSize: 18, color: '#ef4444', marginTop: 16, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { padding: 24 }]}>
      <View style={styles.container}>
        {/* Time display - Large and prominent */}
        <View style={[styles.timeRow, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 18, color: '#fafafa', fontWeight: '600' }}>
            {formatTime(position)}
          </Text>
          <Text style={{ fontSize: 16, color: '#a1a1aa' }}>
            {formatTime(duration)}
          </Text>
        </View>

        {/* Progress bar - Full width with visual fill */}
        <View style={[styles.progressBarContainer, { marginBottom: 24 }]}>
          {/* Background track */}
          <View
            style={[
              styles.progressBarTrack,
              {
                backgroundColor: '#3f3f46',
                borderRadius: 9999,
              },
            ]}
          />

          {/* Filled portion */}
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: '#3b82f6',
                borderRadius: 9999,
              },
            ]}
          />

          {/* Interactive slider overlay */}
          <Slider
            style={styles.progressSlider}
            value={duration > 0 ? position / duration : 0}
            onValueChange={(value: number) => {
              isSeeking.current = true;
              setPosition(value * duration);
            }}
            onSlidingComplete={handleSeek}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="#3b82f6"
            disabled={isLoading || duration === 0}
          />
        </View>

        {/* Controls - Play/pause with skip buttons */}
        <View style={[styles.controlsRow, { marginBottom: 24 }]}>
          {/* Skip backward */}
          <Pressable
            onPress={skipBackward}
            disabled={isLoading || duration === 0}
            style={[
              styles.skipButton,
              {
                opacity: isLoading || duration === 0 ? 0.3 : 1,
              },
            ]}
          >
            <MaterialIcons name="replay-10" size={32} color="#fafafa" />
          </Pressable>

          {/* Play/pause - Large and centered */}
          <Pressable
            onPress={togglePlayPause}
            disabled={isLoading}
            style={[
              styles.playButton,
              {
                backgroundColor: '#3b82f6',
                borderRadius: 9999,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={40}
                color="#ffffff"
              />
            )}
          </Pressable>

          {/* Skip forward */}
          <Pressable
            onPress={skipForward}
            disabled={isLoading || duration === 0}
            style={[
              styles.skipButton,
              {
                opacity: isLoading || duration === 0 ? 0.3 : 1,
              },
            ]}
          >
            <MaterialIcons name="forward-10" size={32} color="#fafafa" />
          </Pressable>
        </View>

        {/* Speed control - Bottom row */}
        {showSpeedControl && (
          <View style={styles.speedRow}>
            <Text style={{ fontSize: 14, color: '#a1a1aa', marginRight: 12 }}>
              Speed:
            </Text>
            <View style={styles.speedContainer}>
              {([0.5, 1.0, 1.5, 2.0] as PlaybackSpeed[]).map((speed) => (
                <Pressable
                  key={speed}
                  onPress={() => changeSpeed(speed)}
                  disabled={isLoading}
                  style={[
                    styles.speedButton,
                    {
                      backgroundColor: speed === playbackSpeed ? '#3b82f6' : '#3f3f46',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: speed === playbackSpeed ? '#ffffff' : '#a1a1aa',
                      fontWeight: speed === playbackSpeed ? '600' : '400',
                    }}
                  >
                    {speed}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  container: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 40,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarTrack: {
    position: 'absolute',
    width: '100%',
    height: 6,
    top: '50%',
    marginTop: -3,
  },
  progressBarFill: {
    position: 'absolute',
    height: 6,
    top: '50%',
    marginTop: -3,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  playButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    minWidth: 50,
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
