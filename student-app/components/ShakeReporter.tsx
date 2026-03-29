import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_TIMEOUT = 1500; // Cooldown in ms

export function ShakeReporter() {
    const lastShake = useRef(0);
    const segments = useSegments();
    const { user } = useAuthStore();

    useEffect(() => {
        // Only activate for logged-in users
        if (!user) return;

        // Don't activate if already on the support page
        const currentSegment = segments[segments.length - 1] as string;
        if (currentSegment === 'support') return;

        let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

        const startListening = async () => {
            const isAvailable = await Accelerometer.isAvailableAsync();
            if (!isAvailable) return;

            Accelerometer.setUpdateInterval(150);

            subscription = Accelerometer.addListener(({ x, y, z }) => {
                const totalForce = Math.sqrt(x * x + y * y + z * z);
                const now = Date.now();

                if (totalForce > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_TIMEOUT) {
                    lastShake.current = now;

                    Alert.alert(
                        '🐛 Something wrong?',
                        'Would you like to report a bug or issue?',
                        [
                            { text: 'No', style: 'cancel' },
                            {
                                text: 'Yes, Report',
                                style: 'default',
                                onPress: () => {
                                    router.push('/(drawer)/support' as any);
                                },
                            },
                        ],
                        { cancelable: true }
                    );
                }
            });
        };

        startListening();

        return () => {
            subscription?.remove();
        };
    }, [user, segments]);

    return null;
}
