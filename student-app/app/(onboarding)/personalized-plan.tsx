import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import {
    dailyGoals,
    explanationPreferences,
    learningGoals,
    studyChallenges,
} from '@/components/onboarding/onboardingContent';
import { ONBOARDING_BLUE, ONBOARDING_YELLOW, onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function PersonalizedPlanScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingStep } = useAuthStore();
    const {
        isComplete: entranceComplete,
        shouldAnimate: animateEntrance,
        complete: completeEntrance,
    } = useOnboardingEntrance('personalized-plan');

    const selectedGoals = learningGoals.filter((o) =>
        onboardingData.learning_goals?.includes(o.id),
    );
    const selectedChallengeLabels = [
        ...studyChallenges
            .filter((o) => onboardingData.study_challenges?.includes(o.id))
            .map((o) => o.label),
        ...(onboardingData.study_challenges?.includes('knowing_where_to_start')
            ? ['Knowing where to start']
            : []),
    ];
    const learningStyle =
        explanationPreferences.find(
            (o) => o.id === onboardingData.explanation_preference,
        ) ??
        (onboardingData.explanation_preference === 'step_by_step'
            ? { label: 'Step-by-step breakdowns' }
            : undefined);
    const dailyGoal =
        dailyGoals.find((o) => o.id === onboardingData.daily_goal) ??
        (onboardingData.daily_goal === '30'
            ? { id: '30', label: '30 min' }
            : undefined);

    const isReady =
        selectedGoals.length > 0 &&
        selectedChallengeLabels.length > 0 &&
        !!learningStyle &&
        !!dailyGoal;

    const pageBg = isDark ? C.background : '#F8F9FA';

    useEffect(() => {
        void setOnboardingStep(5);
        if (!isReady) {
            router.replace('/(onboarding)/start');
        } else {
            completeEntrance();
        }
    }, [completeEntrance, isReady, router, setOnboardingStep]);

    const planItems = [
        selectedGoals[0]?.label ?? 'Master difficult topics',
        learningStyle?.label ?? 'Step-by-step breakdowns',
        selectedChallengeLabels[0] ?? 'Exam preparation',
        dailyGoal
            ? dailyGoal.id === 'flexible'
                ? 'Flexible daily sessions'
                : `${dailyGoal.label} daily sessions`
            : '15 min / day sessions',
    ];

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={5} />
            <View style={onboardingStyles.body}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <OnboardingReveal
                        visible={entranceComplete}
                        animateOnMount={animateEntrance}
                        style={styles.reveal}
                    >
                        <>
                            <View style={styles.hero}>
                                <AnimatedMascot size={135} />
                                <Text style={[styles.title, { color: C.text }]}>
                                    Skeeme for your studies.
                                </Text>
                                <Text style={[styles.subtitle, { color: C.textSecondary }]}>
                                    We&apos;ve customized your learning path.
                                </Text>
                            </View>

                            <View style={styles.planCard}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>STAGE 1 &bull; FOUNDATION</Text>
                                </View>
                                <View style={styles.items}>
                                    {planItems.map((item, i) => (
                                        <View key={i} style={styles.itemRow}>
                                            <View style={styles.dot} />
                                            <Text style={styles.itemText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    </OnboardingReveal>
                </ScrollView>
            </View>
            <OnboardingFooter
                label="Continue"
                onContinue={() => router.push('/(onboarding)/reminders')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
    },
    reveal: {
        flex: 1,
        justifyContent: 'center',
    },
    hero: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Satoshi-Black',
        fontSize: 25,
        lineHeight: 31,
        textAlign: 'center',
        marginTop: 10,
        letterSpacing: -0.4,
    },
    subtitle: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 6,
    },
    planCard: {
        backgroundColor: ONBOARDING_BLUE,
        borderRadius: 22,
        paddingHorizontal: 22,
        paddingVertical: 22,
        shadowColor: ONBOARDING_BLUE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 6,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 223, 0, 0.18)',
        borderColor: ONBOARDING_YELLOW,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 16,
    },
    badgeText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 11,
        color: ONBOARDING_YELLOW,
        letterSpacing: 0.8,
    },
    items: {
        gap: 13,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: ONBOARDING_YELLOW,
    },
    itemText: {
        flex: 1,
        fontFamily: 'Satoshi-Bold',
        fontSize: 15.5,
        lineHeight: 21,
        color: '#FFFFFF',
    },
});
