import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesEntitlementInfo } from 'react-native-purchases';

// Read keys directly from environment; do NOT provide a silent placeholder fallback.
const APPLE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

/**
 * Initialize RevenueCat SDK
 */
export const initializeRevenueCat = async (userId?: string) => {
  let apiKey = Platform.OS === 'ios' ? APPLE_KEY : ANDROID_KEY;
  
  // DEV HACK: If you're testing on iOS but only have an Android key (or vice versa),
  // use the available key to initialize the SDK so the app doesn't crash.
  // Note: Actual purchases won't work across platforms, but the UI will load!
  if (!apiKey && __DEV__) {
      apiKey = APPLE_KEY || ANDROID_KEY;
  }

  if (!apiKey) {
    const envName = Platform.OS === 'ios' ? 'EXPO_PUBLIC_REVENUECAT_APPLE_KEY' : 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY';
    const msg = `[RevenueCat] Missing API key (${envName}) for platform '${Platform.OS}'. Purchases will be unavailable.`;

    // In dev, log a warning but do NOT throw — allows the app to run on the other platform
    // (e.g. testing on Android without an Apple key configured, or vice versa).
    console.warn(msg);
    return;
  }

  await Purchases.configure({ apiKey, appUserID: userId });

  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }
};

/**
 * Identify user to RevenueCat upon login
 */
export const identifyUser = async (userId: string) => {
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    if (__DEV__) console.error("RevenueCat Login Error:", e);
  }
};

/**
 * Check if user has active "pro" entitlement (covers both Pro and Max plans)
 */
export const isUnlimitedMember = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
  } catch (e) {
    return false;
  }
};

/**
 * Restore previously purchased items
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
  } catch (e) {
    return false;
  }
};

/**
 * Logout from RevenueCat
 */
export const logoutRevenueCat = async () => {
  await Purchases.logOut();
};
