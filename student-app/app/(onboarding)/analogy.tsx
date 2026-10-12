import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const EXAMPLES = [
    { key: 'everyday', label: 'Everyday Life', emoji: '🌍' },
    { key: 'tech', label: 'Tech', emoji: '💻' },
    { key: 'sports', label: 'Sports', emoji: '⚽' },
    { key: 'gaming', label: 'Gaming', emoji: '🎮' },
    { key: 'movies', label: 'Movies & Pop Culture', emoji: '🎬' },
];

const TONES = [
    { key: 'supportive', label: 'Supportive', desc: 'Patient & encouraging', emoji: '🤗' },
    { key: 'direct', label: 'Straight to Point', desc: 'No fluff, clear steps', emoji: '🎯' },
    { key: 'strict', label: 'Strict', desc: 'Keep me accountable', emoji: '📐' },
    { key: 'fun', label: 'Fun', desc: 'Light & witty', emoji: '😂' },
];

export default function AnalogyScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [selectedExamples, setSelectedExamples] = useState<string[]>(['everyday', 'tech', 'gaming']);
    const [selectedTone, setSelectedTone] = useState<string>('direct');
    const [customNote, setCustomNote] = useState('');

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    const toggleExample = (key: string) => {
        Haptics.selectionAsync();
        setSelectedExamples(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    };

    const handleSelectTone = (key: string) => {
        Haptics.selectionAsync();
        setSelectedTone(key);
    };

    const handleNext = () => {
        if (!selectedTone || selectedExamples.length === 0) return;
        
        setOnboardingData({ 
            analogy_focus: selectedExamples.join(','),
            tone: selectedTone,
            // we can store customNote if needed
        });
        
        router.push('/(onboarding)/exam-date');
    };

    return (
        <OnboardingShell
            step={6}
            totalSteps={9}
            title="What makes things click for you?"
            subtitle="Personalize the analogies Skeemy draws on and the personality it speaks with."
            ctaDisabled={!selectedTone || selectedExamples.length === 0}
            onCta={handleNext}
            hasKeyboard
        >
            <View className="flex-col gap-8 pb-4">
                
                {/* Section 1: Examples & Analogies */}
                <View className="flex-col gap-3">
                    <View className="flex-row items-baseline justify-between">
                        <Text className="text-[16px] font-semibold text-on-surface">What kind of examples do you like?</Text>
                        <Text className="text-[11px] font-bold text-outline">Choose any</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5">
                        {EXAMPLES.map((ex, index) => {
                            const isSelected = selectedExamples.includes(ex.key);
                            return (
                                <Animated.View key={ex.key} entering={FadeInUp.delay(index * 30).duration(300)}>
                                    <Pressable
                                        onPress={() => toggleExample(ex.key)}
                                        className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full min-h-[44px] transition-all active:scale-95 ${
                                            isSelected 
                                                ? 'bg-accent-electric-blue shadow-sm' 
                                                : 'bg-surface-container hover:bg-surface-container-high'
                                        }`}
                                    >
                                        <MaterialIcons 
                                            name="check" 
                                            size={18} 
                                            color={isSelected ? '#ffffff' : 'transparent'} 
                                            style={{ display: isSelected ? 'flex' : 'none' }}
                                        />
                                        <Text className="text-[16px]">{ex.emoji}</Text>
                                        <Text className={`font-semibold text-[14px] ${
                                            isSelected ? 'text-on-primary' : 'text-on-surface'
                                        }`}>{ex.label}</Text>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* Section 2: Tone Grid */}
                <View className="flex-col gap-3">
                    <View className="flex-row items-baseline justify-between">
                        <Text className="text-[16px] font-semibold text-on-surface">How should Skeeme talk to you?</Text>
                        <Text className="text-[11px] font-bold text-outline">Tone</Text>
                    </View>

                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {TONES.map((t, index) => {
                            const isSelected = selectedTone === t.key;
                            return (
                                <Animated.View key={t.key} entering={FadeInUp.delay((index + 5) * 30).duration(300)} className="w-[48%]">
                                    <Pressable
                                        onPress={() => handleSelectTone(t.key)}
                                        className={`flex-col justify-between p-4 rounded-2xl min-h-[136px] transition-all active:scale-95 ${
                                            isSelected 
                                                ? 'bg-primary-container shadow-sm' 
                                                : 'bg-surface-container-lowest shadow-sm border border-transparent'
                                        }`}
                                    >
                                        <View className="flex-row items-start justify-between">
                                            <View className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                isSelected ? 'bg-accent-electric-blue/15' : 'bg-surface-container-low'
                                            }`}>
                                                <Text className="text-[20px]">{t.emoji}</Text>
                                            </View>
                                            <View className={`w-5 h-5 rounded-full flex items-center justify-center transition-opacity ${
                                                isSelected ? 'bg-accent-electric-blue opacity-100 shadow-sm' : 'opacity-0'
                                            }`}>
                                                <MaterialIcons name="check" size={14} color="#ffffff" style={{ fontWeight: 'bold' as any }} />
                                            </View>
                                        </View>
                                        <View className="mt-2 flex-col gap-0.5">
                                            <Text className={`font-semibold text-[14px] ${
                                                isSelected ? 'text-on-primary-container' : 'text-on-surface'
                                            }`}>{t.label}</Text>
                                            <Text className={`text-[13px] ${
                                                isSelected ? 'text-on-primary-fixed-variant' : 'text-on-surface-variant'
                                            }`}>{t.desc}</Text>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* Optional Custom Note */}
                <Animated.View entering={FadeInDown.delay(300)} className="flex-col mt-2">
                    <View className="relative rounded-2xl bg-surface-container-lowest p-3 shadow-sm border border-transparent focus-within:border-accent-electric-blue/20">
                        <TextInput
                            className="w-full text-[13px] text-on-surface min-h-[60px]"
                            placeholder="Tell me how you'd like me to teach you... e.g. Show every step when solving math, use Python code snippets."
                            placeholderTextColor="#8e8e93"
                            multiline
                            numberOfLines={3}
                            maxLength={180}
                            value={customNote}
                            onChangeText={setCustomNote}
                            textAlignVertical="top"
                        />
                        <View className="flex-row items-center justify-between pt-2">
                            <View className="flex-row items-center gap-1.5">
                                <MaterialIcons name="tips-and-updates" size={16} color="#007aff" />
                                <Text className="text-[11px] font-bold text-accent-electric-blue">Skeemy adapts after each lesson</Text>
                            </View>
                            <Text className="text-[11px] font-bold text-outline">{customNote.length}/180</Text>
                        </View>
                    </View>
                </Animated.View>

            </View>
        </OnboardingShell>
    );
}
