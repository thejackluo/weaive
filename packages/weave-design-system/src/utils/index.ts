/**
 * Utilities
 *
 * Helper functions and utilities for:
 * - Color manipulation
 * - Responsive sizing
 * - Accessibility helpers
 * - Type guards
 *
 * @packageDocumentation
 */

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get contrasting text color (black or white) for background
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Scale value based on screen size (placeholder for future implementation)
 */
export function scale(size: number): number {
  // Will implement proper scaling based on screen dimensions
  return size;
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Generate accessible label for components
 */
export function generateAccessibilityLabel(
  componentType: string,
  props: Record<string, any>
): string {
  const { label, value, disabled, selected } = props;

  const parts = [componentType];

  if (label) parts.push(label);
  if (value) parts.push(`value ${value}`);
  if (disabled) parts.push('disabled');
  if (selected) parts.push('selected');

  return parts.join(', ');
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Check if value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

// =============================================================================
// EXPORTS
// =============================================================================

export const utils = {
  hexToRgba,
  getContrastColor,
  scale,
  generateAccessibilityLabel,
  isDefined,
  isFunction,
};
