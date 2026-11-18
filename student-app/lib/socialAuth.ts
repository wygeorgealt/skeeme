import { api } from '@/lib/api';
import { Platform, Alert } from 'react-native';

type GoogleSignInPackage = typeof import('@react-native-google-signin/google-signin');

export interface SocialAuthResult {
    user: any;
    token: string;
    isNewUser: boolean;
}

let GoogleSignin: GoogleSignInPackage['GoogleSignin'] | null = null;
let statusCodes: GoogleSignInPackage['statusCodes'] | null = null;
let googleSignInInitialized = false;

async function initGoogleSignIn() {
    if (googleSignInInitialized) return;
    googleSignInInitialized = true;
    try {
        const GoogleAuthModule = await import('@react-native-google-signin/google-signin');
        GoogleSignin = GoogleAuthModule.GoogleSignin;
        statusCodes = GoogleAuthModule.statusCodes;

        GoogleSignin?.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
            offlineAccess: false,
        });
    } catch (error) {
        if (__DEV__) console.log('Google Sign-In native module not available (likely running in Expo Go or Web).', error);
    }
}

export async function exchangeGoogleAccessToken(accessToken: string, firstName = ''): Promise<SocialAuthResult> {
    if (!accessToken) throw new Error('Google did not return an access token.');
    const apiResponse = await api.post('oauth/google', {
        token: accessToken,
        device_name: `${Platform.OS}_app`,
        ...(firstName ? { first_name: firstName } : {}),
    });

    return {
        user: apiResponse.data.user,
        token: apiResponse.data.token,
        isNewUser: apiResponse.data.is_new_user,
    };
}

export async function signInWithGoogle(firstName = ''): Promise<{
    user: any;
    token: string;
    isNewUser: boolean;
} | null> {
    await initGoogleSignIn();

    if (!GoogleSignin) {
        Alert.alert(
            'Native Module Missing',
            'Google Sign-In requires a custom dev build. It will not work in Expo Go. Please run `npx expo run:android` or use EAS Build.',
        );
        return null;
    }

    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.type === 'cancelled') return null;

        // Laravel Socialite userFromToken() requires an Access Token, not an ID Token.
        const tokens = await GoogleSignin.getTokens();
        const accessToken = tokens.accessToken;

        if (!accessToken) {
            Alert.alert('Error', 'Could not retrieve access token from Google.');
            return null;
        }

        return await exchangeGoogleAccessToken(accessToken, firstName);
    } catch (error: any) {
        if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
            return null;
        } else if (error.code === statusCodes?.IN_PROGRESS) {
            return null;
        } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
            Alert.alert('Error', 'Google Play Services are not available on this device.');
            return null;
        } else {
            const message = error.response?.data?.message || error.message || 'Google Sign-In failed.';
            Alert.alert('Authentication Error', message);
            return null;
        }
    }
}

export function getSocialAuthErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object') return fallback;

    const candidate = error as {
        message?: unknown;
        response?: { data?: { message?: unknown } | string };
    };
    const responseMessage = typeof candidate.response?.data === 'string'
        ? candidate.response.data
        : candidate.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
        return responseMessage.trim();
    }
    if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message.trim();
    }
    return fallback;
}

export async function signInWithApple(firstName = ''): Promise<{
    user: any;
    token: string;
    isNewUser: boolean;
} | null> {
    if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is available on Apple devices.');
    }

    const appleAuth = await import('expo-apple-authentication');
    if (!(await appleAuth.isAvailableAsync())) {
        throw new Error('Apple Sign-In is not available on this device.');
    }

    try {
        const credential = await appleAuth.signInAsync({
            requestedScopes: [
                appleAuth.AppleAuthenticationScope.FULL_NAME,
                appleAuth.AppleAuthenticationScope.EMAIL,
            ],
        });
        if (!credential.identityToken) {
            throw new Error('Apple did not return an identity token.');
        }

        const response = await api.post('oauth/apple', {
            token: credential.identityToken,
            device_name: `${Platform.OS}_app`,
            ...(firstName ? { first_name: firstName } : {}),
        });
        return {
            user: response.data.user,
            token: response.data.token,
            isNewUser: response.data.is_new_user,
        };
    } catch (error: any) {
        if (error.code === 'ERR_REQUEST_CANCELED') return null;
        throw error;
    }
}
