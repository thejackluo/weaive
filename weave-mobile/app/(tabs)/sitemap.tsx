import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Sitemap / Navigation Test Screen
 *
 * Complete navigation map for testing all screens
 * Includes Story 6.2 additions (Personality, AI Chat, etc.)
 */
export default function SitemapScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <View className="p-4">
        {/* Header */}
        <Text variant="displayLg" className="text-white mb-2 font-bold">
          Navigation Sitemap
        </Text>
        <Text variant="textBase" className="text-white/60 mb-6">
          35+ screens • 3 main tabs • Color-coded by epic
        </Text>

        {/* Main Tabs */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            Main Tabs
          </Text>
          <Link href="/(tabs)" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              🏠 Home (Thread)
            </Button>
          </Link>
          <Link href="/(tabs)/dashboard" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              📊 Dashboard
            </Button>
          </Link>
          <Link href="/(tabs)/ai-chat" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              💬 AI Chat (Story 6.2)
            </Button>
          </Link>
        </View>

        {/* Goals Screens - Blue */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            🎯 Goals (Epic 2)
          </Text>
          <Link href="/(tabs)/goals" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Goals List
            </Button>
          </Link>
          <Link href="/(tabs)/goals/example-goal-1" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Goal Detail
            </Button>
          </Link>
          <Link href="/(tabs)/goals/new" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Create Goal
            </Button>
          </Link>
          <Link href="/(tabs)/goals/edit/example-goal-1" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Edit Goal
            </Button>
          </Link>
        </View>

        {/* Binds Screens - Green */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            ✅ Binds (Epic 3)
          </Text>
          <Link href="/(tabs)/binds/example-bind-1" asChild>
            <Button variant="success" size="md" style={styles.button}>
              Bind Detail
            </Button>
          </Link>
          <Link href="/(tabs)/binds/proof/example-bind-1" asChild>
            <Button variant="success" size="md" style={styles.button}>
              Attach Proof
            </Button>
          </Link>
        </View>

        {/* Journal Screens - Purple Gradient */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            📝 Journal (Epic 4)
          </Text>
          <Link href="/(tabs)/journal" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Daily Reflection
            </Button>
          </Link>
          <Link href="/(tabs)/journal/history" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Journal History
            </Button>
          </Link>
          <Link href="/(tabs)/journal/2025-12-20" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Past Entry Example
            </Button>
          </Link>
        </View>

        {/* Captures Screens - Light Blue */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            📸 Captures (Epic 3)
          </Text>
          <Link href="/(tabs)/captures" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Capture Gallery
            </Button>
          </Link>
          <Link href="/(tabs)/captures/example-capture-1" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Capture Detail
            </Button>
          </Link>
        </View>

        {/* Progress Screens */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            📈 Progress (Epic 5)
          </Text>
          <Link href="/(tabs)/progress/2025-12-20" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Daily Progress View
            </Button>
          </Link>
        </View>

        {/* Settings Screens - Story 6.2 Additions */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            ⚙️ Settings
          </Text>
          <Link href="/(tabs)/settings" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Settings Home
            </Button>
          </Link>
          <Link href="/(tabs)/settings/personality" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              🤖 AI Personality (Story 6.2) ✨ NEW
            </Button>
          </Link>
          <Link href="/(tabs)/settings/reflection" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              📝 Reflection Preferences
            </Button>
          </Link>
          <Link href="/(tabs)/settings/identity" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              🧬 Edit Identity
            </Button>
          </Link>
          <Link href="/(tabs)/settings/subscription" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              💳 Subscription
            </Button>
          </Link>
          <Link href="/(tabs)/settings/dev-tools" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              🛠️ Dev Tools
            </Button>
          </Link>
        </View>

        {/* Onboarding Screens (for testing) */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            🌟 Onboarding (Epic 1)
          </Text>
          <Link href="/(onboarding)" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Welcome Screen
            </Button>
          </Link>
          <Link href="/(onboarding)/origin-story" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Origin Story
            </Button>
          </Link>
          <Link href="/(onboarding)/weave-solution" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Weave Solution
            </Button>
          </Link>
          <Link href="/(onboarding)/emotional-state" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Emotional State
            </Button>
          </Link>
          <Link href="/(onboarding)/identity-bootup" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Identity Bootup
            </Button>
          </Link>
          <Link href="/(onboarding)/identity-traits" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Identity Traits
            </Button>
          </Link>
          <Link href="/(onboarding)/first-needle" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              First Needle (Goal)
            </Button>
          </Link>
          <Link href="/(onboarding)/weave-path-generation" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Weave Path Generation
            </Button>
          </Link>
        </View>

        {/* Auth Screens (for testing) */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            🔐 Authentication (Epic 0)
          </Text>
          <Link href="/(auth)/login" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Login Screen
            </Button>
          </Link>
          <Link href="/(auth)/signup" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Signup Screen
            </Button>
          </Link>
        </View>

        {/* Developer Screens */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            🧪 Developer Tools
          </Text>
          <Link href="/(tabs)/design-system-showcase" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Design System Showcase
            </Button>
          </Link>
          <Link href="/(tabs)/voice-demo" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Voice Demo
            </Button>
          </Link>
        </View>

        {/* Footer Stats */}
        <View className="pt-4 pb-8 border-t border-white/10">
          <Text variant="textSm" className="text-white/40 text-center">
            35+ total screens • 3 main tabs • 7 epic groups
            {'\n'}✨ Story 6.2: Personality + AI Chat added
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginBottom: 16,
  },
});
