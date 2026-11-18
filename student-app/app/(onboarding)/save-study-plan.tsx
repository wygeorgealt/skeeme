import { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
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

const theme = {
    backgroundColor: '#0057B8',
    textColor: '#FFDF00',
    statusBarStyle: 'light' as const,
};

type Provider = 'google' | 'apple';

export default function SaveStudyPlanScreen() {
    const router = useRouter();
    const { devPreview } = useLocalSearchParams<{ devPreview?: string }>();
    const insets = useSafeAreaInsets();
    const { height, width } = useWindowDimensions();
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
        210,
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

    const googleButton = (
        <GoogleSignInButton
            busy={loadingProvider === 'google'}
            disabled={!answers || loadingProvider !== null}
            backgroundColor="#FFFFFF"
            borderColor="transparent"
            textColor="#1F2937"
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
        <View style={[styles.root, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar style={theme.statusBarStyle} />

            {/* Pinned top navigation header — high up like other onboarding pages */}
            <View
                style={[
                    styles.header,
                    {
                        top: insets.top + 4,
                    },
                ]}
            >
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={isDevPreview ? 'Back to sign-in options' : 'Back to reminders'}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                    onPress={() => router.replace(
                        isDevPreview
                            ? '/(onboarding)/auth-select'
                            : '/(onboarding)/reminders',
                    )}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.textColor} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 52,
                        paddingBottom: Math.max(insets.bottom + 16, 28),
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.content, { width: contentWidth }]}>
                    <View style={styles.hero}>
                        {/* 3D floor with papers lying flat around & under Skeemy */}
                        <View style={[styles.mascotStage, { width: mascotSize, height: mascotSize }]}>
                            <ScatteredStudyFloor mascotSize={mascotSize} />
                            <View style={{ transform: [{ translateY: -16 }] }}>
                                <StudyGlowMascot size={mascotSize} />
                            </View>
                            <ScatteredStudyFloorFront mascotSize={mascotSize} />
                        </View>

                        <View
                            style={styles.headline}
                            accessible
                            accessibilityRole="header"
                            accessibilityLabel="Save your study plan"
                        >
                            <Text style={styles.title}>
                                Save your <Text style={styles.titleBold}>study plan</Text>
                            </Text>
                        </View>

                        <Text style={styles.subtitle}>
                            Your notes, revisions, and rhythm stay synced wherever you go. Pick up right where you left off.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {!answers ? (
                            <Text
                                accessibilityLiveRegion="polite"
                                style={styles.error}
                            >
                                Your study plan is incomplete. Go back to finish onboarding, then try again.
                            </Text>
                        ) : null}
                        {errorMessage ? (
                            <Text
                                accessibilityLiveRegion="polite"
                                style={styles.error}
                            >
                                {errorMessage}
                            </Text>
                        ) : null}

                        <View style={styles.providers}>
                            {Platform.OS === 'ios' ? (
                                loadingProvider === 'apple' ? (
                                    <View style={styles.appleLoading}>
                                        <ActivityIndicator color="#000000" />
                                        <Text style={styles.appleLoadingLabel}>
                                            Connecting to Apple…
                                        </Text>
                                    </View>
                                ) : (
                                    <AppleSignInButton
                                        dark={true}
                                        disabled={!answers || loadingProvider !== null}
                                        onPress={() => void handleNativeSignIn('apple')}
                                    />
                                )
                            ) : null}
                            {googleButton}
                        </View>

                        <Text style={styles.legal}>
                            By continuing, you agree to our{' '}
                            <Text
                                accessibilityRole="link"
                                onPress={() => openLegalLink(TERMS_URL)}
                                style={styles.legalLink}
                            >
                                Terms of Service
                            </Text>
                            {' '}and confirm you&apos;ve read our{' '}
                            <Text
                                accessibilityRole="link"
                                onPress={() => openLegalLink(PRIVACY_URL)}
                                style={styles.legalLink}
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

/**
 * 3D perspective floor layer (BEHIND Skeemy):
 * Papers lying flat on the floor plane under and around his base,
 * with a soft grounding contact shadow directly beneath him.
 */
function ScatteredStudyFloor({ mascotSize }: { mascotSize: number }) {
    const scale = mascotSize / 210;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Grounding contact shadow directly underneath Skeemy's base */}
            <View
                style={[
                    styles.groundShadow,
                    {
                        width: 140 * scale,
                        height: 38 * scale,
                        borderRadius: 70 * scale,
                        bottom: 12 * scale,
                        alignSelf: 'center',
                    },
                ]}
            />

            {/* Flat Paper 1: Bottom sheet of back-left stack */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 58 * scale,
                        height: 74 * scale,
                        left: -20 * scale,
                        bottom: 18 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '68deg' },
                            { rotateZ: '-34deg' },
                        ],
                    },
                ]}
            />

            {/* Flat Paper 2: Top sheet of back-left stack (ruled notebook lines) */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 60 * scale,
                        height: 76 * scale,
                        left: -12 * scale,
                        bottom: 22 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '68deg' },
                            { rotateZ: '-18deg' },
                        ],
                    },
                ]}
            >
                <View style={[styles.paperLine, { width: '85%' }]} />
                <View style={[styles.paperLine, { width: '92%' }]} />
                <View style={[styles.paperLine, { width: '60%' }]} />
            </View>

            {/* Flat Paper 3: Far-left angled sheet with yellow highlight marker */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 52 * scale,
                        height: 66 * scale,
                        left: -48 * scale,
                        bottom: 34 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '66deg' },
                            { rotateZ: '-44deg' },
                        ],
                    },
                ]}
            >
                <View style={styles.paperHighlight} />
                <View style={[styles.paperLine, { width: '75%' }]} />
                <View style={[styles.paperLine, { width: '50%' }]} />
            </View>

            {/* Flat Paper 4: Back-right exam sheet with dog-ear corner */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 62 * scale,
                        height: 78 * scale,
                        right: -16 * scale,
                        bottom: 20 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '68deg' },
                            { rotateZ: '22deg' },
                        ],
                    },
                ]}
            >
                <View style={styles.paperDogEar} />
                <View style={[styles.paperLine, { width: '75%' }]} />
                <View style={[styles.paperLine, { width: '85%' }]} />
                <View style={[styles.paperLine, { width: '55%' }]} />
            </View>

            {/* Flat Paper 5: Far-right tilted loose paper */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 54 * scale,
                        height: 68 * scale,
                        right: -44 * scale,
                        bottom: 34 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '66deg' },
                            { rotateZ: '38deg' },
                        ],
                    },
                ]}
            >
                <View style={[styles.paperLine, { width: '90%' }]} />
                <View style={[styles.paperLine, { width: '70%' }]} />
            </View>
        </View>
    );
}

/**
 * 3D perspective floor layer (IN FRONT of Skeemy):
 * Papers lying flat on the floor in front of Skeemy's base for full 3D surrounding depth.
 */
function ScatteredStudyFloorFront({ mascotSize }: { mascotSize: number }) {
    const scale = mascotSize / 210;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Flat Paper 6: Front-left note resting flat on the ground in front */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 66 * scale,
                        height: 80 * scale,
                        left: 14 * scale,
                        bottom: -22 * scale,
                        transform: [
                            { perspective: 450 },
                            { rotateX: '70deg' },
                            { rotateZ: '-14deg' },
                        ],
                    },
                ]}
            >
                <View style={[styles.paperLine, { width: '88%' }]} />
                <View style={[styles.paperLine, { width: '75%' }]} />
                <View style={[styles.paperLine, { width: '50%' }]} />
            </View>

            {/* Flat Paper 7: Front-right yellow sticky note flat on the floor */}
            <View
                style={[
                    styles.flatPaper,
                    {
                        width: 50 * scale,
                        height: 54 * scale,
                        right: 20 * scale,
                        bottom: -20 * scale,
                        backgroundColor: '#FFFBEA',
                        transform: [
                            { perspective: 450 },
                            { rotateX: '70deg' },
                            { rotateZ: '18deg' },
                        ],
                    },
                ]}
            >
                <View style={styles.paperStickyBand} />
                <View style={[styles.paperLine, { width: '80%', marginTop: 3 }]} />
                <View style={[styles.paperLine, { width: '60%' }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        left: 20,
        zIndex: 20,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        flexGrow: 1,
        maxWidth: 480,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    hero: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 4,
    },
    mascotStage: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 43,
    },
    headline: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontFamily: 'Allo-Bold',
        fontSize: 32,
        lineHeight: 40,
        textAlign: 'center',
        color: '#FFDF00',
        letterSpacing: -0.5,
    },
    titleBold: {
        fontFamily: 'Allo-Black',
        color: '#FFDF00',
    },
    subtitle: {
        fontFamily: 'Allo-Medium',
        maxWidth: 360,
        fontSize: 14.5,
        lineHeight: 21,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: 6,
        marginBottom: 16,
    },
    actions: {
        width: '100%',
        paddingTop: 0,
    },
    providers: {
        width: '100%',
        gap: 12,
    },
    appleLoading: {
        width: '100%',
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    appleLoadingLabel: {
        fontFamily: 'Allo-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    error: {
        width: '100%',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        color: '#FFDF00',
        marginBottom: 12,
    },
    legal: {
        maxWidth: 400,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 16,
    },
    legalLink: {
        fontFamily: 'Allo-Bold',
        fontWeight: '700',
        color: '#FFDF00',
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
    },
    disabled: {
        opacity: 0.55,
    },

    /* 3D Floor Plane & Flat Papers */
    groundShadow: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 20, 60, 0.45)',
        transform: [{ scaleY: 0.35 }],
    },
    flatPaper: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        padding: 5,
        justifyContent: 'center',
        shadowColor: '#001A40',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        elevation: 2,
    },
    paperLine: {
        height: 2,
        backgroundColor: '#CBD5E1',
        borderRadius: 1,
        marginBottom: 3.5,
    },
    paperHighlight: {
        height: 3,
        width: '100%',
        backgroundColor: '#FFDF00',
        borderRadius: 1,
        marginBottom: 4,
    },
    paperStickyBand: {
        height: 5,
        width: '100%',
        backgroundColor: '#FFE600',
        borderRadius: 1,
        marginBottom: 3,
    },
    paperDogEar: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderRightWidth: 8,
        borderTopColor: '#0057B8',
        borderRightColor: '#CBD5E1',
        borderBottomLeftRadius: 2,
    },
});
