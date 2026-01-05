/**
 * Solution Content Mapping
 *
 * Maps painpoint categories to their corresponding solution descriptions
 * Used in Story 1.4: Weave Solution Screen
 * Content from PRD US-1.4 (lines 590-621)
 */

export type PainpointId = 'clarity' | 'action' | 'consistency' | 'alignment';

export interface SolutionContent {
  id: PainpointId;
  title: string;
  text: string;
  icon: string;
  screenshot: string | string[]; // Support single or dual screenshots
}

/**
 * Solution text for each painpoint category
 * Exact copy from PRD US-1.4
 *
 * Note: PRD specifies keywords should be bolded for emotional anchors (PRD line 645)
 * Keywords to bold when implementing rich text:
 * - "clear direction" (clarity)
 * - "easy" (action)
 * - "meaningful", "visible proof" (consistency)
 * - "supports your ambition" (alignment)
 */
export const SOLUTION_TEXT: Record<PainpointId, SolutionContent> = {
  clarity: {
    id: 'clarity',
    title: 'Clarity',
    text: 'Find purpose from reflection on the actions you do.',
    icon: 'map.fill',
    screenshot: ['IMG_2656.jpg', 'IMG_2658.png'], // Dual screenshots: binds/memories + daily check-in
  },
  action: {
    id: 'action',
    title: 'Action',
    text: "Break your goals into steps and prove you're doing the work.",
    icon: 'bolt.fill',
    screenshot: ['solution-screenshot-6.png', 'IMG_2657.png'], // Dual screenshots: add binds + accountability/proof
  },
  consistency: {
    id: 'consistency',
    title: 'Consistency',
    text: 'See visible proof of your progress through daily tracking and insights.',
    icon: 'checkmark.seal.fill',
    screenshot: ['solution-screenshot-7.png', 'solution-screenshot-4.png'], // Dual screenshots: consistency grid views
  },
  alignment: {
    id: 'alignment',
    title: 'Alignment',
    text: 'Build an environment that supports your growth and connects you with others.',
    icon: 'person.2.fill',
    screenshot: 'solution-screenshot-7.png',
  },
};

/**
 * Fixed order for displaying solutions (regardless of selection order)
 */
const SOLUTION_DISPLAY_ORDER: PainpointId[] = ['clarity', 'action', 'consistency', 'alignment'];

/**
 * Get solution content for selected painpoints
 * Returns solutions in fixed order: clarity → action → consistency → alignment
 * @param painpointIds Array of selected painpoint IDs (1-2 items)
 * @returns Array of solution content in fixed order
 */
export function getSolutionContent(painpointIds: string[]): SolutionContent[] {
  // Filter valid painpoint IDs
  const validPainpoints = painpointIds.filter((id): id is PainpointId => id in SOLUTION_TEXT);

  // Return in fixed display order (not selection order)
  return SOLUTION_DISPLAY_ORDER
    .filter((id) => validPainpoints.includes(id))
    .map((id) => SOLUTION_TEXT[id]);
}

/**
 * Fallback text when no painpoints are selected
 */
export const FALLBACK_SOLUTION: SolutionContent = {
  id: 'clarity',
  title: 'How Weave helps',
  text: 'Turn vague goals into consistent action and visible progress.',
  icon: 'map.fill',
  screenshot: 'solution-screenshot-7.png',
};
