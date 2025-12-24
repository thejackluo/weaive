/**
 * Design System Showcase Screen
 *
 * Visual showcase of DS-2 components:
 * - Text components (11)
 * - Button components (7)
 * - Icon component (1)
 */
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text as RNText,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import DS-2 Components from package
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
  ThemeProvider,
  useTheme,
} from '@weave/design-system';

/**
 * Design System Screen Entry Point
 */
export default function DesignSystemScreen() {
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
    Alert.alert('Component Pressed', `You pressed: ${component}`);
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg.primary }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.section}>
          <Heading level={1} color="text.primary">
            Weave Design System
          </Heading>
          <Caption color="text.secondary">
            DS-2: 19 Core Components
          </Caption>
        </View>

        {/* Theme Toggle */}
        <Section title="Theme System">
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

        {/* Text Components */}
        <Section title="Text Components (11)">
          <Heading level={1}>Heading Level 1</Heading>
          <Heading level={2}>Heading Level 2</Heading>
          <Heading level={3}>Heading Level 3</Heading>

          <View style={{ height: 16 }} />

          <Title>Title Text Component</Title>
          <Subtitle>Subtitle Text Component</Subtitle>
          <Body>Body text for regular content and paragraphs.</Body>
          <BodySmall>Small body text for secondary content.</BodySmall>
          <Caption>Caption text for metadata and labels.</Caption>
          <Label>Form Label</Label>
          <Link onPress={() => handlePress('Link')}>Link Component</Link>
          <Mono>Monospace code text</Mono>

          <View style={{ height: 16 }} />

          <AnimatedText variant="fadeIn">
            Animated Text (Fade In)
          </AnimatedText>
        </Section>

        {/* Button Components */}
        <Section title="Button Components (7)">
          <PrimaryButton
            size="lg"
            onPress={() => handlePress('Primary Button')}
            fullWidth
          >
            <Button.Text>Primary Button</Button.Text>
          </PrimaryButton>

          <SecondaryButton
            size="lg"
            onPress={() => handlePress('Secondary Button')}
            fullWidth
          >
            <Button.Text>Secondary Button</Button.Text>
          </SecondaryButton>

          <GhostButton
            size="lg"
            onPress={() => handlePress('Ghost Button')}
            fullWidth
          >
            <Button.Text>Ghost Button</Button.Text>
          </GhostButton>

          <DestructiveButton
            size="lg"
            onPress={() => handlePress('Destructive Button')}
            fullWidth
          >
            <Button.Text>Destructive Button</Button.Text>
          </DestructiveButton>

          <AIButton
            size="lg"
            onPress={() => handlePress('AI Button')}
            fullWidth
          >
            <Button.Icon name="sparkles" />
            <Button.Text>AI Magic Button</Button.Text>
          </AIButton>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            Button Sizes:
          </RNText>
          <View style={{ height: 8 }} />

          <PrimaryButton size="sm" onPress={() => handlePress('Small')}>
            <Button.Text>Small</Button.Text>
          </PrimaryButton>

          <PrimaryButton size="md" onPress={() => handlePress('Medium')}>
            <Button.Text>Medium</Button.Text>
          </PrimaryButton>

          <PrimaryButton size="lg" onPress={() => handlePress('Large')}>
            <Button.Text>Large</Button.Text>
          </PrimaryButton>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            Button with Icon:
          </RNText>
          <View style={{ height: 8 }} />

          <PrimaryButton
            size="lg"
            onPress={() => handlePress('With Icon')}
            fullWidth
          >
            <Button.Icon name="check" />
            <Button.Text>Complete Action</Button.Text>
          </PrimaryButton>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            Loading State:
          </RNText>
          <View style={{ height: 8 }} />

          <PrimaryButton
            size="lg"
            onPress={handleLoadingDemo}
            loading={loading}
            fullWidth
          >
            <Button.Text>Click to See Loading</Button.Text>
          </PrimaryButton>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            Icon Buttons:
          </RNText>
          <View style={{ height: 8 }} />

          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <IconButton
              icon="heart"
              variant="primary"
              size="md"
              onPress={() => handlePress('Heart')}
            />
            <IconButton
              icon="star"
              variant="secondary"
              size="md"
              onPress={() => handlePress('Star')}
            />
            <IconButton
              icon="trash"
              variant="destructive"
              size="md"
              onPress={() => handlePress('Delete')}
            />
            <IconButton
              icon="settings"
              variant="ghost"
              size="md"
              onPress={() => handlePress('Settings')}
            />
          </View>
        </Section>

        {/* Icon Component */}
        <Section title="Icon Component (1)">
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14, marginBottom: 12 }}>
            Icon Sizes:
          </RNText>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Icon name="check" size="sm" color="success" />
            <Icon name="check" size="md" color="success" />
            <Icon name="check" size="lg" color="success" />
            <Icon name="check" size="xl" color="success" />
          </View>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14, marginBottom: 12 }}>
            Icon Colors:
          </RNText>
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <Icon name="heart" size="lg" color="error" />
            <Icon name="check" size="lg" color="success" />
            <Icon name="alert-triangle" size="lg" color="warning" />
            <Icon name="info" size="lg" color="accent" />
            <Icon name="sparkles" size="lg" color="ai" />
          </View>

          <View style={{ height: 16 }} />
          <RNText style={{ color: theme.colors.text.secondary, fontSize: 14, marginBottom: 12 }}>
            Available Icons (sample):
          </RNText>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <Icon name="home" size="md" />
            <Icon name="user" size="md" />
            <Icon name="settings" size="md" />
            <Icon name="search" size="md" />
            <Icon name="bell" size="md" />
            <Icon name="mail" size="md" />
            <Icon name="calendar" size="md" />
            <Icon name="camera" size="md" />
            <Icon name="edit" size="md" />
            <Icon name="trash" size="md" />
            <Icon name="download" size="md" />
            <Icon name="upload" size="md" />
            <Icon name="star" size="md" />
            <Icon name="heart" size="md" />
            <Icon name="plus" size="md" />
            <Icon name="minus" size="md" />
            <Icon name="x" size="md" />
            <Icon name="check" size="md" />
          </View>
        </Section>

        {/* Success Message */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <View
            style={{
              backgroundColor: theme.colors.success[900],
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.success[500],
              borderRadius: 8,
              padding: 16,
            }}
          >
            <RNText style={{ color: theme.colors.success[500], fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
              ✅ DS-2 Complete!
            </RNText>
            <RNText style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
              19 core primitive components implemented and ready to use.
            </RNText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Section Component
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <RNText style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </RNText>
      <View style={{ gap: 12 }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
});
