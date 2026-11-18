import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedReaction,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { AnimatedMascot } from '@/components/AnimatedMascot';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import {
    ONBOARDING_BLUE,
    ONBOARDING_YELLOW,
    onboardingStyles,
} from '@/components/onboarding/onboardingStyles';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { getOnboardingSummary } from '@/lib/onboardingSummaryBank';
import { useAuthStore } from '@/store/authStore';

const PROFILE_LOADER_DURATION_MS = 4200;
const PROFILE_ANIMATION_STOP_MS = 5140;
const PROFILE_FINAL_POSE_HOLD_MS = 860;
const PLAN_REVEAL_DURATION_MS = 450;
const CONTROLS_REVEAL_DURATION_MS = 180;
const PROFILE_MASCOT_SIZE = 300;
const PROFILE_STAGES = [
    {
        label: 'Shedding light on your goals...',
    },
    {
        label: 'Finding your brightest approach',
    },
    {
        label: 'Setting your daily rhythm',
    },
] as const;
const PROFILE_STAGE_COUNT = PROFILE_STAGES.length;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function PersonalizedPlanScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const reduceMotion = useReducedMotion();
    const C = Colors[isDark ? 'dark' : 'light'];
    const { onboardingData, setOnboardingStep } = useAuthStore();
    const [isProfileRevealed, setIsProfileRevealed] = useState(reduceMotion);
    const [isProgressVisible, setIsProgressVisible] = useState(!reduceMotion);
    const [progressPercent, setProgressPercent] = useState(0);
    const [bodyHeight, setBodyHeight] = useState(0);
    const profileProgress = useSharedValue(0);
    const revealProgress = useSharedValue(reduceMotion ? 1 : 0);
    const controlsOpacity = useSharedValue(reduceMotion ? 1 : 0);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressStarted = useRef(false);
    const revealStarted = useRef(false);

    const personalizedSummary = getOnboardingSummary(onboardingData);
    const hasProfileData = personalizedSummary !== null;
    const pageBg = C.background;
    const activeStageIndex = Math.min(
        PROFILE_STAGE_COUNT - 1,
        Math.floor((progressPercent / 100) * PROFILE_STAGE_COUNT),
    );

    const updateProgressPercent = useCallback((value: number) => {
        setProgressPercent(value);
    }, []);

    useAnimatedReaction(
        () => Math.round(profileProgress.get() * 100),
        (current, previous) => {
            if (previous === null || current === previous) return;
            scheduleOnRN(updateProgressPercent, current);
        },
        [updateProgressPercent],
    );

    useEffect(() => {
        void setOnboardingStep(5);
        if (!hasProfileData) {
            router.replace('/(onboarding)/name');
        }
    }, [hasProfileData, router, setOnboardingStep]);

    const startPlanReveal = useCallback(() => {
        if (revealStarted.current) return;
        revealStarted.current = true;
        revealProgress.set(
            withTiming(1, {
                duration: PLAN_REVEAL_DURATION_MS,
                easing: EASE_OUT,
            }),
        );
        revealTimer.current = setTimeout(
            () => setIsProfileRevealed(true),
            PLAN_REVEAL_DURATION_MS,
        );
    }, [revealProgress]);

    const handleAnimationStart = useCallback(() => {
        if (
            reduceMotion ||
            revealStarted.current ||
            progressStarted.current
        ) {
            return;
        }
        progressStarted.current = true;
        setIsProgressVisible(true);
        profileProgress.set(
            withTiming(1, {
                duration: PROFILE_LOADER_DURATION_MS,
                easing: Easing.linear,
            }),
        );
    }, [profileProgress, reduceMotion]);

    useEffect(() => {
        if (hasProfileData) handleAnimationStart();
    }, [handleAnimationStart, hasProfileData]);

    const handleAnimationEnd = useCallback(() => {
        profileProgress.set(1);
        setProgressPercent(100);
        if (revealStarted.current || holdTimer.current !== null) return;
        holdTimer.current = setTimeout(
            startPlanReveal,
            PROFILE_FINAL_POSE_HOLD_MS,
        );
    }, [profileProgress, startPlanReveal]);

    const handleAnimationError = useCallback(() => {
        if (revealStarted.current) return;
        setIsProgressVisible(false);
        if (holdTimer.current !== null) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        startPlanReveal();
    }, [startPlanReveal]);

    useEffect(() => {
        if (isProfileRevealed && !reduceMotion) {
            controlsOpacity.set(
                withTiming(1, {
                    duration: CONTROLS_REVEAL_DURATION_MS,
                    easing: EASE_OUT,
                }),
            );
        }
    }, [controlsOpacity, isProfileRevealed, reduceMotion]);

    useEffect(
        () => () => {
            if (holdTimer.current !== null) clearTimeout(holdTimer.current);
            if (revealTimer.current !== null) clearTimeout(revealTimer.current);
        },
        [],
    );

    const mascotStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    revealProgress.get(),
                    [0, 1],
                    [
                        0,
                        PROFILE_MASCOT_SIZE / 2 -
                            bodyHeight / 2 -
                            Math.max(bodyHeight * 0.28, 140),
                    ],
                ),
            },
            { scale: interpolate(revealProgress.get(), [0, 1], [1, 0.45]) },
        ],
    }));

    const planStyle = useAnimatedStyle(() => ({
        opacity: revealProgress.get(),
        transform: [
            {
                translateY: interpolate(
                    revealProgress.get(),
                    [0, 1],
                    [150, 0],
                ),
            },
        ],
    }));

    const progressPanelStyle = useAnimatedStyle(() => ({
        opacity: 1 - revealProgress.get(),
    }));

    const controlsStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.get(),
    }));

    return (
        <View style={[onboardingStyles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress
                step={5}
                showProgress={isProfileRevealed}
                onBack={() => router.dismissTo('/(onboarding)/daily-goal')}
            />
            <View
                style={onboardingStyles.body}
                onLayout={({ nativeEvent }) =>
                    setBodyHeight(nativeEvent.layout.height)
                }
            >
                <Animated.View
                    pointerEvents="none"
                    accessibilityElementsHidden={!isProgressVisible}
                    importantForAccessibility={
                        isProgressVisible ? 'auto' : 'no-hide-descendants'
                    }
                    style={[
                        styles.progressPanel,
                        progressPanelStyle,
                        !isProgressVisible && styles.progressPanelHidden,
                    ]}
                >
                    <Text style={[styles.progressTitle, { color: C.text }]}>
                        Personalizing{'\n'}your plan
                    </Text>
                    <View style={styles.progressSteps}>
                        {PROFILE_STAGES.map((stage, index) => (
                            <ProfileProgressStep
                                key={stage.label}
                                index={index}
                                stage={stage}
                                activeStageIndex={activeStageIndex}
                                progress={profileProgress}
                                progressPercent={progressPercent}
                                theme={C}
                            />
                        ))}
                    </View>
                </Animated.View>

                <ScrollView
                    style={[StyleSheet.absoluteFill, styles.planScroll]}
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingTop: Math.max(bodyHeight * 0.34, 180) },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        accessibilityElementsHidden={!isProfileRevealed}
                        importantForAccessibility={
                            isProfileRevealed ? 'auto' : 'no-hide-descendants'
                        }
                        style={planStyle}
                    >
                        <View style={styles.hero}>
                            <Text style={[styles.title, { color: C.text }]}>
                                I&apos;ve got a bright idea!
                            </Text>
                        </View>

                        <View style={styles.planCard}>
                            <Text style={styles.summaryText}>
                                {personalizedSummary}
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>

                <View
                    pointerEvents="none"
                    style={styles.mascotOverlay}
                >
                    <Animated.View style={mascotStyle}>
                        <AnimatedMascot
                            size={PROFILE_MASCOT_SIZE}
                            animation="profile-ready"
                            stopAfterMs={PROFILE_ANIMATION_STOP_MS}
                            onPlaybackStart={handleAnimationStart}
                            onPlaybackEnd={handleAnimationEnd}
                            onPlaybackError={handleAnimationError}
                        />
                    </Animated.View>
                </View>
            </View>

            <Animated.View
                pointerEvents={isProfileRevealed ? 'auto' : 'none'}
                accessibilityElementsHidden={!isProfileRevealed}
                importantForAccessibility={
                    isProfileRevealed ? 'auto' : 'no-hide-descendants'
                }
                style={[styles.footerOverlay, controlsStyle]}
            >
                <OnboardingFooter
                    label="Let's do this!"
                    onContinue={() => router.push('/(onboarding)/reminders')}
                />
            </Animated.View>
        </View>
    );
}

function ProfileProgressStep({
    index,
    stage,
    activeStageIndex,
    progress,
    progressPercent,
    theme,
}: {
    index: number;
    stage: (typeof PROFILE_STAGES)[number];
    activeStageIndex: number;
    progress: SharedValue<number>;
    progressPercent: number;
    theme: Pick<
        typeof Colors.light,
        'text' | 'textSecondary'
    >;
}) {
    const isComplete =
        index < PROFILE_STAGE_COUNT - 1 &&
        progressPercent >= ((index + 1) / PROFILE_STAGE_COUNT) * 100;
    const isActive = !isComplete && activeStageIndex === index;
    const stepPercent = Math.round(
        Math.min(
            1,
            Math.max(0, (progressPercent / 100) * PROFILE_STAGE_COUNT - index),
        ) * 100,
    );

    return (
        <View style={styles.progressStep}>
            <View style={styles.progressStepHeader}>
                <Text
                    style={[
                        styles.progressStepLabel,
                        {
                            color: isActive ? theme.text : theme.textSecondary,
                        },
                    ]}
                >
                    {stage.label}
                </Text>
                {isComplete ? (
                    <View style={styles.completedBadge}>
                        <Check
                            size={13}
                            color={ONBOARDING_BLUE}
                            strokeWidth={3}
                            accessible={false}
                        />
                    </View>
                ) : isActive ? (
                    <Text
                        style={[
                            styles.progressPercent,
                            { color: ONBOARDING_BLUE },
                        ]}
                        accessibilityLabel={`${stepPercent} percent complete`}
                    >
                        {stepPercent}%
                    </Text>
                ) : null}
            </View>
            {isActive ? (
                <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={stage.label}
                    accessibilityValue={{
                        min: 0,
                        max: 100,
                        now: stepPercent,
                    }}
                    style={styles.progressStepTrack}
                >
                    <ProfileProgressFill
                        index={index}
                        progress={progress}
                    />
                </View>
            ) : null}
        </View>
    );
}

function ProfileProgressFill({
    index,
    progress,
}: {
    index: number;
    progress: SharedValue<number>;
}) {
    const fillStyle = useAnimatedStyle(
        () => ({
            width: `${Math.min(
                1,
                Math.max(0, progress.get() * PROFILE_STAGE_COUNT - index),
            ) * 100}%`,
        }),
        [index, progress],
    );

    return (
        <Animated.View
            accessible={false}
            style={[
                styles.progressStepFill,
                { backgroundColor: ONBOARDING_YELLOW },
                fillStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 112,
    },
    mascotOverlay: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 1,
    },
    progressPanel: {
        paddingHorizontal: 22,
        paddingTop: 8,
        zIndex: 2,
    },
    planScroll: {
        zIndex: 0,
    },
    progressPanelHidden: {
        opacity: 0,
    },
    progressTitle: {
        fontFamily: 'Allo-Black',
        fontSize: 32,
        lineHeight: 39,
        textAlign: 'center',
    },
    progressPercent: {
        fontFamily: 'Allo-Bold',
        fontSize: 13,
        lineHeight: 17,
        fontVariant: ['tabular-nums'],
    },
    progressSteps: {
        alignSelf: 'center',
        gap: 13,
        marginTop: 29,
        maxWidth: 280,
        width: '100%',
    },
    progressStep: {
        gap: 0,
    },
    progressStepHeader: {
        minHeight: 19,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressStepLabel: {
        fontFamily: 'Allo-Medium',
        fontSize: 14,
        lineHeight: 19,
    },
    progressStepTrack: {
        height: 7,
        overflow: 'hidden',
        borderRadius: 4,
        marginTop: 7,
        backgroundColor: ONBOARDING_BLUE,
    },
    progressStepFill: {
        height: '100%',
        borderRadius: 4,
    },
    completedBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ONBOARDING_YELLOW,
    },
    footerOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Allo-Black',
        fontSize: 25,
        lineHeight: 31,
        textAlign: 'center',
        marginTop: 10,
        letterSpacing: -0.4,
    },
    subtitle: {
        fontFamily: 'Allo-Medium',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 24,
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
    summaryText: {
        fontFamily: 'Allo-Medium',
        fontSize: 15.5,
        lineHeight: 24,
        color: '#FFFFFF',
    },
});
