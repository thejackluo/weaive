/**
 * Origin Story Content - Dynamic narrative generation
 * Story 1.7: Commitment Ritual & Origin Story
 *
 * Maps user's selected painpoints (from Story 1.2) and identity traits (from Story 1.6)
 * to create personalized narrative text for Screen 1.
 */

export type PainpointKey = 'clarity' | 'action' | 'consistency' | 'alignment';

/**
 * Struggle statements for each painpoint
 * Used to create dynamic "from" text (current state)
 */
export const PAINPOINT_STRUGGLES: Record<PainpointKey, string> = {
  clarity: "You've been feeling scattered — like there's too much to do, but no clear direction.",
  action: 'You know what you want, but taking consistent action feels impossible.',
  consistency: "You start strong, but momentum fades. You're tired of the cycle.",
  alignment: "Something feels off. You're busy, but not building the life you actually want.",
};

/**
 * Voice commitment prompts
 * Displayed as chips to guide users during audio recording
 */
export const VOICE_PROMPTS: string[] = [
  'Why does this matter to you?',
  'What will be different in 10 days?',
  'What are you leaving behind?',
];

/**
 * Generate dynamic narrative content for Screen 1
 * @param painpoints - User's selected painpoints from Story 1.2
 * @param identityTraits - User's selected identity traits from Story 1.6
 * @returns Object with struggle, aspiration, and bridge text
 */
export function generateNarrativeText(
  painpoints: string[],
  identityTraits: string[]
): {
  struggle: string;
  aspiration: string;
  bridge: string;
} {
  // Map painpoints to struggle statements
  const struggles = painpoints
    .filter((p): p is PainpointKey => ['clarity', 'action', 'consistency', 'alignment'].includes(p))
    .map((p) => PAINPOINT_STRUGGLES[p])
    .join(' ');

  // Create aspiration text from identity traits (first 3)
  const traitsList = identityTraits
    .slice(0, 3)
    .map((trait, index) => {
      if (index === identityTraits.length - 1 || index === 2) {
        return trait; // Last trait (no comma)
      } else if (index === identityTraits.length - 2 || index === 1) {
        return `${trait}, and`; // Second-to-last trait (comma + and)
      } else {
        return `${trait},`; // Other traits (comma)
      }
    })
    .join(' ');

  const aspiration = `You want to become someone ${traitsList} — someone who acts with purpose.`;

  // Bridge statement (fixed)
  const bridge =
    'Weave helps you turn that vision into reality, one small bind at a time. This is where you begin.';

  return {
    struggle: struggles || "You're ready for a change.",
    aspiration,
    bridge,
  };
}

/**
 * Generate "From/To" summary text for Screen 2 and Screen 3
 * @param painpoints - User's selected painpoints
 * @param identityTraits - User's selected identity traits
 * @returns Object with fromText and toText
 */
export function generateFromToSummary(
  painpoints: string[],
  identityTraits: string[]
): {
  fromText: string;
  toText: string;
} {
  // Use first painpoint for "from" text
  const firstPainpoint = painpoints[0] as PainpointKey;
  const fromText = PAINPOINT_STRUGGLES[firstPainpoint] || 'Feeling stuck and ready for change.';

  // Use all traits for "to" text
  const toText = identityTraits.slice(0, 5).join(', ');

  return { fromText, toText };
}
