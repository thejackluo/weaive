/**
 * Weave Design System - Empty State Components
 *
 * Beautiful empty states for zero-data scenarios
 * Encouraging messaging with gradient effects and clear CTAs
 *
 * Usage:
 * <EmptyState
 *   icon="🎯"
 *   title="No goals yet"
 *   message="Create your first goal to get started"
 *   action={{ label: "Create Goal", onPress: handleCreate }}
 * />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Button } from './Button';

// =============================================================================
// TYPES
// =============================================================================

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface EmptyStateProps {
  /** Icon or emoji */
  icon?: string | React.ReactNode;

  /** Title text */
  title: string;

  /** Message text */
  message?: string;

  /** Primary action */
  action?: EmptyStateAction;

  /** Secondary action */
  secondaryAction?: EmptyStateAction;

  /** Custom gradient colors */
  gradientColors?: [string, string];

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Custom style */
  style?: ViewStyle;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

export function EmptyState({
  icon,
  title,
  message,
  action,
  secondaryAction,
  gradientColors,
  size = 'md',
  style,
}: EmptyStateProps) {
  const { colors, spacing, radius } = useTheme();

  const dimensions = getSizeDimensions(size);
  const defaultGradient: [string, string] = [colors.accent[900], colors.violet[900]];
  const gradient = gradientColors || defaultGradient;

  return (
    <View style={[styles.container, style]}>
      {/* Icon with gradient background */}
      {icon && (
        <View
          style={{
            marginBottom: spacing[5],
            alignItems: 'center',
          }}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: dimensions.iconSize,
              height: dimensions.iconSize,
              borderRadius: dimensions.iconSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.15,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: dimensions.iconSize,
              height: dimensions.iconSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {typeof icon === 'string' ? (
              <Text
                variant={size === 'lg' ? 'display2Xl' : size === 'md' ? 'displayXl' : 'displayLg'}
              >
                {icon}
              </Text>
            ) : (
              icon
            )}
          </View>
        </View>
      )}

      {/* Title */}
      <Text
        variant={size === 'lg' ? 'displayLg' : size === 'md' ? 'displayMd' : 'displaySm'}
        color="primary"
        weight="semibold"
        style={{ textAlign: 'center', marginBottom: spacing[2] }}
      >
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text
          variant={size === 'lg' ? 'textLg' : 'textBase'}
          color="muted"
          style={{
            textAlign: 'center',
            marginBottom: spacing[6],
            maxWidth: dimensions.maxWidth,
          }}
        >
          {message}
        </Text>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <View
          style={{
            flexDirection: size === 'sm' ? 'column' : 'row',
            gap: spacing[3],
            alignItems: 'center',
          }}
        >
          {action && (
            <Button
              onPress={action.onPress}
              variant={action.variant || 'primary'}
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onPress={secondaryAction.onPress}
              variant={secondaryAction.variant || 'secondary'}
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// EMPTY GOALS
// =============================================================================

export interface EmptyGoalsProps {
  onCreateGoal: () => void;
}

export function EmptyGoals({ onCreateGoal }: EmptyGoalsProps) {
  return (
    <EmptyState
      icon="🎯"
      title="No active goals"
      message="Transform your vague aspirations into clear, achievable goals. Start your journey today."
      action={{
        label: 'Create Your First Goal',
        onPress: onCreateGoal,
        variant: 'primary',
      }}
      gradientColors={['#3b82f6', '#8b5cf6']}
    />
  );
}

// =============================================================================
// EMPTY BINDS
// =============================================================================

export interface EmptyBindsProps {
  onCreateBind: () => void;
}

export function EmptyBinds({ onCreateBind }: EmptyBindsProps) {
  return (
    <EmptyState
      icon="📝"
      title="No tasks yet"
      message="Break down your goals into daily habits and actionable tasks. Build consistency one bind at a time."
      action={{
        label: 'Create First Task',
        onPress: onCreateBind,
        variant: 'primary',
      }}
      gradientColors={['#8b5cf6', '#ec4899']}
    />
  );
}

// =============================================================================
// EMPTY CAPTURES
// =============================================================================

export interface EmptyCapturesProps {
  onCapture: () => void;
}

export function EmptyCaptures({ onCapture }: EmptyCapturesProps) {
  return (
    <EmptyState
      icon="📸"
      title="No proof yet"
      message="Document your progress with photos, notes, or timers. Build your visual journey of growth."
      action={{
        label: 'Capture Proof',
        onPress: onCapture,
        variant: 'primary',
      }}
      gradientColors={['#06b6d4', '#3b82f6']}
    />
  );
}

// =============================================================================
// EMPTY JOURNAL
// =============================================================================

export interface EmptyJournalProps {
  onCreateEntry: () => void;
}

export function EmptyJournal({ onCreateEntry }: EmptyJournalProps) {
  return (
    <EmptyState
      icon="📔"
      title="No journal entries"
      message="Reflect on your day, track your fulfillment, and let AI help you optimize tomorrow's plan."
      action={{
        label: 'Start Today\'s Journal',
        onPress: onCreateEntry,
        variant: 'primary',
      }}
      gradientColors={['#f59e0b', '#ef4444']}
    />
  );
}

// =============================================================================
// EMPTY SEARCH
// =============================================================================

export interface EmptySearchProps {
  query: string;
  onClear?: () => void;
}

export function EmptySearch({ query, onClear }: EmptySearchProps) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      message={`We couldn't find anything matching "${query}". Try different keywords or filters.`}
      action={
        onClear
          ? {
              label: 'Clear Search',
              onPress: onClear,
              variant: 'secondary',
            }
          : undefined
      }
      size="sm"
    />
  );
}

// =============================================================================
// EMPTY NOTIFICATIONS
// =============================================================================

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="All caught up"
      message="You have no new notifications. Keep up the great work!"
      size="sm"
      gradientColors={['#10b981', '#06b6d4']}
    />
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  onGoBack,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      message={message}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onPress: onRetry,
              variant: 'primary',
            }
          : undefined
      }
      secondaryAction={
        onGoBack
          ? {
              label: 'Go Back',
              onPress: onGoBack,
              variant: 'ghost',
            }
          : undefined
      }
      gradientColors={['#ef4444', '#dc2626']}
    />
  );
}

// =============================================================================
// NO CONNECTION STATE
// =============================================================================

export interface NoConnectionStateProps {
  onRetry?: () => void;
}

export function NoConnectionState({ onRetry }: NoConnectionStateProps) {
  return (
    <EmptyState
      icon="📡"
      title="No internet connection"
      message="Please check your network connection and try again."
      action={
        onRetry
          ? {
              label: 'Retry',
              onPress: onRetry,
              variant: 'primary',
            }
          : undefined
      }
      gradientColors={['#6b7280', '#4b5563']}
      size="sm"
    />
  );
}

// =============================================================================
// COMING SOON STATE
// =============================================================================

export interface ComingSoonStateProps {
  title?: string;
  message?: string;
  onNotify?: () => void;
}

export function ComingSoonState({
  title = 'Coming soon',
  message = 'This feature is under development. Stay tuned for updates!',
  onNotify,
}: ComingSoonStateProps) {
  return (
    <EmptyState
      icon="🚀"
      title={title}
      message={message}
      action={
        onNotify
          ? {
              label: 'Notify Me',
              onPress: onNotify,
              variant: 'secondary',
            }
          : undefined
      }
      gradientColors={['#8b5cf6', '#6366f1']}
    />
  );
}

// =============================================================================
// HELPERS
// =============================================================================

interface SizeDimensions {
  iconSize: number;
  maxWidth: number;
}

function getSizeDimensions(size: 'sm' | 'md' | 'lg'): SizeDimensions {
  switch (size) {
    case 'sm':
      return {
        iconSize: 80,
        maxWidth: 280,
      };
    case 'lg':
      return {
        iconSize: 140,
        maxWidth: 400,
      };
    case 'md':
    default:
      return {
        iconSize: 100,
        maxWidth: 320,
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default EmptyState;
