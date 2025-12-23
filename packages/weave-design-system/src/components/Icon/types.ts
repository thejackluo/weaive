/**
 * Icon Component Types
 */

import { LucideIcon } from 'lucide-react-native';

/**
 * Curated set of 100+ Lucide icon names
 * Full list: https://lucide.dev/icons/
 */
export type IconName =
  // UI & Navigation
  | 'menu'
  | 'x'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'home'
  | 'settings'
  | 'user'
  | 'search'
  | 'filter'
  | 'more-horizontal'
  | 'more-vertical'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'trash-2'
  | 'copy'
  | 'check'
  | 'external-link'
  | 'link'
  // Media & Files
  | 'image'
  | 'file'
  | 'folder'
  | 'download'
  | 'upload'
  | 'camera'
  | 'mic'
  | 'video'
  | 'music'
  | 'play'
  | 'pause'
  | 'stop'
  // Communication
  | 'mail'
  | 'message-circle'
  | 'send'
  | 'bell'
  | 'phone'
  | 'at-sign'
  // Status & Alerts
  | 'alert-circle'
  | 'alert-triangle'
  | 'info'
  | 'help-circle'
  | 'check-circle'
  | 'x-circle'
  | 'loader'
  // Weave-Specific
  | 'sparkles'
  | 'target'
  | 'zap'
  | 'star'
  | 'heart'
  | 'bookmark'
  | 'flag'
  | 'calendar'
  | 'clock'
  | 'trending-up'
  | 'trending-down'
  | 'activity'
  | 'pie-chart'
  | 'bar-chart'
  | 'smile'
  | 'meh'
  | 'frown'
  | 'sun'
  | 'moon'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'unlock'
  | 'refresh-cw'
  | 'repeat'
  // And more...
  | string; // Allow any Lucide icon name

/**
 * Icon size presets
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Props for Icon component
 */
export interface IconProps {
  /** Lucide icon name */
  name: IconName;
  /** Size preset or custom number */
  size?: IconSize;
  /** Color (theme token path or raw color) */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
}
