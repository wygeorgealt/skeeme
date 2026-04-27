import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesEntitlementInfo } from 'react-native-purchases';

const API_KEYS = {
  apple: 'goog_api_key_placeholder', // Replace with your actual Apple key
  google: 'test_bXKLJRirXqytjUfJQzLWWHDvfg', // From your screenshot
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
 * Check if user has active "Skeeme_Pro" or "Skeeme_Max" entitlement
 */
export const isUnlimitedMember = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['Skeeme_Pro'] !== 'undefined' || 
           typeof customerInfo.entitlements.active['Skeeme_Max'] !== 'undefined';
  } catch (e) {
    return false;
  }
};

/**
 * Restore previously purchased items (Mandatory for App Store)
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return typeof customerInfo.entitlements.active['Skeeme_Pro'] !== 'undefined' || 
           typeof customerInfo.entitlements.active['Skeeme_Max'] !== 'undefined';
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
