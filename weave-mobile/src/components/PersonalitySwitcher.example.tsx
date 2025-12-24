/**
 * PersonalitySwitcher Usage Examples (Story 6.2)
 *
 * Demonstrates how to use the PersonalitySwitcher component in different contexts
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Heading, Body } from '@/design-system';
import { PersonalitySwitcher } from './PersonalitySwitcher';

/**
 * Example 1: Full version in settings screen
 *
 * Use the full version with details when you have space to show
 * personality information (name, traits, speaking style).
 */
export function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-opal-950 p-4">
      <Heading level={2} className="mb-6">
        Settings
      </Heading>

      {/* Other settings... */}

      <PersonalitySwitcher
        onSwitch={(newPersonality) => {
          console.log('User switched to:', newPersonality);
          // Optional: Track analytics event
          // trackEvent('personality_switched', { personality: newPersonality });
        }}
      />

      {/* More settings... */}
    </ScrollView>
  );
}

/**
 * Example 2: Compact version in header/navbar
 *
 * Use the compact version in constrained spaces like headers,
 * navigation bars, or floating action buttons.
 */
export function ChatScreenHeader() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-opal-900/50">
      <Heading level={3}>AI Coach</Heading>

      <PersonalitySwitcher
        compact
        onSwitch={(newPersonality) => {
          console.log('Switched personality in chat:', newPersonality);
        }}
      />
    </View>
  );
}

/**
 * Example 3: Inline in AI chat interface
 *
 * Show personality context directly in the chat interface
 * where AI responses are displayed.
 */
export function AIChatScreen() {
  return (
    <View className="flex-1 bg-opal-950">
      {/* Chat messages... */}

      <View className="p-4 border-t border-opal-800">
        <Body className="text-opal-400 mb-3 text-center">Choose your AI coach style:</Body>

        <PersonalitySwitcher compact className="justify-center" />
      </View>
    </View>
  );
}

/**
 * Example 4: Modal/Sheet for personality selection
 *
 * Show full details in a modal when user taps to learn more
 * about personality options.
 */
export function PersonalitySelectionModal({ onClose }: { onClose: () => void }) {
  return (
    <View className="flex-1 bg-opal-950/95 p-6 justify-center">
      <Heading level={2} className="mb-4 text-center">
        Choose Your AI Coach
      </Heading>

      <Body className="text-opal-400 text-center mb-6">
        Switch between a personalized coach (Dream Self) or general supportive coach (Weave AI)
      </Body>

      <PersonalitySwitcher
        onSwitch={(newPersonality) => {
          console.log('Selected:', newPersonality);
          // Close modal after selection
          setTimeout(onClose, 500);
        }}
      />
    </View>
  );
}

/**
 * Example 5: Onboarding flow integration
 *
 * Allow users to choose their initial personality during onboarding
 */
export function OnboardingPersonalityStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="flex-1 bg-opal-950 p-6">
      <Heading level={2} className="mb-4">
        Meet Your AI Coach
      </Heading>

      <Body className="text-opal-400 mb-6">
        Weave offers two AI coaching styles. Choose the one that fits you best. You can change this
        anytime in settings.
      </Body>

      <PersonalitySwitcher
        onSwitch={(newPersonality) => {
          console.log('Onboarding personality selected:', newPersonality);
          // Move to next onboarding step
          onNext();
        }}
      />
    </View>
  );
}

/**
 * Example 6: Conditional rendering based on personality
 *
 * Use the usePersonality hook to conditionally render UI
 * based on active personality.
 */
export function PersonalityAwareComponent() {
  const { personality } = usePersonality();

  return (
    <View className="p-4">
      {personality?.personality_type === 'dream_self' ? (
        <Body className="text-purple-400">🌟 {personality.name} is here to guide you!</Body>
      ) : (
        <Body className="text-opal-400">💚 Weave is ready to support you!</Body>
      )}

      {/* Show different UI based on personality... */}
    </View>
  );
}
