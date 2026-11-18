import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { getSocialAuthErrorMessage } from '@/lib/socialAuth';
import type { GoogleSignInButtonProps } from './GoogleSignInButton';

interface GoogleTokenResponse {
    access_token?: string;
    error?: string;
    error_description?: string;
}

interface GoogleTokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: GoogleTokenResponse) => void;
                        error_callback?: (error: { message?: string }) => void;
                    }) => GoogleTokenClient;
                };
            };
        };
    }
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

function GoogleWebSignIn({ clientId, ...props }: GoogleSignInButtonProps & { clientId: string }) {
    const [scriptReady, setScriptReady] = useState(
        () => typeof window !== 'undefined' && Boolean(window.google?.accounts.oauth2),
    );
    const [scriptError, setScriptError] = useState(false);

    useEffect(() => {
        if (window.google?.accounts.oauth2) {
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
            `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`,
        );
        const script = existingScript ?? document.createElement('script');
        const handleLoad = () => {
            if (window.google?.accounts.oauth2) setScriptReady(true);
            else setScriptError(true);
        };
        const handleError = () => setScriptError(true);

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        if (!existingScript) {
            script.src = GOOGLE_IDENTITY_SCRIPT;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        return () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
        };
    }, []);

    const handlePress = () => {
        if (!scriptReady || !window.google?.accounts.oauth2) return;

        props.onStart();
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'openid profile email',
                callback: (response) => {
                    if (response.error) {
                        props.onError(response.error_description || 'Google Sign-In failed.');
                    } else if (response.access_token) {
                        void props.onToken(response.access_token)
                            .catch((error: unknown) => {
                                props.onError(getSocialAuthErrorMessage(error, 'Google Sign-In failed.'));
                            })
                            .finally(props.onFinish);
                        return;
                    } else {
                        props.onError('Google did not return an access token.');
                    }
                    props.onFinish();
                },
                error_callback: (error) => {
                    props.onError(error.message || 'Google Sign-In could not be opened.');
                    props.onFinish();
                },
            });
            client.requestAccessToken();
        } catch (error) {
            props.onError(getSocialAuthErrorMessage(error, 'Google Sign-In could not be started.'));
            props.onFinish();
        }
    };

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                disabled: props.disabled || !scriptReady || scriptError,
                busy: props.busy,
            }}
            disabled={props.disabled || !scriptReady || scriptError}
            onPress={handlePress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: props.backgroundColor, borderColor: props.borderColor },
                pressed && !props.busy ? styles.pressed : null,
                props.disabled || !scriptReady || scriptError ? styles.disabled : null,
            ]}
        >
            {props.busy ? (
                <ActivityIndicator color={props.textColor} />
            ) : (
                <FontAwesome name="google" size={18} color="#4285F4" />
            )}
            <Text style={[styles.label, { color: props.textColor }]}>
                {scriptError
                    ? 'Google Sign-In unavailable'
                    : props.busy
                        ? 'Connecting to Google…'
                        : 'Continue with Google'}
            </Text>
            <View style={styles.trailingSpace} />
        </Pressable>
    );
}

export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (clientId) return <GoogleWebSignIn clientId={clientId} {...props} />;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: props.disabled || props.busy, busy: props.busy }}
            disabled={props.disabled || props.busy}
            onPress={() => props.onError('Google Sign-In is not configured for this web build. Continue with email instead.')}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: props.backgroundColor, borderColor: props.borderColor },
                pressed ? styles.pressed : null,
                props.disabled || props.busy ? styles.disabled : null,
            ]}
        >
            <FontAwesome name="google" size={18} color="#4285F4" />
            <Text style={[styles.label, { color: props.textColor }]}>Continue with Google</Text>
            <View style={styles.trailingSpace} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    },
    trailingSpace: {
        width: 18,
    },
    pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.985 }],
    },
    disabled: {
        opacity: 0.55,
    },
});
