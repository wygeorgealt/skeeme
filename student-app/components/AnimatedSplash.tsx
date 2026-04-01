import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    SharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PARTICLE_COUNT = 24;
const LOGO_SIZE = 120;
const PARTICLE_SIZE = 8;
const GLOW_SIZE = 200;

// Generate random scattered positions for particles
const generateScatteredPositions = () => {
    const positions = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions.push({
            x: Math.random() * SCREEN_W * 1.4 - SCREEN_W * 0.2,
            y: Math.random() * SCREEN_H * 1.4 - SCREEN_H * 0.2,
        });
    }
    return positions;
};

// Generate final convergence positions (circular pattern around logo center)
const generateConvergedPositions = () => {
    const cx = SCREEN_W / 2;
    const cy = SCREEN_H / 2;
    const positions = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const ring = i < 12 ? 0 : 1; // Inner and outer ring
        const radius = ring === 0 ? 35 : 55;
        positions.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
        });
    }
    return positions;
};

interface AnimatedSplashProps {
    onFinish: () => void;
}

// Individual particle component
function Particle({
    index,
    startX,
    startY,
    endX,
    endY,
    progress,
    isDark,
}: {
    index: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    progress: SharedValue<number>;
    isDark: boolean;
}) {
    const delay = index * 25; // Stagger each particle
    const particleOpacity = useSharedValue(0);
    const particleScale = useSharedValue(0.3);

    useEffect(() => {
        particleOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        particleScale.value = withDelay(
            delay,
            withSequence(
                withSpring(1.2, { damping: 8, stiffness: 120 }),
                withTiming(1, { duration: 200 })
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const t = progress.value;
        const x = interpolate(t, [0, 1], [startX, endX]);
        const y = interpolate(t, [0, 1], [startY, endY]);
        const scale = interpolate(t, [0, 0.7, 1], [1, 1.3, 0.6]);

        return {
            position: 'absolute',
            left: x - PARTICLE_SIZE / 2,
            top: y - PARTICLE_SIZE / 2,
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            borderRadius: PARTICLE_SIZE / 2,
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            opacity: particleOpacity.value * interpolate(t, [0, 0.8, 1], [1, 1, 0]),
            transform: [{ scale: particleScale.value * scale }],
            shadowColor: isDark ? '#FFFFFF' : '#000000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 6,
            elevation: 4,
        };
    });

    return <Animated.View style={animatedStyle} />;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const progress = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.5);
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(0.3);

    const scatteredPositions = useMemo(() => generateScatteredPositions(), []);
    const convergedPositions = useMemo(() => generateConvergedPositions(), []);

    useEffect(() => {
        // Phase 1: Particles appear scattered (0-400ms) — already handled by particle delays

        // Phase 2: Particles converge (400ms-1400ms)
        progress.value = withDelay(
            400,
            withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        );

        // Phase 3: Glow appears (1200ms)
        glowOpacity.value = withDelay(
            1200,
            withSequence(
                withTiming(0.6, { duration: 300 }),
                withTiming(0.2, { duration: 600 }),
                withTiming(0, { duration: 400 })
            )
        );
        glowScale.value = withDelay(
            1200,
            withSpring(1.2, { damping: 10, stiffness: 80 })
        );

        // Phase 4: Logo materializes (1300ms)
        logoOpacity.value = withDelay(
            1300,
            withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
        );
        logoScale.value = withDelay(
            1300,
            withSpring(1, { damping: 12, stiffness: 100 })
        );

        // Finish after everything plays
        const timer = setTimeout(() => {
            onFinish();
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#100921' : '#FAFAFA' }]}>
            {/* Particles */}
            {scatteredPositions.map((start, i) => (
                <Particle
                    key={i}
                    index={i}
                    startX={start.x}
                    startY={start.y}
                    endX={convergedPositions[i].x}
                    endY={convergedPositions[i].y}
                    progress={progress}
                    isDark={isDark}
                />
            ))}

            {/* Center glow behind logo */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                    },
                    glowAnimatedStyle,
                ]}
            />

            {/* Logo materializes after particles converge */}
            <Animated.Image
                source={require('@/assets/images/icon.png')}
                style={[styles.logo, logoAnimatedStyle]}
                resizeMode="contain"
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
    },
    glow: {
        position: 'absolute',
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        opacity: 0,
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 30,
    },
});
