import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, View, useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import {
    learningGoals,
    learningGoalsResponse,
} from '@/components/onboarding/onboardingContent';
import { onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export default function LearningGoalsScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const hasName = !!onboardingData.first_name?.trim();
    const selected = onboardingData.learning_goals?.[0] ?? null;
    const entrance = useOnboardingEntrance('learning-goals');
    const completeEntrance = entrance.complete;
    const [dialogResponse, setDialogResponse] = useState<string | null>(null);
    const isResponding = dialogResponse !== null;
    const questionText = dialogResponse ?? "What's keeping you in the dark?";

    useFocusEffect(
        useCallback(() => {
            setDialogResponse(null);
        }, []),
    );

    useEffect(() => {
        void setOnboardingStep(1);
    }, [setOnboardingStep]);

    useEffect(() => {
        if (!hasName) {
            router.replace('/(onboarding)/name');
        }
    }, [hasName, router]);

    const handleTypingComplete = useCallback(() => {
        if (dialogResponse !== null) {
            router.push('/(onboarding)/explanation-preferences');
            return;
        }

        completeEntrance();
    }, [completeEntrance, dialogResponse, router]);

    const handleSelect = (id: (typeof learningGoals)[number]['id']) => {
        if (isResponding) return;

        haptics.selectionAsync();
        void setOnboardingData({ learning_goals: [id] });
        setDialogResponse(learningGoalsResponse);
    };

    if (!hasName) return null;

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={1} />

            <View style={onboardingStyles.body}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={onboardingStyles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={onboardingStyles.topSpacer} />

                    <OnboardingQuestion
                        prompt={questionText}
                        shouldType={!entrance.isComplete || isResponding}
                        reducedMotionCompletionDelayMs={
                            isResponding ? 1200 : 0
                        }
                        onTypingComplete={handleTypingComplete}
                    />

                    <OnboardingReveal
                        visible={entrance.isComplete}
                        animateOnMount={entrance.shouldAnimate}
                    >
                        <View style={onboardingStyles.options}>
                            {learningGoals.map((goal) => (
                                <OnboardingCard
                                    key={goal.id}
                                    label={goal.label}
                                    isSelected={selected === goal.id}
                                    onPress={() => handleSelect(goal.id)}
                                    accessibilityRole="radio"
                                    disabled={isResponding}
                                />
                            ))}
                        </View>
                    </OnboardingReveal>
                </ScrollView>
            </View>
        </View>
    );
}
