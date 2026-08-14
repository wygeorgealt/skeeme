import React from 'react';
import { View, TouchableOpacity, useColorScheme, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/Text';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';

interface OnboardingShellProps {
    step: number;
    totalSteps?: number;
    title: string;
    subtitle?: string;
    ctaTitle?: string;
    ctaDisabled?: boolean;
    ctaLoading?: boolean;
    onCta?: () => void;
    showBack?: boolean;
    /** Set to true for screens with text input to enable KeyboardAvoidingView */
    hasKeyboard?: boolean;
    /** Custom step label like "Finally" instead of step number */
    stepLabel?: string;
    children: React.ReactNode;
    /** Optional footer content rendered above the CTA (e.g. Skip button) */
    footerExtra?: React.ReactNode;
    /** If true, the scrollView content won't have bottom padding for the CTA */
    noStickyFooter?: boolean;
}

export function OnboardingShell({
    step,
    totalSteps = 8,
    title,
    subtitle,
    ctaTitle = 'Continue',
    ctaDisabled = false,
    ctaLoading = false,
    onCta,
    showBack = true,
    hasKeyboard = false,
    stepLabel,
    children,
    footerExtra,
    noStickyFooter = false,
}: OnboardingShellProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const content = (
        <View style={[s.container, { backgroundColor: C.background }]}>
            {/* Header: Back + Progress */}
            <View style={[s.header, { paddingTop: insets.top + 12 }]}>
                {/* Back button row */}
                <Animated.View entering={FadeInDown.duration(400)} style={s.navRow}>
                    {showBack ? (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            style={[s.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="chevron-back" size={22} color={C.text} />
                        </TouchableOpacity>
                    ) : (
                        <View style={s.backBtnPlaceholder} />
                    )}

                    {/* Step label */}
                    <Text style={[s.stepLabel, { color: C.primary }]}>
                        {stepLabel || `${step} of ${totalSteps}`}
                    </Text>

                    <View style={s.backBtnPlaceholder} />
                </Animated.View>

                {/* Segmented Progress Pills */}
                <Animated.View entering={FadeInDown.duration(400).delay(50)} style={s.progressRow}>
                    {Array.from({ length: totalSteps }).map((_, i) => {
                        const isFilled = i < step;
                        const isCurrent = i === step - 1;
                        return (
                            <View
                                key={i}
                                style={[
                                    s.progressPill,
                                    isFilled
                                        ? { backgroundColor: C.primary }
                                        : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                                    isCurrent && s.progressPillCurrent,
                                ]}
                            />
                        );
                    })}
                </Animated.View>

                {/* Title + Subtitle */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={s.titleWrap}>
                    <Text style={[s.title, { color: C.text }]}>{title}</Text>
                    {subtitle ? (
                        <Text style={[s.subtitle, { color: C.textSecondary }]}>{subtitle}</Text>
                    ) : null}
                </Animated.View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={[
                    s.scrollContent,
                    !noStickyFooter && { paddingBottom: 140 },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {children}
            </ScrollView>

            {/* Sticky CTA Footer */}
            {!noStickyFooter && onCta && (
                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
                    {footerExtra}
                    <AnimatedButton
                        title={ctaTitle}
                        onPress={onCta}
                        disabled={ctaDisabled}
                        loading={ctaLoading}
                        type="capsule"
                        backgroundColor={ctaDisabled ? (isDark ? '#2C2C2E' : '#D1D5DB') : '#007AFF'}
                        shadowColor={ctaDisabled ? 'transparent' : '#0066D6'}
                        fullWidth
                    />
                </View>
            )}
        </View>
    );

    if (hasKeyboard) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {content}
            </KeyboardAvoidingView>
        );
    }

    return content;
}

const s = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnPlaceholder: {
        width: 40,
        height: 40,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Progress pills
    progressRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 24,
    },
    progressPill: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    progressPillCurrent: {
        height: 5,
        borderRadius: 2.5,
    },

    // Title
    titleWrap: {
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        marginTop: 8,
    },

    // Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
});
