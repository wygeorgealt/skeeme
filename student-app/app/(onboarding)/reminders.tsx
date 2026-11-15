import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Check, Clock } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { reminderChoices } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import {
    cancelDailyLearningReminder,
    scheduleDailyLearningReminder,
} from '@/lib/notifications';
import { haptics } from '@/lib/haptics';
import { api } from '@/lib/api';
import type { OnboardingAnswers, ReminderChoice } from '@/types';
import { useAuthStore } from '@/store/authStore';

const reminderChoiceIds = reminderChoices.map((choice) => choice.id);
const dayPartChoices = reminderChoices.slice(0, 3);
const secondaryChoices = reminderChoices.slice(3);

function isReminderChoice(value: unknown): value is ReminderChoice {
    return typeof value === 'string' && reminderChoiceIds.includes(value as ReminderChoice);
}

function formatTime(value: string) {
    const [hour, minute] = value.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function dateForTime(value: string) {
    const [hour = 9, minute = 0] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

export default function RemindersScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const {
        user,
        onboardingData,
        setOnboardingData,
        setOnboardingStep,
        setNotificationsEnabled,
        completeOnboarding,
        updateUser,
    } = useAuthStore();
    const savedChoice = isReminderChoice(onboardingData.reminder_choice)
        ? onboardingData.reminder_choice
        : undefined;
    const [choice, setChoice] = useState<ReminderChoice | undefined>(savedChoice);
    const [reminderTime, setReminderTime] = useState(
        onboardingData.reminder_time ||
            reminderChoices.find((option) => option.id === savedChoice)?.time ||
            '09:00',
    );
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        void setOnboardingStep(7);
    }, [setOnboardingStep]);

    const pickerDate = useMemo(() => dateForTime(reminderTime), [reminderTime]);

    const chooseReminder = (nextChoice: ReminderChoice) => {
        haptics.selectionAsync();
        const nextTime =
            reminderChoices.find((option) => option.id === nextChoice)?.time ?? '';
        setChoice(nextChoice);
        setReminderTime(nextTime);
        setShowTimePicker(false);
        setErrorMessage('');
        void setOnboardingData({
            reminder_choice: nextChoice,
            reminder_enabled: nextChoice !== 'none',
            reminder_time: nextTime,
        });
    };

    const handleTimeChange = (event: DateTimePickerEvent, value?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (event.type !== 'set' || !value) return;

        const nextTime = `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
        setReminderTime(nextTime);
        void setOnboardingData({ reminder_time: nextTime });
    };

    const saveAndContinue = async (remindersEnabled: boolean, skipped = false) => {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (skipped || !remindersEnabled) {
                await cancelDailyLearningReminder();
            }

            const currentData = useAuthStore.getState().onboardingData;
            if (
                !currentData.learning_goals?.length ||
                !currentData.explanation_preference ||
                !currentData.study_challenges?.length ||
                !currentData.daily_goal
            ) {
                router.replace('/(onboarding)/start');
                return;
            }

            const answers: OnboardingAnswers = {
                learning_goals: currentData.learning_goals,
                explanation_preference: currentData.explanation_preference,
                study_challenges: currentData.study_challenges,
                daily_goal: currentData.daily_goal,
                reminder_choice: skipped ? 'none' : choice ?? 'none',
                reminder_enabled: remindersEnabled,
                reminder_time:
                    (choice && choice !== 'none') || remindersEnabled ? reminderTime : '',
            };

            await setNotificationsEnabled(remindersEnabled);
            await setOnboardingData({
                ...answers,
                onboarding_flow_completed: true,
            });

            if (user) {
                await api.post('me/onboarding', {
                    learning_style: answers.explanation_preference,
                    onboarding_data: answers,
                });

                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    updateUser({
                        ai_preferences: {
                            ...currentUser.ai_preferences,
                            learning_style: answers.explanation_preference,
                            onboarding_answers: answers,
                        },
                    });
                }

                await completeOnboarding();
                router.replace('/(drawer)/(tabs)');
                return;
            }

            router.replace('/signup');
        } catch (error) {
            console.error('[Onboarding] Could not save learning preferences', error);
            setErrorMessage('Your answers could not be saved. Check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = async () => {
        if (!choice) return;
        if (choice === 'none') {
            await saveAndContinue(false);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        try {
            const [hour, minute] = reminderTime.split(':').map(Number);
            const permission = await scheduleDailyLearningReminder(hour, minute);

            if (permission !== 'granted') {
                setIsSubmitting(false);
                Alert.alert(
                    permission === 'denied' ? 'Reminders are off' : 'Reminders are unavailable',
                    permission === 'denied'
                        ? 'You can continue without reminders or enable them in your device settings.'
                        : 'This build cannot schedule notifications. You can continue without reminders.',
                    [
                        {
                            text: 'Continue without reminders',
                            onPress: () => {
                                void saveAndContinue(false);
                            },
                        },
                        { text: 'Go back', style: 'cancel' },
                    ],
                );
                return;
            }

            await saveAndContinue(true);
        } catch (error) {
            console.error('[Onboarding] Could not schedule study reminder', error);
            setErrorMessage('The reminder could not be scheduled. Try again or choose no reminders.');
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        setChoice('none');
        setReminderTime('');
        await setOnboardingData({
            reminder_choice: 'none',
            reminder_enabled: false,
            reminder_time: '',
        });
        await saveAndContinue(false, true);
    };

    return (
        <View style={[styles.root, { backgroundColor: C.background }]}>
            <OnboardingProgress step={7} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.intro}>
                    <View style={[styles.question, { backgroundColor: isDark ? '#13243A' : '#EAF3FF' }]}>
                        <Text style={[styles.prompt, { color: C.text }]}>
                            When should Lumi remind you to study?
                        </Text>
                        <Text style={[styles.helper, { color: C.textSecondary }]}>
                            I&apos;ll give you a little nudge when it&apos;s time to learn.
                        </Text>
                    </View>
                    <View style={styles.mascot}>
                        <AnimatedMascot size={76} />
                    </View>
                </View>
                <View style={styles.dayParts}>
                    {dayPartChoices.map((option) => {
                        const isSelected = choice === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                accessibilityLabel={option.label}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => chooseReminder(option.id)}
                                style={({ pressed }) => [
                                    styles.dayPart,
                                    {
                                        backgroundColor: isSelected
                                            ? isDark ? '#342D10' : '#FFF8D6'
                                            : C.card,
                                        borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                    },
                                    isSelected && styles.selected,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={[styles.dayPartLabel, { color: C.text }]}>
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
                            </Pressable>
                        );
                    })}
                </View>
                <View style={styles.secondaryChoices}>
                    {secondaryChoices.map((option) => {
                        const isSelected = choice === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                accessibilityLabel={option.label}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => chooseReminder(option.id)}
                                style={({ pressed }) => [
                                    styles.secondaryChoice,
                                    {
                                        backgroundColor: isSelected
                                            ? isDark ? '#342D10' : '#FFF8D6'
                                            : C.card,
                                        borderColor: isSelected ? BLUE : isDark ? '#647080' : '#AEB8C4',
                                    },
                                    isSelected && styles.selected,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={[styles.secondaryLabel, { color: C.text }]}>
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
                            </Pressable>
                        );
                    })}
                </View>

                {choice && choice !== 'none' ? (
                    <View style={styles.timeSection}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setShowTimePicker((visible) => !visible)}
                            style={[
                                styles.timeButton,
                                { backgroundColor: C.surfaceLow, borderColor: C.separatorOpaque },
                            ]}
                        >
                            <Clock color={BLUE} size={18} />
                            <Text style={[styles.timeText, { color: C.text }]}>
                                Change time · {formatTime(reminderTime)}
                            </Text>
                        </Pressable>
                        {showTimePicker ? (
                            <View style={styles.pickerWrap}>
                                <DateTimePicker
                                    value={pickerDate}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                />
                                {Platform.OS === 'ios' ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => setShowTimePicker(false)}
                                        style={styles.pickerDone}
                                    >
                                        <Text style={styles.pickerDoneText}>Done</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ) : null}
                    </View>
                ) : null}

                {errorMessage ? (
                    <Text
                        accessibilityLiveRegion="polite"
                        style={[styles.error, { color: C.destructive }]}
                    >
                        {errorMessage}
                    </Text>
                ) : null}
            </ScrollView>
            <OnboardingFooter
                disabled={!choice || isSubmitting}
                loading={isSubmitting}
                label={choice && choice !== 'none' ? 'Turn on reminders' : 'Continue'}
                skipLabel="Skip for now"
                onContinue={() => void handleContinue()}
                onSkip={() => void handleSkip()}
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
        marginBottom: 20,
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
    dayParts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    dayPart: {
        flex: 1,
        minHeight: 86,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 7,
    },
    dayPartLabel: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
    },
    secondaryChoices: { gap: 9, marginTop: 10 },
    secondaryChoice: {
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    secondaryLabel: {
        flex: 1,
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        lineHeight: 19,
    },
    selected: { borderWidth: 2 },
    check: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: { opacity: 0.82 },
    timeSection: { marginTop: 12 },
    timeButton: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 14,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 8,
    },
    timeText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
    },
    pickerWrap: {
        alignItems: 'center' as const,
        marginTop: 8,
    },
    pickerDone: {
        minWidth: 64,
        minHeight: 40,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    pickerDoneText: {
        color: BLUE,
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
    },
    error: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 8,
    },
});
