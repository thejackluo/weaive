/**
 * Terms of Service Screen
 *
 * Story 0.3: Authentication Flow
 * Displays the Terms of Service legal document
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
          <Text variant="displayMd" color="primary">
            Terms of Service
          </Text>
          <Text variant="textSm" color="secondary" style={styles.lastUpdated}>
            Last updated: December 19, 2024
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="textBase" color="primary" style={styles.paragraph}>
            Welcome to Weave. By creating an account, you agree to these Terms of Service.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            1. Acceptance of Terms
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            By accessing or using the Weave mobile application ("Service"), you agree to be bound
            by these Terms of Service and all applicable laws and regulations. If you do not agree
            with any of these terms, you are prohibited from using or accessing this Service.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            2. Use License
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Permission is granted to temporarily use the Weave application for personal,
            non-commercial use. This is the grant of a license, not a transfer of title, and under
            this license you may not:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Modify or copy the application materials
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Use the materials for any commercial purpose
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Attempt to decompile or reverse engineer the software
            </Text>
            <Text variant="textBase" color="secondary" style={styles.bullet}>
              • Remove any copyright or proprietary notations
            </Text>
          </View>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            3. User Accounts
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You agree to immediately notify us of
            any unauthorized use of your account.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            4. Privacy
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            Your use of the Service is also governed by our Privacy Policy. Please review our
            Privacy Policy to understand our practices.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            5. User Content
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            You retain all rights to any content you submit, post, or display on or through the
            Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free
            license to use, copy, reproduce, process, and display such content solely for the
            purpose of providing the Service to you.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            6. Termination
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We may terminate or suspend your account and access to the Service immediately, without
            prior notice or liability, for any reason, including breach of these Terms.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            7. Disclaimer
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            The Service is provided "as is" without warranties of any kind, either express or
            implied. We do not warrant that the Service will be uninterrupted, secure, or
            error-free.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            8. Limitation of Liability
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            In no event shall Weave or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit) arising out of the use or inability to
            use the Service.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            9. Changes to Terms
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of any
            material changes. Your continued use of the Service after such changes constitutes your
            acceptance of the new Terms.
          </Text>

          <Text variant="textLg" weight="semibold" color="primary" style={styles.sectionTitle}>
            10. Contact Us
          </Text>
          <Text variant="textBase" color="secondary" style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at support@weaveapp.com
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
