import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const STYLES = [
    { 
        key: 'simple', 
        label: 'Intuitive & Practical', 
        desc: 'Plain language, real-world examples, and relatable everyday analogies.', 
        tagText: 'Best for fast learning',
        tagIcon: 'Sparkles',
        icon: 'Sparkles' 
    },
    { 
        key: 'detailed', 
        label: 'Deep & Rigorous', 
        desc: 'Academic derivations, first principles, and thorough theoretical foundations.', 
        tagText: 'Best for advanced mastery',
        tagIcon: 'FlaskConical',
        icon: 'FileSearch' 
    },
    { 
        key: 'balanced', 
        label: 'Balanced & Adaptive', 
        desc: 'Simple intuition first, seamlessly expanding into technical details when needed.', 
        tagText: 'Calibrated pace',
        tagIcon: 'Sliders',
        icon: 'Scale' 
    },
];

export default function ToneScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [selectedStyle, setSelectedStyle] = useState<string>('simple');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleSelect = (key: string) => {
        Haptics.selectionAsync();
        setSelectedStyle(key);
    };

    const handleNext = () => {
        if (!selectedStyle) return;
        
        setOnboardingData({ 
            tone: selectedStyle 
        });
        
        router.push('/(onboarding)/analogy');
    };

    return (
        <OnboardingShell
            step={5}
            totalSteps={8}
            title="Explanation depth"
            subtitle="Choose how you prefer concepts explained."
            ctaDisabled={!selectedStyle}
            onCta={handleNext}
        >
            <View className="flex-col gap-3 pb-6">
                {STYLES.map((style, index) => {
                    const isSelected = selectedStyle === style.key;
                    return (
                        <Animated.View key={style.key} entering={FadeInUp.delay(index * 50).duration(300)}>
                            <Pressable
                                onPress={() => handleSelect(style.key)}
                                className="w-full p-4 rounded-2xl active:scale-[0.99] transition-all"
                                style={{
                                    backgroundColor: isSelected 
                                        ? (isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF') 
                                        : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                                    borderWidth: 1.5,
                                    borderColor: isSelected 
                                        ? '#007AFF' 
                                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                }}
                            >
                                <View className="flex-row items-start gap-3.5">
                                    <View 
                                        className="w-11 h-11 rounded-xl items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0,122,255,0.22)' : '#D8E2FF') 
                                                : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F3F5')
                                        }}
                                    >
                                        <Icon 
                                            name={style.icon as any} 
                                            size={20} 
                                            color={isSelected ? 'primary' : 'default'} 
                                        />
                                    </View>
                                    <View className="flex-1 min-w-0">
                                        <Text 
                                            style={{ color: isSelected ? '#007AFF' : C.text }} 
                                            className="font-semibold text-[16px] leading-snug"
                                        >
                                            {style.label}
                                        </Text>
                                        <Text 
                                            style={{ color: C.textSecondary }} 
                                            className="text-[13px] leading-relaxed mt-1 mb-2.5"
                                        >
                                            {style.desc}
                                        </Text>
                                        
                                        <View 
                                            className="self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? (isDark ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.1)') 
                                                    : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F3F5')
                                            }}
                                        >
                                            <Icon 
                                                name={style.tagIcon as any} 
                                                size={12} 
                                                color={isSelected ? 'primary' : 'secondary'} 
                                            />
                                            <Text 
                                                style={{ 
                                                    color: isSelected ? '#007AFF' : C.textSecondary,
                                                }} 
                                                className="font-semibold text-[11px]"
                                            >
                                                {style.tagText}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
        </OnboardingShell>
    );
}
