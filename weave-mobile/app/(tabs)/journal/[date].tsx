import PlaceholderScreen from '@/components/PlaceholderScreen';

/**
 * Past Journal Entry Screen
 * Epic 4: Reflection & Journaling
 * Story 4.5: View Past Journal Entries
 */
export default function PastEntryScreen() {
  return (
    <PlaceholderScreen
      title="Past Entry"
      epic="Epic 4: Reflection & Journaling"
      story="Story 4.5: View Past Journal Entries"
      iconName="doc.richtext.fill"
      iconColor="#a78bfa"
      backgroundColors={{ from: '#5b21b6', to: '#2e1065' }}
    />
  );
}
