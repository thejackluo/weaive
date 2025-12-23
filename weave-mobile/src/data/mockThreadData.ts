/**
 * Mock data for Thread flow development
 * This will be replaced with real API calls in Phase 2
 */

export interface MockBind {
  id: string;
  title: string;
  subtitle: string;
  needleId: string;
  estimatedMinutes: number;
  completed: boolean;
  hasProof: boolean;
  frequency: string;
}

export interface MockNeedle {
  id: string;
  title: string;
  why: string;
  color: 'blue' | 'green' | 'red' | 'violet' | 'emerald';
  completedBinds: number;
  totalBinds: number;
  consistency7d: number | null;
}

export interface MockUserState {
  name: string;
  streak: number;
  level: number;
  levelProgress: number; // 0-100
  hasCompletedReflection: boolean;
}

// Mock needles (goals)
export const mockNeedles: MockNeedle[] = [
  {
    id: 'needle-1',
    title: 'Get Ripped',
    why: 'to auafarm mfs',
    color: 'blue',
    completedBinds: 0,
    totalBinds: 2,
    consistency7d: 85.5,
  },
  {
    id: 'needle-2',
    title: 'Build Weave App',
    why: 'launch MVP and get users',
    color: 'violet',
    completedBinds: 1,
    totalBinds: 3,
    consistency7d: 92.0,
  },
  {
    id: 'needle-3',
    title: 'Read More Books',
    why: 'expand knowledge and perspectives',
    color: 'emerald',
    completedBinds: 0,
    totalBinds: 1,
    consistency7d: null, // New goal, less than 7 days
  },
];

// Mock binds (today's tasks)
export const mockBinds: MockBind[] = [
  // Needle 1: Get Ripped
  {
    id: 'bind-1',
    title: 'Workout',
    subtitle: "5x Per Week. Today's one of them.",
    needleId: 'needle-1',
    estimatedMinutes: 45,
    completed: false,
    hasProof: false,
    frequency: '5x Per Week',
  },
  {
    id: 'bind-2',
    title: 'Track Protein',
    subtitle: 'Daily. Hit 180g today.',
    needleId: 'needle-1',
    estimatedMinutes: 5,
    completed: false,
    hasProof: false,
    frequency: 'Daily',
  },

  // Needle 2: Build Weave App
  {
    id: 'bind-3',
    title: 'Code Review',
    subtitle: 'Daily during sprint.',
    needleId: 'needle-2',
    estimatedMinutes: 30,
    completed: true,
    hasProof: true,
    frequency: 'Daily',
  },
  {
    id: 'bind-4',
    title: 'Ship Story',
    subtitle: 'Weekdays. Complete one story.',
    needleId: 'needle-2',
    estimatedMinutes: 120,
    completed: false,
    hasProof: false,
    frequency: 'Weekdays',
  },
  {
    id: 'bind-5',
    title: 'User Testing',
    subtitle: '3x Per Week. Get feedback.',
    needleId: 'needle-2',
    estimatedMinutes: 60,
    completed: false,
    hasProof: false,
    frequency: '3x Per Week',
  },

  // Needle 3: Read More Books
  {
    id: 'bind-6',
    title: 'Read 20 Pages',
    subtitle: 'Daily. Make progress.',
    needleId: 'needle-3',
    estimatedMinutes: 20,
    completed: false,
    hasProof: false,
    frequency: 'Daily',
  },
];

// Mock user state
export const mockUser: MockUserState = {
  name: 'eddie',
  streak: 2,
  level: 2,
  levelProgress: 35, // 35% to level 3
  hasCompletedReflection: false,
};

// Mock AI insights (contextual messages)
export const mockAIInsights = [
  "finish up the figma wireframes for the app. you said you were gonna do it so don't embarrass yourself :)",
  "you've been crushing it with workouts lately. keep the momentum going today!",
  "don't forget to reflect on yesterday's wins before bed. it helps with the streak.",
  "that code review you did yesterday was solid. now let's ship that story.",
];

// Helper function to get binds for a specific needle
export function getBindsForNeedle(needleId: string): MockBind[] {
  return mockBinds.filter((bind) => bind.needleId === needleId);
}

// Helper function to get time-based greeting
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'good morning';
  if (hour < 17) return 'good afternoon';
  return 'good evening';
}

// Helper function to get random AI insight
export function getRandomInsight(): string {
  return mockAIInsights[Math.floor(Math.random() * mockAIInsights.length)];
}
