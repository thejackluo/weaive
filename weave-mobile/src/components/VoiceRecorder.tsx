/**
 * Story 0.11: VoiceRecorder Component
 *
 * Circular microphone button with real-time waveform visualization
 *
 * Features:
 * - Idle state: Gray circle with mic icon
 * - Recording state: Red circle with pulsing animation
 * - Real-time waveform visualization (20-30 bars around circle)
 * - Haptic feedback on press
 * - Permission handling with user-friendly prompts
 *
 * Usage:
 * ```tsx
 * <VoiceRecorder
 *   onRecordingComplete={(result) => console.log(result)}
 *   maxDuration={300}
 * />
 * ```
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { RecordingResult } from '@/services/audioRecording';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface VoiceRecorderProps {
  /**
   * Callback when recording is completed
   */
  onRecordingComplete: (result: RecordingResult) => void;

  /**
   * Maximum recording duration in seconds
   * Default: 300 (5 minutes)
   */
  maxDuration?: number;

  /**
   * Size of the recorder button in pixels
   * Default: 80
   */
  size?: number;

  /**
   * Whether to show duration timer
   * Default: true
   */
  showDuration?: boolean;

  /**
   * Whether to enable waveform visualization
   * Default: true
   */
  showWaveform?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 300,
  size = 80,
  showDuration = true,
  showWaveform = true,
}: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused: _isPaused,
    duration,
    metering,
    hasPermission,
    isRequestingPermission,
    error,
    startRecording,
    pauseRecording: _pauseRecording,
    stopRecording,
    requestPermissions,
  } = useAudioRecording();

  // Animation values
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);
  const waveformAmplitude = useSharedValue(0);

  /**
   * Pulsing animation when recording
   */
  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeats
        false
      );
    } else {
      // Reset pulse
      pulse.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording]);

  /**
   * Update waveform amplitude based on metering
   */
  useEffect(() => {
    if (isRecording && metering) {
      // Animate to new amplitude
      waveformAmplitude.value = withSpring(metering.normalizedLevel, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      // Reset waveform
      waveformAmplitude.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording, metering]);

  /**
   * Button scale animation style
   */
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Pulse ring animation style
   */
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(pulse.value, [0, 1], [1, 1.3], Extrapolate.CLAMP);
    const pulseOpacity = interpolate(pulse.value, [0, 1], [0.6, 0], Extrapolate.CLAMP);

    return {
      transform: [{ scale: pulseScale }],
      opacity: pulseOpacity,
    };
  });

  /**
   * Waveform bar animation styles
   * IMPORTANT: Must create all 24 styles unconditionally to follow Rules of Hooks
   * Cannot be created dynamically in loops or conditionals
   */
  const barCount = 24;
  const waveformBarStyles = Array.from({ length: barCount }, (_, index) => {
    return useAnimatedStyle(() => {
      // Offset each bar slightly for wave effect
      const _offset = (index / barCount) * 0.3;
      const amplitude = interpolate(
        waveformAmplitude.value,
        [0, 1],
        [0.2, 1], // Min 20% height, max 100% height
        Extrapolate.CLAMP
      );

      return {
        height: `${amplitude * 100}%`,
      };
    });
  });

  /**
   * Handle press to start/stop recording
   */
  const handlePress = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (isRecording) {
        // Stop recording
        scale.value = withSpring(0.9, {}, () => {
          scale.value = withSpring(1);
        });

        const result = await stopRecording();
        if (result) {
          onRecordingComplete(result);
        }
      } else {
        // Start recording
        scale.value = withSpring(0.9, {}, () => {
          scale.value = withSpring(1);
        });

        await startRecording({ maxDuration, enableMetering: showWaveform });
      }
    } catch (err) {
      console.error('[VOICE_RECORDER] ❌ Error handling press:', err);

      // Show user-friendly error
      if (err instanceof Error && err.message.includes('permission')) {
        Alert.alert(
          'Microphone Access Required',
          'Please grant microphone permission to record audio.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Permission',
              onPress: async () => {
                const granted = await requestPermissions();
                if (granted) {
                  handlePress(); // Retry
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Recording Error',
          err instanceof Error ? err.message : 'Failed to record audio'
        );
      }
    }
  }, [
    isRecording,
    maxDuration,
    showWaveform,
    startRecording,
    stopRecording,
    onRecordingComplete,
    requestPermissions,
  ]);

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Render waveform bars around the circle
   */
  const renderWaveform = () => {
    if (!showWaveform || !isRecording) return null;

    const bars = [];

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * 360;
      const barStyle = waveformBarStyles[i]; // Use pre-created style (no hook call)

      bars.push(
        <Animated.View
          key={i}
          style={[
            styles.waveformBar,
            barStyle,
            {
              transform: [{ rotate: `${angle}deg` }],
              backgroundColor: '#ef4444',
            },
          ]}
        />
      );
    }

    return <View style={styles.waveformContainer}>{bars}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Waveform visualization */}
      {renderWaveform()}

      {/* Pulse ring */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            pulseAnimatedStyle,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              borderColor: '#ef4444',
            },
          ]}
        />
      )}

      {/* Main button */}
      <AnimatedPressable
        style={[
          styles.button,
          buttonAnimatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isRecording ? '#ef4444' : '#52525b',
          },
        ]}
        onPress={handlePress}
        disabled={isRequestingPermission}
      >
        <MaterialIcons
          name={isRecording ? 'stop' : 'mic'}
          size={size * 0.5}
          color="#ffffff"
        />
      </AnimatedPressable>

      {/* Duration display */}
      {showDuration && isRecording && (
        <View
          style={[
            styles.durationContainer,
            {
              marginTop: 16,
            },
          ]}
        >
          <Text style={{ fontSize: 16, color: '#ef4444' }}>
            {formatDuration(duration)}
          </RNText>
        </View>
      )}

      {/* Permission prompt */}
      {!hasPermission && !isRequestingPermission && (
        <View style={[styles.permissionPrompt, { marginTop: 16 }]}>
          <Text style={{ fontSize: 14, color: '#fafafa', textAlign: 'center' }}>
            Microphone access required
          </RNText>
        </View>
      )}

      {/* Error display */}
      {error && (
        <View style={[styles.errorContainer, { marginTop: 16 }]}>
          <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center' }}>
            {error}
          </RNText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  waveformContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformBar: {
    position: 'absolute',
    width: 3,
    minHeight: 8,
    borderRadius: 1.5,
    transformOrigin: 'center',
  },
  durationContainer: {
    alignItems: 'center',
  },
  permissionPrompt: {
    maxWidth: 200,
  },
  errorContainer: {
    maxWidth: 250,
  },
});
