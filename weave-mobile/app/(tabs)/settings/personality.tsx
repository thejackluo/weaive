/**
 * Personality Settings Screen (Story 6.1 + 6.2 Integration)
 *
 * Allows users to:
 * - Toggle between Dream Self and Weave AI personalities
 * - Select Weave AI preset (gen_z_default, supportive_coach, concise_mentor)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  switchPersonality,
  updateWeaveAIPreset,
  PersonalityType,
  WeaveAIPreset,
  PersonalityDetails,
} from '@/services/personalityApi';

export default function PersonalitySettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activePersonality, setActivePersonality] = useState<PersonalityType>('weave_ai');
  const [weaveAIPreset, setWeaveAIPreset] = useState<WeaveAIPreset>('gen_z_default');
  const [personalityDetails, setPersonalityDetails] = useState<PersonalityDetails | null>(null);

  // Load initial personality from user profile (could be from context or API)
  // For now, we'll manage it locally after switches
  useEffect(() => {
    // TODO: Load from user profile endpoint
    // For MVP, personality state is managed locally after switches
  }, []);

  const handleSwitchPersonality = async (personality: PersonalityType) => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await switchPersonality(session.access_token, personality);
      setActivePersonality(personality);
      setPersonalityDetails(response.data.personality_details);

      // If switching to weave_ai, update preset state
      if (personality === 'weave_ai' && response.data.personality_details.preset) {
        setWeaveAIPreset(response.data.personality_details.preset);
      }

      Alert.alert(
        'Success',
        `Switched to ${personality === 'dream_self' ? 'Dream Self' : 'Weave AI'}`
      );
    } catch (error) {
      console.error('Failed to switch personality:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to switch personality');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreset = async (preset: WeaveAIPreset) => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await updateWeaveAIPreset(session.access_token, preset);
      setWeaveAIPreset(preset);
      setPersonalityDetails(response.data.personality_details);

      Alert.alert('Success', `Updated to ${getPresetDisplayName(preset)}`);
    } catch (error) {
      console.error('Failed to update preset:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update preset');
    } finally {
      setLoading(false);
    }
  };

  const getPresetDisplayName = (preset: WeaveAIPreset): string => {
    const names: Record<WeaveAIPreset, string> = {
      gen_z_default: 'Gen Z Default (Short & Warm)',
      supportive_coach: 'Supportive Coach (Encouraging)',
      concise_mentor: 'Concise Mentor (Ultra-Brief)',
    };
    return names[preset];
  };

  const getPresetDescription = (preset: WeaveAIPreset): string => {
    const descriptions: Record<WeaveAIPreset, string> = {
      gen_z_default: 'Text-message style, warm and casual, Gen Z vibes',
      supportive_coach: 'Encouraging, accountability-focused, data-driven',
      concise_mentor: 'Ultra-brief, action-oriented, direct guidance',
    };
    return descriptions[preset];
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0F0F10',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          gap: 24,
        }}
      >
        {/* Header with Back Button */}
        <View>
          <Pressable
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#3B82F6', fontSize: 16 }}>‹ Back</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FAFAFA',
              marginBottom: 8,
            }}
          >
            AI Personality
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
            }}
          >
            Choose how Weave interacts with you
          </Text>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View
            style={{
              backgroundColor: '#1F1F23',
              borderRadius: 12,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ color: '#FAFAFA', marginTop: 12 }}>Updating personality...</Text>
          </View>
        )}

        {/* Personality Toggle Section */}
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
              Active Personality
            </Text>
          </View>

          {/* Dream Self Option */}
          <Pressable
            onPress={() => !loading && handleSwitchPersonality('dream_self')}
            disabled={loading}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#27272A',
              backgroundColor: activePersonality === 'dream_self' ? '#1E3A5F' : 'transparent',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#FAFAFA',
                  flex: 1,
                }}
              >
                Dream Self
              </Text>
              {activePersonality === 'dream_self' && (
                <Text style={{ color: '#3B82F6', fontSize: 18 }}>✓</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 13,
                color: '#71717A',
              }}
            >
              Personalized AI using your identity document. Speaks as your ideal self with custom
              traits and style.
            </Text>
            {activePersonality === 'dream_self' && personalityDetails && (
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: '#27272A',
                }}
              >
                <Text style={{ color: '#3B82F6', fontSize: 13, fontWeight: '600' }}>
                  Active: {personalityDetails.name}
                </Text>
                <Text style={{ color: '#71717A', fontSize: 12, marginTop: 4 }}>
                  {personalityDetails.speaking_style}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Weave AI Option */}
          <Pressable
            onPress={() => !loading && handleSwitchPersonality('weave_ai')}
            disabled={loading}
            style={{
              padding: 16,
              backgroundColor: activePersonality === 'weave_ai' ? '#1E3A5F' : 'transparent',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#FAFAFA',
                  flex: 1,
                }}
              >
                Weave AI
              </Text>
              {activePersonality === 'weave_ai' && (
                <Text style={{ color: '#3B82F6', fontSize: 18 }}>✓</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 13,
                color: '#71717A',
              }}
            >
              General AI coach with customizable coaching styles. Choose your preferred preset
              below.
            </Text>
          </Pressable>
        </View>

        {/* Weave AI Preset Selection (only shown when weave_ai active) */}
        {activePersonality === 'weave_ai' && (
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
                Weave AI Coaching Style
              </Text>
            </View>

            {/* Gen Z Default Preset */}
            <Pressable
              onPress={() => !loading && handleUpdatePreset('gen_z_default')}
              disabled={loading}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#27272A',
                backgroundColor: weaveAIPreset === 'gen_z_default' ? '#1E3A5F' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#FAFAFA',
                    flex: 1,
                  }}
                >
                  {getPresetDisplayName('gen_z_default')}
                </Text>
                {weaveAIPreset === 'gen_z_default' && (
                  <Text style={{ color: '#3B82F6', fontSize: 18 }}>✓</Text>
                )}
              </View>
              <Text style={{ fontSize: 13, color: '#71717A' }}>
                {getPresetDescription('gen_z_default')}
              </Text>
            </Pressable>

            {/* Supportive Coach Preset */}
            <Pressable
              onPress={() => !loading && handleUpdatePreset('supportive_coach')}
              disabled={loading}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#27272A',
                backgroundColor: weaveAIPreset === 'supportive_coach' ? '#1E3A5F' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#FAFAFA',
                    flex: 1,
                  }}
                >
                  {getPresetDisplayName('supportive_coach')}
                </Text>
                {weaveAIPreset === 'supportive_coach' && (
                  <Text style={{ color: '#3B82F6', fontSize: 18 }}>✓</Text>
                )}
              </View>
              <Text style={{ fontSize: 13, color: '#71717A' }}>
                {getPresetDescription('supportive_coach')}
              </Text>
            </Pressable>

            {/* Concise Mentor Preset */}
            <Pressable
              onPress={() => !loading && handleUpdatePreset('concise_mentor')}
              disabled={loading}
              style={{
                padding: 16,
                backgroundColor: weaveAIPreset === 'concise_mentor' ? '#1E3A5F' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#FAFAFA',
                    flex: 1,
                  }}
                >
                  {getPresetDisplayName('concise_mentor')}
                </Text>
                {weaveAIPreset === 'concise_mentor' && (
                  <Text style={{ color: '#3B82F6', fontSize: 18 }}>✓</Text>
                )}
              </View>
              <Text style={{ fontSize: 13, color: '#71717A' }}>
                {getPresetDescription('concise_mentor')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Info Card */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272A',
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
              lineHeight: 20,
            }}
          >
            <Text style={{ color: '#FAFAFA', fontWeight: '600' }}>Dream Self</Text> uses your
            identity document to create a fully personalized AI coach.{'\n\n'}
            <Text style={{ color: '#FAFAFA', fontWeight: '600' }}>Weave AI</Text> is a general
            coach with three coaching styles you can choose from.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
