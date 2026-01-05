/**
 * InAppOnboardingContext - Manages in-app tutorial state
 *
 * Tracks which onboarding steps the user has completed
 * and provides methods to advance through the tutorial
 *
 * Onboarding Steps:
 * 1. create_first_needle - Guide user to create their first needle
 * 2. complete_first_bind - Guide user to complete their first bind
 * 3. view_progress - Guide user to check their progress
 * 4. write_first_journal - Guide user to write their first journal entry
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@weave:in_app_onboarding_state';

export type OnboardingStep =
  | 'create_first_needle'
  | 'home_page_tour'
  | 'dashboard_tour'
  | 'complete_first_bind'
  | 'view_progress'
  | 'write_first_journal'
  | 'completed';

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isSkipped: boolean;
}

interface InAppOnboardingContextValue {
  /** Current onboarding step */
  currentStep: OnboardingStep;
  /** Whether user has completed onboarding */
  isOnboardingComplete: boolean;
  /** Whether user has skipped the tutorial */
  isSkipped: boolean;
  /** Whether the context is loading from storage */
  isLoading: boolean;
  /** Mark current step as complete and advance to next */
  completeCurrentStep: () => Promise<void>;
  /** Skip the entire tutorial */
  skipTutorial: () => Promise<void>;
  /** Reset onboarding (for testing) */
  resetOnboarding: () => Promise<void>;
  /** Check if a specific step is complete */
  isStepComplete: (step: OnboardingStep) => boolean;
  /** Manually set current step (for testing) */
  setStep: (step: OnboardingStep) => Promise<void>;
}

const InAppOnboardingContext = createContext<InAppOnboardingContextValue | null>(null);

const STEP_PROGRESSION: OnboardingStep[] = [
  'create_first_needle',
  'home_page_tour',
  'dashboard_tour',
  'complete_first_bind',
  'view_progress',
  'write_first_journal',
  'completed',
];

export function InAppOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'create_first_needle',
    completedSteps: [],
    isSkipped: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[InAppOnboarding] 📂 Loading state from storage:', stored);

      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState;
        console.log('[InAppOnboarding] ✅ Loaded state:', parsed);
        setState(parsed);
      } else {
        console.log('[InAppOnboarding] 🆕 No stored state, using defaults (create_first_needle)');
      }
    } catch (error) {
      console.error('[InAppOnboarding] ❌ Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: OnboardingState) => {
    try {
      console.log('[InAppOnboarding] 💾 Saving state:', newState);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
      console.log('[InAppOnboarding] ✅ State saved successfully');
    } catch (error) {
      console.error('[InAppOnboarding] ❌ Failed to save state:', error);
    }
  };

  const completeCurrentStep = async () => {
    const currentIndex = STEP_PROGRESSION.indexOf(state.currentStep);
    const nextStep = STEP_PROGRESSION[currentIndex + 1] || 'completed';

    const newState: OnboardingState = {
      ...state,
      currentStep: nextStep,
      completedSteps: [...state.completedSteps, state.currentStep],
    };

    await saveState(newState);
  };

  const skipTutorial = async () => {
    const newState: OnboardingState = {
      currentStep: 'completed',
      completedSteps: [...STEP_PROGRESSION],
      isSkipped: true,
    };

    await saveState(newState);
  };

  const resetOnboarding = async () => {
    const newState: OnboardingState = {
      currentStep: 'create_first_needle',
      completedSteps: [],
      isSkipped: false,
    };

    await saveState(newState);
  };

  const isStepComplete = (step: OnboardingStep): boolean => {
    return state.completedSteps.includes(step);
  };

  const setStep = async (step: OnboardingStep) => {
    const newState: OnboardingState = {
      ...state,
      currentStep: step,
    };
    await saveState(newState);
  };

  const value: InAppOnboardingContextValue = {
    currentStep: state.currentStep,
    isOnboardingComplete: state.currentStep === 'completed',
    isSkipped: state.isSkipped,
    isLoading,
    completeCurrentStep,
    skipTutorial,
    resetOnboarding,
    isStepComplete,
    setStep,
  };

  return (
    <InAppOnboardingContext.Provider value={value}>
      {children}
    </InAppOnboardingContext.Provider>
  );
}

export function useInAppOnboarding() {
  const context = useContext(InAppOnboardingContext);
  if (!context) {
    throw new Error('useInAppOnboarding must be used within InAppOnboardingProvider');
  }
  return context;
}
