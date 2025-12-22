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
 * AI Chat Overlay - Complete Rebuild
 *
 * Clean, well-structured AI chat interface with:
 * - Blur background modal (dismissible)
 * - Card slides up from bottom (70% height)
 * - Fixed header with title and close button
 * - Scrollable content (welcome state OR messages)
 * - Fixed input area at bottom
 * - Purple glow border, glassmorphism aesthetic
 */
function AIChatOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [messageInput, setMessageInput] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ id: string; text: string; isUser: boolean }>>([]);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(500);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(500, { duration: 200 });
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

      // Simulate AI response
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: 'This is a preview of the AI Coach. The full feature is coming soon!',
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 600);

      setMessageInput('');
    }
  };

  const handleExampleTap = (message: string) => {
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
      {/* Blur Background */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
        />
        <Animated.View style={[styles.overlayBackground, overlayStyle]} />
      </Pressable>

      {/* Chat Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View style={[styles.chatCard, cardStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.chatCardInner}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <SymbolView name="sparkles" size={26} tintColor="#a78bfa" />
                <Text variant="displayMd" style={styles.chatHeaderTitle}>
                  Weave Chat
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.chatCloseButton}>
                <SymbolView name="xmark.circle.fill" size={30} tintColor="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView
              style={styles.chatContent}
              contentContainerStyle={styles.chatContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                // Welcome State
                <View style={styles.welcomeContainer}>
                  <View style={styles.welcomeIcon}>
                    <SymbolView name="sparkles" size={36} tintColor="#a78bfa" />
                  </View>
                  <Text variant="displaySm" style={styles.welcomeTitle}>
                    Your AI Coach
                  </Text>
                  <Text variant="textBase" style={styles.welcomeSubtitle}>
                    Epic 6: AI Coaching
                  </Text>
                  <View style={styles.comingSoonBadge}>
                    <Text variant="textXs" style={styles.comingSoonText}>
                      Coming Soon
                    </Text>
                  </View>

                  <Text variant="textLg" style={styles.examplesTitle}>
                    Try asking:
                  </Text>

                  {exampleMessages.map((message, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleExampleTap(message)}
                      style={styles.exampleCard}
                    >
                      <SymbolView name="bubble.left.fill" size={18} tintColor="#a78bfa" />
                      <Text variant="textBase" style={styles.exampleText}>
                        {message}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                // Messages State
                <View style={styles.messagesContainer}>
                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubble,
                        msg.isUser ? styles.userMessage : styles.aiMessage,
                      ]}
                    >
                      <Text variant="textBase" style={styles.messageText}>
                        {msg.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
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
                  style={[
                    styles.sendButton,
                    !messageInput.trim() && styles.sendButtonDisabled,
                  ]}
                  disabled={!messageInput.trim()}
                >
                  <SymbolView name="arrow.up" size={22} tintColor="#ffffff" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
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
        <Tabs.Screen name="ai-chat" options={{ href: null }} />
        <Tabs.Screen name="design-system-showcase" options={{ href: null }} />
        <Tabs.Screen name="needles" options={{ href: null }} />
        <Tabs.Screen name="sitemap" options={{ href: null }} />

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
        <Tabs.Screen name="settings/subscription" options={{ href: null }} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 101,
  },
  chatCard: {
    marginHorizontal: '5%',
    marginBottom: 0,
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatCardInner: {
    flex: 1,
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
  chatContent: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 20,
    flexGrow: 1,
  },

  // Welcome State Styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 32,
  },
  comingSoonText: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  examplesTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  exampleText: {
    color: '#ffffff',
    flex: 1,
  },

  // Messages State Styles
  messagesContainer: {
    flex: 1,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B72F6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    color: '#ffffff',
  },

  // Input Area Styles
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B72F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B72F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(59, 114, 246, 0.3)',
    shadowOpacity: 0,
  },
});
