import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Slide 1: indigo bg baked into image → match exactly
// Slide 2: white bg baked into image → always use white bg; dark mode shows a card overlay
// Slide 3: amber bg baked into image → match exactly
const SLIDES = [
    {
        id: 1,
        title: 'Your Pocket\nTutor',
        description: 'Skeeme turns your notes, slides, and textbooks into ready-to-study quizzes — in seconds.',
        image: require('@/assets/images/slide1.png'),
        bgColor: '#D2B48C',
        textColor: '#ffffff',
        accentBg: '#ffffff',
        accentIcon: '#D2B48C',
    },
    {
        id: 2,
        title: 'Scan it.\nSolve it.',
        description: 'Point your camera at any problem. Skeeme\'s AI breaks it down and walks you through the answer.',
        image: require('@/assets/images/slide2.png'),
        bgColor: '#ffffff',
        bgColorDark: '#1a1a2e',
        textColor: '#000000',
        textColorDark: '#ffffff',
        accentBg: '#D2B48C',
        accentIcon: '#ffffff',
    },
    {
        id: 3,
        title: 'Ace Every\nExam',
        description: 'Track streaks, revisit missed questions, and stay ahead of every deadline — all in one place.',
        image: require('@/assets/images/slide3.png'),
        bgColor: '#f59e0b',
        textColor: '#ffffff',
        accentBg: '#ffffff',
        accentIcon: '#f59e0b',
    }
];

export default function WelcomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / width);
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    };

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        } else {
            router.push('/signup');
        }
    };

    const currentSlide = SLIDES[currentIndex];

    // Slide 2 uses dark mode bg variant; others are always the same
    const getSlideBg = (slide: typeof SLIDES[0]) => {
        if (slide.id === 2 && isDark && (slide as any).bgColorDark) {
            return (slide as any).bgColorDark;
        }
        return slide.bgColor;
    };

    const getSlideText = (slide: typeof SLIDES[0]) => {
        if (slide.id === 2 && isDark && (slide as any).textColorDark) {
            return (slide as any).textColorDark;
        }
        return slide.textColor;
    };

    // Status bar: dark icons on slide 2 light mode, white on everything else
    const statusBarStyle = currentIndex === 1 && !isDark ? 'dark' : 'light';

    return (
        <View style={{ flex: 1, backgroundColor: getSlideBg(currentSlide) }}>
            <StatusBar style={statusBarStyle} animated />

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                style={{ flex: 1 }}
            >
                {SLIDES.map((slide, index) => {
                    const slideBg = getSlideBg(slide);
                    const slideText = getSlideText(slide);

                    return (
                        <View key={slide.id} style={[styles.slide, { backgroundColor: slideBg }]}>

                            {/* Full-bleed image fills the top portion of the slide */}
                            <View style={styles.imageContainer}>
                                <Image
                                    source={slide.image}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Text Section pinned at the bottom */}
                            <View style={styles.textSection}>
                                <Text style={[styles.title, { color: slideText }]}>
                                    {slide.title}
                                </Text>
                                <Text style={[styles.description, { color: slideText, opacity: 0.8 }]}>
                                    {slide.description}
                                </Text>
                            </View>

                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Actions — overlaid above everything */}
            <View style={styles.footer}>
                {/* Skip */}
                <TouchableOpacity onPress={() => router.push('/login')} style={styles.skipBtn}>
                    <Text style={[styles.skipText, { color: getSlideText(currentSlide) }]}>
                        Skip
                    </Text>
                </TouchableOpacity>

                {/* Progress Dots */}
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: getSlideText(currentSlide),
                                    width: i === currentIndex ? 24 : 8,
                                    opacity: i === currentIndex ? 1 : 0.35,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Next / Finish FAB */}
                <TouchableOpacity
                    onPress={goNext}
                    style={[styles.fab, { backgroundColor: currentSlide.accentBg }]}
                    activeOpacity={0.8}
                >
                    {currentIndex === SLIDES.length - 1 ? (
                        <Ionicons name="checkmark" size={28} color={currentSlide.accentIcon} />
                    ) : (
                        <Ionicons name="chevron-forward" size={28} color={currentSlide.accentIcon} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    slide: {
        width,
        height,
        flexDirection: 'column',
    },
    imageContainer: {
        flex: 1.1,
        overflow: 'hidden',
    },
    image: {
        width,
        height: '100%',
    },
    textSection: {
        paddingHorizontal: 32,
        paddingTop: 24,
        paddingBottom: 120,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: -0.5,
        lineHeight: 46,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        paddingRight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 48,
        left: 0,
        right: 0,
        paddingHorizontal: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    skipBtn: {
        paddingVertical: 8,
        paddingRight: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '700',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
