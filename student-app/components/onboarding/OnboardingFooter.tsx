import React from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { ONBOARDING_BLUE } from './onboardingStyles';

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
                    paddingBottom: Math.max(insets.bottom, 16) + 4,
                },
            ]}
        >
            {skipLabel && onSkip ? (
                <TouchableOpacity
                    accessibilityRole="button"
                    disabled={loading}
                    onPress={onSkip}
                    activeOpacity={0.7}
                    style={styles.skipButton}
                >
                    <Text style={[styles.skipText, { color: C.textSecondary }]}>{skipLabel}</Text>
                </TouchableOpacity>
            ) : null}

            <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
                disabled={isDisabled}
                onPress={onContinue}
                activeOpacity={0.85}
                style={[
                    styles.continueButton,
                    {
                        backgroundColor: ONBOARDING_BLUE,
                        opacity: isDisabled ? 0.45 : 1,
                    },
                    !isDisabled && styles.continueButtonActive,
                ]}
            >
                <Text
                    style={[
                        styles.continueText,
                        {
                            color: '#FFFFFF',
                        },
                    ]}
                >
                    {loading ? 'Saving…' : label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        paddingHorizontal: 20,
        paddingTop: 4,
        backgroundColor: 'transparent',
    },
    skipButton: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    skipText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
    },
    continueButton: {
        width: '100%',
        minHeight: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonActive: {
        shadowColor: ONBOARDING_BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
        elevation: 4,
    },
    continueText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 17,
        letterSpacing: -0.2,
    },
});
