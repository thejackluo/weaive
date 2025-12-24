/**
 * Account Management Screen
 * Story 9.4: App Store Readiness - AC 7 (GDPR Compliance)
 *
 * Features:
 * - Export user data (GDPR Article 20 - Right to Data Portability)
 * - Delete account (GDPR Article 17 - Right to Erasure)
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import apiClient from '@/services/apiClient';

export default function AccountManagementScreen() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    Alert.alert(
      'Export Your Data',
      'Download a complete copy of your data including goals, journal entries, and completions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              setIsExporting(true);
              const response = await apiClient.get('/api/account/export-data');

              Alert.alert(
                'Export Ready',
                'Your data export is ready. In production, this will be a downloadable link.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Export Failed',
                'Failed to export data. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action is IRREVERSIBLE. All your data will be permanently deleted:\n\n• Goals and subtasks\n• Journal entries\n• Progress and completions\n• Profile information\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.prompt(
              'Confirm Deletion',
              'Type DELETE (all caps) to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async (confirmation) => {
                    if (confirmation !== 'DELETE') {
                      Alert.alert('Deletion Cancelled', 'You must type DELETE to confirm.');
                      return;
                    }

                    try {
                      setIsDeleting(true);
                      await apiClient.post('/api/account/delete-account', {
                        confirmation: 'DELETE',
                      });

                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted. You will now be logged out.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              // TODO: Implement logout and redirect to auth screen
                              router.replace('/(auth)/login');
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      Alert.alert(
                        'Deletion Failed',
                        'Failed to delete account. Please try again or contact support.',
                        [{ text: 'OK' }]
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
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
            Account Management
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
            }}
          >
            Manage your data and account settings
          </Text>
        </View>

        {/* Data Portability Section (GDPR Article 20) */}
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
              📦 Your Data
            </Text>
          </View>

          <Pressable
            onPress={handleExportData}
            disabled={isExporting}
            style={({ pressed }) => ({
              padding: 16,
              opacity: pressed || isExporting ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {isExporting ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={{ fontSize: 24 }}>📥</Text>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: '#FAFAFA',
                    marginBottom: 4,
                  }}
                >
                  {isExporting ? 'Exporting...' : 'Export Your Data'}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#71717A',
                  }}
                >
                  Download a complete copy of your data
                </Text>
              </View>
              <Text style={{ color: '#71717A', fontSize: 18 }}>›</Text>
            </View>
          </Pressable>
        </View>

        {/* Danger Zone (GDPR Article 17) */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#DC2626',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#DC2626',
              backgroundColor: '#7F1D1D',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FAFAFA',
              }}
            >
              ⚠️ Danger Zone
            </Text>
          </View>

          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            style={({ pressed }) => ({
              padding: 16,
              opacity: pressed || isDeleting ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={{ fontSize: 24 }}>🗑️</Text>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: '#DC2626',
                    marginBottom: 4,
                    fontWeight: '600',
                  }}
                >
                  {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#71717A',
                  }}
                >
                  Permanently delete your account and all data
                </Text>
              </View>
              <Text style={{ color: '#DC2626', fontSize: 18 }}>›</Text>
            </View>
          </Pressable>
        </View>

        {/* GDPR Notice */}
        <View
          style={{
            padding: 16,
            backgroundColor: '#1F1F23',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#27272A',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#71717A',
              lineHeight: 18,
            }}
          >
            ℹ️ Your Privacy Rights{'\n\n'}
            Under GDPR (EU) and CCPA (California), you have the right to:{'\n'}
            • Access your personal data (Export Data){'\n'}
            • Request deletion of your data (Delete Account){'\n'}
            • Opt-out of data processing (Settings → Privacy){'\n\n'}
            For questions, contact: privacy@weavelight.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
