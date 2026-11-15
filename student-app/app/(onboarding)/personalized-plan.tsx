import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import {
    dailyGoals,
    explanationPreferences,
    learningGoals,
    studyChallenges,
} from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function PersonalizedPlanScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingStep } = useAuthStore();
    const selectedGoals = learningGoals.filter((option) =>
        onboardingData.learning_goals?.includes(option.id),
    );
    const selectedChallenges = studyChallenges.filter((option) =>
        onboardingData.study_challenges?.includes(option.id),
    );
    const learningStyle = explanationPreferences.find(
        (option) => option.id === onboardingData.explanation_preference,
    );
    const dailyGoal = dailyGoals.find((option) => option.id === onboardingData.daily_goal);
    const isReady =
        selectedGoals.length > 0 &&
        selectedChallenges.length > 0 &&
        !!learningStyle &&
        !!dailyGoal;

    useEffect(() => {
        void setOnboardingStep(6);
        if (!isReady) {
            router.replace('/(onboarding)/start');
        }
    }, [isReady, router, setOnboardingStep]);

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={6} />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <AnimatedMascot size={112} />
                    <Text style={[styles.title, { color: BLUE }]}>I&apos;ve got a bright idea!</Text>
                    <Text style={[styles.subtitle, { color: C.text }]}>
                        Your learning journey starts here.
                    </Text>
                    <Text style={[styles.intro, { color: C.textSecondary }]}>
                        Here&apos;s what we&apos;ll focus on together.
                    </Text>
                </View>
                <View
                    style={[
                        styles.summary,
                        {
                            backgroundColor: C.card,
                            borderColor: C.separatorOpaque,
                        },
                    ]}
                >
                    {selectedGoals.length > 0 ? (
                        <SummarySection
                            title="Your priorities"
                            items={selectedGoals.map((option) => option.label)}
                            isDark={isDark}
                            isLast={false}
                        />
                    ) : null}
                    {learningStyle ? (
                        <SummarySection
                            title="How you like to learn"
                            items={[learningStyle.label]}
                            isDark={isDark}
                            isLast={false}
                        />
                    ) : null}
                    {selectedChallenges.length > 0 ? (
                        <SummarySection
                            title="Your study focus"
                            items={selectedChallenges.map((option) => option.label)}
                            isDark={isDark}
                            isLast={false}
                        />
                    ) : null}
                    {dailyGoal ? (
                        <SummarySection
                            title="Your daily goal"
                            items={[
                                dailyGoal.id === 'flexible'
                                    ? dailyGoal.label
                                    : `${dailyGoal.id} minutes of learning`,
                            ]}
                            isDark={isDark}
                            isLast
                        />
                    ) : null}
                </View>
                <Text style={[styles.closing, { color: C.textSecondary }]}>Let&apos;s do this!</Text>
            </ScrollView>
            <OnboardingFooter
                disabled={!isReady}
                onContinue={() => router.push('/(onboarding)/reminders')}
            />
        </View>
    );
}

function SummarySection({
    title,
    items,
    isDark,
    isLast,
}: {
    title: string;
    items: string[];
    isDark: boolean;
    isLast: boolean;
}) {
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <View
            style={[
                styles.summarySection,
                !isLast && { borderBottomColor: C.separator, borderBottomWidth: 1 },
            ]}
        >
            <Text style={[styles.summaryTitle, { color: C.text }]}>{title}</Text>
            {items.map((item) => (
                <View key={item} style={styles.summaryItem}>
                    <Check color="#0057B8" size={16} strokeWidth={2.6} />
                    <Text style={[styles.summaryCopy, { color: C.textSecondary }]}>{item}</Text>
                </View>
            ))}
        </View>
    );
}

const BLUE = '#0057B8';

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 18,
    },
    title: {
        fontFamily: 'Satoshi-Black',
        fontSize: 23,
        lineHeight: 29,
        textAlign: 'center',
        marginTop: -3,
    },
    subtitle: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginTop: 5,
    },
    intro: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 9,
    },
    summary: {
        borderWidth: 1,
        borderRadius: 22,
        paddingHorizontal: 18,
    },
    summarySection: {
        paddingVertical: 13,
        gap: 8,
    },
    summaryTitle: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        marginBottom: 1,
    },
    summaryItem: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        gap: 8,
    },
    summaryCopy: {
        flex: 1,
        fontFamily: 'Satoshi-Regular',
        fontSize: 13,
        lineHeight: 18,
    },
    closing: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 14,
        textAlign: 'center',
    },
});
