/**
 * Weave Design System Showcase
 *
 * Comprehensive, beautiful interactive preview
 * Tabbed navigation for easy exploration
 * Proper dark-first theme application
 */

import React, { useState } from 'react';
import { ScrollView, View, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  // Theme
  useTheme,

  // All Components
  Text,
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
  BindCheckbox,
  Badge,
  CountBadge,
  ConsistencyBadge,
  StreakBadge,
  AIBadge,
  StatusDot,
  BindCard,
  CaptureCard,
  ProgressBar,
  CircularProgress,
  ConsistencyHeatmap,
  BottomTabBar,
  HeaderBar,
  BackButton,
  Modal,
  BottomSheet,
  Toast,
  Timer,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonListItem,
  SkeletonBindCard,
  SkeletonStatCard,
  SkeletonProgressCard,
  EmptyState,
  EmptyGoals,
  EmptyBinds,
  EmptyCaptures,
  EmptyJournal,
  EmptySearch,
  EmptyNotifications,
  ErrorState,
  NoConnectionState,
  ComingSoonState,
  Avatar,
  AvatarGroup,
  AvatarWithName,
  StatCard,
  StatCardGrid,
  MiniStatCard,
  ProgressStatCard,
} from './index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabId = 'foundations' | 'inputs' | 'cards' | 'progress' | 'navigation' | 'overlays' | 'specialized' | 'utilities' | 'feedback';

export function DesignSystemShowcase() {
  const { colors, spacing, radius } = useTheme();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('foundations');

  // Component states
  const [checkboxState, setCheckboxState] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [needleExpanded, setNeedleExpanded] = useState(false);
  const [bindCompleted, setBindCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Tab definitions
  const tabs = [
    { id: 'foundations' as TabId, label: 'Foundations' },
    { id: 'inputs' as TabId, label: 'Inputs & Forms' },
    { id: 'cards' as TabId, label: 'Cards' },
    { id: 'progress' as TabId, label: 'Progress' },
    { id: 'navigation' as TabId, label: 'Navigation' },
    { id: 'overlays' as TabId, label: 'Overlays' },
    { id: 'specialized' as TabId, label: 'Weave Special' },
    { id: 'utilities' as TabId, label: 'Utilities' },
    { id: 'feedback' as TabId, label: 'Feedback & States' },
  ];

  // Generate sample consistency data
  const consistencyData = Array.from({ length: 56 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (55 - i));
    return {
      date: date.toISOString().split('T')[0],
      percentage: Math.random() * 100,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.accent[900], colors.violet[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: spacing[5],
          paddingHorizontal: spacing[4],
        }}
      >
        <Heading customColor={colors.dark[50]}>Weave Design System</Heading>
        <Caption customColor={colors.dark[200]}>
          Production-ready components • Dark-first • Glassmorphism
        </Caption>
      </LinearGradient>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.subtle,
        }}
        contentContainerStyle={{
          paddingHorizontal: spacing[2],
          gap: spacing[2],
        }}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onPress={() => setActiveTab(tab.id)}
          />
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing[4] }}
      >
        {activeTab === 'foundations' && (
          <FoundationsTab colors={colors} spacing={spacing} />
        )}

        {activeTab === 'inputs' && (
          <InputsTab
            colors={colors}
            spacing={spacing}
            checkboxState={checkboxState}
            setCheckboxState={setCheckboxState}
            inputValue={inputValue}
            setInputValue={setInputValue}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            textAreaValue={textAreaValue}
            setTextAreaValue={setTextAreaValue}
          />
        )}

        {activeTab === 'cards' && (
          <CardsTab
            colors={colors}
            spacing={spacing}
            needleExpanded={needleExpanded}
            setNeedleExpanded={setNeedleExpanded}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            colors={colors}
            spacing={spacing}
            consistencyData={consistencyData}
          />
        )}

        {activeTab === 'navigation' && (
          <NavigationTab colors={colors} spacing={spacing} />
        )}

        {activeTab === 'overlays' && (
          <OverlaysTab
            colors={colors}
            spacing={spacing}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            sheetVisible={sheetVisible}
            setSheetVisible={setSheetVisible}
            toastVisible={toastVisible}
            setToastVisible={setToastVisible}
          />
        )}

        {activeTab === 'specialized' && (
          <SpecializedTab
            colors={colors}
            spacing={spacing}
            bindCompleted={bindCompleted}
            setBindCompleted={setBindCompleted}
          />
        )}

        {activeTab === 'utilities' && (
          <UtilitiesTab colors={colors} spacing={spacing} radius={radius} />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab colors={colors} spacing={spacing} radius={radius} />
        )}

        <View style={{ height: spacing[12] }} />
      </ScrollView>
    </View>
  );
}

// =============================================================================
// TAB BUTTON
// =============================================================================

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Button
      onPress={onPress}
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      style={{
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: radius.lg,
      }}
    >
      {label}
    </Button>
  );
}

// =============================================================================
// FOUNDATIONS TAB
// =============================================================================

function FoundationsTab({ colors, spacing }: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      {/* Colors with Gradients */}
      <Section title="Color Palette">
        <GlassCard padding="spacious">
          <Body color="secondary">Brand Colors</Body>
          <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3], flexWrap: 'wrap' }}>
            <ColorSwatch color={colors.accent[500]} label="Accent" gradient />
            <ColorSwatch color={colors.violet[500]} label="Violet" gradient />
            <ColorSwatch color={colors.amber[500]} label="Amber" gradient />
            <ColorSwatch color={colors.emerald[500]} label="Emerald" gradient />
            <ColorSwatch color={colors.rose[500]} label="Rose" gradient />
          </View>
        </GlassCard>
      </Section>

      {/* Typography */}
      <Section title="Typography - Display & Headings">
        <Card padding="spacious">
          <Text variant="display2xl" color="primary" weight="bold">Display 2XL - Bold</Text>
          <Text variant="displayXl" color="primary" weight="semibold">Display XL - Semibold</Text>
          <Text variant="displayLg" color="primary" weight="medium">Display Large - Medium</Text>
          <Text variant="displayMd" color="primary">Display Medium - Regular</Text>
          <View style={{ height: spacing[2] }} />
          <Heading color="primary">Heading Component</Heading>
          <Title color="primary">Title Component</Title>
          <Subtitle color="secondary">Subtitle Component</Subtitle>
        </Card>
      </Section>

      <Section title="Typography - Body Text">
        <Card padding="spacious">
          <Text variant="textLg" color="primary">Text Large - Primary</Text>
          <Text variant="textBase" color="secondary">Text Base - Secondary (default body)</Text>
          <Text variant="textSm" color="muted">Text Small - Muted (secondary info)</Text>
          <Text variant="textXs" color="muted">Text XS - Captions and timestamps</Text>
          <View style={{ height: spacing[3] }} />
          <Body color="primary">Body Component - Standard paragraph text</Body>
          <BodySmall color="muted">BodySmall Component - Compact body text</BodySmall>
          <Caption color="muted">Caption Component - Small annotations</Caption>
        </Card>
      </Section>

      <Section title="Typography - Labels & Special">
        <Card padding="spacious">
          <Text variant="labelLg" color="primary" weight="semibold">Label Large - Semibold</Text>
          <Text variant="labelBase" color="primary" weight="medium">Label Base - Medium</Text>
          <Text variant="labelSm" color="secondary">Label Small - Regular</Text>
          <Text variant="labelXs" color="muted">Label XS - Tiny labels</Text>
          <View style={{ height: spacing[3] }} />
          <Label color="primary">Label Component</Label>
          <Link color="accent">Link Component - Clickable text</Link>
          <Mono color="secondary">Mono Component - Monospace for code: const x = 42;</Mono>
        </Card>
      </Section>

      <Section title="Typography - Weights & Colors">
        <Card padding="spacious">
          <View style={{ gap: spacing[2] }}>
            <Text variant="textBase" color="primary" weight="regular">Regular Weight</Text>
            <Text variant="textBase" color="primary" weight="medium">Medium Weight</Text>
            <Text variant="textBase" color="primary" weight="semibold">Semibold Weight</Text>
            <Text variant="textBase" color="primary" weight="bold">Bold Weight</Text>
            <View style={{ height: spacing[2] }} />
            <Text variant="textBase" color="primary">Primary Color</Text>
            <Text variant="textBase" color="secondary">Secondary Color</Text>
            <Text variant="textBase" color="muted">Muted Color</Text>
            <Text variant="textBase" color="accent">Accent Color</Text>
            <Text variant="textBase" color="success">Success Color</Text>
            <Text variant="textBase" color="warning">Warning Color</Text>
            <Text variant="textBase" color="error">Error Color</Text>
          </View>
        </Card>
      </Section>

      {/* Buttons */}
      <Section title="Buttons - Variants">
        <Card padding="spacious">
          <View style={{ gap: spacing[3] }}>
            <PrimaryButton onPress={() => Alert.alert('Primary')}>
              Primary Action
            </PrimaryButton>
            <SecondaryButton onPress={() => Alert.alert('Secondary')}>
              Secondary Action
            </SecondaryButton>
            <GhostButton onPress={() => Alert.alert('Ghost')}>
              Tertiary Action
            </GhostButton>
            <AIButton onPress={() => Alert.alert('AI')}>
              AI-Powered Action ✨
            </AIButton>
            <DestructiveButton onPress={() => Alert.alert('Delete')}>
              Destructive Action
            </DestructiveButton>
          </View>
        </Card>
      </Section>

      <Section title="Buttons - Sizes & States">
        <Card padding="spacious">
          <Body color="muted">Button Sizes</Body>
          <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button (default)</Button>
            <Button size="lg">Large Button</Button>
          </View>

          <View style={{ height: spacing[4] }} />
          <Body color="muted">Button States</Body>
          <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
            <Button onPress={() => Alert.alert('Enabled')}>Enabled</Button>
            <Button disabled>Disabled State</Button>
            <Button loading>Loading State</Button>
          </View>

          <View style={{ height: spacing[4] }} />
          <Body color="muted">Icon Buttons</Body>
          <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
            <IconButton
              icon={<Text variant="labelLg">×</Text>}
              variant="ghost"
              size="sm"
              onPress={() => Alert.alert('Close')}
            />
            <IconButton
              icon={<Text variant="labelLg">+</Text>}
              variant="primary"
              size="md"
              onPress={() => Alert.alert('Add')}
            />
            <IconButton
              icon={<Text variant="labelLg">✓</Text>}
              variant="secondary"
              size="lg"
              onPress={() => Alert.alert('Check')}
            />
          </View>
        </Card>
      </Section>

      {/* Badges */}
      <Section title="Badges - All Variants">
        <Card padding="spacious">
          <Body color="muted">Basic Badges</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[2] }}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="ai">AI Generated</Badge>
          </View>

          <View style={{ height: spacing[4] }} />
          <Body color="muted">Special Badges</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[2] }}>
            <ConsistencyBadge percentage={95} />
            <ConsistencyBadge percentage={75} />
            <ConsistencyBadge percentage={55} />
            <ConsistencyBadge percentage={25} />
            <StreakBadge count={28} />
            <StreakBadge count={7} />
            <CountBadge count={5} />
            <CountBadge count={99} />
            <AIBadge />
          </View>

          <View style={{ height: spacing[4] }} />
          <Body color="muted">Status Dots</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginTop: spacing[2], alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <StatusDot status="online" />
              <Text variant="textSm" color="secondary">Online</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <StatusDot status="offline" />
              <Text variant="textSm" color="secondary">Offline</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <StatusDot status="away" />
              <Text variant="textSm" color="secondary">Away</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <StatusDot status="busy" />
              <Text variant="textSm" color="secondary">Busy</Text>
            </View>
          </View>

          <View style={{ height: spacing[4] }} />
          <Body color="muted">Badge Sizes</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[2], alignItems: 'center' }}>
            <Badge size="sm" variant="primary">Small</Badge>
            <Badge size="md" variant="primary">Medium</Badge>
            <Badge size="lg" variant="primary">Large</Badge>
          </View>
        </Card>
      </Section>
    </View>
  );
}

// =============================================================================
// INPUTS TAB
// =============================================================================

function InputsTab({
  colors,
  spacing,
  checkboxState,
  setCheckboxState,
  inputValue,
  setInputValue,
  searchValue,
  setSearchValue,
  textAreaValue,
  setTextAreaValue,
}: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Text Inputs">
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
        </Card>
      </Section>

      <Section title="Search">
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          onClear={() => setSearchValue('')}
          placeholder="Search goals, binds, insights..."
        />
      </Section>

      <Section title="Text Area">
        <TextArea
          label="Daily Reflection"
          placeholder="How do you feel about today's progress?"
          value={textAreaValue}
          onChangeText={setTextAreaValue}
          lines={4}
        />
      </Section>

      <Section title="Checkboxes">
        <Card padding="spacious">
          <View style={{ gap: spacing[3] }}>
            <Body color="muted">Standard Checkbox</Body>
            <Checkbox
              checked={checkboxState}
              onChange={setCheckboxState}
              label="I agree to the terms and conditions"
            />
            <Checkbox
              checked={false}
              onChange={() => {}}
              label="Unchecked checkbox"
            />
            <Checkbox
              checked={true}
              onChange={() => {}}
              label="Checked checkbox"
              disabled
            />

            <View style={{ height: spacing[2] }} />
            <Body color="muted">Bind Checkbox (Weave Special)</Body>
            <BindCheckbox
              checked={checkboxState}
              onChange={setCheckboxState}
              label="Complete morning workout"
            />
            <BindCheckbox
              checked={true}
              onChange={() => {}}
              label="Completed task with celebration"
            />

            <View style={{ height: spacing[2] }} />
            <Body color="muted">Checkbox Sizes</Body>
            <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
              <Checkbox checked={true} onChange={() => {}} size="sm" label="Small" />
              <Checkbox checked={true} onChange={() => {}} size="md" label="Medium" />
              <Checkbox checked={true} onChange={() => {}} size="lg" label="Large" />
            </View>
          </View>
        </Card>
      </Section>
    </View>
  );
}

// =============================================================================
// CARDS TAB
// =============================================================================

function CardsTab({ colors, spacing, needleExpanded, setNeedleExpanded }: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Card Variants">
        <View style={{ gap: spacing[4] }}>
          <Card>
            <Body color="primary">Default Card</Body>
            <Caption color="muted">Standard card with border</Caption>
          </Card>

          <GlassCard>
            <Body color="primary">Glass Card ✨</Body>
            <Caption color="muted">Opal-inspired glass effect</Caption>
          </GlassCard>

          <ElevatedCard>
            <Body color="primary">Elevated Card</Body>
            <Caption color="muted">With shadow elevation</Caption>
          </ElevatedCard>

          <AICard>
            <Body color="primary">AI Card 🤖</Body>
            <Caption color="muted">Violet-themed for AI</Caption>
          </AICard>

          <SuccessCard>
            <Body color="primary">Success Card ✓</Body>
            <Caption color="muted">Emerald-themed</Caption>
          </SuccessCard>
        </View>
      </Section>

      <Section title="Needle Card (Goal)">
        <NeedleCard
          title="Get Fit & Strong"
          consistency={75}
          bindsCount={3}
          expanded={needleExpanded}
          onPress={() => setNeedleExpanded(!needleExpanded)}
        >
          <Body color="secondary">
            Expanded content: Your 3 active binds, progress chart, quick actions.
          </Body>
        </NeedleCard>
      </Section>

      <Section title="Insight Cards">
        <View style={{ gap: spacing[4] }}>
          <InsightCard
            type="winning"
            title="You're crushing it! 🎉"
            content="8 consecutive days on morning routine. Your identity as an early riser is solidifying."
            onEdit={() => Alert.alert('Edit')}
            onDismiss={() => Alert.alert('Dismiss')}
          />

          <InsightCard
            type="consider"
            title="Consider this 🤔"
            content="Evening reflection skipped for 3 days. This might affect tomorrow's clarity."
            onEdit={() => Alert.alert('Edit')}
          />

          <InsightCard
            type="tomorrow"
            title="Tomorrow's Focus 📋"
            content="Prioritize gym + client work. These align with your dream self."
          />
        </View>
      </Section>
    </View>
  );
}

// =============================================================================
// PROGRESS TAB
// =============================================================================

function ProgressTab({ colors, spacing, consistencyData }: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Progress Bars">
        <Card padding="spacious">
          <View style={{ gap: spacing[4] }}>
            <ProgressBar value={75} showLabel />
            <ProgressBar value={50} color="warning" showLabel />
            <ProgressBar value={25} color="error" showLabel />
          </View>
        </Card>
      </Section>

      <Section title="Circular Progress">
        <Card padding="spacious">
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: spacing[4] }}>
            <CircularProgress value={85} size={100} strokeWidth={10} color="success" />
            <CircularProgress value={60} size={100} strokeWidth={10} color="accent" />
            <CircularProgress value={30} size={100} strokeWidth={10} color="error" />
          </View>
        </Card>
      </Section>

      <Section title="Consistency Heatmap">
        <Card padding="spacious">
          <ConsistencyHeatmap
            data={consistencyData}
            weeks={8}
            onDayPress={(date, pct) => Alert.alert('Day', `${date}: ${Math.round(pct)}%`)}
            showMonthLabels
            showDayLabels
          />
        </Card>
      </Section>
    </View>
  );
}

// =============================================================================
// NAVIGATION TAB
// =============================================================================

function NavigationTab({ colors, spacing }: any) {
  const [activeNavTab, setActiveNavTab] = useState('home');

  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Header Bar">
        <HeaderBar
          title="Goal Details"
          subtitle="Track your progress"
          leftAction={<BackButton onPress={() => Alert.alert('Back')} />}
          rightActions={[
            <IconButton
              icon={<Text>⚙️</Text>}
              onPress={() => Alert.alert('Settings')}
              accessibilityLabel="Settings"
              variant="ghost"
            />,
          ]}
        />
      </Section>

      <Section title="Bottom Tab Bar">
        <BottomTabBar
          tabs={[
            { id: 'home', icon: <Text>🏠</Text>, label: 'Home' },
            { id: 'binds', icon: <Text>📋</Text>, label: 'Binds', badge: 3 },
            { id: 'journal', icon: <Text>📖</Text>, label: 'Journal' },
            { id: 'progress', icon: <Text>📈</Text>, label: 'Progress' },
            { id: 'profile', icon: <Text>👤</Text>, label: 'Profile' },
          ]}
          activeTab={activeNavTab}
          onTabPress={setActiveNavTab}
        />
      </Section>

      <Section title="Back Button">
        <Card padding="spacious">
          <BackButton onPress={() => Alert.alert('Back')} label="Go Back" />
        </Card>
      </Section>
    </View>
  );
}

// =============================================================================
// OVERLAYS TAB
// =============================================================================

function OverlaysTab({
  colors,
  spacing,
  modalVisible,
  setModalVisible,
  sheetVisible,
  setSheetVisible,
  toastVisible,
  setToastVisible,
}: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Modal">
        <Card padding="spacious">
          <Button onPress={() => setModalVisible(true)}>
            Open Modal
          </Button>
        </Card>

        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Create New Goal"
          subtitle="Set up your first needle"
        >
          <Body color="secondary">
            Modal content goes here. Forms, confirmations, or detailed views.
          </Body>
          <View style={{ height: spacing[4] }} />
          <PrimaryButton onPress={() => setModalVisible(false)}>
            Save Goal
          </PrimaryButton>
        </Modal>
      </Section>

      <Section title="Bottom Sheet">
        <Card padding="spacious">
          <Button onPress={() => setSheetVisible(true)}>
            Open Bottom Sheet
          </Button>
        </Card>

        <BottomSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          title="Filter Options"
          showDragHandle
        >
          <Body color="secondary">
            Sheet content: filters, options, quick actions.
          </Body>
        </BottomSheet>
      </Section>

      <Section title="Toast Notifications - All Types">
        <Card padding="spacious">
          <View style={{ gap: spacing[3] }}>
            <Button
              variant="primary"
              onPress={() => {
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 3000);
              }}
            >
              Show Success Toast
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                Alert.alert('Info Toast', 'Info toast would appear here');
              }}
            >
              Show Info Toast
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                Alert.alert('Warning Toast', 'Warning toast would appear here');
              }}
            >
              Show Warning Toast
            </Button>
            <DestructiveButton
              onPress={() => {
                Alert.alert('Error Toast', 'Error toast would appear here');
              }}
            >
              Show Error Toast
            </DestructiveButton>
          </View>
          <View style={{ marginTop: spacing[3] }}>
            <Body color="muted">Note: Toasts auto-dismiss after 3 seconds</Body>
          </View>
        </Card>

        <Toast
          visible={toastVisible}
          type="success"
          title="Goal Saved!"
          message="Your changes were saved successfully."
          position="top"
          onDismiss={() => setToastVisible(false)}
        />
      </Section>
    </View>
  );
}

// =============================================================================
// SPECIALIZED TAB
// =============================================================================

function SpecializedTab({ colors, spacing, bindCompleted, setBindCompleted }: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Bind Card">
        <BindCard
          title="Morning workout session"
          description="30 min cardio + strength training"
          estimatedTime="45 min"
          completed={bindCompleted}
          hasProof={bindCompleted}
          onToggle={setBindCompleted}
          onPress={() => Alert.alert('View Details')}
          onTimer={() => Alert.alert('Start Timer')}
        />
      </Section>

      <Section title="Capture Cards">
        <View style={{ gap: spacing[4] }}>
          <CaptureCard
            type="note"
            timestamp="2 hours ago"
            noteText="Felt amazing after the workout. Energy levels are through the roof! This consistency is really paying off."
            onDelete={() => Alert.alert('Delete')}
            onPress={() => Alert.alert('View Note')}
          />

          <CaptureCard
            type="timer"
            timestamp="3 hours ago"
            timerDuration="00:45:32"
            onDelete={() => Alert.alert('Delete')}
          />

          <CaptureCard
            type="audio"
            timestamp="5 hours ago"
            audioDuration="02:15"
            onDelete={() => Alert.alert('Delete')}
          />
        </View>
      </Section>
    </View>
  );
}

// =============================================================================
// UTILITIES TAB
// =============================================================================

function UtilitiesTab({ colors, spacing, radius }: any) {
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes

  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Timer">
        <Timer
          duration={timerDuration}
          size="md"
          onComplete={(elapsed) => Alert.alert('Timer Complete!', `${elapsed}s`)}
          onStop={(elapsed) => Alert.alert('Timer Stopped', `${elapsed}s elapsed`)}
        />
      </Section>

      <Section title="Avatar">
        <View style={{ gap: spacing[4] }}>
          <View style={{ flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' }}>
            <Avatar
              initials="JD"
              size="xs"
              gradientColors={[colors.accent[600], colors.violet[600]]}
            />
            <Avatar
              initials="SM"
              size="sm"
              status="online"
              gradientColors={[colors.violet[600], colors.purple[600]]}
            />
            <Avatar
              initials="AB"
              size="md"
              status="away"
              gradientColors={[colors.purple[600], colors.rose[600]]}
            />
            <Avatar
              initials="KC"
              size="lg"
              status="busy"
              gradientColors={[colors.rose[600], colors.accent[600]]}
            />
            <Avatar
              initials="ML"
              size="xl"
              status="offline"
              gradientColors={[colors.cyan[500], colors.teal[500]]}
            />
          </View>

          <AvatarGroup
            avatars={[
              { initials: 'JD', gradientColors: [colors.accent[600], colors.violet[600]] },
              { initials: 'SM', gradientColors: [colors.violet[600], colors.purple[600]] },
              { initials: 'AB', gradientColors: [colors.purple[600], colors.rose[600]] },
              { initials: 'KC', gradientColors: [colors.rose[600], colors.accent[600]] },
              { initials: 'ML', gradientColors: [colors.cyan[500], colors.teal[500]] },
              { initials: 'TW', gradientColors: [colors.amber[500], colors.orange[500]] },
            ]}
            max={4}
            size="md"
          />

          <AvatarWithName
            initials="JD"
            name="John Doe"
            subtitle="@johndoe"
            size="lg"
            status="online"
            gradientColors={[colors.accent[600], colors.violet[600]]}
            direction="horizontal"
          />
        </View>
      </Section>

      <Section title="Skeleton Loaders - All Variants">
        <View style={{ gap: spacing[4] }}>
          <Body color="muted">Base Skeleton</Body>
          <Skeleton width="100%" height={20} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={12} />

          <View style={{ height: spacing[2] }} />
          <Body color="muted">Skeleton Text (Multi-line)</Body>
          <SkeletonText lines={3} lineHeight={18} gap={10} lastLineWidth={65} />

          <View style={{ height: spacing[2] }} />
          <Body color="muted">Skeleton Avatars</Body>
          <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
            <SkeletonAvatar size="sm" shape="circle" />
            <SkeletonAvatar size="md" shape="circle" />
            <SkeletonAvatar size="lg" shape="circle" />
            <SkeletonAvatar size="md" shape="square" />
          </View>

          <View style={{ height: spacing[2] }} />
          <Body color="muted">Skeleton Card</Body>
          <SkeletonCard height={180} showAvatar textLines={2} />

          <View style={{ height: spacing[2] }} />
          <Body color="muted">Skeleton List Items</Body>
          <SkeletonListItem showLeading showTrailing textLines={2} />
          <SkeletonListItem showLeading={false} textLines={1} />

          <View style={{ height: spacing[2] }} />
          <Body color="muted">Weave-Specific Skeletons</Body>
          <SkeletonBindCard />
          <SkeletonStatCard />
          <SkeletonProgressCard />
        </View>
      </Section>
    </View>
  );
}

// =============================================================================
// FEEDBACK TAB
// =============================================================================

function FeedbackTab({ colors, spacing, radius }: any) {
  return (
    <View style={{ gap: spacing[6] }}>
      <Section title="Stat Cards - Individual">
        <View style={{ gap: spacing[4] }}>
          <StatCard
            label="Active Goals"
            value="3"
            icon="🎯"
            trend={{ value: 12, direction: 'up', label: 'from last week' }}
            gradientColors={[colors.accent[600], colors.violet[600]]}
            size="lg"
          />

          <StatCard
            label="Consistency Score"
            value="87%"
            icon="⚡"
            trend={{ value: 5, direction: 'down' }}
            gradientColors={[colors.emerald[600], colors.teal[600]]}
            size="md"
          />

          <StatCard
            label="Total Time"
            value="24h"
            icon="⏱️"
            trend={{ value: 0, direction: 'neutral' }}
            gradientColors={[colors.amber[600], colors.orange[600]]}
            size="sm"
          />
        </View>
      </Section>

      <Section title="Stat Cards - Grid Layout">
        <StatCardGrid
          stats={[
            {
              label: 'Goals',
              value: '3',
              icon: '🎯',
              trend: { value: 12, direction: 'up' },
              gradientColors: [colors.accent[600], colors.violet[600]],
            },
            {
              label: 'Binds',
              value: '24',
              icon: '📝',
              trend: { value: 8, direction: 'up' },
              gradientColors: [colors.violet[600], colors.purple[600]],
            },
            {
              label: 'Streak',
              value: '12',
              icon: '🔥',
              trend: { value: 5, direction: 'down' },
              gradientColors: [colors.rose[600], colors.orange[600]],
            },
            {
              label: 'Level',
              value: '7',
              icon: '⭐',
              trend: { value: 1, direction: 'up' },
              gradientColors: [colors.emerald[600], colors.teal[600]],
            },
          ]}
          columns={2}
        />
      </Section>

      <Section title="Mini Stat Cards">
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <MiniStatCard
              label="Streak"
              value="12 days"
              trend={{ value: 8, direction: 'up' }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <MiniStatCard
              label="Completed"
              value="45"
              trend={{ value: 15, direction: 'up' }}
            />
          </View>
        </View>
      </Section>

      <Section title="Progress Stat Card">
        <ProgressStatCard
          label="Weekly Progress"
          value={5}
          max={7}
          icon="📅"
          gradientColors={[colors.violet[600], colors.purple[600]]}
        />
      </Section>

      <Section title="Empty States - Weave Specific">
        <View style={{ gap: spacing[8] }}>
          <EmptyGoals onCreateGoal={() => Alert.alert('Create Goal')} />
          <EmptyBinds onCreateBind={() => Alert.alert('Create Bind')} />
          <EmptyCaptures onCapture={() => Alert.alert('Capture Proof')} />
          <EmptyJournal onCreateEntry={() => Alert.alert('Journal')} />
        </View>
      </Section>

      <Section title="Empty States - Generic">
        <View style={{ gap: spacing[8] }}>
          <EmptySearch query="quantum physics" onClear={() => Alert.alert('Clear')} />
          <EmptyNotifications />
          <EmptyState
            icon="🎨"
            title="Custom Empty State"
            message="You can create custom empty states with any icon, title, and message"
            action={{
              label: 'Take Action',
              onPress: () => Alert.alert('Action'),
              variant: 'primary',
            }}
            gradientColors={[colors.violet[600], colors.purple[600]]}
          />
        </View>
      </Section>

      <Section title="Error & Connection States">
        <View style={{ gap: spacing[8] }}>
          <ErrorState
            title="Failed to load"
            message="Something went wrong while loading your data."
            onRetry={() => Alert.alert('Retry')}
            onGoBack={() => Alert.alert('Go Back')}
          />
          <NoConnectionState onRetry={() => Alert.alert('Retry Connection')} />
          <ComingSoonState
            title="AI Insights"
            message="Get personalized insights powered by advanced AI. Coming in the next update!"
            onNotify={() => Alert.alert('Notify Me')}
          />
        </View>
      </Section>
    </View>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View>
      <Title color="primary" style={{ marginBottom: spacing[3] }}>{title}</Title>
      {children}
    </View>
  );
}

function ColorSwatch({ color, label, gradient = false }: { color: string; label: string; gradient?: boolean }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ alignItems: 'center', minWidth: 80 }}>
      {gradient ? (
        <LinearGradient
          colors={[color, colors.dark[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.lg,
            marginBottom: spacing[2],
          }}
        />
      ) : (
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: color,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border.subtle,
            marginBottom: spacing[2],
          }}
        />
      )}
      <Caption color="muted" align="center">{label}</Caption>
    </View>
  );
}

export default DesignSystemShowcase;
