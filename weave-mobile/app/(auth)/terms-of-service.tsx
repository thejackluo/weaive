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
import { Button, Text, Card, useTheme } from '@/design-system';

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
        accessibilityRole="article"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displayMd" color="primary" weight="bold">
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
          <Text variant="textBase" color="primary" style={styles.paragraph}>
            Welcome to Weave! These Terms of Service ("Terms") govern your use of the Weave mobile
            application and related services (collectively, the "Service"). By creating an account
            or using the Service, you agree to be bound by these Terms.
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Please read these Terms carefully. If you do not agree with any part of these Terms, you
            may not use the Service.
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            <Text weight="semibold" color="primary">
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
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            By accessing or using Weave, you confirm that:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You are at least 13 years old (or the age of majority in your jurisdiction)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You have the legal capacity to enter into binding contracts
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You agree to comply with these Terms and our Privacy Policy
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • All information you provide is accurate and truthful
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
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
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Weave is a goal achievement and habit formation mobile application that helps you:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Set and track personal goals ("Needles") and consistent actions ("Binds")
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Receive AI-powered coaching and personalized daily plans ("Triads")
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Capture proof of completed tasks with photos, notes, and audio
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Journal daily reflections with fulfillment scores
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Visualize progress through consistency metrics, streaks, and ranks
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Develop a stronger personal identity through the "Weave" journey
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            The Service is provided "as-is" and "as-available" without any warranties or guarantees
            of uptime, accuracy, or specific results.
          </Text>
        </View>

        {/* Section 3 - AI Disclaimer (CRITICAL) */}
        <Card
          variant="glass"
          padding="default"
          style={[styles.section, { backgroundColor: `${colors.rose[500]}15` }]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.rose[400] }}>
            3. AI Coaching Disclaimer (CRITICAL - READ CAREFULLY)
          </Text>
          <Text variant="textBase" color="primary" style={styles.paragraph}>
            <Text weight="bold">WEAVE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL, MENTAL HEALTH,
            OR THERAPEUTIC SERVICES.</Text>
          </Text>

          <Card
            variant="glass"
            padding="sm"
            style={{ backgroundColor: `${colors.rose[500]}25`, marginBottom: spacing[3] }}
          >
            <Text variant="textSm" weight="semibold" style={{ color: colors.rose[300] }}>
              ⚠️ Important Limitations:
            </Text>
            <View style={styles.bulletList}>
              <Text variant="textSm" color="secondary" style={styles.bullet}>
                • Weave's AI coaching is for personal development, NOT medical or mental health
                treatment
              </Text>
              <Text variant="textSm" color="secondary" style={styles.bullet}>
                • Our AI coaches are NOT licensed therapists, counselors, or medical professionals
              </Text>
              <Text variant="textSm" color="secondary" style={styles.bullet}>
                • AI-generated advice is based on patterns and algorithms, NOT personalized medical
                assessment
              </Text>
              <Text variant="textSm" color="secondary" style={styles.bullet}>
                • You make your own decisions - we provide suggestions, not directives
              </Text>
            </View>
          </Card>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Mental Health Emergencies:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            If you are experiencing a mental health crisis, suicidal thoughts, or emergency:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold">Call 988</Text> (Suicide & Crisis Lifeline) in the US
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold">Call 911</Text> for immediate emergency assistance
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Contact a licensed mental health professional or go to your nearest emergency room
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            When to Seek Professional Help:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Weave is not appropriate for, and you should consult licensed professionals for:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Depression, anxiety, or other mental health conditions
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Eating disorders or body dysmorphia
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Substance abuse or addiction
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Trauma, PTSD, or serious emotional distress
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Relationship or family therapy
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Medical conditions or health-related goals requiring medical supervision
            </Text>
          </View>

          <Text variant="textSm" color="secondary" style={[styles.paragraph, { marginTop: spacing[3] }]}>
            By using Weave, you acknowledge that you understand these limitations and agree that
            Weave and its creators are not liable for any decisions you make based on AI-generated
            content.
          </Text>
        </Card>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            4. User Accounts
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            To use Weave, you must create an account:
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Account Requirements:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Provide a valid email address and create a secure password
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Alternatively, sign in with Apple or Google (subject to their terms)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Provide accurate and complete information during onboarding
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • One account per person - do not create multiple accounts
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Account Security:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You are responsible for maintaining the confidentiality of your password
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You are responsible for all activities under your account
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Notify us immediately at support@weavelight.com of any unauthorized access
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We are not liable for losses due to unauthorized account use
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Account Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You may delete your account at any time via Settings → Privacy
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may discontinue the Service with 30 days' notice
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Upon termination, most data is deleted within 30 days (see Privacy Policy)
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            5. Acceptable Use Policy
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You agree to use Weave in a lawful and respectful manner.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Permitted Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✓ Personal goal tracking and habit formation
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✓ Using AI coaching for self-improvement and personal development
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✓ Capturing and storing proof of your own completed tasks
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✓ Journaling your personal thoughts and reflections
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            Prohibited Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Impersonate others or provide false identity information
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Upload illegal, harmful, threatening, abusive, or offensive content
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Violate others' intellectual property, privacy, or publicity rights
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Use automated tools (bots, scrapers, spiders) to access the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Reverse engineer, decompile, or hack the app or its systems
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Attempt to gain unauthorized access to other users' accounts or data
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Transmit viruses, malware, or other harmful code
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Use the Service for commercial purposes without written permission
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Circumvent usage limits, rate limits, or security measures
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              ✗ Interfere with or disrupt the Service or servers/networks connected to it
            </Text>
          </View>

          <Text variant="textBase" color="secondary" style={styles.paragraph}>
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
            color="primary"
            style={styles.subsectionTitle}
          >
            A. Your Content Ownership:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You retain ownership of all content you create in Weave:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Goals, Q-goals, and subtasks
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Journal entries and reflections
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Photos, audio recordings, and notes
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Identity documents (archetype, dream self, motivations)
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            B. License You Grant to Us:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            By uploading content to Weave, you grant us a limited, non-exclusive, worldwide,
            royalty-free license to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Store, process, and display your content to provide the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Send your content to AI providers (OpenAI, Anthropic) to generate coaching responses
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Create backups and ensure data reliability
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Calculate aggregate, anonymized statistics for service improvement
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            This license terminates when you delete your content or account (subject to retention
            policies in our Privacy Policy).
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            C. AI-Generated Content:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Daily plans ("Triads"), insights, and coaching messages are AI-generated
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • AI suggestions are recommendations, not commands - you decide what to do
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You can edit, ignore, or customize all AI-generated content
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Once you edit AI content, you own the modified version
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We do not guarantee accuracy, completeness, or appropriateness of AI outputs
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            D. Content Moderation:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We reserve the right (but have no obligation) to monitor user content
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may remove content that violates these Terms or applicable laws
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Report inappropriate content via in-app reporting (future feature)
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            7. Subscription & Payment (Future)
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Weave is currently free during early access. In the future, we may introduce paid
            subscription tiers:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Free tier: Basic goal tracking and limited AI coaching
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Paid tiers: Advanced features, unlimited AI coaching, priority support
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Billing: Monthly or annual subscriptions via Apple App Store or Google Play
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Cancellation: Cancel anytime; access continues until end of billing period
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Refunds: Subject to Apple/Google's refund policies
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Price changes: 30-day notice for existing subscribers
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
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
            color="primary"
            style={styles.subsectionTitle}
          >
            A. Our Intellectual Property:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Weave and its creators own all rights to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • The Weave name, logo, and branding
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • App design, interface, and user experience
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Source code, algorithms, and software architecture
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • AI prompts, training processes, and coaching methodologies
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Documentation, guides, and marketing materials
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            All rights not expressly granted to you are reserved by Weave.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            B. Your Limited License:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We grant you a limited, non-exclusive, non-transferable, revocable license to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Use the Weave app for personal, non-commercial purposes
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Access and use features available to your account tier
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            This license terminates if you violate these Terms or if we terminate your account.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            9. Third-Party Services
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Weave integrates with third-party services, each subject to their own terms:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">OpenAI</Text> (GPT-4o, GPT-4o-mini) - see OpenAI Terms of
              Use
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Anthropic</Text> (Claude 3.7 Sonnet, Claude 3.5 Haiku) -
              see Anthropic Terms of Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Supabase</Text> (database, auth, storage) - see Supabase
              Terms
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Apple Sign-In</Text> - see Apple Terms and Conditions
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Google Sign-In</Text> - see Google Terms of Service
            </Text>
          </View>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We are not responsible for third-party service failures, changes, or discontinuation.
            You use third-party services at your own risk.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            10. Data & Privacy
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Your privacy is important to us. Please review our Privacy Policy (linked from the
            signup screen) for complete details. Key points:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Immutable Logs:</Text> Completion events are permanent
              (integrity of progress tracking)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Encrypted Storage:</Text> JWT tokens in device keychain,
              AES-256 for database
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">AI Processing:</Text> Your data sent to OpenAI/Anthropic
              ONLY for responses
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">No AI Training:</Text> Your data is NOT used to train AI
              models
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Deletion:</Text> Most data deleted within 30 days of account
              closure
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Your Rights:</Text> Access, export, delete, and rectify your
              data (GDPR/CCPA)
            </Text>
          </View>
        </View>

        {/* Section 11 - Disclaimers & Liability */}
        <Card
          variant="glass"
          padding="default"
          style={[styles.section, { backgroundColor: `${colors.amber[500]}15` }]}
        >
          <Text variant="textLg" weight="semibold" style={{ color: colors.amber[400] }}>
            11. Disclaimers & Limitation of Liability
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            A. Service "As-Is":
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • No warranty of merchantability, fitness for a particular purpose, or
              non-infringement
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • No guarantee of accuracy, reliability, or completeness of AI-generated content
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • No guarantee of uninterrupted, secure, or error-free operation
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • No guarantee of specific results or outcomes from using the Service
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            B. Limitation of Liability:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEAVE AND ITS CREATORS SHALL NOT BE LIABLE FOR:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Lost data, progress, or content (back up important information)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Service interruptions, downtime, or technical failures
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Decisions you make based on AI coaching or app suggestions
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Indirect, incidental, consequential, special, or punitive damages
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Damages arising from third-party services or integrations
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Any amount exceeding the fees you paid in the last 12 months (or $100 if using free
              tier)
            </Text>
          </View>

          <Text variant="textSm" color="secondary" style={[styles.paragraph, { marginTop: spacing[3] }]}>
            Some jurisdictions do not allow exclusion of certain warranties or limitations on
            liability. In such cases, our liability is limited to the maximum extent permitted by
            law.
          </Text>
        </Card>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            12. Indemnification
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless Weave and its creators, employees, and
            agents from any claims, damages, losses, or expenses (including reasonable attorney
            fees) arising from:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Your use or misuse of the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Your violation of these Terms or Privacy Policy
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Your violation of others' rights (intellectual property, privacy, etc.)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Content you upload or create in the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
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
            color="primary"
            style={styles.subsectionTitle}
          >
            A. Termination by You:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Delete your account anytime via Settings → Privacy
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Export your data before deletion (30-day retention, then permanent deletion)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Canceling a paid subscription ends access at the end of the billing period
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            B. Termination by Us:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may suspend service temporarily for maintenance or emergencies
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • We may discontinue the Service with 30 days' notice
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            C. Effect of Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Your access is immediately revoked
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Data is deleted per our Privacy Policy retention schedule
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Outstanding payments remain due
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
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
            color="primary"
            style={styles.subsectionTitle}
          >
            A. Informal Resolution:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Before filing any legal claim, please contact us at legal@weavelight.com to resolve the
            issue informally. We commit to good-faith efforts to resolve disputes.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            B. Binding Arbitration (US Users):
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            If informal resolution fails and you are a US user, disputes will be resolved through
            binding arbitration (not court):
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Arbitration administered by American Arbitration Association (AAA)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Conducted under AAA Consumer Arbitration Rules
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Individual basis only - no class actions, representative actions, or consolidation
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • You may opt out of arbitration within 30 days by emailing legal@weavelight.com
            </Text>
          </View>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            C. Small Claims Court:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You or we may bring a claim in small claims court if it qualifies and remains in that
            court.
          </Text>

          <Text
            variant="textBase"
            weight="semibold"
            color="primary"
            style={styles.subsectionTitle}
          >
            D. Class Action Waiver:
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You waive your right to participate in class actions, class arbitrations, or
            representative actions against Weave.
          </Text>
        </View>

        {/* Section 15 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            15. Governing Law
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to conflict of law principles.
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            For intellectual property disputes, US federal law applies.
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
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
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Severability:</Text> If any provision is invalid, the rest
              remains in effect
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">No Waiver:</Text> Our delay in enforcing rights doesn't
              waive them
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Assignment:</Text> We may transfer these Terms; you may not
              without our consent
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Entire Agreement:</Text> These Terms + Privacy Policy =
              complete agreement
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Force Majeure:</Text> Not liable for events beyond
              reasonable control (acts of God, war, natural disasters, etc.)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • <Text weight="semibold" color="primary">Language:</Text> English version controls; translations for
              convenience only
            </Text>
          </View>
        </View>

        {/* Section 17 */}
        <View style={styles.section}>
          <Text variant="textLg" weight="semibold" style={{ color: colors.accent[400] }}>
            17. Contact & Support
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Questions, concerns, or feedback about these Terms? Contact us:
          </Text>
          <Card
            variant="glass"
            padding="default"
            style={{ backgroundColor: `${colors.dark[800]}40` }}
          >
            <View style={styles.bulletList}>
              <Text variant="textBase" color="primary" style={styles.bullet}>
                <Text weight="semibold">Legal Inquiries:</Text> legal@weavelight.com
              </Text>
              <Text variant="textBase" color="primary" style={styles.bullet}>
                <Text weight="semibold">General Support:</Text> support@weavelight.com
              </Text>
              <Text variant="textBase" color="primary" style={styles.bullet}>
                <Text weight="semibold">Bug Reports:</Text> GitHub issues (link in app)
              </Text>
              <Text variant="textBase" color="primary" style={styles.bullet}>
                <Text weight="semibold">Response Time:</Text> Within 2-3 business days
              </Text>
            </View>
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="textSm" color="secondary" style={{ textAlign: 'center', marginBottom: spacing[4] }}>
            By using Weave, you acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service and our Privacy Policy.
          </Text>
          <Text variant="textSm" color="secondary" style={{ textAlign: 'center', marginBottom: spacing[4] }}>
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
