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

const SENTIMENTS = [
    { key: 'pretty-well', label: "I'm doing well", icon: 'Sparkles' },
    { key: 'okay', label: "I'm doing okay", icon: 'CheckCircle' },
    { key: 'struggling-topics', label: "Struggling with some topics", icon: 'HelpCircle' },
    { key: 'really-struggling', label: "Need significant help", icon: 'AlertCircle' },
    { key: 'get-better', label: "Aiming for top percentile", icon: 'TrendingUp' },
];

const FRICTIONS = [
    { key: 'basics', label: 'Understanding core concepts' },
    { key: 'remembering', label: 'Remembering formulas & definitions' },
    { key: 'solving', label: 'Step-by-step problem solving' },
    { key: 'focused', label: 'Staying consistent & focused' },
    { key: 'exams', label: 'Test anxiety & timed exams' },
    { key: 'none', label: 'No specific friction', isNone: true },
];

export default function StyleScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [sentiment, setSentiment] = useState<string>('struggling-topics');
    const [selectedFrictions, setSelectedFrictions] = useState<string[]>(['basics', 'remembering']);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

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
        if (!sentiment) return;
        
        setOnboardingData({ 
            learning_style: sentiment,
            frictions: selectedFrictions.join(','),
        });
        
        router.push('/(onboarding)/tone');
    };

    return (
        <OnboardingShell
            step={4}
            totalSteps={8}
            title="How are your classes going?"
            subtitle="Be honest—this helps us adapt explanation speed and detail."
            ctaDisabled={!sentiment}
            onCta={handleNext}
        >
            <View className="flex-col gap-6 pb-6">
                {/* Section 1: Academic Sentiment */}
                <View className="flex-col gap-2.5">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Current Academic Status</Text>

                    <View className="flex-col gap-2.5">
                        {SENTIMENTS.map(s => {
                            const isSelected = sentiment === s.key;
                            return (
                                <Pressable
                                    key={s.key}
                                    onPress={() => toggleSentiment(s.key)}
                                    className="flex-row items-center p-3.5 rounded-2xl active:scale-[0.99] transition-all"
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
                                    <View 
                                        className="w-10 h-10 rounded-xl items-center justify-center mr-3 shrink-0"
                                        style={{
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0,122,255,0.22)' : '#D8E2FF') 
                                                : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F3F5')
                                        }}
                                    >
                                        <Icon 
                                            name={s.icon as any} 
                                            size={18} 
                                            color={isSelected ? 'primary' : 'default'} 
                                        />
                                    </View>
                                    <Text 
                                        style={{ 
                                            color: isSelected ? '#007AFF' : C.text,
                                            fontWeight: isSelected ? '700' : '500',
                                        }} 
                                        className="text-[15px] flex-1 leading-snug"
                                    >
                                        {s.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Section 2: Main Study Challenges */}
                <View className="flex-col gap-2.5">
                    <View className="flex-row items-center justify-between">
                        <Text style={{ color: C.text }} className="text-[14px] font-semibold">Biggest Challenges</Text>
                        <Text style={{ color: C.textSecondary }} className="text-[12px]">Optional</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5">
                        {FRICTIONS.map(f => {
                            const isSelected = selectedFrictions.includes(f.key);
                            return (
                                <Pressable
                                    key={f.key}
                                    onPress={() => toggleFriction(f.key, f.isNone)}
                                    className="px-4 py-2.5 rounded-xl transition-all active:scale-95"
                                    style={{
                                        backgroundColor: isSelected 
                                            ? (isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF') 
                                            : (isDark ? 'rgba(255,255,255,0.05)' : '#F6F8FC'),
                                        borderWidth: 1.5,
                                        borderColor: isSelected 
                                            ? '#007AFF' 
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                    }}
                                >
                                    <Text 
                                        style={{ 
                                            color: isSelected ? '#007AFF' : C.text,
                                            fontWeight: isSelected ? '700' : '500',
                                        }} 
                                        className="text-[13px]"
                                    >
                                        {f.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
