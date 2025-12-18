import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
 * - Uses StyleSheet for styling (NativeWind migration deferred)
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
   * Triggers haptic feedback and navigates to the next onboarding screen.
   * Route target will be implemented in Story 1.2.
   */
  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/emotional-state');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Weave Logo - AC1 */}
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          accessibilityLabel="Weave"
          resizeMode="contain"
        />

        {/* Tagline - AC1 */}
        <Text style={styles.heading}>Weave</Text>

        {/* Value Proposition - AC1 */}
        <Text style={styles.valueProposition}>See your transformation as you create it</Text>

        {/* CTA Button - AC1, AC3, AC5 */}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessible={true}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#262626',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  valueProposition: {
    fontSize: 16,
    textAlign: 'center',
    color: '#525252',
    paddingHorizontal: 32,
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3B72F6',
    height: 44,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  buttonPressed: {
    backgroundColor: '#2858E8',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
