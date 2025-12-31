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

        {/* AI Personality Section */}
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
              AI Personality
            </Text>
          </View>

          {/* Personality Settings Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/personality')}
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
                🤖 Personality & Coaching Style
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Switch between Dream Self and Weave AI
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
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

          {/* Tool Testing Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/tool-testing')}
            style={{
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
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
                🧪 Tool Testing
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Test AI tool execution with visual indicators
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>

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
                Voice Demo and Capture Picture
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
        </View>

        {/* Account Section (Story 9.4 - AC 7) */}
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
              Account
            </Text>
          </View>

          {/* Subscription Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/subscription')}
            style={{
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
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
                💳 Subscription
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Manage your Weave Pro subscription
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>

          {/* Account Management Link */}
          <Pressable
            onPress={() => router.push('/(tabs)/settings/account')}
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
                🔐 Account Management
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Export data, delete account (GDPR)
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
        </View>

        {/* Privacy & Legal Section (Story 9.4 - AC 7) */}
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
              Privacy & Legal
            </Text>
          </View>

          {/* Privacy Policy Link (Placeholder) */}
          <Pressable
            onPress={() => {
              /* TODO: Open privacy policy */
            }}
            style={{
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
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
                🔒 Privacy Policy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                How we handle your data
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>

          {/* Terms of Service Link (Placeholder) */}
          <Pressable
            onPress={() => {
              /* TODO: Open terms of service */
            }}
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
                📄 Terms of Service
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#71717A',
                }}
              >
                Legal terms and conditions
              </Text>
            </View>
            <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
