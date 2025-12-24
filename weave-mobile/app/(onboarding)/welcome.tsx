import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { trackOnboardingStarted } from '@/services/analytics';

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
   * Handles the "View Design System" button press (currently unused - dev tool)
   *
   * Navigates to the design system showcase screen for previewing components
   */
  const _handleViewDesignSystem = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/design-system-showcase');
  };

  /**
   * Handles the "Component Testing" button press
   *
   * Navigates to the component testing screen for validating individual components
   */
  const handleComponentTesting = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/component-testing');
  };

  /**
   * Handles the "Voice Demo" button press
   *
   * Navigates to the voice demo screen for testing STT functionality
   */
  const handleVoiceDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/voice-demo');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View
        className="flex-1 justify-center items-center px-4"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}
      >
        {/* Weave Logo - AC1 */}
        <Image
          source={require('../../assets/icon.png')}
          className="w-16 h-16 mb-8"
          accessibilityLabel="Weave"
          resizeMode="contain"
          style={{ width: 64, height: 64, marginBottom: 32 }}
        />

        {/* Tagline - AC1 */}
        <Text
          className="text-2xl font-semibold text-center text-neutral-800 mb-4"
          style={{
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            color: '#000000',
            marginBottom: 16,
          }}
        >
          Weave
        </RNText>

        {/* Value Proposition - AC1 */}
        <Text
          className="text-base text-center text-neutral-600 px-8 mb-12 leading-6"
          style={{
            fontSize: 16,
            textAlign: 'center',
            color: '#000000',
            paddingHorizontal: 32,
            marginBottom: 48,
            lineHeight: 24,
          }}
        >
          See your transformation as you create it
        </RNText>

        {/* CTA Button - AC1, AC3, AC5 */}
        <Pressable
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessible={true}
          style={{
            backgroundColor: '#3b72f6',
            height: 44,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            className="text-white text-sm font-medium tracking-wider"
            style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', letterSpacing: 1 }}
          >
            Get Started
          </RNText>
        </Pressable>

        {/* Design System Preview Button - TEMPORARILY DISABLED (showcase has undefined components) */}
        {/* <Pressable
          className={({ pressed }) =>
            `bg-neutral-200 h-11 rounded-lg w-full justify-center items-center ${
              pressed ? 'bg-neutral-300 scale-[0.98]' : ''
            }`
          }
          onPress={handleViewDesignSystem}
          accessibilityRole="button"
          accessible={true}
          style={{ backgroundColor: '#e5e5e5', height: 44, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}
        >
          <Text
            className="text-neutral-800 text-sm font-medium tracking-wider"
            style={{ color: '#262626', fontSize: 14, fontWeight: '500', letterSpacing: 1 }}
          >
            🎨 View Design System
          </RNText>
        </Pressable>

        {/* Voice Demo Button - Dev Testing Tool (Story 0.11) */}
        <Pressable
          className={({ pressed }) =>
            `bg-purple-500 h-11 rounded-lg w-full justify-center items-center ${
              pressed ? 'bg-purple-600 scale-[0.98]' : ''
            }`
          }
          onPress={handleVoiceDemo}
          accessibilityRole="button"
          accessible={true}
          style={{
            backgroundColor: '#a855f7',
            height: 44,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            className="text-white text-sm font-medium tracking-wider"
            style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', letterSpacing: 1 }}
          >
            🎤 Voice Demo (Story 0.11)
          </RNText>
        </Pressable>

        {/* Skip to Main App Button - Dev Testing Tool (Story 4.1) 
        <Pressable
          className={({ pressed }) =>
            `bg-green-600 h-11 rounded-lg w-full justify-center items-center ${
              pressed ? 'bg-green-700 scale-[0.98]' : ''
            }`
          }
          onPress={handleSkipToMainApp}
          accessibilityRole="button"
          accessible={true}
          style={{
            backgroundColor: '#10b981',
            height: 44,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            className="text-white text-sm font-medium tracking-wider"
            style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', letterSpacing: 1 }}
          >
            Skip to Main App (Dev)
          </RNText>
        </Pressable> */}

        {/* Component Testing Button - Dev Tool */}
        <Pressable
          onPress={handleComponentTesting}
          accessibilityRole="button"
          accessible={true}
          style={{
            backgroundColor: '#7c3aed',
            height: 44,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            className="text-white text-sm font-medium tracking-wider"
            style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', letterSpacing: 1 }}
          >
            🧪 Component Testing
          </RNText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
