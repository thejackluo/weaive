import React, { useState } from 'react';
import { Tabs, Redirect } from 'expo-router';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from '@/design-system';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Center AI Button Component (Story 6.1)
 *
 * Magical glassmorphism button that opens AI Chat overlay
 * Inspired by new Siri (iOS 18) design
 *
 * Features:
 * - Unread badge indicator for server-initiated check-ins
 * - Haptic feedback on press
 * - Spring animation
 */
function CenterAIButton({ onPress, hasUnread }: { onPress: () => void; hasUnread: boolean }) {
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
          <SymbolView name="sparkles" size={28} tintColor="#ffffff" resizeMode="center" />

          {/* Unread badge indicator */}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <View style={styles.unreadBadgeInner} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

import ChatScreen from '@/components/features/ai-chat/ChatScreen';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

/**
 * AI Chat Overlay - Real Implementation (Story 6.1)
 *
 * Full-featured AI chat with:
 * - Real API integration with SSE streaming
 * - JWT authentication
 * - Tiered rate limiting (10 premium + 40 free/day)
 * - Message persistence
 * - Swipe-to-dismiss modal
 */
function AIChatOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(500);
  const startY = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(500, { duration: 200 });
    }
  }, [visible]);

  // Swipe-down gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow downward swipes (positive translationY)
      if (event.translationY > 0) {
        translateY.value = startY.value + event.translationY;
      }
    })
    .onEnd((event) => {
      // Dismiss if swiped down more than 100px or velocity is high
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(500, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(onClose, 200);
      } else {
        // Spring back to original position
        translateY.value = withSpring(0, { damping: 18, stiffness: 100 });
      }
    });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Blur Background */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView style={StyleSheet.absoluteFill} blurAmount={32} blurType="dark" />
          <Animated.View style={[styles.overlayBackground, overlayStyle]} />
        </Pressable>

        {/* Chat Card with Swipe-to-Dismiss */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.chatCard, cardStyle]}>
              <Pressable onPress={(e) => e.stopPropagation()} style={styles.chatCardInner}>
                {/* Header with Close Button */}
                <View style={styles.chatHeader}>
                  <View style={styles.chatHeaderLeft}>
                    <SymbolView name="sparkles" size={26} tintColor="#a78bfa" />
                    <Text variant="displayMd" style={styles.chatHeaderTitle}>
                      Weave Chat
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.chatCloseButton}>
                    <SymbolView
                      name="xmark.circle.fill"
                      size={30}
                      tintColor="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </View>

                {/* Real ChatScreen Component (Story 6.1) */}
                <View style={{ flex: 1 }}>
                  <ChatScreen />
                </View>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
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
  const { user, isLoading } = useAuth();
  const [aiChatVisible, setAIChatVisible] = useState(false);
  const [hasUnreadCheckins, setHasUnreadCheckins] = useState(false);
  const insets = useSafeAreaInsets();

  // ✅ FIX: ALL hooks must be BEFORE early returns to maintain consistent hook order
  // Check for unread check-in conversations (system-initiated)
  // Uses same query key as prefetch in root layout for instant data availability
  const { data: conversations } = useQuery({
    queryKey: ['ai-conversations'], // ✅ CHANGED: Same key as prefetch in _layout.tsx
    queryFn: async () => {
      const response = await apiClient.get('/api/ai-chat/conversations');
      return response.data.data || [];
    },
    refetchInterval: 30000, // Check every 30 seconds
    enabled: !isLoading && !aiChatVisible && !!user, // Only run when authenticated and chat is closed
  });

  // Update unread badge when conversations change
  // ✅ MOVED BEFORE EARLY RETURNS - must be called every render
  React.useEffect(() => {
    if (conversations && conversations.length > 0) {
      // Check if there are any system-initiated conversations
      // TODO: In a real app, track which conversations have been viewed
      // For now, we'll show badge if there are any system-initiated conversations
      const hasSystemInitiated = conversations.some((conv: any) => conv.initiated_by === 'system');
      setHasUnreadCheckins(hasSystemInitiated);
    }
  }, [conversations]);

  // Auth guard: redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Show nothing while loading (prevents flash of content)
  if (isLoading) {
    return null;
  }

  const openAIChat = () => {
    setAIChatVisible(true);
    // Clear unread badge when chat is opened
    setHasUnreadCheckins(false);
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
            height: 49 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 4,
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
        {/* MAIN TABS (Visible in tab bar) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Thread',
            tabBarIcon: ({ color }) => (
              <SymbolView name="house.fill" size={24} tintColor={color} resizeMode="center" />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <SymbolView name="chart.bar.fill" size={24} tintColor={color} resizeMode="center" />
            ),
          }}
        />

        {/* HIDDEN ROUTES (Not visible in tab bar) */}
        <Tabs.Screen name="ai-chat" options={{ href: null }} />
        <Tabs.Screen name="design-system-showcase" options={{ href: null }} />
        <Tabs.Screen name="needles" options={{ href: null }} />
        <Tabs.Screen name="sitemap" options={{ href: null }} />
        <Tabs.Screen name="voice-demo" options={{ href: null }} />

        {/* Progress Routes (Day Detail Pages) */}
        <Tabs.Screen name="progress/[date]" options={{ href: null }} />

        {/* Dashboard Routes */}
        <Tabs.Screen name="dashboard/daily/[date]" options={{ href: null }} />

        {/* Binds Routes */}
        <Tabs.Screen name="binds/[id]" options={{ href: null }} />
        <Tabs.Screen name="binds/proof/[id]" options={{ href: null }} />

        {/* Captures Routes */}
        <Tabs.Screen name="captures/index" options={{ href: null }} />
        <Tabs.Screen name="captures/[id]" options={{ href: null }} />

        {/* Goals Routes */}
        <Tabs.Screen name="goals/index" options={{ href: null }} />
        <Tabs.Screen name="goals/[id]" options={{ href: null }} />
        <Tabs.Screen name="goals/new" options={{ href: null }} />
        <Tabs.Screen name="goals/edit/[id]" options={{ href: null }} />

        {/* Journal Routes */}
        <Tabs.Screen name="journal/index" options={{ href: null }} />
        <Tabs.Screen name="journal/[date]" options={{ href: null }} />
        <Tabs.Screen name="journal/history" options={{ href: null }} />

        {/* Settings Routes */}
        <Tabs.Screen name="settings/index" options={{ href: null }} />
        <Tabs.Screen name="settings/identity" options={{ href: null }} />
        <Tabs.Screen name="settings/account" options={{ href: null }} />
        <Tabs.Screen name="settings/subscription" options={{ href: null }} />
        <Tabs.Screen name="settings/reflection" options={{ href: null }} />
        <Tabs.Screen name="settings/personality" options={{ href: null }} />
        <Tabs.Screen name="settings/tool-testing" options={{ href: null }} />
        <Tabs.Screen name="settings/dev-tools" options={{ href: null }} />
      </Tabs>

      {/* Center AI Button (elevated above tab bar) */}
      <CenterAIButton onPress={openAIChat} hasUnread={hasUnreadCheckins} />

      {/* AI Chat Overlay */}
      <AIChatOverlay visible={aiChatVisible} onClose={closeAIChat} />
    </>
  );
}

const CENTER_BUTTON_SIZE = 56;

const styles = StyleSheet.create({
  // Center Button Styles
  centerButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -CENTER_BUTTON_SIZE / 2,
    zIndex: 10,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: '#3B72F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadBadgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444', // Red accent color
  },

  // AI Chat Overlay Styles
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 101,
  },
  chatCard: {
    marginHorizontal: 8,
    marginBottom: 0,
    height: '95%', // ✅ FIX: Full screen height (was 70%)
    width: undefined,
    alignSelf: 'stretch',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatCardInner: {
    flex: 1,
    width: '100%', // ✅ Explicit 100% width
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(167, 139, 250, 0.6)',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius: 32,
    elevation: 24,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatHeaderTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatCloseButton: {
    padding: 4,
  },
});
