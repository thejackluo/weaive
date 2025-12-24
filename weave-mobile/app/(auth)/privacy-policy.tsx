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
import { Text, TouchableOpacity } from 'react-native';

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
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#ffffff' }}>
            Privacy Policy
          </Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.13)' }]}>
            <Text style={{ fontSize: 12, color: '#60a5fa' }}>
              Last updated: December 19, 2024
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.paragraph, { fontSize: 16, color: '#ffffff' }]}>
            At Weave, we are committed to protecting your privacy and being transparent about how we
            collect, use, and protect your personal information. This Privacy Policy explains our
            data practices in detail.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By using Weave, you agree to the terms of this Privacy Policy. If you do not agree,
            please do not use our service.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            <Text style={{ fontWeight: '600', color: '#ffffff' }}>
              Contact Us:{' '}
            </Text>
            privacy@weavelight.com | support@weavelight.com
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            1. Information We Collect
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We collect several types of information to provide and improve our service:
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Account Information
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Email address (for authentication and communication)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • User profile (name, timezone, preferences)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • OAuth provider data (if you sign in with Apple or Google)
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Identity & Goals Data
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Archetype selection (your starting identity type)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Dream Self description (your aspirational identity)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Personal motivations and constraints
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Goals, Q-goals (quantifiable goals), and subtasks (your "Needles" and "Binds")
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Progress & Activity Data
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Subtask completions (immutable event logs for progress integrity)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Daily journal entries with fulfillment scores
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Reflections and personal notes
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Consistency metrics, streaks, and progress ranks
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            D. Proof Captures
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Photos of completed tasks
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Audio recordings (optional voice notes)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Text notes attached to completions
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            E. Technical Data
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Device information (type, OS version, device ID)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • IP address and approximate location (for fraud prevention)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • App usage analytics (screens viewed, features used)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Push notification tokens (for habit reminders)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Error logs and crash reports (for debugging)
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We use your information for the following purposes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Provide core app functionality (goal tracking, habit formation, progress
              visualization)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Generate personalized AI coaching and daily plans ("Triads")
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Calculate progress metrics (consistency percentages, streaks, ranks)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Send push notifications for habit reminders and daily check-ins
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Improve app performance and user experience
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Detect and prevent fraud, abuse, or security incidents
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Comply with legal obligations and enforce our Terms of Service
            </Text>
          </View>
        </View>

        {/* Section 3 - AI Processing (Important) */}
        <View
          style={[
            styles.section,
            { backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fbbf24' }}>
            3. AI Processing & Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave uses advanced AI models to provide personalized coaching. Here's exactly how your
            data is processed:
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. AI Providers
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>OpenAI</Text> (GPT-4o, GPT-4o-mini) for daily plans and
              quick insights
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Anthropic</Text> (Claude 3.7 Sonnet, Claude 3.5 Haiku) for
              onboarding and deep coaching
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.13)',
              marginTop: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#34d399' }}>
              🔒 Your Privacy Protections:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ Your data is sent to AI providers ONLY when generating AI responses
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ Your data is NOT used to train AI models
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ AI providers do NOT retain your data after processing
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✓ All AI communications are encrypted in transit (TLS 1.3)
              </Text>
            </View>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Infrastructure Providers
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Supabase</Text> (database, authentication, file storage)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Railway</Text> (backend API hosting)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Expo Push</Text> (iOS push notifications via Apple Push
              Notification Service)
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Future Services (Post-MVP)
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • PostHog (analytics, added after 500+ users)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Sentry (error tracking, added after 500+ users)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            All third-party services operate under strict confidentiality agreements and comply with
            applicable data protection laws.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            4. Data Storage & Security
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We implement industry-standard security measures to protect your data:
          </Text>

          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Encryption at Rest:</Text> AES-256 encryption for database
              storage
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Encryption in Transit:</Text> TLS 1.3 for all API
              communications
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Secure Token Storage:</Text> JWT tokens stored in
              device-encrypted keychain (NEVER plain text)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Access Controls:</Text> Strict need-to-know basis for team
              members
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Regular Audits:</Text> Security audits and penetration
              testing
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Immutable Logs:</Text> Completion events cannot be edited or
              deleted (ensures integrity of progress tracking)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            However, no system is 100% secure. We cannot guarantee absolute security, but we
            continuously work to improve our protections.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            5. Data Sharing & Disclosure
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We respect your privacy and have strict policies about data sharing:
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.13)',
              marginBottom: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#34d399' }}>
              What We DON'T Do:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT sell your personal data
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT use your data for advertising
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                ✗ We do NOT share your data with data brokers
              </Text>
            </View>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Limited Sharing With Service Providers:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • AI providers (OpenAI, Anthropic) for generating coaching responses
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Infrastructure providers (Supabase, Railway) for hosting and storage
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Push notification services (Expo Push, Apple APNs) for reminders
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Legal Compliance & Protection:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We may disclose your information if required by law, to comply with legal processes, to
            protect our rights and safety, or to investigate fraud and abuse.
          </Text>
        </View>

        {/* Section 6 - User Rights */}
        <View
          style={[
            styles.section,
            { backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            6. Your Rights & Control
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You have comprehensive rights over your data, depending on your location:
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. GDPR Rights (EU Users)
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Access:</Text> Request a copy of your personal data
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Rectification:</Text> Correct inaccurate or
              incomplete data
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Erasure:</Text> Delete your account and associated
              data ("right to be forgotten")
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Object:</Text> Object to certain data processing
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Data Portability:</Text> Export your data in
              machine-readable format
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Complain:</Text> Lodge a complaint with your local
              supervisory authority
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. CCPA Rights (California Users)
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Know:</Text> Know what personal data we collect and
              how it's used
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Delete:</Text> Request deletion of your personal
              data
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Opt-Out:</Text> Opt-out of data "sales" (we don't
              sell data)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Right to Non-Discrimination:</Text> No discrimination for
              exercising your rights
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. How to Exercise Your Rights:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              1. <Text style={{ fontWeight: '600' }}>In-App Settings:</Text> Export data or delete account via
              Settings → Privacy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              2. <Text style={{ fontWeight: '600' }}>Email Request:</Text> Contact privacy@weavelight.com or
              support@weavelight.com
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              3. <Text style={{ fontWeight: '600' }}>Response Time:</Text> We respond within 30 days of verified
              requests
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            7. Data Retention
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We retain your data according to the following policies:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Active Account:</Text> Data retained as long as your account
              is active
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>After Deletion:</Text> Most data deleted within 30 days of
              account closure
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Legal Retention:</Text> Some data retained for
              legal/regulatory purposes (e.g., financial records for tax compliance)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Immutable Logs:</Text> Completion events retained for
              statistical integrity, but anonymized after 90 days of account deletion
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Backups:</Text> Data may persist in backups for up to 90
              days but is not accessible
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            8. Children's Privacy
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is intended for users aged <Text style={{ fontWeight: '600' }}>13 years and older</Text> in
            compliance with COPPA (Children's Online Privacy Protection Act).
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We do not knowingly collect personal information from children under 13
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Parental consent is recommended for users under 18
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • If we learn a child under 13 has provided data, we immediately delete it
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Parents can contact us at privacy@weavelight.com to request deletion
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            9. International Data Transfers
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is based in the United States. If you access our service from outside the US, your
            data may be transferred to, stored, and processed in the US.
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Primary Storage:</Text> United States (via Supabase,
              Railway)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>GDPR Safeguards:</Text> Standard Contractual Clauses (SCCs)
              for EU data transfers
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Data Protection:</Text> Same protections apply regardless of
              location
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By using Weave, you consent to the transfer of your information to the United States and
            other countries where we operate.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            10. Cookies & Tracking
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            As a native mobile app, Weave does NOT use browser cookies. However, we collect some
            device information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Device Identifiers:</Text> For analytics and crash reporting
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Push Tokens:</Text> Stored for delivering notifications
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text style={{ fontWeight: '600' }}>Local Storage:</Text> App preferences and cached data stored
              on your device
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You can control tracking via your device settings (iOS: Settings → Privacy → Tracking).
          </Text>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            11. Data Breach Notification
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            In the unlikely event of a data breach that affects your personal information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will notify you within 72 hours of discovering the breach (GDPR requirement)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Notification will be sent via email and in-app alert
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will describe the nature of the breach and steps taken to mitigate harm
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We will notify relevant regulatory authorities as required by law
            </Text>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            12. Changes to This Privacy Policy
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We may update this Privacy Policy from time to time to reflect changes in our practices
            or legal requirements.
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Updates will be posted in the app and at weavelight.com/privacy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Significant changes will be communicated via email
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Continued use after updates = acceptance of new terms
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Material changes will take effect 30 days after notification
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We encourage you to review this Privacy Policy periodically to stay informed about how
            we protect your data.
          </Text>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            13. Contact Us
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </Text>
          <View style={{ backgroundColor: 'rgba(38, 38, 38, 0.25)', padding: 16, borderRadius: 12 }}>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  Privacy Inquiries:
                </Text>{' '}
                privacy@weavelight.com
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  General Support:
                </Text>{' '}
                support@weavelight.com
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  Data Rights Requests:
                </Text>{' '}
                privacy@weavelight.com
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  Response Time:
                </Text>{' '}
                Within 30 days
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            By using Weave, you acknowledge that you have read and understood this Privacy Policy
            and agree to its terms.
          </Text>
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
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              Go Back
            </Text>
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
