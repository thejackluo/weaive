import { View } from 'react-native';
import { Card, Text, Button } from '@/design-system';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

/**
 * Past Journal Entry Screen
 * Epic 4: Reflection & Journaling
 * Story 4.5: View Past Journal Entries
 */
export default function PastEntryScreen() {
  const { date } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          Past Entry
        </Text>
        <Text variant="textBase" className="text-muted mb-2">
          Date: {date}
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 4: Reflection & Journaling
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 4.5: View Past Journal Entries
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
