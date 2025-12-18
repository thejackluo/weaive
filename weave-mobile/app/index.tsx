import { Redirect } from 'expo-router';

/**
 * Root index route
 * Redirects to onboarding welcome screen
 *
 * TODO: Add auth check here when authentication is implemented
 * - If authenticated → redirect to /(tabs)
 * - If not authenticated → redirect to /(onboarding)/welcome
 */
export default function Index() {
  // For now, always redirect to onboarding
  return <Redirect href="/(onboarding)/welcome" />;
}
