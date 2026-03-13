import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';

export function QuizFlipCard({
    front, back, isFlipped
}: {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped: boolean;
}) {
    const rot = useSharedValue(0);
    const [frontHeight, setFrontHeight] = useState(0);
    const [backHeight, setBackHeight] = useState(0);

    useEffect(() => {
        rot.value = withTiming(isFlipped ? 1 : 0, { duration: 500 });
    }, [isFlipped, rot]);

    const frontStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(rot.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` },
        ],
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: isFlipped ? 0 : 1,
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(rot.value, [0, 1], [-180, 0], Extrapolation.CLAMP)}deg` },
        ],
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: isFlipped ? 1 : 0,
    }));

    const containerHeight = Math.max(frontHeight, backHeight, 150);

    return (
        <View style={{ minHeight: containerHeight }}>
            <Animated.View style={frontStyle} pointerEvents={isFlipped ? 'none' : 'auto'} onLayout={(e) => setFrontHeight(e.nativeEvent.layout.height)}>
                {front}
            </Animated.View>
            <Animated.View style={backStyle} pointerEvents={isFlipped ? 'auto' : 'none'} onLayout={(e) => setBackHeight(e.nativeEvent.layout.height)}>
                {back}
            </Animated.View>
        </View>
    );
}
