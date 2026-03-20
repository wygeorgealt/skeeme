import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudCheck, CloudXmark } from 'iconoir-react-native';

export function NetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const isConnectedRef = React.useRef<boolean | null>(true);
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-60); // Start hidden off-screen
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            // NetInfo returns null initially, so we check explicitly for false
            if (state.isConnected === false) {
                if (isConnectedRef.current !== false) {
                    setIsConnected(false);
                    isConnectedRef.current = false;
                    translateY.value = withSpring(insets.top > 0 ? insets.top : 20, {
                        damping: 15,
                        stiffness: 150,
                    });
                }
            } else if (state.isConnected === true && isConnectedRef.current === false) {
                // Only show positive feedback if we are transitioning back from an offline state
                setIsConnected(true);
                isConnectedRef.current = true;
                // Hide after a short delay showing it's back online
                setTimeout(() => {
                    translateY.value = withTiming(-100, { duration: 400 });
                }, 2000);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [insets.top, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            backgroundColor: isConnected
                ? (isDark ? '#059669' : '#10b981') // Green for back online
                : (isDark ? '#dc2626' : '#ef4444'), // Red for offline
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle, { paddingHorizontal: 16 }]}>
            <View style={styles.content}>
                {isConnected ? (
                    <CloudCheck width={18} height={18} color="white" />
                ) : (
                    <CloudXmark width={18} height={18} color="white" />
                )}
                <Text style={styles.text}>
                    {isConnected ? "Back Online" : "No Internet Connection"}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        borderRadius: 12,
        paddingVertical: 12,
        zIndex: 99999, // Ensure it's above everything
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
});
