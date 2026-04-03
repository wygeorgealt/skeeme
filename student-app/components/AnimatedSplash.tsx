import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

interface AnimatedSplashProps {
    onFinish: () => void;
}

/**
 * Standard High-Fidelity Splash Screen
 * Features a clean, centered logo on a solid background to prevent mixing with the app.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Theme Colors - Matching RootLayout exactly
    const BG_COLOR = isDark ? '#09090B' : '#E9F1FE';
    const PRIMARY_BLUE = isDark ? '#0A84FF' : '#007AFF';

    // Animation values
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.9);

    useEffect(() => {
        // Simple, elegant appear
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

        // Standard splash duration (2s) then finish
        const timer = setTimeout(onFinish, 2200);

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: BG_COLOR }]}>
            <Animated.View style={logoStyle}>
                <Image
                    source={require('@/assets/images/splash-icon.png')}
                    style={[styles.logo, { tintColor: PRIMARY_BLUE }]}
                    resizeMode="contain"
                />
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
    logo: {
        width: 200, // Splash icons are typically larger
        height: 200,
    },
});
