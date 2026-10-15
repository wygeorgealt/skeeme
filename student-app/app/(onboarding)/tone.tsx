import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';

const STYLES = [
    { 
        key: 'simple', 
        label: 'Simple & Clear', 
        desc: 'Easy language, real-world examples, and intuitive analogies that make abstract theories immediately relatable.', 
        tagText: 'Recommended for STEM & Math',
        tagIcon: 'GraduationCap',
        icon: 'Sparkles' 
    },
    { 
        key: 'detailed', 
        label: 'Detailed & In-Depth', 
        desc: 'Thorough academic explanations, formal derivations, and deeper underlying theory for true foundational mastery.', 
        tagText: 'Deep Dive',
        tagIcon: 'FlaskConical',
        icon: 'FileSearch' 
    },
    { 
        key: 'balanced', 
        label: 'A Bit of Both', 
        desc: 'Keep it simple and visual when possible, but seamlessly dive into rigorous technical mechanics when challenged.', 
        tagText: 'Adaptive Balance',
        tagIcon: 'Sliders',
        icon: 'Scale' 
    },
];

export default function ToneScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [selectedStyle, setSelectedStyle] = useState<string>('simple');

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
            totalSteps={9}
            title="How should I explain things?"
            subtitle="Choose the teaching approach that best fits how your mind absorbs complex concepts."
            ctaDisabled={!selectedStyle}
            onCta={handleNext}
        >
            <View className="flex-col gap-4 pb-4">
                
                <View className="flex-col gap-4">
                    {STYLES.map((style, index) => {
                        const isSelected = selectedStyle === style.key;
                        return (
                            <Animated.View key={style.key} entering={FadeInUp.delay(index * 40).duration(300)}>
                                <Pressable
                                    onPress={() => handleSelect(style.key)}
                                    className={`w-full p-4 rounded-2xl transition-all active:scale-[0.99] ${
                                        isSelected 
                                            ? 'bg-surface-container-lowest shadow-md' 
                                            : 'bg-surface-container-low shadow-sm'
                                    }`}
                                >
                                    <View className="flex-row items-start gap-4">
                                        <View className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected ? 'bg-primary-container' : 'bg-surface-container'
                                        }`}>
                                            <Icon 
                                                name={style.icon as any} 
                                                size={24} 
                                                color={isSelected ? 'primary' : 'secondary'} 
                                            />
                                        </View>
                                        <View className="flex-1 min-w-0">
                                            <View className="flex-row items-center justify-between gap-2 mb-1">
                                                <Text className="font-semibold text-[16px] text-on-surface">{style.label}</Text>
                                            </View>
                                            <Text className="font-normal text-[15px] text-on-surface-variant leading-relaxed mb-3">
                                                {style.desc}
                                            </Text>
                                            
                                            <View className={`self-start flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                                                isSelected ? 'bg-primary-container' : 'bg-surface-container'
                                            }`}>
                                                <Icon 
                                                    name={style.tagIcon as any} 
                                                    size={14} 
                                                    color={isSelected ? 'primary' : 'secondary'} 
                                                />
                                                <Text className={`font-semibold text-[11px] tracking-wide ${
                                                    isSelected ? 'text-accent-electric-blue' : 'text-on-surface-variant'
                                                }`}>{style.tagText}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Info Tooltip */}
                <View className="w-full p-4 rounded-xl bg-surface-container-low flex-row items-center gap-3 mt-2">
                    <Icon name="Info" size={20} color="secondary" style={{ flexShrink: 0 }} />
                    <Text className="font-normal text-[13px] text-on-surface-variant flex-1">
                        You can change explanation difficulty or ask for an alternative analogy at any point in any lesson.
                    </Text>
                </View>
                
            </View>
        </OnboardingShell>
    );
}
