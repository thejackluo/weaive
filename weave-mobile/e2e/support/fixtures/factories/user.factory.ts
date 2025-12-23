import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

/**
 * User Factory
 *
 * Creates test users with auto-cleanup using Supabase API
 */
export class UserFactory {
  private createdUsers: string[] = [];
  private apiUrl = process.env.API_URL || 'http://localhost:8000/api';

  async createUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
      ...overrides,
    };

    const response = await fetch(`${this.apiUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    const created = await response.json();
    this.createdUsers.push(created.data.user.id);

    return {
      id: created.data.user.id,
      email: user.email,
      password: user.password,
      name: user.name,
    };
  }

  async cleanup() {
    for (const userId of this.createdUsers) {
      try {
        await fetch(`${this.apiUrl}/admin/users/${userId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn(`Failed to delete user ${userId}:`, error);
      }
    }
    this.createdUsers = [];
  }
}
