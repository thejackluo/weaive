/**
 * Personality Content for Weave Persona Selection (Story 1.6)
 *
 * Two distinct personas that determine how the Weave AI coach interacts with the user:
 * - Supportive but Direct: Professional, grounded, confidence-building
 * - Tough but Warm: Gen Z-coded, playful, gently confrontational
 *
 * NOTE: Renamed from PersonalityType to OnboardingPersonaType to avoid collision
 * with Story 6.2's PersonalityType ('dream_self' | 'weave_ai')
 */

export type OnboardingPersonaType = 'supportive_direct' | 'tough_warm';

export interface PersonaContent {
  id: OnboardingPersonaType;
  title: string;
  subtitle: string;
  exampleLines: string[];
  caseSensitive: boolean; // true = proper casing, false = lowercase
}

export const PERSONAS: PersonaContent[] = [
  {
    id: 'supportive_direct',
    title: 'Supportive but Direct',
    subtitle: 'grounded, honest, steady, confidence-building without coddling',
    exampleLines: [
      "You don't need motivation — just one clear step. Let's choose it.",
      "You're capable. More than you think. Let's act on it.",
      'If you slipped, just reset. One small restart changes everything.',
    ],
    caseSensitive: true, // Proper casing
  },
  {
    id: 'tough_warm',
    title: 'Tough but Warm',
    subtitle: 'Gen Z-coded, playful, dry humor, gently confrontational, gender-neutral',
    exampleLines: [
      'alright, lock in. you said you wanted this.',
      'nice. that was actually clean. keep the pace.',
      "bro… where'd you go 💀 let's get back to it.",
    ],
    caseSensitive: false, // Lowercase + emoji
  },
];

/**
 * Get persona content by ID
 */
export function getPersonaById(id: OnboardingPersonaType): PersonaContent | undefined {
  return PERSONAS.find((p) => p.id === id);
}

/**
 * Map onboarding persona to backend Weave AI preset (Story 6.1 + 6.2 Integration)
 *
 * Converts user's onboarding persona selection to the backend preset format.
 *
 * Mapping:
 * - supportive_direct → supportive_coach (encouraging, accountability-focused)
 * - tough_warm → gen_z_default (short, warm, Gen Z vibes)
 */
export function mapOnboardingPersonaToPreset(
  persona: OnboardingPersonaType
): 'gen_z_default' | 'supportive_coach' | 'concise_mentor' {
  const mapping: Record<OnboardingPersonaType, 'gen_z_default' | 'supportive_coach'> = {
    supportive_direct: 'supportive_coach',
    tough_warm: 'gen_z_default',
  };
  return mapping[persona];
}

/**
 * Map backend preset to onboarding persona (reverse mapping)
 *
 * Used when loading user's existing preset and displaying it in onboarding UI.
 */
export function mapPresetToOnboardingPersona(
  preset: 'gen_z_default' | 'supportive_coach' | 'concise_mentor'
): OnboardingPersonaType {
  // Note: concise_mentor has no direct onboarding equivalent, defaults to supportive_direct
  const reverseMapping: Record<string, OnboardingPersonaType> = {
    gen_z_default: 'tough_warm',
    supportive_coach: 'supportive_direct',
    concise_mentor: 'supportive_direct', // Fallback
  };
  return reverseMapping[preset] || 'supportive_direct';
}

/**
 * Usage of personality selection throughout the app:
 *
 * - Push notifications tone (Story 8)
 * - Daily reflection voice (Story 5)
 * - Bind completion encouragement (Story 3)
 * - AI chat interface style (Story 7)
 * - Long-term personalization as user data accumulates
 *
 * This file is used in: Story 1.6 (Onboarding - Personality Selection)
 */
