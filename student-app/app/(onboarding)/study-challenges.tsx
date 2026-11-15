import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { studyChallenges } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

const MAX_CHALLENGES = 3;

export default function StudyChallengesScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.study_challenges ?? [];
    const [limitMessage, setLimitMessage] = useState('');

    useEffect(() => {
        void setOnboardingStep(4);
    }, [setOnboardingStep]);

    const toggleChallenge = (id: (typeof studyChallenges)[number]['id']) => {
        if (selected.includes(id)) {
            setLimitMessage('');
            haptics.selectionAsync();
            void setOnboardingData({
                study_challenges: selected.filter((item) => item !== id),
            });
            return;
        }

        if (selected.length >= MAX_CHALLENGES) {
            setLimitMessage('Choose up to three study challenges.');
            return;
        }

        setLimitMessage('');
        haptics.selectionAsync();
        void setOnboardingData({ study_challenges: [...selected, id] });
    };

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={4} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.questionRow}>
                    <View style={styles.mascot}>
                        <AnimatedMascot size={84} />
                    </View>
                    <View style={[styles.question, { backgroundColor: C.card, borderColor: C.separatorOpaque }]}>
                        <Text style={[styles.prompt, { color: C.text }]}>
                            What&apos;s your biggest study struggle?
                        </Text>
                        <Text style={[styles.helper, { color: C.textSecondary }]}>
                            Let&apos;s figure out where you need the most help.
                        </Text>
                    </View>
                </View>
                <View style={styles.counterRow}>
                    <Text style={[styles.counter, { color: C.textSecondary }]}>
                        {selected.length} of {MAX_CHALLENGES} selected
                    </Text>
                    {limitMessage ? (
                        <Text
                            accessibilityLiveRegion="polite"
                            style={[styles.error, { color: C.destructive }]}
                        >
                            {limitMessage}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.grid}>
                    {studyChallenges.map((option) => {
                        const isSelected = selected.includes(option.id);
                        return (
                            <Pressable
                                key={option.id}
                                accessibilityLabel={option.label}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => toggleChallenge(option.id)}
                                style={({ pressed }) => [
                                    styles.tile,
                                    {
                                        backgroundColor: isSelected
                                            ? isDark ? '#342D10' : '#FFF8D6'
                                            : C.card,
                                        borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                    },
                                    isSelected && styles.tileSelected,
                                    pressed && styles.pressed,
                                ]}
                            >
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
                                <Text style={[styles.tileLabel, { color: C.text }]}>{option.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
            <OnboardingFooter
                disabled={selected.length === 0}
                onContinue={async () => {
                    await setOnboardingData({ study_challenges: selected });
                    router.push('/(onboarding)/daily-goal');
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
        minHeight: 96,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mascot: {
        width: 84,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -4,
    },
    question: {
        flex: 1,
        minHeight: 84,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 13,
    },
    prompt: {
        fontFamily: 'Satoshi-Black',
        fontSize: 16,
        lineHeight: 21,
    },
    helper: {
        marginTop: 5,
        fontFamily: 'Satoshi-Medium',
        fontSize: 12,
        lineHeight: 17,
    },
    counterRow: { minHeight: 28, marginBottom: 9 },
    counter: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 13,
    },
    error: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 3,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
    },
    tile: {
        width: '48.5%',
        minHeight: 91,
        borderRadius: 17,
        borderWidth: 1.5,
        paddingHorizontal: 13,
        paddingVertical: 12,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    tileSelected: { borderWidth: 2 },
    tileLabel: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 13,
        lineHeight: 17,
        marginTop: 8,
    },
    check: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    pressed: { opacity: 0.82 },
});
