import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import { openLegalLink, PRIVACY_URL, TERMS_URL } from '@/lib/legalLinks';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { signInWithGoogle } from '@/lib/socialAuth';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { IPhone } from '@solar-icons/react-native/Bold';


const MASCOT_IMAGE = require('../../assets/images/splash-icon.png');

export default function AuthSelectScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    const { setOnboardingStep, login } = useAuthStore();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Pulse animation for the glow
    const glowScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.2);

    useEffect(() => {
        setOnboardingStep(1);
        
        // Start the pulsing glow animation
        glowScale.value = withRepeat(
            withTiming(1.2, { duration: 2000 }),
            -1,
            true
        );
        glowOpacity.value = withRepeat(
            withTiming(0.4, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const animatedGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: glowOpacity.value,
    }));

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            if (result) {
                login(result.user, result.token);
                router.replace('/(drawer)');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // Match status bar and system UI
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(C.background);
    }, [C.background]);

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Mascot Area with Glow */}
            <View style={s.mascotContainer}>
                <View style={s.mascotWrapper}>
                    {/* Animated Glow Layer */}
                    <Animated.View style={[s.glowCircle, { backgroundColor: C.primary }, animatedGlowStyle]} />
                    
                    <Animated.View entering={FadeIn.duration(1000)} style={s.mascotBox}>
                        <Image 
                            source={MASCOT_IMAGE} 
                            style={[s.mascotImage, { tintColor: C.primary }]}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Content Section */}
            <View style={[s.contentArea, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
                
                <Animated.View entering={FadeInDown.duration(800).delay(300)} style={s.textSection}>
                    <Text style={[s.greeting, { color: C.primary }]}>Hi!</Text>
                    <Text style={[s.title, { color: C.text }]}>
                        I'm Skeeme,
                    </Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        Your study friend for success. Let's ace those exams together!
                    </Text>
                </Animated.View>

                {/* Auth Buttons */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)} style={s.buttonsSection}>

                    {/* Continue with Google */}
                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        activeOpacity={0.8}
                        style={[
                            s.authBtn, 
                            { 
                                borderWidth: 1, 
                                borderColor: C.separatorOpaque,
                                backgroundColor: isDark ? '#1E293B' : '#FFFFFF'
                            }
                        ]}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <LoadingSpinner size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                        ) : (
                            <>
                                <View style={s.authBtnIcon}>
                                    <Image 
                                        source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                                        style={{ width: 24, height: 24 }} 
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={[s.authBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                    Continue with Google
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Continue with Apple (iOS only) */}
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => {
                                router.push('/signup');
                            }}
                            activeOpacity={0.8}
                            style={[s.authBtn, s.appleBtn, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                        >
                            <View style={s.authBtnIcon}>
                                <IPhone size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                            </View>
                            <Text style={[s.authBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}

                    {/* Divider */}
                    <View style={s.dividerRow}>
                        <View style={[s.dividerLine, { backgroundColor: C.separator }]} />
                        <Text style={[s.dividerText, { color: C.textTertiary }]}>or</Text>
                        <View style={[s.dividerLine, { backgroundColor: C.separator }]} />
                    </View>

                    {/* Continue with Email */}
                    <TouchableOpacity
                        onPress={() => router.push('/signup')}
                        activeOpacity={0.8}
                        style={[s.emailBtn, { backgroundColor: C.primary }]}
                    >
                        <Text style={s.emailBtnText}>Continue with Email</Text>
                    </TouchableOpacity>

                    {/* Terms of Service */}
                    <View style={s.termsContainer}>
                        <Text style={[s.termsText, { color: C.textTertiary }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[s.linkText, { color: C.primary }]} onPress={() => openLegalLink(TERMS_URL)}>
                                Terms of Service
                            </Text>
                            , and confirm you have read our{' '}
                            <Text style={[s.linkText, { color: C.primary }]} onPress={() => openLegalLink(PRIVACY_URL)}>
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>

                </Animated.View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },

    // Mascot
    mascotContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    mascotWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        filter: Platform.OS === 'web' ? 'blur(40px)' : undefined, // Native blur is tricky, we use opacity + scale
    },
    mascotBox: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascotImage: {
        width: '100%',
        height: '100%',
    },

    // Content
    contentArea: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 16,
    },

    textSection: {
        marginBottom: 40,
    },
    greeting: {
        fontSize: 48,
        fontWeight: '900',
        marginBottom: -5,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 24,
    },

    // Buttons
    buttonsSection: {
        width: '100%',
        gap: 12,
    },
    authBtn: {
        width: '100%',
        height: 56,
        borderRadius: Radius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    googleBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
    },
    appleBtn: {
        // Dynamic based on theme
    },
    authBtnIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authBtnText: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
    },
    dividerText: {
        fontSize: 15,
        fontWeight: '500',
    },

    // Email button
    emailBtn: {
        width: '100%',
        height: 56,
        borderRadius: Radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emailBtnText: {
        fontWeight: '600',
        fontSize: 17,
        color: 'white',
        letterSpacing: -0.41,
    },
    
    // Terms
    termsContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    termsText: {
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },
    linkText: {
        fontWeight: '600',
    },
});