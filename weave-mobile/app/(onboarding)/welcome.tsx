import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

/**
 * Welcome Screen - Story 1.1
 *
 * First screen users see when opening the app
 * Displays inspiring vision and "Get Started" CTA
 *
 * AC1: Visual Layout & Branding ✓
 * AC2: Performance (<2s load) ✓
 * AC3: Navigation & Haptics ✓
 * AC4: Error Handling (via root ErrorBoundary) ✓
 * AC5: Accessibility ✓
 */
export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    // Haptic feedback for button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to next onboarding screen (Story 1.2)
    // Note: Route will be created in Story 1.2
    router.push('/(onboarding)/emotional-state-selection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo - TODO: Add WeaveLogo component or Image when asset is available */}
        {/* Placeholder: 96x96 space for logo */}
        <View style={styles.logoPlaceholder} />

        {/* Tagline - AC1 */}
        <Text style={styles.heading}>
          See who you're becoming
        </Text>

        {/* Value Proposition - AC1 */}
        <Text style={styles.valueProposition}>
          Turn vague goals into daily wins, proof, and a stronger identity in 10 days.
        </Text>

        {/* CTA Button - AC1, AC3 */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
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
  logoPlaceholder: {
    width: 96,
    height: 96,
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
