/**
 * Design System Showcase
 *
 * Starter showcase displaying tokens and theme system
 * Components will be added as they are implemented
 *
 * Story DS-1: 273+ tokens, theme system, spring animations
 */
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ThemeProvider, useTheme } from './src/theme';
import { colors, typography, spacing, borders, shadows } from './src/tokens';

/**
 * Design System Showcase Entry Point
 */
export function DesignSystemShowcase() {
  return (
    <ThemeProvider initialTheme="dark">
      <ShowcaseContent />
    </ThemeProvider>
  );
}

function ShowcaseContent() {
  const { theme, mode, setTheme } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.bg.primary }
      ]}
      contentContainerStyle={{ padding: spacing[4] }}
    >
      {/* Header */}
      <View style={styles.section}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text.primary },
            typography.display.lg,
          ]}
        >
          Weave Design System
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.text.secondary },
            typography.label.lg,
          ]}
        >
          273+ Design Tokens • Story DS-1
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.text.tertiary },
            typography.label.md,
          ]}
        >
          Components coming soon...
        </Text>
      </View>

      {/* Theme Toggle */}
      <Section title="Theme System" theme={theme}>
        <Pressable
          onPress={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.accent.primary,
              borderRadius: borders.componentRadius.button,
              padding: spacing[3],
            },
            shadows.base,
          ]}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {mode === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </Text>
        </Pressable>
      </Section>

      {/* Color Tokens */}
      <Section title="Color Tokens (273+)" theme={theme}>
        <View style={styles.grid}>
          <ColorSwatch label="Primary" color={theme.colors.accent.primary} />
          <ColorSwatch label="Amber" color={theme.colors.accent.amber} />
          <ColorSwatch label="Violet" color={theme.colors.accent.violet} />
          <ColorSwatch label="Text Primary" color={theme.colors.text.primary} />
          <ColorSwatch label="Text Secondary" color={theme.colors.text.secondary} />
          <ColorSwatch label="Success" color={colors.success[500]} />
          <ColorSwatch label="Warning" color={colors.warning[500]} />
          <ColorSwatch label="Error" color={colors.error[500]} />
        </View>
      </Section>

      {/* Typography Scale */}
      <Section title="Typography Tokens (45+)" theme={theme}>
        <View style={styles.typographyList}>
          <Text style={[{ color: theme.colors.text.primary }, typography.display.lg]}>
            Display Large
          </Text>
          <Text style={[{ color: theme.colors.text.primary }, typography.display.sm]}>
            Display Small
          </Text>
          <Text style={[{ color: theme.colors.text.primary }, typography.label.lg]}>
            Label Large - The quick brown fox jumps over the lazy dog
          </Text>
          <Text style={[{ color: theme.colors.text.secondary }, typography.label.md]}>
            Label Medium - The quick brown fox jumps over the lazy dog
          </Text>
          <Text style={[{ color: theme.colors.text.tertiary }, typography.label.sm]}>
            Label Small - Metadata and tags
          </Text>
          <Text style={[{ color: theme.colors.text.muted }, typography.mono.md]}>
            Mono Medium - 0123456789
          </Text>
        </View>
      </Section>

      {/* Spacing Scale */}
      <Section title="Spacing Tokens (25+)" theme={theme}>
        <View style={styles.spacingList}>
          {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
            <View key={size} style={styles.spacingRow}>
              <View
                style={{
                  height: 32,
                  width: spacing[size as keyof typeof spacing] as number,
                  backgroundColor: theme.colors.accent.primary,
                  borderRadius: borders.radius.sm,
                }}
              />
              <Text style={[styles.spacingLabel, { color: theme.colors.text.secondary }]}>
                spacing[{size}] = {spacing[size as keyof typeof spacing]}px
              </Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Border Radius */}
      <Section title="Border Tokens (20+)" theme={theme}>
        <View style={styles.grid}>
          {Object.entries(borders.radius).slice(0, 6).map(([key, value]) => (
            <View key={key} style={styles.radiusItem}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: theme.colors.accent.violet,
                  borderRadius: value,
                }}
              />
              <Text style={[styles.radiusLabel, { color: theme.colors.text.tertiary }]}>
                {key}: {value}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Shadow Effects */}
      <Section title="Shadow Tokens (35+)" theme={theme}>
        <View style={styles.shadowList}>
          {(['sm', 'base', 'md', 'lg', 'xl'] as const).map((size) => (
            <View
              key={size}
              style={[
                styles.shadowBox,
                {
                  backgroundColor: theme.colors.bg.secondary,
                  borderRadius: borders.componentRadius.card,
                  padding: spacing[4],
                },
                shadows[size],
              ]}
            >
              <Text style={[styles.shadowLabel, { color: theme.colors.text.primary }]}>
                Shadow {size}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Status Info */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.bg.secondary,
            borderRadius: borders.componentRadius.card,
            borderWidth: borders.width.thin,
            borderColor: theme.colors.border.default,
            padding: spacing[4],
          },
        ]}
      >
        <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
          🚧 Components Coming Soon
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          This showcase currently displays the design token foundation (273+ tokens).
          {'\n\n'}
          Components will be added progressively:
          {'\n'}• Buttons (7 variants)
          {'\n'}• Cards (4 variants)
          {'\n'}• Inputs (10 types)
          {'\n'}• Badges (6 types)
          {'\n'}• Animations (Spring physics)
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Helper Components
function Section({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: any;
}) {
  return (
    <View style={[styles.section, { marginBottom: spacing[8] }]}>
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text.primary },
          typography.display.xs,
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.swatchContainer}>
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: color,
            borderRadius: borders.radius.md,
          },
        ]}
      />
      <Text style={[styles.swatchLabel, { color: colors.dark[400] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  swatch: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  swatchLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  typographyList: {
    gap: 16,
  },
  spacingList: {
    gap: 12,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spacingLabel: {
    fontSize: 14,
  },
  radiusItem: {
    alignItems: 'center',
    gap: 8,
  },
  radiusLabel: {
    fontSize: 12,
  },
  shadowList: {
    gap: 16,
  },
  shadowBox: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
