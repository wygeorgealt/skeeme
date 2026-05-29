import { Text } from '@/components/ui/Text';
import { View, ScrollView, RefreshControl, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fire, RoundArrowUp, Calendar, ClockCircle, Notebook, History, MedalRibbonsStar, AltArrowRight, Chart2, Layers } from '@solar-icons/react-native/Bold';

import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { tryPromptForReview } from '@/lib/storeReview';

// ─── Card shadow helper ───────────────────────────────────────────────────────
const cardStyle = (C: typeof Colors.light) => ({
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: C.cardShadowColor,
    shadowOpacity: C.cardShadowOpacity,
    shadowRadius: C.cardShadowRadius,
    shadowOffset: C.cardShadowOffset,
    elevation: C.cardElevation,
});

// ─── Quick Action config ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: 'Quiz',       Icon: Notebook, route: '/generate',        bg: '#EBF3FF', color: '#007AFF' },
    { label: 'Flashcards', Icon: Layers,    route: '/flashcards/create', bg: '#E6F9EE', color: '#34C759' },
    { label: 'History',    Icon: History,  route: '/history',         bg: '#FFF4E6', color: '#FF9500' },
    { label: 'Streak',     Icon: Fire,     route: '/streak',          bg: '#FFEBEA', color: '#FF3B30' },
] as const;

// ─── 7-Day Streak Calendar ────────────────────────────────────────────────────
function StreakCalendar({ data, isDark, C }: { data: any[]; isDark: boolean; C: typeof Colors.light }) {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIndex = (new Date().getDay() + 6) % 7;

    const isActive = (idx: number) => {
        const val = data?.[idx];
        return typeof val === 'number' ? val > 0 : typeof val === 'object' ? (val?.value ?? 0) > 0 : false;
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            {days.map((day, i) => {
                const active = isActive(i);
                const isToday = i === todayIndex;
                return (
                    <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: isToday ? C.primary : C.textTertiary }}>{day}</Text>
                        <View style={{
                            width: 34, height: 34, borderRadius: 17,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: active ? C.primary : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                            borderWidth: !active && isToday ? 2 : 0,
                            borderColor: C.primary,
                        }}>
                            {active
                                ? <Fire size={16} color="#FFF" />
                                : <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.textTertiary }} />
                            }
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
    const { user, updateUser } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
            const timer = setTimeout(() => {
                tryPromptForReview().catch(() => {});
            }, 800);
            return () => clearTimeout(timer);
        }, [])
    );

    const daysUntilExam = user?.nearest_exam
        ? Math.ceil((new Date(user.nearest_exam.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const { data: heatmapDates = [] } = useQuery({
        queryKey: ['streak-heatmap'],
        queryFn: async () => {
            const res = await api.get('streaks/heatmap');
            return res.data.data as string[];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 60 * 4,
    });
    const studentQuery = useStudent();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['student', 'me'] }),
                queryClient.refetchQueries({ queryKey: ['streak-heatmap'] }),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [queryClient]);

    if (!user) return null;

    const weeklyCalendarData = Array.from({ length: 7 }).map((_, i) => {
        const today = new Date();
        const currentDay = (today.getDay() + 6) % 7;
        const d = new Date(today);
        d.setDate(today.getDate() - currentDay + i);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISO = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 10);
        return heatmapDates.includes(localISO) ? 1 : 0;
    });

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 130, paddingHorizontal: 16, gap: 14 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
                }
            >
                {/* ── Hero: Balance + Upgrade (no card) ── */}
                <Animated.View key={`hero-${animKey}`} entering={FadeInUp.duration(500)} style={s.heroSection}>
                    <View>
                        <Text style={[s.heroLabel, { color: C.textSecondary }]}>AVAILABLE BALANCE</Text>
                        <Text style={[s.heroValue, { color: C.text }]}>
                            {user.credits?.toLocaleString() ?? '0'}
                        </Text>
                    </View>
                    {user.plan_name === 'free' && (
                        <TouchableOpacity onPress={() => router.push('/paywall')} style={[s.upgradePill, { backgroundColor: C.primary }]}>
                            <RoundArrowUp size={14} color="#FFF" />
                            <Text style={s.upgradeText}>Upgrade</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* ── Quick Actions Grid ── */}
                <Animated.View key={`quick-${animKey}`} entering={FadeInDown.delay(80).duration(400)} style={s.quickRow}>
                    {QUICK_ACTIONS.map((action) => (
                        <TouchableOpacity
                            key={action.route}
                            onPress={() => router.push(action.route)}
                            activeOpacity={0.75}
                            style={s.quickItem}
                        >
                            <View style={[s.quickIconBox, { backgroundColor: isDark ? action.color + '22' : action.bg }]}>
                                <action.Icon size={26} color={action.color} />
                            </View>
                            <Text style={[s.quickLabel, { color: C.textSecondary }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* ── Stats Row ── */}
                <Animated.View key={`stats-${animKey}`} entering={FadeInDown.delay(160).duration(400)} style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/exams' as any)} activeOpacity={0.75}>
                        <View style={[s.statCard, cardStyle(C)]}>
                            <View style={[s.statIconBox, { backgroundColor: isDark ? '#5856D622' : '#EEF0FF' }]}>
                                <Calendar size={18} color="#5856D6" />
                            </View>
                            <Text style={[s.statNum, { color: C.text }]}>
                                {daysUntilExam !== null ? (daysUntilExam < 0 ? 0 : daysUntilExam) : '—'}
                            </Text>
                            <Text style={[s.statDesc, { color: C.textSecondary }]}>
                                {user.nearest_exam ? 'Days to Exam' : 'Add Exam'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[{ flex: 1 }, s.statCard, cardStyle(C)]}>
                        <View style={[s.statIconBox, { backgroundColor: isDark ? '#007AFF22' : '#EBF3FF' }]}>
                            <ClockCircle size={18} color="#007AFF" />
                        </View>
                        <Text style={[s.statNum, { color: C.text }]}>{user.study_sessions_this_week ?? 0}</Text>
                        <Text style={[s.statDesc, { color: C.textSecondary }]}>Study Sessions</Text>
                    </View>
                </Animated.View>

                {/* ── Weekly Activity ── */}
                <Animated.View key={`activity-${animKey}`} entering={FadeInDown.delay(240).duration(400)} style={[s.activityCard, cardStyle(C)]}>
                    <View style={s.activityHeader}>
                        <View>
                            <Text style={[s.activityTitle, { color: C.text }]}>Weekly Activity</Text>
                            <Text style={[s.activitySub, { color: C.textSecondary }]}>Your study momentum</Text>
                        </View>
                        <Chart2 size={20} color={C.primary} />
                    </View>
                    <StreakCalendar data={weeklyCalendarData} isDark={isDark} C={C} />
                </Animated.View>

                {/* ── Streaks Header ── */}
                <Animated.View key={`header-${animKey}`} entering={FadeInDown.delay(320).duration(400)}>
                    <Text style={[s.sectionTitle, { color: C.text }]}>Streaks</Text>
                </Animated.View>

                {/* ── Streaks Card ── */}
                <Animated.View key={`streaks-${animKey}`} entering={FadeInDown.delay(400).duration(400)} style={[cardStyle(C), { overflow: 'hidden', borderRadius: 20 }]}>
                    <TouchableOpacity onPress={() => router.push('/streak')} style={s.streakRow} activeOpacity={0.75}>
                        <View style={[s.streakIcon, { backgroundColor: isDark ? '#FF3B3022' : '#FFEBEA' }]}>
                            <Fire size={18} color="#FF3B30" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: C.text }]}>Current Streak</Text>
                            <Text style={[s.streakSub, { color: C.textSecondary }]}>Keep the fire alive</Text>
                        </View>
                        <Text style={[s.streakCount, { color: C.text }]}>{user.streak?.current_streak ?? 0}</Text>
                        <AltArrowRight size={18} color={C.textTertiary} />
                    </TouchableOpacity>

                    <View style={[s.divider, { backgroundColor: C.separator }]} />

                    <TouchableOpacity onPress={() => router.push('/streak')} style={s.streakRow} activeOpacity={0.75}>
                        <View style={[s.streakIcon, { backgroundColor: isDark ? '#FF950022' : '#FFF4E6' }]}>
                            <MedalRibbonsStar size={18} color="#FF9500" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: C.text }]}>Longest Streak</Text>
                            <Text style={[s.streakSub, { color: C.textSecondary }]}>Your personal best</Text>
                        </View>
                        <Text style={[s.streakCount, { color: C.text }]}>{user.streak?.longest_streak ?? 0}</Text>
                        <AltArrowRight size={18} color={C.textTertiary} />
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    heroSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12 },
    heroLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
    heroValue: { fontSize: 48, fontWeight: '800', letterSpacing: -2, lineHeight: 54 },
    upgradePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 100, gap: 6 },
    upgradeText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

    quickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 4 },
    quickItem: { alignItems: 'center', gap: 8, flex: 1 },
    quickIconBox: { width: 70, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: 13, fontWeight: '600' },

    statCard: { padding: 18 },
    statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    statNum: { fontSize: 30, fontWeight: '800', marginBottom: 2, letterSpacing: -0.5 },
    statDesc: { fontSize: 13, fontWeight: '500' },

    activityCard: { padding: 20 },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    activityTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    activitySub: { fontSize: 13, fontWeight: '500' },

    sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginTop: 4, marginBottom: -2 },

    streakRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    streakIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    streakTitle: { fontSize: 15, fontWeight: '600' },
    streakSub: { fontSize: 12, marginTop: 2 },
    streakCount: { fontSize: 20, fontWeight: '800', marginRight: 4 },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
});
