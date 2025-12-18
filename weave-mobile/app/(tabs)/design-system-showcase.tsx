/**
 * Design System Showcase Screen
 *
 * Interactive preview of all design system components, tokens, and styles
 * Use this to test and visualize the design system during development
 */

import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Heading,
  Title,
  Body,
  Caption,
  Label,
  Mono,
  GlassView,
  useTheme,
} from '../../src/design-system';

export default function DesignSystemShowcase() {
  const { colors, spacing, radius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing[4],
          gap: spacing[6],
        }}
      >
        {/* Header */}
        <View style={{ gap: spacing[2] }}>
          <Heading variant="display2xl">Design System</Heading>
          <Caption color="muted">React Native-First • NativeWind v5 • Liquid Glass UI</Caption>
        </View>

        {/* Typography Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Typography</Title>
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: radius.lg,
              padding: spacing[4],
              gap: spacing[3],
            }}
          >
            <Heading variant="display2xl">Display 2XL</Heading>
            <Heading variant="displayXl">Display XL</Heading>
            <Heading variant="displayLg">Display LG</Heading>
            <Title>Display MD (Title)</Title>
            <Text variant="textLg">Text LG - Large body text</Text>
            <Body>Text Base (Body) - Default body text</Body>
            <Text variant="textSm">Text SM - Secondary info</Text>
            <Caption>Text XS (Caption) - Helper text</Caption>
            <Label>Label Base - Button labels</Label>
            <Mono>Mono Base - Code snippets</Mono>
          </View>
        </View>

        {/* Colors Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Color Palette</Title>

          {/* Background Colors */}
          <View style={{ gap: spacing[2] }}>
            <Label>Background</Label>
            <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
              <View
                style={{
                  backgroundColor: colors.background.primary,
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border.muted,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.background.secondary,
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border.muted,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.background.elevated,
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border.muted,
                }}
              />
            </View>
          </View>

          {/* Accent Colors */}
          <View style={{ gap: spacing[2] }}>
            <Label>Accent Colors</Label>
            <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
              <View
                style={{
                  backgroundColor: colors.accent[500],
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.violet[500],
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.amber[500],
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.emerald[500],
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.rose[500],
                  width: 60,
                  height: 60,
                  borderRadius: radius.md,
                }}
              />
            </View>
          </View>
        </View>

        {/* Glassmorphism Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Glassmorphism Effects</Title>
          <Caption color="muted">
            {Platform.OS === 'web'
              ? 'Blur effects not available on web (fallback rendering)'
              : 'Install @react-native-community/blur for full blur effects'}
          </Caption>

          {/* Glass Card */}
          <GlassView variant="card" style={{ padding: spacing[4], gap: spacing[2] }}>
            <Label>Glass Card</Label>
            <Body>Standard glass effect with subtle blur</Body>
            <Caption color="muted">blur: 20 | variant: card</Caption>
          </GlassView>

          {/* Glass Elevated */}
          <GlassView variant="elevated" style={{ padding: spacing[4], gap: spacing[2] }}>
            <Label>Glass Elevated</Label>
            <Body>More prominent blur with shadow</Body>
            <Caption color="muted">blur: 30 | variant: elevated</Caption>
          </GlassView>

          {/* Glass AI */}
          <GlassView variant="ai" style={{ padding: spacing[4], gap: spacing[2] }}>
            <Label>Glass AI</Label>
            <Body>Violet-tinted glass for AI content</Body>
            <Caption color="muted">blur: 25 | variant: ai</Caption>
          </GlassView>

          {/* Glass Success */}
          <GlassView variant="success" style={{ padding: spacing[4], gap: spacing[2] }}>
            <Label>Glass Success</Label>
            <Body>Emerald-tinted glass for success states</Body>
            <Caption color="muted">blur: 25 | variant: success</Caption>
          </GlassView>

          {/* Glass Subtle */}
          <GlassView variant="subtle" style={{ padding: spacing[4], gap: spacing[2] }}>
            <Label>Glass Subtle</Label>
            <Body>Minimal glass effect</Body>
            <Caption color="muted">blur: 10 | variant: subtle</Caption>
          </GlassView>
        </View>

        {/* Spacing Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Spacing Scale</Title>
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: radius.lg,
              padding: spacing[4],
              gap: spacing[2],
            }}
          >
            {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
              <View key={size} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                <Text variant="textSm" style={{ width: 60 }}>
                  {spacing[size as keyof typeof spacing]}px
                </Text>
                <View
                  style={{
                    height: spacing[size as keyof typeof spacing],
                    backgroundColor: colors.accent[500],
                    borderRadius: radius.sm,
                    flex: 1,
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Border Radius Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Border Radius</Title>
          <View style={{ flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' }}>
            {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => (
              <View key={size} style={{ alignItems: 'center', gap: spacing[1] }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: colors.accent[500],
                    borderRadius: radius[size],
                  }}
                />
                <Caption>{size}</Caption>
              </View>
            ))}
          </View>
        </View>

        {/* Text Colors Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>Text Colors</Title>
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: radius.lg,
              padding: spacing[4],
              gap: spacing[2],
            }}
          >
            <Text color="primary">Primary Text</Text>
            <Text color="secondary">Secondary Text</Text>
            <Text color="muted">Muted Text</Text>
            <Text color="disabled">Disabled Text</Text>
            <Text color="ai">AI Text (Violet)</Text>
            <Text color="success">Success Text</Text>
            <Text color="error">Error Text</Text>
            <Text color="warning">Warning Text</Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={{ gap: spacing[4] }}>
          <Title>System Status</Title>
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: radius.lg,
              padding: spacing[4],
              gap: spacing[2],
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">Design Tokens</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">Theme System</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">Text Components</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">GlassView</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">Button Components</Caption>
              <Caption color="warning">⏳ Pending</Caption>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Caption color="muted">Card Components</Caption>
              <Caption color="warning">⏳ Pending</Caption>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: spacing[8] }}>
          <Caption color="muted">Weave Design System v0.2.0</Caption>
          <Caption color="muted">Built with React Native + NativeWind v5</Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
