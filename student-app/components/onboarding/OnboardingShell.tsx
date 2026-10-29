import React from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Ensure Ionicons can accept className if needed, but standard style works too.

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
    hasKeyboard?: boolean;
    children: React.ReactNode;
    footerExtra?: React.ReactNode;
    noStickyFooter?: boolean;
    showSkip?: boolean;
    onSkip?: () => void;
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
    children,
    footerExtra,
    noStickyFooter = false,
    showSkip = false,
    onSkip,
}: OnboardingShellProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    // Progress calculation
    const progressPercent = Math.max(5, (step / totalSteps) * 100);

    const content = (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerBackVisible: showBack,
                    headerBackTitle: '',
                    headerTintColor: C.icon,
                    headerTransparent: false,
                    headerRight: showSkip
                        ? () => (
                              <TouchableOpacity
                                  onPress={onSkip}
                                  activeOpacity={0.7}
                                  accessibilityRole="button"
                                  accessibilityLabel="Skip onboarding step"
                                  style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
                              >
                                  <Text style={{ color: C.textSecondary, fontWeight: '600', fontSize: 14 }}>
                                      Skip
                                  </Text>
                              </TouchableOpacity>
                          )
                        : undefined,
                }}
            />

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1 w-full"
                style={{ backgroundColor: C.background }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: noStickyFooter ? 40 : 130,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-col w-full gap-5">
                    {/* Progress Milestone Header */}
                    <View className="flex-col gap-1">
                        <View 
                            className="w-full h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E9ECEF' }}
                        >
                            <View 
                                className="h-full bg-accent-electric-blue rounded-full" 
                                style={{ width: `${progressPercent}%` }} 
                            />
                        </View>
                    </View>

                    {/* Header Title & Subtitle */}
                    <Animated.View entering={FadeInDown.duration(400).delay(50)} className="flex-col gap-1.5">
                        <Text style={{ color: C.text }} className="text-[26px] font-bold tracking-tight leading-8">{title}</Text>
                        {subtitle && (
                            <Text style={{ color: C.textSecondary }} className="text-[15px] leading-relaxed">{subtitle}</Text>
                        )}
                    </Animated.View>

                    {/* Main Children Area */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-col gap-4 mt-1">
                        {children}
                    </Animated.View>
                </View>
            </ScrollView>

            {/* Sticky CTA Footer */}
            {!noStickyFooter && onCta && (
                <View
                    className="absolute bottom-0 w-full z-50"
                    style={{
                        paddingBottom: Math.max(insets.bottom, 16),
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        backgroundColor: C.background,
                    }}
                >
                    <View
                        className="px-4 pt-3 pb-3"
                    >
                        {footerExtra}
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <AnimatedButton
                                title={ctaTitle}
                                onPress={onCta}
                                loading={ctaLoading}
                                disabled={ctaDisabled || ctaLoading}
                                type="capsule"
                                backgroundColor="#007AFF"
                                shadowColor="#0066D6"
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    if (hasKeyboard) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {content}
            </KeyboardAvoidingView>
        );
    }

    return content;
}
