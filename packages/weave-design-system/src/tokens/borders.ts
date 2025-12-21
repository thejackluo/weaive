/**
 * Border Tokens (20+ tokens)
 *
 * Border widths, radius scale, and component-specific radius presets.
 *
 * @packageDocumentation
 */

export const borders = {
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },

  radius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Component-specific radius (semantic)
  componentRadius: {
    button: 12, // radius.md
    card: 16, // radius.lg
    input: 8, // radius.base
    modal: 20, // radius.xl
  },
} as const;
