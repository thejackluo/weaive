import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

/**
 * Attach Proof Screen
 * Epic 3: Daily Actions & Proof
 * Story 3.4: Attach Proof to Bind
 */
export default function AttachProofScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <RNText style={styles.backText}>← Back</RNText>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <RNText style={styles.title}>
            Attach Proof
          </RNText>

          {/* Epic */}
          <RNText style={styles.epic}>
            Epic 3: Daily Actions & Proof
          </RNText>

          {/* Story */}
          <RNText style={styles.story}>
            Story 3.4: Attach Proof to Bind
          </RNText>

          {/* Status Badge */}
          <View style={styles.badge}>
            <RNText style={styles.badgeText}>
              Coming Soon
            </RNText>
          </View>

          {/* Description */}
          <RNText style={styles.description}>
            This page has not been developed
          </RNText>
          <RNText style={styles.subdescription}>
            Check back soon as we continue building Weave.
          </RNText>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
