import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  ThemeProvider,
  useTheme,
  createTheme,
  darkTheme,
  lightTheme,
} from '../index';

describe('Theme System', () => {
  describe('ThemeProvider', () => {
    it('should provide dark theme by default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(result.current.colors.bg.primary).toBe(darkTheme.colors.bg.primary);
    });

    it('should provide light theme when specified', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider initialTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('light');
      expect(result.current.colors.bg.primary).toBe(lightTheme.colors.bg.primary);
    });

    it('should accept custom theme', () => {
      const customTheme = createTheme({
        colors: {
          ...darkTheme.colors,
          accent: {
            ...darkTheme.colors.accent,
            primary: '#FF0000',
          },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider theme={customTheme}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.colors.accent.primary).toBe('#FF0000');
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide theme values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.colors).toBeDefined();
      expect(result.current.typography).toBeDefined();
      expect(result.current.spacing).toBeDefined();
      expect(result.current.borders).toBeDefined();
      expect(result.current.shadows).toBeDefined();
      expect(result.current.animations).toBeDefined();
    });

    it('should provide setTheme function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('Theme switching', () => {
    it('should switch from dark to light theme', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(result.current.colors.bg.primary).toBe(darkTheme.colors.bg.primary);

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.mode).toBe('light');
      expect(result.current.colors.bg.primary).toBe(lightTheme.colors.bg.primary);
    });

    it('should switch from light to dark theme', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider initialTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('light');

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.mode).toBe('dark');
    });

    it('should update theme colors when switching', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      const darkBg = result.current.colors.bg.primary;

      act(() => {
        result.current.setTheme('light');
      });

      const lightBg = result.current.colors.bg.primary;

      expect(darkBg).not.toBe(lightBg);
    });
  });

  describe('createTheme', () => {
    it('should create custom theme with overrides', () => {
      const customTheme = createTheme({
        colors: {
          ...darkTheme.colors,
          accent: {
            ...darkTheme.colors.accent,
            primary: '#123456',
          },
        },
      });

      expect(customTheme.colors.accent.primary).toBe('#123456');
    });

    it('should preserve base theme values', () => {
      const customTheme = createTheme({
        colors: {
          ...darkTheme.colors,
          accent: {
            ...darkTheme.colors.accent,
            primary: '#123456',
          },
        },
      });

      expect(customTheme.typography).toEqual(darkTheme.typography);
      expect(customTheme.spacing).toEqual(darkTheme.spacing);
      expect(customTheme.borders).toEqual(darkTheme.borders);
    });
  });

  describe('Theme structure', () => {
    it('should have correct dark theme structure', () => {
      expect(darkTheme.mode).toBe('dark');
      expect(darkTheme.colors.bg).toBeDefined();
      expect(darkTheme.colors.text).toBeDefined();
      expect(darkTheme.colors.border).toBeDefined();
      expect(darkTheme.colors.accent).toBeDefined();
    });

    it('should have correct light theme structure', () => {
      expect(lightTheme.mode).toBe('light');
      expect(lightTheme.colors.bg).toBeDefined();
      expect(lightTheme.colors.text).toBeDefined();
      expect(lightTheme.colors.border).toBeDefined();
      expect(lightTheme.colors.accent).toBeDefined();
    });

    it('should have all semantic text colors', () => {
      const { text } = darkTheme.colors;

      expect(text.primary).toBeDefined();
      expect(text.secondary).toBeDefined();
      expect(text.tertiary).toBeDefined();
      expect(text.muted).toBeDefined();
      expect(text.placeholder).toBeDefined();
      expect(text.disabled).toBeDefined();
      expect(text.link).toBeDefined();
      expect(text.accent).toBeDefined();
      expect(text.ai).toBeDefined();
      expect(text.success).toBeDefined();
      expect(text.warning).toBeDefined();
      expect(text.error).toBeDefined();
    });

    it('should have all background colors', () => {
      const { bg } = darkTheme.colors;

      expect(bg.primary).toBeDefined();
      expect(bg.secondary).toBeDefined();
      expect(bg.tertiary).toBeDefined();
      expect(bg.overlay).toBeDefined();
      expect(bg.glass).toBeDefined();
    });

    it('should have all accent colors', () => {
      const { accent } = darkTheme.colors;

      expect(accent.primary).toBe('#3B72F6');
      expect(accent.amber).toBe('#FBBF24');
      expect(accent.violet).toBe('#A78BFA');
    });
  });
});
