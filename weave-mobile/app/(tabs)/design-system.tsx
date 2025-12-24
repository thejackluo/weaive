/**
 * Design System Showcase Screen
 *
 * DS-2: Core Primitives (19 components)
 * - Text & Typography (11)
 * - Buttons (7)
 * - Icons (1)
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import all DS-2 components
import {
  // Text Components (11)
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

  // Button Components (7)
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  AIButton,
  IconButton,

  // Icon Component (1)
  Icon,
} from '@weave/design-system';

export default function DesignSystemScreen() {
  const [loading, setLoading] = useState(false);

  const handlePress = (label: string) => {
    Alert.alert('Button Pressed', label);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading>Design System Showcase</Heading>
          <Caption>DS-2: Core Primitives (19 components)</Caption>
        </View>

        {/* ========================================
            TEXT COMPONENTS (11)
            ======================================== */}
        <View style={styles.section}>
          <Title>Text Components (11)</Title>

          <View style={styles.card}>
            <Label>Text (Base Component)</Label>
            <Text>Default text component with theme support</Text>
          </View>

          <View style={styles.card}>
            <Label>AnimatedText</Label>
            <AnimatedText>Smooth animated text transitions</AnimatedText>
          </View>

          <View style={styles.card}>
            <Label>Heading (H1)</Label>
            <Heading>Large display heading</Heading>
          </View>

          <View style={styles.card}>
            <Label>Title (H2)</Label>
            <Title>Section title</Title>
          </View>

          <View style={styles.card}>
            <Label>Subtitle (H3)</Label>
            <Subtitle>Subsection subtitle</Subtitle>
          </View>

          <View style={styles.card}>
            <Label>Body (Paragraph)</Label>
            <Body>
              Standard body text for paragraphs. This is the primary text style used throughout the app for readable content.
            </Body>
          </View>

          <View style={styles.card}>
            <Label>BodySmall (Small Paragraph)</Label>
            <BodySmall>
              Smaller body text for secondary information or captions.
            </BodySmall>
          </View>

          <View style={styles.card}>
            <Label>Caption (Small Helper Text)</Label>
            <Caption>Helper text, timestamps, or metadata</Caption>
          </View>

          <View style={styles.card}>
            <Label>Label (Form Labels)</Label>
            <Label>Form field label</Label>
          </View>

          <View style={styles.card}>
            <Label>Link (Interactive Text)</Label>
            <Link onPress={() => handlePress('Link')}>
              Clickable link text
            </Link>
          </View>

          <View style={styles.card}>
            <Label>Mono (Monospace Code)</Label>
            <Mono>const code = 'monospace';</Mono>
          </View>
        </View>

        {/* ========================================
            BUTTON COMPONENTS (7)
            ======================================== */}
        <View style={styles.section}>
          <Title>Button Components (7)</Title>

          <View style={styles.card}>
            <Label>Button (Base Component)</Label>
            <Button onPress={() => handlePress('Button')}>
              Base Button
            </Button>
          </View>

          <View style={styles.card}>
            <Label>PrimaryButton</Label>
            <PrimaryButton onPress={() => handlePress('Primary')}>
              Primary Action
            </PrimaryButton>
          </View>

          <View style={styles.card}>
            <Label>SecondaryButton</Label>
            <SecondaryButton onPress={() => handlePress('Secondary')}>
              Secondary Action
            </SecondaryButton>
          </View>

          <View style={styles.card}>
            <Label>GhostButton</Label>
            <GhostButton onPress={() => handlePress('Ghost')}>
              Ghost Button
            </GhostButton>
          </View>

          <View style={styles.card}>
            <Label>DestructiveButton</Label>
            <DestructiveButton onPress={() => handlePress('Destructive')}>
              Delete Action
            </DestructiveButton>
          </View>

          <View style={styles.card}>
            <Label>AIButton (with sparkles icon)</Label>
            <AIButton onPress={() => handlePress('AI')}>
              Ask AI Coach
            </AIButton>
          </View>

          <View style={styles.card}>
            <Label>IconButton</Label>
            <View style={styles.row}>
              <IconButton
                icon="plus"
                onPress={() => handlePress('Add')}
              />
              <IconButton
                icon="x"
                onPress={() => handlePress('Close')}
              />
              <IconButton
                icon="settings"
                onPress={() => handlePress('Settings')}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Label>Button States (Loading)</Label>
            <PrimaryButton
              onPress={simulateLoading}
              loading={loading}
            >
              {loading ? 'Loading...' : 'Test Loading State'}
            </PrimaryButton>
          </View>

          <View style={styles.card}>
            <Label>Button States (Disabled)</Label>
            <PrimaryButton disabled onPress={() => {}}>
              Disabled Button
            </PrimaryButton>
          </View>
        </View>

        {/* ========================================
            ICON COMPONENT (1)
            ======================================== */}
        <View style={styles.section}>
          <Title>Icon Component (1)</Title>

          <View style={styles.card}>
            <Label>Icon (Lucide Icons)</Label>
            <View style={styles.iconGrid}>
              <View style={styles.iconItem}>
                <Icon name="home" size={24} />
                <Caption>home</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="user" size={24} />
                <Caption>user</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="settings" size={24} />
                <Caption>settings</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="bell" size={24} />
                <Caption>bell</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="check" size={24} />
                <Caption>check</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="x" size={24} />
                <Caption>x</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="plus" size={24} />
                <Caption>plus</Caption>
              </View>
              <View style={styles.iconItem}>
                <Icon name="trash-2" size={24} />
                <Caption>trash-2</Caption>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Label>Icon Sizes</Label>
            <View style={styles.row}>
              <Icon name="heart" size={16} />
              <Icon name="heart" size={24} />
              <Icon name="heart" size={32} />
              <Icon name="heart" size={48} />
            </View>
          </View>

          <View style={styles.card}>
            <Label>Icon Colors</Label>
            <View style={styles.row}>
              <Icon name="star" size={32} color="#3b82f6" />
              <Icon name="star" size={32} color="#10b981" />
              <Icon name="star" size={32} color="#f59e0b" />
              <Icon name="star" size={32} color="#ef4444" />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Caption>@weave/design-system v0.1.0</Caption>
          <Caption>DS-2: Core Primitives</Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 4,
    width: 60,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
});
