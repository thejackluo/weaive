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
import { Button, Text, useTheme } from '@/design-system';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessibilityRole="article"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displayMd" weight="bold" style={{ color: colors.text.primary }}>
            Privacy Policy
          </Text>
          <View style={[styles.badge, { backgroundColor: `${colors.accent[500]}20` }]}>
            <Text variant="textXs" style={{ color: colors.accent[400] }}>
              Last updated: December 19, 2024
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.primary }]}>
            At Weave, we are committed to protecting your privacy and being transparent about how we
            collect, use, and protect your personal information. This Privacy Policy explains our
            data practices in detail.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            By using Weave, you agree to the terms of this Privacy Policy. If you do not agree,
            please do not use our service.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            <Text weight="semibold" style={{ color: colors.text.primary }}>
              Contact Us:{' '}
            </Text>
            privacy@weavelight.com | support@weavelight.com
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            1. Information We Collect
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We collect several types of information to provide and improve our service:
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Account Information
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Email address (for authentication and communication)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • User profile (name, timezone, preferences)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • OAuth provider data (if you sign in with Apple or Google)
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Identity & Goals Data
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Archetype selection (your starting identity type)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Dream Self description (your aspirational identity)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Personal motivations and constraints
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Goals, Q-goals (quantifiable goals), and subtasks (your "Needles" and "Binds")
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. Progress & Activity Data
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Subtask completions (immutable event logs for progress integrity)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Daily journal entries with fulfillment scores
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Reflections and personal notes
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Consistency metrics, streaks, and progress ranks
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            D. Proof Captures
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Photos of completed tasks
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Audio recordings (optional voice notes)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Text notes attached to completions
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            E. Technical Data
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Device information (type, OS version, device ID)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • IP address and approximate location (for fraud prevention)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • App usage analytics (screens viewed, features used)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Push notification tokens (for habit reminders)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Error logs and crash reports (for debugging)
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            2. How We Use Your Information
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We use your information for the following purposes:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Provide core app functionality (goal tracking, habit formation, progress
              visualization)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Generate personalized AI coaching and daily plans ("Triads")
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Calculate progress metrics (consistency percentages, streaks, ranks)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Send push notifications for habit reminders and daily check-ins
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Improve app performance and user experience
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Detect and prevent fraud, abuse, or security incidents
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Comply with legal obligations and enforce our Terms of Service
            </Text>
          </View>
        </View>

        {/* Section 3 - AI Processing (Important) */}
        <View
          style={[
            styles.section,
            { backgroundColor: `${colors.amber[500]}15`, padding: 16, borderRadius: 12 },
          ]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.amber[400] }}>
            3. AI Processing & Third-Party Services
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave uses advanced AI models to provide personalized coaching. Here's exactly how your
            data is processed:
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. AI Providers
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">OpenAI</Text> (GPT-4o, GPT-4o-mini) for daily plans and
              quick insights
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Anthropic</Text> (Claude 3.7 Sonnet, Claude 3.5 Haiku) for
              onboarding and deep coaching
            </Text>
          </View>

          <View
            style={{
              backgroundColor: `${colors.emerald[500]}20`,
              marginTop: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text variant="textSm" weight="semibold" style={{ color: colors.emerald[400] }}>
              🔒 Your Privacy Protections:
            </Text>
            <View style={styles.bulletList}>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✓ Your data is sent to AI providers ONLY when generating AI responses
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✓ Your data is NOT used to train AI models
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✓ AI providers do NOT retain your data after processing
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✓ All AI communications are encrypted in transit (TLS 1.3)
              </Text>
            </View>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Infrastructure Providers
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Supabase</Text> (database, authentication, file storage)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Railway</Text> (backend API hosting)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Expo Push</Text> (iOS push notifications via Apple Push
              Notification Service)
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. Future Services (Post-MVP)
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • PostHog (analytics, added after 500+ users)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Sentry (error tracking, added after 500+ users)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: spacing[3], color: colors.text.secondary }]}
          >
            All third-party services operate under strict confidentiality agreements and comply with
            applicable data protection laws.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            4. Data Storage & Security
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We implement industry-standard security measures to protect your data:
          </Text>

          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Encryption at Rest:</Text> AES-256 encryption for database
              storage
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Encryption in Transit:</Text> TLS 1.3 for all API
              communications
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Secure Token Storage:</Text> JWT tokens stored in
              device-encrypted keychain (NEVER plain text)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Access Controls:</Text> Strict need-to-know basis for team
              members
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Regular Audits:</Text> Security audits and penetration
              testing
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Immutable Logs:</Text> Completion events cannot be edited or
              deleted (ensures integrity of progress tracking)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: spacing[3], color: colors.text.secondary }]}
          >
            However, no system is 100% secure. We cannot guarantee absolute security, but we
            continuously work to improve our protections.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            5. Data Sharing & Disclosure
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We respect your privacy and have strict policies about data sharing:
          </Text>

          <View
            style={{
              backgroundColor: `${colors.emerald[500]}20`,
              marginBottom: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text variant="textBase" weight="semibold" style={{ color: colors.emerald[400] }}>
              What We DON'T Do:
            </Text>
            <View style={styles.bulletList}>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✗ We do NOT sell your personal data
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✗ We do NOT use your data for advertising
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                ✗ We do NOT share your data with data brokers
              </Text>
            </View>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Limited Sharing With Service Providers:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • AI providers (OpenAI, Anthropic) for generating coaching responses
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Infrastructure providers (Supabase, Railway) for hosting and storage
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Push notification services (Expo Push, Apple APNs) for reminders
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Legal Compliance & Protection:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We may disclose your information if required by law, to comply with legal processes, to
            protect our rights and safety, or to investigate fraud and abuse.
          </Text>
        </View>

        {/* Section 6 - User Rights */}
        <View
          style={[
            styles.section,
            { backgroundColor: `${colors.accent[500]}15`, padding: 16, borderRadius: 12 },
          ]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            6. Your Rights & Control
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You have comprehensive rights over your data, depending on your location:
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. GDPR Rights (EU Users)
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Access:</Text> Request a copy of your personal data
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Rectification:</Text> Correct inaccurate or
              incomplete data
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Erasure:</Text> Delete your account and associated
              data ("right to be forgotten")
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Object:</Text> Object to certain data processing
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Data Portability:</Text> Export your data in
              machine-readable format
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Complain:</Text> Lodge a complaint with your local
              supervisory authority
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. CCPA Rights (California Users)
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Know:</Text> Know what personal data we collect and
              how it's used
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Delete:</Text> Request deletion of your personal
              data
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Opt-Out:</Text> Opt-out of data "sales" (we don't
              sell data)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Right to Non-Discrimination:</Text> No discrimination for
              exercising your rights
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. How to Exercise Your Rights:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              1. <Text weight="semibold">In-App Settings:</Text> Export data or delete account via
              Settings → Privacy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              2. <Text weight="semibold">Email Request:</Text> Contact privacy@weavelight.com or
              support@weavelight.com
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              3. <Text weight="semibold">Response Time:</Text> We respond within 30 days of verified
              requests
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            7. Data Retention
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We retain your data according to the following policies:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Active Account:</Text> Data retained as long as your account
              is active
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">After Deletion:</Text> Most data deleted within 30 days of
              account closure
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Legal Retention:</Text> Some data retained for
              legal/regulatory purposes (e.g., financial records for tax compliance)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Immutable Logs:</Text> Completion events retained for
              statistical integrity, but anonymized after 90 days of account deletion
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Backups:</Text> Data may persist in backups for up to 90
              days but is not accessible
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            8. Children's Privacy
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave is intended for users aged <Text weight="semibold">13 years and older</Text> in
            compliance with COPPA (Children's Online Privacy Protection Act).
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We do not knowingly collect personal information from children under 13
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Parental consent is recommended for users under 18
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • If we learn a child under 13 has provided data, we immediately delete it
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Parents can contact us at privacy@weavelight.com to request deletion
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            9. International Data Transfers
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave is based in the United States. If you access our service from outside the US, your
            data may be transferred to, stored, and processed in the US.
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Primary Storage:</Text> United States (via Supabase,
              Railway)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">GDPR Safeguards:</Text> Standard Contractual Clauses (SCCs)
              for EU data transfers
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Data Protection:</Text> Same protections apply regardless of
              location
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            By using Weave, you consent to the transfer of your information to the United States and
            other countries where we operate.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            10. Cookies & Tracking
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            As a native mobile app, Weave does NOT use browser cookies. However, we collect some
            device information:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Device Identifiers:</Text> For analytics and crash reporting
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Push Tokens:</Text> Stored for delivering notifications
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Local Storage:</Text> App preferences and cached data stored
              on your device
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You can control tracking via your device settings (iOS: Settings → Privacy → Tracking).
          </Text>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            11. Data Breach Notification
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            In the unlikely event of a data breach that affects your personal information:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We will notify you within 72 hours of discovering the breach (GDPR requirement)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Notification will be sent via email and in-app alert
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We will describe the nature of the breach and steps taken to mitigate harm
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We will notify relevant regulatory authorities as required by law
            </Text>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            12. Changes to This Privacy Policy
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We may update this Privacy Policy from time to time to reflect changes in our practices
            or legal requirements.
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Updates will be posted in the app and at weavelight.com/privacy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Significant changes will be communicated via email
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Continued use after updates = acceptance of new terms
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Material changes will take effect 30 days after notification
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We encourage you to review this Privacy Policy periodically to stay informed about how
            we protect your data.
          </Text>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            13. Contact Us
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </Text>
          <View style={{ backgroundColor: `${colors.dark[800]}40`, padding: 16, borderRadius: 12 }}>
            <View style={styles.bulletList}>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  Privacy Inquiries:
                </Text>{' '}
                privacy@weavelight.com
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  General Support:
                </Text>{' '}
                support@weavelight.com
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  Data Rights Requests:
                </Text>{' '}
                privacy@weavelight.com
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
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
            variant="textSm"
            style={{ textAlign: 'center', marginBottom: spacing[4], color: colors.text.secondary }}
          >
            By using Weave, you acknowledge that you have read and understood this Privacy Policy
            and agree to its terms.
          </Text>
          <Button variant="secondary" size="lg" onPress={() => router.back()} fullWidth>
            Go Back
          </Button>
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
