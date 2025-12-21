/**
 * Design System Showcase - Weave
 *
 * Interactive showcase of all design system components with live examples
 * Demonstrates the unique, world-class design language of Weave
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';

// Components
import { Button } from './components/Button/Button';
import { Checkbox } from './components/Checkbox/Checkbox';
import { Card } from './components/Card/Card';
import { WeaveCharacter } from './components/WeaveCharacter/WeaveCharacter';
import { Text, Heading, Title, Body, Caption } from './components/Text';

function ShowcaseContent() {
  const { colors, spacing } = useTheme();

  // Component states
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [checkbox3, setCheckbox3] = useState(false);
  const [level, setLevel] = useState(25);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing[8] }]}>
          <Heading>Weave Design System</Heading>
          <Caption color="muted" style={{ marginTop: spacing[2] }}>
            World-class components with unique, identity-driven interactions
          </Caption>
        </View>

        {/* WeaveCharacter Section */}
        <Card variant="glass" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>WeaveCharacter</Title>
          <Body color="secondary" style={{ marginBottom: spacing[6] }}>
            Mathematically complex curves that evolve with user progress. Uses parametric equations
            (Lissajous curves) that become more intricate as level increases.
          </Body>

          <View style={styles.showcaseRow}>
            <View style={styles.characterContainer}>
              <WeaveCharacter level={5} progress={0.3} size="small" />
              <Caption color="muted" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Level 5
              </Caption>
            </View>

            <View style={styles.characterContainer}>
              <WeaveCharacter level={25} progress={0.7} size="medium" />
              <Caption color="muted" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Level 25
              </Caption>
            </View>

            <View style={styles.characterContainer}>
              <WeaveCharacter level={75} progress={0.9} size="large" />
              <Caption color="muted" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Level 75
              </Caption>
            </View>
          </View>
        </Card>

        {/* Buttons Section */}
        <Card variant="default" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>Buttons</Title>
          <Body color="secondary" style={{ marginBottom: spacing[6] }}>
            Unique micro-interactions: glass morphing, shimmer on press, dynamic letter-spacing
            (tightens when pressed, mimicking "weaving"), and haptic feedback.
          </Body>

          <View style={[styles.buttonGrid, { gap: spacing[3] }]}>
            <Button variant="primary" size="md">
              Primary Action
            </Button>

            <Button variant="secondary" size="md">
              Secondary Action
            </Button>

            <Button variant="ghost" size="md">
              Ghost Button
            </Button>

            <Button variant="ai" size="md">
              AI Generate
            </Button>

            <Button variant="success" size="md">
              Complete
            </Button>

            <Button variant="destructive" size="md">
              Delete
            </Button>
          </View>

          <View style={[styles.buttonRow, { gap: spacing[3], marginTop: spacing[4] }]}>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </View>
        </Card>

        {/* Checkboxes Section */}
        <Card variant="glass" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>Checkboxes</Title>
          <Body color="secondary" style={{ marginBottom: spacing[6] }}>
            Morphing animation from circle to square, particle burst celebration, and color
            transitions representing progress. Not your typical checkbox!
          </Body>

          <View style={{ gap: spacing[4] }}>
            <Checkbox
              checked={checkbox1}
              onChange={setCheckbox1}
              label="Morning meditation (try checking me!)"
            />

            <Checkbox
              checked={checkbox2}
              onChange={setCheckbox2}
              label="Gym workout - Watch the particles burst!"
              size="lg"
            />

            <Checkbox
              checked={checkbox3}
              onChange={setCheckbox3}
              label="Evening journaling"
              size="sm"
            />
          </View>
        </Card>

        {/* Cards Section */}
        <View style={{ marginBottom: spacing[6], gap: spacing[3] }}>
          <Title style={{ marginBottom: spacing[4] }}>Cards</Title>

          <Card variant="glass" padding="default">
            <Body color="primary">Glass Card - Opal-inspired transparency</Body>
            <Caption color="muted" style={{ marginTop: spacing[2] }}>
              Semi-transparent with blur effect
            </Caption>
          </Card>

          <Card variant="elevated" padding="default">
            <Body color="primary">Elevated Card - Subtle depth</Body>
            <Caption color="muted" style={{ marginTop: spacing[2] }}>
              Shadow and elevation for floating elements
            </Caption>
          </Card>

          <Card variant="ai" padding="default">
            <Body color="primary">AI Card - Violet-tinted for AI content</Body>
            <Caption color="muted" style={{ marginTop: spacing[2] }}>
              Special variant for AI-generated insights
            </Caption>
          </Card>

          <Card variant="success" padding="default">
            <Body color="primary">Success Card - Emerald accent</Body>
            <Caption color="muted" style={{ marginTop: spacing[2] }}>
              Celebration and achievement moments
            </Caption>
          </Card>

          <Card variant="outlined" padding="default">
            <Body color="primary">Outlined Card - Minimal and clean</Body>
            <Caption color="muted" style={{ marginTop: spacing[2] }}>
              Border-only for subtle separation
            </Caption>
          </Card>
        </View>

        {/* Typography Section */}
        <Card variant="default" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>Typography</Title>
          <Body color="secondary" style={{ marginBottom: spacing[6] }}>
            System fonts (SF Pro / Roboto) with carefully tuned scales for clarity and hierarchy.
          </Body>

          <View style={{ gap: spacing[4] }}>
            <View>
              <Heading>Heading - Display Large</Heading>
              <Caption color="muted">24px, Semibold</Caption>
            </View>

            <View>
              <Title>Title - Display Medium</Title>
              <Caption color="muted">20px, Semibold</Caption>
            </View>

            <View>
              <Body>Body - Text Base</Body>
              <Caption color="muted">16px, Regular</Caption>
            </View>

            <View>
              <Caption>Caption - Text Extra Small</Caption>
              <Caption color="muted">12px, Regular</Caption>
            </View>
          </View>
        </Card>

        {/* Color Palette Section */}
        <Card variant="glass" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>Color System</Title>
          <Body color="secondary" style={{ marginBottom: spacing[6] }}>
            Dark-first palette with semantic colors representing identity states.
          </Body>

          <View style={{ gap: spacing[3] }}>
            <ColorSwatch color={colors.accent[500]} label="Accent" sublabel="Progress & Action" />
            <ColorSwatch color={colors.violet[500]} label="Violet" sublabel="AI & Dream Self" />
            <ColorSwatch color={colors.amber[500]} label="Amber" sublabel="Celebration & Warmth" />
            <ColorSwatch color={colors.emerald[500]} label="Emerald" sublabel="Success & Growth" />
            <ColorSwatch color={colors.rose[500]} label="Rose" sublabel="Attention & Limits" />
          </View>
        </Card>

        {/* Design Principles */}
        <Card variant="elevated" padding="spacious" style={{ marginBottom: spacing[6] }}>
          <Title style={{ marginBottom: spacing[4] }}>Design Principles</Title>

          <View style={{ gap: spacing[4] }}>
            <PrincipleItem
              title="Identity-First"
              description="Every visual reinforces the user's evolving identity"
            />
            <PrincipleItem
              title="Glassmorphism"
              description="Transparency represents clarity, depth reflects multi-dimensional growth"
            />
            <PrincipleItem
              title="Mathematical Beauty"
              description="Parametric curves and Bézier paths create organic, evolving patterns"
            />
            <PrincipleItem
              title="Micro-interactions"
              description="Purposeful animations that feel alive and responsive"
            />
            <PrincipleItem
              title="Dark-First"
              description="Optimized for focus, battery life, and premium feel"
            />
          </View>
        </Card>

        {/* Footer */}
        <View style={[styles.footer, { marginTop: spacing[8], marginBottom: spacing[12] }]}>
          <Caption color="muted" style={{ textAlign: 'center' }}>
            Weave Design System v1.0
          </Caption>
          <Caption color="muted" style={{ textAlign: 'center', marginTop: spacing[1] }}>
            "See who you're becoming"
          </Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper components
function ColorSwatch({
  color,
  label,
  sublabel,
}: {
  color: string;
  label: string;
  sublabel: string;
}) {
  const { spacing } = useTheme();

  return (
    <View style={styles.colorSwatchContainer}>
      <View style={[styles.colorSwatch, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Body>{label}</Body>
        <Caption color="muted" style={{ marginTop: spacing[1] }}>
          {sublabel}
        </Caption>
      </View>
    </View>
  );
}

function PrincipleItem({ title, description }: { title: string; description: string }) {
  const { spacing, colors } = useTheme();

  return (
    <View>
      <View style={[styles.principleHeader, { marginBottom: spacing[1] }]}>
        <View style={[styles.principleDot, { backgroundColor: colors.accent[500] }]} />
        <Body weight="semibold">{title}</Body>
      </View>
      <Caption color="secondary" style={{ marginLeft: spacing[5] }}>
        {description}
      </Caption>
    </View>
  );
}

// Wrapped with ThemeProvider
export function DesignSystemShowcase() {
  return (
    <ThemeProvider>
      <ShowcaseContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
  },
  showcaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
  },
  buttonGrid: {
    flexDirection: 'column',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  principleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    alignItems: 'center',
  },
});
