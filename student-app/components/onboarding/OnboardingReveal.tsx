import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useReducedMotion,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ENTER_DURATION_MS = 260;
const REDUCED_ENTER_DURATION_MS = 150;

interface OnboardingRevealProps {
    visible: boolean;
    animateOnMount: boolean;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function OnboardingReveal({
    visible,
    animateOnMount,
    children,
    style,
}: OnboardingRevealProps) {
    const reduceMotion = useReducedMotion();
    const progress = useSharedValue(visible && !animateOnMount ? 1 : 0);

    const animatedStyle = useAnimatedStyle(() => {
        const value = progress.get();
        return {
            opacity: value,
            transform: [{ translateY: reduceMotion ? 0 : (1 - value) * 8 }],
        };
    }, [progress, reduceMotion]);

    useEffect(() => {
        if (!visible) return;

        if (!animateOnMount) {
            progress.set(1);
            return;
        }

        progress.set(
            withTiming(1, {
                duration: reduceMotion ? REDUCED_ENTER_DURATION_MS : ENTER_DURATION_MS,
                easing: EASE_OUT,
            }),
        );
    }, [animateOnMount, progress, reduceMotion, visible]);

    return (
        <Animated.View
            accessibilityElementsHidden={!visible}
            importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
                style,
                { opacity: visible ? 1 : 0 },
                animatedStyle,
            ]}
        >
            {children}
        </Animated.View>
    );
}
