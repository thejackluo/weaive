/**
 * Design System Showcase
 *
 * Interactive preview of all design system components, tokens, and patterns
 * Use this screen to:
 * - Preview all components in action
 * - Test variants and states
 * - Copy usage examples
 * - Understand the visual language
 *
 * To use: Import and render this component in your app
 */

import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  // Theme
  useTheme,

  // Components
  Text,
  Heading,
  Title,
  Body,
  Caption,
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  AIButton,
  IconButton,
  Card,
  GlassCard,
  ElevatedCard,
  AICard,
  SuccessCard,
  NeedleCard,
  InsightCard,
  Input,
  TextArea,
  SearchInput,
  Checkbox,
  Badge,
  ConsistencyBadge,
  StreakBadge,
  AIBadge,
  StatusDot,
} from './index';

export function DesignSystemShowcase() {
  const { colors, spacing } = useTheme();

  // Component states
  const [checkboxState, setCheckboxState] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [needleExpanded, setNeedleExpanded] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing[4] }}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing[8] }}>
          <Heading>Design System</Heading>
          <Caption color="muted">
            Interactive showcase of all components and tokens
          </Caption>
        </View>

        {/* SECTION: Colors */}
        <Section title="Color Palette">
          <Card variant="glass" padding="spacious">
            <Body color="secondary">Background Colors</Body>
            <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
              <ColorSwatch color={colors.background.primary} label="Primary" />
              <ColorSwatch color={colors.background.secondary} label="Secondary" />
              <ColorSwatch color={colors.background.elevated} label="Elevated" />
              <ColorSwatch color={colors.background.glass} label="Glass" />
            </View>

            <Body color="secondary" style={{ marginTop: spacing[4] }}>
              Accent Colors
            </Body>
            <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
              <ColorSwatch color={colors.accent[500]} label="Accent" />
              <ColorSwatch color={colors.violet[500]} label="Violet" />
              <ColorSwatch color={colors.amber[500]} label="Amber" />
              <ColorSwatch color={colors.emerald[500]} label="Emerald" />
              <ColorSwatch color={colors.rose[500]} label="Rose" />
            </View>

            <Body color="secondary" style={{ marginTop: spacing[4] }}>
              Text Colors
            </Body>
            <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
              <Text color="primary">Primary Text</Text>
              <Text color="secondary">Secondary Text</Text>
              <Text color="tertiary">Tertiary Text</Text>
              <Text color="muted">Muted Text</Text>
              <Text color="ai">AI Text</Text>
              <Text color="success">Success Text</Text>
              <Text color="error">Error Text</Text>
            </View>
          </Card>
        </Section>

        {/* SECTION: Typography */}
        <Section title="Typography">
          <Card padding="spacious">
            <Text variant="display2xl">Display 2XL</Text>
            <Text variant="displayXl">Display XL</Text>
            <Text variant="displayLg">Display Large</Text>
            <Text variant="displayMd">Display Medium</Text>
            <View style={{ height: spacing[4] }} />
            <Text variant="textLg">Text Large - Body copy</Text>
            <Text variant="textBase">Text Base - Default body</Text>
            <Text variant="textSm">Text Small - Secondary info</Text>
            <Text variant="textXs">Text XS - Captions</Text>
            <View style={{ height: spacing[4] }} />
            <Text variant="labelLg">LABEL LARGE</Text>
            <Text variant="labelBase">LABEL BASE</Text>
            <Text variant="labelSm">LABEL SMALL</Text>
            <View style={{ height: spacing[4] }} />
            <Text variant="monoBase">Monospace Base - Code</Text>
            <Text variant="monoSm">Monospace Small</Text>
          </Card>
        </Section>

        {/* SECTION: Buttons */}
        <Section title="Buttons">
          <Card padding="spacious">
            <Body color="secondary">Button Variants</Body>
            <View style={{ gap: spacing[3], marginTop: spacing[3] }}>
              <PrimaryButton onPress={() => Alert.alert('Primary')}>
                Primary Button
              </PrimaryButton>
              <SecondaryButton onPress={() => Alert.alert('Secondary')}>
                Secondary Button
              </SecondaryButton>
              <GhostButton onPress={() => Alert.alert('Ghost')}>
                Ghost Button
              </GhostButton>
              <AIButton onPress={() => Alert.alert('AI')}>
                AI Button
              </AIButton>
              <DestructiveButton onPress={() => Alert.alert('Destructive')}>
                Destructive Button
              </DestructiveButton>
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Button Sizes
            </Body>
            <View style={{ gap: spacing[3], marginTop: spacing[3] }}>
              <Button size="sm" onPress={() => {}}>Small Button</Button>
              <Button size="md" onPress={() => {}}>Medium Button</Button>
              <Button size="lg" onPress={() => {}}>Large Button</Button>
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Button States
            </Body>
            <View style={{ gap: spacing[3], marginTop: spacing[3] }}>
              <Button disabled>Disabled Button</Button>
              <Button loading>Loading Button</Button>
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Icon Button
            </Body>
            <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[3] }}>
              <IconButton
                icon={<Text>❤️</Text>}
                onPress={() => Alert.alert('Favorite')}
                accessibilityLabel="Favorite"
              />
              <IconButton
                icon={<Text>⚙️</Text>}
                onPress={() => Alert.alert('Settings')}
                accessibilityLabel="Settings"
                variant="primary"
              />
              <IconButton
                icon={<Text>🗑️</Text>}
                onPress={() => Alert.alert('Delete')}
                accessibilityLabel="Delete"
                variant="destructive"
              />
            </View>
          </Card>
        </Section>

        {/* SECTION: Cards */}
        <Section title="Cards">
          <View style={{ gap: spacing[4] }}>
            <Card>
              <Body>Default Card</Body>
              <Caption>With border and background</Caption>
            </Card>

            <GlassCard>
              <Body>Glass Card</Body>
              <Caption>Opal-inspired glass effect</Caption>
            </GlassCard>

            <ElevatedCard>
              <Body>Elevated Card</Body>
              <Caption>With shadow elevation</Caption>
            </ElevatedCard>

            <AICard>
              <Body>AI Card</Body>
              <Caption>Violet-themed for AI content</Caption>
            </AICard>

            <SuccessCard>
              <Body>Success Card</Body>
              <Caption>Emerald-themed for success</Caption>
            </SuccessCard>

            <Card variant="glass" pressable onPress={() => Alert.alert('Pressed!')}>
              <Body>Pressable Card</Body>
              <Caption>Tap me to test interaction</Caption>
            </Card>
          </View>
        </Section>

        {/* SECTION: Specialized Cards */}
        <Section title="Specialized Cards">
          <View style={{ gap: spacing[4] }}>
            <NeedleCard
              title="Get Fit & Strong"
              consistency={75}
              bindsCount={3}
              expanded={needleExpanded}
              onPress={() => setNeedleExpanded(!needleExpanded)}
            >
              <Body color="secondary">
                Expanded content goes here. This could show your active binds,
                progress details, or quick actions.
              </Body>
            </NeedleCard>

            <InsightCard
              type="winning"
              title="You're crushing it!"
              content="You've completed your morning routine 8 days in a row. This consistency is building real momentum."
              onEdit={() => Alert.alert('Edit')}
              onDismiss={() => Alert.alert('Dismiss')}
            />

            <InsightCard
              type="consider"
              title="Consider this"
              content="Your evening reflection has been skipped for 3 days. This might be affecting your clarity on tomorrow's priorities."
              onEdit={() => Alert.alert('Edit')}
            />

            <InsightCard
              type="tomorrow"
              title="Tomorrow's Focus"
              content="Based on your goals, prioritize your gym session and client work. These align best with your dream self."
              onEdit={() => Alert.alert('Edit')}
            />
          </View>
        </Section>

        {/* SECTION: Inputs */}
        <Section title="Inputs">
          <Card padding="spacious">
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={inputValue}
              onChangeText={setInputValue}
              helperText="We'll never share your email"
            />

            <View style={{ height: spacing[4] }} />

            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              error="Password must be at least 8 characters"
            />

            <View style={{ height: spacing[6] }} />

            <SearchInput
              value={searchValue}
              onChangeText={setSearchValue}
              onClear={() => setSearchValue('')}
              placeholder="Search..."
            />

            <View style={{ height: spacing[6] }} />

            <TextArea
              label="Daily Reflection"
              placeholder="How do you feel about today?"
              value={textAreaValue}
              onChangeText={setTextAreaValue}
              lines={4}
            />
          </Card>
        </Section>

        {/* SECTION: Checkboxes */}
        <Section title="Checkboxes">
          <Card padding="spacious">
            <Checkbox
              checked={checkboxState}
              onChange={setCheckboxState}
              label="I agree to the terms and conditions"
            />

            <View style={{ height: spacing[4] }} />

            <View style={{ gap: spacing[3] }}>
              <Body color="secondary">Bind Checkbox (for task completion)</Body>
              <View style={{ backgroundColor: colors.background.elevated, borderRadius: 12, padding: spacing[3] }}>
                <Text>
                  Note: BindCheckbox component needs to be implemented
                </Text>
              </View>
            </View>
          </Card>
        </Section>

        {/* SECTION: Badges */}
        <Section title="Badges">
          <Card padding="spacious">
            <Body color="secondary">Badge Variants</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] }}>
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="ai">AI</Badge>
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Badge Sizes
            </Body>
            <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3], alignItems: 'center' }}>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Specialized Badges
            </Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginTop: spacing[3], alignItems: 'center' }}>
              <ConsistencyBadge percentage={85} />
              <ConsistencyBadge percentage={65} />
              <ConsistencyBadge percentage={30} />
              <StreakBadge count={12} />
              <AIBadge />
            </View>

            <Body color="secondary" style={{ marginTop: spacing[6] }}>
              Status Dots
            </Body>
            <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[3], alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: spacing[1], alignItems: 'center' }}>
                <StatusDot status="success" />
                <Caption>Active</Caption>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[1], alignItems: 'center' }}>
                <StatusDot status="warning" />
                <Caption>Pending</Caption>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[1], alignItems: 'center' }}>
                <StatusDot status="error" />
                <Caption>Failed</Caption>
              </View>
            </View>
          </Card>
        </Section>

        {/* SECTION: Spacing */}
        <Section title="Spacing Scale">
          <Card padding="spacious">
            <Body color="secondary">Base unit: 4px</Body>
            <View style={{ gap: spacing[2], marginTop: spacing[4] }}>
              <SpacingDemo value={1} />
              <SpacingDemo value={2} />
              <SpacingDemo value={3} />
              <SpacingDemo value={4} />
              <SpacingDemo value={6} />
              <SpacingDemo value={8} />
              <SpacingDemo value={12} />
              <SpacingDemo value={16} />
            </View>
          </Card>
        </Section>

        {/* Bottom padding */}
        <View style={{ height: spacing[12] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing[8] }}>
      <Title style={{ marginBottom: spacing[4] }}>{title}</Title>
      {children}
    </View>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: color,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          marginBottom: spacing[1],
        }}
      />
      <Caption align="center">{label}</Caption>
    </View>
  );
}

function SpacingDemo({ value }: { value: number }) {
  const { colors, spacing } = useTheme();
  const pixels = spacing[value as keyof typeof spacing];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
      <Caption style={{ width: 60 }}>
        spacing[{value}]
      </Caption>
      <View
        style={{
          width: pixels,
          height: 24,
          backgroundColor: colors.accent[600],
          borderRadius: 4,
        }}
      />
      <Caption color="muted">{pixels}px</Caption>
    </View>
  );
}

export default DesignSystemShowcase;
