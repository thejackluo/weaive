import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Sitemap / Navigation Test Screen
 *
 * Complete navigation map for Epic 1.5 testing
 * Clean, minimal design with color-coded sections
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
          20 screens • 2 main tabs • Color-coded by epic
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
          <Text variant="textSm" className="text-white/40 mt-2">
            ✨ AI Chat accessible via center button
          </Text>
        </View>

        {/* Goals Screens - Blue */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            🎯 Goals
          </Text>
          <Link href="/goals" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Goals List
            </Button>
          </Link>
          <Link href="/goals/example-goal-1" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Goal Detail
            </Button>
          </Link>
          <Link href="/goals/new" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Create Goal
            </Button>
          </Link>
          <Link href="/goals/edit/example-goal-1" asChild>
            <Button variant="primary" size="md" style={styles.button}>
              Edit Goal
            </Button>
          </Link>
        </View>

        {/* Binds Screens - Green */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            ✅ Binds
          </Text>
          <Link href="/binds/example-bind-1" asChild>
            <Button variant="success" size="md" style={styles.button}>
              Bind Detail
            </Button>
          </Link>
          <Link href="/binds/proof/example-bind-1" asChild>
            <Button variant="success" size="md" style={styles.button}>
              Attach Proof
            </Button>
          </Link>
        </View>

        {/* Journal Screens - Purple Gradient */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            📝 Journal
          </Text>
          <Link href="/journal" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Daily Reflection
            </Button>
          </Link>
          <Link href="/journal/history" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Journal History
            </Button>
          </Link>
          <Link href="/journal/2025-12-20" asChild>
            <Button variant="ai" size="md" style={styles.button}>
              Past Entry Example
            </Button>
          </Link>
        </View>

        {/* Captures Screens - Light Blue */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            📸 Captures
          </Text>
          <Link href="/captures" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Capture Gallery
            </Button>
          </Link>
          <Link href="/captures/example-capture-1" asChild>
            <Button variant="secondary" size="md" style={styles.button}>
              Capture Detail
            </Button>
          </Link>
        </View>

        {/* Settings Screens - Subtle */}
        <View style={styles.section}>
          <Text variant="textLg" style={styles.sectionTitle}>
            ⚙️ Settings
          </Text>
          <Link href="/settings" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Settings Home
            </Button>
          </Link>
          <Link href="/settings/identity" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Edit Identity
            </Button>
          </Link>
          <Link href="/settings/subscription" asChild>
            <Button variant="ghost" size="md" style={styles.button}>
              Subscription
            </Button>
          </Link>
        </View>

        {/* Footer Stats */}
        <View className="pt-4 pb-8 border-t border-white/10">
          <Text variant="textSm" className="text-white/40 text-center">
            20 total screens • 2 main tabs • 5 epic groups
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
