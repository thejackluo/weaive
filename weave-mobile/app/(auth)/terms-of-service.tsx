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
import { Text, TouchableOpacity } from 'react-native';

export default function TermsOfServiceScreen() {
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
            Terms of Service
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
            Welcome to Weave! These Terms of Service ("Terms") govern your use of the Weave mobile
            application and related services (collectively, the "Service"). By creating an account
            or using the Service, you agree to be bound by these Terms.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Please read these Terms carefully. If you do not agree with any part of these Terms, you
            may not use the Service.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            <Text style={{ fontWeight: '600', color: '#ffffff' }}>
              Contact Us:{' '}
            </Text>
            legal@weavelight.com | support@weavelight.com
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By accessing or using Weave, you confirm that:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You are at least 13 years old (or the age of majority in your jurisdiction)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You have the legal capacity to enter into binding contracts
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You agree to comply with these Terms and our Privacy Policy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • All information you provide is accurate and truthful
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We reserve the right to modify these Terms at any time. We will notify you of material
            changes via email or in-app notification. Your continued use of the Service after such
            changes constitutes acceptance of the updated Terms.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            2. Description of Service
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is a goal achievement and habit formation mobile application that helps you:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Set and track personal goals ("Needles") and consistent actions ("Binds")
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Receive AI-powered coaching and personalized daily plans ("Triads")
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Capture proof of completed tasks with photos, notes, and audio
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Journal daily reflections with fulfillment scores
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Visualize progress through consistency metrics, streaks, and ranks
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Develop a stronger personal identity through the "Weave" journey
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            The Service is provided "as-is" and "as-available" without any warranties or guarantees
            of uptime, accuracy, or specific results.
          </Text>
        </View>

        {/* Section 3 - AI Disclaimer (CRITICAL) */}
        <View
          style={[
            styles.section,
            { backgroundColor: 'rgba(244, 63, 94, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fb7185' }}>
            3. AI Coaching Disclaimer (CRITICAL - READ CAREFULLY)
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: '#ffffff' }]}>
            <Text style={{ fontWeight: '700' }}>
              WEAVE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL, MENTAL HEALTH, OR THERAPEUTIC
              SERVICES.
            </Text>
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              marginBottom: spacing[3],
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fca5a5' }}>
              ⚠️ Important Limitations:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                • Weave's AI coaching is for personal development, NOT medical or mental health
                treatment
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                • Our AI coaches are NOT licensed therapists, counselors, or medical professionals
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                • AI-generated advice is based on patterns and algorithms, NOT personalized medical
                assessment
              </Text>
              <Text style={[styles.bullet, { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}>
                • You make your own decisions - we provide suggestions, not directives
              </Text>
            </View>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Mental Health Emergencies:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            If you are experiencing a mental health crisis, suicidal thoughts, or emergency:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text weight="semibold">Call 988</Text> (Suicide & Crisis Lifeline) in the US
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • <Text weight="semibold">Call 911</Text> for immediate emergency assistance
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Contact a licensed mental health professional or go to your nearest emergency room
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            When to Seek Professional Help:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is not appropriate for, and you should consult licensed professionals for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Depression, anxiety, or other mental health conditions
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Eating disorders or body dysmorphia
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Substance abuse or addiction
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Trauma, PTSD, or serious emotional distress
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Relationship or family therapy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Medical conditions or health-related goals requiring medical supervision
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            By using Weave, you acknowledge that you understand these limitations and agree that
            Weave and its creators are not liable for any decisions you make based on AI-generated
            content.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            4. User Accounts
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            To use Weave, you must create an account:
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Account Requirements:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Provide a valid email address and create a secure password
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Alternatively, sign in with Apple or Google (subject to their terms)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Provide accurate and complete information during onboarding
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • One account per person - do not create multiple accounts
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Account Security:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You are responsible for maintaining the confidentiality of your password
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You are responsible for all activities under your account
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Notify us immediately at support@weavelight.com of any unauthorized access
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We are not liable for losses due to unauthorized account use
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Account Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You may delete your account at any time via Settings → Privacy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may discontinue the Service with 30 days' notice
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Upon termination, most data is deleted within 30 days (see Privacy Policy)
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            5. Acceptable Use Policy
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You agree to use Weave in a lawful and respectful manner.
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Permitted Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✓ Personal goal tracking and habit formation
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✓ Using AI coaching for self-improvement and personal development
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✓ Capturing and storing proof of your own completed tasks
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✓ Journaling your personal thoughts and reflections
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            Prohibited Uses:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Impersonate others or provide false identity information
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Upload illegal, harmful, threatening, abusive, or offensive content
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Violate others' intellectual property, privacy, or publicity rights
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Use automated tools (bots, scrapers, spiders) to access the Service
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Reverse engineer, decompile, or hack the app or its systems
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Attempt to gain unauthorized access to other users' accounts or data
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Transmit viruses, malware, or other harmful code
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Use the Service for commercial purposes without written permission
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Circumvent usage limits, rate limits, or security measures
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              ✗ Interfere with or disrupt the Service or servers/networks connected to it
            </Text>
          </View>

          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Violation of this Acceptable Use Policy may result in immediate account suspension or
            termination, with or without notice.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            6. User-Generated Content
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Your Content Ownership:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You retain ownership of all content you create in Weave:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Goals, Q-goals, and subtasks
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Journal entries and reflections
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Photos, audio recordings, and notes
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Identity documents (archetype, dream self, motivations)
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. License You Grant to Us:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            By uploading content to Weave, you grant us a limited, non-exclusive, worldwide,
            royalty-free license to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Store, process, and display your content to provide the Service
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Send your content to AI providers (OpenAI, Anthropic) to generate coaching responses
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Create backups and ensure data reliability
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Calculate aggregate, anonymized statistics for service improvement
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            This license terminates when you delete your content or account (subject to retention
            policies in our Privacy Policy).
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. AI-Generated Content:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Daily plans ("Triads"), insights, and coaching messages are AI-generated
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • AI suggestions are recommendations, not commands - you decide what to do
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You can edit, ignore, or customize all AI-generated content
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Once you edit AI content, you own the modified version
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We do not guarantee accuracy, completeness, or appropriateness of AI outputs
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            D. Content Moderation:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We reserve the right (but have no obligation) to monitor user content
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may remove content that violates these Terms or applicable laws
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Report inappropriate content via in-app reporting (future feature)
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            7. Subscription & Payment (Future)
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave is currently free during early access. In the future, we may introduce paid
            subscription tiers:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Free tier: Basic goal tracking and limited AI coaching
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Paid tiers: Advanced features, unlimited AI coaching, priority support
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Billing: Monthly or annual subscriptions via Apple App Store or Google Play
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Cancellation: Cancel anytime; access continues until end of billing period
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Refunds: Subject to Apple/Google's refund policies
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Price changes: 30-day notice for existing subscribers
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Early access users may receive special pricing or lifetime access (details TBD).
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            8. Intellectual Property
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Our Intellectual Property:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave and its creators own all rights to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • The Weave name, logo, and branding
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • App design, interface, and user experience
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Source code, algorithms, and software architecture
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • AI prompts, training processes, and coaching methodologies
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Documentation, guides, and marketing materials
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            All rights not expressly granted to you are reserved by Weave.
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Your Limited License:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We grant you a limited, non-exclusive, non-transferable, revocable license to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Use the Weave app for personal, non-commercial purposes
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Access and use features available to your account tier
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            This license terminates if you violate these Terms or if we terminate your account.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            9. Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Weave integrates with third-party services, each subject to their own terms:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                OpenAI
              </Text>{' '}
              (GPT-4o, GPT-4o-mini) - see OpenAI Terms of Use
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Anthropic
              </Text>{' '}
              (Claude 3.7 Sonnet, Claude 3.5 Haiku) - see Anthropic Terms of Service
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Supabase
              </Text>{' '}
              (database, auth, storage) - see Supabase Terms
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Apple Sign-In
              </Text>{' '}
              - see Apple Terms and Conditions
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Google Sign-In
              </Text>{' '}
              - see Google Terms of Service
            </Text>
          </View>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            We are not responsible for third-party service failures, changes, or discontinuation.
            You use third-party services at your own risk.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            10. Data & Privacy
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Your privacy is important to us. Please review our Privacy Policy (linked from the
            signup screen) for complete details. Key points:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Immutable Logs:
              </Text>{' '}
              Completion events are permanent (integrity of progress tracking)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Encrypted Storage:
              </Text>{' '}
              JWT tokens in device keychain, AES-256 for database
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                AI Processing:
              </Text>{' '}
              Your data sent to OpenAI/Anthropic ONLY for responses
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                No AI Training:
              </Text>{' '}
              Your data is NOT used to train AI models
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Deletion:
              </Text>{' '}
              Most data deleted within 30 days of account closure
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
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
            { backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: 16, borderRadius: 12 },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fbbf24' }}>
            11. Disclaimers & Limitation of Liability
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Service "As-Is":
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • No warranty of merchantability, fitness for a particular purpose, or
              non-infringement
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • No guarantee of accuracy, reliability, or completeness of AI-generated content
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • No guarantee of uninterrupted, secure, or error-free operation
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • No guarantee of specific results or outcomes from using the Service
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Limitation of Liability:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEAVE AND ITS CREATORS SHALL NOT BE LIABLE FOR:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Lost data, progress, or content (back up important information)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Service interruptions, downtime, or technical failures
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Decisions you make based on AI coaching or app suggestions
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Indirect, incidental, consequential, special, or punitive damages
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Damages arising from third-party services or integrations
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Any amount exceeding the fees you paid in the last 12 months (or $100 if using free
              tier)
            </Text>
          </View>

          <Text
            variant="textSm"
            style={[styles.paragraph, { marginTop: 12, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }]}
          >
            Some jurisdictions do not allow exclusion of certain warranties or limitations on
            liability. In such cases, our liability is limited to the maximum extent permitted by
            law.
          </Text>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            12. Indemnification
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You agree to defend, indemnify, and hold harmless Weave and its creators, employees, and
            agents from any claims, damages, losses, or expenses (including reasonable attorney
            fees) arising from:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Your use or misuse of the Service
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Your violation of these Terms or Privacy Policy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Your violation of others' rights (intellectual property, privacy, etc.)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Content you upload or create in the Service
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Any decisions you make based on AI-generated advice
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            13. Termination
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Termination by You:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Delete your account anytime via Settings → Privacy
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Export your data before deletion (30-day retention, then permanent deletion)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Canceling a paid subscription ends access at the end of the billing period
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Termination by Us:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may suspend or terminate accounts that violate these Terms
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may suspend service temporarily for maintenance or emergencies
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • We may discontinue the Service with 30 days' notice
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Effect of Termination:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Your access is immediately revoked
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Data is deleted per our Privacy Policy retention schedule
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Outstanding payments remain due
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Sections that should survive (disclaimers, liability, etc.) continue to apply
            </Text>
          </View>
        </View>

        {/* Section 14 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            14. Dispute Resolution
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            A. Informal Resolution:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Before filing any legal claim, please contact us at legal@weavelight.com to resolve the
            issue informally. We commit to good-faith efforts to resolve disputes.
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            B. Binding Arbitration (US Users):
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            If informal resolution fails and you are a US user, disputes will be resolved through
            binding arbitration (not court):
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Arbitration administered by American Arbitration Association (AAA)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Conducted under AAA Consumer Arbitration Rules
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • Individual basis only - no class actions, representative actions, or consolidation
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              • You may opt out of arbitration within 30 days by emailing legal@weavelight.com
            </Text>
          </View>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            C. Small Claims Court:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You or we may bring a claim in small claims court if it qualifies and remains in that
            court.
          </Text>

          <Text
            style={[styles.subsectionTitle, { fontSize: 16, fontWeight: '600', color: '#ffffff' }]}
          >
            D. Class Action Waiver:
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            You waive your right to participate in class actions, class arbitrations, or
            representative actions against Weave.
          </Text>
        </View>

        {/* Section 15 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            15. Governing Law
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to conflict of law principles.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            For intellectual property disputes, US federal law applies.
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            International users: Local consumer protection laws may provide additional rights not
            waivable by these Terms.
          </Text>
        </View>

        {/* Section 16 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            16. Miscellaneous
          </Text>

          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Severability:
              </Text>{' '}
              If any provision is invalid, the rest remains in effect
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                No Waiver:
              </Text>{' '}
              Our delay in enforcing rights doesn't waive them
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Assignment:
              </Text>{' '}
              We may transfer these Terms; you may not without our consent
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Entire Agreement:
              </Text>{' '}
              These Terms + Privacy Policy = complete agreement
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Force Majeure:
              </Text>{' '}
              Not liable for events beyond reasonable control (acts of God, war, natural disasters,
              etc.)
            </Text>
            <Text style={[styles.bullet, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
              •{' '}
              <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                Language:
              </Text>{' '}
              English version controls; translations for convenience only
            </Text>
          </View>
        </View>

        {/* Section 17 */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#60a5fa' }}>
            17. Contact & Support
          </Text>
          <Text style={[styles.paragraph, { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }]}>
            Questions, concerns, or feedback about these Terms? Contact us:
          </Text>
          <View style={{ backgroundColor: `${colors.dark[800]}40`, padding: 16, borderRadius: 12 }}>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  Legal Inquiries:
                </Text>{' '}
                legal@weavelight.com
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  General Support:
                </Text>{' '}
                support@weavelight.com
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
                  Bug Reports:
                </Text>{' '}
                GitHub issues (link in app)
              </Text>
              <Text style={[styles.bullet, { fontSize: 16, color: '#ffffff' }]}>
                <Text style={{ fontWeight: '600', color: '#ffffff' }}>
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
            style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            By using Weave, you acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service and our Privacy Policy.
          </Text>
          <Text
            style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Thank you for choosing Weave. We're excited to help you achieve your goals! 🎯
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
