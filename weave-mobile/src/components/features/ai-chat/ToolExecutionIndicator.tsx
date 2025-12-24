/**
 * ToolExecutionIndicator - Visual feedback for AI tool execution
 *
 * Shows when AI is invoking tools like:
 * - modify_identity_document
 * - search_goals
 * - etc.
 *
 * Features:
 * - Real-time status updates (starting, running, completed, error)
 * - Animated transitions
 * - Expandable to show tool input/output
 * - Color-coded by status
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Body, Caption } from '@/design-system';
import type { ToolExecution } from '@/hooks/useAIChatStream';

export interface ToolExecutionIndicatorProps {
  toolExecution: ToolExecution;
  compact?: boolean;
}

export function ToolExecutionIndicator({
  toolExecution,
  compact = false,
}: ToolExecutionIndicatorProps) {
  const { colors, spacing } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get status color and icon
  const getStatusDisplay = () => {
    switch (toolExecution.status) {
      case 'starting':
        return {
          color: colors.semantic.info.base,
          icon: 'hourglass-outline' as const,
          label: 'Starting...',
        };
      case 'running':
        return {
          color: colors.semantic.info.base,
          icon: 'cog-outline' as const,
          label: 'Running...',
        };
      case 'completed':
        return {
          color: colors.semantic.success.base,
          icon: 'checkmark-circle' as const,
          label: 'Completed',
        };
      case 'error':
        return {
          color: colors.semantic.error.base,
          icon: 'close-circle' as const,
          label: 'Failed',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Format tool name for display
  const formatToolName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (compact) {
    // Compact version - just icon and status
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[2],
            paddingVertical: spacing[2],
            paddingHorizontal: spacing[3],
            backgroundColor: statusDisplay.color + '20',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: statusDisplay.color + '40',
          }}
        >
          {toolExecution.status === 'running' ? (
            <ActivityIndicator size="small" color={statusDisplay.color} />
          ) : (
            <Ionicons name={statusDisplay.icon} size={16} color={statusDisplay.color} />
          )}
          <Caption style={{ color: statusDisplay.color, fontWeight: '600' }}>
            {formatToolName(toolExecution.toolName)}
          </Caption>
        </View>
      </Animated.View>
    );
  }

  // Full version - expandable with details
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          marginVertical: spacing[2],
          padding: spacing[3],
          backgroundColor: colors.background.secondary + 'CC',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: statusDisplay.color + '40',
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          {toolExecution.status === 'running' ? (
            <ActivityIndicator size="small" color={statusDisplay.color} />
          ) : (
            <Ionicons name={statusDisplay.icon} size={20} color={statusDisplay.color} />
          )}

          <View style={{ flex: 1 }}>
            <Body style={{ color: colors.text.primary, fontWeight: '600' }}>
              {formatToolName(toolExecution.toolName)}
            </Body>
            <Caption style={{ color: statusDisplay.color }}>{statusDisplay.label}</Caption>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.muted}
          />
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
            {/* Tool Input */}
            {toolExecution.input && (
              <View>
                <Caption style={{ color: colors.text.muted, marginBottom: spacing[1] }}>
                  Input:
                </Caption>
                <View
                  style={{
                    padding: spacing[2],
                    backgroundColor: colors.background.secondary,
                    borderRadius: 6,
                  }}
                >
                  <Caption style={{ color: colors.text.secondary, fontFamily: 'monospace' }}>
                    {JSON.stringify(toolExecution.input, null, 2)}
                  </Caption>
                </View>
              </View>
            )}

            {/* Tool Result */}
            {toolExecution.result && (
              <View>
                <Caption style={{ color: colors.text.muted, marginBottom: spacing[1] }}>
                  Result:
                </Caption>
                <View
                  style={{
                    padding: spacing[2],
                    backgroundColor: colors.semantic.success.bg,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.semantic.success.border,
                  }}
                >
                  <Caption style={{ color: colors.text.secondary, fontFamily: 'monospace' }}>
                    {JSON.stringify(toolExecution.result, null, 2)}
                  </Caption>
                </View>
              </View>
            )}

            {/* Tool Error */}
            {toolExecution.error && (
              <View>
                <Caption style={{ color: colors.text.muted, marginBottom: spacing[1] }}>
                  Error:
                </Caption>
                <View
                  style={{
                    padding: spacing[2],
                    backgroundColor: colors.semantic.error.bg,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.semantic.error.border,
                  }}
                >
                  <Caption style={{ color: colors.semantic.error.base }}>{toolExecution.error}</Caption>
                </View>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default ToolExecutionIndicator;
