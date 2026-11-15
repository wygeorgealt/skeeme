import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { explanationPreferences } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

export default function ExplanationPreferencesScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const selected = onboardingData.explanation_preference;

    useEffect(() => {
        void setOnboardingStep(3);
    }, [setOnboardingStep]);

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={3} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.intro}>
                    <AnimatedMascot size={78} />
                    <View style={[styles.question, { backgroundColor: isDark ? '#13243A' : '#EAF3FF' }]}>
                        <Text style={[styles.prompt, { color: C.text }]}>
                            How do you like things explained?
                        </Text>
                        <Text style={[styles.helper, { color: C.textSecondary }]}>
                            Everyone learns differently. What works best for you?
                        </Text>
                    </View>
                </View>
                <View style={styles.options}>
                    {explanationPreferences.map((option, index) => {
                        const isSelected = selected === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                accessibilityLabel={option.label}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => {
                                    haptics.selectionAsync();
                                    void setOnboardingData({ explanation_preference: option.id });
                                }}
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
                                <Text style={[styles.index, { color: isSelected ? BLUE : C.textTertiary }]}>
                                    {String(index + 1).padStart(2, '0')}
                                </Text>
                                <Text style={[styles.optionLabel, { color: C.text }]}>{option.label}</Text>
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
                disabled={!selected}
                onContinue={async () => {
                    if (!selected) return;
                    await setOnboardingData({ explanation_preference: selected });
                    router.push('/(onboarding)/study-challenges');
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
        alignItems: 'center',
        marginBottom: 16,
    },
    question: {
        alignSelf: 'stretch',
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginTop: -4,
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
    options: { gap: 9 },
    option: {
        minHeight: 60,
        borderRadius: 17,
        borderWidth: 1.5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionSelected: { borderWidth: 2 },
    index: {
        width: 25,
        fontFamily: 'Satoshi-Bold',
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
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
