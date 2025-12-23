/**
 * Design System Showcase
 *
 * Complete visual showcase of DS-1 + DS-2:
 * - DS-1: 273+ tokens, theme system, spring animations
 * - DS-2: 19 core primitives (Text, Buttons, Icons)
 *
 * Story DS-2 Complete
 */
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { ThemeProvider, useTheme } from './src/theme';
import { colors, typography, spacing, borders, shadows } from './src/tokens';

// Import DS-2 Components
import {
  Text,
  AnimatedText,
  Heading,
  Title,
  Subtitle,
  Body,
  BodySmall,
  Caption,
  Label,
  Link,
  Mono,
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  AIButton,
  IconButton,
  Icon,
} from './src/components';

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
  const [loading, setLoading] = useState(false);

  const handlePress = (component: string) => {
    Alert.alert('Button Pressed', `You pressed: ${component}`);
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

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
        <Heading level={1} color="text.primary">
          Weave Design System
        </Heading>
        <Caption color="text.secondary">
          DS-1: 273+ Tokens • DS-2: 19 Components
        </Caption>
      </View>

      {/* Theme Toggle */}
      <Section title="Theme System" theme={theme}>
        <PrimaryButton
          size="lg"
          onPress={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
          fullWidth
        >
          <Button.Icon name={mode === 'dark' ? 'sun' : 'moon'} />
          <Button.Text>
            {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Button.Text>
        </PrimaryButton>
      </Section>

      {/* DS-2: Text Components */}
      <Section title="Text Components (11)" theme={theme}>
        <View style={styles.componentList}>
          <Text variant="displayLg" color="text.primary">Display Large</Text>
          <Text variant="displayMd" color="text.primary">Display Medium</Text>
          <Text variant="displaySm" color="text.primary">Display Small</Text>
          
          <Title color="text.primary">Title (titleMd preset)</Title>
          <Subtitle color="text.secondary">Subtitle (titleSm preset)</Subtitle>
          
          <Body color="text.primary">Body text (bodyMd) - The quick brown fox jumps over the lazy dog</Body>
          <BodySmall color="text.secondary">Body Small (bodySm) - Metadata and supporting text</BodySmall>
          
          <Caption color="text.tertiary">Caption text for small labels</Caption>
          <Label color="text.muted">LABEL TEXT UPPERCASE</Label>
          
          <Link href="#" color="text.link" onPress={() => handlePress('Link')}>
            Interactive Link with Animation
          </Link>
          
          <Mono variant="mono.md" color="text.primary">
            Monospace: const x = 42;
          </Mono>
        </View>
      </Section>

      {/* DS-2: Animated Text */}
      <Section title="Animated Text" theme={theme}>
        <View style={styles.componentList}>
          <AnimatedText animation="fadeIn" variant="titleLg" color="text.primary">
            Fade In Animation
          </AnimatedText>
          <AnimatedText animation="slideUp" delay={200} variant="bodyLg" color="text.secondary">
            Slide Up Animation (200ms delay)
          </AnimatedText>
        </View>
      </Section>

      {/* DS-2: Button Variants */}
      <Section title="Button Variants (7)" theme={theme}>
        <View style={styles.buttonGrid}>
          <PrimaryButton size="md" onPress={() => handlePress('Primary')}>
            <Button.Text>Primary Button</Button.Text>
          </PrimaryButton>

          <SecondaryButton size="md" onPress={() => handlePress('Secondary')}>
            <Button.Icon name="settings" />
            <Button.Text>Secondary</Button.Text>
          </SecondaryButton>

          <GhostButton size="md" onPress={() => handlePress('Ghost')}>
            <Button.Text>Ghost Button</Button.Text>
          </GhostButton>

          <DestructiveButton size="md" onPress={() => handlePress('Destructive')}>
            <Button.Icon name="trash-2" />
            <Button.Text>Delete</Button.Text>
          </DestructiveButton>

          <AIButton size="md" onPress={() => handlePress('AI')}>
            <Button.Icon name="sparkles" />
            <Button.Text>Generate with AI</Button.Text>
          </AIButton>
        </View>
      </Section>

      {/* DS-2: Button Sizes */}
      <Section title="Button Sizes" theme={theme}>
        <View style={styles.buttonGrid}>
          <PrimaryButton size="sm" onPress={() => handlePress('Small')}>
            <Button.Text>Small</Button.Text>
          </PrimaryButton>

          <PrimaryButton size="md" onPress={() => handlePress('Medium')}>
            <Button.Text>Medium</Button.Text>
          </PrimaryButton>

          <PrimaryButton size="lg" onPress={() => handlePress('Large')}>
            <Button.Text>Large</Button.Text>
          </PrimaryButton>
        </View>
      </Section>

      {/* DS-2: Button States */}
      <Section title="Button States" theme={theme}>
        <View style={styles.buttonGrid}>
          <PrimaryButton 
            size="md" 
            loading={loading}
            onPress={handleLoadingDemo}
          >
            <Button.Text>
              {loading ? 'Loading...' : 'Click to Load'}
            </Button.Text>
          </PrimaryButton>

          <PrimaryButton size="md" disabled>
            <Button.Text>Disabled Button</Button.Text>
          </PrimaryButton>

          <SecondaryButton size="md" fullWidth onPress={() => handlePress('Full Width')}>
            <Button.Icon name="arrow-right" />
            <Button.Text>Full Width Button</Button.Text>
          </SecondaryButton>
        </View>
      </Section>

      {/* DS-2: Icon Buttons */}
      <Section title="Icon Buttons" theme={theme}>
        <View style={styles.iconButtonRow}>
          <IconButton 
            icon="menu" 
            variant="primary" 
            size="sm" 
            onPress={() => handlePress('Menu')} 
          />
          <IconButton 
            icon="search" 
            variant="primary" 
            size="md" 
            onPress={() => handlePress('Search')} 
          />
          <IconButton 
            icon="settings" 
            variant="primary" 
            size="lg" 
            onPress={() => handlePress('Settings')} 
          />
          <IconButton 
            icon="heart" 
            variant="secondary" 
            size="md" 
            onPress={() => handlePress('Favorite')} 
          />
          <IconButton 
            icon="bell" 
            variant="ghost" 
            size="md" 
            onPress={() => handlePress('Notifications')} 
          />
          <IconButton 
            icon="trash-2" 
            variant="destructive" 
            size="md" 
            onPress={() => handlePress('Delete')} 
          />
        </View>
      </Section>

      {/* DS-2: Icons */}
      <Section title="Icon Gallery (100+ Available)" theme={theme}>
        <View style={styles.iconGrid}>
          <IconDemo icon="sparkles" label="sparkles" theme={theme} />
          <IconDemo icon="heart" label="heart" theme={theme} />
          <IconDemo icon="star" label="star" theme={theme} />
          <IconDemo icon="target" label="target" theme={theme} />
          <IconDemo icon="zap" label="zap" theme={theme} />
          <IconDemo icon="home" label="home" theme={theme} />
          <IconDemo icon="search" label="search" theme={theme} />
          <IconDemo icon="settings" label="settings" theme={theme} />
          <IconDemo icon="user" label="user" theme={theme} />
          <IconDemo icon="bell" label="bell" theme={theme} />
          <IconDemo icon="calendar" label="calendar" theme={theme} />
          <IconDemo icon="clock" label="clock" theme={theme} />
          <IconDemo icon="mail" label="mail" theme={theme} />
          <IconDemo icon="phone" label="phone" theme={theme} />
          <IconDemo icon="camera" label="camera" theme={theme} />
          <IconDemo icon="mic" label="mic" theme={theme} />
        </View>
      </Section>

      {/* DS-1: Color Tokens */}
      <Section title="Color Tokens (273+)" theme={theme}>
        <View style={styles.grid}>
          <ColorSwatch label="Primary" color={theme.colors.accent.primary} />
          <ColorSwatch label="Amber" color={theme.colors.accent.amber} />
          <ColorSwatch label="Violet" color={theme.colors.accent.violet} />
          <ColorSwatch label="Success" color={colors.success[500]} />
          <ColorSwatch label="Warning" color={colors.warning[500]} />
          <ColorSwatch label="Error" color={colors.error[500]} />
        </View>
      </Section>

      {/* DS-1: Spacing Scale */}
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
              <Caption color="text.secondary">
                spacing[{size}] = {spacing[size as keyof typeof spacing]}px
              </Caption>
            </View>
          ))}
        </View>
      </Section>

      {/* Status Summary */}
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
        <Title color="text.primary">✅ DS-2 Complete</Title>
        <Body color="text.secondary">
          All 19 core primitive components are now implemented and ready to use:
          {'\n\n'}
          • Text Components (11): Text, AnimatedText, Heading, Title, Subtitle, Body, BodySmall, Caption, Label, Link, Mono
          {'\n'}• Button Components (7): Button, Primary, Secondary, Ghost, Destructive, AI, IconButton
          {'\n'}• Icon Component (1): Icon (100+ Lucide icons)
          {'\n\n'}
          Next: DS.3 (Form Components), DS.4 (Cards & Badges), DS.5 (Overlays)
        </Body>
      </View>

      <View style={{ height: 80 }} />
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
    <View style={[styles.section, { marginBottom: spacing[6] }]}>
      <Subtitle color="text.primary" style={{ marginBottom: spacing[3] }}>
        {title}
      </Subtitle>
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
      <Caption color="text.tertiary">{label}</Caption>
    </View>
  );
}

function IconDemo({ icon, label, theme }: { icon: string; label: string; theme: any }) {
  return (
    <View style={styles.iconItem}>
      <Icon name={icon} size="lg" color="text.primary" />
      <Caption color="text.tertiary">{label}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  componentList: {
    gap: 16,
  },
  buttonGrid: {
    gap: 12,
  },
  iconButtonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconItem: {
    alignItems: 'center',
    width: 80,
    gap: 8,
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
  spacingList: {
    gap: 12,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCard: {
    marginTop: 24,
  },
});
