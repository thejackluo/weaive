import { View, ScrollView } from 'react-native';
import { Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Thread (Home) Tab
 * Epic 3: Daily Actions & Proof
 * Story 3.1: View Today's Binds
 */
export default function ThreadScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Main Header */}
        <Text variant="displayLg" className="text-white mb-2 font-bold">
          Good Morning ✨
        </Text>
        <Text variant="textBase" className="text-white/60 mb-6">
          Friday, December 20 • Let's make today count
        </Text>

        {/* Today's Binds - Primary Section */}
        <View className="mb-6">
          <Text variant="displayMd" className="text-white mb-4 font-semibold">
            Today's Binds
          </Text>
          <View className="p-4 bg-white/5 rounded-xl mb-2 border border-white/10">
            <Text variant="textBase" className="text-white mb-2">
              🎯 Morning Workout
            </Text>
            <Text variant="textSm" className="text-white/60">
              Complete your 30-minute strength training session
            </Text>
          </View>
          <View className="p-4 bg-white/5 rounded-xl mb-2 border border-white/10">
            <Text variant="textBase" className="text-white mb-2">
              📚 Deep Work Block
            </Text>
            <Text variant="textSm" className="text-white/60">
              2 hours of focused project work
            </Text>
          </View>
          <View className="p-4 bg-white/5 rounded-xl border border-white/10">
            <Text variant="textBase" className="text-white mb-2">
              🧘 Evening Meditation
            </Text>
            <Text variant="textSm" className="text-white/60">
              10-minute mindfulness practice
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text variant="textLg" className="text-white mb-3 font-semibold">
            Quick Actions
          </Text>
          <View className="flex-row gap-2 mb-2">
            <Link href="/dashboard" asChild className="flex-1">
              <Button variant="primary" size="md">
                📊 Dashboard
              </Button>
            </Link>
            <Link href="/journal" asChild className="flex-1">
              <Button variant="ai" size="md">
                📝 Journal
              </Button>
            </Link>
          </View>
          <View className="flex-row gap-2">
            <Link href="/goals" asChild className="flex-1">
              <Button variant="secondary" size="md">
                🎯 Goals
              </Button>
            </Link>
            <Link href="/captures" asChild className="flex-1">
              <Button variant="success" size="md">
                📸 Captures
              </Button>
            </Link>
          </View>
        </View>

        {/* Navigation Testing (Bottom) */}
        <View className="pt-4 border-t border-white/10">
          <Text variant="textSm" className="text-white/40 mb-3">
            Development Tools
          </Text>
          <Link href="/sitemap" asChild>
            <Button variant="ghost" size="md">
              🗺️ View All Screens (Sitemap)
            </Button>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
