import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/design-system';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';

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
          <SymbolView name="sparkles" size={28} tintColor="#ffffff" resizeMode="center" />
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
 * Features: Input field, send button, example messages, glow effect
 */
function AIChatOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [messageInput, setMessageInput] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ id: string; text: string; isUser: boolean }>>([]);
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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: messageInput,
        isUser: true,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI response (Future: Replace with actual AI call)
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: 'This is a preview of the AI Coach. The full feature is coming soon!',
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 500);

      setMessageInput('');
    }
  };

  const handleExampleMessage = (message: string) => {
    setMessageInput(message);
  };

  const exampleMessages = [
    'What should I focus on today?',
    'Help me break down my goal',
    'Why did I miss my bind yesterday?',
    'Show my progress this week',
  ];

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
              <View className="flex-row items-center gap-2">
                <SymbolView name="sparkles" size={24} tintColor="#a78bfa" />
                <Text variant="displayMd" className="text-white font-bold">
                  AI Coach
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <SymbolView name="xmark" size={20} tintColor="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.aiChatContent}>
              {/* Messages Area */}
              {messages.length > 0 ? (
                <ScrollView
                  className="flex-1 mb-4"
                  contentContainerStyle={{ paddingBottom: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={{
                        alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: msg.isUser ? '#3B72F6' : 'rgba(255, 255, 255, 0.1)',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 16,
                        }}
                      >
                        <Text variant="textBase" className="text-white">
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <>
                  <Text variant="textBase" className="text-white/70 mb-4">
                    Epic 6: AI Coaching (Coming Soon)
                  </Text>

                  {/* Example Messages */}
                  <Text variant="textSm" className="text-white/50 mb-2">
                    Try asking:
                  </Text>
                  <View className="gap-2 mb-6">
                    {exampleMessages.map((message, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleExampleMessage(message)}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 active:bg-white/10"
                      >
                        <Text variant="textSm" className="text-white/80">
                          {message}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>

            {/* Input Area (at bottom) */}
            <View style={styles.aiChatInputContainer}>
              <View style={styles.aiChatInputWrapper}>
                <TextInput
                  style={styles.aiChatInput}
                  placeholder="Type a message..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={messageInput}
                  onChangeText={setMessageInput}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={[styles.sendButton, !messageInput.trim() && styles.sendButtonDisabled]}
                  disabled={!messageInput.trim()}
                >
                  <SymbolView name="arrow.up" size={20} tintColor="#ffffff" weight="bold" />
                </TouchableOpacity>
              </View>
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
        {/* MAIN TABS (Visible in tab bar) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
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
        <Tabs.Screen
          name="ai-chat"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="binds"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="captures"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="design-system-showcase"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="goals"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="journal"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="needles"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="sitemap"
          options={{ href: null }}
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
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)', // Purple glow border
    shadowColor: '#a78bfa', // Purple glow shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
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
  aiChatInputContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiChatInputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  aiChatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B72F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B72F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(59, 114, 246, 0.3)',
    shadowOpacity: 0,
  },
});
