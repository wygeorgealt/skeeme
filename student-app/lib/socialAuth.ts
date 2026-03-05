import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { api } from '@/lib/api';
import { Platform, Alert } from 'react-native';

// ─── CONFIGURATION ─────────────────────────────────────────────────────────
// Configure Google Sign-In with your Web Client ID from Google Cloud Console.
// This MUST be the Web Client ID (not the iOS or Android one).
// Set this in your .env as EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    offlineAccess: false,
});

// ─── GOOGLE SIGN IN ────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{
    user: any;
    token: string;
    isNewUser: boolean;
} | null> {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        // The idToken is what we send to our Laravel backend for verification
        const idToken = response.data?.idToken;

        if (!idToken) {
            Alert.alert('Error', 'Could not retrieve authentication token from Google.');
            return null;
        }

        // Exchange the Google id_token with our Laravel API for a Sanctum token
        const apiResponse = await api.post('/student/oauth/google', {
            token: idToken,
            device_name: `${Platform.OS}_app`,
        });

        return {
            user: apiResponse.data.user,
            token: apiResponse.data.token,
            isNewUser: apiResponse.data.is_new_user,
        };
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // User cancelled - do nothing
            return null;
        } else if (error.code === statusCodes.IN_PROGRESS) {
            // Sign in already in progress
            return null;
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            Alert.alert('Error', 'Google Play Services are not available on this device.');
            return null;
        } else {
            // API or network error
            const message = error.response?.data?.message || error.message || 'Google Sign-In failed.';
            Alert.alert('Authentication Error', message);
            return null;
        }
    }
}

// ─── APPLE SIGN IN (Placeholder) ───────────────────────────────────────────
// Apple Sign-In requires `expo-apple-authentication` which is iOS-only.
// Implementation will follow the same pattern: get the identity token from
// Apple's native SDK, then POST it to /student/oauth/apple.

export async function signInWithApple(): Promise<{
    user: any;
    token: string;
    isNewUser: boolean;
} | null> {
    Alert.alert('Coming Soon', 'Apple Sign-In will be available soon.');
    return null;
}
