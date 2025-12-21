import { View } from 'react-native';
import { Card, Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Goals List Screen
 * Epic 2: Goal Management
 * Story 2.1: View Goals List
 */
export default function GoalsListScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          Goals List
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 2: Needle/Goal Management
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 2.1: View Goals List
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
