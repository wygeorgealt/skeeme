import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '@/lib/api';

// Recommended default behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and sync with the backend.
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2EBD85',
        });
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
                console.warn('EAS Project ID not found. Ensure app.json has extra.eas.projectId defined.');
            }
            
            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            
            // Sync with backend
            if (token) {
                await api.post('/device-token', { expo_push_token: token });
                console.log('Successfully synced push token to backend:', token);
            }
        } catch (e) {
            console.error('Push Token Error:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
