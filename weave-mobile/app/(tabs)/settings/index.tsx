/**
 * Settings Screen
 *
 * Story 4.1: Added Reflection Preferences link
 *
 * Future: Will contain user preferences, account settings, etc.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserAvatarMenu } from '@/components/UserAvatarMenu';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0F0F10',
      }}
    >
      {/* User Avatar Menu - Top Right */}
      <UserAvatarMenu />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          gap: 24,
        }}
      >
        {/* Header */}
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FAFAFA',
              marginBottom: 8,
            }}
          >
            Settings
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
            }}
          >
            Manage your preferences and account
          </Text>
        </View>

        {/* Reflection Preferences Section */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272A',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FAFAFA',
              }}
            >
              Reflection & Journaling
            </Text>
          </View>

          {/* Daily Reflection Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/reflection')}
            style={{
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: '#FAFAFA',
                  marginBottom: 4,
                }}
              >
                📝 Daily Reflection
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Answer questions and track your progress
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
        </View>

        {/* Development Section */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272A',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FAFAFA',
              }}
            >
              Development
            </Text>
          </View>

          {/* Dev Tools Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/dev-tools')}
            style={{
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: '#FAFAFA',
                  marginBottom: 4,
                }}
              >
                🛠️ Dev Tools
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Clear caches and debug utilities
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
        </View>

        {/* Placeholder for Future Settings */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272A',
            padding: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
              textAlign: 'center',
            }}
          >
            More settings coming soon...
            {'\n'}
            Account • Notifications • Privacy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
