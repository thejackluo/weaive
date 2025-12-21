/**
 * CaptureImage Component
 *
 * Story 0.9: Image Handling with Supabase Storage
 * Epic 3: Daily Actions & Proof (Display proof photos)
 *
 * Displays a capture image from Supabase Storage with proper loading states.
 * Automatically fetches signed URL and handles errors gracefully.
 */

import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/design-system';
import { getImageUrl } from '@/services/imageCapture';

interface CaptureImageProps {
  /** Storage key from capture record */
  storageKey: string;

  /** Image width (default: full width) */
  width?: number | string;

  /** Image height (default: auto aspect ratio) */
  height?: number;

  /** Border radius (default: 8) */
  borderRadius?: number;

  /** Alt text for accessibility */
  alt?: string;
}

export function CaptureImage({
  storageKey,
  width = '100%',
  height = 200,
  borderRadius = 8,
  alt = 'Proof photo',
}: CaptureImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      try {
        setIsLoading(true);
        setError(false);

        // Fetch signed URL (1 hour expiration)
        const url = await getImageUrl(storageKey, 3600);

        if (!mounted) return;

        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('[CaptureImage] Failed to load image:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
    };
  }, [storageKey]);

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1f2937',
          },
        ]}
      >
        <ActivityIndicator size="small" color="#6b7280" />
      </View>
    );
  }

  // Error state
  if (error || !imageUrl) {
    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1f2937',
          },
        ]}
      >
        <Text variant="bodySm" className="text-neutral-500">
          Failed to load image
        </Text>
      </View>
    );
  }

  // Success: Display image
  return (
    <Image
      source={{ uri: imageUrl }}
      style={[
        styles.image,
        {
          width,
          height,
          borderRadius,
        },
      ]}
      resizeMode="cover"
      accessible
      accessibilityLabel={alt}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#1f2937', // Fallback while loading
  },
});
