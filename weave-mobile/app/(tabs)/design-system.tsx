/**
 * Design System Showcase Screen - TEST VERSION
 *
 * Minimal version to test if route works
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DesignSystemScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Design System Showcase</Text>
        <Text style={styles.subtitle}>Route is working! ✅</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Card</Text>
          <Text style={styles.cardText}>
            If you can see this, the route is loading correctly.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Step</Text>
          <Text style={styles.cardText}>
            Now we can add design system imports back one by one.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#a1a1aa',
    lineHeight: 24,
  },
});
