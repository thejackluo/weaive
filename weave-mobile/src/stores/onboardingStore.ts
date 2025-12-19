/**
 * Onboarding Store
 *
 * Zustand store for managing onboarding flow state
 * Stores temporary data during the onboarding process
 */

import { create } from 'zustand';

interface OnboardingStore {
  // Selected emotional painpoints from Step 1.2
  selectedPainpoints: string[];
  setSelectedPainpoints: (painpoints: string[]) => void;

  // Reset entire onboarding state
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  selectedPainpoints: [],

  setSelectedPainpoints: (painpoints) => set({ selectedPainpoints: painpoints }),

  resetOnboarding: () => set({ selectedPainpoints: [] }),
}));
