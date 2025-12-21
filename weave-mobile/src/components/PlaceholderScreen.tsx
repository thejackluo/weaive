import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Caption } from '@/design-system';
import { SymbolView, type SFSymbol } from 'expo-symbols';

interface PlaceholderScreenProps {
  /** Screen title */
  title: string;
  /** Epic number and name */
  epic: string;
  /** Story number and name */
  story: string;
  /** Optional icon name from SF Symbols */
  iconName?: SFSymbol;
  /** Optional icon color (defaults to white) */
  iconColor?: string;
  /** Optional background gradient colors */
  backgroundColors?: { from: string; to: string };
}

/**
 * Placeholder Screen Component
 *
 * Beautiful placeholder for unimplemented screens
 * Styled consistently with design-system-showcase aesthetic
 */
export default function PlaceholderScreen({
  title,
  epic,
  story,
  iconName = 'hammer.fill',
  iconColor = '#ffffff',
  backgroundColors = { from: '#1a1a1a', to: '#0a0a0a' },
}: PlaceholderScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: backgroundColors.from }}>
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 active:opacity-70"
        >
          <SymbolView name="chevron.left" size={20} tintColor="#ffffff" />
          <Text className="text-white font-medium">Back</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 items-center justify-center"
        style={{ backgroundColor: backgroundColors.to }}
      >
        {/* Icon */}
        <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center mb-6">
          <SymbolView name={iconName} size={40} tintColor={iconColor} />
        </View>

        {/* Title */}
        <Text
          variant="display2xl"
          className="text-white font-bold text-center mb-4"
          style={{ fontSize: 36 }}
        >
          {title}
        </Text>

        {/* Epic */}
        <Text variant="textLg" className="text-white/70 text-center mb-2">
          {epic}
        </Text>

        {/* Story */}
        <Text variant="textBase" className="text-white/50 text-center mb-8">
          {story}
        </Text>

        {/* Status Badge */}
        <View className="px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/40 mb-6">
          <Caption className="text-amber-400 font-semibold">Coming Soon</Caption>
        </View>

        {/* Description */}
        <Text variant="textSm" className="text-white/40 text-center max-w-xs">
          This screen is part of the Weave development roadmap and will be implemented in an
          upcoming sprint.
        </Text>

        {/* Bottom Spacer */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
