import React from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { ONBOARDING_BLUE, ONBOARDING_YELLOW } from './onboardingStyles';

const STEPS = 6;

export function OnboardingProgress({ step }: { step: number }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(onboarding)/auth-select');
        }
    };

    const progressWidth = `${Math.min(step / STEPS, 1) * 100}%` as const;

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    hitSlop={12}
                    activeOpacity={0.6}
                    onPress={handleBack}
                    style={styles.backButton}
                >
                    <ChevronLeft color={C.text} size={26} strokeWidth={2.4} />
                </TouchableOpacity>
                <View
                    accessibilityLabel={`Step ${step} of ${STEPS}`}
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 1, max: STEPS, now: step }}
                    style={[
                        styles.track,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E9ECEF' },
                    ]}
                >
                    <View style={[styles.fill, { width: progressWidth }]}>
                        {/* Subtle secondary yellow cap representing Skeemy's spark */}
                        <View style={styles.yellowCap} />
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    track: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: ONBOARDING_BLUE,
        position: 'relative',
    },
    yellowCap: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 5,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        backgroundColor: ONBOARDING_YELLOW,
    },
});
