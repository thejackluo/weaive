import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  backgroundColors: _backgroundColors = { from: '#0a0a0a', to: '#0a0a0a' }, // Force dark backgrounds
}: PlaceholderScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <SymbolView name="chevron.left" size={20} tintColor="#ffffff" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <SymbolView name={iconName} size={40} tintColor={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {title}
          </Text>

          {/* Epic */}
          <Text style={styles.epic}>
            {epic}
          </Text>

          {/* Story */}
          <Text style={styles.story}>
            {story}
          </Text>

          {/* Status Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Coming Soon
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            This page has not been developed
          </Text>
          <Text style={styles.subdescription}>
            Check back soon as we continue building Weave.
          </Text>

          {/* Bottom Spacer */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Explicit dark background
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  epic: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  story: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 32,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 24,
  },
  badgeText: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 8,
  },
  subdescription: {
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    height: 80,
  },
});
