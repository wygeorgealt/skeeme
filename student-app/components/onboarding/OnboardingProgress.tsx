import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const STEPS = 7;
const BLUE = '#0057B8';

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

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={handleBack}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                    <ArrowLeft color={C.text} size={21} strokeWidth={2.4} />
                </Pressable>
                <View
                    accessibilityLabel={`Step ${step} of ${STEPS}`}
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 1, max: STEPS, now: step }}
                    style={[styles.track, { backgroundColor: C.elevated }]}
                >
                    <View style={[styles.fill, { width: `${Math.min(step / STEPS, 1) * 100}%` }]} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingBottom: 6,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    track: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: BLUE,
    },
    pressed: { opacity: 0.72 },
});
