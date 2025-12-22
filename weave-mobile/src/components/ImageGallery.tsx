/**
 * ImageGallery - Chronological grid view of user's proof images
 * Story: 0.9 - AI-Powered Image Service
 */

import React, { useState, useEffect } from 'react';
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
import { getUserCaptures } from '../services/imageCapture';
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
  const [captures, setCaptures] = useState<(Capture & { signed_url: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadImages = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const fetchedCaptures = await getUserCaptures(
        undefined, // localDate (not filtering by single date)
        'photo' as any, // type
        goalId || undefined,
        undefined // subtaskInstanceId
      );

      setCaptures(fetchedCaptures as any);
      setHasMore(false); // TODO: Implement pagination
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [goalId, startDate, endDate]);

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-400 mt-4">Loading images...</Text>
      </View>
    );
  }

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

  return (
    <View className="flex-1 bg-neutral-900">
      <FlatList
        data={captures}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12 }}
        refreshing={refreshing}
        onRefresh={() => loadImages(true)}
        onEndReached={() => {
          // TODO: Load more images (pagination)
          if (hasMore) {
            console.log('Load more images...');
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
