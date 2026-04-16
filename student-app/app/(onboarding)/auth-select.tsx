import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Platform, Dimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

const HERO_VIDEO = require('../../assets/videos/hero_scan.mp4');

export default function AuthSelectScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    // Make the native status bar area match the video's dark tone
    useEffect(() => {
        SystemUI.setBackgroundColorAsync('#2C1810');
        return () => {
            // Revert to theme color when leaving this screen
            SystemUI.setBackgroundColorAsync(isDark ? '#000000' : '#F2F2F7');
        };
    }, []);

    const player = useVideoPlayer(HERO_VIDEO, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    const SCREEN_H = Dimensions.get('screen').height;
    const videoHeight = useSharedValue(SCREEN_H);

    useEffect(() => {
        videoHeight.value = withDelay(2000, withSpring(SCREEN_H * 0.55, { damping: 15, stiffness: 100 }));
    }, []);

    const animatedVideoStyle = useAnimatedStyle(() => {
        return {
            height: videoHeight.value,
        };
    });

    const openLink = (url: string) => Linking.openURL(url);

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>

            {/* Hero Video Area */}
            <Animated.View style={[s.videoContainer, animatedVideoStyle]}>
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    nativeControls={false}
                    contentFit="cover"
                />
                {/* Gradient overlay at the bottom of the video */}
                <View style={[s.videoOverlay, { 
                    backgroundColor: isDark 
                        ? 'rgba(0,0,0,0.4)' 
                        : 'rgba(255,255,255,0.3)' 
                }]} />
                {/* Bottom fade into background */}
                <View style={[s.videoFade, { 
                    backgroundColor: C.background 
                }]} />
            </Animated.View>

            {/* Content Section */}
            <View style={[s.contentArea, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
                <View style={s.spacer} />

                <Animated.View entering={FadeInDown.duration(600).delay(2200)} style={s.textSection}>
                    <Text style={[s.title, { color: C.text }]}>
                        Study smarter,{'\n'}not harder
                    </Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        Snap photos, get instant solutions, and ace your exams with AI-powered study tools.
                    </Text>
                </Animated.View>

                {/* Auth Buttons */}
                <Animated.View entering={FadeInDown.duration(600).delay(2400)} style={s.buttonsSection}>

                    {/* Continue with Google */}
                    <TouchableOpacity
                        onPress={() => {
                            // TODO: Wire up expo-auth-session Google login
                            // For now, route to email sign up
                            router.push('/signup');
                        }}
                        activeOpacity={0.8}
                        style={[s.authBtn, s.googleBtn]}
                    >
                        <View style={s.authBtnIcon}>
                            <Text style={{ fontSize: 18 }}>G</Text>
                        </View>
                        <Text style={[s.authBtnText, { color: '#000000' }]}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Continue with Apple (iOS only) */}
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => {
                                // TODO: Wire up expo-apple-authentication
                                // For now, route to email sign up
                                router.push('/signup');
                            }}
                            activeOpacity={0.8}
                            style={[s.authBtn, s.appleBtn]}
                        >
                            <View style={s.authBtnIcon}>
                                <IconSymbol name="apple.logo" size={20} color="#FFFFFF" />
                            </View>
                            <Text style={[s.authBtnText, { color: '#FFFFFF' }]}>Continue with Apple</Text>
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
                        style={s.emailBtn}
                    >
                        <Text style={s.emailBtnText}>Continue with Email</Text>
                    </TouchableOpacity>

                    {/* Terms of Service */}
                    <View style={s.termsContainer}>
                        <Text style={[s.termsText, { color: C.textTertiary }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[s.linkText, { color: '#007AFF' }]} onPress={() => openLink('https://skeeme.com/terms')}>
                                Terms of Service
                            </Text>
                            , and confirm you have read our{' '}
                            <Text style={[s.linkText, { color: '#007AFF' }]} onPress={() => openLink('https://skeeme.com/privacy')}>
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

    // Video
    videoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    videoFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },

    // Content
    contentArea: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    spacer: { flex: 1 },

    textSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 41,
        marginBottom: 12,
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
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    googleBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    appleBtn: {
        backgroundColor: '#000000',
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
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
    },
    dividerText: {
        fontSize: 15,
        fontWeight: '500',
    },

    // Email button (styled like Agree & Continue)
    emailBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#007AFF',
        borderRadius: 16,
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
        marginTop: 16,
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
