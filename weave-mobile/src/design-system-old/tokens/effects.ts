/**
 * Effects Design Tokens - Shadows & Glassmorphism
 *
 * Based on 2025 Liquid Glass UI trends and Apple design language
 * Optimized for React Native with Reanimated v4+
 */

import { ViewStyle } from 'react-native';

// ============================================================================
// Shadow Definitions (iOS-style)
// ============================================================================
export const shadows = {
  // Subtle shadow for cards
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android shadow
  } as ViewStyle,

  // Medium shadow for floating elements
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  // Large shadow for modals, sheets
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  // Extra large shadow for popovers
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  // Colored shadows for specific contexts
  colored: {
    accent: {
      shadowColor: '#5B8DEF', // Primary blue
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,

    violet: {
      shadowColor: '#9D71E8', // AI violet
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,

    success: {
      shadowColor: '#10D87E', // Success emerald
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,
  },
} as const;

// ============================================================================
// Glassmorphism Effects (2025 Liquid Glass UI)
// ============================================================================
/**
 * Glassmorphism configuration for use with @react-native-community/blur
 *
 * Usage:
 * import { BlurView } from '@react-native-community/blur';
 * import { glass } from '@/design-system';
 *
 * <BlurView
 *   blurType={glass.card.blurType}
 *   blurAmount={glass.card.blurAmount}
 *   style={[glass.card.style, yourCustomStyles]}
 * >
 *   <YourContent />
 * </BlurView>
 */
export const glass = {
  // Standard glass card effect
  card: {
    blurType: 'dark' as const, // 'light' | 'dark' | 'regular'
    blurAmount: 20, // 0-100, higher = more blur
    style: {
      backgroundColor: 'rgba(26, 26, 31, 0.7)', // background.glass
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)', // border.glass
      backdropFilter: 'blur(20px)', // Web fallback (not supported on native)
    } as ViewStyle,
  },

  // Elevated glass effect (more prominent)
  elevated: {
    blurType: 'dark' as const,
    blurAmount: 30,
    style: {
      backgroundColor: 'rgba(26, 26, 31, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      ...shadows.md,
    } as ViewStyle,
  },

  // AI-themed glass (violet tint)
  ai: {
    blurType: 'dark' as const,
    blurAmount: 25,
    style: {
      backgroundColor: 'rgba(157, 113, 232, 0.15)', // Violet tint
      borderWidth: 1,
      borderColor: 'rgba(157, 113, 232, 0.3)',
      ...shadows.colored.violet,
    } as ViewStyle,
  },

  // Success glass (emerald tint)
  success: {
    blurType: 'dark' as const,
    blurAmount: 25,
    style: {
      backgroundColor: 'rgba(16, 216, 126, 0.15)', // Emerald tint
      borderWidth: 1,
      borderColor: 'rgba(16, 216, 126, 0.3)',
      ...shadows.colored.success,
    } as ViewStyle,
  },

  // Subtle glass (very light)
  subtle: {
    blurType: 'dark' as const,
    blurAmount: 10,
    style: {
      backgroundColor: 'rgba(26, 26, 31, 0.5)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    } as ViewStyle,
  },

  // Navigation bar glass
  nav: {
    blurType: 'dark' as const,
    blurAmount: 40,
    style: {
      backgroundColor: 'rgba(9, 9, 11, 0.9)', // More opaque for navigation
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      ...shadows.sm,
    } as ViewStyle,
  },

  // Modal overlay glass
  overlay: {
    blurType: 'dark' as const,
    blurAmount: 50,
    style: {
      backgroundColor: 'rgba(9, 9, 11, 0.8)',
    } as ViewStyle,
  },
} as const;

// ============================================================================
// Gradient Definitions (for backgrounds)
// ============================================================================
export const gradients = {
  // AI-themed gradient (violet to blue)
  ai: {
    colors: ['#9D71E8', '#5B8DEF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Success gradient (emerald to teal)
  success: {
    colors: ['#10D87E', '#0D9488'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Warm gradient (amber to rose)
  warm: {
    colors: ['#F5A623', '#E85A7E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Dark subtle gradient
  darkSubtle: {
    colors: ['#1A1A1F', '#09090B'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type ShadowToken = typeof shadows;
export type GlassToken = typeof glass;
export type GradientToken = typeof gradients;
export type ShadowSize = 'sm' | 'md' | 'lg' | 'xl';
export type GlassVariant = keyof typeof glass;
