import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BIG = 120;

export default function OnboardingLoadingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isPreview = params.preview === 'true';

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    const { onboardingData, completeOnboarding } = useAuthStore();
    const studentQuery = useStudent();

    const [progressText, setProgressText] = useState('Saving preferences...');
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    const scheduledTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Pulse animation for the orb glow
    const glowScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.15);

    useEffect(() => {
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.25, { duration: 1600 }),
                withTiming(1.0, { duration: 1600 })
            ),
            -1,
            false
        );
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.35, { duration: 1600 }),
                withTiming(0.15, { duration: 1600 })
            ),
            -1,
            false
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: glowOpacity.value,
    }));

    const statusByProgress = (p: number) => {
        if (p < 20) return 'Saving preferences...';
        if (p < 50) return 'Personalizing your AI...';
        if (p < 80) return 'Making it yours...';
        if (p < 100) return 'Almost done...';
        return 'Done!';
    };

    const messages = useMemo(
        () => [
            'Saving preferences...',
            'Personalizing your AI...',
            'Making it yours...',
            'Almost done...',
        ],
        []
    );

    const runProgressAnimation = () => {
        const totalMs = 10000;
        const tickMs = 60;
        const steps = Math.ceil(totalMs / tickMs);
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

        for (let i = 0; i < steps; i++) {
            const t = setTimeout(() => {
                const raw = i / (steps - 1);
                const eased = easeOutCubic(raw);
                const next = Math.max(0, Math.min(100, Math.round(eased * 100)));
                setProgress(next);
                setProgressText(statusByProgress(next));
                if (next === 20) setProgressText(messages[0]);
                if (next === 50) setProgressText(messages[1]);
                if (next === 80) setProgressText(messages[2]);
                if (next === 100) setProgressText(messages[3]);
            }, i * tickMs);
            scheduledTimeouts.current.push(t);
        }
    };

    const submitOnboarding = async () => {
        const edu = onboardingData?.education_level || '';
        let derivedAge = 18;
        if (/high\s*school/i.test(edu)) derivedAge = 17;
        else if (/college|university/i.test(edu)) derivedAge = 20;

        const now = new Date();
        const dob = new Date(now.getFullYear() - derivedAge, now.getMonth(), 1);
        const dob_month = dob.getMonth() + 1;
        const dob_year = dob.getFullYear();

        await api.post('me/onboarding', {
            education_level: onboardingData?.education_level,
            field_of_study: onboardingData?.field_of_study,
            dob_month,
            dob_year,
            age: derivedAge,
            next_exam_date: onboardingData?.next_exam_date,
            next_exam_title: onboardingData?.next_exam_title,
            tone: onboardingData?.tone,
            analogy_focus: onboardingData?.analogy_focus,
            academic_goal: onboardingData?.academic_goal,
            learning_style: onboardingData?.learning_style,
        });
    };

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const startedAt = Date.now();
            runProgressAnimation();

            try {
                await submitOnboarding();
            } catch (e) {
                if (__DEV__) console.warn('Failed to submit onboarding data', e);
            }

            if (cancelled) return;

            const MIN_TOTAL_MS = 10000;
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, MIN_TOTAL_MS - elapsed);
            if (remaining > 0) {
                await new Promise((r) => setTimeout(r, remaining));
            }

            try {
                await studentQuery.refetch();
            } catch (e) {
                if (__DEV__) console.warn('Failed to refresh user after onboarding', e);
            }

            if (cancelled) return;
            setDone(true);
        };

        run();

        return () => {
            cancelled = true;
            scheduledTimeouts.current.forEach((t) => clearTimeout(t));
            scheduledTimeouts.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleContinue = async () => {
        await completeOnboarding();
        router.replace('/paywall?fromOnboarding=true' as any);
    };

    const progressPercent = `${progress}%`;

    return (
        <View style={[s.root, { backgroundColor: C.background, paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Ambient glow behind orb */}
            <Animated.View
                style={[
                    s.glow,
                    { backgroundColor: C.primary },
                    glowStyle,
                ]}
            />

            {/* Orb with circular progress ring */}
            <Animated.View entering={FadeIn.duration(600)} style={s.orbWrap}>
                {/* Track ring */}
                <View style={[s.ring, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
                {/* Icon orb */}
                <View style={[s.orb, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff', shadowColor: C.primary }]}>
                    <Icon name="GraduationCap" size={44} color="primary" />
                </View>
                {/* Check badge — shown when done */}
                {done && (
                    <Animated.View
                        entering={FadeInDown.springify()}
                        style={[s.checkBadge, { backgroundColor: C.primary }]}
                    >
                        <Icon name="Check" size={16} color="white" />
                    </Animated.View>
                )}
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)} style={s.textGroup}>
                <Text style={[s.title, { color: C.text }]}>
                    {done ? 'Skeeme is ready for you' : 'Building your blueprint…'}
                </Text>
                <Text style={[s.subtitle, { color: C.textSecondary }]}>
                    {done
                        ? 'Your personalized learning blueprint is calibrated and ready to roll.'
                        : progressText}
                </Text>
            </Animated.View>

            {/* Progress bar — visible while loading */}
            {!done && (
                <Animated.View entering={FadeIn.duration(400)} style={s.progressTrack}>
                    <View
                        style={[
                            s.progressFill,
                            { backgroundColor: C.primary, width: progressPercent as any },
                        ]}
                    />
                </Animated.View>
            )}

            {/* Blueprint summary card — shown when done */}
            {done && (
                <Animated.View
                    entering={FadeInDown.duration(500).delay(100)}
                    style={[s.card, {
                        backgroundColor: isDark ? '#16181D' : '#ffffff',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        borderWidth: 1,
                        shadowColor: '#000',
                    }]}
                >
                    {/* top accent strip */}
                    <View style={s.cardStrip} />

                    <Text style={[s.cardHeading, { color: C.text }]}>Your Personalized Blueprint</Text>

                    {[
                        { icon: 'GraduationCap', label: 'Education', value: onboardingData?.education_level || 'Not set' },
                        { icon: 'Target', label: 'Primary Goal', value: onboardingData?.academic_goal || 'Not set' },
                        { icon: 'Lightbulb', label: 'Learning Style', value: onboardingData?.learning_style || 'Not set' },
                        { icon: 'MessageSquare', label: 'Tutor Voice', value: onboardingData?.tone || 'Not set' },
                    ].map((row) => (
                        <View key={row.label} style={[s.row, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f4f3f8' }]}>
                            <View style={[s.rowIcon, { backgroundColor: isDark ? '#2c2c2e' : '#fff' }]}>
                                <Icon name={row.icon as any} size={20} color="secondary" />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Text style={[s.rowLabel, { color: C.textSecondary }]}>{row.label.toUpperCase()}</Text>
                                <Text style={[s.rowValue, { color: C.text }]} numberOfLines={1}>{row.value}</Text>
                            </View>
                        </View>
                    ))}

                    <Text style={[s.footNote, { color: C.textTertiary }]}>
                        You can modify preferences anytime in Settings → Learning Preferences
                    </Text>
                </Animated.View>
            )}

            {/* CTA */}
            {done && (
                <Animated.View entering={FadeInDown.duration(400).delay(300)} style={s.ctaWrap}>
                    <AnimatedButton
                        title="Start Learning"
                        onPress={handleContinue}
                        type="capsule"
                        backgroundColor="#007AFF"
                        shadowColor="#0066D6"
                        fullWidth
                        style={{ height: 56 }}
                        textStyle={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}
                    />
                </Animated.View>
            )}

            {/* Progress label while loading */}
            {!done && (
                <Text style={[s.progressLabel, { color: C.text }]}>{progress}%</Text>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    glow: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        top: '18%',
        alignSelf: 'center',
    },
    orbWrap: {
        width: BIG + 20,
        height: BIG + 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        position: 'relative',
    },
    ring: {
        position: 'absolute',
        width: BIG + 20,
        height: BIG + 20,
        borderRadius: (BIG + 20) / 2,
        borderWidth: 2,
    },
    orb: {
        width: BIG,
        height: BIG,
        borderRadius: BIG / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 8,
    },
    checkBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textGroup: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 300,
    },
    progressTrack: {
        width: '100%',
        maxWidth: 320,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabel: {
        fontSize: 32,
        fontWeight: '900',
        marginTop: 12,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
        marginBottom: 20,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    cardStrip: {
        height: 4,
        marginHorizontal: -16,
        marginBottom: 14,
        backgroundColor: '#007aff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    cardHeading: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        padding: 10,
        marginBottom: 8,
    },
    rowIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    rowLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    rowValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    footNote: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 17,
    },
    ctaWrap: {
        width: '100%',
        maxWidth: 380,
    },
    cta: {
        height: 52,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#007aff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 6,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});