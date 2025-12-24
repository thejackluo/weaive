/**
 * Subscription Management Screen
 * Story 9.4: App Store Readiness - AC 1 (Phase 1: Manual IAP)
 *
 * Basic subscription UI showing current plan and upgrade options.
 * Phase 1: Manual IAP with native Apple payment sheet
 * Phase 2 (post-launch): Migrate to Superwall for A/B testing & analytics
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useSubscriptionProducts,
  useSubscriptionStatus,
  usePurchaseSubscription,
  useRestorePurchases,
  useIAPConnection,
  formatPrice,
  getProductById,
  isProSubscriber,
  isSubscriptionExpired,
} from '@/hooks/usePurchase';
import { PRODUCT_IDS } from '@/services/iap';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize IAP connection
  useIAPConnection();

  // Fetch subscription data
  const { data: products, isLoading: productsLoading } = useSubscriptionProducts();
  const { data: subscriptionStatus, isLoading: statusLoading } =
    useSubscriptionStatus();

  // Purchase mutations
  const purchaseMutation = usePurchaseSubscription();
  const restoreMutation = useRestorePurchases();

  // Helper to get current plan display
  const getCurrentPlan = (): string => {
    if (!subscriptionStatus) return 'Free';

    const { subscription_tier } = subscriptionStatus;

    if (subscription_tier === 'admin') return 'Admin (Unlimited)';
    if (subscription_tier === 'pro') {
      if (isSubscriptionExpired(subscriptionStatus)) {
        return 'Pro (Expired)';
      }
      return 'Pro';
    }

    return 'Free';
  };

  // Handle upgrade button press
  const handleUpgrade = async (productId: typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS]) => {
    try {
      setIsProcessing(true);
      await purchaseMutation.mutateAsync(productId);

      Alert.alert(
        'Success! 🎉',
        'Your subscription is now active. Enjoy unlimited AI coaching!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Purchase Failed',
        error instanceof Error ? error.message : 'Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle restore purchases
  const handleRestore = async () => {
    try {
      setIsProcessing(true);
      await restoreMutation.mutateAsync();

      Alert.alert(
        'Restored! ✅',
        'Your subscription has been restored.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        error instanceof Error ? error.message : 'No previous purchases found.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manage subscription (opens App Store)
  const handleManageSubscription = async () => {
    try {
      const url = 'https://apps.apple.com/account/subscriptions';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open App Store subscriptions');
      }
    } catch (error) {
      console.error('Failed to open App Store:', error);
    }
  };

  const isLoading = productsLoading || statusLoading;
  const isPro = isProSubscriber(subscriptionStatus);
  const currentPlan = getCurrentPlan();

  // Get product details
  const monthlyProduct = getProductById(products, PRODUCT_IDS.MONTHLY);
  const annualProduct = getProductById(products, PRODUCT_IDS.ANNUAL);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0F0F10',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          gap: 24,
        }}
      >
        {/* Header */}
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FAFAFA',
              marginBottom: 8,
            }}
          >
            Subscription
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#71717A',
            }}
          >
            Manage your Weave Pro subscription
          </Text>
        </View>

        {/* Current Plan Section */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272A',
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#FAFAFA',
              marginBottom: 12,
            }}
          >
            Current Plan
          </Text>

          {isLoading ? (
            <Text style={{ color: '#71717A' }}>Loading...</Text>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: isPro ? '#3B82F6' : '#FAFAFA',
                  marginBottom: 8,
                }}
              >
                {currentPlan}
              </Text>

              {subscriptionStatus?.subscription_expires_at && (
                <Text style={{ fontSize: 14, color: '#71717A' }}>
                  {isSubscriptionExpired(subscriptionStatus)
                    ? 'Expired on'
                    : 'Renews on'}{' '}
                  {new Date(
                    subscriptionStatus.subscription_expires_at
                  ).toLocaleDateString()}
                </Text>
              )}

              {!isPro && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#71717A',
                    marginTop: 8,
                  }}
                >
                  500 AI messages/month • Limited features
                </Text>
              )}

              {isPro && !isSubscriptionExpired(subscriptionStatus) && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#71717A',
                    marginTop: 8,
                  }}
                >
                  5,000 AI messages/month • All features unlocked
                </Text>
              )}
            </>
          )}
        </View>

        {/* Upgrade Section (only show if not Pro) */}
        {!isPro && !isLoading && (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#FAFAFA',
                marginTop: 8,
              }}
            >
              Upgrade to Pro
            </Text>

            {/* Monthly Plan */}
            {monthlyProduct && (
              <Pressable
                onPress={() => handleUpgrade(PRODUCT_IDS.MONTHLY)}
                disabled={isProcessing}
                style={{
                  backgroundColor: '#1F1F23',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                  padding: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#FAFAFA',
                    }}
                  >
                    Pro Monthly
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#3B82F6',
                    }}
                  >
                    {formatPrice(monthlyProduct)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#71717A' }}>
                  • 5,000 AI messages/month{'\n'}
                  • Unlimited goal tracking{'\n'}
                  • Priority support{'\n'}
                  • 10-day free trial
                </Text>
              </Pressable>
            )}

            {/* Annual Plan */}
            {annualProduct && (
              <Pressable
                onPress={() => handleUpgrade(PRODUCT_IDS.ANNUAL)}
                disabled={isProcessing}
                style={{
                  backgroundColor: '#1F1F23',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#27272A',
                  padding: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#FAFAFA',
                      }}
                    >
                      Pro Annual
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#10B981',
                        marginTop: 4,
                      }}
                    >
                      Save 2 months free
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#FAFAFA',
                    }}
                  >
                    {formatPrice(annualProduct)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#71717A' }}>
                  • 5,000 AI messages/month{'\n'}
                  • Unlimited goal tracking{'\n'}
                  • Priority support{'\n'}
                  • 10-day free trial
                </Text>
              </Pressable>
            )}
          </>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          {/* Manage Subscription (only for Pro users) */}
          {isPro && !isSubscriptionExpired(subscriptionStatus) && (
            <Pressable
              onPress={handleManageSubscription}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FAFAFA',
                }}
              >
                Manage Subscription
              </Text>
            </Pressable>
          )}

          {/* Restore Purchases */}
          <Pressable
            onPress={handleRestore}
            disabled={isProcessing}
            style={{
              backgroundColor: '#27272A',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FAFAFA',
              }}
            >
              Restore Purchases
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text
          style={{
            fontSize: 12,
            color: '#71717A',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Subscriptions renew automatically. Cancel anytime in the App Store.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
