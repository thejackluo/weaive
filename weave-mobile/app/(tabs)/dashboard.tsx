import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Dashboard Tab
 * Epic 5: Progress Visualization
 * Story 5.1: Weave Dashboard Overview
 */
export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text variant="displayLg" className="text-foreground mb-4 font-bold">
          Dashboard
        </Text>

        {/* Navigation Sitemap Link */}
        <Card variant="glass" padding="default">
          <Text variant="textLg" className="text-foreground mb-3 font-semibold">
            🗺️ Navigation Testing
          </Text>
          <Link href="/sitemap" asChild>
            <TouchableOpacity className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <Text variant="textBase" className="text-primary font-semibold">
                → View Complete Sitemap (All 20 Screens)
              </Text>
            </TouchableOpacity>
          </Link>
        </Card>

        {/* Progress Section */}
        <Card variant="glass" padding="default">
          <Text variant="textLg" className="text-foreground mb-3 font-semibold">
            Progress Visualization (Epic 5)
          </Text>
          <View className="p-3 bg-white/5 rounded-lg mb-2">
            <Text variant="textSm" className="text-muted">
              → Weave Character (Story 5.4)
            </Text>
          </View>
          <View className="p-3 bg-white/5 rounded-lg mb-2">
            <Text variant="textSm" className="text-muted">
              → Consistency Heat Map (Story 5.2)
            </Text>
          </View>
          <View className="p-3 bg-white/5 rounded-lg">
            <Text variant="textSm" className="text-muted">
              → Fulfillment Trend (Story 5.3)
            </Text>
          </View>
        </Card>

        {/* Goals Section */}
        <Card variant="glass" padding="default">
          <Text variant="textLg" className="text-foreground mb-3 font-semibold">
            Goal Management (Epic 2)
          </Text>
          <Link href="/goals" asChild>
            <TouchableOpacity className="mb-2 p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Goals List (Story 2.1)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/example-goal-1" asChild>
            <TouchableOpacity className="mb-2 p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Goal Detail (Story 2.2)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/new" asChild>
            <TouchableOpacity className="mb-2 p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Create Goal (Story 2.3)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/edit/example-goal-1" asChild>
            <TouchableOpacity className="p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Edit Goal (Story 2.4)
              </Text>
            </TouchableOpacity>
          </Link>
        </Card>

        {/* Settings Section */}
        <Card variant="glass" padding="default">
          <Text variant="textLg" className="text-foreground mb-3 font-semibold">
            Settings & Profile (Epic 8)
          </Text>
          <Link href="/settings" asChild>
            <TouchableOpacity className="mb-2 p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Settings Home (Story 8.3)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/settings/identity" asChild>
            <TouchableOpacity className="mb-2 p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Edit Identity Document (Story 8.2)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/settings/subscription" asChild>
            <TouchableOpacity className="p-3 bg-white/5 rounded-lg">
              <Text variant="textSm" className="text-muted">
                → Subscription Management (Story 8.4)
              </Text>
            </TouchableOpacity>
          </Link>
        </Card>

        {/* Info Card */}
        <Card variant="glass" padding="default">
          <Text variant="textSm" className="text-muted/70">
            Placeholder navigation for Epic 1.5 testing. Tap any card above to navigate to that screen.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
