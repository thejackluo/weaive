/**
 * Daily Detail Page
 *
 * Shows complete daily data (binds with proof, journal reflection) for a specific date.
 * Accessible from calendar grid, fulfillment graph, and history list.
 *
 * Route: /dashboard/daily/[date]
 * Tech-Spec: Tasks 8-10
 */

import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Heading, Body, Caption, Button } from '@/design-system';
import { ExpandableCard } from '@/components/ExpandableCard';
import { ImageLightbox } from '@/components/ImageLightbox';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TimerBadge } from '@/components/TimerBadge';
import { useDailyDetail, type BindData, type CaptureData } from '@/hooks/useDailyDetail';

export default function DailyDetailScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string }>();
  const date = params.date;

  // State for image lightbox
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<CaptureData[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Validate date parameter
  if (!date) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={[styles.centerContent, { padding: spacing[6] }]}>
          <MaterialIcons name="error-outline" size={64} color={colors.text.secondary} />
          <Heading variant="displayLg" style={{ color: colors.text.primary, marginTop: spacing[4], textAlign: 'center' }}>
            No date provided
          </Heading>
          <Button
            onPress={() => router.push('/(tabs)/dashboard')}
            variant="primary"
            style={{ marginTop: spacing[6] }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Fetch daily data
  const { data, isLoading, isError, error } = useDailyDetail(date);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
          <Body style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
            Loading daily data...
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Could not load daily data';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={[styles.centerContent, { padding: spacing[6] }]}>
          <MaterialIcons name="error-outline" size={64} color={colors.text.secondary} />
          <Heading variant="displayLg" style={{ color: colors.text.primary, marginTop: spacing[4], textAlign: 'center' }}>
            {errorMessage}
          </Heading>
          <Button
            onPress={() => router.push('/(tabs)/dashboard')}
            variant="primary"
            style={{ marginTop: spacing[6] }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const summary = data.data;
  const binds = summary.binds;
  const journalEntry = summary.journal_entry;
  const aggregates = summary.aggregates;

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Handle image tap
  const handleImageTap = (bind: BindData, index: number) => {
    const images = bind.captures.filter(c => c.capture_type === 'photo');
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing[4], paddingVertical: spacing[3] }]}>
        <Pressable onPress={() => router.push('/(tabs)/dashboard')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <Heading variant="displayLg" style={{ color: colors.text.primary }}>
            {displayDate}
          </Heading>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing[4] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Binds Section */}
        <ExpandableCard
          title="Daily Binds"
          subtitle={`${aggregates.completed_count}/${aggregates.total_binds} completed`}
          defaultExpanded={true}
        >
          {binds.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle-outline" size={48} color={colors.text.secondary} />
              <Body style={{ color: colors.text.secondary, marginTop: spacing[2], textAlign: 'center' }}>
                No binds active on this day
              </Body>
            </View>
          ) : (
            <View style={{ gap: spacing[4] }}>
              {binds.map((bind) => (
                <View key={bind.id} style={[styles.bindItem, { borderBottomColor: colors.border.subtle }]}>
                  {/* Bind Header */}
                  <View style={styles.bindHeader}>
                    <View style={{ flex: 1 }}>
                      <Heading variant="displayLg" style={{ color: colors.text.primary }}>
                        {bind.title}
                      </Heading>
                      <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
                        {bind.goal_name}
                        {bind.completed_at && ` • ${new Date(bind.completed_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                      </Caption>
                    </View>
                    {bind.completed ? (
                      <MaterialIcons name="check-circle" size={24} color={colors.accent[500]} />
                    ) : (
                      <MaterialIcons name="radio-button-unchecked" size={24} color={colors.text.muted} />
                    )}
                  </View>

                  {/* Bind Details (if completed) */}
                  {bind.completed && (
                    <View style={{ marginTop: spacing[3], gap: spacing[3] }}>
                      {/* Timer Badge */}
                      {bind.duration_minutes && (
                        <View>
                          <TimerBadge durationMinutes={bind.duration_minutes} />
                        </View>
                      )}

                      {/* Photo Proof */}
                      {bind.captures.filter(c => c.capture_type === 'photo').length > 0 && (
                        <View style={[styles.proofSection, { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing[3] }]}>
                          <View style={styles.proofHeader}>
                            <MaterialIcons name="photo-camera" size={20} color={colors.accent[500]} />
                            <Caption style={{ color: colors.text.secondary, marginLeft: spacing[2], fontWeight: '600' }}>
                              Photo Proof ({bind.captures.filter(c => c.capture_type === 'photo').length})
                            </Caption>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing[2] }}>
                            {bind.captures
                              .filter(c => c.capture_type === 'photo')
                              .map((capture, idx) => (
                                <Pressable
                                  key={capture.id}
                                  onPress={() => handleImageTap(bind, idx)}
                                  style={[styles.imageThumbnail, { marginRight: spacing[2] }]}
                                >
                                  <Image
                                    source={{ uri: capture.signed_url || undefined }}
                                    style={styles.thumbnailImage}
                                    resizeMode="cover"
                                  />
                                </Pressable>
                              ))}
                          </ScrollView>
                        </View>
                      )}

                      {/* Audio */}
                      {bind.captures.filter(c => c.capture_type === 'audio').length > 0 && (
                        <View style={[styles.proofSection, { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing[3] }]}>
                          <View style={styles.proofHeader}>
                            <MaterialIcons name="mic" size={20} color={colors.accent[500]} />
                            <Caption style={{ color: colors.text.secondary, marginLeft: spacing[2], fontWeight: '600' }}>
                              Audio Note
                            </Caption>
                          </View>
                          {bind.captures.filter(c => c.capture_type === 'audio').map((capture) => (
                            <View key={capture.id} style={{ marginTop: spacing[2] }}>
                              <AudioPlayer audioUri={capture.signed_url || ''} showSpeedControl={false} />
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Text Captures (from photo upload flow) */}
                      {bind.captures.filter(c => c.capture_type === 'text' && c.content_text).length > 0 && (
                        <View style={[styles.notesSection, { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing[3] }]}>
                          <View style={styles.proofHeader}>
                            <MaterialIcons name="description" size={20} color={colors.accent[500]} />
                            <Caption style={{ color: colors.text.secondary, marginLeft: spacing[2], fontWeight: '600' }}>
                              Description
                            </Caption>
                          </View>
                          {bind.captures
                            .filter(c => c.capture_type === 'text' && c.content_text)
                            .map((capture) => (
                              <Body key={capture.id} style={{ color: colors.text.primary, marginTop: spacing[2], lineHeight: 22 }}>
                                {capture.content_text}
                              </Body>
                            ))}
                        </View>
                      )}

                      {/* Completion Notes (from celebration modal) */}
                      {bind.notes && (
                        <View style={[styles.notesSection, { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing[3] }]}>
                          <View style={styles.proofHeader}>
                            <MaterialIcons name="note" size={20} color={colors.accent[500]} />
                            <Caption style={{ color: colors.text.secondary, marginLeft: spacing[2], fontWeight: '600' }}>
                              Notes
                            </Caption>
                          </View>
                          <Body style={{ color: colors.text.primary, marginTop: spacing[2], lineHeight: 22 }}>
                            {bind.notes}
                          </Body>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ExpandableCard>

        {/* Reflection Section */}
        <ExpandableCard
          title={journalEntry ? `Daily Reflection • ${journalEntry.fulfillment_score}/10 ⭐` : 'Daily Reflection'}
          defaultExpanded={false}
        >
          {!journalEntry ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="book" size={48} color={colors.text.secondary} />
              <Body style={{ color: colors.text.secondary, marginTop: spacing[2], textAlign: 'center' }}>
                No reflection recorded for this day
              </Body>
            </View>
          ) : (
            <View>
              {/* Fulfillment Score (large display) */}
              <View style={[styles.scoreContainer, { marginBottom: spacing[4] }]}>
                <Heading variant="display2xl" style={{ color: colors.accent[500] }}>
                  {journalEntry.fulfillment_score}
                </Heading>
                <Caption style={{ color: colors.text.secondary }}>out of 10</Caption>
              </View>

              {/* Default Responses */}
              {journalEntry.default_responses && (
                <View style={{ gap: spacing[3], marginBottom: spacing[4] }}>
                  {journalEntry.default_responses.today_reflection && (
                    <View>
                      <Caption style={{ color: colors.text.secondary, marginBottom: spacing[1] }}>
                        Today's Reflection:
                      </Caption>
                      <Body style={{ color: colors.text.primary }}>
                        {journalEntry.default_responses.today_reflection}
                      </Body>
                    </View>
                  )}
                  {journalEntry.default_responses.tomorrow_focus && (
                    <View>
                      <Caption style={{ color: colors.text.secondary, marginBottom: spacing[1] }}>
                        Tomorrow's Focus:
                      </Caption>
                      <Body style={{ color: colors.text.primary }}>
                        {journalEntry.default_responses.tomorrow_focus}
                      </Body>
                    </View>
                  )}
                </View>
              )}

              {/* Custom Responses */}
              {journalEntry.custom_responses && Object.keys(journalEntry.custom_responses).length > 0 && (
                <View style={{ gap: spacing[3], marginBottom: spacing[4] }}>
                  <Caption style={{ color: colors.text.secondary, fontWeight: '600' }}>
                    Custom Tracking:
                  </Caption>
                  {Object.entries(journalEntry.custom_responses).map(([key, value]) => (
                    <View key={key}>
                      <Caption style={{ color: colors.text.secondary, marginBottom: spacing[1] }}>
                        {value.question_text}:
                      </Caption>
                      <Body style={{ color: colors.text.primary }}>
                        {value.response}
                      </Body>
                    </View>
                  ))}
                </View>
              )}

              {/* Timestamp */}
              <Caption style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                Reflected at {new Date(journalEntry.submitted_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Caption>
            </View>
          )}
        </ExpandableCard>
      </ScrollView>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages.map(img => ({ id: img.id, signed_url: img.signed_url || '' }))}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  bindItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  bindHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  proofSection: {
    // backgroundColor set dynamically
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesSection: {
    // backgroundColor set dynamically
  },
  imageThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
