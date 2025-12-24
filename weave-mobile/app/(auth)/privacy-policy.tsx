/**
 * Privacy Policy Screen
 *
 * Story 0.3: Authentication Flow
 * Comprehensive Privacy Policy tailored to Weave's AI coaching architecture
 *
 * Features:
 * - GDPR and CCPA compliant
 * - Detailed AI processing transparency
 * - User rights and data control
 * - Beautiful typography and layout
 * - Card-based sections for readability
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text as RNText, TouchableOpacity } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: '#0a0a0a' }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <RNText style={{ fontSize: 32, fontWeight: '700', color: '#ffffff' }}>
            Privacy Policy
          </RNText>
          <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.13)' }]}>
            <RNText style={{ fontSize: 12, color: '#60a5fa' }}>
              Last updated: December 19, 2024
            </RNText>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <RNText style={[styles.paragraph, { fontSize: 16, color: '#ffffff' }]}>
            At Weave, we are committed to protecting your privacy and being transparent about how we
            collect, use, and protect your personal information. This Privacy Policy explains our
            data practices in detail.
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By using Weave, you agree to the terms of this Privacy Policy. If you do not agree,
            please do not use our service.
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            <RNText style={{ fontWeight: '600', color: '#ffffff' }}>
              Contact Us:{' '}
            </RNText>
            privacy@weavelight.com | support@weavelight.com
          </RNText>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            1. Information We Collect
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We collect several types of information to provide and improve our service:
          </RNText>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Account Information
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Email address (for authentication and communication)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • User profile (name, timezone, preferences)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • OAuth provider data (if you sign in with Apple or Google)
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Identity & Goals Data
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Archetype selection (your starting identity type)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Dream Self description (your aspirational identity)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Personal motivations and constraints
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Goals, Q-goals (quantifiable goals), and subtasks (your "Needles" and "Binds")
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Progress & Activity Data
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Subtask completions (immutable event logs for progress integrity)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Daily journal entries with fulfillment scores
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Reflections and personal notes
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Consistency metrics, streaks, and progress ranks
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            D. Proof Captures
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Photos of completed tasks
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Audio recordings (optional voice notes)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Text notes attached to completions
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            E. Technical Data
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Device information (type, OS version, device ID)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • IP address and approximate location (for fraud prevention)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • App usage analytics (screens viewed, features used)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Push notification tokens (for habit reminders)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Error logs and crash reports (for debugging)
            </RNText>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            2. How We Use Your Information
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We use your information for the following purposes:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Provide core app functionality (goal tracking, habit formation, progress
              visualization)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Generate personalized AI coaching and daily plans ("Triads")
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Calculate progress metrics (consistency percentages, streaks, ranks)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Send push notifications for habit reminders and daily check-ins
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Improve app performance and user experience
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Detect and prevent fraud, abuse, or security incidents
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Comply with legal obligations and enforce our Terms of Service
            </RNText>
          </View>
        </View>

        {/* Section 3 - AI Processing (Important) */}
        <View
          style={[
            styles.section,
            { backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#fbbf24' }}>
            3. AI Processing & Third-Party Services
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave uses advanced AI models to provide personalized coaching. Here's exactly how your
            data is processed:
          </RNText>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. AI Providers
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>OpenAI</RNText> (GPT-4o, GPT-4o-mini) for daily plans and
              quick insights
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Anthropic</RNText> (Claude 3.7 Sonnet, Claude 3.5 Haiku) for
              onboarding and deep coaching
            </RNText>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.13)',
              marginTop: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#34d399' }}>
              🔒 Your Privacy Protections:
            </RNText>
            <View style={styles.bulletList}>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ Your data is sent to AI providers ONLY when generating AI responses
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ Your data is NOT used to train AI models
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ AI providers do NOT retain your data after processing
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ All AI communications are encrypted in transit (TLS 1.3)
              </RNText>
            </View>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Infrastructure Providers
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Supabase</RNText> (database, authentication, file storage)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Railway</RNText> (backend API hosting)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Expo Push</RNText> (iOS push notifications via Apple Push
              Notification Service)
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Future Services (Post-MVP)
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • PostHog (analytics, added after 500+ users)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Sentry (error tracking, added after 500+ users)
            </RNText>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            All third-party services operate under strict confidentiality agreements and comply with
            applicable data protection laws.
          </RNText>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            4. Data Storage & Security
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We implement industry-standard security measures to protect your data:
          </RNText>

          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Encryption at Rest:</RNText> AES-256 encryption for database
              storage
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Encryption in Transit:</RNText> TLS 1.3 for all API
              communications
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Secure Token Storage:</RNText> JWT tokens stored in
              device-encrypted keychain (NEVER plain text)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Access Controls:</RNText> Strict need-to-know basis for team
              members
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Regular Audits:</RNText> Security audits and penetration
              testing
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Immutable Logs:</RNText> Completion events cannot be edited or
              deleted (ensures integrity of progress tracking)
            </RNText>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            However, no system is 100% secure. We cannot guarantee absolute security, but we
            continuously work to improve our protections.
          </RNText>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            5. Data Sharing & Disclosure
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We respect your privacy and have strict policies about data sharing:
          </RNText>

          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.13)',
              marginBottom: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <RNText style={{ fontSize: 16, fontWeight: '600', color: '#34d399' }}>
              What We DON'T Do:
            </RNText>
            <View style={styles.bulletList}>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT sell your personal data
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT use your data for advertising
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT share your data with data brokers
              </RNText>
            </View>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Limited Sharing With Service Providers:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • AI providers (OpenAI, Anthropic) for generating coaching responses
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Infrastructure providers (Supabase, Railway) for hosting and storage
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Push notification services (Expo Push, Apple APNs) for reminders
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Legal Compliance & Protection:
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We may disclose your information if required by law, to comply with legal processes, to
            protect our rights and safety, or to investigate fraud and abuse.
          </RNText>
        </View>

        {/* Section 6 - User Rights */}
        <View
          style={[
            styles.section,
            { backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            6. Your Rights & Control
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You have comprehensive rights over your data, depending on your location:
          </RNText>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. GDPR Rights (EU Users)
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Access:</RNText> Request a copy of your personal data
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Rectification:</RNText> Correct inaccurate or
              incomplete data
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Erasure:</RNText> Delete your account and associated
              data ("right to be forgotten")
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Object:</RNText> Object to certain data processing
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Data Portability:</RNText> Export your data in
              machine-readable format
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Complain:</RNText> Lodge a complaint with your local
              supervisory authority
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. CCPA Rights (California Users)
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Know:</RNText> Know what personal data we collect and
              how it's used
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Delete:</RNText> Request deletion of your personal
              data
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Opt-Out:</RNText> Opt-out of data "sales" (we don't
              sell data)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Right to Non-Discrimination:</RNText> No discrimination for
              exercising your rights
            </RNText>
          </View>

          <RNText
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. How to Exercise Your Rights:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              1. <RNText style={{ fontWeight: '600' }}>In-App Settings:</RNText> Export data or delete account via
              Settings → Privacy
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              2. <RNText style={{ fontWeight: '600' }}>Email Request:</RNText> Contact privacy@weavelight.com or
              support@weavelight.com
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              3. <RNText style={{ fontWeight: '600' }}>Response Time:</RNText> We respond within 30 days of verified
              requests
            </RNText>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            7. Data Retention
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We retain your data according to the following policies:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Active Account:</RNText> Data retained as long as your account
              is active
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>After Deletion:</RNText> Most data deleted within 30 days of
              account closure
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Legal Retention:</RNText> Some data retained for
              legal/regulatory purposes (e.g., financial records for tax compliance)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Immutable Logs:</RNText> Completion events retained for
              statistical integrity, but anonymized after 90 days of account deletion
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Backups:</RNText> Data may persist in backups for up to 90
              days but is not accessible
            </RNText>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            8. Children's Privacy
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is intended for users aged <RNText style={{ fontWeight: '600' }}>13 years and older</RNText> in
            compliance with COPPA (Children's Online Privacy Protection Act).
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We do not knowingly collect personal information from children under 13
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Parental consent is recommended for users under 18
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • If we learn a child under 13 has provided data, we immediately delete it
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Parents can contact us at privacy@weavelight.com to request deletion
            </RNText>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            9. International Data Transfers
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is based in the United States. If you access our service from outside the US, your
            data may be transferred to, stored, and processed in the US.
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Primary Storage:</RNText> United States (via Supabase,
              Railway)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>GDPR Safeguards:</RNText> Standard Contractual Clauses (SCCs)
              for EU data transfers
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Data Protection:</RNText> Same protections apply regardless of
              location
            </RNText>
          </View>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By using Weave, you consent to the transfer of your information to the United States and
            other countries where we operate.
          </RNText>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            10. Cookies & Tracking
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            As a native mobile app, Weave does NOT use browser cookies. However, we collect some
            device information:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Device Identifiers:</RNText> For analytics and crash reporting
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Push Tokens:</RNText> Stored for delivering notifications
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <RNText style={{ fontWeight: '600' }}>Local Storage:</RNText> App preferences and cached data stored
              on your device
            </RNText>
          </View>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You can control tracking via your device settings (iOS: Settings → Privacy → Tracking).
          </RNText>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            11. Data Breach Notification
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            In the unlikely event of a data breach that affects your personal information:
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will notify you within 72 hours of discovering the breach (GDPR requirement)
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Notification will be sent via email and in-app alert
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will describe the nature of the breach and steps taken to mitigate harm
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will notify relevant regulatory authorities as required by law
            </RNText>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            12. Changes to This Privacy Policy
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We may update this Privacy Policy from time to time to reflect changes in our practices
            or legal requirements.
          </RNText>
          <View style={styles.bulletList}>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Updates will be posted in the app and at weavelight.com/privacy
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Significant changes will be communicated via email
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Continued use after updates = acceptance of new terms
            </RNText>
            <RNText style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Material changes will take effect 30 days after notification
            </RNText>
          </View>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We encourage you to review this Privacy Policy periodically to stay informed about how
            we protect your data.
          </RNText>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <RNText style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            13. Contact Us
          </RNText>
          <RNText style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </RNText>
          <View style={{ backgroundColor: 'rgba(38, 38, 38, 0.25)', padding: 16, borderRadius: 12 }}>
            <View style={styles.bulletList}>
              <RNText style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <RNText style={{ fontWeight: '600', color: '#ffffff' }}>
                  Privacy Inquiries:
                </RNText>{' '}
                privacy@weavelight.com
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <RNText style={{ fontWeight: '600', color: '#ffffff' }}>
                  General Support:
                </RNText>{' '}
                support@weavelight.com
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <RNText style={{ fontWeight: '600', color: '#ffffff' }}>
                  Data Rights Requests:
                </RNText>{' '}
                privacy@weavelight.com
              </RNText>
              <RNText style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <RNText style={{ fontWeight: '600', color: '#ffffff' }}>
                  Response Time:
                </RNText>{' '}
                Within 30 days
              </RNText>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <RNText
            style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            By using Weave, you acknowledge that you have read and understood this Privacy Policy
            and agree to its terms.
          </RNText>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => router.back()}
          >
            <RNText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              Go Back
            </RNText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 32,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 24,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bullet: {
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    marginTop: 16,
    paddingTop: 24,
  },
});
