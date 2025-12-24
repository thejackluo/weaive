/**
 * Component Testing Screen - SIMPLIFIED
 *
 * Clean slate for testing Batch 1: Button, Card, Checkbox
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ComponentTestingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Component Testing</Text>
        <Text style={styles.subtitle}>Batch 1: Button, Card, Checkbox</Text>

        <View style={styles.section}>
          <Text style={styles.text}>Ready to start testing components.</Text>
          <Text style={styles.text}>No errors. Clean slate.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ECECF1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717F',
    marginBottom: 32,
  },
  section: {
    padding: 20,
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#D4D4DC',
  },
});
