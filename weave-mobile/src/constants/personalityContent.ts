/**
 * Personality Content for Weave Persona Selection (Story 1.6)
 *
 * Two distinct personas that determine how the Weave AI coach interacts with the user:
 * - Supportive but Direct: Professional, grounded, confidence-building
 * - Tough but Warm: Gen Z-coded, playful, gently confrontational
 */

export type PersonalityType = 'supportive_direct' | 'tough_warm';

export interface PersonaContent {
  id: PersonalityType;
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
      "If you slipped, just reset. One small restart changes everything."
    ],
    caseSensitive: true // Proper casing
  },
  {
    id: 'tough_warm',
    title: 'Tough but Warm',
    subtitle: 'Gen Z-coded, playful, dry humor, gently confrontational, gender-neutral',
    exampleLines: [
      "alright, lock in. you said you wanted this.",
      "nice. that was actually clean. keep the pace.",
      "bro… where'd you go 💀 let's get back to it."
    ],
    caseSensitive: false // Lowercase + emoji
  }
];

/**
 * Get persona content by ID
 */
export function getPersonaById(id: PersonalityType): PersonaContent | undefined {
  return PERSONAS.find(p => p.id === id);
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
