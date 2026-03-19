import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface AnimatedSplashProps {
    onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const translateY = useSharedValue(60);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        // Simple, elegant slide-up and fade-in
        translateY.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) });
        opacity.value = withTiming(1, { duration: 900 });

        // Total splash screen duration
        const timer = setTimeout(onFinish, 2200);
        return () => clearTimeout(timer);
    }, [onFinish, translateY, opacity]);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
            <Animated.Image
                source={require('@/assets/images/nnn.png')}
                style={[styles.logo, animatedStyle, { tintColor: '#D2B48C' }]}
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
    logo: {
        width: 120,
        height: 120,
    },
});
