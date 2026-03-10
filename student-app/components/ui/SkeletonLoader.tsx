import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

interface SkeletonLoaderProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: number;
    style?: ViewStyle;
}

export const SkeletonLoader = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style
}: SkeletonLoaderProps) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            isDark
                ? ['#1e293b', '#2d3748'] // Slate-800 to Slate-700
                : ['#f1f5f9', '#e2e8f0']  // Slate-100 to Slate-200
        );

        return {
            backgroundColor,
        };
    });

    return (
        <Animated.View
            style={[
                { width: width as any, height: height as any, borderRadius },
                style,
                animatedStyle
            ]}
        />
    );
};

export const SkeletonCard = () => (
    <View className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 mb-4 overflow-hidden">
        <SkeletonLoader width="70%" height={24} borderRadius={8} style={{ marginBottom: 16 }} />
        <View className="flex-row items-center">
            <SkeletonLoader width={80} height={16} borderRadius={4} style={{ marginRight: 12 }} />
            <SkeletonLoader width={60} height={16} borderRadius={4} />
        </View>
    </View>
);
