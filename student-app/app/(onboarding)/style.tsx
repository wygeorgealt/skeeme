import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';

const SENTIMENTS = [
    { key: 'pretty-well', label: "I'm doing pretty well", emoji: '🙂' },
    { key: 'okay', label: "I'm doing okay", emoji: '😐' },
    { key: 'struggling-topics', label: "I'm struggling with some topics", subtitle: 'Normal curve detected · We will dial down cognitive load', emoji: '😵' },
    { key: 'really-struggling', label: "I'm really struggling", emoji: '🔥' },
    { key: 'get-better', label: "I want to get even better", emoji: '🚀' },
];

const FRICTIONS = [
    { key: 'basics', label: 'Understanding the basics' },
    { key: 'start', label: 'Knowing where to start' },
    { key: 'remembering', label: 'Remembering what I learn' },
    { key: 'solving', label: 'Solving problems' },
    { key: 'focused', label: 'Staying focused' },
    { key: 'exams', label: 'Preparing for exams' },
    { key: 'explanations', label: 'Understanding explanations' },
    { key: 'none', label: 'Nothing in particular', isNone: true },
];

export default function StyleScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [sentiment, setSentiment] = useState<string>('struggling-topics');
    const [selectedFrictions, setSelectedFrictions] = useState<string[]>(['basics', 'start', 'solving']);

    useEffect(() => {
        setOnboardingStep(4);
    }, []);

    const toggleSentiment = (key: string) => {
        Haptics.selectionAsync();
        setSentiment(key);
    };

    const toggleFriction = (key: string, isNone?: boolean) => {
        Haptics.selectionAsync();
        
        if (isNone) {
            setSelectedFrictions(['none']);
            return;
        }

        setSelectedFrictions(prev => {
            const noNone = prev.filter(k => k !== 'none');
            if (noNone.includes(key)) {
                return noNone.filter(k => k !== key);
            }
            return [...noNone, key];
        });
    };

    const handleNext = () => {
        if (!sentiment || selectedFrictions.length === 0) return;
        
        setOnboardingData({ 
            // Save sentiment and frictions. We map this to existing properties or new ones.
            // learning_style is what was here before, we can overload it for now or add new props.
            learning_style: sentiment,
            learning_friction: selectedFrictions.join(',')
        } as any);
        
        router.push('/(onboarding)/tone');
    };

    return (
        <OnboardingShell
            step={4}
            totalSteps={9}
            title="What makes studying difficult?"
            subtitle="Be honest—Skeemy adapts to your friction points to keep you stress-free."
            ctaDisabled={!sentiment || selectedFrictions.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-8 pb-4">
                
                {/* Section 1: Sentiment */}
                <View className="flex-col gap-4">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                            <Text className="text-[11px] font-bold text-on-primary">1</Text>
                        </View>
                        <Text className="text-[18px] font-semibold text-on-surface tracking-tight">How are things going with school?</Text>
                    </View>

                    <View className="flex-col gap-1.5">
                        {SENTIMENTS.map((item, index) => {
                            const isSelected = sentiment === item.key;
                            return (
                                <Animated.View key={item.key} entering={FadeInUp.delay(index * 40).duration(300)}>
                                    <Pressable
                                        onPress={() => toggleSentiment(item.key)}
                                        className={`flex-row items-center justify-between p-4 rounded-xl transition-all active:scale-[0.99] ${
                                            isSelected 
                                                ? 'bg-primary-container shadow-md' 
                                                : 'bg-surface-container-lowest shadow-sm'
                                        }`}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <Text className="text-[24px]">{item.emoji}</Text>
                                            <View className="flex-col">
                                                <Text className={`font-semibold text-[16px] ${
                                                    isSelected ? 'text-on-primary-container' : 'text-on-surface'
                                                }`}>{item.label}</Text>
                                                {isSelected && item.subtitle && (
                                                    <Text className="text-[13px] text-primary mt-0.5">{item.subtitle}</Text>
                                                )}
                                            </View>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* Section 2: Friction Points */}
                <View className="flex-col gap-4">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                            <Text className="text-[11px] font-bold text-on-primary">2</Text>
                        </View>
                        <Text className="text-[18px] font-semibold text-on-surface tracking-tight">What do you usually struggle with?</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5">
                        {FRICTIONS.map(f => {
                            const isSelected = selectedFrictions.includes(f.key);
                            return (
                                <Pressable
                                    key={f.key}
                                    onPress={() => toggleFriction(f.key, f.isNone)}
                                    className={`flex-row items-center gap-2 px-4 py-3 rounded-full transition-all active:scale-95 ${
                                        isSelected 
                                            ? 'bg-accent-electric-blue shadow-md' 
                                            : 'bg-surface-container-lowest shadow-sm border border-transparent'
                                    }`}
                                >
                                    {f.isNone && (
                                        <Icon 
                                            name="Smile" 
                                            size={18} 
                                            color={isSelected ? 'white' : 'secondary'} 
                                        />
                                    )}
                                    <Text className={`font-semibold text-[14px] ${
                                        isSelected ? 'text-on-primary' : 'text-on-surface'
                                    }`}>{f.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
