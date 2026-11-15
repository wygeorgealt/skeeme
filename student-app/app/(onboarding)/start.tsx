import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { learningGoals } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export default function LearningGoalsScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.learning_goals ?? [];

    useEffect(() => {
        void setOnboardingStep(2);
    }, [setOnboardingStep]);

    const toggleGoal = (id: (typeof learningGoals)[number]['id']) => {
        haptics.selectionAsync();
        const next = selected.includes(id)
            ? selected.filter((item) => item !== id)
            : [...selected, id];
        void setOnboardingData({ learning_goals: next });
    };

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={2} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.questionRow}>
                    <View style={styles.mascot}>
                        <AnimatedMascot size={92} />
                    </View>
                    <View style={[styles.bubble, { backgroundColor: C.card, borderColor: C.separatorOpaque }]}>
                        <View style={[styles.bubbleTail, { borderRightColor: C.card }]} />
                        <Text style={[styles.prompt, { color: C.text }]}>
                            What would you like to do with Skeeme?
                        </Text>
                        <Text style={[styles.helper, { color: C.textSecondary }]}>
                            Choose everything you&apos;re interested in.
                        </Text>
                    </View>
                </View>
                <View style={styles.options}>
                    {learningGoals.map((goal) => {
                        const isSelected = selected.includes(goal.id);
                        return (
                            <Pressable
                                key={goal.id}
                                accessibilityLabel={goal.label}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => toggleGoal(goal.id)}
                                style={({ pressed }) => [
                                    styles.option,
                                    {
                                        backgroundColor: isSelected
                                            ? isDark ? '#342D10' : '#FFF8D6'
                                            : C.card,
                                        borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                    },
                                    isSelected && styles.optionSelected,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={[styles.optionLabel, { color: C.text }]}>{goal.label}</Text>
                                <View
                                    style={[
                                        styles.check,
                                        {
                                            backgroundColor: isSelected ? BLUE : 'transparent',
                                            borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                        },
                                    ]}
                                >
                                    {isSelected ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
            <OnboardingFooter
                disabled={selected.length === 0}
                onContinue={async () => {
                    await setOnboardingData({ learning_goals: selected });
                    router.push('/(onboarding)/explanation-preferences');
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
    questionRow: {
        minHeight: 100,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mascot: {
        width: 92,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -4,
    },
    bubble: {
        flex: 1,
        minHeight: 86,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    bubbleTail: {
        position: 'absolute',
        left: -10,
        top: 27,
        width: 0,
        height: 0,
        borderTopWidth: 9,
        borderBottomWidth: 9,
        borderRightWidth: 11,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    prompt: {
        fontFamily: 'Satoshi-Black',
        fontSize: 17,
        lineHeight: 22,
    },
    helper: {
        marginTop: 6,
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        lineHeight: 18,
    },
    options: { gap: 7 },
    option: {
        minHeight: 48,
        borderRadius: 13,
        borderWidth: 1.5,
        paddingHorizontal: 15,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionSelected: { borderWidth: 2 },
    optionLabel: {
        flex: 1,
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        lineHeight: 19,
    },
    check: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: { opacity: 0.82 },
});
