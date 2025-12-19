/**
 * Privacy Policy Screen
 *
 * Story 0.3: Authentication Flow
 * Displays the Privacy Policy legal document
 *
 * Features:
 * - Scrollable content
 * - Back navigation
 * - Consistent auth flow styling
 * - Placeholder content (to be replaced with actual legal copy)
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displayMd" color="primary">
            Privacy Policy
          </Text>
          <Text variant="textSm" color="secondary" style={styles.lastUpdated}>
            Last updated: December 19, 2024
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="textBase" color="primary" style={styles.paragraph}>
            At Weave, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, and protect your personal information.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            1. Information We Collect
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We collect information that you provide directly to us, including:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Account information (email address, password)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Profile information (name, preferences, identity traits)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Goals, tasks, and progress data
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Photos and notes you upload as proof of completion
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Journal entries and reflections
            </Text>
          </View>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Provide, maintain, and improve the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Personalize your experience and provide tailored recommendations
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Generate AI-powered insights and coaching
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Send you notifications about your goals and progress
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Communicate with you about the Service
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Monitor and analyze trends, usage, and activities
            </Text>
          </View>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            3. Data Storage and Security
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Your data is stored securely using industry-standard encryption. We use Supabase for
            data storage and authentication, which provides enterprise-grade security. Your
            authentication tokens are stored in your device's secure keychain, not in plain text.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            4. AI Processing
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We use AI models (OpenAI GPT-4 and Anthropic Claude) to provide personalized coaching
            and insights. Your data is sent to these third-party AI providers only when necessary
            to generate responses. We do not use your data to train AI models, and AI providers do
            not retain your data after processing.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            5. Data Sharing and Disclosure
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We do not sell your personal information. We may share your information only in the
            following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • With third-party service providers who help us operate the Service (Supabase,
              OpenAI, Anthropic)
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • To comply with legal obligations or protect our rights
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • With your explicit consent
            </Text>
          </View>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            6. Your Data Rights
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Access your personal information
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Correct inaccurate data
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Request deletion of your account and data
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Export your data in a portable format
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Opt out of certain data processing activities
            </Text>
          </View>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            7. Data Retention
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We retain your information for as long as your account is active or as needed to
            provide the Service. If you delete your account, we will delete your personal
            information within 30 days, except where we are required to retain it for legal
            purposes.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            8. Children's Privacy
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            The Service is not intended for users under the age of 13. We do not knowingly collect
            personal information from children under 13. If you believe we have collected
            information from a child under 13, please contact us immediately.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            9. International Data Transfers
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your
            country of residence. We ensure that such transfers comply with applicable data
            protection laws.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            10. Changes to This Policy
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new Privacy Policy on this page and updating the "Last updated"
            date.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            11. Contact Us
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please
            contact us at privacy@weaveapp.com
          </Text>
        </View>

        {/* Back Button */}
        <View style={styles.footer}>
          <Button
            variant="secondary"
            size="lg"
            onPress={() => router.back()}
            fullWidth
            accessibilityLabel="Go back to signup"
          >
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
  },
  header: {
    marginBottom: 32,
  },
  lastUpdated: {
    marginTop: 8,
  },
  content: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 24,
  },
  bulletList: {
    marginLeft: 16,
    marginBottom: 16,
  },
  bullet: {
    marginBottom: 8,
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
});
