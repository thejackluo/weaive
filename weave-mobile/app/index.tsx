import { Redirect } from 'expo-router';

/**
 * Root index route
 *
 * Entry point that redirects users to the appropriate screen based on auth state.
 * Currently redirects all users to onboarding flow.
 *
 * Future Enhancement (Story 1.5 - Authentication):
 * - Check authentication state using Supabase
 * - If authenticated → redirect to /(tabs) (main app)
 * - If not authenticated → redirect to /(onboarding)/welcome
 *
 * @returns Redirect component to welcome screen
 */
export default function Index() {
  return <Redirect href="/(onboarding)/welcome" />;
}
