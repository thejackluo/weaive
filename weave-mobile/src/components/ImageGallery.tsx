/**
 * ImageGallery - Chronological grid view of user's proof images
 * Story: 0.9 - AI-Powered Image Service
 * Fixed: Infinite scroll pagination + date filters
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useImageList } from '../hooks/useImageList';
import { Capture } from '../types/captures';

interface ImageGalleryProps {
  onImagePress: (capture: Capture) => void;
  goalId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

export function ImageGallery({ onImagePress, goalId, startDate, endDate }: ImageGalleryProps) {
  // ✅ FIX: Use useImageList hook with infinite scroll pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useImageList({
    goalId: goalId || undefined,
    startDate: startDate || undefined, // ✅ FIX: Pass date filters to API
    endDate: endDate || undefined,
  });

  // Flatten all pages into single array for FlatList
  const captures = data?.pages.flatMap((page) => page.data) ?? [];

  const renderImage = ({ item }: { item: Capture & { signed_url: string } }) => (
    <TouchableOpacity
      onPress={() => onImagePress(item)}
      style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, margin: 4 }}
      className="relative"
    >
      <Image
        source={{ uri: item.signed_url }}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
        resizeMode="cover"
      />

      {/* AI Verified Badge */}
      {item.ai_verified && (
        <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
          <MaterialIcons name="verified" size={16} color="white" />
        </View>
      )}

      {/* Quality Score */}
      {item.ai_quality_score && item.ai_quality_score >= 4 && (
        <View className="absolute bottom-2 right-2 bg-black/60 rounded px-2 py-1">
          <Text className="text-white text-xs">⭐ {item.ai_quality_score}/5</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Loading state: Initial load
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-400 mt-4">Loading images...</Text>
      </View>
    );
  }

  // Empty state: No images found
  if (captures.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900 p-6">
        <MaterialIcons name="photo-camera" size={64} color="#525252" />
        <Text className="text-neutral-400 text-lg mt-4 text-center">No images yet</Text>
        <Text className="text-neutral-500 text-sm mt-2 text-center">
          Capture your first proof to get started!
        </Text>
      </View>
    );
  }

  // Render footer: "Loading more..." indicator
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-neutral-400 text-center mt-2 text-xs">Loading more...</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <FlatList
        data={captures}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12 }}
        // ✅ FIX: Pull-to-refresh with TanStack Query refetch
        refreshing={isRefetching}
        onRefresh={refetch}
        // ✅ FIX: Infinite scroll - fetch next page when 50% from bottom
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        // ✅ FIX: Footer loading indicator
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}
