/**
 * Analytics service for tracking user events (Story 1.1)
 *
 * This service provides a simple interface for tracking analytics events
 * to the backend API. Events can be tracked for both authenticated and
 * anonymous users.
 */

import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { getApiBaseUrl } from '@/utils/api';

// API endpoint (loaded from .env via app.config.js)
const API_BASE_URL = getApiBaseUrl();

/**
 * Event metadata interface
 */
interface EventMetadata {
  device_type?: string;
  os_version?: string;
  app_version?: string;
  [key: string]: any;
}

/**
 * Track an analytics event
 *
 * @param eventName - Event identifier (e.g., 'onboarding_started')
 * @param metadata - Optional event metadata
 * @param userId - Optional user ID (for authenticated events)
 *
 * @example
 * ```ts
 * // Track pre-auth event
 * await trackEvent('onboarding_started', {
 *   device_type: 'iPhone 14',
 *   os_version: 'iOS 17.2',
 *   app_version: '1.0.0'
 * });
 *
 * // Track authenticated event
 * await trackEvent('goal_created', { goal_type: 'quantifiable' }, userId);
 * ```
 */
export async function trackEvent(
  eventName: string,
  metadata: EventMetadata = {},
  userId?: string
): Promise<void> {
  try {
    // Collect device metadata automatically
    const eventData: EventMetadata = {
      device_type: Device.modelName || 'Unknown',
      os_version:
        Device.osName && Device.osVersion ? `${Device.osName} ${Device.osVersion}` : 'Unknown',
      app_version: Constants.expoConfig?.version || '1.0.0',
      ...metadata, // User-provided metadata overrides defaults
    };

    const payload = {
      event_name: eventName,
      event_data: eventData,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    console.log(`[Analytics] Event tracked: ${eventName}`);
  } catch (error) {
    // Log error but don't crash the app
    console.error(`[Analytics] Failed to track event '${eventName}':`, error);
  }
}

/**
 * Pre-defined event tracking functions for common events
 */

export async function trackOnboardingStarted(): Promise<void> {
  return trackEvent('onboarding_started');
}

export async function trackAuthCompleted(
  userId: string,
  provider: 'apple' | 'google' | 'email'
): Promise<void> {
  return trackEvent('auth_completed', { provider }, userId);
}

export async function trackOnboardingCompleted(userId: string): Promise<void> {
  return trackEvent('onboarding_completed', {}, userId);
}

export async function trackSymptomInsightShown(categories: string[]): Promise<void> {
  return trackEvent('symptom_insight_shown', { categories });
}
