import React from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
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
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    // Progress calculation
    const progressPercent = Math.max(5, (step / totalSteps) * 100);

    const content = (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header: Back + Skip */}
            <View 
                className="w-full z-50" 
                style={{ 
                    paddingTop: insets.top,
                    backgroundColor: isDark ? 'rgba(11,12,14,0.92)' : 'rgba(255,255,255,0.92)',
                    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
            >
                <View className="h-14 px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        {showBack ? (
                            <TouchableOpacity
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                                accessibilityLabel="Go back"
                            >
                                <Icon name="ArrowLeft" size={22} color="default" />
                            </TouchableOpacity>
                        ) : (
                            <View className="w-10 h-10" />
                        )}
                    </View>
                    <View className="flex-row items-center">
                        {showSkip && (
                            <TouchableOpacity
                                onPress={onSkip}
                                activeOpacity={0.7}
                                className="min-h-[44px] px-3 items-center justify-center"
                            >
                                <Text style={{ color: C.textSecondary }} className="font-semibold text-[14px]">Skip</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

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
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 40 : 80} 
                    tint={isDark ? 'dark' : 'light'} 
                    className="absolute bottom-0 w-full z-50 shadow-sm"
                    style={{ 
                        paddingBottom: Math.max(insets.bottom, 16),
                        borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
                        borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    }}
                >
                    <View 
                        className="px-4 pt-3 pb-3"
                        style={{ backgroundColor: isDark ? 'rgba(11,12,14,0.75)' : 'rgba(255,255,255,0.75)' }}
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
                </BlurView>
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
