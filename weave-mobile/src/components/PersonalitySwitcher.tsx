/**
 * PersonalitySwitcher Component (Story 6.2: Dual Personality System)
 *
 * Allows users to switch between Dream Self (personalized) and Weave AI (general coach)
 */

import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Heading, Body, Caption, Button, showSimpleToast } from '@/design-system';
import { usePersonality } from '@/hooks/usePersonality';
import type { PersonalityType } from '@/services/personalityApi';

/**
 * Component props
 */
export interface PersonalitySwitcherProps {
  /** Optional callback when personality is switched */
  onSwitch?: (newPersonality: PersonalityType) => void;
  /** Show as compact version (without details) */
  compact?: boolean;
  /** Custom class name for styling */
  className?: string;
}

/**
 * PersonalitySwitcher - UI for switching AI personalities
 *
 * Features:
 * - Displays current personality (name, traits, speaking style)
 * - Toggle between Dream Self and Weave AI
 * - Loading states during switch
 * - Error handling with toast notifications
 *
 * @example
 * ```tsx
 * // Full version with details
 * <PersonalitySwitcher onSwitch={(type) => console.log('Switched to:', type)} />
 *
 * // Compact version (toggle only)
 * <PersonalitySwitcher compact />
 * ```
 */
export function PersonalitySwitcher({
  onSwitch,
  compact = false,
  className,
}: PersonalitySwitcherProps) {
  const { personality, isSwitching, error, switchTo, clearError } = usePersonality();

  // Handle personality switch
  const handleSwitch = async (newPersonality: PersonalityType) => {
    await switchTo(newPersonality);

    if (error) {
      showSimpleToast({
        type: 'error',
        message: error,
        duration: 3000,
      });
      clearError();
    } else {
      showSimpleToast({
        type: 'success',
        message: `Switched to ${newPersonality === 'dream_self' ? 'Dream Self' : 'Weave AI'}`,
        duration: 2000,
      });
      onSwitch?.(newPersonality);
    }
  };

  const isDreamSelf = personality?.personality_type === 'dream_self';

  // Compact version - toggle only
  if (compact) {
    return (
      <View className={`flex-row items-center gap-3 ${className || ''}`}>
        <Caption className="text-opal-400">AI Coach:</Caption>
        <View className="flex-row items-center gap-2 rounded-full bg-opal-900/40 px-3 py-2">
          <TouchableOpacity
            onPress={() => handleSwitch('weave_ai')}
            disabled={isSwitching || !isDreamSelf}
            className={`px-3 py-1 rounded-full ${!isDreamSelf ? 'bg-opal-500' : 'bg-transparent'}`}
          >
            <Caption className={!isDreamSelf ? 'text-opal-950 font-semibold' : 'text-opal-400'}>
              Weave
            </Caption>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwitch('dream_self')}
            disabled={isSwitching || isDreamSelf}
            className={`px-3 py-1 rounded-full ${isDreamSelf ? 'bg-opal-500' : 'bg-transparent'}`}
          >
            <Caption className={isDreamSelf ? 'text-opal-950 font-semibold' : 'text-opal-400'}>
              Dream Self
            </Caption>
          </TouchableOpacity>

          {isSwitching && <ActivityIndicator size="small" color="#A78BFA" className="ml-2" />}
        </View>
      </View>
    );
  }

  // Full version with details
  return (
    <Card variant="glass" className={`p-6 ${className || ''}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Heading level={3}>AI Coach Personality</Heading>
        {isSwitching && <ActivityIndicator size="small" color="#A78BFA" />}
      </View>

      {/* Current Personality Display */}
      <View className="mb-6 p-4 rounded-lg bg-opal-900/30 border border-opal-700/30">
        <View className="flex-row items-center justify-between mb-3">
          <Caption className="text-opal-400 uppercase tracking-wide">Currently Active</Caption>
          <View
            className={`px-2 py-1 rounded-full ${
              isDreamSelf ? 'bg-purple-500/20' : 'bg-opal-500/20'
            }`}
          >
            <Caption
              className={`font-semibold ${isDreamSelf ? 'text-purple-400' : 'text-opal-400'}`}
            >
              {isDreamSelf ? 'Dream Self' : 'Weave AI'}
            </Caption>
          </View>
        </View>

        <Heading level={4} className="mb-2">
          {personality?.name || 'Weave'}
        </Heading>

        {/* Traits */}
        {personality?.traits && personality.traits.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {personality.traits.map((trait, index) => (
              <View
                key={index}
                className="px-2 py-1 rounded-md bg-opal-800/50 border border-opal-700/30"
              >
                <Caption className="text-opal-300">{trait}</Caption>
              </View>
            ))}
          </View>
        )}

        {/* Speaking Style */}
        {personality?.speaking_style && (
          <Body className="text-opal-400 italic">{personality.speaking_style}</Body>
        )}
      </View>

      {/* Switch Buttons */}
      <View className="gap-3">
        <Button
          variant={isDreamSelf ? 'glass' : 'primary'}
          onPress={() => handleSwitch('dream_self')}
          disabled={isSwitching || isDreamSelf}
          className="w-full"
        >
          <Body className={isDreamSelf ? 'text-opal-400' : 'text-opal-950 font-semibold'}>
            {isDreamSelf ? '✓ Using Dream Self' : 'Switch to Dream Self'}
          </Body>
          {!isDreamSelf && (
            <Caption className="text-opal-900 mt-1">Personalized AI based on your identity</Caption>
          )}
        </Button>

        <Button
          variant={!isDreamSelf ? 'glass' : 'outline'}
          onPress={() => handleSwitch('weave_ai')}
          disabled={isSwitching || !isDreamSelf}
          className="w-full"
        >
          <Body className={!isDreamSelf ? 'text-opal-400' : 'text-opal-300 font-medium'}>
            {!isDreamSelf ? '✓ Using Weave AI' : 'Switch to Weave AI'}
          </Body>
          {isDreamSelf && (
            <Caption className="text-opal-400 mt-1">General supportive coach</Caption>
          )}
        </Button>
      </View>

      {/* Info Text */}
      <Caption className="text-opal-500 text-center mt-4">
        {isDreamSelf
          ? 'Dream Self uses your goals and progress to give personalized advice'
          : 'Weave AI provides general supportive coaching without personalization'}
      </Caption>
    </Card>
  );
}

/**
 * Export default
 */
export default PersonalitySwitcher;
