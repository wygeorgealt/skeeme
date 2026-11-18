import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import { reminderChoices } from '@/components/onboarding/onboardingContent';
import { ONBOARDING_BLUE, onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { api } from '@/lib/api';
import {
    cancelDailyLearningReminder,
    scheduleDailyLearningReminder,
} from '@/lib/notifications';
import { useAuthStore } from '@/store/authStore';
import type { OnboardingAnswers, ReminderChoice } from '@/types';

const reminderChoiceIds = reminderChoices.map((c) => c.id);

function isReminderChoice(v: unknown): v is ReminderChoice {
    return typeof v === 'string' && reminderChoiceIds.includes(v as ReminderChoice);
}

function formatTime(value: string) {
    const [hour, minute] = value.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    return `${(hour % 12) || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function dateForTime(value: string) {
    const [h = 9, m = 0] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
}

export default function RemindersScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const {
        user, onboardingData, setOnboardingData, setOnboardingStep,
        setNotificationsEnabled, completeOnboarding, updateUser,
    } = useAuthStore();

    const savedChoice = isReminderChoice(onboardingData.reminder_choice)
        ? onboardingData.reminder_choice : undefined;
    const [choice, setChoice] = useState<ReminderChoice | undefined>(savedChoice);
    const [reminderTime, setReminderTime] = useState(
        onboardingData.reminder_time ||
        reminderChoices.find((o) => o.id === savedChoice)?.time || '09:00',
    );
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const entrance = useOnboardingEntrance('reminders');

    useEffect(() => { void setOnboardingStep(6); }, [setOnboardingStep]);

    const pickerDate = useMemo(() => dateForTime(reminderTime), [reminderTime]);

    const chooseReminder = (next: ReminderChoice) => {
        haptics.selectionAsync();
        const t = reminderChoices.find((o) => o.id === next)?.time ?? '';
        setChoice(next);
        if (next !== 'custom') { setReminderTime(t); setShowTimePicker(false); }
        else { setShowTimePicker(true); }
        setErrorMessage('');
        void setOnboardingData({
            reminder_choice: next,
            reminder_enabled: next !== 'none',
            reminder_time: next === 'custom' ? reminderTime : t,
        });
    };

    const handleTimeChange = (event: DateTimePickerEvent, value?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (event.type !== 'set' || !value) return;
        const t = `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
        setReminderTime(t);
        void setOnboardingData({ reminder_time: t });
    };

    const saveAndContinue = async (remindersEnabled: boolean, skipped = false) => {
        setIsSubmitting(true);
        setErrorMessage('');
        try {
            if (skipped || !remindersEnabled) await cancelDailyLearningReminder();
            const cd = useAuthStore.getState().onboardingData;
            if (!cd.learning_goals?.length || !cd.explanation_preference ||
                !cd.study_challenges?.length || !cd.daily_goal) {
                router.replace('/(onboarding)/name'); return;
            }
            const answers: OnboardingAnswers = {
                learning_goals: cd.learning_goals,
                explanation_preference: cd.explanation_preference,
                study_challenges: cd.study_challenges,
                daily_goal: cd.daily_goal,
                reminder_choice: skipped ? 'none' : choice ?? 'none',
                reminder_enabled: remindersEnabled,
                reminder_time: (choice && choice !== 'none') || remindersEnabled ? reminderTime : '',
            };
            await setNotificationsEnabled(remindersEnabled);
            await setOnboardingData({ ...answers, onboarding_flow_completed: true });
            if (user) {
                await api.post('me/onboarding', {
                    learning_style: answers.explanation_preference,
                    onboarding_data: answers,
                });
                const cu = useAuthStore.getState().user;
                if (cu) updateUser({
                    ai_preferences: { ...cu.ai_preferences, learning_style: answers.explanation_preference, onboarding_answers: answers },
                });
                await completeOnboarding();
                router.replace('/(drawer)/(tabs)'); return;
            }
            router.replace('/(onboarding)/save-study-plan');
        } catch (error) {
            console.error('[Onboarding] save error', error);
            setErrorMessage('Could not save. Check your connection and try again.');
        } finally { setIsSubmitting(false); }
    };

    const handleContinue = async () => {
        if (!choice) return;
        if (choice === 'none') { await saveAndContinue(false); return; }
        setIsSubmitting(true); setErrorMessage('');
        try {
            const [h, m] = reminderTime.split(':').map(Number);
            const perm = await scheduleDailyLearningReminder(h, m);
            if (perm !== 'granted') {
                setIsSubmitting(false);
                Alert.alert(
                    perm === 'denied' ? 'Reminders are off' : 'Reminders unavailable',
                    perm === 'denied'
                        ? 'Continue without reminders or enable them in settings.'
                        : 'This build cannot schedule notifications.',
                    [
                        { text: 'Continue without', onPress: () => { void saveAndContinue(false); } },
                        { text: 'Go back', style: 'cancel' },
                    ],
                );
                return;
            }
            await saveAndContinue(true);
        } catch (error) {
            console.error('[Onboarding] reminder error', error);
            setErrorMessage('Could not schedule reminder. Try again.');
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        setChoice('none'); setReminderTime('');
        await setOnboardingData({ reminder_choice: 'none', reminder_enabled: false, reminder_time: '' });
        await saveAndContinue(false, true);
    };

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={6} />

            <View style={onboardingStyles.body}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={onboardingStyles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={onboardingStyles.topSpacer} />
                    <OnboardingQuestion
                        prompt="When would you like me to remind you to study?"
                        shouldType={!entrance.isComplete}
                        onTypingComplete={entrance.complete}
                    />

                    <OnboardingReveal
                        visible={entrance.isComplete}
                        animateOnMount={entrance.shouldAnimate}
                    >
                        {errorMessage ? (
                            <Text style={[styles.error, { color: C.destructive }]}>
                                {errorMessage}
                            </Text>
                        ) : null}

                        <View style={onboardingStyles.options}>
                            {reminderChoices.map((option) => {
                                const isSelected = choice === option.id;
                                const isCustom = option.id === 'custom';
                                const sub = isCustom && reminderTime
                                    ? formatTime(reminderTime) : option.description;

                                return (
                                    <View key={option.id}>
                                        <OnboardingCard
                                            label={option.label}
                                            description={sub}
                                            isSelected={isSelected}
                                            onPress={() => chooseReminder(option.id)}
                                            accessibilityRole="radio"
                                        />

                                        {isCustom && isSelected && Platform.OS === 'ios' ? (
                                            <View style={[styles.pickerWrap, {
                                                backgroundColor: isDark ? '#0D1B30' : '#F6FAFF',
                                                borderColor: ONBOARDING_BLUE,
                                            }]}>
                                                <DateTimePicker
                                                    display="spinner"
                                                    mode="time"
                                                    onChange={handleTimeChange}
                                                    value={pickerDate}
                                                    textColor={C.text}
                                                />
                                            </View>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>

                        {choice === 'custom' && Platform.OS === 'android' ? (
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                activeOpacity={0.7}
                                style={[styles.androidBtn, { borderColor: ONBOARDING_BLUE }]}
                            >
                                <Clock size={18} color={ONBOARDING_BLUE} />
                                <Text style={[styles.androidBtnText, { color: ONBOARDING_BLUE }]}>
                                    {formatTime(reminderTime)} — Tap to change
                                </Text>
                            </TouchableOpacity>
                        ) : null}

                        {showTimePicker && Platform.OS === 'android' ? (
                            <DateTimePicker
                                display="default"
                                mode="time"
                                onChange={handleTimeChange}
                                value={pickerDate}
                            />
                        ) : null}
                    </OnboardingReveal>
                </ScrollView>
            </View>

            <OnboardingFooter
                disabled={!choice}
                loading={isSubmitting}
                label="Complete Setup"
                skipLabel="Skip reminders"
                onSkip={handleSkip}
                onContinue={handleContinue}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    error: {
        fontFamily: 'Allo-Medium',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    pickerWrap: {
        borderRadius: 18,
        borderWidth: 2,
        padding: 8,
        marginBottom: 10,
        marginTop: -4,
        alignItems: 'center',
    },
    androidBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
        marginTop: 6,
    },
    androidBtnText: {
        fontFamily: 'Allo-Bold',
        fontSize: 14,
    },
});
