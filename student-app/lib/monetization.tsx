import React from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import {
  initializeRevenueCat,
  identifyUser as rcIdentify,
  isUnlimitedMember as rcIsUnlimitedMember,
  restorePurchases as rcRestore,
  logoutRevenueCat as rcLogout,
  purchaseProductById
} from './revenuecat';

import Constants, { ExecutionEnvironment } from 'expo-constants';

const SUPERWALL_PLACEHOLDER = 'pk_placeholder';
const SW_IOS_KEY = process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY || process.env.EXPO_PUBLIC_SUPERWALL_APPLE_KEY || process.env.EXPO_PUBLIC_SUPERWALL_PUBLIC_KEY;
const SW_ANDROID_KEY = process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY || process.env.EXPO_PUBLIC_SUPERWALL_PUBLIC_KEY;
const activeKey = Platform.OS === 'ios' ? SW_IOS_KEY : SW_ANDROID_KEY;

// Completely disable Superwall if running inside Expo Go, because it lacks the required native modules and crashes the navigator.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
export const isSuperwallEnabled = !isExpoGo && !!activeKey && activeKey !== SUPERWALL_PLACEHOLDER;

// ------------------------------------------------------------------
// Imperative helpers – these use the zustand store directly so they
// can be called from non-React code (e.g. useEffect callbacks).
// The store is only imported when Superwall is actually enabled.
// ------------------------------------------------------------------

let _swStore: any = null;
const getSuperwallStore = async () => {
  if (!isSuperwallEnabled) return null;
  if (_swStore) return _swStore;
  try {
    const mod = await import('expo-superwall');
    _swStore = (mod as any).useSuperwallStore;
    return _swStore;
  } catch (e) {
    console.warn('[Superwall] Failed to load store', e);
    return null;
  }
};

/**
 * Initialize monetization.
 * When Superwall is enabled, initialization happens automatically via
 * <SuperwallProvider> in the component tree. This function only needs
 * to call identify() if a userId is provided.
 * When Superwall is disabled, it falls back to RevenueCat imperative init.
 */
export const initializeMonetization = async (userId?: string) => {
  // Always initialize RevenueCat since it processes the actual purchases
  await initializeRevenueCat(userId);

  if (isSuperwallEnabled && userId) {
    // Don't call identify() here — SuperwallProvider hasn't finished configure() yet.
    // Instead, subscribe to the store and identify once configuration completes.
    const store = await getSuperwallStore();
    if (store) {
      const syncStatus = async (s: any) => {
        try {
          const isPro = await rcIsUnlimitedMember();
          await s.setSubscriptionStatus({ status: isPro ? 'ACTIVE' : 'INACTIVE' });
          await s.identify(userId);
        } catch (e) {
          console.warn('[Superwall] identify sync error', e);
        }
      };

      const state = store.getState();
      if (state.isConfigured) {
        // Already configured (e.g. hot reload) — identify immediately
        syncStatus(state);
      } else {
        // Wait for configuration to complete, then identify
        const unsubscribe = store.subscribe((s: any) => {
          if (s.isConfigured) {
            unsubscribe();
            syncStatus(s);
          }
        });
      }
    }
  }
};

export const identifyUser = async (userId: string) => {
  if (isSuperwallEnabled) {
    const store = await getSuperwallStore();
    if (store) {
      try {
        await store.getState().identify(userId);
      } catch (e) {
        console.warn('[Superwall] identify error', e);
      }
    }
    // Also identify on RevenueCat since it processes the actual purchases
    await rcIdentify(userId);
  } else {
    await rcIdentify(userId);
  }
};

export const isUnlimitedMember = async (): Promise<boolean> => {
  if (isSuperwallEnabled) {
    const store = await getSuperwallStore();
    if (store) {
      const status = store.getState().subscriptionStatus;
      if (status?.status === 'ACTIVE') return true;
    }
    // Also check RevenueCat as fallback
    return await rcIsUnlimitedMember();
  }
  return await rcIsUnlimitedMember();
};

export const restorePurchases = async (): Promise<boolean> => {
  if (isSuperwallEnabled) {
    const store = await getSuperwallStore();
    if (store) {
      try {
        await store.getState().restorePurchases();
        return true;
      } catch (e) {
        console.warn('[Superwall] restore error', e);
      }
    }
    return await rcRestore();
  }
  return await rcRestore();
};

export const logout = async () => {
  if (isSuperwallEnabled) {
    const store = await getSuperwallStore();
    if (store) {
      try {
        await store.getState().reset();
      } catch (e) {
        // ignore
      }
    }
    await rcLogout();
  } else {
    await rcLogout();
  }
};

// ------------------------------------------------------------------
// Paywall components
// ------------------------------------------------------------------

export const SuperwallTrigger: React.FC<any> = ({ placement, onPurchaseCompleted, onRestoreCompleted, onDismiss }) => {
    const { usePlacement, useSuperwall } = require('expo-superwall');
    const { isConfigured } = useSuperwall();
    const hasRegisteredPlacement = React.useRef(false);

    const onDismissRef = React.useRef(onDismiss);
    const onPurchaseCompletedRef = React.useRef(onPurchaseCompleted);
    const onRestoreCompletedRef = React.useRef(onRestoreCompleted);

    React.useEffect(() => {
        onDismissRef.current = onDismiss;
        onPurchaseCompletedRef.current = onPurchaseCompleted;
        onRestoreCompletedRef.current = onRestoreCompleted;
    });

    const { registerPlacement } = usePlacement({
        onDismiss: (info: any, result: any) => {
            if (result && result.type === 'purchased') {
                onPurchaseCompletedRef.current?.();
            } else if (result && result.type === 'restored') {
                onRestoreCompletedRef.current?.();
            } else {
                onDismissRef.current?.();
            }
        },
        onSkip: (reason: any) => {
            console.warn(`[Superwall] Paywall skipped for "${placement}":`, reason);
            onDismissRef.current?.();
        },
        onError: (error: any) => {
            console.warn(`[Superwall] Paywall error for "${placement}":`, error);
            onDismissRef.current?.();
        }
    });

    React.useEffect(() => {
        if (!isConfigured || hasRegisteredPlacement.current) return;

        hasRegisteredPlacement.current = true;
        const presentPlacement = async () => {
            let isPro: boolean | undefined;
            try {
                isPro = await isUnlimitedMember();
            } catch (error) {
                console.warn('[Superwall] Could not sync subscription status before placement', error);
            }

            if (isPro !== undefined) {
                try {
                    const { useSuperwallStore } = require('expo-superwall');
                    await useSuperwallStore.getState().setSubscriptionStatus({
                        status: isPro ? 'ACTIVE' : 'INACTIVE'
                    });
                } catch (error) {
                    console.warn('[Superwall] Could not update subscription status before placement', error);
                }
            }

            await registerPlacement({ placement });
        };

        void presentPlacement().catch((error) => {
            console.warn(`[Superwall] Could not register placement "${placement}"`, error);
        });
    }, [isConfigured, registerPlacement, placement]);

    return (
        <View style={{ flex: 1 }} />
    );
};

export const Paywall: React.FC<any> = (props) => {
  const { style, placement = "campaign_trigger", onPurchaseCompleted, onRestoreCompleted, onDismiss } = props;

  if (isSuperwallEnabled) {
    return (
        <SuperwallTrigger 
           placement={placement}
           onPurchaseCompleted={onPurchaseCompleted} 
           onRestoreCompleted={onRestoreCompleted}
           onDismiss={onDismiss} 
        />
    );
  }

  // Fall back to RevenueCat UI paywall.
  return (
    <RevenueCatUI.Paywall
      style={style}
      onPurchaseCompleted={onPurchaseCompleted}
      onRestoreCompleted={onRestoreCompleted}
      onDismiss={onDismiss}
    />
  );
};

// ------------------------------------------------------------------
// SuperwallProviderWrapper – wraps your app tree
// Load provider components synchronously at module scope so the tree
// never remounts (which was causing mViewFlags NullPointerException).
// Safe because isSuperwallEnabled already excludes Expo Go.
// ------------------------------------------------------------------

let _SuperwallProvider: any = null;
let _CustomPurchaseControllerProvider: any = null;

if (isSuperwallEnabled) {
  try {
    const mod = require('expo-superwall');
    _SuperwallProvider = mod.SuperwallProvider || null;
    _CustomPurchaseControllerProvider = mod.CustomPurchaseControllerProvider || null;
  } catch (e) {
    console.warn('[Superwall] Failed to require expo-superwall', e);
  }
}

const PurchaseController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controller = React.useMemo(() => ({
    onPurchase: async (params: any) => {
      try {
        const Purchases = require('react-native-purchases').default;
        const { PRODUCT_CATEGORY, PURCHASES_ERROR_CODE } = require('react-native-purchases');

        const products = await Promise.all([
          Purchases.getProducts([params.productId], PRODUCT_CATEGORY.SUBSCRIPTION),
          Purchases.getProducts([params.productId], PRODUCT_CATEGORY.NON_SUBSCRIPTION),
        ]).then((results: any[]) => results.flat());

        const product =
          products.find((p: any) => p.identifier === params.productId) ??
          (Platform.OS === 'android'
            ? products.find((p: any) => p.identifier === `${params.productId}:${params.basePlanId}`)
            : undefined) ??
          products[0];

        if (!product) {
          // Fallback to purchaseProductById helper
          await purchaseProductById(params.productId);
          return { type: 'purchased' as const };
        }

        if (Platform.OS === 'android' && product.subscriptionOptions?.length) {
          const optionId = params.offerId
            ? `${params.basePlanId}:${params.offerId}`
            : params.basePlanId;
          const option = product.subscriptionOptions.find((opt: any) => opt.id === optionId);

          if (!option) {
            return { type: 'failed' as const, error: 'Subscription option not found' };
          }

          await Purchases.purchaseSubscriptionOption(option);
          return { type: 'purchased' as const };
        }

        await Purchases.purchaseStoreProduct(product);
        return { type: 'purchased' as const };
      } catch (e: any) {
        if (e.userCancelled || e.code === '1') {
          return { type: 'cancelled' as const };
        }
        return { type: 'failed' as const, error: e.message || 'Purchase failed' };
      }
    },
    onPurchaseRestore: async () => {
      try {
        await rcRestore();
        return { type: 'restored' as const };
      } catch (e: any) {
        return { type: 'failed' as const, error: e.message || 'Restore failed' };
      }
    }
  }), []);

  if (_CustomPurchaseControllerProvider) {
    return (
      <_CustomPurchaseControllerProvider controller={controller}>
        {children}
      </_CustomPurchaseControllerProvider>
    );
  }
  return <>{children}</>;
};

export const SuperwallProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!_SuperwallProvider) return <>{children}</>;

  const apiKeys = { ios: SW_IOS_KEY || '', android: SW_ANDROID_KEY || '' };

  return (
    <PurchaseController>
      <_SuperwallProvider
        apiKeys={apiKeys}
        onConfigurationError={(error: Error) => {
          console.warn('[Superwall] Configuration failed', error);
        }}
      >
        {children}
      </_SuperwallProvider>
    </PurchaseController>
  );
};
