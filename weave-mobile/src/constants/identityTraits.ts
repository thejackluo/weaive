/**
 * Identity Traits for User Selection (Story 1.6 - Step 3)
 *
 * 12 selectable traits representing desired identity characteristics.
 * User selects 3-5 traits during onboarding to define "who they want to become."
 *
 * These traits inform:
 * - Goal suggestions (Story 1.7)
 * - Dream Self generation (deferred to later stories)
 * - Progress tracking toward desired identity (deferred)
 */

export type IdentityTrait =
  | 'Disciplined'
  | 'Creative'
  | 'Confident'
  | 'Calm'
  | 'Focused'
  | 'Energetic'
  | 'Organized'
  | 'Patient'
  | 'Resilient'
  | 'Balanced'
  | 'Intentional'
  | 'Present';

/**
 * All 12 identity traits organized in 3 rows for UI display
 */
export const IDENTITY_TRAITS: IdentityTrait[][] = [
  ['Disciplined', 'Creative', 'Confident', 'Calm'],
  ['Focused', 'Energetic', 'Organized', 'Patient'],
  ['Resilient', 'Balanced', 'Intentional', 'Present']
];

/**
 * Flattened list of all traits (useful for validation)
 */
export const ALL_TRAITS: IdentityTrait[] = IDENTITY_TRAITS.flat();

/**
 * Minimum and maximum number of traits user can select
 */
export const MIN_TRAITS = 3;
export const MAX_TRAITS = 5;

/**
 * Validation helper: Check if trait selection count is valid
 */
export function isValidTraitCount(count: number): boolean {
  return count >= MIN_TRAITS && count <= MAX_TRAITS;
}

/**
 * Validation helper: Check if specific trait exists in the master list
 */
export function isValidTrait(trait: string): trait is IdentityTrait {
  return ALL_TRAITS.includes(trait as IdentityTrait);
}
