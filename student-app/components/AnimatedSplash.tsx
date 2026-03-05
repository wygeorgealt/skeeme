import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    interpolateColor,
    Easing, // Import Easing for smoother animations
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
    onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const animationProgress = useSharedValue(0); // Used for background color and logo tint
    const logoScale = useSharedValue(0.4); // Initial small 'S'
    const circleOpacity = useSharedValue(0); // White circle behind 'S'
    const textOpacity = useSharedValue(0);
    const textTranslateX = useSharedValue(20); // Subtle slide for the text itself
    const groupTranslateX = useSharedValue(0); // 'S' + circle group initial position
    const [textWidth, setTextWidth] = React.useState(0);

    // NEW: For the initial black circular mask that shrinks
    const blackMaskScale = useSharedValue(1); // Starts full size
    const blackMaskOpacity = useSharedValue(1); // Starts opaque

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animationProgress.value,
            [0, 0.4, 0.5], // Adjusted timing for background flash
            ['#FFFFFF', '#FFFFFF', '#010100'] // White -> White -> Black
        );
        return {
            backgroundColor,
        };
    });

    const animatedLogoStyle = useAnimatedStyle(() => {
        const tintColor = interpolateColor(
            animationProgress.value,
            [0, 0.4, 0.5], // Logo color changes with the background flash
            ['#000000', '#000000', '#FFFFFF'] // Black -> Black -> White
        );
        return {
            tintColor,
            transform: [{ scale: logoScale.value }],
        };
    });

    const animatedCircleStyle = useAnimatedStyle(() => ({
        opacity: circleOpacity.value,
        transform: [{ scale: circleOpacity.value }], // Circle scales in as it appears
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateX: textTranslateX.value }],
    }));

    const animatedGroupStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: groupTranslateX.value }],
    }));

    // NEW: Style for the initial black circular mask
    const animatedBlackMaskStyle = useAnimatedStyle(() => ({
        opacity: blackMaskOpacity.value,
        transform: [{ scale: blackMaskScale.value }],
    }));

    useEffect(() => {
        // --- 1. Initial Black Mask Shrinks (0ms - ~500ms) ---
        blackMaskScale.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
        blackMaskOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });

        // --- 2. The Flash (Background to Black, Logo to White & Scale Up) (~500ms - ~1000ms) ---
        animationProgress.value = withDelay(500, withTiming(0.5, { duration: 200, easing: Easing.linear }));
        logoScale.value = withDelay(500, withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }));

        // --- 3. White Circle Reveal (~1000ms - ~1500ms) ---
        circleOpacity.value = withDelay(1000, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));

        // --- 4. Slide Group & "keeme" Reveal (~1500ms - ~2200ms) ---
        if (textWidth > 0) {
            // Gap between logo and text is 10
            // Offset to keep (Logo + gap + Text) centered is -(textWidth + 10) / 2
            const offset = -(textWidth + 10) / 2;

            groupTranslateX.value = withDelay(1500, withTiming(offset, {
                duration: 700,
                easing: Easing.out(Easing.back(1))
            }));

            textOpacity.value = withDelay(1500, withTiming(1, { duration: 500 }));
            textTranslateX.value = withDelay(1500, withTiming(0, {
                duration: 700,
                easing: Easing.out(Easing.back(1))
            }));
        }

        // Total duration before calling onFinish
        const totalAnimationDuration = 3500;
        const timer = setTimeout(onFinish, totalAnimationDuration);
        return () => clearTimeout(timer);
    }, [onFinish, textWidth]);

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <Animated.View style={[styles.brandContainer, animatedGroupStyle]}>
                <View style={styles.logoAndCircle}>
                    <Animated.View style={[styles.whiteCircle, animatedCircleStyle]} />
                    <Animated.Image
                        source={require('@/assets/images/nnn.png')}
                        style={[styles.logo, animatedLogoStyle]}
                        resizeMode="contain"
                    />
                    <Animated.View style={[styles.blackMask, animatedBlackMaskStyle]} />
                </View>

                <Animated.View
                    style={[styles.textContainer, animatedTextStyle]}
                    onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                >
                    <Text style={styles.keemeText} numberOfLines={1}>keeme</Text>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoAndCircle: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    whiteCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: 60,
        height: 60,
    },
    blackMask: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#010100',
    },
    textContainer: {
        marginLeft: 10,
    },
    keemeText: {
        fontSize: 54,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
        fontFamily: 'Inter_900Black',
    },
});
