import PlaceholderScreen from '@/components/PlaceholderScreen';

/**
 * AI Chat Tab (Hidden, accessed via center button)
 * Epic 6: AI Coaching
 * Story 6.1: Access AI Chat
 */
export default function AIChatScreen() {
  return (
    <PlaceholderScreen
      title="AI Coach"
      epic="Epic 6: AI Coaching"
      story="Story 6.1: Access AI Chat"
      iconName="sparkles"
      iconColor="#a78bfa"
      backgroundColors={{ from: '#5b21b6', to: '#2e1065' }}
    />
  );
}
