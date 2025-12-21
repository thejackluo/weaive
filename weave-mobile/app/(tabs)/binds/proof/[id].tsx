import { View } from 'react-native';
import { Card, Text, Button } from '@/design-system';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

/**
 * Attach Proof Screen
 * Epic 3: Daily Actions & Proof
 * Story 3.4: Attach Proof to Bind
 */
export default function AttachProofScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          Attach Proof
        </Text>
        <Text variant="textBase" className="text-muted mb-2">
          Bind ID: {id}
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 3: Daily Actions & Proof
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 3.4: Attach Proof to Bind
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
