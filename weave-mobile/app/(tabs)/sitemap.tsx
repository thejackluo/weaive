import { View, ScrollView } from 'react-native';
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
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            Main Tabs
          </Text>
          <Link href="/(tabs)" asChild>
            <Button variant="primary" size="md" className="mb-3">
              🏠 Home (Thread)
            </Button>
          </Link>
          <Link href="/(tabs)/dashboard" asChild>
            <Button variant="primary" size="md" className="mb-3">
              📊 Dashboard
            </Button>
          </Link>
          <Text variant="textSm" className="text-white/40 mt-2">
            ✨ AI Chat accessible via center button
          </Text>
        </View>

        {/* Goals Screens - Blue */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            🎯 Goals
          </Text>
          <Link href="/goals" asChild>
            <Button variant="primary" size="md" className="mb-3">
              Goals List
            </Button>
          </Link>
          <Link href="/goals/example-goal-1" asChild>
            <Button variant="primary" size="md" className="mb-3">
              Goal Detail
            </Button>
          </Link>
          <Link href="/goals/new" asChild>
            <Button variant="primary" size="md" className="mb-3">
              Create Goal
            </Button>
          </Link>
          <Link href="/goals/edit/example-goal-1" asChild>
            <Button variant="primary" size="md" className="mb-3">
              Edit Goal
            </Button>
          </Link>
        </View>

        {/* Binds Screens - Green */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            ✅ Binds
          </Text>
          <Link href="/binds/example-bind-1" asChild>
            <Button variant="success" size="md" className="mb-3">
              Bind Detail
            </Button>
          </Link>
          <Link href="/binds/proof/example-bind-1" asChild>
            <Button variant="success" size="md" className="mb-3">
              Attach Proof
            </Button>
          </Link>
        </View>

        {/* Journal Screens - Purple Gradient */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            📝 Journal
          </Text>
          <Link href="/journal" asChild>
            <Button variant="ai" size="md" className="mb-3">
              Daily Reflection
            </Button>
          </Link>
          <Link href="/journal/history" asChild>
            <Button variant="ai" size="md" className="mb-3">
              Journal History
            </Button>
          </Link>
          <Link href="/journal/2025-12-20" asChild>
            <Button variant="ai" size="md" className="mb-3">
              Past Entry Example
            </Button>
          </Link>
        </View>

        {/* Captures Screens - Light Blue */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            📸 Captures
          </Text>
          <Link href="/captures" asChild>
            <Button variant="secondary" size="md" className="mb-3">
              Capture Gallery
            </Button>
          </Link>
          <Link href="/captures/example-capture-1" asChild>
            <Button variant="secondary" size="md" className="mb-3">
              Capture Detail
            </Button>
          </Link>
        </View>

        {/* Settings Screens - Subtle */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            ⚙️ Settings
          </Text>
          <Link href="/settings" asChild>
            <Button variant="ghost" size="md" className="mb-3">
              Settings Home
            </Button>
          </Link>
          <Link href="/settings/identity" asChild>
            <Button variant="ghost" size="md" className="mb-3">
              Edit Identity
            </Button>
          </Link>
          <Link href="/settings/subscription" asChild>
            <Button variant="ghost" size="md" className="mb-3">
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
