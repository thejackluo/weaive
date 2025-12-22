import PlaceholderScreen from '@/components/PlaceholderScreen';

/**
 * Journal History Screen
 * Epic 4: Reflection & Journaling
 * Story 4.5: View Past Journal Entries
 */
export default function JournalHistoryScreen() {
  return (
    <PlaceholderScreen
      title="Journal History"
      epic="Epic 4: Reflection & Journaling"
      story="Story 4.5: View Past Journal Entries"
      iconName="calendar.badge.clock"
      iconColor="#a78bfa"
      backgroundColors={{ from: '#5b21b6', to: '#2e1065' }}
    />
  );
}
