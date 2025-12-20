/**
 * Terms of Service Screen
 *
 * Story 0.3: Authentication Flow
 * Comprehensive Terms of Service tailored to Weave's AI coaching architecture
 *
 * Features:
 * - Legally compliant terms covering all service aspects
 * - Strong AI coaching disclaimer (NOT medical advice)
 * - Acceptable use policy and user content licensing
 * - Limitation of liability and dispute resolution
 * - Beautiful typography and card-based layout
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from '@/design-system';

export default function TermsOfServiceScreen() {
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displayMd" weight="bold" style={{ color: colors.text.primary }}>
            Terms of Service
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
            Welcome to Weave! These Terms of Service ("Terms") govern your use of the Weave mobile
            application and related services (collectively, the "Service"). By creating an account
            or using the Service, you agree to be bound by these Terms.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Please read these Terms carefully. If you do not agree with any part of these Terms, you
            may not use the Service.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            <Text weight="semibold" style={{ color: colors.text.primary }}>
              Contact Us:{' '}
            </Text>
            legal@weavelight.com | support@weavelight.com
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            1. Acceptance of Terms
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            By accessing or using Weave, you confirm that:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You are at least 13 years old (or the age of majority in your jurisdiction)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You have the legal capacity to enter into binding contracts
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You agree to comply with these Terms and our Privacy Policy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • All information you provide is accurate and truthful
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We reserve the right to modify these Terms at any time. We will notify you of material
            changes via email or in-app notification. Your continued use of the Service after such
            changes constitutes acceptance of the updated Terms.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            2. Description of Service
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave is a goal achievement and habit formation mobile application that helps you:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Set and track personal goals ("Needles") and consistent actions ("Binds")
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Receive AI-powered coaching and personalized daily plans ("Triads")
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Capture proof of completed tasks with photos, notes, and audio
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Journal daily reflections with fulfillment scores
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Visualize progress through consistency metrics, streaks, and ranks
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Develop a stronger personal identity through the "Weave" journey
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            The Service is provided "as-is" and "as-available" without any warranties or guarantees
            of uptime, accuracy, or specific results.
          </Text>
        </View>

        {/* Section 3 - AI Disclaimer (CRITICAL) */}
        <View
          style={[
            styles.section,
            { backgroundColor: `${colors.rose[500]}15`, padding: 16, borderRadius: 12 },
          ]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.rose[400] }}>
            3. AI Coaching Disclaimer (CRITICAL - READ CAREFULLY)
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.primary }]}>
            <Text weight="bold">
              WEAVE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL, MENTAL HEALTH, OR THERAPEUTIC
              SERVICES.
            </Text>
          </Text>

          <View
            style={{
              backgroundColor: `${colors.rose[500]}25`,
              marginBottom: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text variant="textSm" weight="semibold" style={{ color: colors.rose[300] }}>
              ⚠️ Important Limitations:
            </Text>
            <View style={styles.bulletList}>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                • Weave's AI coaching is for personal development, NOT medical or mental health
                treatment
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                • Our AI coaches are NOT licensed therapists, counselors, or medical professionals
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                • AI-generated advice is based on patterns and algorithms, NOT personalized medical
                assessment
              </Text>
              <Text variant="textSm" style={[styles.bullet, { color: colors.text.secondary }]}>
                • You make your own decisions - we provide suggestions, not directives
              </Text>
            </View>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Mental Health Emergencies:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            If you are experiencing a mental health crisis, suicidal thoughts, or emergency:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Call 988</Text> (Suicide & Crisis Lifeline) in the US
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • <Text weight="semibold">Call 911</Text> for immediate emergency assistance
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Contact a licensed mental health professional or go to your nearest emergency room
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            When to Seek Professional Help:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave is not appropriate for, and you should consult licensed professionals for:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Depression, anxiety, or other mental health conditions
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Eating disorders or body dysmorphia
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Substance abuse or addiction
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Trauma, PTSD, or serious emotional distress
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Relationship or family therapy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Medical conditions or health-related goals requiring medical supervision
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: spacing[3], color: colors.text.secondary }]}
          >
            By using Weave, you acknowledge that you understand these limitations and agree that
            Weave and its creators are not liable for any decisions you make based on AI-generated
            content.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            4. User Accounts
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            To use Weave, you must create an account:
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Account Requirements:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Provide a valid email address and create a secure password
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Alternatively, sign in with Apple or Google (subject to their terms)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Provide accurate and complete information during onboarding
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • One account per person - do not create multiple accounts
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Account Security:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You are responsible for maintaining the confidentiality of your password
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You are responsible for all activities under your account
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Notify us immediately at support@weavelight.com of any unauthorized access
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We are not liable for losses due to unauthorized account use
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Account Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You may delete your account at any time via Settings → Privacy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may discontinue the Service with 30 days' notice
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Upon termination, most data is deleted within 30 days (see Privacy Policy)
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            5. Acceptable Use Policy
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You agree to use Weave in a lawful and respectful manner.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Permitted Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✓ Personal goal tracking and habit formation
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✓ Using AI coaching for self-improvement and personal development
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✓ Capturing and storing proof of your own completed tasks
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✓ Journaling your personal thoughts and reflections
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            Prohibited Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Impersonate others or provide false identity information
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Upload illegal, harmful, threatening, abusive, or offensive content
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Violate others' intellectual property, privacy, or publicity rights
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Use automated tools (bots, scrapers, spiders) to access the Service
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Reverse engineer, decompile, or hack the app or its systems
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Attempt to gain unauthorized access to other users' accounts or data
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Transmit viruses, malware, or other harmful code
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Use the Service for commercial purposes without written permission
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Circumvent usage limits, rate limits, or security measures
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              ✗ Interfere with or disrupt the Service or servers/networks connected to it
            </Text>
          </View>

          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Violation of this Acceptable Use Policy may result in immediate account suspension or
            termination, with or without notice.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            6. User-Generated Content
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Your Content Ownership:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You retain ownership of all content you create in Weave:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Goals, Q-goals, and subtasks
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Journal entries and reflections
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Photos, audio recordings, and notes
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Identity documents (archetype, dream self, motivations)
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. License You Grant to Us:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            By uploading content to Weave, you grant us a limited, non-exclusive, worldwide,
            royalty-free license to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Store, process, and display your content to provide the Service
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Send your content to AI providers (OpenAI, Anthropic) to generate coaching responses
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Create backups and ensure data reliability
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Calculate aggregate, anonymized statistics for service improvement
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            This license terminates when you delete your content or account (subject to retention
            policies in our Privacy Policy).
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. AI-Generated Content:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Daily plans ("Triads"), insights, and coaching messages are AI-generated
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • AI suggestions are recommendations, not commands - you decide what to do
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You can edit, ignore, or customize all AI-generated content
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Once you edit AI content, you own the modified version
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We do not guarantee accuracy, completeness, or appropriateness of AI outputs
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            D. Content Moderation:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We reserve the right (but have no obligation) to monitor user content
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may remove content that violates these Terms or applicable laws
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Report inappropriate content via in-app reporting (future feature)
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            7. Subscription & Payment (Future)
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave is currently free during early access. In the future, we may introduce paid
            subscription tiers:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Free tier: Basic goal tracking and limited AI coaching
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Paid tiers: Advanced features, unlimited AI coaching, priority support
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Billing: Monthly or annual subscriptions via Apple App Store or Google Play
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Cancellation: Cancel anytime; access continues until end of billing period
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Refunds: Subject to Apple/Google's refund policies
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Price changes: 30-day notice for existing subscribers
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Early access users may receive special pricing or lifetime access (details TBD).
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            8. Intellectual Property
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Our Intellectual Property:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave and its creators own all rights to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • The Weave name, logo, and branding
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • App design, interface, and user experience
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Source code, algorithms, and software architecture
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • AI prompts, training processes, and coaching methodologies
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Documentation, guides, and marketing materials
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            All rights not expressly granted to you are reserved by Weave.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Your Limited License:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We grant you a limited, non-exclusive, non-transferable, revocable license to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Use the Weave app for personal, non-commercial purposes
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Access and use features available to your account tier
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            This license terminates if you violate these Terms or if we terminate your account.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            9. Third-Party Services
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Weave integrates with third-party services, each subject to their own terms:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                OpenAI
              </Text>{' '}
              (GPT-4o, GPT-4o-mini) - see OpenAI Terms of Use
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Anthropic
              </Text>{' '}
              (Claude 3.7 Sonnet, Claude 3.5 Haiku) - see Anthropic Terms of Service
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Supabase
              </Text>{' '}
              (database, auth, storage) - see Supabase Terms
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Apple Sign-In
              </Text>{' '}
              - see Apple Terms and Conditions
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Google Sign-In
              </Text>{' '}
              - see Google Terms of Service
            </Text>
          </View>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            We are not responsible for third-party service failures, changes, or discontinuation.
            You use third-party services at your own risk.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            10. Data & Privacy
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Your privacy is important to us. Please review our Privacy Policy (linked from the
            signup screen) for complete details. Key points:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Immutable Logs:
              </Text>{' '}
              Completion events are permanent (integrity of progress tracking)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Encrypted Storage:
              </Text>{' '}
              JWT tokens in device keychain, AES-256 for database
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                AI Processing:
              </Text>{' '}
              Your data sent to OpenAI/Anthropic ONLY for responses
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                No AI Training:
              </Text>{' '}
              Your data is NOT used to train AI models
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Deletion:
              </Text>{' '}
              Most data deleted within 30 days of account closure
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Your Rights:
              </Text>{' '}
              Access, export, delete, and rectify your data (GDPR/CCPA)
            </Text>
          </View>
        </View>

        {/* Section 11 - Disclaimers & Liability */}
        <View
          style={[
            styles.section,
            { backgroundColor: `${colors.amber[500]}15`, padding: 16, borderRadius: 12 },
          ]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.amber[400] }}>
            11. Disclaimers & Limitation of Liability
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Service "As-Is":
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • No warranty of merchantability, fitness for a particular purpose, or
              non-infringement
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • No guarantee of accuracy, reliability, or completeness of AI-generated content
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • No guarantee of uninterrupted, secure, or error-free operation
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • No guarantee of specific results or outcomes from using the Service
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Limitation of Liability:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEAVE AND ITS CREATORS SHALL NOT BE LIABLE FOR:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Lost data, progress, or content (back up important information)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Service interruptions, downtime, or technical failures
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Decisions you make based on AI coaching or app suggestions
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Indirect, incidental, consequential, special, or punitive damages
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Damages arising from third-party services or integrations
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Any amount exceeding the fees you paid in the last 12 months (or $100 if using free
              tier)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: spacing[3], color: colors.text.secondary }]}
          >
            Some jurisdictions do not allow exclusion of certain warranties or limitations on
            liability. In such cases, our liability is limited to the maximum extent permitted by
            law.
          </Text>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            12. Indemnification
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You agree to defend, indemnify, and hold harmless Weave and its creators, employees, and
            agents from any claims, damages, losses, or expenses (including reasonable attorney
            fees) arising from:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Your use or misuse of the Service
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Your violation of these Terms or Privacy Policy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Your violation of others' rights (intellectual property, privacy, etc.)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Content you upload or create in the Service
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Any decisions you make based on AI-generated advice
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            13. Termination
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Termination by You:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Delete your account anytime via Settings → Privacy
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Export your data before deletion (30-day retention, then permanent deletion)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Canceling a paid subscription ends access at the end of the billing period
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Termination by Us:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may suspend service temporarily for maintenance or emergencies
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • We may discontinue the Service with 30 days' notice
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. Effect of Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Your access is immediately revoked
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Data is deleted per our Privacy Policy retention schedule
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Outstanding payments remain due
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Sections that should survive (disclaimers, liability, etc.) continue to apply
            </Text>
          </View>
        </View>

        {/* Section 14 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            14. Dispute Resolution
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            A. Informal Resolution:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Before filing any legal claim, please contact us at legal@weavelight.com to resolve the
            issue informally. We commit to good-faith efforts to resolve disputes.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            B. Binding Arbitration (US Users):
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            If informal resolution fails and you are a US user, disputes will be resolved through
            binding arbitration (not court):
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Arbitration administered by American Arbitration Association (AAA)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Conducted under AAA Consumer Arbitration Rules
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • Individual basis only - no class actions, representative actions, or consolidation
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              • You may opt out of arbitration within 30 days by emailing legal@weavelight.com
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            C. Small Claims Court:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You or we may bring a claim in small claims court if it qualifies and remains in that
            court.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            style={[styles.subsectionTitle, { color: colors.text.primary }]}
          >
            D. Class Action Waiver:
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            You waive your right to participate in class actions, class arbitrations, or
            representative actions against Weave.
          </Text>
        </View>

        {/* Section 15 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            15. Governing Law
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to conflict of law principles.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            For intellectual property disputes, US federal law applies.
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            International users: Local consumer protection laws may provide additional rights not
            waivable by these Terms.
          </Text>
        </View>

        {/* Section 16 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            16. Miscellaneous
          </Text>

          <View style={styles.bulletList}>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Severability:
              </Text>{' '}
              If any provision is invalid, the rest remains in effect
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                No Waiver:
              </Text>{' '}
              Our delay in enforcing rights doesn't waive them
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Assignment:
              </Text>{' '}
              We may transfer these Terms; you may not without our consent
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Entire Agreement:
              </Text>{' '}
              These Terms + Privacy Policy = complete agreement
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Force Majeure:
              </Text>{' '}
              Not liable for events beyond reasonable control (acts of God, war, natural disasters,
              etc.)
            </Text>
            <Text variant="textBase" style={[styles.bullet, { color: colors.text.secondary }]}>
              •{' '}
              <Text weight="semibold" style={{ color: colors.text.primary }}>
                Language:
              </Text>{' '}
              English version controls; translations for convenience only
            </Text>
          </View>
        </View>

        {/* Section 17 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            17. Contact & Support
          </Text>
          <Text variant="textBase" style={[styles.paragraph, { color: colors.text.secondary }]}>
            Questions, concerns, or feedback about these Terms? Contact us:
          </Text>
          <View style={{ backgroundColor: `${colors.dark[800]}40`, padding: 16, borderRadius: 12 }}>
            <View style={styles.bulletList}>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  Legal Inquiries:
                </Text>{' '}
                legal@weavelight.com
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  General Support:
                </Text>{' '}
                support@weavelight.com
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  Bug Reports:
                </Text>{' '}
                GitHub issues (link in app)
              </Text>
              <Text variant="textBase" style={[styles.bullet, { color: colors.text.primary }]}>
                <Text weight="semibold" style={{ color: colors.text.primary }}>
                  Response Time:
                </Text>{' '}
                Within 2-3 business days
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
            By using Weave, you acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service and our Privacy Policy.
          </Text>
          <Text
            variant="textSm"
            style={{ textAlign: 'center', marginBottom: spacing[4], color: colors.text.secondary }}
          >
            Thank you for choosing Weave. We're excited to help you achieve your goals! 🎯
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
