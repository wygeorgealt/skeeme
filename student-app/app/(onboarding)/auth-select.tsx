import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    Image,
    ScrollView,
    ActivityIndicator,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { openLegalLink, PRIVACY_URL, TERMS_URL } from '@/lib/legalLinks';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signInWithGoogle } from '@/lib/socialAuth';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GoogleIcon, AppleIcon } from '@/components/ui/BrandIcons';
import { Icon } from '@/components/ui/Icon';
import { haptics } from '@/lib/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive card sizing
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 310);
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.38, 335);

const SLIDES = [
    {
        id: 0,
        image: require('../../assets/images/welcome/slide_0.jpg'),
        bgTop: '#BDF2FC',
        bgBottom: '#00CAE9',
        badge1: {
            text: 'personalized',
            position: 'topLeft' as const,
            bgColor: '#FDE047',
            textColor: '#1C1917',
            borderColor: '#FCD34D',
        },
        badge2: {
            text: 'Interactive',
            position: 'bottomRight' as const,
            bgColor: '#10B981',
            textColor: '#FFFFFF',
            borderColor: '#34D399',
        },
        title: 'Classes made\nfor you only',
        subtitle: 'Interactive and personalized sessions make you learn faster, even when you feel stuck.',
    },
    {
        id: 1,
        image: require('../../assets/images/welcome/slide_1.jpg'),
        bgTop: '#FAE4FD',
        bgBottom: '#CAA0F8',
        badge1: {
            text: 'set goals',
            position: 'topRight' as const,
            bgColor: '#FED7AA',
            textColor: '#451A03',
            borderColor: '#FDBA74',
        },
        badge2: {
            text: 'Trivia',
            position: 'bottomLeft' as const,
            bgColor: '#059669',
            textColor: '#FFFFFF',
            borderColor: '#34D399',
        },
        title: 'Start Learning\nAny Topic',
        subtitle: 'Turn lectures, notes, and worksheets into instant practice quizzes & visual summaries.',
    },
    {
        id: 2,
        image: require('../../assets/images/welcome/slide_2.jpg'),
        bgTop: '#D1FAE5',
        bgBottom: '#34D399',
        badge1: {
            text: 'Active Recall',
            position: 'topLeft' as const,
            bgColor: '#A7F3D0',
            textColor: '#064E3B',
            borderColor: '#6EE7B7',
        },
        badge2: {
            text: 'Step-by-step',
            position: 'bottomRight' as const,
            bgColor: '#7C3AED',
            textColor: '#FFFFFF',
            borderColor: '#A78BFA',
        },
        title: 'Ace Every Exam\nWith Confidence',
        subtitle: 'Smart spaced repetition flashcards that guarantee effortless long-term retention.',
    },
];

export default function AuthSelectScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setOnboardingStep, login } = useAuthStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    // Floating animation values for badges
    const floatAnim1 = useSharedValue(0);
    const floatAnim2 = useSharedValue(0);

    useEffect(() => {
        setOnboardingStep(1);

        floatAnim1.value = withRepeat(
            withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
        );
        floatAnim2.value = withRepeat(
            withTiming(-5, { duration: 2100, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
        );
    }, []);

    const animatedBadge1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: floatAnim1.value }],
    }));

    const animatedBadge2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: floatAnim2.value }],
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (index !== currentSlide && index >= 0 && index < SLIDES.length) {
            setCurrentSlide(index);
        }
    };

    const goToSlide = (index: number) => {
        haptics.selectionAsync();
        setCurrentSlide(index);
        scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    };

    const handleGoogleSignIn = async () => {
        haptics.impactAsync();
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

    const handleEmailSignIn = () => {
        haptics.selectionAsync();
        router.push('/signup');
    };

    const activeSlide = SLIDES[currentSlide];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* ── Dual-Tone Split Background Layers ── */}
            <View style={[styles.bgTop, { backgroundColor: activeSlide.bgTop }]} />
            <View style={[styles.bgBottom, { backgroundColor: activeSlide.bgBottom }]} />

            {/* ── Main Viewport Content ── */}
            <View style={[styles.contentWrapper, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 12) }]}>
                
                {/* ── Top Visual Showcase Area (Card Carousel) ── */}
                <View style={styles.showcaseSection}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        bounces={false}
                        style={styles.carouselScrollView}
                        contentContainerStyle={styles.carouselContainer}
                    >
                        {SLIDES.map((slide) => {
                            const isBadge1TopLeft = slide.badge1.position === 'topLeft';
                            const isBadge2BottomLeft = slide.badge2.position === 'bottomLeft';

                            return (
                                <View key={slide.id} style={styles.cardSlideWrapper}>
                                    <View style={[styles.imageCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                                        <Image
                                            source={slide.image}
                                            style={styles.cardImage}
                                            resizeMode="cover"
                                        />

                                        {/* Floating Badge 1 */}
                                        <Animated.View
                                            style={[
                                                styles.badgePill,
                                                isBadge1TopLeft ? styles.badgeTopLeft : styles.badgeTopRight,
                                                {
                                                    backgroundColor: slide.badge1.bgColor,
                                                    borderColor: slide.badge1.borderColor,
                                                },
                                                animatedBadge1Style,
                                            ]}
                                        >
                                            <Text style={[styles.badgeText, { color: slide.badge1.textColor }]}>
                                                {slide.badge1.text}
                                            </Text>
                                        </Animated.View>

                                        {/* Floating Badge 2 */}
                                        <Animated.View
                                            style={[
                                                styles.badgePill,
                                                isBadge2BottomLeft ? styles.badgeBottomLeft : styles.badgeBottomRight,
                                                {
                                                    backgroundColor: slide.badge2.bgColor,
                                                    borderColor: slide.badge2.borderColor,
                                                },
                                                animatedBadge2Style,
                                            ]}
                                        >
                                            <Text style={[styles.badgeText, { color: slide.badge2.textColor }]}>
                                                {slide.badge2.text}
                                            </Text>
                                        </Animated.View>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* ── Pagination Indicator Dots ── */}
                    <View style={styles.paginationRow}>
                        {SLIDES.map((slide, idx) => {
                            const isActive = idx === currentSlide;
                            return (
                                <TouchableOpacity
                                    key={slide.id}
                                    onPress={() => goToSlide(idx)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.dotButton,
                                        isActive ? styles.dotActive : styles.dotInactive,
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* ── Bolder & Bigger Typography & Copy Section ── */}
                <View style={styles.textSection}>
                    <Text style={styles.headlineText}>
                        {activeSlide.title}
                    </Text>
                    <Text style={styles.subtitleText}>
                        {activeSlide.subtitle}
                    </Text>
                </View>

                {/* ── Bottom Action Buttons & Legal ── */}
                <View style={styles.bottomSection}>
                    {/* Continue with Google Button */}
                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        activeOpacity={0.88}
                        style={styles.googleButton}
                    >
                        {isGoogleLoading ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                        ) : (
                            <>
                                <GoogleIcon width={22} height={22} />
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Continue with Email Button */}
                    <TouchableOpacity
                        onPress={handleEmailSignIn}
                        activeOpacity={0.88}
                        style={styles.emailButton}
                    >
                        <Icon name="Mail" size={22} color="white" />
                        <Text style={styles.emailButtonText}>Continue with Email</Text>
                    </TouchableOpacity>

                    {/* Continue with Apple (iOS only) */}
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => router.push('/signup')}
                            activeOpacity={0.88}
                            style={styles.appleButton}
                        >
                            <AppleIcon width={22} height={22} color="#FFFFFF" />
                            <Text style={styles.appleButtonText}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}

                    {/* Legal Terms Footer */}
                    <View style={styles.termsRow}>
                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => openLegalLink(TERMS_URL)}
                            >
                                Terms
                            </Text>
                            {' '}&{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => openLegalLink(PRIVACY_URL)}
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00CAE9',
    },

    // Dual-tone split background
    bgTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '38%',
    },
    bgBottom: {
        position: 'absolute',
        top: '38%',
        left: 0,
        right: 0,
        bottom: 0,
    },

    contentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },

    // Showcase Carousel
    showcaseSection: {
        alignItems: 'center',
        paddingTop: 10,
    },
    carouselScrollView: {
        width: SCREEN_WIDTH,
    },
    carouselContainer: {
        alignItems: 'center',
    },
    cardSlideWrapper: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageCard: {
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
        elevation: 12,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },

    // Floating Badges
    badgePill: {
        position: 'absolute',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    badgeTopLeft: {
        top: 18,
        left: 14,
    },
    badgeTopRight: {
        top: 18,
        right: 14,
    },
    badgeBottomLeft: {
        bottom: 18,
        left: 14,
    },
    badgeBottomRight: {
        bottom: 18,
        right: 14,
    },
    badgeText: {
        fontSize: 13.5,
        fontWeight: '800',
        letterSpacing: -0.2,
    },

    // Pagination
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        gap: 6,
    },
    dotButton: {
        height: 6,
        borderRadius: 3,
    },
    dotActive: {
        width: 26,
        backgroundColor: '#FFFFFF',
    },
    dotInactive: {
        width: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
    },

    // Typography (Bolder & Bigger)
    textSection: {
        alignItems: 'center',
        paddingHorizontal: 12,
        marginVertical: 4,
    },
    headlineText: {
        fontSize: 34,
        fontWeight: '900',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.8,
        lineHeight: 40,
        marginBottom: 10,
    },
    subtitleText: {
        fontSize: 15.5,
        fontWeight: '600',
        color: 'rgba(15, 23, 42, 0.85)',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
    },

    // Bottom Action Buttons
    bottomSection: {
        width: '100%',
        gap: 11,
    },
    googleButton: {
        width: '100%',
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
        gap: 10,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    emailButton: {
        width: '100%',
        height: 54,
        backgroundColor: '#090E1A',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 6,
        gap: 10,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    appleButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#000000',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
        gap: 10,
    },
    appleButtonText: {
        fontSize: 15.5,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },

    // Legal Terms Footer
    termsRow: {
        alignItems: 'center',
        paddingTop: 2,
    },
    termsText: {
        fontSize: 11.5,
        color: 'rgba(15, 23, 42, 0.75)',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 16,
    },
    termsLink: {
        color: '#0F172A',
        fontWeight: '800',
        textDecorationLine: 'underline',
    },
});
