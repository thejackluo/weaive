/**
 * In-App Purchase Service
 * Story 9.4: App Store Readiness - AC 1 (Phase 1: Manual IAP)
 *
 * Direct integration with Apple IAP using expo-in-app-purchases.
 * Handles product fetching, purchase flow, and receipt restoration.
 */

import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';

// Product IDs (must match App Store Connect configuration)
export const PRODUCT_IDS = {
  MONTHLY: 'com.weavelight.app.pro.monthly',
  ANNUAL: 'com.weavelight.app.pro.annual',
  TRIAL: 'com.weavelight.app.trial.10day',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

// Product details type
export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  type: 'subscription' | 'consumable' | 'non-consumable';
}

// Purchase result type
export interface PurchaseResult {
  success: boolean;
  receipt?: string;
  transactionId?: string;
  productId?: string;
  error?: string;
}

/**
 * Initialize IAP connection
 * Must be called before any IAP operations
 */
export async function initializeIAP(): Promise<boolean> {
  try {
    // iOS only - Android uses Google Play Billing
    if (Platform.OS !== 'ios') {
      console.warn('IAP only supported on iOS for this MVP');
      return false;
    }

    await InAppPurchases.connectAsync();
    console.log('✅ IAP connection established');
    return true;
  } catch (error) {
    console.error('❌ IAP initialization failed:', error);
    return false;
  }
}

/**
 * Disconnect IAP connection
 * Call when app is backgrounded or user logs out
 */
export async function disconnectIAP(): Promise<void> {
  try {
    await InAppPurchases.disconnectAsync();
    console.log('✅ IAP connection closed');
  } catch (error) {
    console.error('❌ IAP disconnect failed:', error);
  }
}

/**
 * Fetch available products from App Store
 * Returns product details (price, description, etc.)
 */
export async function fetchProducts(productIds: ProductId[]): Promise<Product[]> {
  try {
    const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);

    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      throw new Error(`Failed to fetch products: ${responseCode}`);
    }

    // Transform to our Product type
    return results.map((product) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      priceAmountMicros: product.priceAmountMicros,
      priceCurrencyCode: product.priceCurrencyCode,
      type: product.type as 'subscription' | 'consumable' | 'non-consumable',
    }));
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Purchase a product
 * Initiates Apple IAP flow (native payment sheet)
 */
export async function purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
  try {
    const { responseCode, results } = await InAppPurchases.purchaseItemAsync(productId);

    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      // User cancelled or error occurred
      return {
        success: false,
        error: `Purchase failed: ${responseCode}`,
      };
    }

    // Purchase successful - extract receipt
    const purchase = results?.[0];
    if (!purchase) {
      return {
        success: false,
        error: 'No purchase data returned',
      };
    }

    return {
      success: true,
      receipt: purchase.transactionReceipt,
      transactionId: purchase.orderId,
      productId: purchase.productId,
    };
  } catch (error) {
    console.error('❌ Purchase failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Restore previous purchases
 * Required for users who reinstall the app or switch devices
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      return {
        success: false,
        error: `Restore failed: ${responseCode}`,
      };
    }

    // Find most recent active subscription
    const activeSubscription = results?.find(
      (purchase) =>
        purchase.acknowledged &&
        [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.ANNUAL, PRODUCT_IDS.TRIAL].includes(
          purchase.productId as ProductId
        )
    );

    if (!activeSubscription) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    return {
      success: true,
      receipt: activeSubscription.transactionReceipt,
      transactionId: activeSubscription.orderId,
      productId: activeSubscription.productId,
    };
  } catch (error) {
    console.error('❌ Restore purchases failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Finish a transaction (acknowledge purchase)
 * Must be called after successful purchase/restore to prevent re-prompting
 */
export async function finishTransaction(purchase: InAppPurchases.InAppPurchase): Promise<void> {
  try {
    await InAppPurchases.finishTransactionAsync(purchase, true);
    console.log('✅ Transaction finished:', purchase.orderId);
  } catch (error) {
    console.error('❌ Failed to finish transaction:', error);
  }
}

/**
 * Set purchase listener
 * Listens for purchase updates (success, failure, restore)
 */
export function setPurchaseListener(
  listener: (event: InAppPurchases.InAppPurchase) => void
): () => void {
  const subscription = InAppPurchases.setPurchaseListener(listener);

  // Return cleanup function
  return () => subscription.remove();
}

/**
 * Check if device supports IAP
 * iOS only for MVP
 */
export function isIAPSupported(): boolean {
  return Platform.OS === 'ios';
}
