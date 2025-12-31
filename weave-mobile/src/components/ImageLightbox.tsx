/**
 * ImageLightbox Component
 *
 * Fullscreen image viewer with swipe navigation, pinch-to-zoom, and close button.
 * Used in Daily Detail page to display bind proof images.
 *
 * Tech-Spec: Task 5
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  Pressable,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Caption } from '@/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageLightboxProps {
  images: Array<{ id: string; signed_url: string }>;
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  visible,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Animated values for gestures
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Reset to 1x if zoomed out too much
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture for image movement (when zoomed) or swipe navigation
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        // If zoomed in, allow panning
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        // If not zoomed, allow horizontal swipe for navigation
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (scale.value > 1) {
        // Save pan position when zoomed
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        // Handle swipe navigation
        const threshold = SCREEN_WIDTH * 0.3;
        if (e.translationX > threshold && currentIndex > 0) {
          runOnJS(setCurrentIndex)(currentIndex - 1);
        } else if (e.translationX < -threshold && currentIndex < images.length - 1) {
          runOnJS(setCurrentIndex)(currentIndex + 1);
        }
        // Reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Combine gestures
  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Reset transforms when modal closes or image changes
  React.useEffect(() => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [currentIndex, visible]);

  if (!visible) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden />

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={32} color="#fff" />
        </Pressable>

        {/* Image Counter */}
        <View style={styles.counter}>
          <Caption style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Caption>
        </View>

        {/* Image with Gestures */}
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image
              source={{ uri: currentImage.signed_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Navigation Arrows (only show if multiple images) */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Pressable
                onPress={() => setCurrentIndex(currentIndex - 1)}
                style={[styles.navButton, styles.navButtonLeft]}
                accessibilityLabel="Previous image"
                accessibilityRole="button"
              >
                <MaterialIcons name="chevron-left" size={48} color="#fff" />
              </Pressable>
            )}

            {currentIndex < images.length - 1 && (
              <Pressable
                onPress={() => setCurrentIndex(currentIndex + 1)}
                style={[styles.navButton, styles.navButtonRight]}
                accessibilityLabel="Next image"
                accessibilityRole="button"
              >
                <MaterialIcons name="chevron-right" size={48} color="#fff" />
              </Pressable>
            )}
          </>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  counter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 30,
    padding: 8,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});
