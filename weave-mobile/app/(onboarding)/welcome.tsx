import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { trackOnboardingStarted } from '@/services/analytics';
import { useTheme, Heading, Body, Button } from '@/design-system';

/**
 * Welcome Screen - Story 1.1
 *
 * First screen users see when opening the app for the first time.
 * Provides an inspiring vision of Weave and a clear call-to-action.
 *
 * Acceptance Criteria:
 * - AC1: Visual Layout & Branding (logo, tagline, value prop, CTA button)
 * - AC2: Performance (<2s load, no network calls)
 * - AC3: Navigation with haptic feedback to emotional state selection
 * - AC4: Error handling via Expo Router default
 * - AC5: Accessibility (screen reader support, touch targets)
 *
 * Technical Implementation:
 * - Uses NativeWind for styling (Tailwind CSS classes)
 * - Haptic feedback on button press (iOS)
 * - SafeAreaView for notch/status bar handling
 * - Expo Router for navigation
 *
 * @returns Welcome screen component
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  /**
   * Handles the "Get Started" button press
   *
   * Triggers haptic feedback, tracks analytics event, and navigates to the next onboarding screen.
   * Analytics tracking implemented in Story 1.1 (AC3 requirement).
   */
  const handleGetStarted = async () => {
    // Haptic feedback for UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Track onboarding_started event (Story 1.1 - AC3)
    await trackOnboardingStarted();

    // Navigate to emotional state selection (Story 1.2)
    router.push('/(onboarding)/emotional-state');
  };

  /**
   * Handles the "View Design System" button press
   *
   * Navigates to the design system showcase screen for previewing components
   */
  const handleViewDesignSystem = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/design-system-showcase');
  };

  /**
   * Handles the "Go to Main App" button press
   *
   * Navigates to the main app tabs (home screen)
   */
  const handleGoToMainApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  /**
   * Handles the "Voice Demo" button press
   *
   * Navigates to the voice/STT demo screen for testing Story 0.11 components
   */
  const handleVoiceDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/voice-demo');
  };

  /**
   * Handles the "Skip to Main App" button press (DEV TESTING ONLY)
   *
   * Bypasses onboarding and goes directly to the main app tabs
   * Useful for testing Story 4.1 reflection screen without completing onboarding
   */
  const handleSkipToMainApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing[6],
        }}
      >
        {/* Weave Logo */}
        <Image
          source={require('../../assets/icon.png')}
          accessibilityLabel="Weave"
          resizeMode="contain"
          style={{ width: 80, height: 80, marginBottom: spacing[8] }}
        />

        {/* Tagline */}
        <Heading
          variant="display2xl"
          style={{
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[4],
          }}
        >
          Weave
        </Heading>

        {/* Value Proposition */}
        <Body
          style={{
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing[12],
            maxWidth: 320,
          }}
        >
          See your transformation as you create it
        </Body>

        {/* CTA Button */}
        <Button variant="primary" onPress={handleGetStarted} style={{ width: '100%' }}>
          Get Started
        </Button>

        {/* Dev Preview Buttons */}
        <View style={{ width: '100%', gap: spacing[2], marginTop: spacing[3] }}>
          <Button variant="secondary" onPress={handleGoToMainApp}>
            Go to Main App
          </Button>

          <Button variant="ghost" onPress={handleViewDesignSystem}>
            🎨 View Design System
          </Button>

          <Button variant="ghost" onPress={handleVoiceDemo}>
            🎤 Voice Demo
          </Button>

          <Button variant="ghost" onPress={handleSkipToMainApp}>
            Skip to Main App (Dev)
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
