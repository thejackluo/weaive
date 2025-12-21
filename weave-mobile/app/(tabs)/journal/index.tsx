import { View } from 'react-native';
import { Card, Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Daily Reflection Screen
 * Epic 4: Reflection & Journaling
 * Story 4.1: Daily Reflection Entry
 */
export default function DailyReflectionScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          Daily Reflection
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 4: Reflection & Journaling
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 4.1: Daily Reflection Entry
        </Text>
        <Text variant="textSm" className="text-muted mb-6">
          This page has not been developed
        </Text>
        <Link href="/sitemap" asChild>
          <Button variant="ghost" size="md">
            ← Back to Sitemap
          </Button>
        </Link>
      </Card>
    </View>
  );
}
