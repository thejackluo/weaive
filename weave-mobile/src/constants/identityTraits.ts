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
  | 'Clear Direction'
  | 'Intentional Time'
  | 'Decisive Action'
  | 'Consistent Effort'
  | 'High Standards'
  | 'Continuous Growth'
  | 'Self Aware'
  | 'Emotionally Grounded';

/**
 * All 8 identity traits organized in 5 rows for visually appealing layout
 * (2-1-2-1-2 layout for balanced appearance)
 * Longest text ("Emotionally Grounded") is placed alone to prevent layout shifts
 */
export const IDENTITY_TRAITS: IdentityTrait[][] = [
  ['Clear Direction', 'Intentional Time'],
  ['Decisive Action'],
  ['Consistent Effort', 'High Standards'],
  ['Emotionally Grounded'],
  ['Self Aware', 'Continuous Growth']
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
