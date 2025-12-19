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
}

/**
 * Symptom text for each painpoint category
 * Exact copy from PRD lines 507-536
 */
export const SYMPTOM_TEXT: Record<PainpointId, SymptomContent> = {
  clarity: {
    id: 'clarity',
    title: 'Clarity',
    text: "You want direction, but nothing feels aligned. You've reflected, journaled, thought deeply — yet you're still on autopilot. Deep down, you do have an idea of the life you want. You're just scared to start, because choosing a direction feels like closing every other door.",
  },
  action: {
    id: 'action',
    title: 'Action',
    text: "Your mind runs laps while your actions stay still. You overthink, perfect, plan, and wait for the 'right moment' — but the moment never arrives. Starting feels overwhelming, so hesitation becomes your default.",
  },
  consistency: {
    id: 'consistency',
    title: 'Consistency',
    text: "You start strong, fall off, and repeat the cycle again and again. It's not that 'life gets in the way' — it's that you don't see progress fast enough to believe it's working. One missed day breaks everything, and motivation collapses with it.",
  },
  alignment: {
    id: 'alignment',
    title: 'Alignment',
    text: "You're ambitious in a place that isn't. You feel misunderstood, unsupported, and tired of pushing alone. You've tried getting others to grow with you, but they didn't get it — and shrinking yourself to match them feels wrong.",
  },
};

/**
 * Get symptom content for selected painpoints
 * @param painpointIds Array of selected painpoint IDs (1-2 items)
 * @returns Array of symptom content
 */
export function getSymptomContent(painpointIds: string[]): SymptomContent[] {
  return painpointIds
    .filter((id): id is PainpointId => id in SYMPTOM_TEXT)
    .map((id) => SYMPTOM_TEXT[id]);
}

/**
 * Fallback text when no painpoints are selected
 */
export const FALLBACK_SYMPTOM: SymptomContent = {
  id: 'clarity',
  title: 'Exploring',
  text: "Let's explore what you're working through.",
};
