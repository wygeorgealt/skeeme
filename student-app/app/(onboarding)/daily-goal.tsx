import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { dailyGoals } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

export default function DailyGoalScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.daily_goal;

    useEffect(() => {
        void setOnboardingStep(5);
    }, [setOnboardingStep]);

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={5} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.intro}>
                    <View style={[styles.question, { backgroundColor: isDark ? '#13243A' : '#EAF3FF' }]}>
                        <Text style={[styles.prompt, { color: C.text }]}>Pick a daily learning goal.</Text>
                        <Text style={[styles.helper, { color: C.textSecondary }]}>
                            Small steps can lead to big ideas.
                        </Text>
                    </View>
                    <View style={styles.mascot}>
                        <AnimatedMascot size={76} />
                    </View>
                </View>
                <View style={styles.grid}>
                    {dailyGoals.map((option) => {
                        const isSelected = selected === option.id;
                        const isFlexible = option.id === 'flexible';
                        return (
                            <Pressable
                                key={option.id}
                                accessibilityLabel={`${option.label}. ${option.description}`}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => {
                                    haptics.selectionAsync();
                                    void setOnboardingData({ daily_goal: option.id });
                                }}
                                style={({ pressed }) => [
                                    styles.goal,
                                    {
                                        backgroundColor: isSelected
                                            ? isDark ? '#342D10' : '#FFF8D6'
                                            : C.card,
                                        borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                    },
                                    isSelected && styles.goalSelected,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <View style={styles.goalTop}>
                                    <Text
                                        numberOfLines={isFlexible ? 2 : 1}
                                        style={[
                                            styles.goalTitle,
                                            { color: C.text },
                                            isFlexible && styles.flexibleTitle,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    <View
                                        style={[
                                            styles.check,
                                            {
                                                backgroundColor: isSelected ? BLUE : 'transparent',
                                                borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                            },
                                        ]}
                                    >
                                        {isSelected ? <Check color="#FFFFFF" size={13} strokeWidth={3} /> : null}
                                    </View>
                                </View>
                                <Text style={[styles.goalDescription, { color: C.textSecondary }]}>
                                    {option.description}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                <Text style={[styles.note, { color: C.textSecondary }]}>
                    This is a preferred goal, not a usage limit.
                </Text>
            </ScrollView>
            <OnboardingFooter
                disabled={!selected}
                onContinue={async () => {
                    if (!selected) return;
                    await setOnboardingData({ daily_goal: selected });
                    router.push('/(onboarding)/personalized-plan');
                }}
            />
        </View>
    );
}

const BLUE = '#0057B8';

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
    },
    intro: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    question: {
        flex: 1,
        borderRadius: 22,
        paddingHorizontal: 17,
        paddingVertical: 16,
    },
    prompt: {
        fontFamily: 'Satoshi-Black',
        fontSize: 19,
        lineHeight: 25,
    },
    helper: {
        marginTop: 6,
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        lineHeight: 18,
    },
    mascot: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
    },
    goal: {
        width: '48.5%',
        minHeight: 100,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingHorizontal: 13,
        paddingVertical: 13,
        justifyContent: 'space-between',
    },
    goalSelected: { borderWidth: 2 },
    goalTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    goalTitle: {
        flex: 1,
        fontFamily: 'Satoshi-Black',
        fontSize: 19,
        lineHeight: 24,
    },
    flexibleTitle: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        lineHeight: 18,
    },
    goalDescription: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 12,
        lineHeight: 16,
        marginTop: 8,
    },
    check: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    note: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 12,
        paddingHorizontal: 2,
    },
    pressed: { opacity: 0.82 },
});
