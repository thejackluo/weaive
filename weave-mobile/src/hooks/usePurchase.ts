/**
 * usePurchase Hook
 * Story 9.4: App Store Readiness - AC 1 (Phase 1: Manual IAP)
 *
 * TanStack Query hook for managing IAP purchases.
 * Handles purchase flow, receipt verification, and subscription tier updates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  initializeIAP,
  disconnectIAP,
  fetchProducts,
  purchaseProduct,
  restorePurchases,
  isIAPSupported,
  ProductId,
  Product,
  PurchaseResult,
  PRODUCT_IDS,
} from '@/services/iap';
import { apiClient } from '@/services/api';
import { useEffect } from 'react';

// Type for subscription verification request
interface VerifyReceiptRequest {
  receipt: string;
  productId: string;
}

// Type for subscription status response
interface SubscriptionStatus {
  subscription_tier: 'free' | 'pro' | 'admin';
  subscription_expires_at?: string;
  subscription_product_id?: string;
}

/**
 * Query hook to fetch available subscription products
 */
export function useSubscriptionProducts() {
  return useQuery({
    queryKey: ['iap', 'products'],
    queryFn: async () => {
      // Check if IAP is supported
      if (!isIAPSupported()) {
        throw new Error('In-App Purchases not supported on this platform');
      }

      // Initialize IAP connection
      const initialized = await initializeIAP();
      if (!initialized) {
        throw new Error('Failed to initialize In-App Purchases');
      }

      // Fetch products
      return fetchProducts([
        PRODUCT_IDS.MONTHLY,
        PRODUCT_IDS.ANNUAL,
        PRODUCT_IDS.TRIAL,
      ]);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Query hook to fetch user's subscription status
 */
export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: ['user', 'subscription'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionStatus>(
        '/api/subscription/status'
      );
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Mutation hook to purchase a subscription product
 */
export function usePurchaseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId): Promise<PurchaseResult> => {
      // Step 1: Purchase from Apple
      const purchaseResult = await purchaseProduct(productId);

      if (!purchaseResult.success || !purchaseResult.receipt) {
        throw new Error(purchaseResult.error || 'Purchase failed');
      }

      // Step 2: Verify receipt with backend
      const verifyRequest: VerifyReceiptRequest = {
        receipt: purchaseResult.receipt,
        productId: productId,
      };

      await apiClient.post('/api/subscription/verify-receipt', verifyRequest);

      return purchaseResult;
    },
    onSuccess: () => {
      // Invalidate subscription status to refetch updated tier
      queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      console.error('❌ Purchase subscription failed:', error);
    },
  });
}

/**
 * Mutation hook to restore previous purchases
 */
export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<PurchaseResult> => {
      // Step 1: Restore from Apple
      const restoreResult = await restorePurchases();

      if (!restoreResult.success || !restoreResult.receipt) {
        throw new Error(restoreResult.error || 'No purchases to restore');
      }

      // Step 2: Verify receipt with backend
      const verifyRequest: VerifyReceiptRequest = {
        receipt: restoreResult.receipt,
        productId: restoreResult.productId || PRODUCT_IDS.MONTHLY,
      };

      await apiClient.post('/api/subscription/verify-receipt', verifyRequest);

      return restoreResult;
    },
    onSuccess: () => {
      // Invalidate subscription status to refetch updated tier
      queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      console.error('❌ Restore purchases failed:', error);
    },
  });
}

/**
 * Hook to manage IAP connection lifecycle
 * Initializes on mount, disconnects on unmount
 */
export function useIAPConnection() {
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isIAPSupported() && isMounted) {
        await initializeIAP();
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (isIAPSupported()) {
        disconnectIAP();
      }
    };
  }, []);
}

/**
 * Helper to format price for display
 */
export function formatPrice(product: Product): string {
  const { price, priceCurrencyCode } = product;

  // expo-in-app-purchases already provides formatted price string
  // But we can enhance it with currency symbol if needed
  return price;
}

/**
 * Helper to get product by ID from products list
 */
export function getProductById(
  products: Product[] | undefined,
  productId: ProductId
): Product | undefined {
  return products?.find((p) => p.productId === productId);
}

/**
 * Helper to check if user is Pro subscriber
 */
export function isProSubscriber(
  subscriptionStatus: SubscriptionStatus | undefined
): boolean {
  return subscriptionStatus?.subscription_tier === 'pro';
}

/**
 * Helper to check if subscription is expired
 */
export function isSubscriptionExpired(
  subscriptionStatus: SubscriptionStatus | undefined
): boolean {
  if (!subscriptionStatus?.subscription_expires_at) {
    return false;
  }

  const expiresAt = new Date(subscriptionStatus.subscription_expires_at);
  return expiresAt < new Date();
}
