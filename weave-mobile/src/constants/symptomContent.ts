/**
 * Symptom Content Mapping
 *
 * Maps painpoint categories to their corresponding symptom descriptions
 * Used in Story 1.3: Symptom Insight Screen
 * Content from PRD US-1.3
 */

export type PainpointId = 'clarity' | 'action' | 'consistency' | 'alignment';

export interface SymptomContent {
  id: PainpointId;
  title: string;
  text: string;
  icon: string;
}

/**
 * Symptom text for each painpoint category
 * Exact copy from PRD lines 507-536
 */
export const SYMPTOM_TEXT: Record<PainpointId, SymptomContent> = {
  clarity: {
    id: 'clarity',
    title: 'Clarity',
    text: "You want direction, but nothing feels aligned. You've reflected, journaled, thought deeply — yet you're still on autopilot. But deep down, you do have an idea of the life you want: you're just scared to start.",
    icon: 'lightbulb.fill',
  },
  action: {
    id: 'action',
    title: 'Action',
    text: "Your mind runs laps while your actions stay still. You overthink, perfect, plan, and wait for the 'right moment' — but the moment never arrives. Starting feels overwhelming, so hesitation becomes your default.",
    icon: 'figure.walk',
  },
  consistency: {
    id: 'consistency',
    title: 'Consistency',
    text: "You start strong, fall off, and repeat the cycle again and again. It's not that 'life gets in the way' — it's that you don't see progress fast enough to believe it's working. One missed day breaks everything, and motivation collapses with it.",
    icon: 'arrow.triangle.2.circlepath',
  },
  alignment: {
    id: 'alignment',
    title: 'Alignment',
    text: "You're ambitious in a place that isn't. You feel misunderstood, unsupported, and tired of pushing alone. You've tried getting others to grow with you, but they didn't get it — and shrinking yourself to match them feels wrong.",
    icon: 'person.badge.key.fill',
  },
};

/**
 * Fixed order for displaying symptoms (regardless of selection order)
 */
const SYMPTOM_DISPLAY_ORDER: PainpointId[] = ['clarity', 'action', 'consistency', 'alignment'];

/**
 * Get symptom content for selected painpoints
 * Returns symptoms in fixed order: clarity → action → consistency → alignment
 * @param painpointIds Array of selected painpoint IDs (1-2 items)
 * @returns Array of symptom content in fixed order
 */
export function getSymptomContent(painpointIds: string[]): SymptomContent[] {
  // Filter valid painpoint IDs
  const validPainpoints = painpointIds.filter((id): id is PainpointId => id in SYMPTOM_TEXT);

  // Return in fixed display order (not selection order)
  return SYMPTOM_DISPLAY_ORDER
    .filter((id) => validPainpoints.includes(id))
    .map((id) => SYMPTOM_TEXT[id]);
}

/**
 * Fallback text when no painpoints are selected
 */
export const FALLBACK_SYMPTOM: SymptomContent = {
  id: 'clarity',
  title: 'Exploring',
  text: "Let's explore what you're working through.",
  icon: 'lightbulb.fill',
};
