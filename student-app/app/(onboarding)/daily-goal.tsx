import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import { dailyGoals } from '@/components/onboarding/onboardingContent';
import { onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

export default function DailyGoalScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.daily_goal ?? null;
    const entrance = useOnboardingEntrance('daily-goal');

    useEffect(() => {
        void setOnboardingStep(4);
    }, [setOnboardingStep]);

    const handleSelect = (id: (typeof dailyGoals)[number]['id']) => {
        haptics.selectionAsync();
        void setOnboardingData({ daily_goal: id });
        setTimeout(() => {
            router.push('/(onboarding)/personalized-plan');
        }, 180);
    };

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={4} />

            <View style={onboardingStyles.body}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={onboardingStyles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={onboardingStyles.topSpacer} />
                    <OnboardingQuestion
                        prompt="How long can we study for?"
                        shouldType={!entrance.isComplete}
                        onTypingComplete={entrance.complete}
                    />

                    <OnboardingReveal
                        visible={entrance.isComplete}
                        animateOnMount={entrance.shouldAnimate}
                    >
                        <View style={onboardingStyles.options}>
                            {dailyGoals.map((option) => (
                                <OnboardingCard
                                    key={option.id}
                                    label={option.label}
                                    description={option.description}
                                    isSelected={selected === option.id}
                                    onPress={() => handleSelect(option.id)}
                                    accessibilityRole="radio"
                                />
                            ))}
                        </View>
                    </OnboardingReveal>

                    <OnboardingReveal
                        visible={entrance.isComplete}
                        animateOnMount={entrance.shouldAnimate}
                    >
                        <Text style={[styles.note, { color: C.textSecondary }]}>
                            You can change this in settings any time.
                        </Text>
                    </OnboardingReveal>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    note: {
        marginTop: 16,
        fontFamily: 'Satoshi-Medium',
        fontSize: 12.5,
        textAlign: 'center',
    },
});
