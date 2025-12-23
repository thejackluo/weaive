/**
 * Icon Component
 * Wrapper for Lucide icons with theme integration
 */

import React, { useMemo } from 'react';
import { icons } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { IconProps, IconSize } from './types';

/**
 * Size preset mappings (in pixels)
 */
const sizePresets: Record<Exclude<IconSize, number>, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

/**
 * Icon component wrapping Lucide icons
 * Provides theme color integration and size presets
 *
 * @example
 * ```tsx
 * <Icon name="sparkles" size="md" color="text.accent" />
 * ```
 */
export function Icon({
  name,
  size = 'md',
  color = 'text.primary',
  strokeWidth = 2,
  accessibilityLabel,
}: IconProps) {
  const theme = useTheme();

  // Resolve size
  const resolvedSize = typeof size === 'number' ? size : sizePresets[size];

  // Resolve color from theme tokens or use raw value
  const resolvedColor = useMemo(() => {
    if (color.includes('.')) {
      // Theme token path like "text.primary"
      const path = color.split('.');
      let value: any = theme.colors;
      for (const key of path) {
        value = value?.[key];
      }
      return value || color;
    }
    return color;
  }, [color, theme.colors]);

  // Get Lucide icon component
  const IconComponent = icons[name as keyof typeof icons];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);
    // Return fallback icon (help-circle)
    const FallbackIcon = icons['HelpCircle'];
    return (
      <FallbackIcon
        size={resolvedSize}
        color={resolvedColor}
        strokeWidth={strokeWidth}
        accessibilityLabel={accessibilityLabel || `Icon: ${name}`}
      />
    );
  }

  return (
    <IconComponent
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      accessibilityLabel={accessibilityLabel || `Icon: ${name}`}
    />
  );
}

Icon.displayName = 'Icon';
