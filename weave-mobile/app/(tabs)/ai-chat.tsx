import { View } from 'react-native';
import { Card, Text } from '@/design-system';

/**
 * AI Chat Tab (Hidden, accessed via center button)
 * Epic 6: AI Coaching
 * Story 6.1: Access AI Chat
 */
export default function AIChatScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" padding="default">
        <Text variant="displayLg" className="text-foreground mb-2 font-bold">
          AI Chat
        </Text>
        <Text variant="textLg" className="text-muted mb-2">
          Dream Self Coach
        </Text>
        <Text variant="textBase" className="text-muted mb-4">
          Epic 6: AI Coaching
        </Text>
        <Text variant="textSm" className="text-muted mb-4">
          Story 6.1: Access AI Chat
        </Text>
        <Text variant="textSm" className="text-muted">
          This page is accessed via center button overlay (glassmorphism)
        </Text>
      </Card>
    </View>
  );
}
