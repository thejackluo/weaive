import PlaceholderScreen from '@/components/PlaceholderScreen';

/**
 * Create Goal Screen (Modal)
 * Epic 2: Goal Management
 * Story 2.3: Create New Goal (AI-Assisted)
 */
export default function CreateGoalScreen() {
  return (
    <PlaceholderScreen
      title="Create Goal"
      epic="Epic 2: Goal Management"
      story="Story 2.3: Create New Goal (AI-Assisted)"
      iconName="plus.circle.fill"
      iconColor="#60a5fa"
      backgroundColors={{ from: '#1e3a8a', to: '#0a1f44' }}
    />
  );
}
