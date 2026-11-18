import React from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { ONBOARDING_BLUE, ONBOARDING_YELLOW } from './onboardingStyles';

const STEPS = 6;

export function OnboardingProgress({
    step,
    showProgress = true,
    onBack,
}: {
    step: number;
    showProgress?: boolean;
    onBack?: () => void;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
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
            <View
                style={[
                    styles.header,
                    {
                        height: insets.top + 56,
                        paddingTop: insets.top + 8,
                    },
                ]}
            >
                <TouchableOpacity
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    hitSlop={12}
                    activeOpacity={0.6}
                    onPress={handleBack}
                    style={[
                        styles.backButton,
                        { left: 16, top: insets.top + 8 },
                    ]}
                >
                    <ChevronLeft color={C.text} size={26} strokeWidth={2.4} />
                </TouchableOpacity>
                {showProgress ? (
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
                ) : null}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    track: {
        width: '75%',
        maxWidth: 300,
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
