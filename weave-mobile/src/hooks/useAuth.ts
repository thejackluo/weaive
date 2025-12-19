/**
 * useAuth Hook
 *
 * Story 0.3: Authentication Flow
 * Convenience hook for accessing authentication context
 *
 * Usage:
 * ```tsx
 * import { useAuth } from '@/src/hooks/useAuth';
 *
 * function MyComponent() {
 *   const { user, signIn, signOut, isLoading } = useAuth();
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return <Dashboard user={user} onLogout={signOut} />;
 * }
 * ```
 *
 * Available from context:
 * - user: Current authenticated user or null
 * - session: Current session with JWT tokens
 * - isLoading: Loading state during initial session check
 * - error: Error from last auth operation
 * - signIn(email, password): Email/password authentication
 * - signUp(email, password): User registration
 * - signOut(): Sign out and clear tokens
 * - signInWithOAuth(provider): OAuth sign-in (Apple/Google)
 * - clearError(): Clear error state
 */

import { useContext } from 'react';
import { AuthContext } from '@/src/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
