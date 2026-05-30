import { Text } from '@/components/ui/Text';
import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Rect, Circle, Path, Line, G, Ellipse } from 'react-native-svg';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fire, RoundArrowUp, Calendar, ClockCircle, MedalRibbonsStar, AltArrowRight, Chart2, WalletMoney } from '@solar-icons/react-native/Bold';
import { Colors } from '@/constants/theme';
import { tryPromptForReview } from '@/lib/storeReview';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function QuizPracticeSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            {/* Shadow layer */}
            <Rect x="22" y="19" width="38" height="50" rx="8" fill="#007AFF" opacity={0.12} />
            {/* Main clipboard body */}
            <Rect x="18" y="14" width="38" height="50" rx="8" fill="white" />
            <Rect x="18" y="14" width="38" height="50" rx="8" stroke="#007AFF" strokeWidth="1.5" opacity={0.3} />
            {/* Clip top */}
            <Rect x="27" y="9" width="20" height="12" rx="6" fill="#007AFF" />
            <Circle cx="37" cy="15" r="2.5" fill="white" opacity={0.4} />
            {/* Checked item */}
            <Circle cx="27" cy="32" r="4.5" fill="#007AFF" />
            <Path d="M25 32 L27 34.5 L31.5 29" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="34" y="30" width="16" height="3" rx="1.5" fill="#007AFF" opacity={0.65} />
            {/* Unchecked items */}
            <Circle cx="27" cy="43" r="4.5" stroke="#007AFF" strokeWidth="1.5" fill="white" />
            <Rect x="34" y="41" width="13" height="3" rx="1.5" fill="#007AFF" opacity={0.3} />
            <Circle cx="27" cy="54" r="4.5" stroke="#007AFF" strokeWidth="1.5" fill="white" />
            <Rect x="34" y="52" width="16" height="3" rx="1.5" fill="#007AFF" opacity={0.25} />
        </Svg>
    );
}

function FlashcardsSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            {/* Back cards stacked */}
            <G transform="rotate(-12 40 42)">
                <Rect x="14" y="28" width="44" height="30" rx="8" fill="#34C759" opacity={0.15} />
            </G>
            <G transform="rotate(-5 40 42)">
                <Rect x="14" y="28" width="44" height="30" rx="8" fill="#34C759" opacity={0.28} />
            </G>
            {/* Front card */}
            <Rect x="14" y="30" width="44" height="30" rx="8" fill="white" />
            <Rect x="14" y="30" width="44" height="30" rx="8" stroke="#34C759" strokeWidth="1.5" />
            {/* Text lines on card */}
            <Rect x="22" y="39" width="28" height="3.5" rx="1.75" fill="#34C759" opacity={0.9} />
            <Rect x="22" y="46.5" width="20" height="3" rx="1.5" fill="#34C759" opacity={0.4} />
            <Rect x="22" y="53" width="24" height="3" rx="1.5" fill="#34C759" opacity={0.25} />
        </Svg>
    );
}

function HistorySvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            {/* Offset shadow circle */}
            <Circle cx="44" cy="44" r="22" fill="#FF9500" opacity={0.15} />
            {/* Main clock face */}
            <Circle cx="41" cy="41" r="22" fill="white" />
            <Circle cx="41" cy="41" r="22" stroke="#FF9500" strokeWidth="2" />
            {/* Tick marks */}
            <Rect x="40" y="21" width="2" height="5" rx="1" fill="#FF9500" opacity={0.45} />
            <Rect x="40" y="57" width="2" height="5" rx="1" fill="#FF9500" opacity={0.45} />
            <Rect x="57" y="40" width="5" height="2" rx="1" fill="#FF9500" opacity={0.45} />
            <Rect x="21" y="40" width="5" height="2" rx="1" fill="#FF9500" opacity={0.45} />
            {/* Hour hand */}
            <Line x1="41" y1="41" x2="41" y2="26" stroke="#FF9500" strokeWidth="2.5" strokeLinecap="round" />
            {/* Minute hand */}
            <Line x1="41" y1="41" x2="53" y2="48" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
            {/* Center dot */}
            <Circle cx="41" cy="41" r="3.5" fill="#FF9500" />
            {/* Counter-clockwise arrow arc */}
            <Path
                d="M23 41 A18 18 0 0 1 38 23.5"
                stroke="#FF9500" strokeWidth="2" strokeLinecap="round" fill="none"
            />
            <Path d="M22.5 41 L18 37" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
            <Path d="M22.5 41 L27 37.5" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
}

function SavedSvg() {
    return (
        <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            {/* Shadow bookmark */}
            <Path
                d="M30 15 L54 15 L54 68 L42 58 L30 68 Z"
                fill="#5856D6" opacity={0.12}
                transform="translate(2.5 2.5)"
            />
            {/* Main bookmark */}
            <Path d="M30 15 L54 15 L54 68 L42 58 L30 68 Z" fill="white" />
            <Path d="M30 15 L54 15 L54 68 L42 58 L30 68 Z" stroke="#5856D6" strokeWidth="1.5" />
            {/* Star inside */}
            <Path
                d="M42 27 L44.5 34.5 L52.5 34.5 L46 39.5 L48.5 47 L42 42 L35.5 47 L38 39.5 L31.5 34.5 L39.5 34.5 Z"
                fill="#5856D6"
            />
            {/* Sparkle dots */}
            <Circle cx="22" cy="22" r="2.5" fill="#5856D6" opacity={0.4} />
            <Circle cx="16" cy="32" r="1.5" fill="#5856D6" opacity={0.25} />
            <Circle cx="60" cy="20" r="2" fill="#5856D6" opacity={0.35} />
        </Svg>
    );
}

// ─── Streak Calendar ──────────────────────────────────────────────────────────

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
                        <Text style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: isToday ? '#5856D6' : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(88,86,214,0.4)',
                        }}>
                            {day}
                        </Text>
                        <View style={{
                            width: 34, height: 34, borderRadius: 17,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: active
                                ? '#5856D6'
                                : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(88,86,214,0.08)',
                            borderWidth: !active && isToday ? 2 : 0,
                            borderColor: '#5856D6',
                        }}>
                            {active
                                ? <Fire size={16} color="#FFF" />
                                : <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(88,86,214,0.25)' }} />
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
    const { user } = useAuthStore();
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
                contentContainerStyle={{
                    paddingTop: insets.top + 20,
                    paddingBottom: 130,
                    paddingHorizontal: 16,
                    gap: 14,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={C.primary}
                        colors={[C.primary]}
                    />
                }
            >
                {/* ── Hero ── */}
                <Animated.View
                    key={`hero-${animKey}`}
                    entering={FadeInUp.duration(500)}
                    style={s.heroSection}
                >
                    <View>
                        <Text style={[s.heroLabel, { color: C.textSecondary }]}>AVAILABLE BALANCE</Text>
                        <Text style={[s.heroValue, { color: C.text }]}>
                            {user.credits?.toLocaleString() ?? '0'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {user.plan_name === 'free' && (
                            <TouchableOpacity
                                onPress={() => router.push('/paywall')}
                                style={[s.iconCircle, { backgroundColor: C.primary }]}
                            >
                                <RoundArrowUp size={18} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        {(
                            user.plan_name === 'free' ||
                            ((user.plan_name === 'pro' || user.plan_name === 'max') && (user.credits ?? 0) < 1000)
                        ) && (
                            <TouchableOpacity
                                onPress={() => router.push('/buy-credits')}
                                style={[s.iconCircle, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]}
                            >
                                <WalletMoney size={18} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* ── Feature 2x2 Grid ── */}
                <Animated.View
                    key={`feature-grid-${animKey}`}
                    entering={FadeInDown.delay(80).duration(400)}
                    style={s.gridWrap}
                >
                    {(
                        [
                            { label: 'Quiz Practice',  route: '/generate',          color: '#007AFF', bg: '#EBF3FF', darkBg: '#007AFF28', Icon: QuizPracticeSvg },
                            { label: 'Flashcards',     route: '/flashcards/create', color: '#34C759', bg: '#E6F9EE', darkBg: '#34C75928', Icon: FlashcardsSvg },
                            { label: 'History',        route: '/history',           color: '#FF9500', bg: '#FFF4E6', darkBg: '#FF950028', Icon: HistorySvg },
                            { label: 'Saved',          route: '/history/saved',     color: '#5856D6', bg: '#EEF0FF', darkBg: '#5856D628', Icon: SavedSvg },
                        ] as const
                    ).map(({ label, route, color, bg, darkBg, Icon }) => (
                        <TouchableOpacity
                            key={route}
                            onPress={() => router.push(route as any)}
                            activeOpacity={0.85}
                            style={[s.gridItem, { backgroundColor: isDark ? darkBg : bg }]}
                        >
                            <Text style={[s.gridLabel, { color: isDark ? '#fff' : '#1A1A2E' }]}>{label}</Text>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Icon />
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* ── Stats Row ── */}
                <Animated.View
                    key={`stats-${animKey}`}
                    entering={FadeInDown.delay(160).duration(400)}
                    style={{ flexDirection: 'row', gap: 12 }}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => router.push('/exams' as any)}
                        activeOpacity={0.85}
                    >
                        <View style={[s.pasteCard, { backgroundColor: isDark ? '#5856D628' : '#EEF0FF' }]}>
                            <View style={[s.statIconBox, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
                                <Calendar size={18} color="#5856D6" />
                            </View>
                            <Text style={[s.statNum, { color: isDark ? '#fff' : '#1A1A2E' }]}>
                                {daysUntilExam !== null ? (daysUntilExam < 0 ? 0 : daysUntilExam) : '—'}
                            </Text>
                            <Text style={[s.statDesc, { color: isDark ? 'rgba(255,255,255,0.55)' : '#5856D6' }]}>
                                {nearestExamDate ? 'Days to Exam' : 'Add Exam'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[{ flex: 1 }, s.pasteCard, { backgroundColor: isDark ? '#007AFF28' : '#EBF3FF' }]}>
                        <View style={[s.statIconBox, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
                            <ClockCircle size={18} color="#007AFF" />
                        </View>
                        <Text style={[s.statNum, { color: isDark ? '#fff' : '#1A1A2E' }]}>
                            {user.study_sessions_this_week ?? 0}
                        </Text>
                        <Text style={[s.statDesc, { color: isDark ? 'rgba(255,255,255,0.55)' : '#007AFF' }]}>
                            Study Sessions
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Weekly Activity ── */}
                <Animated.View
                    key={`activity-${animKey}`}
                    entering={FadeInDown.delay(240).duration(400)}
                    style={[s.pasteCard, { backgroundColor: isDark ? '#5856D618' : '#F3F0FF', padding: 20 }]}
                >
                    <View style={s.activityHeader}>
                        <View>
                            <Text style={[s.activityTitle, { color: isDark ? '#fff' : '#1A1A2E' }]}>
                                Weekly Activity
                            </Text>
                            <Text style={[s.activitySub, { color: isDark ? 'rgba(255,255,255,0.5)' : '#5856D6' }]}>
                                Your study momentum
                            </Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 10, padding: 8 }}>
                            <Chart2 size={18} color="#5856D6" />
                        </View>
                    </View>
                    <StreakCalendar data={weeklyCalendarData} isDark={isDark} C={C} />
                </Animated.View>

                {/* ── Streaks Header ── */}
                <Animated.View key={`header-${animKey}`} entering={FadeInDown.delay(320).duration(400)}>
                    <Text style={[s.sectionTitle, { color: C.text }]}>Streaks</Text>
                </Animated.View>

                {/* ── Streaks Card ── */}
                <Animated.View
                    key={`streaks-${animKey}`}
                    entering={FadeInDown.delay(400).duration(400)}
                    style={[s.pasteCard, { backgroundColor: isDark ? '#FF950018' : '#FFF6ED', padding: 0, overflow: 'hidden' }]}
                >
                    <TouchableOpacity
                        onPress={() => router.push('/streak')}
                        style={s.streakRow}
                        activeOpacity={0.75}
                    >
                        <View style={[s.streakIcon, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
                            <Fire size={18} color="#FF3B30" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: isDark ? '#fff' : '#1A1A2E' }]}>Current Streak</Text>
                            <Text style={[s.streakSub, { color: isDark ? 'rgba(255,255,255,0.5)' : '#FF9500' }]}>
                                Keep the fire alive
                            </Text>
                        </View>
                        <Text style={[s.streakCount, { color: isDark ? '#fff' : '#1A1A2E' }]}>
                            {user.streak?.current_streak ?? 0}
                        </Text>
                        <AltArrowRight size={18} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
                    </TouchableOpacity>

                    <View style={[s.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,149,0,0.15)' }]} />

                    <TouchableOpacity
                        onPress={() => router.push('/streak')}
                        style={s.streakRow}
                        activeOpacity={0.75}
                    >
                        <View style={[s.streakIcon, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
                            <MedalRibbonsStar size={18} color="#FF9500" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: isDark ? '#fff' : '#1A1A2E' }]}>Longest Streak</Text>
                            <Text style={[s.streakSub, { color: isDark ? 'rgba(255,255,255,0.5)' : '#FF9500' }]}>
                                Your personal best
                            </Text>
                        </View>
                        <Text style={[s.streakCount, { color: isDark ? '#fff' : '#1A1A2E' }]}>
                            {user.streak?.longest_streak ?? 0}
                        </Text>
                        <AltArrowRight size={18} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    // Hero
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

    // 2x2 Grid
    gridWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 4,
    },
    gridItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    gridLabel: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.3,
        lineHeight: 21,
    },

    // Shared pastel card
    pasteCard: {
        borderRadius: 24,
        overflow: 'hidden',
        padding: 18,
    },

    // Stats
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    statNum: {
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    statDesc: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Activity
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    activityTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    activitySub: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Section title
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginTop: 4,
        marginBottom: -2,
    },

    // Streaks
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    streakIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    streakSub: {
        fontSize: 12,
        marginTop: 2,
    },
    streakCount: {
        fontSize: 20,
        fontWeight: '800',
        marginRight: 4,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 16,
    },
});