/**
 * Goal Templates for First Needle Selection
 *
 * Each template represents a suggested starting goal for new users.
 * Templates include:
 * - Unique ID for tracking
 * - User-facing display text
 * - Category for internal organization
 * - Keywords for matching custom user goals to templates
 *
 * Used in Story 1.7: Choose Your First Needle
 */

export interface GoalTemplate {
  id: number;
  display_text: string;
  category: 'health' | 'productivity' | 'education' | 'creative' | 'career';
  keywords: string[]; // For custom goal matching
}

/**
 * 10 Suggested Starting Goals
 * Ordered by category: Health → Productivity → Education → Creative → Career
 */
export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Health Goals (IDs 1-4)
  {
    id: 1,
    display_text: "Build a simple fitness routine",
    category: 'health',
    keywords: ['fitness', 'exercise', 'workout', 'gym', 'health', 'physical', 'training', 'run', 'lift']
  },
  {
    id: 2,
    display_text: "Improve my sleep and daily energy",
    category: 'health',
    keywords: ['sleep', 'energy', 'rest', 'tired', 'fatigue', 'night', 'morning', 'wake']
  },
  {
    id: 3,
    display_text: "Reduce stress and feel more balanced",
    category: 'health',
    keywords: ['stress', 'anxiety', 'balance', 'calm', 'relaxation', 'peace', 'mental', 'wellness', 'mindfulness', 'meditation']
  },
  {
    id: 4,
    display_text: "Get back into a healthy rhythm",
    category: 'health',
    keywords: ['routine', 'rhythm', 'schedule', 'consistency', 'habit', 'structure', 'regular']
  },

  // Productivity Goals (IDs 5, 7)
  {
    id: 5,
    display_text: "Improve focus and productivity",
    category: 'productivity',
    keywords: ['focus', 'productivity', 'work', 'efficiency', 'concentrate', 'attention', 'distraction', 'task']
  },
  {
    id: 7,
    display_text: "Work consistently on a project",
    category: 'productivity',
    keywords: ['project', 'build', 'create', 'work', 'side', 'startup', 'app', 'product', 'develop']
  },

  // Education Goals (ID 6)
  {
    id: 6,
    display_text: "Make steady progress in school",
    category: 'education',
    keywords: ['school', 'study', 'college', 'learning', 'grades', 'class', 'exam', 'homework', 'academic', 'university']
  },

  // Creative Goals (ID 8)
  {
    id: 8,
    display_text: "Start or rebuild a creative habit",
    category: 'creative',
    keywords: ['creative', 'art', 'music', 'writing', 'hobby', 'paint', 'draw', 'compose', 'craft', 'design']
  },

  // Career Goals (IDs 9-10)
  {
    id: 9,
    display_text: "Prepare for an upcoming opportunity",
    category: 'career',
    keywords: ['opportunity', 'interview', 'job', 'career', 'prepare', 'application', 'position', 'role']
  },
  {
    id: 10,
    display_text: "Build discipline around my work",
    category: 'career',
    keywords: ['discipline', 'work', 'career', 'professional', 'commitment', 'dedication', 'responsibility']
  },
];

/**
 * Match a custom user goal to the closest template based on keyword matching
 *
 * Algorithm:
 * 1. Validate input quality (min 3 chars, has at least one word)
 * 2. Convert custom goal to lowercase
 * 3. Check each template's keywords
 * 4. Return first matching template ID
 * 5. Fallback to template ID 7 (most generic) only if input passes quality check
 *
 * @param customGoal - User's custom goal text
 * @returns Template ID (1-10)
 *
 * @example
 * matchCustomGoalToTemplate("I want to go to the gym") // Returns 1 (fitness)
 * matchCustomGoalToTemplate("Learn Spanish") // Returns 7 (generic project)
 * matchCustomGoalToTemplate("Fix my sleep schedule") // Returns 2 (sleep)
 * matchCustomGoalToTemplate("!!!") // Returns 7 (fallback, but validated first)
 */
export const matchCustomGoalToTemplate = (customGoal: string): number => {
  const lowerGoal = customGoal.toLowerCase().trim();

  // Quality validation: must have at least 3 chars
  if (!lowerGoal || lowerGoal.length < 3) {
    return 7; // Default fallback
  }

  // Quality validation: must contain at least one alphabetic word (2+ chars)
  const hasValidWord = /[a-z]{2,}/.test(lowerGoal);
  if (!hasValidWord) {
    return 7; // Default fallback (reject gibberish like "!!!", "123")
  }

  // Try to match keywords
  for (const template of GOAL_TEMPLATES) {
    for (const keyword of template.keywords) {
      if (lowerGoal.includes(keyword)) {
        return template.id;
      }
    }
  }

  // Default fallback (most generic template)
  return 7; // "Work consistently on a project"
};

/**
 * Get template by ID
 *
 * @param id - Template ID (1-10)
 * @returns GoalTemplate or undefined if not found
 */
export const getTemplateById = (id: number): GoalTemplate | undefined => {
  return GOAL_TEMPLATES.find(template => template.id === id);
};

/**
 * Get all templates in a specific category
 *
 * @param category - Category filter
 * @returns Array of matching templates
 */
export const getTemplatesByCategory = (
  category: 'health' | 'productivity' | 'education' | 'creative' | 'career'
): GoalTemplate[] => {
  return GOAL_TEMPLATES.filter(template => template.category === category);
};
