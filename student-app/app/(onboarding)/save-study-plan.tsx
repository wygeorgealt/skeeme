import { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme,
    useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import StudyGlowMascot from '@/components/StudyGlowMascot';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AppleSignInButton from '@/components/AppleSignInButton';
import {
    exchangeGoogleAccessToken,
    getSocialAuthErrorMessage,
    signInWithApple,
    signInWithGoogle,
    type SocialAuthResult,
} from '@/lib/socialAuth';
import { getCompletedOnboardingAnswers } from '@/lib/onboardingAnswers';
import { saveOnboardingToAccount } from '@/lib/saveOnboardingToAccount';
import { openLegalLink, PRIVACY_URL, TERMS_URL } from '@/lib/legalLinks';
import { useAuthStore } from '@/store/authStore';

type Provider = 'google' | 'apple';

export default function SaveStudyPlanScreen() {
    const router = useRouter();
    const { devPreview } = useLocalSearchParams<{ devPreview?: string }>();
    const insets = useSafeAreaInsets();
    const { height, width } = useWindowDimensions();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const {
        onboardingData,
        login,
    } = useAuthStore();
    const answers = getCompletedOnboardingAnswers(onboardingData);
    const isDevPreview = __DEV__ && devPreview === 'true';
    const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const contentWidth = Math.max(0, Math.min(width - 48, 480));
    const mascotSize = Math.min(
        208,
        Math.max(160, Math.min(width - 96, (height - insets.top - insets.bottom) * 0.27)),
    );

    const attachPlanAndContinue = async (result: SocialAuthResult) => {
        if (!answers) {
            throw new Error('Your study plan is incomplete. Go back and finish onboarding, then try again.');
        }

        await login(result.user, result.token);
        try {
            await saveOnboardingToAccount();
        } catch (error) {
            const detail = getSocialAuthErrorMessage(error, 'Please try again.');
            throw new Error(
                `Your account is ready, but your study plan could not be saved. ` +
                `Your answers are still on this device. ${detail}`,
            );
        }

        router.replace('/(drawer)/(tabs)');
    };

    const handleNativeSignIn = async (provider: Provider) => {
        if (loadingProvider) return;
        if (!answers) {
            setErrorMessage('Your study plan is incomplete. Go back and finish onboarding, then try again.');
            return;
        }

        setLoadingProvider(provider);
        setErrorMessage('');
        try {
            const result = provider === 'google'
                ? await signInWithGoogle(onboardingData.first_name ?? '')
                : await signInWithApple(onboardingData.first_name ?? '');
            if (result) await attachPlanAndContinue(result);
        } catch (error) {
            setErrorMessage(getSocialAuthErrorMessage(error, `${provider} Sign-In failed.`));
        } finally {
            setLoadingProvider(null);
        }
    };

    const handleGoogleWebStart = () => {
        setLoadingProvider('google');
        setErrorMessage('');
    };

    const handleGoogleWebToken = async (accessToken: string) => {
        if (!answers) {
            throw new Error('Your study plan is incomplete. Go back and finish onboarding, then try again.');
        }
        const result = await exchangeGoogleAccessToken(accessToken, onboardingData.first_name ?? '');
        await attachPlanAndContinue(result);
    };

    const errorColor = isDark ? '#FDA29B' : '#B42318';
    const googleButton = (
        <GoogleSignInButton
            busy={loadingProvider === 'google'}
            disabled={!answers || loadingProvider !== null}
            backgroundColor={C.card}
            borderColor={isDark ? C.borderStrong : '#D0D5DD'}
            textColor={C.text}
            onPress={() => {
                if (Platform.OS === 'web') {
                    setErrorMessage('Google Sign-In is not configured for this web build. Continue with email instead.');
                } else {
                    void handleNativeSignIn('google');
                }
            }}
            onStart={handleGoogleWebStart}
            onToken={handleGoogleWebToken}
            onError={setErrorMessage}
            onFinish={() => setLoadingProvider(null)}
        />
    );

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 8,
                        paddingBottom: Math.max(insets.bottom, 24) + 16,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.content, { width: contentWidth }]}>
                    <View style={styles.header}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={isDevPreview ? 'Back to sign-in options' : 'Back to reminders'}
                            hitSlop={8}
                            onPress={() => router.replace(
                                isDevPreview
                                    ? '/(onboarding)/auth-select'
                                    : '/(onboarding)/reminders',
                            )}
                            style={({ pressed }) => [
                                styles.backButton,
                                pressed ? styles.pressed : null,
                            ]}
                        >
                            <ArrowLeft size={20} color={C.text} />
                        </Pressable>
                    </View>

                    <View style={styles.hero}>
                        <StudyGlowMascot size={mascotSize} />
                        <Text accessibilityRole="header" style={[styles.title, { color: C.text }]}>
                            Save your study plan
                        </Text>
                        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
                            Your notes and ideas go wherever you do. Pick up right where you left off, on any device.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {!answers ? (
                            <Text
                                accessibilityLiveRegion="polite"
                                style={[styles.error, { color: errorColor }]}
                            >
                                Your study plan is incomplete. Go back to finish onboarding, then try again.
                            </Text>
                        ) : null}
                        {errorMessage ? (
                            <Text
                                accessibilityLiveRegion="polite"
                                style={[styles.error, { color: errorColor }]}
                            >
                                {errorMessage}
                            </Text>
                        ) : null}

                        <View style={styles.providers}>
                            {Platform.OS === 'ios' ? (
                                loadingProvider === 'apple' ? (
                                    <View
                                        style={[
                                            styles.appleLoading,
                                            { backgroundColor: isDark ? '#FFFFFF' : '#000000' },
                                        ]}
                                    >
                                        <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
                                        <Text
                                            style={[
                                                styles.appleLoadingLabel,
                                                { color: isDark ? '#000000' : '#FFFFFF' },
                                            ]}
                                        >
                                            Connecting to Apple…
                                        </Text>
                                    </View>
                                ) : (
                                    <AppleSignInButton
                                        dark={isDark}
                                        disabled={!answers || loadingProvider !== null}
                                        onPress={() => void handleNativeSignIn('apple')}
                                    />
                                )
                            ) : null}
                            {googleButton}
                        </View>

                        <View style={styles.divider} accessibilityElementsHidden>
                            <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                            <Text style={[styles.dividerLabel, { color: C.textSecondary }]}>or</Text>
                            <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Continue with email"
                            accessibilityState={{ disabled: !answers || loadingProvider !== null }}
                            disabled={!answers || loadingProvider !== null}
                            onPress={() => router.push('/signup')}
                            style={({ pressed }) => [
                                styles.emailButton,
                                {
                                    backgroundColor: C.primaryLight,
                                    borderColor: C.selectedBorder,
                                },
                                pressed && loadingProvider === null ? styles.pressed : null,
                                !answers || loadingProvider !== null ? styles.disabled : null,
                            ]}
                        >
                            <Mail size={18} color={C.primaryText} />
                            <Text style={[styles.emailLabel, { color: C.primaryText }]}>
                                Continue with email
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityRole="link"
                            disabled={loadingProvider !== null}
                            onPress={() => router.push({ pathname: '/login', params: { saveStudyPlan: 'true' } })}
                            style={styles.loginLink}
                        >
                            <Text style={[styles.loginText, { color: C.textSecondary }]}>
                                Already have an account?{' '}
                                <Text style={[styles.loginEmphasis, { color: C.primaryText }]}>
                                    Log in
                                </Text>
                            </Text>
                        </Pressable>

                        <Text style={[styles.legal, { color: C.textSecondary }]}>
                            By continuing, you agree to our{' '}
                            <Text
                                accessibilityRole="link"
                                onPress={() => openLegalLink(TERMS_URL)}
                                style={[styles.legalLink, { color: C.primaryText }]}
                            >
                                Terms of Service
                            </Text>
                            {' '}and confirm you&apos;ve read our{' '}
                            <Text
                                accessibilityRole="link"
                                onPress={() => openLegalLink(PRIVACY_URL)}
                                style={[styles.legalLink, { color: C.primaryText }]}
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        flexGrow: 1,
        maxWidth: 480,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    hero: {
        width: '100%',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        width: '100%',
        paddingTop: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        lineHeight: 39,
        fontWeight: '800',
        letterSpacing: -0.8,
        textAlign: 'center',
        marginTop: 0,
    },
    subtitle: {
        maxWidth: 420,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 0,
    },
    providers: {
        width: '100%',
        gap: 10,
    },
    appleLoading: {
        width: '100%',
        minHeight: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    appleLoadingLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 14,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
    },
    dividerLabel: {
        fontSize: 13,
    },
    emailButton: {
        width: '100%',
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginTop: 4,
    },
    emailLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    error: {
        width: '100%',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 14,
    },
    loginLink: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },
    loginText: {
        fontSize: 15,
        textAlign: 'center',
    },
    loginEmphasis: {
        fontWeight: '700',
    },
    legal: {
        maxWidth: 400,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 10,
    },
    legalLink: {
        fontWeight: '700',
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
    },
    pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.985 }],
    },
    disabled: {
        opacity: 0.55,
    },
});
