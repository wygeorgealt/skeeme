import { useEffect } from 'react';
import {
    Pressable,
    View,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { haptics } from '@/lib/haptics';
import { resetOnboardingEntrances } from '@/components/onboarding/useOnboardingEntrance';
import { Colors } from '@/constants/theme';
import { openLegalLink, PRIVACY_URL, TERMS_URL } from '@/lib/legalLinks';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { Text } from '@/components/ui/Text';

const headlineTheme = {
    backgroundColor: '#0057B8',
    textColor: '#FFDF00',
    fontFamily: 'Bungee-Regular',
    statusBarStyle: 'light' as const,
};

export default function AuthSelectScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(1);
    }, [setOnboardingStep]);

    const handleGetStarted = () => {
        haptics.selectionAsync();
        resetOnboardingEntrances();
        router.push('/(onboarding)/start');
    };

    const handleLogin = () => {
        haptics.selectionAsync();
        router.push('/login');
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: headlineTheme.backgroundColor },
            ]}
        >
            <StatusBar style={headlineTheme.statusBarStyle} />
            <View
                style={[
                    styles.content,
                    {
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom + 16, 28),
                    },
                ]}
            >
                <View style={styles.mascotStage}>
                    <AnimatedMascot />
                </View>
                <View style={styles.actions}>
                    <View
                        style={styles.headline}
                        accessible
                        accessibilityRole="header"
                        accessibilityLabel="Turn pages into. Bright ideas."
                    >
                        <Text
                            style={[
                                styles.headlineIntro,
                                { color: headlineTheme.textColor },
                            ]}
                        >
                            Turn pages into
                        </Text>
                        <View
                            style={[
                                styles.headlineHighlight,
                                {
                                    backgroundColor:
                                        headlineTheme.backgroundColor,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.headlineEmphasis,
                                    {
                                        color: headlineTheme.textColor,
                                        fontFamily: headlineTheme.fontFamily,
                                    },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.75}
                            >
                                BRIGHT IDEAS
                            </Text>
                        </View>
                    </View>
                    <AnimatedButton
                        title="Get started"
                        onPress={handleGetStarted}
                        type="capsule"
                        backgroundColor={headlineTheme.textColor}
                        shadowColor="#FFDF00"
                        textColor={headlineTheme.backgroundColor}
                        minHeight={58}
                        style={styles.button}
                        textStyle={styles.buttonText}
                        fullWidth={false}
                    />
                    <View style={styles.accountPrompt}>
                        <Text
                            style={[
                                styles.accountPromptText,
                                { color: headlineTheme.textColor },
                            ]}
                        >
                            Not New?
                        </Text>
                        <Pressable
                            accessibilityRole="link"
                            onPress={handleLogin}
                            style={styles.loginLinkTarget}
                        >
                            <Text
                                style={[
                                    styles.loginLink,
                                    { color: headlineTheme.textColor },
                                ]}
                            >
                                Log in
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'flex-end',
    },
    mascotStage: {
        flex: 1,
        minHeight: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
    },
    headline: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 36,
    },
    headlineIntro: {
        fontFamily: 'Satoshi-Bold',
        color: '#007AFF',
        fontSize: 32,
        lineHeight: 40,
        textAlign: 'center',
    },
    headlineHighlight: {
        alignSelf: 'center',
        maxWidth: '100%',
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#FFDF00',
        borderRadius: 4,
    },
    headlineEmphasis: {
        fontFamily: 'Satoshi-Black',
        includeFontPadding: false,
        color: '#003B95',
        fontSize: 40,
        lineHeight: 48,
        textAlign: 'center',
    },
    button: {
        width: '84%',
        alignSelf: 'center',
        marginBottom: 0,
    },
    buttonText: {
        fontFamily: 'Satoshi-Black',
        fontSize: 18,
        fontWeight: '900',
    },
    accountPrompt: {
        marginTop: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 4,
    },
    accountPromptText: {
        fontFamily: 'Satoshi-Regular',
        color: Colors.light.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    loginLinkTarget: {
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginLink: {
        fontFamily: 'Satoshi-Bold',
        color: Colors.light.primaryText,
        fontWeight: '700',
    },
    legalPrompt: {
        marginTop: 5,
        alignItems: 'center',
    },
    legalCopy: {
        fontFamily: 'Satoshi-Regular',
        color: Colors.light.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
    legalLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center',
        columnGap: 4,
    },
    legalLinkTarget: {
        minWidth: 44,
        minHeight: 44,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    legalConjunction: {
        fontFamily: 'Satoshi-Regular',
        color: Colors.light.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },
    legalLink: {
        fontFamily: 'Satoshi-Medium',
        color: Colors.light.primaryText,
        fontWeight: '500',
        lineHeight: 18,
    },
});
