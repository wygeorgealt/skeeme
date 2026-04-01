import { Text } from '@/components/ui/Text';
import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Snap a Photo',
        description: 'Get step-by-step solutions instantly. Skeeme breaks down complex questions to help you understand.',
        animation: require('@/assets/lottie/scan.json'),
    },
    {
        id: 2,
        title: 'Quiz & Flashcards',
        description: 'Generate custom quizzes and flashcards instantly from your notes, slides, and textbooks.',
        animation: require('@/assets/lottie/quiz.json'),
    },
    {
        id: 3,
        title: 'Your Ecosystem',
        description: 'Your complete study workspace to track progress, revisit missed questions, and ace exams.',
        animation: require('@/assets/lottie/ecosystem.json'),
    }
];

export default function WelcomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const lottieRefs = useRef<(LottieView | null)[]>([]);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / width);
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    };

    // Play animation heavily on focus
    useEffect(() => {
        lottieRefs.current.forEach((ref, index) => {
            if (index === currentIndex) {
                ref?.play();
            } else {
                ref?.pause();
            }
        });
    }, [currentIndex]);

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        } else {
            router.push('/(onboarding)/education');
        }
    };

    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const dotActiveColor = isDark ? '#FFFFFF' : '#000000';
    const dotInactiveColor = isDark ? '#3A3A3C' : '#D1D1D6';

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <StatusBar style={isDark ? 'light' : 'dark'} animated />

            {/* Skip Button (Top Right) */}
            <TouchableOpacity 
                style={[styles.skipBtn, { top: 60 }]} 
                onPress={() => router.push('/login')}
                activeOpacity={0.7}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

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
                    return (
                        <View key={slide.id} style={styles.slide}>
                            
                            {/* Lottie Animation Area */}
                            <View style={styles.animationContainer}>
                                <LottieView
                                    ref={ref => (lottieRefs.current[index] = ref)}
                                    source={slide.animation}
                                    style={styles.lottie}
                                    autoPlay={index === 0}
                                    loop
                                />
                            </View>

                            {/* Text Section */}
                            <View style={styles.textSection}>
                                <Text style={[styles.title, { color: textColor }]}>
                                    {slide.title}
                                </Text>
                                <Text style={[styles.description, { color: subtextColor }]}>
                                    {slide.description}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                
                {/* Pagination Dots */}
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i === currentIndex ? dotActiveColor : dotInactiveColor,
                                    width: i === currentIndex ? 24 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                    onPress={goNext}
                    style={styles.primaryBtn}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryBtnText}>
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    slide: {
        width,
        height,
        alignItems: 'center',
        paddingTop: 100,
    },
    skipBtn: {
        position: 'absolute',
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#007AFF', // Standard iOS Blue
    },
    animationContainer: {
        width: width * 0.85,
        height: width * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    textSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: 0.41,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    primaryBtn: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    },
});
