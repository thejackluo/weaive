/**
 * useNotifications Hook
 * Story 9.4: App Store Readiness - AC 5 (Push Notifications)
 *
 * Simplified hook for push notification setup.
 * Handles registration, permission request, token saving, and listeners.
 *
 * Usage:
 * ```tsx
 * function App() {
 *   const { isReady, error, pushToken } = useNotifications();
 *
 *   if (error) {
 *     console.log('Push notifications disabled:', error);
 *   }
 *
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import {
  registerForPushNotificationsAsync,
  savePushTokenToBackend,
  setupNotificationListeners,
} from '@/services/notificationService';

interface UseNotificationsReturn {
  /** Whether push notification setup is complete */
  isReady: boolean;
  /** Error message if setup failed (null on success) */
  error: string | null;
  /** Expo push token (null if not available) */
  pushToken: string | null;
}

/**
 * Hook to setup push notifications on app mount.
 *
 * Automatically:
 * 1. Requests notification permissions
 * 2. Registers device with Expo
 * 3. Saves push token to backend
 * 4. Sets up notification listeners
 *
 * @returns Notification setup status
 */
export function useNotifications(): UseNotificationsReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let cleanupListeners: (() => void) | null = null;

    async function setupNotifications() {
      try {
        // Step 1: Register for push notifications
        const token = await registerForPushNotificationsAsync();

        if (!isMounted) return;

        if (!token) {
          setError('Push notifications not available on this device');
          setIsReady(true);
          return;
        }

        setPushToken(token);

        // Step 2: Save token to backend
        await savePushTokenToBackend(token);

        // Step 3: Setup notification listeners
        cleanupListeners = setupNotificationListeners();

        setIsReady(true);
        console.log('[NOTIFICATIONS] ✅ Push notifications setup complete');
      } catch (err) {
        if (!isMounted) return;

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsReady(true);
        console.error('[NOTIFICATIONS] ❌ Setup failed:', errorMessage);
      }
    }

    setupNotifications();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, []);

  return { isReady, error, pushToken };
}
