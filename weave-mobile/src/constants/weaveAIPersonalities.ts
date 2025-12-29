/**
 * Weave AI Personality Constants (Extended)
 *
 * Complete list of all 26 Weave AI personality presets:
 * - 3 core presets (Story 6.1)
 * - 23 extended presets (integrated from Claude Code personalities)
 *
 * Organized by category for UI display.
 */

import { WeaveAIPreset } from '@/services/personalityApi';

export interface PersonalityPresetInfo {
  id: WeaveAIPreset;
  emoji: string;
  name: string;
  description: string;
  category: string;
}

// All personality presets organized by category
export const PERSONALITY_PRESETS: PersonalityPresetInfo[] = [
  // ============================================================
  // CORE PRESETS (Story 6.1)
  // ============================================================
  {
    id: 'gen_z_default',
    emoji: '💬',
    name: 'Gen Z Default',
    description: 'Short & warm, text-message style, Gen Z vibes',
    category: 'core',
  },
  {
    id: 'supportive_coach',
    emoji: '🤝',
    name: 'Supportive Coach',
    description: 'Encouraging, accountability-focused, data-driven',
    category: 'core',
  },
  {
    id: 'concise_mentor',
    emoji: '⚡',
    name: 'Concise Mentor',
    description: 'Ultra-brief, action-oriented, direct guidance',
    category: 'core',
  },

  // ============================================================
  // SUPPORTIVE & FRIENDLY
  // ============================================================
  {
    id: 'abg',
    emoji: '✨',
    name: 'ABG',
    description: 'Asian Baby Girl energy - confident, supportive, trendy vibes',
    category: 'supportive',
  },
  {
    id: 'anime-girl',
    emoji: '🌸',
    name: 'Anime Girl',
    description: 'Sweet anime girl - supportive, sometimes shy, kawaii vibes',
    category: 'supportive',
  },
  {
    id: 'chinese-infj',
    emoji: '🌸',
    name: 'Chinese INFJ',
    description: 'Warm, emotionally supportive with gentle Chinese phrases',
    category: 'supportive',
  },
  {
    id: 'flirty',
    emoji: '😘',
    name: 'Flirty',
    description: 'Playful and charming personality',
    category: 'supportive',
  },
  {
    id: 'funny',
    emoji: '😄',
    name: 'Funny',
    description: 'Lighthearted and comedic',
    category: 'supportive',
  },

  // ============================================================
  // PROFESSIONAL
  // ============================================================
  {
    id: 'normal',
    emoji: '👤',
    name: 'Normal',
    description: 'Professional and clear communication',
    category: 'professional',
  },
  {
    id: 'professional',
    emoji: '💼',
    name: 'Professional',
    description: 'Formal and corporate',
    category: 'professional',
  },
  {
    id: 'robot',
    emoji: '🤖',
    name: 'Robot',
    description: 'Mechanical and precise communication',
    category: 'professional',
  },

  // ============================================================
  // HUMOROUS
  // ============================================================
  {
    id: 'sarcastic',
    emoji: '🙄',
    name: 'Sarcastic',
    description: 'Dry wit and cutting observations',
    category: 'humorous',
  },
  {
    id: 'dry-humor',
    emoji: '😐',
    name: 'Dry Humor',
    description: 'British dry wit and deadpan delivery',
    category: 'humorous',
  },
  {
    id: 'grandpa',
    emoji: '👴',
    name: 'Grandpa',
    description: 'Rambling nostalgic storyteller',
    category: 'humorous',
  },
  {
    id: 'surfer-dude',
    emoji: '🏄',
    name: 'Surfer Dude',
    description: 'Laid-back beach vibes',
    category: 'humorous',
  },

  // ============================================================
  // EDGY & BOLD
  // ============================================================
  {
    id: 'angry',
    emoji: '😠',
    name: 'Angry',
    description: 'Frustrated and irritated responses',
    category: 'edgy',
  },
  {
    id: 'annoying',
    emoji: '🤪',
    name: 'Annoying',
    description: 'Over-enthusiastic and excessive',
    category: 'edgy',
  },
  {
    id: 'crass',
    emoji: '🗣️',
    name: 'Crass',
    description: 'Blunt and slightly rude',
    category: 'edgy',
  },
  {
    id: 'moody',
    emoji: '😔',
    name: 'Moody',
    description: 'Melancholic and brooding',
    category: 'edgy',
  },
  {
    id: 'sassy',
    emoji: '💁',
    name: 'Sassy',
    description: 'Bold with attitude',
    category: 'edgy',
  },

  // ============================================================
  // CREATIVE & ARTISTIC
  // ============================================================
  {
    id: 'dramatic',
    emoji: '🎭',
    name: 'Dramatic',
    description: 'Theatrical flair and grand statements',
    category: 'creative',
  },
  {
    id: 'poetic',
    emoji: '✍️',
    name: 'Poetic',
    description: 'Elegant and lyrical',
    category: 'creative',
  },
  {
    id: 'rapper',
    emoji: '🎤',
    name: 'Rapper',
    description: 'Spits fire with rhymes and wordplay',
    category: 'creative',
  },
  {
    id: 'zen',
    emoji: '🧘',
    name: 'Zen',
    description: 'Peaceful and mindful communication',
    category: 'creative',
  },

  // ============================================================
  // THEMED
  // ============================================================
  {
    id: 'millennial',
    emoji: '📱',
    name: 'Millennial',
    description: 'Internet generation speak',
    category: 'themed',
  },
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    name: 'Pirate',
    description: 'Seafaring swagger and nautical language',
    category: 'themed',
  },
];

/**
 * Get personality info by ID
 */
export function getPersonalityById(id: WeaveAIPreset): PersonalityPresetInfo | undefined {
  return PERSONALITY_PRESETS.find((p) => p.id === id);
}

/**
 * Get personalities by category
 */
export function getPersonalitiesByCategory(category: string): PersonalityPresetInfo[] {
  return PERSONALITY_PRESETS.filter((p) => p.category === category);
}

/**
 * Get all category names
 */
export const PERSONALITY_CATEGORIES = [
  { id: 'core', name: 'Core Presets', description: 'Original Weave AI coaching styles' },
  { id: 'supportive', name: 'Supportive & Friendly', description: 'Warm and encouraging' },
  { id: 'professional', name: 'Professional', description: 'Clear and business-appropriate' },
  { id: 'humorous', name: 'Humorous', description: 'Funny and entertaining' },
  { id: 'edgy', name: 'Edgy & Bold', description: 'Blunt and direct' },
  { id: 'creative', name: 'Creative & Artistic', description: 'Poetic and imaginative' },
  { id: 'themed', name: 'Themed', description: 'Character-based personalities' },
];
