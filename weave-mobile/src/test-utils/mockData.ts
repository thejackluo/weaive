/**
 * Mock data generators for API responses
 *
 * These functions create mock data for testing components
 * without needing real API calls.
 */

export interface MockUser {
  id: string;
  email: string;
  timezone: string;
  created_at: string;
  preferred_name?: string;
  preferences?: {
    notifications_enabled?: boolean;
    custom_reflection_questions?: Array<{
      id: string;
      question: string;
      type: 'text' | 'numeric' | 'yes_no';
      created_at: string;
    }>;
  };
}

export interface MockGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface MockSubtask {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export function generateMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 'mock-user-123',
    email: 'test@example.com',
    timezone: 'America/New_York',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockGoal(overrides?: Partial<MockGoal>): MockGoal {
  return {
    id: 'mock-goal-456',
    user_id: 'mock-user-123',
    title: 'Learn React Native Testing',
    description: 'Master React Native Testing Library',
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockSubtask(overrides?: Partial<MockSubtask>): MockSubtask {
  return {
    id: 'mock-subtask-789',
    goal_id: 'mock-goal-456',
    title: 'Write component tests',
    description: 'Test all design system components',
    status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockGoals(count: number): MockGoal[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockGoal({
      id: `mock-goal-${i + 1}`,
      title: `Goal ${i + 1}`,
    })
  );
}

export function generateMockSubtasks(goalId: string, count: number): MockSubtask[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockSubtask({
      id: `mock-subtask-${i + 1}`,
      goal_id: goalId,
      title: `Subtask ${i + 1}`,
    })
  );
}

/**
 * Journal Entry Types and Factories (Story 4.1)
 */

export interface MockJournalEntry {
  id: string;
  user_id: string;
  local_date: string;
  fulfillment_score: number;
  default_responses: {
    today_reflection: string;
    tomorrow_focus: string;
  };
  custom_responses: Record<string, { question_text: string; response: string | number }>;
  created_at: string;
}

export interface MockCustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'numeric' | 'yes_no';
  created_at: string;
}

export function generateMockJournalEntry(overrides?: Partial<MockJournalEntry>): MockJournalEntry {
  return {
    id: 'mock-journal-123',
    user_id: 'mock-user-123',
    local_date: new Date().toISOString().split('T')[0],
    fulfillment_score: 7,
    default_responses: {
      today_reflection:
        'Today was productive. I completed my morning routine and made progress on my goals.',
      tomorrow_focus: 'Tomorrow I will finish the presentation.',
    },
    custom_responses: {},
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockJournalEntryWithCustomQuestions(
  overrides?: Partial<MockJournalEntry>
): MockJournalEntry {
  return {
    id: 'mock-journal-456',
    user_id: 'mock-user-123',
    local_date: new Date().toISOString().split('T')[0],
    fulfillment_score: 8,
    default_responses: {
      today_reflection: 'Great day overall!',
      tomorrow_focus: 'Keep the momentum going.',
    },
    custom_responses: {
      'uuid-diet': {
        question_text: 'Did I stick to my diet?',
        response: 'Yes',
      },
      'uuid-energy': {
        question_text: 'Rate my energy level (1-10)',
        response: 9,
      },
    },
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockCustomQuestion(
  overrides?: Partial<MockCustomQuestion>
): MockCustomQuestion {
  return {
    id: 'uuid-123',
    question: 'Did I exercise today?',
    type: 'yes_no',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockCustomQuestions(count: number): MockCustomQuestion[] {
  const questionTemplates = [
    { question: 'Did I stick to my diet?', type: 'yes_no' as const },
    { question: 'Rate my energy level (1-10)', type: 'numeric' as const },
    { question: 'Did I exercise today?', type: 'yes_no' as const },
    { question: 'How many pages did I read?', type: 'numeric' as const },
    { question: 'What did I learn today?', type: 'text' as const },
  ];

  return Array.from({ length: Math.min(count, 5) }, (_, i) =>
    generateMockCustomQuestion({
      id: `uuid-${i + 1}`,
      ...questionTemplates[i],
    })
  );
}
