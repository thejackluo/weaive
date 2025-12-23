import { View, ScrollView, StyleSheet, Text as RNText, TouchableOpacity } from 'react-native';
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
        <RNText style={{ fontSize: 48, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>
          Navigation Sitemap
        </RNText>
        <RNText style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 24 }}>
          20 screens • 2 main tabs • Color-coded by epic
        </RNText>

        {/* Main Tabs */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            Main Tabs
          </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              🏠 Home (Thread)
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              📊 Dashboard
              </RNText>
            </TouchableOpacity>
          </Link>
          <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', marginTop: 8 }}>
            ✨ AI Chat accessible via center button
          </RNText>
        </View>

        {/* Goals Screens - Blue */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            🎯 Goals
          </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Goals List
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Goal Detail
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Create Goal
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Edit Goal
              </RNText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Binds Screens - Green */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            ✅ Binds
          </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Bind Detail
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Attach Proof
              </RNText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Journal Screens - Purple Gradient */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            📝 Journal
          </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Daily Reflection
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Journal History
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Past Entry Example
              </RNText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Captures Screens - Light Blue */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            📸 Captures
          </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Capture Gallery
              </RNText>
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
              <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Capture Detail
              </RNText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Settings Screens - Subtle */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>
            ⚙️ Settings
          </RNText>
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
              <RNText style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Settings Home
              </RNText>
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
              <RNText style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Edit Identity
              </RNText>
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
              <RNText style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>
              Subscription
              </RNText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer Stats */}
        <View className="pt-4 pb-8 border-t border-white/10">
          <RNText style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
            20 total screens • 2 main tabs • 5 epic groups
          </RNText>
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
