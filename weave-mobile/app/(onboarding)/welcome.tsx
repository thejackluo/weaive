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
  const handleGetStarted = () => {
    // Haptic feedback for UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Track onboarding_started event (Story 1.1 - AC3) - fire and forget for instant navigation
    trackOnboardingStarted();

    // Navigate immediately to authentication screen
    router.push('/(onboarding)/authentication');
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
        {/* Weave Screenshot */}
        <Image
          source={require('../../assets/images/welcome-screenshot.png')}
          accessibilityLabel="Weave"
          resizeMode="contain"
          style={{ width: 340, height: 340, marginBottom: spacing[8] }}
        />

        {/* CTA Button */}
        <Button variant="primary" onPress={handleGetStarted} style={{ width: '85%' }}>
          Begin my transformation
        </Button>
      </View>
    </SafeAreaView>
  );
}
