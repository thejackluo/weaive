import { faker } from '@faker-js/faker';

export interface TestGoal {
  id: string;
  title: string;
  description: string;
  userId: string;
}

/**
 * Goal Factory
 *
 * Creates test goals with auto-cleanup using API
 */
export class GoalFactory {
  private createdGoals: string[] = [];
  private apiUrl = process.env.API_URL || 'http://localhost:8000/api';

  async createGoal(
    userId: string,
    overrides: Partial<Omit<TestGoal, 'id' | 'userId'>> = {}
  ): Promise<TestGoal> {
    const goal = {
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      ...overrides,
    };

    const response = await fetch(`${this.apiUrl}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...goal,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create goal: ${response.statusText}`);
    }

    const created = await response.json();
    this.createdGoals.push(created.data.id);

    return {
      id: created.data.id,
      title: goal.title,
      description: goal.description,
      userId,
    };
  }

  async cleanup() {
    for (const goalId of this.createdGoals) {
      try {
        await fetch(`${this.apiUrl}/goals/${goalId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn(`Failed to delete goal ${goalId}:`, error);
      }
    }
    this.createdGoals = [];
  }
}
