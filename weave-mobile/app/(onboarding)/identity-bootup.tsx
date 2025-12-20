/**
 * Story 1.6: Identity Bootup - 3-Step Onboarding Flow
 *
 * Step 1: Name Entry (<10s)
 * Step 2: Weave Personality Selection (<20s)
 * Step 3: Identity Traits (Aspirational Focus) (<10s)
 *
 * Total target time: <45 seconds
 *
 * This screen uses a step state machine for smooth transitions between steps.
 * All data is collected locally and will be written to database at the end (deferred to Story 0-4).
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  PanResponder,
  Animated,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PERSONAS, PersonalityType } from '@/constants/personalityContent';
import {
  IDENTITY_TRAITS,
  REQUIRED_TRAITS,
  IdentityTrait,
  isValidTraitCount,
} from '@/constants/identityTraits';

// UI Constants
const CARD_WIDTH_RATIO = 0.8;
const CARD_SPACING = 40;
const MIN_TOUCH_TARGET = 56; // iOS HIG minimum touch target
const PERSONA_CARD_MIN_HEIGHT = 400;
const INPUT_FOCUS_DELAY = 100;

// Animation Constants
const SWIPE_ANIMATION_CONFIG = {
  useNativeDriver: true,
  friction: 8, // Lower = faster/bouncier, higher = slower/smoother
};

type Step = 1 | 2 | 3;

interface OnboardingData {
  preferred_name: string;
  core_personality: PersonalityType | null;
  personality_selected_at: Date | null;
  identity_traits: IdentityTrait[];
}

export default function IdentityBootupScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Step state machine
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Collected onboarding data
  const [formData, setFormData] = useState<OnboardingData>({
    preferred_name: '',
    core_personality: null,
    personality_selected_at: null,
    identity_traits: [],
  });

  // Step 1: Name Entry State
  const [nameError, setNameError] = useState<string | undefined>();

  // Step 2: Personality Selection State
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [viewedPersonas, setViewedPersonas] = useState<boolean[]>(
    Array(PERSONAS.length).fill(false)
  );
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconPulseAnim = useRef(new Animated.Value(1)).current;

  // Step 3: Identity Traits State
  const [maxTraitsError, setMaxTraitsError] = useState<string | undefined>();

  // Auto-focus name input on mount (Step 1)
  const nameInputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (currentStep === 1) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, INPUT_FOCUS_DELAY);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  //======================
  // STEP 1: NAME ENTRY
  //======================

  /**
   * Validate name input (1-50 chars, no special characters)
   */
  const validateName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Name is required' };
    }

    if (name.length < 1 || name.length > 50) {
      return { valid: false, error: 'Name must be 1-50 characters' };
    }

    // Allow letters, numbers, spaces, hyphens, apostrophes
    const validPattern = /^[a-zA-Z0-9\s\-']+$/;
    if (!validPattern.test(name)) {
      return {
        valid: false,
        error: 'Please enter a valid name (1-50 characters, no special characters)',
      };
    }

    return { valid: true };
  };

  const handleNameChange = (text: string) => {
    setFormData({ ...formData, preferred_name: text });
    const validation = validateName(text);
    setNameError(validation.error);
  };

  // Memoize validation to avoid redundant calls
  const nameValidation = useMemo(
    () => validateName(formData.preferred_name),
    [formData.preferred_name]
  );

  const handleStep1Continue = () => {
    try {
      if (!nameValidation.valid) {
        setNameError(nameValidation.error);
        return;
      }

      // TODO (Story 0-4): Track analytics event
      // trackEvent('name_entered', { user_id: anonymized });

      setCurrentStep(2);
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Step 1 error:', error);
      }
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  //================================
  // STEP 2: PERSONALITY SELECTION
  //================================

  /**
   * PanResponder for swipe gestures on persona cards
   * Note: Not memoized to avoid stale closure bugs with handleSwipe
   */
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Activate when horizontal movement exceeds vertical and threshold is met
      return (
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      );
    },
    onPanResponderRelease: (_, gestureState) => {
      // Swipe left (next card) if moved more than 50px to the left
      if (gestureState.dx < -50) {
        handleSwipe('left');
      }
      // Swipe right (previous card) if moved more than 50px to the right
      else if (gestureState.dx > 50) {
        handleSwipe('right');
      }
    },
  });

  /**
   * Handle swipe to next/previous persona
   */
  const handleSwipe = (direction: 'left' | 'right') => {
    try {
      const newIndex =
        direction === 'left'
          ? Math.min(currentPersonaIndex + 1, PERSONAS.length - 1)
          : Math.max(currentPersonaIndex - 1, 0);

      if (newIndex !== currentPersonaIndex) {
        // Mark persona as viewed
        const newViewed = [...viewedPersonas];
        newViewed[newIndex] = true;
        setViewedPersonas(newViewed);

        // TODO (Story 0-4): Track analytics event
        // trackEvent('weave_personality_swiped', { from: currentPersonaIndex, to: newIndex });

        // Animate slide (card width + margin spacing)
        const cardWidth = SCREEN_WIDTH * CARD_WIDTH_RATIO;
        Animated.spring(slideAnim, {
          toValue: -newIndex * (cardWidth + CARD_SPACING),
          ...SWIPE_ANIMATION_CONFIG,
        }).start();

        setCurrentPersonaIndex(newIndex);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Swipe error:', error);
      }
    }
  };

  /**
   * Handle persona selection (tap to select)
   */
  const handlePersonaSelect = (personalityType: PersonalityType) => {
    try {
      setFormData({
        ...formData,
        core_personality: personalityType,
        personality_selected_at: new Date(),
      });

      // TODO (Story 0-4): Track analytics event
      // trackEvent('weave_personality_selected', { personality: personalityType });
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Persona select error:', error);
      }
      Alert.alert('Error', 'Failed to select personality. Please try again.');
    }
  };

  const handleStep2Continue = () => {
    try {
      if (!formData.core_personality) {
        Alert.alert('Selection Required', 'Please select a personality style before continuing.');
        return;
      }

      if (!viewedPersonas.every((v) => v)) {
        Alert.alert(
          'View All Options',
          'Please swipe to view both personality styles before continuing.'
        );
        return;
      }

      setCurrentStep(3);
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Step 2 error:', error);
      }
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const canContinueStep2 = formData.core_personality !== null && viewedPersonas.every((v) => v);

  // Mark first persona as viewed on load
  useEffect(() => {
    if (currentStep === 2 && !viewedPersonas[0]) {
      const newViewed = [...viewedPersonas];
      newViewed[0] = true;
      setViewedPersonas(newViewed);

      // TODO (Story 0-4): Track analytics event
      // trackEvent('weave_personality_shown');
    }
  }, [currentStep]);

  // Animate Weave icon pulse on Step 2
  useEffect(() => {
    if (currentStep === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulseAnim, {
            toValue: 1.08,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStep, iconPulseAnim]);

  //==================================
  // STEP 3: IDENTITY TRAITS SELECTION
  //==================================

  /**
   * Handle trait selection/deselection
   */
  const handleTraitPress = (trait: IdentityTrait) => {
    try {
      const currentTraits = formData.identity_traits;
      let newTraits: IdentityTrait[];

      if (currentTraits.includes(trait)) {
        // Deselect
        newTraits = currentTraits.filter((t) => t !== trait);
        setMaxTraitsError(undefined);
      } else if (currentTraits.length < REQUIRED_TRAITS) {
        // Select (if under required count)
        newTraits = [...currentTraits, trait];
        setMaxTraitsError(undefined);
      } else {
        // At max, show inline error
        setMaxTraitsError(`Choose exactly ${REQUIRED_TRAITS} traits`);
        return;
      }

      // Sync with formData immediately (fixes state sync bug)
      setFormData((current) => ({
        ...current,
        identity_traits: newTraits,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Trait press error:', error);
      }
    }
  };

  const handleStep3Continue = () => {
    try {
      if (!isValidTraitCount(formData.identity_traits.length)) {
        Alert.alert(
          'Selection Required',
          `Please select exactly ${REQUIRED_TRAITS} traits before continuing.`
        );
        return;
      }

      // TODO (Story 0-4): Write to database via Supabase
      // await supabase.from('user_profiles').update({
      //   preferred_name: formData.preferred_name,
      //   core_personality: formData.core_personality,
      //   personality_selected_at: formData.personality_selected_at,
      //   identity_traits: formData.identity_traits
      // }).eq('auth_user_id', user.id);

      // TODO (Story 0-4): Track analytics event
      // trackEvent('identity_traits_selected', { traits: formData.identity_traits });

      // Navigate to Story 1.7 (First Needle / Goal Input)
      router.push('/(onboarding)/first-needle');
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Step 3 error:', error);
      }
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const canContinueStep3 = isValidTraitCount(formData.identity_traits.length);

  //=================
  // NAVIGATION
  //=================

  /**
   * Handle back navigation
   */
  const handleBackPress = () => {
    try {
      if (currentStep > 1) {
        setCurrentStep((currentStep - 1) as Step);
      } else {
        router.back();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[ONBOARDING] Back navigation error:', error);
      }
      router.back(); // Fallback
    }
  };

  //=================
  // RENDER HELPERS
  //=================

  /**
   * Render Step 1: Name Entry
   */
  const renderStep1 = () => (
    <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
      {/* Header */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '600',
          color: '#1A1A1A',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        Let's get to know you
      </Text>

      {/* Input Field */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
          What should we call you?
        </Text>
        <TextInput
          ref={nameInputRef}
          value={formData.preferred_name}
          onChangeText={handleNameChange}
          placeholder="Your first name or nickname"
          placeholderTextColor="#999"
          style={{
            borderWidth: 2,
            borderColor: nameError ? '#EF4444' : '#E0E0E0',
            borderRadius: 12,
            padding: 16,
            fontSize: 18,
            backgroundColor: '#FFFFFF',
            minHeight: 56,
          }}
          maxLength={50}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleStep1Continue}
        />
        {nameError && (
          <Text style={{ color: '#EF4444', fontSize: 14, marginTop: 8 }}>{nameError}</Text>
        )}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleStep1Continue}
        disabled={!nameValidation.valid}
        style={{
          backgroundColor: nameValidation.valid ? '#4CAF50' : '#CCCCCC',
          borderRadius: 12,
          padding: 16,
          minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: nameValidation.valid ? 1 : 0.5,
        }}
        accessibilityRole="button"
        accessibilityLabel="Continue to personality selection"
        accessibilityHint="Proceeds to step 2 where you'll choose your Weave's interaction style"
        accessibilityState={{ disabled: !nameValidation.valid }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Continue</Text>
      </TouchableOpacity>

      {/* Back Button */}
      {currentStep > 1 && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            marginTop: 16,
            padding: 12,
            alignItems: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous step"
        >
          <Text style={{ color: '#666', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Render Step 2: Personality Selection
   */
  const renderStep2 = () => (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 20,
          justifyContent: 'center',
        }}
      >
        {/* Title & Subheading */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: '#1A1A1A',
              textAlign: 'center',
              marginBottom: 12,
              lineHeight: 32,
            }}
          >
            I'm your Weave, your future self that we create together. How should I engage with you?
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#666',
              opacity: 0.9,
              textAlign: 'center',
              lineHeight: 24,
            }}
          >
            You can change this anytime. This sets my core personality — and I'll adapt as I
            understand you better.
          </Text>
        </View>

        {/* Swipeable Persona Cards */}
        <View style={{ flex: 1, alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: SCREEN_WIDTH * CARD_WIDTH_RATIO,
              height: PERSONA_CARD_MIN_HEIGHT,
              position: 'relative',
            }}
            {...panResponder.panHandlers}
          >
            <Animated.View
              style={{
                flexDirection: 'row',
                transform: [{ translateX: slideAnim }],
              }}
            >
              {PERSONAS.map((persona, index) => (
                <TouchableOpacity
                  key={persona.id}
                  onPress={() => handlePersonaSelect(persona.id)}
                  activeOpacity={0.8}
                  style={{
                    width: SCREEN_WIDTH * CARD_WIDTH_RATIO,
                    marginRight: index < PERSONAS.length - 1 ? CARD_SPACING : 0,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${persona.title} personality style`}
                  accessibilityHint={`Double tap to select ${persona.title}. ${persona.subtitle}`}
                  accessibilityState={{ selected: formData.core_personality === persona.id }}
                >
                  {/* Persona Card */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 24,
                      borderWidth: formData.core_personality === persona.id ? 3 : 1,
                      borderColor:
                        formData.core_personality === persona.id ? '#4CAF50' : 'rgba(0, 0, 0, 0.1)',
                      padding: 24,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 5,
                      minHeight: PERSONA_CARD_MIN_HEIGHT,
                    }}
                  >
                    {/* Weave Icon with Pulse Animation */}
                    <Animated.View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#E8F5E9',
                        alignSelf: 'center',
                        marginBottom: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: [{ scale: iconPulseAnim }],
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>🧵</Text>
                    </Animated.View>

                    {/* Title */}
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '600',
                        color: '#1A1A1A',
                        textAlign: 'center',
                        marginBottom: 8,
                      }}
                    >
                      {persona.title}
                    </Text>

                    {/* Subtitle */}
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#666',
                        textAlign: 'center',
                        marginBottom: 24,
                        fontStyle: 'italic',
                      }}
                    >
                      {persona.subtitle}
                    </Text>

                    {/* Example Lines */}
                    <View style={{ marginTop: 16 }}>
                      {persona.exampleLines.map((line, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: '#F5F5F5',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              color: '#333',
                              lineHeight: 22,
                            }}
                          >
                            {line}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Selected Indicator */}
                    {formData.core_personality === persona.id && (
                      <View
                        style={{
                          marginTop: 16,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#4CAF50', fontWeight: '600', fontSize: 16 }}>
                          ✓ Selected
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>

          {/* Navigation Arrows (Accessibility Fallback) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => handleSwipe('right')}
              disabled={currentPersonaIndex === 0}
              style={{
                opacity: currentPersonaIndex === 0 ? 0.3 : 1,
                padding: 16,
                minHeight: MIN_TOUCH_TARGET,
              }}
              accessibilityRole="button"
              accessibilityLabel="Previous personality"
              accessibilityHint="Navigate to the previous personality option"
              accessibilityState={{ disabled: currentPersonaIndex === 0 }}
            >
              <Text style={{ fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSwipe('left')}
              disabled={currentPersonaIndex === PERSONAS.length - 1}
              style={{
                opacity: currentPersonaIndex === PERSONAS.length - 1 ? 0.3 : 1,
                padding: 16,
                minHeight: MIN_TOUCH_TARGET,
              }}
              accessibilityRole="button"
              accessibilityLabel="Next personality"
              accessibilityHint="Navigate to the next personality option"
              accessibilityState={{ disabled: currentPersonaIndex === PERSONAS.length - 1 }}
            >
              <Text style={{ fontSize: 24 }}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View
            style={{ flexDirection: 'row', marginTop: 16 }}
            accessibilityRole="adjustable"
            accessibilityLabel={`Personality ${currentPersonaIndex + 1} of ${PERSONAS.length}`}
          >
            {PERSONAS.map((persona, index) => (
              <View
                key={index}
                accessible={true}
                accessibilityLabel={`${persona.title}, page ${index + 1} of ${PERSONAS.length}`}
                accessibilityState={{ selected: index === currentPersonaIndex }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentPersonaIndex ? '#4CAF50' : '#E0E0E0',
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleStep2Continue}
          disabled={!canContinueStep2}
          style={{
            backgroundColor: canContinueStep2 ? '#4CAF50' : '#CCCCCC',
            borderRadius: 12,
            padding: 16,
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: canContinueStep2 ? 1 : 0.5,
            marginTop: 24,
          }}
          accessibilityRole="button"
          accessibilityLabel="Continue to identity traits"
          accessibilityHint="Proceeds to step 3 where you'll choose traits you want to develop"
          accessibilityState={{ disabled: !canContinueStep2 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            marginTop: 16,
            padding: 12,
            alignItems: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to name entry"
        >
          <Text style={{ color: '#666', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  /**
   * Render Step 3: Identity Traits Selection
   */
  const renderStep3 = () => (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
      >
        {/* Header with personalized name */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '600',
              color: '#1A1A1A',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Who do we want to become?
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#666',
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Choose the 3 most important qualities you want to embody.
          </Text>
        </View>

        {/* Trait Chips */}
        <View style={{ marginBottom: 24 }}>
          {IDENTITY_TRAITS.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              {row.map((trait) => {
                const isSelected = formData.identity_traits.includes(trait);
                const isDisabled =
                  !isSelected && formData.identity_traits.length >= REQUIRED_TRAITS;
                return (
                  <TouchableOpacity
                    key={trait}
                    onPress={() => handleTraitPress(trait)}
                    disabled={isDisabled}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: isSelected ? '#4CAF50' : '#E0E0E0',
                      backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                      margin: 6,
                      minHeight: MIN_TOUCH_TARGET,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: isDisabled ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${trait} trait`}
                    accessibilityHint={
                      isSelected
                        ? 'Double tap to deselect this trait'
                        : 'Double tap to select this trait'
                    }
                    accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 16,
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? '#4CAF50' : '#333333',
                      }}
                    >
                      {trait}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Max Traits Error */}
        {maxTraitsError && (
          <View style={{ marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: '#EF4444', fontSize: 14 }}>{maxTraitsError}</Text>
          </View>
        )}

        {/* Selection Counter */}
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: canContinueStep3 ? '#4CAF50' : '#666',
            }}
          >
            {formData.identity_traits.length} of {REQUIRED_TRAITS} selected
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleStep3Continue}
          disabled={!canContinueStep3}
          style={{
            backgroundColor: canContinueStep3 ? '#4CAF50' : '#CCCCCC',
            borderRadius: 12,
            padding: 16,
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: canContinueStep3 ? 1 : 0.5,
          }}
          accessibilityRole="button"
          accessibilityLabel="Complete identity bootup"
          accessibilityHint="Completes onboarding and saves your selections"
          accessibilityState={{ disabled: !canContinueStep3 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            marginTop: 16,
            padding: 12,
            alignItems: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to personality selection"
        >
          <Text style={{ color: '#666', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  //=============
  // MAIN RENDER
  //=============

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Progress Indicator (Optional) */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 24,
          paddingVertical: 16,
          justifyContent: 'center',
        }}
      >
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={{
              flex: 1,
              height: 4,
              backgroundColor: currentStep >= step ? '#4CAF50' : '#E0E0E0',
              marginHorizontal: 4,
              borderRadius: 2,
            }}
          />
        ))}
      </View>

      {/* Render Current Step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </SafeAreaView>
  );
}
