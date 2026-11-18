import React, { useCallback, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { onboardingStyles } from '@/components/onboarding/onboardingStyles';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

const NAME_PROMPT = "Hey, I'm Skeemy. What's your name?";
const NAME_TYPING_DURATION_MS = 1600;
const WAVE_PLAYBACK_DURATION_MS = 1800;

export default function OnboardingNameScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData } = useAuthStore();
    const [name, setName] = useState(onboardingData.first_name ?? '');
    const [phase, setPhase] = useState<'intro' | 'greeting'>('intro');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const isAdvancing = useRef(false);

    useFocusEffect(
        useCallback(() => {
            isAdvancing.current = false;
            setPhase('intro');
        }, []),
    );

    const handleGreetingTypingComplete = useCallback(() => {
        if (isAdvancing.current) return;
        isAdvancing.current = true;
        router.push('/(onboarding)/start');
    }, [router]);

    const handleContinue = useCallback(async () => {
        const firstName = name.trim();
        if (!firstName || isSaving) return;

        haptics.selectionAsync();
        setIsSaving(true);
        setErrorMessage('');
        try {
            await setOnboardingData({ first_name: firstName });
            setName(firstName);
            setPhase('greeting');
        } catch (error) {
            console.error('[Onboarding] Could not save the learner name.', error);
            setErrorMessage('Could not continue. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [name, isSaving, setOnboardingData]);

    const questionText = phase === 'intro'
        ? NAME_PROMPT
        : `Nice to meet you, ${name}!`;

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <OnboardingProgress step={1} showProgress={false} />

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={onboardingStyles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={onboardingStyles.topSpacer} />

                    <OnboardingQuestion
                        prompt={questionText}
                        mascotAnimation="name-wave"
                        mascotPlaybackKey={phase}
                        mascotStopAfterMs={WAVE_PLAYBACK_DURATION_MS}
                        shouldType
                        typingDurationMs={NAME_TYPING_DURATION_MS}
                        reducedMotionCompletionDelayMs={
                            phase === 'intro' ? 0 : NAME_TYPING_DURATION_MS
                        }
                        onTypingComplete={
                            phase === 'greeting'
                                ? handleGreetingTypingComplete
                                : undefined
                        }
                    />

                    {phase === 'intro' ? (
                        <View style={styles.nameField}>
                            <TextInput
                                accessibilityLabel="Your name"
                                autoCapitalize="words"
                                autoComplete="name-given"
                                autoCorrect={false}
                                maxLength={40}
                                onChangeText={(value) => {
                                    setName(value);
                                    setErrorMessage('');
                                }}
                                onSubmitEditing={() => {
                                    void handleContinue();
                                }}
                                placeholder="Your name"
                                placeholderTextColor={C.textTertiary}
                                returnKeyType="done"
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: C.card,
                                        borderColor: errorMessage
                                            ? C.destructive
                                            : C.separator,
                                        color: C.text,
                                    },
                                ]}
                                textContentType="givenName"
                                value={name}
                            />
                            {errorMessage ? (
                                <Text style={[styles.error, { color: C.destructive }]}>
                                    {errorMessage}
                                </Text>
                            ) : null}
                        </View>
                    ) : null}

                    <View style={onboardingStyles.topSpacer} />
                </ScrollView>

                {phase === 'intro' ? (
                    <OnboardingFooter
                        disabled={!name.trim()}
                        loading={isSaving}
                        onContinue={handleContinue}
                    />
                ) : null}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    nameField: {
        marginTop: 4,
    },
    input: {
        minHeight: 60,
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 14,
        fontFamily: 'Allo-Medium',
        fontSize: 18,
    },
    error: {
        marginTop: 8,
        fontFamily: 'Allo-Medium',
        fontSize: 14,
    },
});
