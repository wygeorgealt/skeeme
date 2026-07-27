import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedProps, 
    withTiming, 
    withSpring, 
    withDelay,
    interpolate,
    useAnimatedStyle,
    FadeInUp,
    ZoomIn,
    FadeIn
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import AltArrowRight from '@/assets/icons/pikaicons/arrow-right.svg';
import Refresh from '@/assets/icons/pikaicons/arrow-down.svg';
import CupStar from '@/assets/icons/pikaicons/award-medal.svg';
import MedalRibbonsStar from '@/assets/icons/pikaicons/award-medal.svg';
import CheckCircle from '@/assets/icons/pikaicons/check-tick-circle.svg';
import InfoCircle from '@/assets/icons/pikaicons/troubleshoot.svg';
import Danger from '@/assets/icons/pikaicons/troubleshoot.svg';
import Fire from '@/assets/icons/pikaicons/sparkle-ai-01.svg';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import { AnimatedIcon } from '../ui/AnimatedIcon';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import * as ExpoHaptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface QuizCelebrationProps {
    score: number; // 0 to 100
    onShowResults: () => void;
    onRetake: () => void;
    isDark: boolean;
}

export const QuizCelebration: React.FC<QuizCelebrationProps> = ({ score, onShowResults, onRetake, isDark }) => {
    const size = 220;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const progress = useSharedValue(0);
    const scale = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success, true);
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        progress.value = withDelay(500, withTiming(score / 100, { duration: 1500 }));
        textOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    }, [score]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const mainStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getCelebrationMeta = () => {
        if (score >= 90) return { title: 'Mastery!', subtitle: 'You completely nailed this topic.', color: '#34C759', icon: CupStar };
        if (score >= 70) return { title: 'Great Job!', subtitle: 'Solid understanding. Keep it up!', color: '#007AFF', icon: Fire };
        return { title: 'Good Effort!', subtitle: 'Practice makes perfect. Try again?', color: '#FF9500', icon: Fire };
    };

    const meta = getCelebrationMeta();

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
            </Animated.View>

            <Animated.View style={[styles.main, mainStyle]}>

                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={meta.color} />
                            <Stop offset="100%" stopColor={isDark ? '#fff' : meta.color} stopOpacity={0.8} />
                        </LinearGradient>
                    </Defs>
                    
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#scoreGrad)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        fill="none"
                        animatedProps={animatedCircleProps}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>

                <View style={StyleSheet.absoluteFill}>
                    <View style={styles.content}>
                        <Animated.View entering={ZoomIn.delay(800)}>
                            <meta.icon width={size * 0.25} height={size * 0.25} color={meta.color} />
                        </Animated.View>
                        <View style={styles.scoreContainer}>
                            <Text style={[styles.scoreText, { color: isDark ? '#fff' : '#000' }]}>{score}%</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{meta.title}</Text>
                <Text style={styles.subtitle}>{meta.subtitle}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1500).springify()} style={[styles.actions, { gap: 12, paddingHorizontal: 20 }]}>
                <View style={{ width: '100%' }}>
                    <AnimatedButton
                        title="Show Results"
                        onPress={onShowResults}
                        type="capsule"
                        backgroundColor="#007AFF"
                        shadowColor="#0066D6"
                        fullWidth
                    />
                </View>

                <View style={{ width: '100%' }}>
                    <AnimatedButton
                        title="Retake Quiz"
                        onPress={onRetake}
                        type="capsule"
                        backgroundColor={isDark ? '#2C2C2E' : '#E5E5EA'}
                        shadowColor={isDark ? '#1C1C1E' : '#D1D1D6'}
                        fullWidth
                    />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    main: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreContainer: {
        alignItems: 'center',
        marginTop: 5,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
    },
    actions: {
        marginTop: 60,
        width: '100%',
        paddingHorizontal: 24,
        gap: 16,
    },
    primaryBtn: {
        height: 64,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryBtn: {
        height: 64,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
    },
    secondaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
    }
});
