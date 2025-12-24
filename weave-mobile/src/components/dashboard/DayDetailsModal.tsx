/**
 * DayDetailsModal Component
 *
 * Modal overlay showing detailed activity for a specific day
 * Used in ConsistencyHeatmap and FulfillmentChart
 *
 * Features:
 * - Day header with formatted date
 * - List of binds completed that day
 * - Journal entry snippet (if exists)
 * - Fulfillment score badge
 * - Loading and empty states
 */

import React from 'react';
import { View, Modal, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useDayDetails } from '@/hooks/useDayDetails';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface DayDetailsModalProps {
  visible: boolean;
  date: string; // YYYY-MM-DD format
  onClose: () => void;
}

export function DayDetailsModal({ visible, date, onClose }: DayDetailsModalProps) {
  const { colors, spacing } = useTheme();
  const { data, isLoading, isError, error } = useDayDetails(date, visible);

  // Format date for display (e.g., "Monday, Dec 20")
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00'); // Force local timezone
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const dayData = data?.data;
  const binds = dayData?.binds || [];
  const journal = dayData?.journal;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        {/* Modal Card - Stop propagation so tapping inside doesn't close */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <Card variant="glass" style={styles.modalCard}>
            {/* Header with Close Button */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text variant="textLg" weight="semibold" style={{ color: colors.text.primary }}>
                  {formatDate(date)}
                </Text>
              </View>

              {/* Close button */}
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Loading State */}
              {isLoading && (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="large" color={colors.accent[500]} />
                  <Text
                    variant="textSm"
                    style={{ color: colors.text.secondary, marginTop: spacing[3] }}
                  >
                    Loading day details...
                  </Text>
                </View>
              )}

              {/* Error State */}
              {isError && (
                <View style={styles.centerContent}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={colors.semantic.error.base}
                  />
                  <Text
                    variant="textBase"
                    style={{ color: colors.semantic.error.base, marginTop: spacing[3] }}
                  >
                    {error?.message || 'Failed to load day details'}
                  </Text>
                </View>
              )}

              {/* Data State */}
              {!isLoading && !isError && (
                <>
                  {/* Summary Stats */}
                  <View style={[styles.summaryRow, { marginBottom: spacing[4] }]}>
                    <View style={styles.statBox}>
                      <Text variant="textLg" weight="bold" style={{ color: colors.accent[500] }}>
                        {binds.length}
                      </Text>
                      <Text variant="textSm" style={{ color: colors.text.secondary }}>
                        Binds Completed
                      </Text>
                    </View>

                    {journal && (
                      <View style={styles.statBox}>
                        <Text variant="textLg" weight="bold" style={{ color: colors.accent[500] }}>
                          {journal.fulfillment_score}/10
                        </Text>
                        <Text variant="textSm" style={{ color: colors.text.secondary }}>
                          Fulfillment
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Binds Section */}
                  {binds.length > 0 && (
                    <View style={{ marginBottom: spacing[5] }}>
                      <Text
                        variant="textBase"
                        weight="semibold"
                        style={{ color: colors.text.primary, marginBottom: spacing[3] }}
                      >
                        Completed Binds
                      </Text>

                      {binds.map((bind) => (
                        <View
                          key={bind.id}
                          style={[
                            styles.bindItem,
                            {
                              backgroundColor: colors.background.elevated,
                              borderColor: colors.border.subtle,
                              marginBottom: spacing[2],
                            },
                          ]}
                        >
                          <Ionicons name="checkmark-circle" size={20} color={colors.accent[500]} />
                          <View style={styles.bindInfo}>
                            <Text variant="textBase" style={{ color: colors.text.primary }}>
                              {bind.title}
                            </Text>
                            {bind.notes && (
                              <Text
                                variant="textSm"
                                style={{ color: colors.text.secondary, marginTop: 2 }}
                              >
                                {bind.notes}
                              </Text>
                            )}
                          </View>
                          {bind.has_proof && (
                            <Ionicons name="image-outline" size={16} color={colors.accent[400]} />
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Journal Section */}
                  {journal && (
                    <View style={{ marginBottom: spacing[3] }}>
                      <Text
                        variant="textBase"
                        weight="semibold"
                        style={{ color: colors.text.primary, marginBottom: spacing[3] }}
                      >
                        Daily Reflection
                      </Text>

                      <View
                        style={[
                          styles.journalCard,
                          {
                            backgroundColor: colors.background.elevated,
                            borderColor: colors.border.subtle,
                          },
                        ]}
                      >
                        {journal.default_responses?.today_reflection && (
                          <Text
                            variant="textSm"
                            style={{ color: colors.text.secondary, marginBottom: spacing[2] }}
                          >
                            {journal.default_responses.today_reflection}
                          </Text>
                        )}

                        {journal.default_responses?.tomorrow_focus && (
                          <View style={{ marginTop: spacing[2] }}>
                            <Text
                              variant="textXs"
                              weight="semibold"
                              style={{ color: colors.text.muted, marginBottom: spacing[1] }}
                            >
                              Tomorrow's Focus:
                            </Text>
                            <Text variant="textSm" style={{ color: colors.text.secondary }}>
                              {journal.default_responses.tomorrow_focus}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Empty State */}
                  {binds.length === 0 && !journal && (
                    <View style={styles.centerContent}>
                      <Ionicons name="calendar-outline" size={48} color={colors.text.muted} />
                      <Text
                        variant="textBase"
                        style={{
                          color: colors.text.secondary,
                          marginTop: spacing[3],
                          textAlign: 'center',
                        }}
                      >
                        No activity recorded for this day
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalCard: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerLeft: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  content: {
    padding: 20,
    maxHeight: 500,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#27272A',
    borderRadius: 12,
  },
  bindItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  bindInfo: {
    flex: 1,
  },
  journalCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
