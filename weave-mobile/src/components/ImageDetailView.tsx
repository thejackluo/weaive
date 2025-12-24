/**
 * ImageDetailView - Full-screen image display with AI insights, swipe navigation, and delete
 * Story: 0.9 - AI-Powered Image Service
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { deleteImage } from '../services/imageCapture';
import { Capture, AIVisionCategory } from '../types/captures';
import { supabase } from '@lib/supabase';
import { getApiBaseUrl } from '../utils/api';

interface ImageDetailViewProps {
  capture: Capture & { signed_url: string };
  onClose: () => void;
  onDelete: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function ImageDetailView({
  capture,
  onClose,
  onDelete,
  onPrevious,
  onNext,
}: ImageDetailViewProps) {
  const [deleting, setDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(capture.content_text || '');
  const [savingTitle, setSavingTitle] = useState(false);
  const insets = useSafeAreaInsets();

  // Zoom animation values
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  // Handle double-tap to zoom image
  const handleImageDoubleTap = () => {
    const newScale = lastScale.current === 1 ? 2 : 1;
    lastScale.current = newScale;

    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleDelete = () => {
    Alert.alert('Delete Image?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteImage(capture.id);
            Alert.alert('Deleted', 'Image deleted successfully', [
              { text: 'OK', onPress: onDelete },
            ]);
          } catch (error: any) {
            console.error('Delete error:', error);
            Alert.alert('Delete Failed', error.message || 'Please try again.');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleSaveTitle = async () => {
    try {
      setSavingTitle(true);

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Update capture via API
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/captures/images/${capture.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_text: title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Update failed');
      }

      // Update local state
      capture.content_text = title;
      setIsEditingTitle(false);
    } catch (error: any) {
      console.error('Title update error:', error);
      Alert.alert('Update Failed', error.message || 'Please try again.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle(capture.content_text || '');
    setIsEditingTitle(false);
  };

  const renderAIInsights = () => {
    if (!capture.ai_analysis) {
      return (
        <View className="bg-neutral-800 rounded-lg p-4">
          <Text className="text-neutral-400 text-center">AI analysis unavailable</Text>
        </View>
      );
    }

    const analysis = capture.ai_analysis;

    return (
      <View className="gap-4">
        {/* Validation Score */}
        <View className="bg-neutral-800 rounded-lg p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-semibold">AI Verification</Text>
            {capture.ai_verified && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="verified" size={20} color="#10b981" />
                <Text className="text-green-500 font-semibold">Verified</Text>
              </View>
            )}
          </View>
          <Text className="text-neutral-400 text-sm">
            Match Score: {analysis.validation_score}/100
          </Text>
        </View>

        {/* AI Summary */}
        {analysis.summary && (
          <View className="bg-neutral-800 rounded-lg p-4">
            <Text className="text-white font-semibold mb-2">Summary</Text>
            <Text className="text-neutral-300 text-sm">{analysis.summary}</Text>
          </View>
        )}

        {/* Quality Score */}
        {capture.ai_quality_score && (
          <View className="bg-neutral-800 rounded-lg p-4">
            <Text className="text-white font-semibold mb-2">Image Quality</Text>
            <View className="flex-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <MaterialIcons
                  key={i}
                  name={i < (capture.ai_quality_score || 0) ? 'star' : 'star-border'}
                  size={24}
                  color={i < (capture.ai_quality_score || 0) ? '#fbbf24' : '#525252'}
                />
              ))}
            </View>
          </View>
        )}

        {/* OCR Text */}
        {analysis.ocr_text && (
          <View className="bg-neutral-800 rounded-lg p-4">
            <Text className="text-white font-semibold mb-2">Extracted Text</Text>
            <Text className="text-neutral-300 text-sm">{analysis.ocr_text}</Text>
          </View>
        )}

        {/* Categories */}
        {analysis.categories && analysis.categories.length > 0 && (
          <View className="bg-neutral-800 rounded-lg p-4">
            <Text className="text-white font-semibold mb-3">Categories</Text>
            {analysis.categories.slice(0, 2).map((cat: AIVisionCategory, index: number) => (
              <View key={index} className="mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-neutral-300 text-sm capitalize">{cat.label}</Text>
                  <Text className="text-neutral-400 text-sm">
                    {Math.round(cat.confidence * 100)}%
                  </Text>
                </View>
                <View className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${cat.confidence * 100}%` }}
                    className="h-full bg-blue-500"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header - Safe Area Aware: X (left), Date (center), Trash (right) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}
      >
        {/* Left: Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="close" size={28} color="white" />
        </TouchableOpacity>

        {/* Center: Date */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '500', fontSize: 16 }}>
            {new Date(capture.local_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Right: Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="delete" size={28} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 80, paddingBottom: 100 }}
      >
        {/* Title - Inline Edit */}
        <View className="mb-4">
          {isEditingTitle ? (
            <View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Add a title..."
                placeholderTextColor="#737373"
                className="text-white text-3xl font-bold mb-3 px-2 py-2 bg-neutral-800 rounded-lg"
                multiline
                autoFocus
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleSaveTitle}
                  disabled={savingTitle}
                  className="flex-1 bg-blue-500 rounded-lg px-4 py-3 items-center"
                >
                  {savingTitle ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  disabled={savingTitle}
                  className="flex-1 bg-neutral-700 rounded-lg px-4 py-3 items-center"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingTitle(true)}
              className="flex-row items-center gap-2"
              activeOpacity={0.7}
            >
              {capture.content_text ? (
                <Text className="text-white flex-1" style={{ fontSize: 32, fontWeight: 'bold' }}>
                  {capture.content_text}
                </Text>
              ) : (
                <Text className="text-neutral-500 text-2xl font-semibold flex-1">
                  Tap to add title...
                </Text>
              )}
              <MaterialIcons name="edit" size={20} color="#737373" />
            </TouchableOpacity>
          )}
        </View>

        {/* Main Image with Zoom */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleImageDoubleTap}>
          <Animated.Image
            source={{ uri: capture.signed_url }}
            style={{
              width: SCREEN_WIDTH - 32,
              height: SCREEN_HEIGHT * 0.5,
              transform: [{ scale }],
            }}
            className="rounded-xl mb-4"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text className="text-neutral-500 text-xs text-center mb-4">
          Double-tap image to zoom in/out
        </Text>

        {/* AI Insights */}
        {renderAIInsights()}

        {/* Note/Caption */}
        {capture.content_text && (
          <View className="bg-neutral-800 rounded-lg p-4 mt-4">
            <Text className="text-white font-semibold mb-2">Note</Text>
            <Text className="text-neutral-300">{capture.content_text}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation (Previous/Next) - Optional */}
      {(onPrevious || onNext) && (
        <View className="absolute bottom-8 left-0 right-0 flex-row justify-between px-8">
          {onPrevious && (
            <TouchableOpacity onPress={onPrevious} className="bg-black/80 rounded-full p-3">
              <MaterialIcons name="chevron-left" size={32} color="white" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {onNext && (
            <TouchableOpacity onPress={onNext} className="bg-black/80 rounded-full p-3">
              <MaterialIcons name="chevron-right" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
