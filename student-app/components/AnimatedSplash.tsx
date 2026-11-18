import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    useReducedMotion,
} from 'react-native-reanimated';
import { AnimatedMascot } from '@/components/AnimatedMascot';

interface AnimatedSplashProps {
    onFinish: () => void;
}

/**
 * Shows Skeemy opening his eyes while the app finishes starting.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const reduceMotion = useReducedMotion();

    const BG_COLOR = '#0057B8';

    // Animation values
    const logoOpacity = useSharedValue(reduceMotion ? 1 : 0);
    const logoScale = useSharedValue(reduceMotion ? 1 : 0.9);

    useEffect(() => {
        if (!reduceMotion) {
            logoOpacity.value = withTiming(1, { duration: 800 });
            logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        }

        const timer = setTimeout(onFinish, 5200);

        return () => clearTimeout(timer);
    }, [logoOpacity, logoScale, onFinish, reduceMotion]);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: BG_COLOR }]}>
            <Animated.View style={logoStyle}>
                <AnimatedMascot animation="peacefully-opens" size={200} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
