/**
 * Design System Showcase Screen
 *
 * Interactive preview of NativeWind v5 design system
 * Built with Tailwind CSS v4 and tailwind-variants
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
} from '../../src/design-system';

export default function DesignSystemShowcase() {
  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView contentContainerClassName="p-4 gap-6">
        {/* Header */}
        <View className="gap-2">
          <Heading variant="display2xl">Design System</Heading>
          <Caption>React Native-First • NativeWind v5 • Liquid Glass UI</Caption>
        </View>

        {/* Typography Section */}
        <View className="gap-4">
          <Title>Typography</Title>
          <View className="bg-background-secondary rounded-lg p-4 gap-3">
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

        {/* Color Palette Section */}
        <View className="gap-4">
          <Title>Color Palette</Title>

          {/* Background Colors */}
          <View className="gap-2">
            <Label>Background</Label>
            <View className="flex-row gap-2 flex-wrap">
              <View className="w-15 h-15 rounded-md border border-border-muted bg-background-primary" />
              <View className="w-15 h-15 rounded-md border border-border-muted bg-background-secondary" />
              <View className="w-15 h-15 rounded-md border border-border-muted bg-background-elevated" />
            </View>
          </View>

          {/* Accent Colors */}
          <View className="gap-2">
            <Label>Accent Colors</Label>
            <View className="flex-row gap-2 flex-wrap">
              <View className="w-15 h-15 rounded-md bg-accent-500" />
              <View className="w-15 h-15 rounded-md bg-violet-500" />
              <View className="w-15 h-15 rounded-md bg-amber-500" />
              <View className="w-15 h-15 rounded-md bg-emerald-500" />
              <View className="w-15 h-15 rounded-md bg-rose-500" />
            </View>
          </View>
        </View>

        {/* Glassmorphism Section */}
        <View className="gap-4">
          <Title>Glassmorphism Effects</Title>
          <Caption>
            {Platform.OS === 'web'
              ? 'Blur effects not available on web (fallback rendering)'
              : '@react-native-community/blur provides native blur effects'}
          </Caption>

          {/* Glass Card */}
          <GlassView variant="card" className="p-4 gap-2">
            <Label>Glass Card</Label>
            <Body>Standard glass effect with subtle blur</Body>
            <Caption>blur: 20 | variant: card</Caption>
          </GlassView>

          {/* Glass Elevated */}
          <GlassView variant="elevated" className="p-4 gap-2">
            <Label>Glass Elevated</Label>
            <Body>More prominent blur with shadow</Body>
            <Caption>blur: 30 | variant: elevated</Caption>
          </GlassView>

          {/* Glass AI */}
          <GlassView variant="ai" className="p-4 gap-2">
            <Label className="text-text-ai">Glass AI</Label>
            <Body>Violet-tinted glass for AI content</Body>
            <Caption>blur: 25 | variant: ai</Caption>
          </GlassView>

          {/* Glass Success */}
          <GlassView variant="success" className="p-4 gap-2">
            <Label className="text-text-success">Glass Success</Label>
            <Body>Emerald-tinted glass for success states</Body>
            <Caption>blur: 25 | variant: success</Caption>
          </GlassView>

          {/* Glass Subtle */}
          <GlassView variant="subtle" className="p-4 gap-2">
            <Label>Glass Subtle</Label>
            <Body>Minimal glass effect</Body>
            <Caption>blur: 10 | variant: subtle</Caption>
          </GlassView>
        </View>

        {/* Spacing Scale Section */}
        <View className="gap-4">
          <Title>Spacing Scale</Title>
          <View className="bg-background-secondary rounded-lg p-4 gap-2">
            {[
              { size: '1', px: '4px' },
              { size: '2', px: '8px' },
              { size: '3', px: '12px' },
              { size: '4', px: '16px' },
              { size: '6', px: '24px' },
              { size: '8', px: '32px' },
              { size: '12', px: '48px' },
              { size: '16', px: '64px' },
            ].map(({ size, px }) => (
              <View key={size} className="flex-row items-center gap-2">
                <Text variant="textSm" className="w-15">
                  {px}
                </Text>
                <View className={`h-${size} bg-accent-500 rounded-sm flex-1`} />
              </View>
            ))}
          </View>
        </View>

        {/* Border Radius Section */}
        <View className="gap-4">
          <Title>Border Radius</Title>
          <View className="flex-row gap-3 flex-wrap">
            {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map((size) => (
              <View key={size} className="items-center gap-1">
                <View className={`w-15 h-15 bg-accent-500 rounded-${size}`} />
                <Caption>{size}</Caption>
              </View>
            ))}
          </View>
        </View>

        {/* Text Colors Section */}
        <View className="gap-4">
          <Title>Text Colors</Title>
          <View className="bg-background-secondary rounded-lg p-4 gap-2">
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

        {/* System Status Section */}
        <View className="gap-4">
          <Title>System Status</Title>
          <View className="bg-background-secondary rounded-lg p-4 gap-2">
            <View className="flex-row justify-between">
              <Caption color="muted">Design Tokens (Tailwind v4)</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">NativeWind v5 Setup</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">Text Components</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">GlassView (Liquid Glass)</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">tailwind-variants Integration</Caption>
              <Caption color="success">✅ Complete</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">Button Components</Caption>
              <Caption color="warning">⏳ Pending</Caption>
            </View>
            <View className="flex-row justify-between">
              <Caption color="muted">Card Components</Caption>
              <Caption color="warning">⏳ Pending</Caption>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <Caption color="muted">Weave Design System v0.3.0</Caption>
          <Caption color="muted">Built with NativeWind v5 + Tailwind CSS v4</Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
