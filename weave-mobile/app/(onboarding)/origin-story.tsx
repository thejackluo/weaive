/**
 * Story 1.7: Commitment Ritual & Origin Story
 *
 * 3-Screen Flow:
 * Screen 1: Narrative Validation (<5s) - Dynamic "this is where your story shifts" message
 * Screen 2: Origin Story Capture (30-90s) - Photo + voice commitment
 * Screen 3: Completion & Reinforcement (3-5s) - Weave animation + celebration
 *
 * Total target time: 40-100 seconds
 *
 * This screen uses a step state machine for smooth transitions between steps.
 * Captured data (photo + audio) stored locally and will be uploaded in Story 0-4.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
// TODO: Enable for actual camera/audio implementation
// import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateNarrativeText,
  generateFromToSummary,
  VOICE_PROMPTS,
} from '@/constants/originStoryContent';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Constants
// TODO: Restore for actual recording implementation
const _MAX_RECORDING_DURATION = 60000; // 60 seconds
const _FORCE_STOP_DURATION = 65000; // 65 seconds (safety margin)
const MIN_TOUCH_TARGET = 48;

type Step = 1 | 2 | 3;

interface OnboardingData {
  preferred_name: string;
  selected_painpoints: string[];
  identity_traits: string[];
}

interface OriginStoryData {
  photo: string | null;
  audioUri: string | null;
  audioDuration: number;
  fromText: string;
  toText: string;
}

export default function OriginStoryScreen() {
  const router = useRouter();
  const confettiRef = useRef<any>(null);

  // Step state machine
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Onboarding data from previous stories
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    preferred_name: '',
    selected_painpoints: [],
    identity_traits: [],
  });

  // Origin story data
  const [originData, setOriginData] = useState<OriginStoryData>({
    photo: null,
    audioUri: null,
    audioDuration: 0,
    fromText: '',
    toText: '',
  });

  // Screen 1 state
  const [narrativeContent, setNarrativeContent] = useState({
    struggle: '',
    aspiration: '',
    bridge: '',
  });

  // Screen 2 state
  // TODO: Restore for actual recording implementation
  // const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, _setIsRecording] = useState(false);
  const [recordingTime, _setRecordingTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  // const [sound, setSound] = useState<Audio.Sound | null>(null);
  const _recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load onboarding data on mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  // Generate narrative content when onboarding data changes
  useEffect(() => {
    console.log('[ORIGIN_STORY] Onboarding data updated:', onboardingData);

    if (
      onboardingData.selected_painpoints.length > 0 &&
      onboardingData.identity_traits.length > 0
    ) {
      const content = generateNarrativeText(
        onboardingData.selected_painpoints,
        onboardingData.identity_traits
      );
      console.log('[ORIGIN_STORY] Generated narrative content:', content);
      setNarrativeContent(content);

      const fromTo = generateFromToSummary(
        onboardingData.selected_painpoints,
        onboardingData.identity_traits
      );
      console.log('[ORIGIN_STORY] Generated from/to summary:', fromTo);
      setOriginData((prev) => ({
        ...prev,
        fromText: fromTo.fromText,
        toText: fromTo.toText,
      }));
    } else {
      console.warn('[ORIGIN_STORY] Cannot generate content - missing painpoints or traits', {
        painpoints: onboardingData.selected_painpoints,
        traits: onboardingData.identity_traits,
      });
    }
  }, [onboardingData]);

  // Restore draft on mount (app backgrounding recovery)
  useEffect(() => {
    restoreDraft();
  }, []);

  // Cleanup audio on unmount (disabled for placeholder mode)
  // TODO: Restore for actual recording implementation
  // useEffect(() => {
  //   return () => {
  //     if (sound) {
  //       sound.unloadAsync();
  //     }
  //     if (recording) {
  //       recording.stopAndUnloadAsync();
  //     }
  //   };
  // }, [sound, recording]);

  //====================
  // DATA LOADING
  //====================

  const loadOnboardingData = async () => {
    try {
      const dataStr = await AsyncStorage.getItem('onboarding_data');
      console.log('[ORIGIN_STORY] Loading onboarding data:', dataStr);

      if (dataStr) {
        const data = JSON.parse(dataStr);
        const loadedData = {
          preferred_name: data.preferred_name || '',
          selected_painpoints: data.selected_painpoints || [],
          identity_traits: data.identity_traits || [],
        };

        console.log('[ORIGIN_STORY] Loaded data:', loadedData);
        setOnboardingData(loadedData);
      } else {
        // Fallback data for testing/development
        console.log('[ORIGIN_STORY] No data in AsyncStorage, using fallback');
        setOnboardingData({
          preferred_name: 'there',
          selected_painpoints: ['clarity', 'action'],
          identity_traits: ['Disciplined', 'Focused', 'Intentional'],
        });
      }
    } catch (error) {
      console.error('[ORIGIN_STORY] Failed to load onboarding data:', error);
      // Use fallback data on error
      setOnboardingData({
        preferred_name: 'there',
        selected_painpoints: ['clarity'],
        identity_traits: ['Focused', 'Intentional'],
      });
    }
  };

  const restoreDraft = async () => {
    try {
      const draftStr = await AsyncStorage.getItem('origin_story_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.photo) {
          setOriginData((prev) => ({ ...prev, photo: draft.photo }));
        }
        if (draft.audio) {
          setOriginData((prev) => ({
            ...prev,
            audioUri: draft.audio,
            audioDuration: draft.duration || 0,
          }));
        }
      }
    } catch (error) {
      console.error('[ORIGIN_STORY] Failed to restore draft:', error);
    }
  };

  //====================
  // SCREEN 1: NARRATIVE VALIDATION
  //====================

  const handleScreen1Continue = () => {
    // TODO: Track event - origin_story_intro_viewed
    setCurrentStep(2);
  };

  //====================
  // SCREEN 2: ORIGIN STORY CAPTURE
  //====================

  // Photo capture (PLACEHOLDER - actual camera integration pending)
  const handleTakePhoto = async () => {
    try {
      // Placeholder: Set a mock photo URI
      const photoUri = 'placeholder://photo';
      setOriginData((prev) => ({ ...prev, photo: photoUri }));

      // Save to AsyncStorage immediately
      await AsyncStorage.setItem(
        'origin_story_draft',
        JSON.stringify({
          photo: photoUri,
          audio: originData.audioUri,
          duration: originData.audioDuration,
          timestamp: Date.now(),
        })
      );

      console.log('[ORIGIN_STORY] Placeholder photo captured');
      // TODO: Track event - origin_story_photo_captured
    } catch (error) {
      console.error('[ORIGIN_STORY] Photo capture error:', error);
      Alert.alert('Photo Capture Failed', 'Unable to capture photo. Please try again.');
    }
  };

  // Audio recording (PLACEHOLDER - actual recording integration pending)
  const startRecording = async () => {
    try {
      // Placeholder: Set mock audio data immediately
      const audioUri = 'placeholder://audio';
      const audioDuration = 30; // Mock 30 second recording

      setOriginData((prev) => ({
        ...prev,
        audioUri: audioUri,
        audioDuration: audioDuration,
      }));

      // Save to AsyncStorage immediately
      const draftStr = await AsyncStorage.getItem('origin_story_draft');
      const draft = draftStr ? JSON.parse(draftStr) : {};
      await AsyncStorage.setItem(
        'origin_story_draft',
        JSON.stringify({
          ...draft,
          audio: audioUri,
          duration: audioDuration,
          timestamp: Date.now(),
        })
      );

      console.log('[ORIGIN_STORY] Placeholder audio recorded');
      // TODO: Track event - origin_story_voice_recorded
    } catch (error) {
      console.error('[ORIGIN_STORY] Recording start error:', error);
      Alert.alert('Recording Failed', 'Microphone unavailable. Please check settings.');
    }
  };

  // Placeholder function - not used with mock recording
  const stopRecording = async () => {
    // No-op for placeholder mode
    console.log('[ORIGIN_STORY] stopRecording called (placeholder mode - no action)');
  };

  // Placeholder function - not functional with mock audio
  const playAudio = async () => {
    if (!originData.audioUri) return;

    // Simulate playback toggle for placeholder mode
    console.log('[ORIGIN_STORY] playAudio called (placeholder mode - simulating playback)');
    setIsPlayingAudio(!isPlayingAudio);

    // Auto-stop after 2 seconds to simulate playback
    if (!isPlayingAudio) {
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 2000);
    }
  };

  const handleScreen2Continue = () => {
    if (!originData.photo || !originData.audioUri) {
      return; // Button should be disabled, but double-check
    }
    setCurrentStep(3);
  };

  //====================
  // SCREEN 3: COMPLETION & REINFORCEMENT
  //====================

  useEffect(() => {
    if (currentStep === 3) {
      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Trigger confetti
      if (confettiRef.current) {
        confettiRef.current.start();
      }

      // TODO: Track event - origin_story_created

      // Clear draft from AsyncStorage
      AsyncStorage.removeItem('origin_story_draft');

      // TODO (Story 0-4): Backend integration
      // 1. Upload photo to Supabase Storage
      // 2. Upload audio to Supabase Storage
      // 3. Create origin_stories record
      // 4. Update user_profiles: first_bind_completed_at, user_level = 1
    }
  }, [currentStep]);

  const handleScreen3Continue = () => {
    // TODO: Track event - origin_bind_completed
    router.push('/(onboarding)/first-needle');
  };

  //====================
  // RENDER SCREENS
  //====================

  const renderScreen1 = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 24,
            color: '#1a1a1a',
          }}
        >
          This is where your story shifts.
        </RNText>

        {/* Dynamic Content */}
        <View style={{ marginBottom: 40 }}>
          {/* Struggle */}
          <Text
            style={{
              fontSize: 17,
              lineHeight: 26,
              color: '#333333',
              opacity: 0.9,
              marginBottom: 20,
            }}
          >
            {narrativeContent.struggle}
          </RNText>

          {/* Aspiration */}
          <Text
            style={{
              fontSize: 17,
              lineHeight: 26,
              color: '#333333',
              opacity: 0.9,
              marginBottom: 20,
            }}
          >
            {narrativeContent.aspiration}
          </RNText>

          {/* Bridge */}
          <Text
            style={{
              fontSize: 17,
              lineHeight: 26,
              color: '#333333',
              opacity: 0.9,
            }}
          >
            {narrativeContent.bridge}
          </RNText>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 32,
          backgroundColor: '#FFFFFF',
        }}
      >
        <TouchableOpacity
          onPress={handleScreen1Continue}
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 16,
            borderRadius: 12,
            minHeight: MIN_TOUCH_TARGET,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Take the first step"
          accessibilityRole="button"
        >
          <RNText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
            Take the first step →
          </RNText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderScreen2 = () => {
    const isContinueEnabled = !!(originData.photo && originData.audioUri);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: '600',
              marginBottom: 12,
              color: '#1a1a1a',
            }}
          >
            Let's make this moment official.
          </RNText>

          {/* Subheading */}
          <Text
            style={{
              fontSize: 16,
              color: '#666666',
              opacity: 0.85,
              marginBottom: 32,
            }}
          >
            Capture where you are now — and commit to where you're going.
          </RNText>

          {/* From/To Summary Card */}
          <View
            style={{
              backgroundColor: '#F5F5F5',
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: '#E0E0E0',
            }}
          >
            <View style={{ marginBottom: 12 }}>
              <RNText style={{ fontSize: 14, fontWeight: '700', color: '#666' }}>From:</RNText>
              <RNText style={{ fontSize: 15, color: '#333', marginTop: 4 }}>
                {originData.fromText}
              </RNText>
            </View>
            <View>
              <RNText style={{ fontSize: 14, fontWeight: '700', color: '#666' }}>To:</RNText>
              <RNText style={{ fontSize: 15, color: '#333', marginTop: 4 }}>{originData.toText}</RNText>
            </View>
          </View>

          {/* Photo Capture */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 12,
                color: '#1a1a1a',
              }}
            >
              1. Take a photo
            </RNText>
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={{
                backgroundColor: '#2196F3',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                minHeight: MIN_TOUCH_TARGET,
              }}
              accessibilityLabel="Take your origin story photo"
              accessibilityHint="Opens camera to capture a photo representing where you are now"
              accessibilityRole="button"
            >
              <RNText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                📷 {originData.photo ? 'Retake Photo' : 'Take a Photo'}
              </RNText>
            </TouchableOpacity>
            {originData.photo && (
              <View
                style={{
                  marginTop: 12,
                  alignItems: 'center',
                  backgroundColor: '#E8F5E9',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <RNText style={{ color: '#2E7D32', fontWeight: '600' }}>✓ Photo captured</RNText>
              </View>
            )}
          </View>

          {/* Voice Prompts */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
                fontStyle: 'italic',
              }}
            >
              Suggested prompts:
            </RNText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {VOICE_PROMPTS.map((prompt, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#F0F0F0',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <RNText style={{ fontSize: 13, color: '#555' }}>{prompt}</RNText>
                </View>
              ))}
            </View>
          </View>

          {/* Voice Recording */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 12,
                color: '#1a1a1a',
              }}
            >
              2. Record your commitment
            </RNText>

            {!isRecording && !originData.audioUri && (
              <TouchableOpacity
                onPress={startRecording}
                style={{
                  backgroundColor: '#FF5722',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  minHeight: MIN_TOUCH_TARGET,
                }}
                accessibilityLabel="Record your commitment"
                accessibilityHint="Starts recording. Speak for up to 60 seconds about why this matters to you"
                accessibilityRole="button"
              >
                <RNText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  🎤 Start Recording
                </RNText>
              </TouchableOpacity>
            )}

            {isRecording && (
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: '#FFEBEE',
                    padding: 20,
                    borderRadius: 12,
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#F44336',
                      marginBottom: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '700',
                      color: '#D32F2F',
                      marginBottom: 8,
                    }}
                  >
                    {Math.max(0, 60 - recordingTime)}s
                  </RNText>
                  <RNText style={{ fontSize: 14, color: '#666' }}>Recording...</RNText>
                </View>
                <TouchableOpacity
                  onPress={stopRecording}
                  style={{
                    backgroundColor: '#333',
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 16,
                    minHeight: MIN_TOUCH_TARGET,
                  }}
                >
                  <RNText style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Stop</RNText>
                </TouchableOpacity>
              </View>
            )}

            {originData.audioUri && !isRecording && (
              <View>
                <View
                  style={{
                    backgroundColor: '#E8F5E9',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#2E7D32',
                          marginBottom: 4,
                        }}
                      >
                        ✓ Commitment recorded
                      </RNText>
                      <RNText style={{ fontSize: 14, color: '#555' }}>
                        {originData.audioDuration} seconds
                      </RNText>
                    </View>
                    <TouchableOpacity
                      onPress={playAudio}
                      style={{
                        backgroundColor: '#4CAF50',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                      accessibilityLabel="Play your recorded commitment"
                      accessibilityHint={`Plays back your voice recording. Duration: ${originData.audioDuration} seconds`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={{
                          color: '#FFF',
                          fontSize: 14,
                          fontWeight: '600',
                        }}
                      >
                        {isPlayingAudio ? '⏸ Pause' : '▶ Play'}
                      </RNText>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={startRecording}
                  style={{
                    backgroundColor: '#F5F5F5',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <RNText style={{ color: '#555', fontSize: 14 }}>🔄 Re-record</RNText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Preview Card (only if both captured) */}
          {originData.photo && originData.audioUri && (
            <View
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
              accessibilityLabel="Origin story preview"
              accessibilityHint="Shows your photo and voice commitment. Tap elements to review or retake"
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 12,
                  color: '#1a1a1a',
                }}
              >
                Your Origin Story
              </RNText>
              <RNText style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                From: {originData.fromText.substring(0, 60)}...
              </RNText>
              <RNText style={{ fontSize: 14, color: '#666' }}>To: {originData.toText}</RNText>
            </View>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 32,
            backgroundColor: '#FFFFFF',
          }}
        >
          <TouchableOpacity
            onPress={handleScreen2Continue}
            disabled={!isContinueEnabled}
            style={{
              backgroundColor: isContinueEnabled ? '#4CAF50' : '#CCCCCC',
              paddingVertical: 16,
              borderRadius: 12,
              minHeight: MIN_TOUCH_TARGET,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isContinueEnabled ? 1 : 0.5,
            }}
            accessibilityLabel="Complete Bind"
            accessibilityRole="button"
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              Complete Bind
            </RNText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const renderScreen3 = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2500}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
          alignItems: 'center',
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 16,
            color: '#1a1a1a',
          }}
        >
          You've completed your first bind!
        </RNText>

        {/* Subheading */}
        <Text
          style={{
            fontSize: 17,
            textAlign: 'center',
            color: '#666666',
            opacity: 0.85,
            marginBottom: 48,
            lineHeight: 26,
            paddingHorizontal: 8,
          }}
        >
          The origin story you've just made is the first of many actions you'll take that
          strengthens us both.
        </RNText>

        {/* Weave Character Animation Placeholder */}
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: '#E8F5E9',
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <RNText style={{ fontSize: 60 }}>🧵</RNText>
        </View>

        {/* Level Progress Bar */}
        <View style={{ width: '80%', marginBottom: 40 }}>
          <View
            style={{
              height: 8,
              backgroundColor: '#E0E0E0',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#4CAF50',
                borderRadius: 4,
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 8,
              fontSize: 16,
              fontWeight: '600',
              color: '#4CAF50',
            }}
          >
            Level 1
          </RNText>
        </View>

        {/* Origin Story Summary */}
        <View
          style={{
            backgroundColor: '#F5F5F5',
            borderRadius: 12,
            padding: 16,
            width: '100%',
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#C8E6C9',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <RNText style={{ fontSize: 24 }}>📷</RNText>
            </View>
            <View style={{ flex: 1 }}>
              <RNText style={{ fontSize: 14, color: '#666' }}>
                From: {originData.fromText.substring(0, 40)}...
              </RNText>
              <RNText style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                To: {originData.toText.substring(0, 40)}...
              </RNText>
            </View>
          </View>
          <RNText style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
            🎤 {originData.audioDuration}s commitment recorded
          </RNText>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 32,
          backgroundColor: '#FFFFFF',
        }}
      >
        <TouchableOpacity
          onPress={handleScreen3Continue}
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 16,
            borderRadius: 12,
            minHeight: MIN_TOUCH_TARGET,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Continue"
          accessibilityRole="button"
        >
          <RNText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Continue</RNText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  //====================
  // MAIN RENDER
  //====================

  return (
    <>
      {currentStep === 1 && renderScreen1()}
      {currentStep === 2 && renderScreen2()}
      {currentStep === 3 && renderScreen3()}
    </>
  );
}
