import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, ScrollView, RefreshControl, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fire, RoundArrowUp, Calendar, ClockCircle, MedalRibbonsStar, AltArrowRight, Chart2, WalletMoney } from '@solar-icons/react-native/Bold';
import Svg, { Rect, Circle, Path, Line, G } from 'react-native-svg';

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

function QuizPracticeSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            <Rect x="21" y="17" width="38" height="50" rx="8" fill="#007AFF" opacity={0.18} />
            <Rect x="18" y="14" width="38" height="50" rx="8" fill="white" />
            <Rect x="28" y="9" width="18" height="11" rx="5" fill="#007AFF" />
            <Circle cx="37" cy="14" r="3" fill="#EBF3FF" />
            <Circle cx="27" cy="33" r="4" fill="#007AFF" />
            <Path d="M25 33 L27 35.5 L31 30" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="34" y="31" width="16" height="3" rx="1.5" fill="#007AFF" opacity={0.7} />
            <Circle cx="27" cy="44" r="4" stroke="#007AFF" strokeWidth="1.5" fill="white" />
            <Rect x="34" y="42" width="13" height="3" rx="1.5" fill="#007AFF" opacity={0.3} />
            <Circle cx="27" cy="55" r="4" stroke="#007AFF" strokeWidth="1.5" fill="white" />
            <Rect x="34" y="53" width="15" height="3" rx="1.5" fill="#007AFF" opacity={0.3} />
        </Svg>
    );
}

function FlashcardsSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            <G transform="rotate(-10 33 40)">
                <Rect x="12" y="26" width="42" height="28" rx="7" fill="#34C759" opacity={0.2} />
            </G>
            <G transform="rotate(-4 33 40)">
                <Rect x="12" y="26" width="42" height="28" rx="7" fill="#34C759" opacity={0.38} />
            </G>
            <Rect x="12" y="28" width="42" height="28" rx="7" fill="white" />
            <Rect x="12" y="28" width="42" height="28" rx="7" stroke="#34C759" strokeWidth="1.5" />
            <Rect x="20" y="36" width="28" height="3" rx="1.5" fill="#34C759" opacity={0.85} />
            <Rect x="20" y="43" width="21" height="3" rx="1.5" fill="#34C759" opacity={0.4} />
            <Rect x="20" y="50" width="25" height="3" rx="1.5" fill="#34C759" opacity={0.3} />
        </Svg>
    );
}

function HistorySvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            <Circle cx="43" cy="43" r="22" fill="#FF9500" opacity={0.18} />
            <Circle cx="41" cy="41" r="22" fill="white" />
            <Circle cx="41" cy="41" r="22" stroke="#FF9500" strokeWidth="2" />
            <Rect x="40" y="22" width="2" height="4" rx="1" fill="#FF9500" opacity={0.4} />
            <Rect x="40" y="57" width="2" height="4" rx="1" fill="#FF9500" opacity={0.4} />
            <Rect x="57" y="40" width="4" height="2" rx="1" fill="#FF9500" opacity={0.4} />
            <Rect x="22" y="40" width="4" height="2" rx="1" fill="#FF9500" opacity={0.4} />
            <Line x1="41" y1="41" x2="41" y2="27" stroke="#FF9500" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="41" y1="41" x2="52" y2="48" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
            <Circle cx="41" cy="41" r="3" fill="#FF9500" />
            <Path d="M23 41 A18 18 0 0 1 38 24" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M23 41 L18.5 37" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
            <Path d="M23 41 L27 37" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
}

function SavedSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            <Path d="M28 13 L52 13 L52 67 L40 57 L28 67 Z" fill="#5856D6" opacity={0.18} transform="translate(2.5 2.5)" />
            <Path d="M28 13 L52 13 L52 67 L40 57 L28 67 Z" fill="white" />
            <Path d="M28 13 L52 13 L52 67 L40 57 L28 67 Z" stroke="#5856D6" strokeWidth="1.5" />
            <Path
                d="M40 26 L42.8 34.2 L51.5 34.2 L44.5 39.3 L47.3 47.5 L40 42.4 L32.7 47.5 L35.5 39.3 L28.5 34.2 L37.2 34.2 Z"
                fill="#5856D6"
            />
        </Svg>
    );
}


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

    const studentQuery = useStudent();

    const studentMe = studentQuery.data as any;
    const nearestExamDate =
        studentMe?.nearest_exam?.exam_date ??
        user?.nearest_exam?.exam_date ??
        studentMe?.next_exam_date ??
        (user as any)?.next_exam_date ??
        null;

    const daysUntilExam = nearestExamDate
        ? Math.ceil((new Date(nearestExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {user.plan_name === 'free' && (
                            <TouchableOpacity onPress={() => router.push('/paywall')} style={[s.iconCircle, { backgroundColor: C.primary }]}>
                                <RoundArrowUp size={18} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        {/* Buy Credits button: show for free users always; for pro/max show only when credits < 1000 */}
                        {(
                            user.plan_name === 'free' ||
                            ((user.plan_name === 'pro' || user.plan_name === 'max') && (user.credits ?? 0) < 1000)
                        ) && (
                            <TouchableOpacity onPress={() => router.push('/buy-credits')} style={[s.iconCircle, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]}>
                                <WalletMoney size={18} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* ── Feature 2x2 Grid ── */}
                <Animated.View key={`feature-grid-${animKey}`} entering={FadeInDown.delay(80).duration(400)} style={s.gridWrap}>
                    {(
                        [
                            { label: 'Quiz Practice', route: '/generate', color: '#007AFF', bg: '#EBF3FF', Icon: QuizPracticeSvg },
                            { label: 'Flashcards', route: '/flashcards/create', color: '#34C759', bg: '#E6F9EE', Icon: FlashcardsSvg },
                            { label: 'History', route: '/history', color: '#FF9500', bg: '#FFF4E6', Icon: HistorySvg },
                            { label: 'Saved', route: '/history/saved', color: '#5856D6', bg: '#EEF0FF', Icon: SavedSvg },
                        ] as const
                    ).map(({ label, route, color, bg, Icon }) => (
                        <TouchableOpacity
                            key={route}
                            onPress={() => router.push(route as any)}
                            activeOpacity={0.85}
                            style={[s.gridItem, { backgroundColor: isDark ? color + '28' : bg }]}
                        >
                            <Text style={[s.gridLabel, { color: isDark ? '#fff' : '#1A1A2E' }]}>{label}</Text>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Icon />
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>


                {/* ── Stats Row ── (tile-like outer border/overflow, different sizing) ── */}
                <Animated.View key={`stats-${animKey}`} entering={FadeInDown.delay(160).duration(400)} style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/exams' as any)} activeOpacity={0.75}>
                        <View style={[s.tileLikeOuter, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}>
                            <View style={[s.statIconBox, { backgroundColor: isDark ? '#5856D622' : '#EEF0FF' }]}>
                                <Calendar size={18} color="#5856D6" />
                            </View>
                            <Text style={[s.statNum, { color: C.text }]}>
                                {daysUntilExam !== null ? (daysUntilExam < 0 ? 0 : daysUntilExam) : '—'}
                            </Text>
                            <Text style={[s.statDesc, { color: C.textSecondary }]}>
                                {nearestExamDate ? 'Days to Exam' : 'Add Exam'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[{ flex: 1 }, s.tileLikeOuter, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}>
                        <View style={[s.statIconBox, { backgroundColor: isDark ? '#007AFF22' : '#EBF3FF' }]}>
                            <ClockCircle size={18} color="#007AFF" />
                        </View>
                        <Text style={[s.statNum, { color: C.text }]}>{user.study_sessions_this_week ?? 0}</Text>
                        <Text style={[s.statDesc, { color: C.textSecondary }]}>Study Sessions</Text>
                    </View>
                </Animated.View>

                {/* ── Weekly Activity ── (tile-like outer border/overflow) ── */}
                <Animated.View
                    key={`activity-${animKey}`}
                    entering={FadeInDown.delay(240).duration(400)}
                    style={[s.tileLikeOuterWide, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}
                >
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

                {/* ── Streaks Card ── (tile-like outer border/overflow) ── */}
                <Animated.View
                    key={`streaks-${animKey}`}
                    entering={FadeInDown.delay(400).duration(400)}
                    style={[s.tileLikeOuterWide, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}
                >
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
    heroSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    heroLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    heroValue: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -2,
        lineHeight: 54,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
    gridItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 1,
    },
    gridLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, lineHeight: 21 },

    // tile-like outer styling (same border/overflow idea as quick tiles, but used on larger/smaller sections)
    tileLikeOuter: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 1,
    },
    tileLikeOuterWide: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 1,
    },

    statCard: { padding: 18 },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
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
