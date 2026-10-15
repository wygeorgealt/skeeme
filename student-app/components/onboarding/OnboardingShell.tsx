import React from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import { AnimatedButton } from 'react-native-3d-animated-buttons';

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
    
    // Progress calculation
    const progressPercent = Math.max(5, (step / totalSteps) * 100);

    const content = (
        <View className="flex-1 bg-surface">
            {/* Header: Back + Skip */}
            <View 
                className="w-full z-50 bg-surface/80" 
                style={{ paddingTop: insets.top }}
            >
                <View className="h-16 px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        {showBack ? (
                            <TouchableOpacity
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                                className="w-11 h-11 rounded-full items-center justify-center bg-transparent active:bg-surface-container-high"
                                accessibilityLabel="Go back"
                            >
                                <Icon name="ArrowLeft" size={24} color="text" />
                            </TouchableOpacity>
                        ) : (
                            <View className="w-11 h-11" />
                        )}
                    </View>
                    <View className="flex-row items-center">
                        {showSkip && (
                            <TouchableOpacity
                                onPress={onSkip}
                                activeOpacity={0.7}
                                className="min-h-[44px] px-3 items-center justify-center"
                            >
                                <Text className="font-semibold text-[14px] text-outline">Skip</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1 bg-surface w-full"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: noStickyFooter ? 40 : 140,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-col w-full gap-6 mt-2">
                    {/* Progress Milestone Header */}
                    <View className="flex-col gap-1 pt-1">
                        <View className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-accent-electric-blue rounded-full" 
                                style={{ width: `${progressPercent}%` }} 
                            />
                        </View>
                    </View>

                    {/* Header Title & Subtitle */}
                    <Animated.View entering={FadeInDown.duration(400).delay(50)} className="flex-col gap-1">
                        <Text className="text-[26px] font-bold text-on-surface tracking-tight leading-8">{title}</Text>
                        {subtitle && (
                            <Text className="text-[15px] text-on-surface-variant leading-relaxed mt-1">{subtitle}</Text>
                        )}
                    </Animated.View>

                    {/* Main Children Area */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-col gap-4 mt-2">
                        {children}
                    </Animated.View>
                </View>
            </ScrollView>

            {/* Sticky CTA Footer */}
            {!noStickyFooter && onCta && (
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 38 : 70} 
                    tint="light" 
                    className="absolute bottom-0 w-full z-50 shadow-sm"
                    style={{ paddingBottom: Math.max(insets.bottom, 16) }}
                >
                    <View className="px-4 pt-4 pb-4 bg-surface/85">
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
