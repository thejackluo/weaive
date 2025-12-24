import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
// Removed: import { Text, Button } from '@/design-system';
import { Link } from 'expo-router';

/**
 * Sitemap / Navigation Test Screen
 *
 * Complete navigation map for Epic 1.5 testing
 * Clean, minimal design with color-coded sections
 */
export default function SitemapScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <View className="p-4">
        {/* Header */}
        <Text style={{ fontSize: 48, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>
          Navigation Sitemap
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 24 }}>
          20 screens • 2 main tabs • Color-coded by epic
        </Text>

        {/* Main Tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Main Tabs
          </Text>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              🏠 Home (Thread)
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/dashboard" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              📊 Dashboard
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', marginTop: 8 }}>
            ✨ AI Chat accessible via center button
          </Text>
        </View>

        {/* Goals Screens - Blue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎯 Goals
          </Text>
          <Link href="/goals" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Goals List
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/example-goal-1" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Goal Detail
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/new" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Create Goal
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/goals/edit/example-goal-1" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Edit Goal
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Binds Screens - Green */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✅ Binds
          </Text>
          <Link href="/binds/example-bind-1" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#10b981',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Bind Detail
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/binds/proof/example-bind-1" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#10b981',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Attach Proof
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Journal Screens - Purple Gradient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📝 Journal
          </Text>
          <Link href="/journal" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#a855f7',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Daily Reflection
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/journal/history" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#a855f7',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Journal History
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/journal/2025-12-20" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: '#a855f7',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Past Entry Example
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Captures Screens - Light Blue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📸 Captures
          </Text>
          <Link href="/captures" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Capture Gallery
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/captures/example-capture-1" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Capture Detail
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Settings Screens - Subtle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚙️ Settings
          </Text>
          <Link href="/settings" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Settings Home
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/settings/identity" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Edit Identity
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/settings/subscription" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Subscription
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer Stats */}
        <View className="pt-4 pb-8 border-t border-white/10">
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
            20 total screens • 2 main tabs • 5 epic groups
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginBottom: 16,
  },
});
