import React, { useEffect, useRef } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Platform, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';

/**
 * Tab Layout Component
 *
 * 2-tab navigation structure:
 * - Tab 1 (Left): Home (Today's Binds)
 * - Tab 2 (Right): Dashboard (Progress)
 */
export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const { currentStep } = useInAppOnboarding();

  // Shimmer animation for dashboard button
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  // Start shimmer animation when dashboard_tour is active
  useEffect(() => {
    if (currentStep === 'dashboard_tour') {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [currentStep]);

  // Disable dashboard tab during home page tour (but enable during dashboard_tour)
  const isDashboardDisabled = currentStep === 'home_page_tour';
  const isDashboardHighlighted = currentStep === 'dashboard_tour';
  // Disable home tab during dashboard tour
  const isHomeDisabled = currentStep === 'dashboard_tour';

  // Auth guard: redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Show nothing while loading (prevents flash of content)
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10B981', // Vibrant emerald (matches progress ring)
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.35)', // Softer gray
          tabBarShowLabel: false, // Hide labels, icons only
          tabBarStyle: {
            position: 'absolute',
            height: 50 + (insets.bottom > 0 ? insets.bottom / 2 : 0), // Reduced height
            paddingBottom: insets.bottom > 0 ? insets.bottom / 2 : 4,
            paddingTop: 4,
            backgroundColor: 'transparent', // Transparent for blur effect
            borderTopColor: 'rgba(255, 255, 255, 0.1)', // Subtle glow border
            borderTopWidth: 1,
            // Add shadow for depth
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        {/* MAIN TABS (Visible in tab bar) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={28}
                color={isHomeDisabled ? 'rgba(255, 255, 255, 0.2)' : color}
              />
            ),
            // Block navigation during dashboard tour
            tabBarButton: (props) => {
              if (isHomeDisabled) {
                return (
                  <Pressable
                    {...props}
                    onPress={(e) => {
                      e.preventDefault();
                      // Do nothing - tab is disabled during dashboard tour
                    }}
                    style={[props.style, { opacity: 0.5 }]}
                  />
                );
              }
              return <Pressable {...props} />;
            },
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={28}
                color={isDashboardDisabled ? 'rgba(255, 255, 255, 0.2)' : color}
              />
            ),
            // Block navigation during home page tour, enable with shimmer during dashboard_tour
            tabBarButton: (props) => {
              if (isDashboardDisabled) {
                // Return disabled version that doesn't navigate
                return (
                  <Pressable
                    {...props}
                    onPress={(e) => {
                      e.preventDefault();
                      // Do nothing - tab is disabled during tour
                    }}
                    style={[props.style, { opacity: 0.5 }]}
                  />
                );
              }

              if (isDashboardHighlighted) {
                // Return animated version with shimmer effect
                return (
                  <Animated.View
                    style={[
                      props.style,
                      {
                        backgroundColor: shimmerAnim.interpolate({
                          inputRange: [0.3, 1],
                          outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.3)'],
                        }),
                        borderRadius: 12,
                        shadowColor: '#FFFFFF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: shimmerAnim,
                        shadowRadius: 12,
                      },
                    ]}
                  >
                    <Pressable {...props} />
                  </Animated.View>
                );
              }

              return <Pressable {...props} />;
            },
          }}
        />

        {/* HIDDEN ROUTES (Not visible in tab bar) */}
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
    </>
  );
}
