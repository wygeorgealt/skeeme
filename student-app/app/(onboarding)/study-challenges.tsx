import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, View, useColorScheme } from 'react-native';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import { studyChallenges } from '@/components/onboarding/onboardingContent';
import { onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

export default function StudyChallengesScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.study_challenges?.[0] ?? null;
    const entrance = useOnboardingEntrance('study-challenges');
    const completeEntrance = entrance.complete;
    const [dialogResponse, setDialogResponse] = useState<string | null>(null);
    const isResponding = dialogResponse !== null;
    const questionText =
        dialogResponse ?? "What's giving you the most trouble when studying?";

    useFocusEffect(
        useCallback(() => {
            setDialogResponse(null);
        }, []),
    );

    useEffect(() => {
        void setOnboardingStep(3);
    }, [setOnboardingStep]);

    const handleTypingComplete = useCallback(() => {
        if (dialogResponse !== null) {
            router.push('/(onboarding)/daily-goal');
            return;
        }

        completeEntrance();
    }, [completeEntrance, dialogResponse, router]);

    const handleSelect = (
        id: (typeof studyChallenges)[number]['id'],
        response: string,
    ) => {
        if (isResponding) return;

        haptics.selectionAsync();
        void setOnboardingData({ study_challenges: [id] });
        setDialogResponse(response);
    };

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={3} />

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
                            {studyChallenges.map((option) => (
                                <OnboardingCard
                                    key={option.id}
                                    label={option.label}
                                    isSelected={selected === option.id}
                                    onPress={() =>
                                        handleSelect(option.id, option.response)
                                    }
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
