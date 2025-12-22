/**
 * Story 0.11: AudioPlayer Component
 *
 * Audio playback component with controls
 *
 * Features:
 * - Play/pause button
 * - Seek bar (scrubbing)
 * - Current time / duration display
 * - Playback speed control (0.5x, 1x, 1.5x, 2x)
 * - Loading state
 * - Error handling
 *
 * Usage:
 * ```tsx
 * <AudioPlayer
 *   audioUri="https://example.com/audio.m4a"
 *   onPlaybackComplete={() => console.log('done')}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Slider } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Text } from '@/design-system/components/Text/Text';
import { Card } from '@/design-system/components/Card/Card';

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
  const { colors, spacing, radius } = useTheme();

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
   * Get speed button color
   */
  const getSpeedButtonColor = (speed: PlaybackSpeed): string => {
    return speed === playbackSpeed ? colors.brand.primary.default : colors.text.secondary;
  };

  if (error) {
    return (
      <Card variant="glass" style={{ padding: spacing.md }}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={32} color={colors.error.default} />
          <Text variant="bodyMd" style={{ color: colors.error.default, marginTop: spacing.sm }}>
            {error}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="glass" style={{ padding: spacing.md }}>
      <View style={styles.container}>
        {/* Play/pause button */}
        <Pressable
          onPress={togglePlayPause}
          disabled={isLoading}
          style={[
            styles.playButton,
            {
              backgroundColor: colors.brand.primary.default,
              borderRadius: radius.full,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={28}
              color={colors.text.inverse}
            />
          )}
        </Pressable>

        {/* Seek bar and time */}
        <View style={styles.seekContainer}>
          <View style={styles.timeContainer}>
            <Text variant="bodyXs" style={{ color: colors.text.secondary }}>
              {formatTime(position)}
            </Text>
            <Text variant="bodyXs" style={{ color: colors.text.secondary }}>
              {formatTime(duration)}
            </Text>
          </View>

          <Slider
            style={styles.slider}
            value={duration > 0 ? position / duration : 0}
            onValueChange={(value) => {
              isSeeking.current = true;
              setPosition(value * duration);
            }}
            onSlidingComplete={handleSeek}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={colors.brand.primary.default}
            maximumTrackTintColor={colors.neutral.border}
            thumbTintColor={colors.brand.primary.default}
            disabled={isLoading || duration === 0}
          />
        </View>

        {/* Speed control */}
        {showSpeedControl && (
          <View style={styles.speedContainer}>
            {([0.5, 1.0, 1.5, 2.0] as PlaybackSpeed[]).map((speed) => (
              <Pressable
                key={speed}
                onPress={() => changeSpeed(speed)}
                disabled={isLoading}
                style={[
                  styles.speedButton,
                  {
                    backgroundColor: colors.neutral.tertiary,
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  },
                ]}
              >
                <Text
                  variant="bodyXs"
                  style={{
                    color: getSpeedButtonColor(speed),
                    fontWeight: speed === playbackSpeed ? '600' : '400',
                  }}
                >
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekContainer: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  speedButton: {
    minWidth: 40,
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
