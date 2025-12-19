/**
 * Identity Traits for User Selection (Story 1.6 - Step 3)
 *
 * 8 aspirational trait options representing qualities the user is actively trying to build.
 * User must select exactly 3 traits during onboarding.
 *
 * These traits are framed as aspirational (who the user is becoming), not fixed personality.
 * Selected traits influence:
 * - Weave's tone (gentle vs direct vs challenging)
 * - Bind difficulty and pacing
 * - Reminder frequency and urgency
 * - Reflection depth and prompt style
 * - Insight framing (performance-oriented vs introspective)
 *
 * Behavioral data takes precedence after onboarding.
 */

export type IdentityTrait =
  | 'Clear about my direction'
  | 'Intentional with my time'
  | 'Takes action even when unsure'
  | 'Shows up consistently'
  | 'Strives for excellence'
  | 'Always improving'
  | 'Self-aware'
  | 'Emotionally grounded';

/**
 * All 8 identity traits organized in 4 rows for UI display
 * (2 traits per row for clean mobile layout)
 */
export const IDENTITY_TRAITS: IdentityTrait[][] = [
  ['Clear about my direction', 'Intentional with my time'],
  ['Takes action even when unsure', 'Shows up consistently'],
  ['Strives for excellence', 'Always improving'],
  ['Self-aware', 'Emotionally grounded']
];

/**
 * Flattened list of all traits (useful for validation)
 */
export const ALL_TRAITS: IdentityTrait[] = IDENTITY_TRAITS.flat();

/**
 * Required number of traits user must select (exactly 3)
 */
export const REQUIRED_TRAITS = 3;

/**
 * Validation helper: Check if trait selection count is valid (exactly 3)
 */
export function isValidTraitCount(count: number): boolean {
  return count === REQUIRED_TRAITS;
}

/**
 * Validation helper: Check if specific trait exists in the master list
 */
export function isValidTrait(trait: string): trait is IdentityTrait {
  return ALL_TRAITS.includes(trait as IdentityTrait);
}
