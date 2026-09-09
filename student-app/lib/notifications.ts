import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { syncPushTokenIfNeeded } from '@/lib/pushToken';
import { isRunningInExpoGo } from 'expo';

// On Android, remote notifications were removed from Expo Go in SDK 53+.
// Attempting to import or configure them in Expo Go causes an immediate fatal error.
const isAndroidExpoGo = Platform.OS === 'android' && isRunningInExpoGo();

let Notifications: typeof import('expo-notifications') | null = null;
if (!isAndroidExpoGo) {
    try {
        Notifications = require('expo-notifications');
    } catch (e) {
        if (__DEV__) console.warn('[Notifications] Failed to load expo-notifications:', e);
    }
}

// Recommended default behavior
if (Notifications) {
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (e) {
        if (__DEV__) console.warn('[Notifications] Failed to set notification handler:', e);
    }
}

/**
 * Register for push notifications and sync with the backend.
 */
export async function registerForPushNotificationsAsync(authToken?: string | null) {
    if (isAndroidExpoGo || !Notifications) {
        if (__DEV__) {
            console.log('[Notifications] Push notifications are not supported in Expo Go on Android (SDK 53+). Use a development build to test push notifications.');
        }
        return null;
    }

    let token;

    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#A1C4FD',
            });
        } catch (e) {
            if (__DEV__) console.warn('[Notifications] setNotificationChannelAsync error:', e);
        }
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // User denied push permission
            return;
        }
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                if (__DEV__) console.warn('EAS Project ID not found. Ensure app.json has extra.eas.projectId defined.');
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;

            // Sync with backend once per session (guarded)
            if (token) {
                const synced = await syncPushTokenIfNeeded(token, authToken ?? null);
                if (!synced && __DEV__ && !authToken) {
                    console.log('Got push token but user not logged in. Will sync later:', token);
                }
            }
        } catch (e) {
            if (__DEV__) console.error('Push Token Error:', e);
        }
    } else {
        if (__DEV__) console.log('Must use physical device for Push Notifications');
    }

    return token;
}
