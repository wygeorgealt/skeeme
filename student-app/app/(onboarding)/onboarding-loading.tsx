import { View, StyleSheet, useColorScheme } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { api } from '@/lib/api';

const BIG = 220;

export default function OnboardingLoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const C = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { onboardingData, completeOnboarding } = useAuthStore();
  const studentQuery = useStudent();

  const [progressText, setProgressText] = useState('Saving preferences...');
  const [progress, setProgress] = useState(0);

  const scheduledTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    // Aggressive but *pleasant*: keep duration long enough so the circle visibly loads.
    // Also avoid sudden jumps by using a smooth easing curve.
    const totalMs = 10000;
    const tickMs = 60;
    const steps = Math.ceil(totalMs / tickMs);

    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

    for (let i = 0; i < steps; i++) {
      const t = setTimeout(() => {
        const raw = i / (steps - 1); // 0..1
        const eased = easeOutCubic(raw); // smooth 0..1
        const next = Math.max(0, Math.min(100, Math.round(eased * 100)));

        setProgress(next);
        setProgressText(statusByProgress(next));

        // milestone snap to ensure exact wording
        if (next === 20) setProgressText(messages[0]);
        if (next === 50) setProgressText(messages[1]);
        if (next === 80) setProgressText(messages[2]);
        if (next === 100) setProgressText(messages[3]);
      }, i * tickMs);

      scheduledTimeouts.current.push(t);
    }
  };

  const submitOnboarding = async () => {
    // Derive backend-required DOB/age fields just-in-time (no DOB/age UI in onboarding anymore).
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

      // Ensure we never complete onboarding “instantly”; this prevents
      // the preferences guard from firing before the server-side prefs land client-side.
      const MIN_TOTAL_MS = 10000;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_TOTAL_MS - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      // Pull latest user so ai_preferences.education_level exists before guards run.
      try {
        await studentQuery.refetch();
      } catch (e) {
        if (__DEV__) console.warn('Failed to refresh user after onboarding', e);
      }

      await completeOnboarding();
      router.replace('/(drawer)');
    };

    run();

    return () => {
      cancelled = true;
      scheduledTimeouts.current.forEach((t) => clearTimeout(t));
      scheduledTimeouts.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // circular visuals (bigger, aggressive)
  // Keep react-native-reanimated import usage minimal (spinner visuals are driven by rotate/progress).

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.center}>
        <View style={styles.circleWrap}>
          <Animated.View style={[styles.circle, { borderColor: C.separatorOpaque }]} />
          <Animated.View
            style={[
              styles.circleProgress,
              { borderTopColor: C.primary },
              { transform: [{ rotate: `${(progress / 100) * 360}deg` }] },
            ]}
          />
        </View>

        <Text style={[styles.progressLabel, { color: C.text }]}>{progress}%</Text>
        <Text style={[styles.message, { color: C.textSecondary }]}>{progressText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  circleWrap: {
    width: BIG,
    height: BIG,
    borderRadius: BIG / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: BIG,
    height: BIG,
    borderRadius: BIG / 2,
    borderWidth: 14,
    opacity: 0.22,
  },
  circleProgress: {
    position: 'absolute',
    width: BIG,
    height: BIG,
    borderRadius: BIG / 2,
    borderWidth: 14,
    borderColor: 'transparent',
    borderTopColor: '#007AFF',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressLabel: { fontSize: 32, fontWeight: '900', marginTop: 18 },
  message: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
    paddingHorizontal: 16,
  },
});