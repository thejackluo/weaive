import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import {
  ThemeProvider,
  useTheme,
  useThemeMode,
  Theme,
} from './src/theme';
import { Button } from './src/components/buttons/Button';
import { Card } from './src/components/cards/Card';
import { TextInput } from './src/components/inputs/TextInput';
import { Checkbox } from './src/components/inputs/Checkbox';
import { Toggle } from './src/components/inputs/Toggle';
import { Slider } from './src/components/inputs/Slider';
import { Badge } from './src/components/badges/Badge';
import { StatusDot } from './src/components/badges/StatusDot';
import { Divider } from './src/components/layout/Divider';
import { FadeIn, SlideIn, ScaleIn } from './src/animations';

/**
 * Comprehensive Design System Showcase
 *
 * Displays all 70+ components from the Weave Design System
 * Built with Story DS-1: 273+ tokens, themes, animations
 *
 * Sections:
 * - Design Tokens (Colors, Typography, Spacing)
 * - Theme System (Dark/Light, Named themes)
 * - Buttons (7 variants)
 * - Cards (4 variants)
 * - Inputs (10 types)
 * - Badges (6 types)
 * - Animations (4 types)
 * - Layout Components
 */
export function DesignSystemShowcase() {
  return (
    <ThemeProvider initialTheme="dark">
      <ShowcaseContent />
    </ThemeProvider>
  );
}

function ShowcaseContent() {
  const { colors, spacing, typography, shadows } = useTheme();
  const { mode, setTheme } = useThemeMode();

  const [sliderValue, setSliderValue] = useState(50);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: spacing[4] }}
    >
      {/* Header */}
      <View className="mb-8">
        <Text
          className="text-4xl font-bold text-text-primary mb-2"
          style={typography.display.lg}
        >
          Weave Design System
        </Text>
        <Text className="text-lg text-text-secondary" style={typography.body.lg}>
          273+ Design Tokens • 70+ Components • Story DS-1
        </Text>
      </View>

      {/* Theme Toggle */}
      <Section title="Theme System">
        <Pressable
          onPress={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
          className="px-6 py-3 bg-primary rounded-lg active:opacity-80"
        >
          <Text className="text-white font-semibold text-center">
            {mode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Text>
        </Pressable>

        <View className="mt-4">
          <Text className="text-text-secondary mb-2">Named Themes:</Text>
          <View className="flex-row flex-wrap gap-2">
            {['violet', 'emerald', 'amber', 'rose'].map((themeName) => (
              <Theme key={themeName} name={themeName as any}>
                <Card variant="glass" className="p-4">
                  <Text className="text-text-primary font-medium capitalize">
                    {themeName}
                  </Text>
                </Card>
              </Theme>
            ))}
          </View>
        </View>
      </Section>

      {/* Design Tokens */}
      <Section title="Design Tokens">
        <SubSection title="Colors (273+ tokens)">
          <View className="flex-row flex-wrap gap-2">
            {Object.keys(colors.semantic).map((colorKey) => (
              <View key={colorKey} className="items-center">
                <View
                  className="w-12 h-12 rounded-lg mb-1"
                  style={{
                    backgroundColor: colors.semantic[colorKey as keyof typeof colors.semantic]
                  }}
                />
                <Text className="text-xs text-text-tertiary">{colorKey}</Text>
              </View>
            ))}
          </View>
        </SubSection>

        <SubSection title="Typography">
          <Text style={typography.display.lg} className="text-text-primary mb-2">
            Display Large
          </Text>
          <Text style={typography.heading.lg} className="text-text-primary mb-2">
            Heading Large
          </Text>
          <Text style={typography.body.lg} className="text-text-primary mb-2">
            Body Large
          </Text>
          <Text style={typography.body.base} className="text-text-secondary mb-2">
            Body Base
          </Text>
          <Text style={typography.caption.base} className="text-text-tertiary">
            Caption
          </Text>
        </SubSection>

        <SubSection title="Spacing Scale">
          <View className="gap-2">
            {[1, 2, 3, 4, 6, 8, 12].map((size) => (
              <View key={size} className="flex-row items-center gap-2">
                <View
                  className="bg-primary h-8"
                  style={{ width: spacing[size as keyof typeof spacing] }}
                />
                <Text className="text-text-secondary">
                  spacing[{size}] = {spacing[size as keyof typeof spacing]}px
                </Text>
              </View>
            ))}
          </View>
        </SubSection>
      </Section>

      {/* Buttons */}
      <Section title="Buttons (7 variants)">
        <View className="gap-3">
          <Button variant="primary" onPress={() => {}}>
            Primary Button
          </Button>
          <Button variant="secondary" onPress={() => {}}>
            Secondary Button
          </Button>
          <Button variant="ghost" onPress={() => {}}>
            Ghost Button
          </Button>
          <Button variant="destructive" onPress={() => {}}>
            Destructive Button
          </Button>
          <Button variant="ai" onPress={() => {}}>
            ✨ AI Button
          </Button>
          <View className="flex-row gap-2">
            <Button size="sm" onPress={() => {}}>
              Small
            </Button>
            <Button size="md" onPress={() => {}}>
              Medium
            </Button>
            <Button size="lg" onPress={() => {}}>
              Large
            </Button>
          </View>
          <Button disabled onPress={() => {}}>
            Disabled Button
          </Button>
        </View>
      </Section>

      {/* Cards */}
      <Section title="Cards (4 variants)">
        <View className="gap-3">
          <Card variant="glass" className="p-4">
            <Text className="text-text-primary font-semibold mb-1">
              Glass Card
            </Text>
            <Text className="text-text-secondary">
              Frosted glass effect with backdrop blur
            </Text>
          </Card>

          <Card variant="elevated" className="p-4">
            <Text className="text-text-primary font-semibold mb-1">
              Elevated Card
            </Text>
            <Text className="text-text-secondary">
              Elevated with shadow for depth
            </Text>
          </Card>

          <Card variant="ai" className="p-4">
            <Text className="text-text-primary font-semibold mb-1">
              ✨ AI Card
            </Text>
            <Text className="text-text-secondary">
              AI-powered features with gradient border
            </Text>
          </Card>
        </View>
      </Section>

      {/* Inputs */}
      <Section title="Inputs (10 types)">
        <View className="gap-4">
          <TextInput
            placeholder="Text Input"
            defaultValue="Hello World"
          />

          <RNTextInput
            placeholder="Search..."
            className="px-4 py-3 bg-surface rounded-lg text-text-primary border border-border"
            placeholderTextColor={colors.text.tertiary}
          />

          <View className="flex-row items-center gap-3">
            <Checkbox
              checked={isChecked}
              onCheckedChange={setIsChecked}
            />
            <Text className="text-text-primary">Checkbox</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary">Toggle</Text>
            <Toggle
              value={isToggled}
              onValueChange={setIsToggled}
            />
          </View>

          <View>
            <Text className="text-text-secondary mb-2">
              Slider: {sliderValue}%
            </Text>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              minimumValue={0}
              maximumValue={100}
            />
          </View>
        </View>
      </Section>

      {/* Badges */}
      <Section title="Badges (6 types)">
        <View className="flex-row flex-wrap gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="ai">✨ AI</Badge>
          <View className="flex-row items-center gap-2 px-3 py-1.5 bg-surface rounded-full">
            <StatusDot status="active" />
            <Text className="text-text-primary text-sm">Active</Text>
          </View>
          <View className="flex-row items-center gap-2 px-3 py-1.5 bg-surface rounded-full">
            <StatusDot status="idle" />
            <Text className="text-text-primary text-sm">Idle</Text>
          </View>
        </View>
      </Section>

      {/* Animations */}
      <Section title="Animations (4 types)">
        <View className="gap-4">
          <FadeIn duration={1000}>
            <Card className="p-4">
              <Text className="text-text-primary">Fade In Animation</Text>
            </Card>
          </FadeIn>

          <SlideIn direction="left" duration={600}>
            <Card className="p-4">
              <Text className="text-text-primary">Slide In from Left</Text>
            </Card>
          </SlideIn>

          <ScaleIn duration={400}>
            <Card className="p-4">
              <Text className="text-text-primary">Scale In Animation</Text>
            </Card>
          </ScaleIn>
        </View>
      </Section>

      {/* Layout */}
      <Section title="Layout Components">
        <View className="gap-4">
          <View>
            <Text className="text-text-secondary mb-2">Divider</Text>
            <Divider />
          </View>

          <View className="bg-surface rounded-lg">
            <Pressable className="px-4 py-3 flex-row justify-between items-center">
              <Text className="text-text-primary">List Item 1</Text>
              <Text className="text-text-tertiary">→</Text>
            </Pressable>
            <Divider />
            <Pressable className="px-4 py-3 flex-row justify-between items-center">
              <Text className="text-text-primary">List Item 2</Text>
              <Text className="text-text-tertiary">→</Text>
            </Pressable>
          </View>
        </View>
      </Section>

      {/* Footer */}
      <View className="mt-8 p-6 bg-surface rounded-lg">
        <Text className="text-text-primary font-semibold mb-2">
          Design System Info
        </Text>
        <Text className="text-text-secondary text-sm leading-relaxed">
          Built with Story DS-1 • 273+ design tokens • NativeWind v5 •
          Expo SDK 54 • React Native 0.81.5
        </Text>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}

// Section Component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="text-2xl font-bold text-text-primary mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
}

// SubSection Component
function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold text-text-secondary mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}
