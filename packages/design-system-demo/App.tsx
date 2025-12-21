/**
 * Weave Design System Demo
 *
 * This demo showcases:
 * - 273+ design tokens
 * - Dark/light theme switching
 * - Nested theme contexts with color-matched shadows
 * - Typography scales
 * - Spacing system
 * - Animation presets
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme, useThemeMode, Theme } from '@weave/design-system';

function ThemeToggle() {
  const { mode, setTheme } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
      style={styles.toggleButton}
    >
      <Text style={styles.toggleText}>
        {mode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </Text>
    </TouchableOpacity>
  );
}

function ColorTokensDemo() {
  const theme = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.bg.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Color Tokens (105+ colors)
      </Text>

      <View style={styles.colorGrid}>
        <ColorSwatch label="Primary" color={theme.colors.accent.primary} />
        <ColorSwatch label="Violet" color={theme.colors.accent.violet} />
        <ColorSwatch label="Amber" color={theme.colors.accent.amber} />
      </View>

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Text Colors
      </Text>
      <View style={styles.colorGrid}>
        <ColorSwatch label="Primary" color={theme.colors.text.primary} />
        <ColorSwatch label="Secondary" color={theme.colors.text.secondary} />
        <ColorSwatch label="Accent" color={theme.colors.text.accent} />
        <ColorSwatch label="AI" color={theme.colors.text.ai} />
        <ColorSwatch label="Success" color={theme.colors.text.success} />
        <ColorSwatch label="Error" color={theme.colors.text.error} />
      </View>

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Background Colors
      </Text>
      <View style={styles.colorGrid}>
        <ColorSwatch label="Primary" color={theme.colors.bg.primary} />
        <ColorSwatch label="Secondary" color={theme.colors.bg.secondary} />
        <ColorSwatch label="Tertiary" color={theme.colors.bg.tertiary} />
        <ColorSwatch label="Glass" color={theme.colors.bg.glass} />
      </View>
    </View>
  );
}

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={[styles.swatchLabel, { color: '#666' }]}>{label}</Text>
    </View>
  );
}

function TypographyDemo() {
  const theme = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.bg.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Typography Tokens (41+ tokens)
      </Text>

      <Text style={{ color: theme.colors.text.secondary, marginBottom: 8 }}>
        Display Scale (for large headings)
      </Text>
      <Text style={[
        theme.typography.display.xs,
        { color: theme.colors.text.primary, marginBottom: 4 }
      ]}>
        Display XS (36px)
      </Text>
      <Text style={[
        theme.typography.display.sm,
        { color: theme.colors.text.primary, marginBottom: 4 }
      ]}>
        Display SM (48px)
      </Text>

      <Text style={{ color: theme.colors.text.secondary, marginTop: 16, marginBottom: 8 }}>
        Label Scale (for UI labels)
      </Text>
      <Text style={[
        theme.typography.label.sm,
        { color: theme.colors.text.primary, marginBottom: 4 }
      ]}>
        Label SM (12px) - Perfect for badges and tags
      </Text>
      <Text style={[
        theme.typography.label.md,
        { color: theme.colors.text.primary, marginBottom: 4 }
      ]}>
        Label MD (14px) - Standard UI labels
      </Text>

      <Text style={{ color: theme.colors.text.secondary, marginTop: 16, marginBottom: 8 }}>
        Mono Scale (for code)
      </Text>
      <Text style={[
        theme.typography.mono.sm,
        { color: theme.colors.text.accent, marginBottom: 4 }
      ]}>
        const code = "Monospace font for code";
      </Text>
    </View>
  );
}

function NestedThemesDemo() {
  const theme = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.bg.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Nested Themes (7 themes)
      </Text>
      <Text style={[styles.label, { color: theme.colors.text.secondary, marginBottom: 16 }]}>
        Each theme has color-matched shadows
      </Text>

      <Theme name="violet">
        <ThemedCard theme="Violet" />
      </Theme>

      <Theme name="amber">
        <ThemedCard theme="Amber" />
      </Theme>

      <Theme name="rose">
        <ThemedCard theme="Rose" />
      </Theme>

      <Theme name="emerald">
        <ThemedCard theme="Emerald" />
      </Theme>

      <Theme name="ocean">
        <ThemedCard theme="Ocean" />
      </Theme>
    </View>
  );
}

function ThemedCard({ theme: themeName }: { theme: string }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.themedCard,
        {
          backgroundColor: theme.colors.bg.primary,
          borderColor: theme.colors.border.accent,
          borderWidth: 2,
          borderRadius: 12,
        },
        theme.glows.primary, // Color-matched shadow!
      ]}
    >
      <Text style={[styles.cardTitle, { color: theme.colors.text.accent }]}>
        {themeName} Theme
      </Text>
      <Text style={[styles.cardText, { color: theme.colors.text.primary }]}>
        Notice the shadow matches the accent color! This is automatic with nested themes.
      </Text>
      <View
        style={[
          styles.accentDot,
          { backgroundColor: theme.colors.accent.primary }
        ]}
      />
    </View>
  );
}

function SpacingDemo() {
  const theme = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.bg.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Spacing Tokens (44+ tokens)
      </Text>

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Base Scale (4px increments)
      </Text>
      <View style={styles.spacingGrid}>
        <SpacingBox size={theme.spacing[1]} label="1 (4px)" />
        <SpacingBox size={theme.spacing[2]} label="2 (8px)" />
        <SpacingBox size={theme.spacing[4]} label="4 (16px)" />
        <SpacingBox size={theme.spacing[8]} label="8 (32px)" />
      </View>

      <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 16 }]}>
        Semantic Tokens
      </Text>
      <View style={styles.spacingGrid}>
        <SpacingBox size={theme.spacing.gap.sm} label="Gap SM" />
        <SpacingBox size={theme.spacing.gap.md} label="Gap MD" />
        <SpacingBox size={theme.spacing.inset.sm} label="Inset SM" />
        <SpacingBox size={theme.spacing.layout.screenPadding} label="Screen" />
      </View>
    </View>
  );
}

function SpacingBox({ size, label }: { size: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.spacingBoxContainer}>
      <View
        style={[
          styles.spacingBox,
          {
            width: size,
            height: size,
            backgroundColor: theme.colors.accent.primary,
          }
        ]}
      />
      <Text style={[styles.spacingLabel, { color: theme.colors.text.secondary }]}>
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Weave Design System</Text>
          <Text style={styles.subtitle}>273+ Tokens · 7 Themes · Full Type Safety</Text>
          <ThemeToggle />
        </View>

        <ColorTokensDemo />
        <TypographyDemo />
        <NestedThemesDemo />
        <SpacingDemo />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎨 Design System v0.1.0
          </Text>
          <Text style={[styles.footerText, { fontSize: 12, marginTop: 4 }]}>
            Story DS-1 Complete ✅
          </Text>
        </View>
      </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  toggleButton: {
    backgroundColor: '#3B72F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    alignItems: 'center',
    width: 70,
  },
  swatchColor: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  swatchLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  themedCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  spacingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'flex-end',
  },
  spacingBoxContainer: {
    alignItems: 'center',
  },
  spacingBox: {
    marginBottom: 4,
  },
  spacingLabel: {
    fontSize: 10,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
