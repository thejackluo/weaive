import { Redirect } from 'expo-router';

/**
 * Onboarding Index Route
 *
 * Redirects to the welcome screen (Story 1.1) - the first screen in the onboarding flow.
 * This ensures users always start at the Welcome screen regardless of URL structure.
 *
 * Epic 1: Onboarding (Optimized Hybrid Flow)
 * Story 1.1: Welcome & Vision Hook
 */
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/welcome" />;
}
