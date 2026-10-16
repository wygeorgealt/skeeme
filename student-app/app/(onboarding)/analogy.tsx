import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const EXAMPLES = [
    { key: 'everyday', label: 'Everyday Life', icon: 'Globe' },
    { key: 'tech', label: 'Technology', icon: 'Laptop' },
    { key: 'sports', label: 'Sports', icon: 'Activity' },
    { key: 'gaming', label: 'Gaming', icon: 'Gamepad2' },
    { key: 'movies', label: 'Pop Culture', icon: 'Film' },
];

const TONES = [
    { key: 'supportive', label: 'Supportive', desc: 'Patient & encouraging', icon: 'Heart' },
    { key: 'direct', label: 'Direct', desc: 'Concise & straightforward', icon: 'Target' },
    { key: 'strict', label: 'Accountable', desc: 'Challenging & disciplined', icon: 'Shield' },
    { key: 'fun', label: 'Witty', desc: 'Lighthearted & casual', icon: 'Sparkles' },
];

export default function AnalogyScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [selectedExamples, setSelectedExamples] = useState<string[]>(['everyday', 'tech']);
    const [selectedTone, setSelectedTone] = useState<string>('direct');
    const [customNote, setCustomNote] = useState('');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

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
        });
        
        router.push('/(onboarding)/exam-date');
    };

    return (
        <OnboardingShell
            step={6}
            totalSteps={8}
            title="Personalized analogies"
            subtitle="Connect difficult theories to topics you already know."
            ctaDisabled={!selectedTone || selectedExamples.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-6 pb-6">
                {/* Section 1: Relatable Domains */}
                <View className="flex-col gap-2.5">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Preferred Analogy Themes</Text>
                    
                    <View className="flex-row flex-wrap gap-2.5">
                        {EXAMPLES.map(ex => {
                            const isSelected = selectedExamples.includes(ex.key);
                            return (
                                <Pressable
                                    key={ex.key}
                                    onPress={() => toggleExample(ex.key)}
                                    className="flex-row items-center gap-2 px-4 py-3 rounded-2xl active:scale-95 transition-all"
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
                                    <Icon 
                                        name={ex.icon as any} 
                                        size={18} 
                                        color={isSelected ? 'primary' : 'default'} 
                                    />
                                    <Text 
                                        style={{ 
                                            color: isSelected ? '#007AFF' : C.text,
                                            fontWeight: isSelected ? '700' : '500',
                                        }} 
                                        className="text-[14px]"
                                    >
                                        {ex.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Section 2: Tutor Persona */}
                <View className="flex-col gap-2.5">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Tutor Persona</Text>
                    
                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {TONES.map(t => {
                            const isSelected = selectedTone === t.key;
                            return (
                                <Pressable
                                    key={t.key}
                                    onPress={() => handleSelectTone(t.key)}
                                    className="w-[48%] p-4 rounded-2xl active:scale-[0.98] transition-all flex-col justify-between"
                                    style={{
                                        backgroundColor: isSelected 
                                            ? (isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF') 
                                            : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                                        borderWidth: 1.5,
                                        borderColor: isSelected 
                                            ? '#007AFF' 
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                        minHeight: 110,
                                    }}
                                >
                                    <View 
                                        className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                                        style={{
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0,122,255,0.22)' : '#D8E2FF') 
                                                : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F3F5')
                                        }}
                                    >
                                        <Icon 
                                            name={t.icon as any} 
                                            size={20} 
                                            color={isSelected ? 'primary' : 'default'} 
                                        />
                                    </View>
                                    <View className="flex-col">
                                        <Text 
                                            style={{ color: isSelected ? '#007AFF' : C.text }} 
                                            className="font-semibold text-[15px] leading-snug"
                                        >
                                            {t.label}
                                        </Text>
                                        <Text 
                                            style={{ color: C.textSecondary }} 
                                            className="text-[12px] leading-tight mt-0.5"
                                        >
                                            {t.desc}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Section 3: Custom Note Input */}
                <View className="flex-col gap-2">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Special Instructions (Optional)</Text>
                    <View 
                        className="rounded-2xl p-3.5"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        }}
                    >
                        <TextInput
                            className="w-full text-[14px] min-h-[60px]"
                            style={{ color: C.text }}
                            placeholder="e.g. Always show math formulas step by step, or use Python code snippets."
                            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            multiline
                            numberOfLines={3}
                            maxLength={160}
                            value={customNote}
                            onChangeText={setCustomNote}
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
