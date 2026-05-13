import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withDelay,
    withSpring,
    withRepeat,
    withSequence,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FireIcon } from '@hugeicons/core-free-icons';
import { Text } from './ui/Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StreakAnimationProps {
    streakCount: number;
    size?: number;
    isDark?: boolean;
}

export const StreakAnimation: React.FC<StreakAnimationProps> = ({
    streakCount,
    size = 180,
    isDark = false
}) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Animation values
    const progress = useSharedValue(0);
    const scale = useSharedValue(0);
    const fireScale = useSharedValue(0);
    const countOpacity = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Step-by-step entrance animation
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        
        // Progress ring animation
        progress.value = withDelay(400, withTiming(1, { duration: 1500 }));
        
        // Fire icon pop
        fireScale.value = withDelay(800, withSpring(1, { damping: 8, stiffness: 120 }));
        
        // Count fade in
        countOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

        // Constant subtle rotation for the background glow
        rotation.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
    }, []);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const mainContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const fireIconStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: fireScale.value },
            { translateY: withRepeat(withSequence(withTiming(-5, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, true) }
        ],
    }));

    const countStyle = useAnimatedStyle(() => ({
        opacity: countOpacity.value,
        transform: [{ translateY: interpolate(countOpacity.value, [0, 1], [10, 0]) }],
    }));

    // Particle animations
    const particles = useMemo(() => {
        return Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            delay: i * 200,
            angle: (i * 60) * (Math.PI / 180),
        }));
    }, []);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Background Glow */}
            <Animated.View style={[
                styles.glow,
                { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6 },
                useAnimatedStyle(() => ({
                    transform: [{ rotate: `${rotation.value}deg` }],
                    opacity: interpolate(progress.value, [0, 1], [0, 0.4])
                }))
            ]} />

            <Animated.View style={[styles.main, mainContainerStyle]}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FF8C00" />
                            <Stop offset="100%" stopColor="#FF4500" />
                        </LinearGradient>
                    </Defs>
                    
                    {/* Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* Animated Progress */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#streakGrad)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        fill="none"
                        animatedProps={animatedCircleProps}
                    />
                </Svg>

                <View style={StyleSheet.absoluteFill}>
                    <View style={styles.content}>
                        <Animated.View style={fireIconStyle}>
                            <HugeiconsIcon icon={FireIcon} size={size * 0.35} color="#FF4500" />
                        </Animated.View>
                        
                        <Animated.View style={[styles.countContainer, countStyle]}>
                            <Text style={styles.countText}>{streakCount}</Text>
                            <Text style={styles.dayText}>DAY STREAK</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Burst Particles */}
                {particles.map((p) => (
                    <Particle key={p.id} angle={p.angle} delay={p.delay} containerSize={size} />
                ))}
            </Animated.View>
        </View>
    );
};

const Particle = ({ angle, delay, containerSize }: { angle: number, delay: number, containerSize: number }) => {
    const dist = useSharedValue(0);
    const opacity = useSharedValue(0);
    const size = 6 + Math.random() * 4;

    useEffect(() => {
        dist.value = withDelay(delay + 1000, withSpring(containerSize * 0.6, { damping: 10, stiffness: 40 }));
        opacity.value = withDelay(delay + 1000, withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 800 })));
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FF8C00',
        opacity: opacity.value,
        transform: [
            { translateX: Math.cos(angle) * dist.value - size / 2 },
            { translateY: Math.sin(angle) * dist.value - size / 2 },
        ],
    }));

    return <Animated.View style={style} />;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    main: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 140, 0, 0.15)',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    countContainer: {
        alignItems: 'center',
        marginTop: -5,
    },
    countText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FF4500',
        lineHeight: 48,
    },
    dayText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FF8C00',
        letterSpacing: 1.5,
        marginTop: -2,
    }
});
