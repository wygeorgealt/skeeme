import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, View, useColorScheme } from 'react-native';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import { explanationPreferences } from '@/components/onboarding/onboardingContent';
import { onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

export default function ExplanationPreferencesScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.explanation_preference ?? null;
    const entrance = useOnboardingEntrance('explanation-preferences');
    const completeEntrance = entrance.complete;
    const [dialogResponse, setDialogResponse] = useState<string | null>(null);
    const isResponding = dialogResponse !== null;
    const questionText =
        dialogResponse ?? 'How would you like me to explain things?';

    useFocusEffect(
        useCallback(() => {
            setDialogResponse(null);
        }, []),
    );

    useEffect(() => {
        void setOnboardingStep(2);
    }, [setOnboardingStep]);

    const handleTypingComplete = useCallback(() => {
        if (dialogResponse !== null) {
            router.push('/(onboarding)/study-challenges');
            return;
        }

        completeEntrance();
    }, [completeEntrance, dialogResponse, router]);

    const handleSelect = (
        id: (typeof explanationPreferences)[number]['id'],
        response: string,
    ) => {
        if (isResponding) return;

        haptics.selectionAsync();
        void setOnboardingData({ explanation_preference: id });
        setDialogResponse(response);
    };

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={2} />

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
                            {explanationPreferences.map((option) => (
                                <OnboardingCard
                                    key={option.id}
                                    label={option.label}
                                    description={option.description}
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
