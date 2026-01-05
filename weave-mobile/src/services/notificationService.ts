/**
 * Notification Service - Expo Push Notifications (Story 6.1)
 *
 * Features:
 * - Register device for push notifications
 * - Save Expo push token to backend
 * - Handle notification taps (open ai-chat screen)
 * - Request notification permissions
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import apiClient from './apiClient';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 * @returns Expo push token or null if registration failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Check if running on physical device (push notifications don't work on simulators)
    if (!Device.isDevice) {
      console.log('[NOTIFICATIONS] 📱 Not a physical device - push notifications unavailable');
      return null;
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NOTIFICATIONS] ❌ Notification permissions denied');
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('[NOTIFICATIONS] ❌ Missing Expo project ID in config');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenData.data;
    console.log('[NOTIFICATIONS] ✅ Expo push token:', pushToken);

    // Android-specific: Set notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return pushToken;
  } catch (error) {
    console.error('[NOTIFICATIONS] ❌ Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Save push token to backend
 * @param pushToken Expo push token
 */
export async function savePushTokenToBackend(pushToken: string): Promise<void> {
  try {
    await apiClient.post('/api/user/push-token', { expo_push_token: pushToken });
    console.log('[NOTIFICATIONS] ✅ Push token saved to backend');
  } catch (error) {
    console.error('[NOTIFICATIONS] ❌ Error saving push token to backend:', error);
  }
}

/**
 * Handle notification tap - navigate to appropriate screen
 * @param notification Notification object
 */
export function handleNotificationTap(notification: Notifications.Notification): void {
  const data = notification.request.content.data;

  console.log('[NOTIFICATIONS] 👆 Notification tapped:', data);

  // Handle check-in notifications - open ai-chat screen
  if (data.type === 'checkin' && data.screen === 'ai-chat') {
    router.push('/(tabs)/ai-chat');
    console.log('[NOTIFICATIONS] 🔀 Navigated to ai-chat screen');
  }
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(): () => void {
  // Listen for notification taps when app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[NOTIFICATIONS] 📬 Notification received (foreground):', notification);
  });

  // Listen for notification taps when app is in background or killed
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationTap(response.notification);
  });

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
