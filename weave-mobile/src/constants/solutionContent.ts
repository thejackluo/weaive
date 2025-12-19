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
    text: 'We turn vague feelings into clear direction. Through small daily reflections and pattern insights, Weave reveals where your motivation naturally points — and turns that into a path you can follow.',
  },
  action: {
    id: 'action',
    title: 'Action',
    text: 'We make starting easy. We break your goal into simple, doable steps and nudge you into motion — so action replaces hesitation, and momentum replaces overthinking.',
  },
  consistency: {
    id: 'consistency',
    title: 'Consistency',
    text: "We make consistency feel meaningful. Every time you follow through, Weave turns that action into visible proof of who you're becoming — making discipline feel natural instead of forced.",
  },
  alignment: {
    id: 'alignment',
    title: 'Alignment',
    text: 'We become the environment that supports your ambition. The more you use the app, the better it understands how you grow — and eventually, Weave will connect you with others moving in the same direction.',
  },
};

/**
 * Get solution content for selected painpoints
 * @param painpointIds Array of selected painpoint IDs (1-2 items)
 * @returns Array of solution content
 */
export function getSolutionContent(painpointIds: string[]): SolutionContent[] {
  return painpointIds
    .filter((id): id is PainpointId => id in SOLUTION_TEXT)
    .map((id) => SOLUTION_TEXT[id]);
}

/**
 * Fallback text when no painpoints are selected
 */
export const FALLBACK_SOLUTION: SolutionContent = {
  id: 'clarity',
  title: 'How Weave helps',
  text: 'We help you turn vague goals into consistent action and visible progress.',
};
