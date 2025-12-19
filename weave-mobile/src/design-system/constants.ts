/**
 * Design System Constants
 */

// Component display names for debugging
export const COMPONENT_NAMES = {
  TEXT: 'Weave.Text',
  BUTTON: 'Weave.Button',
  CARD: 'Weave.Card',
  INPUT: 'Weave.Input',
  CHECKBOX: 'Weave.Checkbox',
  BADGE: 'Weave.Badge',
  GLASS_VIEW: 'Weave.GlassView',
} as const;

// Design system version
export const VERSION = '1.0.0';

// Platform-specific constants
export const PLATFORM_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // Apple HIG minimum
  DEFAULT_ANIMATION_DURATION: 200,
  HAPTIC_FEEDBACK_ENABLED: true,
} as const;
