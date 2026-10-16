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

const GOALS = [
    { key: 'difficult-topics', label: 'Understand difficult topics', desc: 'Break down complex concepts into first principles', icon: 'Lightbulb' },
    { key: 'prep-exams', label: 'Prepare for exams', desc: 'Practice questions, formula recall & mock drills', icon: 'GraduationCap' },
    { key: 'keep-up', label: 'Keep up with classes', desc: 'Daily reviews & quick summaries', icon: 'BookOpen' },
    { key: 'solve-problems', label: 'Step-by-step problem solving', desc: 'Guided walkthroughs through math and science', icon: 'Calculator' },
    { key: 'homework', label: 'Homework assistance', desc: 'Conceptual hints without outright spoilers', icon: 'FileCheck' },
    { key: 'revise-faster', label: 'Rapid revision', desc: 'Spaced repetition flashcards & cheat sheets', icon: 'Zap' },
    { key: 'improve-grades', label: 'Boost overall grades', desc: 'Diagnostic performance insights & weak-spot drills', icon: 'TrendingUp' },
];

export default function GoalScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selectedGoals, setSelectedGoals] = useState<string[]>(['difficult-topics', 'prep-exams']);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    useEffect(() => {
        setOnboardingStep(3);
    }, []);

    const toggleGoal = (key: string) => {
        Haptics.selectionAsync();
        if (selectedGoals.includes(key)) {
            setSelectedGoals(prev => prev.filter(k => k !== key));
        } else {
            setSelectedGoals(prev => [...prev, key]);
        }
    };

    const handleNext = () => {
        if (selectedGoals.length === 0) return;
        setOnboardingData({ 
            academic_goal: selectedGoals.join(',') 
        });
        router.push('/(onboarding)/style');
    };

    return (
        <OnboardingShell
            step={3}
            totalSteps={8}
            title="What's your main goal?"
            subtitle="Choose what you'd like to prioritize. You can select multiple."
            ctaDisabled={selectedGoals.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-3 pb-6">
                {/* Active Count Pill */}
                <View className="flex-row items-center justify-between mb-1">
                    <Text style={{ color: C.textSecondary }} className="text-[12px] font-semibold uppercase tracking-wider">
                        Study Focus
                    </Text>
                    <View 
                        className="px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: selectedGoals.length > 0 ? (isDark ? 'rgba(0,122,255,0.18)' : '#EBF5FF') : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F3F5') }}
                    >
                        <Text className={`text-[11px] font-bold ${selectedGoals.length > 0 ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>
                            {selectedGoals.length} selected
                        </Text>
                    </View>
                </View>

                {/* Goals List */}
                <View className="flex-col gap-3">
                    {GOALS.map((goal, index) => {
                        const isSelected = selectedGoals.includes(goal.key);
                        return (
                            <Animated.View key={goal.key} entering={FadeInUp.delay(index * 40).duration(300)}>
                                <Pressable
                                    onPress={() => toggleGoal(goal.key)}
                                    className="flex-row items-center p-4 rounded-2xl active:scale-[0.99] transition-all"
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
                                        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5 shrink-0"
                                        style={{
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0,122,255,0.22)' : '#D8E2FF') 
                                                : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F3F5')
                                        }}
                                    >
                                        <Icon 
                                            name={goal.icon as any} 
                                            size={20} 
                                            color={isSelected ? 'primary' : 'default'} 
                                        />
                                    </View>
                                    <View className="flex-col flex-1 min-w-0 pr-1">
                                        <Text 
                                            style={{ color: isSelected ? '#007AFF' : C.text }} 
                                            className="font-semibold text-[15px] leading-snug"
                                        >
                                            {goal.label}
                                        </Text>
                                        <Text 
                                            style={{ color: C.textSecondary }} 
                                            className="text-[13px] leading-relaxed mt-0.5"
                                        >
                                            {goal.desc}
                                        </Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>
        </OnboardingShell>
    );
}
