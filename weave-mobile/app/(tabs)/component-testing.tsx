/**
 * Component Testing Screen
 *
 * Focused testing environment for validating individual design system components.
 * Test 3 components at a time, validate their behavior, then approve or request changes.
 *
 * Current Batch: Avatar, BindCard, CaptureCard
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  // Theme
  useTheme,

  // Components being tested
  Avatar,
  AvatarGroup,
  AvatarWithName,
  BindCard,
  CaptureCard,

  // UI helpers
  Text,
  Heading,
  Title,
  Body,
  Caption,
  Card,
  GlassCard,
  Button,
  PrimaryButton,
  SecondaryButton,
} from '../../src/design-system';

export default function ComponentTestingScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();

  // Component states for testing
  const [bind1Completed, setBind1Completed] = useState(false);
  const [bind2Completed, setBind2Completed] = useState(true);
  const [bind3Completed, setBind3Completed] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[5],
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.subtle,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: spacing[2] }}>
          <Text variant="labelBase" color="accent">← Back</Text>
        </Pressable>
        <Heading color="primary">Component Testing</Heading>
        <Caption color="muted">Batch 1: Avatar, BindCard, CaptureCard</Caption>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[6] }}
      >
        {/* Testing Instructions */}
        <GlassCard padding="spacious">
          <Body color="primary" weight="medium">Testing Instructions</Body>
          <View style={{ marginTop: spacing[2], gap: spacing[1] }}>
            <Caption color="muted">• Interact with each component variant</Caption>
            <Caption color="muted">• Check all states (hover, press, disabled)</Caption>
            <Caption color="muted">• Verify animations and visual feedback</Caption>
            <Caption color="muted">• Test on different screen sizes</Caption>
            <Caption color="muted">• Document any issues in the tracking doc</Caption>
          </View>
        </GlassCard>

        {/* ================================================================ */}
        {/* AVATAR COMPONENT TESTING */}
        {/* ================================================================ */}

        <TestSection title="1. Avatar Component" componentCount={3}>
          <Caption color="muted" style={{ marginBottom: spacing[3] }}>
            User profile pictures with gradient fallbacks, initials, and status indicators
          </Caption>

          {/* Basic Avatars - All Sizes */}
          <TestCase title="Avatar Sizes">
            <View style={{ flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar initials="XS" size="xs" gradientColors={[colors.accent[600], colors.violet[600]]} />
                <Caption color="muted">XS</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar initials="SM" size="sm" gradientColors={[colors.violet[600], colors.purple[600]]} />
                <Caption color="muted">SM</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar initials="MD" size="md" gradientColors={[colors.purple[600], colors.rose[600]]} />
                <Caption color="muted">MD</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar initials="LG" size="lg" gradientColors={[colors.rose[600], colors.orange[600]]} />
                <Caption color="muted">LG</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar initials="XL" size="xl" gradientColors={[colors.emerald[600], colors.teal[600]]} />
                <Caption color="muted">XL</Caption>
              </View>
            </View>
          </TestCase>

          {/* Avatars with Status */}
          <TestCase title="Status Indicators">
            <View style={{ flexDirection: 'row', gap: spacing[4], flexWrap: 'wrap' }}>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar
                  initials="JD"
                  size="lg"
                  status="online"
                  gradientColors={[colors.accent[600], colors.violet[600]]}
                />
                <Caption color="muted">Online</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar
                  initials="SM"
                  size="lg"
                  status="away"
                  gradientColors={[colors.amber[600], colors.orange[600]]}
                />
                <Caption color="muted">Away</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar
                  initials="AB"
                  size="lg"
                  status="busy"
                  gradientColors={[colors.rose[600], colors.red[600]]}
                />
                <Caption color="muted">Busy</Caption>
              </View>
              <View style={{ alignItems: 'center', gap: spacing[1] }}>
                <Avatar
                  initials="KC"
                  size="lg"
                  status="offline"
                  gradientColors={[colors.dark[600], colors.dark[700]]}
                />
                <Caption color="muted">Offline</Caption>
              </View>
            </View>
          </TestCase>

          {/* Avatar Group */}
          <TestCase title="Avatar Group (Overlapping)">
            <AvatarGroup
              avatars={[
                { initials: 'JD', gradientColors: [colors.accent[600], colors.violet[600]] },
                { initials: 'SM', gradientColors: [colors.violet[600], colors.purple[600]] },
                { initials: 'AB', gradientColors: [colors.purple[600], colors.rose[600]] },
                { initials: 'KC', gradientColors: [colors.rose[600], colors.orange[600]] },
                { initials: 'ML', gradientColors: [colors.emerald[600], colors.teal[600]] },
                { initials: 'TW', gradientColors: [colors.cyan[500], colors.blue[500]] },
                { initials: 'PL', gradientColors: [colors.amber[500], colors.orange[500]] },
              ]}
              max={5}
              size="md"
            />
          </TestCase>

          {/* Avatar with Name */}
          <TestCase title="Avatar with Name (Horizontal)">
            <AvatarWithName
              initials="JD"
              name="John Doe"
              subtitle="@johndoe • Active now"
              size="lg"
              status="online"
              gradientColors={[colors.accent[600], colors.violet[600]]}
              direction="horizontal"
            />
          </TestCase>

          <TestCase title="Avatar with Name (Vertical)">
            <View style={{ alignItems: 'center' }}>
              <AvatarWithName
                initials="SM"
                name="Sarah Miller"
                subtitle="Product Designer"
                size="xl"
                gradientColors={[colors.purple[600], colors.rose[600]]}
                direction="vertical"
              />
            </View>
          </TestCase>
        </TestSection>

        {/* ================================================================ */}
        {/* BIND CARD COMPONENT TESTING */}
        {/* ================================================================ */}

        <TestSection title="2. BindCard Component" componentCount={1}>
          <Caption color="muted" style={{ marginBottom: spacing[3] }}>
            Task completion card with checkbox, timer, and proof indicators
          </Caption>

          {/* Basic BindCard - Not Completed */}
          <TestCase title="Uncompleted Task">
            <BindCard
              title="Morning workout session"
              description="30 min cardio + strength training"
              estimatedTime="45 min"
              completed={bind1Completed}
              hasProof={false}
              onToggle={setBind1Completed}
              onPress={() => Alert.alert('Bind Details', 'Navigate to bind detail screen')}
              onTimer={() => Alert.alert('Timer', 'Start timer for this bind')}
            />
          </TestCase>

          {/* Completed BindCard with Proof */}
          <TestCase title="Completed Task with Proof">
            <BindCard
              title="Read 20 pages of current book"
              description="Deep Work by Cal Newport"
              estimatedTime="30 min"
              completed={bind2Completed}
              hasProof={true}
              onToggle={setBind2Completed}
              onPress={() => Alert.alert('Bind Details', 'View completion proof and notes')}
              onTimer={() => Alert.alert('Timer', 'Start timer for this bind')}
            />
          </TestCase>

          {/* BindCard without Timer */}
          <TestCase title="Task without Timer Button">
            <BindCard
              title="Evening reflection and journaling"
              estimatedTime="15 min"
              completed={bind3Completed}
              hasProof={bind3Completed}
              onToggle={setBind3Completed}
              onPress={() => Alert.alert('Bind Details', 'Navigate to bind detail screen')}
            />
          </TestCase>

          {/* Disabled BindCard */}
          <TestCase title="Disabled State">
            <BindCard
              title="Future scheduled task"
              description="Locked until previous tasks are completed"
              estimatedTime="60 min"
              completed={false}
              hasProof={false}
              onToggle={() => {}}
              disabled={true}
            />
          </TestCase>
        </TestSection>

        {/* ================================================================ */}
        {/* CAPTURE CARD COMPONENT TESTING */}
        {/* ================================================================ */}

        <TestSection title="3. CaptureCard Component" componentCount={1}>
          <Caption color="muted" style={{ marginBottom: spacing[3] }}>
            Proof capture display for notes, photos, timers, and audio
          </Caption>

          {/* Note Capture */}
          <TestCase title="Note Capture">
            <CaptureCard
              type="note"
              timestamp="2 hours ago"
              noteText="Felt amazing after the workout! Energy levels are through the roof and I'm ready to tackle the day. This consistency is really paying off and I can feel myself getting stronger every session."
              onDelete={() => Alert.alert('Delete', 'Remove this note capture?')}
              onPress={() => Alert.alert('View Note', 'Open full note view')}
            />
          </TestCase>

          {/* Timer Capture */}
          <TestCase title="Timer Capture">
            <CaptureCard
              type="timer"
              timestamp="3 hours ago"
              timerDuration="00:45:32"
              onDelete={() => Alert.alert('Delete', 'Remove this timer capture?')}
            />
          </TestCase>

          {/* Audio Capture */}
          <TestCase title="Audio Capture">
            <CaptureCard
              type="audio"
              timestamp="5 hours ago"
              audioDuration="02:15"
              onDelete={() => Alert.alert('Delete', 'Remove this audio capture?')}
              onPress={() => Alert.alert('Play Audio', 'Play audio recording')}
            />
          </TestCase>

          {/* Photo Capture - Placeholder */}
          <TestCase title="Photo Capture (Placeholder)">
            <CaptureCard
              type="photo"
              timestamp="1 day ago"
              imageUri="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop"
              onDelete={() => Alert.alert('Delete', 'Remove this photo capture?')}
              onPress={() => Alert.alert('View Photo', 'Open full photo view')}
            />
          </TestCase>
        </TestSection>

        {/* Approval Actions */}
        <Card padding="spacious">
          <Body color="primary" weight="medium" style={{ marginBottom: spacing[3] }}>
            Testing Complete?
          </Body>
          <Caption color="muted" style={{ marginBottom: spacing[4] }}>
            Once you've tested all components and documented any issues, you can approve or request changes.
          </Caption>
          <View style={{ gap: spacing[2] }}>
            <PrimaryButton
              onPress={() =>
                Alert.alert(
                  'Approve Batch',
                  'Mark Avatar, BindCard, and CaptureCard as approved?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Approve',
                      onPress: () => Alert.alert('Approved! ✅', 'Update docs/dev/component-testing-status.md'),
                    },
                  ]
                )
              }
            >
              ✓ Approve All (Batch 1)
            </PrimaryButton>
            <SecondaryButton
              onPress={() => Alert.alert('Request Changes', 'Document issues in component-testing-status.md')}
            >
              ⚠ Request Changes
            </SecondaryButton>
          </View>
        </Card>

        {/* Bottom spacer */}
        <View style={{ height: spacing[12] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function TestSection({
  title,
  componentCount,
  children,
}: {
  title: string;
  componentCount: number;
  children: React.ReactNode;
}) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] }}>
        <Title color="primary">{title}</Title>
        <View
          style={{
            marginLeft: spacing[2],
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[0.5],
            backgroundColor: colors.accent[900],
            borderRadius: radius.full,
          }}
        >
          <Text variant="labelXs" customColor={colors.accent[300]} weight="medium">
            {componentCount} variant{componentCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <View style={{ gap: spacing[5] }}>{children}</View>
    </View>
  );
}

function TestCase({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View>
      <Body color="secondary" weight="medium" style={{ marginBottom: spacing[2] }}>
        {title}
      </Body>
      <Card padding="spacious">{children}</Card>
    </View>
  );
}
