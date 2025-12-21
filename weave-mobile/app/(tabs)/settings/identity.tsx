import { View } from 'react-native';
import { Card, Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Edit Identity Document Screen
 * Epic 8: Settings & Profile
 * Story 8.2: Edit Identity Document
 */
export default function EditIdentityScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          Edit Identity Document
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 8: Settings & Profile
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 8.2: Edit Identity Document
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
