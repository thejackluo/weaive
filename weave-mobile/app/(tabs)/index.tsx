import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-background-primary p-4 gap-6">
      <View className="items-center gap-2">
        <Text className="text-7xl font-bold text-text-primary">Weave MVP</Text>
        <Text className="text-base text-text-secondary">Foundation Setup Complete ✅</Text>
      </View>

      {/* Design System Buttons */}
      <View className="gap-3 w-full max-w-xs">
        <Pressable
          onPress={() => router.push('/(tabs)/design-system-showcase')}
          className="bg-accent-500 px-6 py-4 rounded-lg active:opacity-80 active:scale-98"
        >
          <Text className="text-dark-900 text-sm font-medium tracking-wide text-center">
            View Full Design System
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/component-testing')}
          className="bg-violet-600 px-6 py-4 rounded-lg active:opacity-80 active:scale-98 border border-violet-500"
        >
          <Text className="text-dark-50 text-sm font-medium tracking-wide text-center">
            🧪 Component Testing
          </Text>
        </Pressable>
      </View>

      <View className="absolute bottom-8 items-center">
        <Text className="text-text-muted text-xs">React Native-First Design System</Text>
        <Text className="text-text-muted text-xs">
          NativeWind v5 • Tailwind v4 • Liquid Glass UI
        </Text>
      </View>
    </View>
  );
}
