import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesEntitlementInfo } from 'react-native-purchases';

const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'goog_api_key_placeholder',
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_api_key_placeholder', 
};

/**
 * Initialize RevenueCat SDK
 */
export const initializeRevenueCat = async (userId?: string) => {
  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userId });
  } else if (Platform.OS === 'android') {
    await Purchases.configure({ apiKey: API_KEYS.google, appUserID: userId });
  }
  
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
