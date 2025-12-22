import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text } from '@/design-system';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';

/**
 * Dashboard Tab
 * Epic 5: Progress Visualization
 * Story 5.1: Weave Dashboard Overview
 */
export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text variant="displayLg" className="text-white mb-2 font-bold">
            Dashboard
          </Text>
          <Text variant="textBase" className="text-white/60">
            Track your progress and consistency
          </Text>
        </View>

        {/* Consistency Heat Map */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Consistency Heat Map
          </Text>
          <Card variant="glass" className="p-5">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                <SymbolView name="calendar" size={20} tintColor="#fb923c" />
              </View>
              <View className="flex-1">
                <Text variant="textLg" className="text-white font-semibold">
                  30-Day Activity
                </Text>
                <Text variant="textSm" className="text-white/60">
                  Track your daily consistency
                </Text>
              </View>
            </View>

            {/* Heat Map Grid Placeholder */}
            <View className="flex-row flex-wrap gap-2">
              {Array.from({ length: 30 }).map((_, index) => (
                <View
                  key={index}
                  className="w-7 h-7 rounded bg-white/10"
                  style={{
                    backgroundColor: index % 3 === 0 ? 'rgba(34, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              ))}
            </View>
            <Text variant="textXs" className="text-white/40 mt-3 text-center">
              Story 5.2 • Coming Soon
            </Text>
          </Card>
        </View>

        {/* Fulfillment Trend */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Fulfillment Trend
          </Text>
          <Card variant="glass" className="p-5">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                <SymbolView name="chart.line.uptrend.xyaxis" size={20} tintColor="#34d399" />
              </View>
              <View className="flex-1">
                <Text variant="textLg" className="text-white font-semibold">
                  Weekly Progress
                </Text>
                <Text variant="textSm" className="text-white/60">
                  Your fulfillment score over time
                </Text>
              </View>
            </View>

            {/* Trend Graph Placeholder */}
            <View className="h-24 bg-white/5 rounded-lg items-center justify-center">
              <SymbolView name="chart.xyaxis.line" size={32} tintColor="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text variant="textXs" className="text-white/40 mt-3 text-center">
              Story 5.3 • Coming Soon
            </Text>
          </Card>
        </View>

        {/* Progress Metrics */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Progress Metrics
          </Text>

          <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
                <SymbolView name="figure.walk" size={20} tintColor="#a78bfa" />
              </View>
              <View className="flex-1">
                <Text variant="textLg" className="text-white font-semibold">
                  Weave Character
                </Text>
                <Text variant="textSm" className="text-white/60">
                  Story 5.4 • Coming Soon
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="p-5 bg-white/5 rounded-xl border border-white/10 active:bg-white/10">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                <SymbolView name="flame.fill" size={20} tintColor="#fb923c" />
              </View>
              <View className="flex-1">
                <Text variant="textLg" className="text-white font-semibold">
                  Consistency Streak
                </Text>
                <Text variant="textSm" className="text-white/60">
                  Story 5.2 • Coming Soon
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Goal Management */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Goal Management
          </Text>

          <Link href="/goals" asChild>
            <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                  <SymbolView name="target" size={20} tintColor="#60a5fa" />
                </View>
                <View className="flex-1">
                  <Text variant="textLg" className="text-white font-semibold">
                    View Goals
                  </Text>
                  <Text variant="textSm" className="text-white/60">
                    Manage your active needles
                  </Text>
                </View>
                <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/goals/new" asChild>
            <TouchableOpacity className="p-5 bg-white/5 rounded-xl border border-white/10 active:bg-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                  <SymbolView name="plus.circle.fill" size={20} tintColor="#34d399" />
                </View>
                <View className="flex-1">
                  <Text variant="textLg" className="text-white font-semibold">
                    Create Goal
                  </Text>
                  <Text variant="textSm" className="text-white/60">
                    Add a new needle to focus on
                  </Text>
                </View>
                <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Settings & Profile */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Settings & Profile
          </Text>

          <Link href="/settings/identity" asChild>
            <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
                  <SymbolView name="person.fill" size={20} tintColor="#a78bfa" />
                </View>
                <View className="flex-1">
                  <Text variant="textLg" className="text-white font-semibold">
                    Edit Identity
                  </Text>
                  <Text variant="textSm" className="text-white/60">
                    Update your profile and archetype
                  </Text>
                </View>
                <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/settings" asChild>
            <TouchableOpacity className="p-5 bg-white/5 rounded-xl border border-white/10 active:bg-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center">
                  <SymbolView name="gearshape.fill" size={20} tintColor="#9ca3af" />
                </View>
                <View className="flex-1">
                  <Text variant="textLg" className="text-white font-semibold">
                    Settings
                  </Text>
                  <Text variant="textSm" className="text-white/60">
                    App preferences and account
                  </Text>
                </View>
                <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Quick Links */}
        <View className="pt-6 border-t border-white/5">
          <Text variant="textSm" className="text-white/30 mb-2 text-center">
            Development Tools
          </Text>
          <Link href="/sitemap" asChild>
            <TouchableOpacity className="p-3 bg-white/5 rounded-lg border border-white/10 active:bg-white/10">
              <Text variant="textSm" className="text-white/60 text-center">
                View Sitemap
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
