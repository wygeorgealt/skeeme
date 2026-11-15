import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';

const BLUE = '#0057B8';
const YELLOW = '#FFDF00';

interface OnboardingFooterProps {
    onContinue: () => void;
    disabled?: boolean;
    loading?: boolean;
    label?: string;
    skipLabel?: string;
    onSkip?: () => void;
}

export function OnboardingFooter({
    onContinue,
    disabled = false,
    loading = false,
    label = 'Continue',
    skipLabel,
    onSkip,
}: OnboardingFooterProps) {
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const isDisabled = disabled || loading;

    return (
        <View
            style={[
                styles.footer,
                {
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: C.background,
                },
            ]}
        >
            {skipLabel && onSkip ? (
                <Pressable
                    accessibilityRole="button"
                    disabled={loading}
                    onPress={onSkip}
                    style={styles.skipButton}
                >
                    <Text style={[styles.skipText, { color: C.textSecondary }]}>{skipLabel}</Text>
                </Pressable>
            ) : null}
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
                disabled={isDisabled}
                onPress={onContinue}
                style={({ pressed }) => [
                    styles.continueButton,
                    {
                        backgroundColor: isDisabled ? '#FFF2A6' : YELLOW,
                        borderColor: isDisabled ? '#D8C45A' : BLUE,
                        elevation: isDisabled ? 0 : 2,
                        shadowOpacity: isDisabled ? 0 : 0.14,
                    },
                    pressed && !isDisabled && styles.pressed,
                ]}
            >
                <Text style={styles.continueText}>{loading ? 'Saving…' : label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    skipButton: {
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    skipText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
    },
    continueButton: {
        alignSelf: 'stretch',
        minHeight: 56,
        borderRadius: 28,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    continueText: {
        color: BLUE,
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
    },
    pressed: { opacity: 0.88 },
});
