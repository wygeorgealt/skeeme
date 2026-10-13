import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';

const GOALS = [
    { key: 'difficult-topics', label: 'Understand difficult topics', desc: 'Deep conceptual clarity', emoji: '🧠' },
    { key: 'prep-exams', label: 'Prepare for exams', desc: 'Mock tests, practice drills & traps', emoji: '📝' },
    { key: 'keep-up', label: 'Keep up with classes', desc: 'Daily summaries & lecture recaps', emoji: '📚' },
    { key: 'solve-problems', label: 'Solve problems', desc: 'Step-by-step problem solver', emoji: '➗' },
    { key: 'homework', label: 'Understand homework', desc: 'Guided hints without direct spoilers', emoji: '🔍' },
    { key: 'revise-faster', label: 'Revise faster', desc: 'High-yield flashcards & cheatsheets', emoji: '⚡' },
    { key: 'improve-grades', label: 'Improve my grades', desc: 'Predictive score insights & analytics', emoji: '📈' },
];

export default function GoalScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    useEffect(() => {
        setOnboardingStep(3); // Adjusted step number in new flow
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
            totalSteps={9}
            title="What can Skeeme help you with?"
            subtitle="Select all that apply. This sets your core AI focus and dashboard priorities."
            ctaDisabled={selectedGoals.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-4 pb-4">
                {/* Active Count Pill */}
                <View className="flex-row items-center mb-1">
                    <View className={`px-2.5 py-0.5 rounded-full ${
                        selectedGoals.length > 0 
                            ? 'bg-accent-electric-blue shadow-sm' 
                            : 'bg-surface-container-high'
                    }`}>
                        <Text className={`text-[11px] font-bold ${
                            selectedGoals.length > 0 
                                ? 'text-on-primary' 
                                : 'text-on-surface-variant'
                        }`}>
                            {selectedGoals.length > 0 ? `${selectedGoals.length} selected` : 'None selected'}
                        </Text>
                    </View>
                </View>

                {/* Goals List */}
                <View className="flex-col gap-2">
                    {GOALS.map((goal, index) => {
                        const isSelected = selectedGoals.includes(goal.key);
                        return (
                            <Animated.View key={goal.key} entering={FadeInUp.delay(index * 50).duration(300)}>
                                <Pressable
                                    onPress={() => toggleGoal(goal.key)}
                                    className={`flex-row items-center justify-between p-4 rounded-[24px] bg-surface-container-lowest transition-all active:scale-[0.98] ${
                                        isSelected ? 'shadow-md border border-accent-electric-blue/10' : 'shadow-sm border border-transparent'
                                    }`}
                                >
                                    <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                                        <View className="w-12 h-12 rounded-2xl bg-surface-container-low items-center justify-center shadow-sm">
                                            <Text className="text-[24px]">{goal.emoji}</Text>
                                        </View>
                                        <View className="flex-col flex-1">
                                            <Text className="font-semibold text-[16px] text-on-surface" numberOfLines={1}>{goal.label}</Text>
                                            <Text className="text-[13px] text-on-surface-variant mt-0.5" numberOfLines={1}>{goal.desc}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className={`w-7 h-7 rounded-full items-center justify-center transition-all ${
                                        isSelected 
                                            ? 'bg-accent-electric-blue shadow-sm scale-100' 
                                            : 'bg-surface-container-high scale-95'
                                    }`}>
                                        {isSelected && (
                                            <Icon 
                                                name="Check" 
                                                size={18} 
                                                color="white" 
                                                strokeWidth={3}
                                            />
                                        )}
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
