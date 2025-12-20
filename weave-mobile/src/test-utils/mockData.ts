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
