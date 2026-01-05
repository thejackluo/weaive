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
// Wrapped in try-catch to prevent startup crashes
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.error('[NOTIFICATIONS] ❌ Failed to set notification handler:', error);
}

/**
 * Register for push notifications and get Expo push token
 * @returns Expo push token or null if registration failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    console.log('[NOTIFICATIONS] 🚀 Starting push notification registration...');

    // Check if running on physical device (push notifications don't work on simulators)
    if (!Device.isDevice) {
      console.log('[NOTIFICATIONS] 📱 Not a physical device - push notifications unavailable');
      return null;
    }

    console.log('[NOTIFICATIONS] 📱 Physical device detected, checking permissions...');

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log('[NOTIFICATIONS] 🔐 Existing permission status:', existingStatus);

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[NOTIFICATIONS] 🔐 New permission status:', status);
    }

    if (finalStatus !== 'granted') {
      console.log('[NOTIFICATIONS] ❌ Notification permissions denied');
      return null;
    }

    // Get Expo push token
    console.log('[NOTIFICATIONS] 🔑 Fetching Expo project ID from config...');
    console.log('[NOTIFICATIONS] 🔍 Constants.expoConfig:', Constants.expoConfig ? 'exists' : 'null');
    console.log('[NOTIFICATIONS] 🔍 Constants.expoConfig?.extra:', Constants.expoConfig?.extra ? 'exists' : 'null');
    console.log('[NOTIFICATIONS] 🔍 Constants.expoConfig?.extra?.eas:', Constants.expoConfig?.extra?.eas ? 'exists' : 'null');

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log('[NOTIFICATIONS] 🔑 Project ID:', projectId);

    if (!projectId) {
      console.error('[NOTIFICATIONS] ❌ Missing Expo project ID in config');
      console.error('[NOTIFICATIONS] 🔍 Constants.expoConfig structure:', JSON.stringify(Constants.expoConfig, null, 2));
      return null;
    }

    console.log('[NOTIFICATIONS] 📝 Requesting Expo push token...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenData.data;
    console.log('[NOTIFICATIONS] ✅ Expo push token obtained:', pushToken);

    // Android-specific: Set notification channel
    if (Platform.OS === 'android') {
      console.log('[NOTIFICATIONS] 🤖 Setting up Android notification channel...');
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
    console.error('[NOTIFICATIONS] 🔍 Error details:', JSON.stringify(error, null, 2));
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
