import React, { useEffect, useMemo, useState } from 'react';
import { Text as RNText, View, useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import type { MascotAnimation } from '@/components/mascotClipUrls';
import { onboardingStyles } from './onboardingStyles';

interface OnboardingQuestionProps {
    prompt: string;
    mascotSize?: number;
    mascotAnimation?: MascotAnimation;
    mascotPlaybackKey?: string | number;
    mascotStopAfterMs?: number;
    shouldType?: boolean;
    typingDurationMs?: number;
    reducedMotionCompletionDelayMs?: number;
    onTypingComplete?: () => void;
}

const TYPE_DELAY_MS = 26;
const TYPE_COMPLETE_PAUSE_MS = 180;

export function OnboardingQuestion({
    prompt,
    mascotSize = 130,
    mascotAnimation = 'quietly-writes-looks',
    mascotPlaybackKey,
    mascotStopAfterMs,
    shouldType = false,
    typingDurationMs,
    reducedMotionCompletionDelayMs = 0,
    onTypingComplete,
}: OnboardingQuestionProps) {
    const isDark = useColorScheme() === 'dark';

    return (
        <View style={onboardingStyles.questionRow}>
            <View style={onboardingStyles.mascotWrapper}>
                <AnimatedMascot
                    size={mascotSize}
                    animation={mascotAnimation}
                    playbackKey={mascotPlaybackKey}
                    stopAfterMs={mascotStopAfterMs}
                />
            </View>
            <View
                style={[
                    onboardingStyles.bubble,
                    {
                        backgroundColor: isDark ? '#161B22' : '#FFFFFF',
                    },
                ]}
            >
                <View
                    style={[
                        onboardingStyles.bubbleTail,
                        { borderRightColor: isDark ? '#161B22' : '#FFFFFF' },
                    ]}
                />
                <OnboardingPrompt
                    key={prompt}
                    prompt={prompt}
                    shouldType={shouldType}
                    typingDurationMs={typingDurationMs}
                    reducedMotionCompletionDelayMs={
                        reducedMotionCompletionDelayMs
                    }
                    onTypingComplete={onTypingComplete}
                    color={isDark ? '#FFFFFF' : '#0B0F19'}
                />
            </View>
        </View>
    );
}

interface OnboardingPromptProps {
    prompt: string;
    shouldType: boolean;
    typingDurationMs?: number;
    reducedMotionCompletionDelayMs: number;
    onTypingComplete?: () => void;
    color: string;
}

function OnboardingPrompt({
    prompt,
    shouldType,
    typingDurationMs,
    reducedMotionCompletionDelayMs,
    onTypingComplete,
    color,
}: OnboardingPromptProps) {
    const reduceMotion = useReducedMotion();
    const characters = useMemo(() => Array.from(prompt), [prompt]);
    const characterDelayMs = typingDurationMs === undefined
        ? TYPE_DELAY_MS
        : Math.max(
            12,
            Math.ceil(typingDurationMs / Math.max(characters.length, 1)),
        );
    const [typedCount, setTypedCount] = useState(
        shouldType && !reduceMotion ? 0 : characters.length,
    );
    const visiblePrompt =
        shouldType && !reduceMotion
            ? characters.slice(0, typedCount).join('')
            : prompt;

    useEffect(() => {
        if (!shouldType) return;

        if (reduceMotion) {
            const timeout = setTimeout(
                () => onTypingComplete?.(),
                reducedMotionCompletionDelayMs,
            );
            return () => clearTimeout(timeout);
        }

        if (characters.length === 0) {
            onTypingComplete?.();
            return;
        }

        let index = 0;
        let timeout: ReturnType<typeof setTimeout>;

        const typeNextCharacter = () => {
            index += 1;
            setTypedCount(index);

            if (index >= characters.length) {
                timeout = setTimeout(
                    () => onTypingComplete?.(),
                    TYPE_COMPLETE_PAUSE_MS,
                );
                return;
            }

            timeout = setTimeout(typeNextCharacter, characterDelayMs);
        };

        timeout = setTimeout(typeNextCharacter, characterDelayMs);
        return () => clearTimeout(timeout);
    }, [
        characterDelayMs,
        characters,
        onTypingComplete,
        reduceMotion,
        typingDurationMs,
        reducedMotionCompletionDelayMs,
        shouldType,
    ]);

    return (
        <RNText
            accessibilityLabel={prompt}
            style={[onboardingStyles.prompt, { color }]}
        >
            {visiblePrompt}
        </RNText>
    );
}
