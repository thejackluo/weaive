import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold">Weave MVP</Text>
      <Text className="mt-2 text-gray-600">Foundation Setup Complete ✅</Text>
    </View>
  );
}
