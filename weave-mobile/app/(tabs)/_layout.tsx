import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/design-system';
import * as Haptics from 'expo-haptics';

/**
 * Center AI Button Component
 *
 * Magical glassmorphism button that opens AI Chat overlay
 * Inspired by new Siri (iOS 18) design
 */
function CenterAIButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.centerButtonContainer}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.centerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text variant="displayMd" className="text-white">
            ✨
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/**
 * AI Chat Overlay with Glassmorphism
 *
 * Magical blur effect with translucent card
 * Dismissible via tap outside or swipe down
 */
function AIChatOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(300);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"
        />
        <Animated.View style={[styles.overlayBackground, overlayStyle]} />
      </Pressable>

      <Animated.View style={[styles.aiChatCardContainer, cardStyle]}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.aiChatCard}>
            {/* Header */}
            <View style={styles.aiChatHeader}>
              <Text variant="displayMd" className="text-white font-bold">
                AI Chat Interface
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text variant="displayMd" className="text-white/60">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.aiChatContent}>
              <Text variant="textLg" className="text-white/90 mb-4">
                Epic 6: AI Coaching
              </Text>
              <Text variant="textBase" className="text-white/70">
                This page has not been developed
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

/**
 * Tab Layout Component
 *
 * 2-tab navigation structure:
 * - Tab 1 (Left): Thread/Home (Today's Binds)
 * - Tab 2 (Right): Dashboard (Progress)
 * - Center: AI Chat (magical overlay, accessed via center button)
 */
export default function TabLayout() {
  const [aiChatVisible, setAIChatVisible] = useState(false);

  const openAIChat = () => {
    setAIChatVisible(true);
  };

  const closeAIChat = () => {
    setAIChatVisible(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B72F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
            backgroundColor: '#0a0a0a',
            borderTopColor: '#1f1f1f',
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>🏠</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>📊</Text>
            ),
          }}
        />
      </Tabs>

      {/* Center AI Button (elevated above tab bar) */}
      <CenterAIButton onPress={openAIChat} />

      {/* AI Chat Overlay */}
      <AIChatOverlay visible={aiChatVisible} onClose={closeAIChat} />
    </>
  );
}

const styles = StyleSheet.create({
  // Center Button Styles
  centerButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -28, // Half of button width (56px)
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B72F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // AI Chat Overlay Styles
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  aiChatCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: '5%',
    width: '90%',
    height: '60%',
    zIndex: 101,
  },
  aiChatCard: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    padding: 20,
  },
  aiChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  aiChatContent: {
    flex: 1,
  },
});
