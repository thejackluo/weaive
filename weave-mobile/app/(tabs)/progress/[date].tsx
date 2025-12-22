import React from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, useTheme } from '@/design-system';
import { supabase } from '@lib/supabase';

interface SubtaskCompletion {
  id: string;
  subtask_instance_id: string;
  completed_at: string;
  subtask_instance: {
    id: string;
    label: string;
  };
}

interface DailyAggregate {
  id: string;
  local_date: string;
  avg_fulfillment_score: number | null;
  total_completions: number;
  total_binds: number;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  fulfillment_score: number;
  journal_text: string | null;
  reflection_insights: string | null;
}

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { colors } = useTheme();

  // Fetch daily aggregate
  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-aggregate', date],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('daily_aggregates')
        .select('*')
        .eq('user_id', profile.id)
        .eq('local_date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyAggregate | null;
    },
    enabled: !!date,
  });

  // Fetch completions for the day
  const { data: completions, isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['day-completions', date],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('subtask_completions')
        .select(
          `
          id,
          subtask_instance_id,
          completed_at,
          subtask_instance:subtask_instances (
            id,
            label
          )
        `
        )
        .eq('user_id', profile.id)
        .eq('local_date', date)
        .order('completed_at', { ascending: true });

      if (error) throw error;
      // Fix type: subtask_instance comes as array from Supabase join
      return (data?.map((item) => ({
        ...item,
        subtask_instance: Array.isArray(item.subtask_instance)
          ? item.subtask_instance[0]
          : item.subtask_instance,
      })) || []) as SubtaskCompletion[];
    },
    enabled: !!date,
  });

  // Fetch all active subtasks to show incomplete ones
  const { data: allSubtasks, isLoading: isLoadingSubtasks } = useQuery({
    queryKey: ['active-subtasks', date],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('subtask_instances')
        .select('id, label')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as Array<{ id: string; label: string }>;
    },
    enabled: !!date,
  });

  // Fetch journal entry
  const { data: journalEntry, isLoading: isLoadingJournal } = useQuery({
    queryKey: ['journal-entry', date],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', profile.id)
        .eq('entry_date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as JournalEntry | null;
    },
    enabled: !!date,
  });

  const isLoading = isLoadingDaily || isLoadingCompletions || isLoadingSubtasks || isLoadingJournal;

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent[500]} />
      </View>
    );
  }

  if (!date) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text variant="textLg" className="text-neutral-400 text-center">
          No date specified
        </Text>
      </View>
    );
  }

  // Parse the date
  const parsedDate = parseISO(date);
  const dayOfWeek = format(parsedDate, 'EEEE');
  const formattedDate = format(parsedDate, 'MMMM d, yyyy');

  // Determine which subtasks were completed and which were not
  const completedSubtaskIds = new Set(completions?.map((c) => c.subtask_instance_id) || []);

  const completedSubtasks =
    completions?.map((c) => ({
      id: c.subtask_instance_id,
      label: c.subtask_instance.label,
      completed: true,
    })) || [];

  const incompleteSubtasks =
    allSubtasks
      ?.filter((st) => !completedSubtaskIds.has(st.id))
      .map((st) => ({
        id: st.id,
        label: st.label,
        completed: false,
      })) || [];

  const allBinds = [...completedSubtasks, ...incompleteSubtasks];

  // Get fulfillment score
  const fulfillmentScore =
    journalEntry?.fulfillment_score ?? dailyData?.avg_fulfillment_score ?? null;

  // Determine fulfillment color
  const getFulfillmentColor = (score: number | null) => {
    if (score === null) return colors.neutral[600];
    if (score >= 8) return colors.semantic.success.base;
    if (score >= 6) return colors.accent[500];
    if (score >= 4) return colors.semantic.warning.base;
    return colors.semantic.error.base;
  };

  const fulfillmentColor = getFulfillmentColor(fulfillmentScore);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 border-b border-neutral-800">
        <Pressable onPress={() => router.back()} className="flex-row items-center mb-4">
          <Ionicons name="chevron-back" size={24} color={colors.neutral[400]} />
          <Text variant="textBase" className="text-neutral-400 ml-1">
            Back
          </Text>
        </Pressable>

        <View className="flex-row items-center mb-2">
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.neutral[400]}
            style={{ marginRight: 8 }}
          />
          <Text variant="displayLg" className="text-white">
            {dayOfWeek}
          </Text>
        </View>
        <Text variant="textLg" className="text-neutral-400">
          {formattedDate}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Fulfillment Score */}
        <Card variant="glass" style={{ marginBottom: 16, padding: 24 }}>
          <Text variant="displayMd" className="text-white mb-4">
            Fulfillment Score
          </Text>

          {fulfillmentScore !== null ? (
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${fulfillmentColor}20` }}
              >
                <Text variant="displayLg" style={{ color: fulfillmentColor }}>
                  {fulfillmentScore}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="textBase" className="text-neutral-400">
                  {fulfillmentScore >= 8 && 'Highly fulfilled'}
                  {fulfillmentScore >= 6 && fulfillmentScore < 8 && 'Good fulfillment'}
                  {fulfillmentScore >= 4 && fulfillmentScore < 6 && 'Moderate fulfillment'}
                  {fulfillmentScore < 4 && 'Low fulfillment'}
                </Text>
              </View>
            </View>
          ) : (
            <Text variant="textBase" className="text-neutral-500">
              No fulfillment score recorded for this day
            </Text>
          )}
        </Card>

        {/* Binds Completion */}
        <Card variant="glass" style={{ marginBottom: 16, padding: 24 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="displayMd" className="text-white">
              Daily Binds
            </Text>
            <Text variant="textSm" className="text-neutral-400">
              {completedSubtasks.length} / {allBinds.length} completed
            </Text>
          </View>

          {allBinds.length > 0 ? (
            <View className="space-y-3">
              {allBinds.map((bind) => (
                <View key={bind.id} className="flex-row items-center py-2">
                  {bind.completed ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.semantic.success.base}
                      style={{ marginRight: 12 }}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={24}
                      color={colors.neutral[600]}
                      style={{ marginRight: 12 }}
                    />
                  )}
                  <Text
                    variant="textBase"
                    className={bind.completed ? 'text-white' : 'text-neutral-500'}
                  >
                    {bind.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="textBase" className="text-neutral-500">
              No binds active on this day
            </Text>
          )}
        </Card>

        {/* Daily Reflection */}
        <Card variant="glass" style={{ marginBottom: 24, padding: 24 }}>
          <Text variant="displayMd" className="text-white mb-4">
            Daily Reflection
          </Text>

          {journalEntry ? (
            <View className="space-y-4">
              {journalEntry.journal_text && (
                <View>
                  <Text variant="textSm" className="text-neutral-400 mb-2">
                    Your Entry
                  </Text>
                  <Text variant="textBase" className="text-white leading-6">
                    {journalEntry.journal_text}
                  </Text>
                </View>
              )}

              {journalEntry.reflection_insights && (
                <View className="mt-4 p-4 bg-brand-500/10 rounded-lg border border-brand-500/20">
                  <Text variant="textSm" className="text-brand-400 mb-2">
                    AI Insights
                  </Text>
                  <Text variant="textBase" className="text-neutral-200 leading-6">
                    {journalEntry.reflection_insights}
                  </Text>
                </View>
              )}

              {!journalEntry.journal_text && !journalEntry.reflection_insights && (
                <Text variant="textBase" className="text-neutral-500">
                  No reflection recorded for this day
                </Text>
              )}
            </View>
          ) : (
            <Text variant="textBase" className="text-neutral-500">
              No reflection recorded for this day
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
