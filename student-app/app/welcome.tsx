import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Custom Solutions',
        description: 'Creating mobile applications and study tools for every student need.',
        image: require('@/assets/images/slide1.png'),
        bgLight: '#4f46e5', // brand-indigo
        bgDark: '#4f46e5',
        textLight: '#ffffff',
        textDark: '#ffffff',
        accent: '#ffffff',
    },
    {
        id: 2,
        title: 'Design Interfaces',
        description: 'Designing intuitive and engaging learning experiences powered by Ai.',
        image: require('@/assets/images/slide2.png'),
        bgLight: '#ffffff',
        bgDark: '#010100', // brand-dark
        textLight: '#000000',
        textDark: '#ffffff',
        accent: '#4f46e5',
    },
    {
        id: 3,
        title: 'Smart Learning',
        description: 'Innovative tools for managing your courses, exams, and academic insights.',
        image: require('@/assets/images/slide3.png'),
        bgLight: '#f59e0b', // amber-500
        bgDark: '#f59e0b',
        textLight: '#ffffff',
        textDark: '#ffffff',
        accent: '#ffffff',
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

    // Dynamic status bar based on slide background
    const statusBarStyle = currentIndex === 1 && !isDark ? 'dark' : 'light';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? currentSlide.bgDark : currentSlide.bgLight }}>
            <StatusBar style={statusBarStyle} animated />

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                className="flex-1"
            >
                {SLIDES.map((slide, index) => (
                    <View key={slide.id} style={{ width, height }} className="pt-20 pb-12 px-8 flex-col">

                        {/* 3D Isometric Image Container */}
                        <View className="flex-1 justify-center items-center mt-8">
                            {/* For Slide 2 in dark mode, we wrap the white image in a nice intentional card */}
                            <View className={`${index === 1 && isDark ? 'bg-white rounded-[40px] p-2 shadow-2xl overflow-hidden' : ''}`}>
                                <Image
                                    source={slide.image}
                                    style={{
                                        width: width * 0.85,
                                        height: width * 0.9,
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                        </View>

                        {/* Typography Section */}
                        <View className="mt-8 mb-20">
                            <Text
                                style={{ color: isDark ? slide.textDark : slide.textLight }}
                                className="text-[42px] font-black tracking-tight leading-[48px] mb-4"
                            >
                                {slide.title.replace(' ', '\n')}
                            </Text>
                            <Text
                                style={{ color: isDark ? slide.textDark : slide.textLight, opacity: 0.85 }}
                                className="text-[17px] font-medium leading-relaxed pr-8"
                            >
                                {slide.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Actions Fixed Footer */}
            <View className="absolute bottom-12 left-0 right-0 px-8 flex-row justify-between items-center">
                {/* Skip / Login Text */}
                <TouchableOpacity onPress={() => router.push('/login')} className="py-2 pr-4">
                    <Text
                        style={{ color: isDark ? currentSlide.textDark : currentSlide.textLight, opacity: 0.7 }}
                        className="font-bold text-[16px]"
                    >
                        Skip
                    </Text>
                </TouchableOpacity>

                {/* Progress Dots */}
                <View className="flex-row items-center space-x-2 absolute left-0 right-0 justify-center pointer-events-none">
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={{ backgroundColor: isDark ? currentSlide.textDark : currentSlide.textLight }}
                            className={`h-[4px] rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 opacity-100' : 'w-2 opacity-30'}`}
                        />
                    ))}
                </View>

                {/* Next / Finish FAB */}
                <TouchableOpacity
                    onPress={goNext}
                    style={{ backgroundColor: currentSlide.accent }}
                    className="w-16 h-16 rounded-[24px] items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                >
                    {currentIndex === SLIDES.length - 1 ? (
                        <Ionicons name="checkmark" size={32} color={currentSlide.bgLight} />
                    ) : (
                        <Ionicons name="chevron-forward" size={32} color={currentSlide.bgLight} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
