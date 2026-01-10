/**
 * Dev Tools Screen
 * Development-only utilities for testing and debugging
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, Card, Heading, Body, Button } from '@/design-system';
import { clearAllCaches, logActiveQueries } from '@/utils/devTools';
import { useAuth } from '@/contexts/AuthContext';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';
import apiClient from '@/services/apiClient';

export default function DevToolsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    currentStep,
    isOnboardingComplete,
    isSkipped,
    resetOnboarding,
    skipTutorial,
    setStep,
  } = useInAppOnboarding();
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(apiClient.getAdminKey() !== null);

  // Identity Document Form State
  const [dreamSelf, setDreamSelf] = useState('');
  const [traits, setTraits] = useState('');
  const [motivations, setMotivations] = useState('');
  const [archetype, setArchetype] = useState('');
  const [failureMode, setFailureMode] = useState('');
  const [coachingPreference, setCoachingPreference] = useState('');
  const [isLoadingIdentityDoc, setIsLoadingIdentityDoc] = useState(false);
  const [isSavingIdentityDoc, setIsSavingIdentityDoc] = useState(false);

  const handleClearAllCaches = () => {
    clearAllCaches(queryClient);
    Alert.alert('Success', 'All React Query caches cleared. Data will be refetched fresh.');
  };

  const handleLogQueries = () => {
    logActiveQueries(queryClient);
    Alert.alert('Check Console', 'Active queries logged to console');
  };

  const handleInvalidateBinds = () => {
    const today = new Date().toISOString().split('T')[0];
    queryClient.invalidateQueries({ queryKey: ['binds', 'today', today] });
    Alert.alert('Success', "Today's binds cache invalidated. Will refetch on next screen load.");
  };

  const handleTestDateChange = () => {
    Alert.alert(
      '🧪 Test Date Change Fix',
      'This simulates what happens when the date changes (e.g., midnight rollover).\n\n' +
      'Steps:\n' +
      '1. Complete a bind\n' +
      '2. Press this button to invalidate queries\n' +
      '3. Return to Thread screen\n' +
      '4. Verify bind shows as incomplete\n\n' +
      'In production, this happens automatically at midnight and when app returns to foreground.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🔄 Simulate Date Change',
          onPress: () => {
            // Invalidate all date-dependent queries (simulates midnight rollover)
            queryClient.invalidateQueries({ queryKey: ['binds'] });
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
            queryClient.invalidateQueries({ queryKey: ['consistency'] });
            queryClient.invalidateQueries({ queryKey: ['daily-aggregates'] });

            Alert.alert('✅ Date Change Simulated', 'All queries invalidated. Return to Thread screen to see fresh data.');
          },
        },
      ]
    );
  };

  const handleToggleAdminMode = () => {
    const ADMIN_KEY = 'dev-admin-key-12345-change-in-production';
    if (adminModeEnabled) {
      apiClient.disableAdminMode();
      setAdminModeEnabled(false);
      Alert.alert('🔒 Admin Mode Disabled', 'Normal rate limits will apply.');
    } else {
      apiClient.enableAdminMode(ADMIN_KEY);
      setAdminModeEnabled(true);
      Alert.alert('🔓 Admin Mode Enabled', 'Unlimited rate limits active. Use for testing only.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleResetRateLimit = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      console.log('[DEV_TOOLS] 🔄 Resetting rate limits...');

      // Get user_profiles.id from auth_user_id
      const { supabase } = await import('@lib/supabase');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('User profile not found');
      }

      const userId = profileData.id;
      const ADMIN_KEY = 'dev-admin-key-12345-change-in-production';

      // Call admin endpoint to reset rate limits
      const response = await apiClient.post(`/api/admin/reset-rate-limit/${userId}`, null, {
        headers: {
          'X-Admin-Key': ADMIN_KEY,
        },
      });

      console.log('[DEV_TOOLS] ✅ Rate limits reset:', response.data);

      Alert.alert(
        '🔄 Rate Limits Reset!',
        `Cleared ${response.data.data.records_deleted} usage records. You now have fresh rate limits.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] ❌ Reset rate limit error:', error);
      Alert.alert('Error', error.message || 'Failed to reset rate limits');
    }
  };

  const handleUpgradeToAdmin = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      console.log('[DEV_TOOLS] ⚡ Upgrading to admin account...');

      // Get user_profiles.id from auth_user_id
      const { supabase } = await import('@lib/supabase');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('User profile not found');
      }

      const userId = profileData.id;
      const ADMIN_KEY = 'dev-admin-key-12345-change-in-production';

      // Call admin endpoint to upgrade account
      const response = await apiClient.post(`/api/admin/upgrade-to-admin/${userId}`, null, {
        headers: {
          'X-Admin-Key': ADMIN_KEY,
        },
      });

      console.log('[DEV_TOOLS] ✅ Upgraded to admin:', response.data);

      Alert.alert(
        '⚡ Account Upgraded!',
        'Your account is now an admin account with unlimited rate limits. This is permanent until you reset the database.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] ❌ Upgrade to admin error:', error);
      Alert.alert('Error', error.message || 'Failed to upgrade account');
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setIsSendingNotification(true);

    try {
      // First, get user_profiles.id from auth_user_id
      const authUserId = user.id; // This is auth.uid from JWT

      // Query user_profiles to get the internal ID
      const response = await fetch(`http://192.168.1.112:8000/api/user/me`, {
        headers: {
          Authorization: `Bearer ${await apiClient.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      // For now, we'll use a simplified approach: call the endpoint with auth_user_id
      // and let the backend handle the lookup
      // Note: Admin mode must be enabled manually in Dev Tools for this to work
      const { supabase } = await import('@lib/supabase');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (profileError || !profileData) {
        throw new Error('User profile not found');
      }

      const userProfileId = profileData.id;

      // Now call the trigger-checkin endpoint with user_profiles.id
      const result = await apiClient.post(`/admin/trigger-checkin/${userProfileId}`, {});

      if (result.data?.data?.success) {
        Alert.alert(
          '✅ Notification Sent!',
          `Test notification triggered successfully!\n\nMessage: "${result.data.data.message}"\n\nCheck your device for the push notification.`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('[DEV_TOOLS] Test notification error:', error);
      Alert.alert(
        'Error',
        `Failed to send test notification:\n\n${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Load identity document from database
  const loadIdentityDocument = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setIsLoadingIdentityDoc(true);
    try {
      const { supabase } = await import('@lib/supabase');

      // Get user_profiles.id from auth_user_id
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('User profile not found');
      }

      // Get latest identity document
      const { data: identityDoc, error: docError } = await supabase
        .from('identity_docs')
        .select('*')
        .eq('user_id', profileData.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (docError && docError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (which is fine)
        throw docError;
      }

      if (identityDoc) {
        const content = identityDoc.json || {};
        setDreamSelf(content.dream_self || '');
        setTraits(Array.isArray(content.traits) ? content.traits.join(', ') : '');
        setMotivations(Array.isArray(content.motivations) ? content.motivations.join(', ') : '');
        setArchetype(content.archetype || '');
        setFailureMode(content.failure_mode || '');
        setCoachingPreference(content.coaching_preference || '');
        Alert.alert('Success', `Loaded identity document v${identityDoc.version}`);
      } else {
        Alert.alert('Info', 'No identity document found. Create a new one!');
      }
    } catch (error: any) {
      console.error('[DEV_TOOLS] Load identity doc error:', error);
      Alert.alert(
        'Error',
        `Failed to load identity document:\n\n${error.message || 'Unknown error'}`
      );
    } finally {
      setIsLoadingIdentityDoc(false);
    }
  };

  // Save identity document via AI tool call
  const handleSaveIdentityDocument = async () => {
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    // Validate at least one field is filled
    if (
      !dreamSelf &&
      !traits &&
      !motivations &&
      !archetype &&
      !failureMode &&
      !coachingPreference
    ) {
      Alert.alert('Error', 'Please fill in at least one field');
      return;
    }

    setIsSavingIdentityDoc(true);
    try {
      // Build message for AI tool call
      const fields = [];
      if (dreamSelf) fields.push(`dream self: "${dreamSelf}"`);
      if (traits)
        fields.push(
          `traits: ${traits
            .split(',')
            .map((t) => `"${t.trim()}"`)
            .join(', ')}`
        );
      if (motivations)
        fields.push(
          `motivations: ${motivations
            .split(',')
            .map((m) => `"${m.trim()}"`)
            .join(', ')}`
        );
      if (archetype) fields.push(`archetype: "${archetype}"`);
      if (failureMode) fields.push(`failure mode: "${failureMode}"`);
      if (coachingPreference) fields.push(`coaching preference: "${coachingPreference}"`);

      const message = `Update my identity document with: ${fields.join(', ')}`;

      // ✅ FIX: Use correct endpoint and enable tools
      const result = await apiClient.post('/api/ai-chat/messages', {
        message,
        conversation_id: null, // Start new conversation
        include_context: true,
        enable_tools: true, // ✅ CRITICAL: Enable tool calling
      });

      if (result.data?.data) {
        Alert.alert(
          '✅ Identity Document Saved!',
          'AI tool calling worked! Your identity document has been updated via AI.\n\nCheck AI Chat tab to see the full conversation.',
          [{ text: 'OK' }]
        );
        // Reload to show updated values
        await loadIdentityDocument();
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('[DEV_TOOLS] Save identity doc error:', error);
      Alert.alert(
        'Error',
        `Failed to save identity document:\n\n${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSavingIdentityDoc(false);
    }
  };

  // Load identity document on mount
  useEffect(() => {
    if (user) {
      loadIdentityDocument();
    }
  }, [user]);

  // Handle reset in-app onboarding
  const handleResetOnboarding = async () => {
    try {
      console.log('[DEV_TOOLS] 🔄 Resetting in-app onboarding...');

      // Step 1: Archive all active goals
      if (user) {
        console.log('[DEV_TOOLS] 📦 Archiving all active goals...');
        const { supabase } = await import('@lib/supabase');

        // Get user_profiles.id from auth_user_id
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error('User profile not found');
        }

        const userId = profileData.id;

        // Archive all active goals
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active');

        if (goalsError) {
          console.error('[DEV_TOOLS] ❌ Error fetching goals:', goalsError);
        } else if (goals && goals.length > 0) {
          const { error: updateError } = await supabase
            .from('goals')
            .update({ status: 'archived' })
            .eq('user_id', userId)
            .eq('status', 'active');

          if (updateError) {
            console.error('[DEV_TOOLS] ❌ Error archiving goals:', updateError);
          } else {
            console.log(`[DEV_TOOLS] ✅ Archived ${goals.length} goals`);
          }
        }

        // Clear query cache for goals and binds
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.invalidateQueries({ queryKey: ['binds'] });
      }

      // Step 2: Reset onboarding state
      await resetOnboarding();
      console.log('[DEV_TOOLS] ✅ In-app onboarding reset complete');

      Alert.alert(
        '✅ Onboarding Reset!',
        'In-app onboarding has been reset and all needles have been archived.\n\nYou can now start fresh with the tutorial.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigate to index to trigger redirect
              router.replace('/');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] ❌ Reset onboarding error:', error);
      Alert.alert('Error', error.message || 'Failed to reset onboarding');
    }
  };

  // Handle skip tutorial
  const handleSkipTutorial = async () => {
    try {
      await skipTutorial();
      Alert.alert(
        '✅ Tutorial Skipped!',
        'In-app tutorial marked as complete. You can now navigate freely.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] Skip tutorial error:', error);
      Alert.alert('Error', error.message || 'Failed to skip tutorial');
    }
  };

  // Debug: Show raw AsyncStorage value
  const handleShowStorageValue = async () => {
    try {
      const STORAGE_KEY = '@weave:in_app_onboarding_state';
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      Alert.alert(
        '📂 AsyncStorage Value',
        stored
          ? `Stored state:\n\n${JSON.stringify(JSON.parse(stored), null, 2)}`
          : 'No stored state found (will use defaults)',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] Show storage error:', error);
      Alert.alert('Error', error.message || 'Failed to read storage');
    }
  };

  // Debug: Manually clear AsyncStorage
  const handleClearStorage = async () => {
    try {
      const STORAGE_KEY = '@weave:in_app_onboarding_state';
      await AsyncStorage.removeItem(STORAGE_KEY);

      Alert.alert(
        '🗑️ Storage Cleared!',
        'AsyncStorage value deleted. App will use defaults on next load.\n\nClose and reopen the app to test.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigate to index to trigger redirect
              router.replace('/');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[DEV_TOOLS] Clear storage error:', error);
      Alert.alert('Error', error.message || 'Failed to clear storage');
    }
  };

  // Manually set onboarding step (for testing)
  const handleSetStep = async (step: string) => {
    try {
      await setStep(step as any);
      Alert.alert('✅ Step Changed', `Current step is now: ${step}`, [{ text: 'OK' }]);
    } catch (error: any) {
      console.error('[DEV_TOOLS] Set step error:', error);
      Alert.alert('Error', error.message || 'Failed to set step');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing[5] }}>
          <Button variant="ghost" onPress={() => router.back()}>
            ← Back
          </Button>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginTop: spacing[3] }}
          >
            Dev Tools
          </Heading>
          <Body style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
            Testing and debugging utilities
          </Body>
        </View>

        {/* Voice & Camera Testing */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Voice & Camera Testing
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={() => router.push('/(tabs)/voice-demo')}>
              🎤 Voice Demo
            </Button>

            <Button variant="secondary" onPress={() => router.push('/(tabs)/captures')}>
              📸 Capture Picture
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Test voice recording and photo capture functionality.
          </Body>
        </Card>

        {/* Navigation */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Navigation
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={() => router.push('/(onboarding)/welcome')}>
              🎯 Onboarding Flow
            </Button>

            <Button variant="secondary" onPress={() => router.push('/(tabs)/sitemap')}>
              🗺️ Site Map (All Screens)
            </Button>

            <Button
              variant="secondary"
              onPress={() => router.push('/(tabs)/settings/tool-testing')}
            >
              🔧 Tool Testing Page
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Jump to Onboarding flow to review/test the complete user signup experience (Epic 1:
            Welcome → Emotional State → Identity Bootup → Origin Story → First Needle).
          </Body>
        </Card>

        {/* In-App Onboarding */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            📚 In-App Tutorial
          </Heading>

          {/* Current Status */}
          <View
            style={{
              padding: spacing[3],
              backgroundColor: isOnboardingComplete
                ? colors.emerald[500] + '20'
                : colors.accent[500] + '20',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isOnboardingComplete ? colors.emerald[500] : colors.accent[500],
              marginBottom: spacing[3],
            }}
          >
            <Body
              style={{
                color: isOnboardingComplete ? colors.emerald[500] : colors.accent[500],
                fontWeight: '600',
              }}
            >
              {isOnboardingComplete ? '✅ Tutorial Complete' : '📍 Current Step'}
            </Body>
            <Body
              style={{
                color: colors.text.secondary,
                fontSize: 12,
                marginTop: spacing[1],
              }}
            >
              {isSkipped && 'Tutorial was skipped'}
              {!isSkipped && !isOnboardingComplete && `Step: ${currentStep}`}
              {!isSkipped && isOnboardingComplete && 'All tutorial steps completed!'}
            </Body>
          </View>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={handleResetOnboarding}>
              🔄 Reset Tutorial
            </Button>

            {!isOnboardingComplete && (
              <Button variant="secondary" onPress={handleSkipTutorial}>
                ⏭️ Skip Tutorial
              </Button>
            )}

            <Button variant="secondary" onPress={() => router.push('/needles/create')}>
              ➕ Go to Create Needle
            </Button>

            {/* Debug buttons */}
            <View style={{ marginTop: spacing[2], gap: spacing[2] }}>
              <Button variant="ghost" onPress={handleShowStorageValue}>
                🔍 Show Raw Storage Value
              </Button>
              <Button variant="ghost" onPress={handleClearStorage}>
                🗑️ Clear Storage (Force Reset)
              </Button>
            </View>

            {/* Manual Step Control (Advanced Testing) */}
            <View style={{ marginTop: spacing[4] }}>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                  fontWeight: '600',
                }}
              >
                🎯 Jump to Step (Testing Only)
              </Body>
              <View style={{ gap: spacing[2] }}>
                <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="ghost"
                      onPress={() => handleSetStep('create_first_needle')}
                      style={{ paddingVertical: 8 }}
                    >
                      1. Create Needle
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="ghost"
                      onPress={() => handleSetStep('home_page_tour')}
                      style={{ paddingVertical: 8 }}
                    >
                      2. Home Tour
                    </Button>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="ghost"
                      onPress={() => handleSetStep('dashboard_tour')}
                      style={{ paddingVertical: 8 }}
                    >
                      3. Dashboard
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="ghost"
                      onPress={() => handleSetStep('completed')}
                      style={{ paddingVertical: 8 }}
                    >
                      4. Completed
                    </Button>
                  </View>
                </View>
              </View>
              <Body style={{ color: colors.text.muted, marginTop: spacing[2], fontSize: 11 }}>
                Manually jump to any onboarding step for quick testing. After setting step, navigate
                to the relevant screen to see tooltips.
              </Body>
            </View>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Reset to test the in-app tutorial flow from the beginning. After reset, the app will
            redirect you to create your first needle with an onboarding tooltip.
            {'\n\n'}
            Tutorial Steps: Create First Needle → Home Tour → Dashboard Tour → Complete First Bind →
            View Progress → Write First Journal
          </Body>
        </Card>

        {/* Cache Management */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Cache Management
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={handleClearAllCaches}>
              Clear All Caches
            </Button>

            <Button variant="secondary" onPress={handleInvalidateBinds}>
              Invalidate Today's Binds
            </Button>

            <Button variant="secondary" onPress={handleTestDateChange}>
              🧪 Test Date Change Fix
            </Button>

            <Button variant="secondary" onPress={handleLogQueries}>
              Log Active Queries
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Use "Clear All Caches" when data seems stale or incorrect. This forces a fresh fetch
            from the API.
          </Body>
        </Card>

        {/* Admin Mode */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Admin Mode
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button
              variant={adminModeEnabled ? 'destructive' : 'primary'}
              onPress={handleToggleAdminMode}
            >
              {adminModeEnabled ? '🔓 Disable Admin Mode' : '🔒 Enable Admin Mode'}
            </Button>

            {adminModeEnabled && (
              <View
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.accent.warning + '20',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.accent.warning,
                }}
              >
                <Body
                  style={{
                    color: colors.accent.warning,
                    fontWeight: '600',
                  }}
                >
                  ⚠️ ADMIN MODE ACTIVE
                </Body>
                <Body
                  style={{
                    color: colors.text.secondary,
                    fontSize: 12,
                    marginTop: spacing[1],
                  }}
                >
                  • Unlimited AI requests (no rate limits){'\n'}• All admin endpoints accessible
                  {'\n'}• Development only - DO NOT use in production
                </Body>
              </View>
            )}
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Enable admin mode to bypass rate limits during testing. This uses the dev admin key and
            grants unlimited access to AI endpoints.
          </Body>
        </Card>

        {/* Magic Admin Tools */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            🪄 Magic Admin Tools
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button variant="primary" onPress={handleResetRateLimit}>
              🔄 Reset My Rate Limits
            </Button>

            <Button variant="secondary" onPress={handleUpgradeToAdmin}>
              ⚡ Upgrade to Admin Account
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Magic buttons to fix rate limit issues during development. Reset clears today's usage,
            Upgrade gives you unlimited requests permanently.
          </Body>
        </Card>

        {/* Identity Document Editor */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Identity Document Editor
          </Heading>

          <Body style={{ color: colors.text.muted, marginBottom: spacing[3], fontSize: 12 }}>
            Edit your Dream Self identity document and test AI tool calling. The AI can
            automatically update these fields via tool use.
          </Body>

          <View style={{ gap: spacing[3] }}>
            {/* Dream Self */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Dream Self Name
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., Alex the Disciplined"
                placeholderTextColor={colors.text.muted}
                value={dreamSelf}
                onChangeText={setDreamSelf}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Traits */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Traits (comma-separated)
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., analytical, supportive, direct"
                placeholderTextColor={colors.text.muted}
                value={traits}
                onChangeText={setTraits}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Motivations */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Motivations (comma-separated)
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., Build financial freedom, Master my craft"
                placeholderTextColor={colors.text.muted}
                value={motivations}
                onChangeText={setMotivations}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Archetype */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Archetype
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., The Builder, The Learner, The Optimizer"
                placeholderTextColor={colors.text.muted}
                value={archetype}
                onChangeText={setArchetype}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Failure Mode */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Failure Mode
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., Analysis paralysis, Scattered focus"
                placeholderTextColor={colors.text.muted}
                value={failureMode}
                onChangeText={setFailureMode}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Coaching Preference */}
            <View>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: '600',
                }}
              >
                Coaching Preference
              </Body>
              <TextInput
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  padding: spacing[3],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
                placeholder="e.g., Direct but encouraging, Gentle accountability"
                placeholderTextColor={colors.text.muted}
                value={coachingPreference}
                onChangeText={setCoachingPreference}
                editable={!isLoadingIdentityDoc && !isSavingIdentityDoc}
              />
            </View>

            {/* Action Buttons */}
            <Button
              variant="secondary"
              onPress={loadIdentityDocument}
              disabled={isLoadingIdentityDoc || isSavingIdentityDoc || !user}
            >
              {isLoadingIdentityDoc ? '⏳ Loading...' : '🔄 Reload Current'}
            </Button>

            <Button
              variant="primary"
              onPress={handleSaveIdentityDocument}
              disabled={isLoadingIdentityDoc || isSavingIdentityDoc || !user}
            >
              {isSavingIdentityDoc ? '⏳ Saving via AI...' : '🤖 Save via AI Tool Call'}
            </Button>

            <Button
              variant="ghost"
              onPress={() => {
                setDreamSelf('');
                setTraits('');
                setMotivations('');
                setArchetype('');
                setFailureMode('');
                setCoachingPreference('');
              }}
              disabled={isLoadingIdentityDoc || isSavingIdentityDoc}
            >
              Clear Form
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            💡 This tests AI tool calling! When you click "Save via AI Tool Call", the AI Chat
            system will use the modify_identity_document tool to update your profile.
            {!user && '\n\n⚠️ You must be logged in to edit identity documents.'}
          </Body>
        </Card>

        {/* Push Notifications */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Push Notifications
          </Heading>

          <View style={{ gap: spacing[3] }}>
            <Button
              variant="primary"
              onPress={handleSendTestNotification}
              disabled={isSendingNotification || !user}
            >
              {isSendingNotification ? '⏳ Sending...' : '🔔 Send Test Notification'}
            </Button>
          </View>

          <Body style={{ color: colors.text.muted, marginTop: spacing[3], fontSize: 12 }}>
            Sends a test push notification to this device. Useful for testing check-in notifications
            and notification handling.
            {!user && '\n\n⚠️ You must be logged in to send test notifications.'}
          </Body>
        </Card>

        {/* Database Info */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Info
          </Heading>

          <Body style={{ color: colors.text.secondary, lineHeight: 20 }}>
            • Clear cache when bind completion status seems wrong{'\n'}• Check console for detailed
            query logs{'\n'}• Invalidate specific queries for targeted refresh
          </Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});
