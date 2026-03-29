import { Text } from '@/components/ui/Text';
import { View, ScrollView, RefreshControl, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Activity, FireFlame, Trophy, MultiplePages } from 'iconoir-react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TutorialModal } from '@/components/ui/TutorialModal';
import * as SecureStore from 'expo-secure-store';
import { IosCard } from '@/components/ui/IosCard';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Quick action data ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: 'Quiz', icon: 'school-outline', route: '/generate', color: '#007AFF' },
    { label: 'Flashcards', icon: 'albums-outline', route: '/flashcards', color: '#34C759' },
    { label: 'History', icon: 'time-outline', route: '/history', color: '#FF9500' },
    { label: 'Streak', icon: 'flame-outline', route: '/streak', color: '#FF3B30' },
] as const;

// ─── 7-Day Streak Calendar ───────────────────────────────────────────────────
function StreakCalendar({ data, isDark }: { data: any[]; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIndex = (new Date().getDay() + 6) % 7; // Mon is 0
    
    // Check for activity — if value > 0 then day is active
    const isActive = (idx: number) => {
        const val = data?.[idx];
        return typeof val === 'number' ? val > 0 : typeof val === 'object' ? (val?.value ?? 0) > 0 : false;
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            {days.map((day, i) => {
                const active = isActive(i);
                const isToday = i === todayIndex;
                
                return (
                    <View key={i} style={{ alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: isToday ? C.primary : C.textSecondary }}>{day}</Text>
                        <View style={{
                            width: 32, height: 32, borderRadius: 16,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: active ? C.primary : (isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.05)'),
                            borderWidth: !active && isToday ? 2 : 0,
                            borderColor: !active && isToday ? C.primary : 'transparent'
                        }}>
                            {active ? (
                                <FireFlame width={16} height={16} color="#FFF" />
                            ) : (
                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.textTertiary }} />
                            )}
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
    const [tutorialVisible, setTutorialVisible] = useState(false);
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    const isFreePlan = !user?.is_unlimited && (!user?.plan_name || user?.plan_name === 'free');

    useEffect(() => {
        SecureStore.getItemAsync('tutorial_seen').then((seen) => {
            if (!seen) setTutorialVisible(true);
        });
    }, []);

    const { data: heatmapDates = [], isLoading: isLoadingHeatmap } = useQuery({
        queryKey: ['streak-heatmap'],
        queryFn: async () => {
            const res = await api.get('streaks/heatmap');
            return res.data.data as string[];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 60 * 4,
    });

    useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
            return res.data;
        },
        enabled: !!user,
        staleTime: 300000,
        refetchInterval: 300000,
        refetchOnWindowFocus: true,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['me'] }),
                queryClient.refetchQueries({ queryKey: ['streak-heatmap'] }),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [queryClient]);

    if (!user) return null;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView
                contentContainerStyle={[s.scroll, { paddingTop: insets.top + Spacing.sm, paddingBottom: 120 }]}
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
                {/* ── Hero Card: Balance & Quick Actions ── */}
                <IosCard style={s.heroCard} padding="lg">
                    <View style={s.heroTop}>
                        <View>
                            <Text style={[s.heroLabel, { color: C.textSecondary }]}>Available Balance</Text>
                            <Text style={[s.heroValue, { color: C.text }]}>
                                {user.is_unlimited ? '∞' : user.credits?.toLocaleString() ?? '0'}
                            </Text>
                        </View>
                        <View style={s.heroActions}>
                            <TouchableOpacity 
                                onPress={() => router.push('/upgrade')}
                                style={[s.upgradePill, { backgroundColor: C.primary }]}
                            >
                                <Ionicons name="sparkles" size={14} color="#FFF" />
                                <Text style={s.upgradeText}>Upgrade</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={s.quickRow}>
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity
                                key={action.route}
                                onPress={() => router.push(action.route)}
                                activeOpacity={0.7}
                                style={s.quickItem}
                            >
                                <View style={[s.quickIcon, { backgroundColor: action.color + '12' }]}>
                                    <View style={[styles.innerCircle, { backgroundColor: action.color + '10' }]}>
                                        <Ionicons name={action.icon as any} size={22} color={action.color} />
                                    </View>
                                </View>
                                <Text style={[s.quickLabel, { color: C.textSecondary }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </IosCard>

                {/* ── Stats Row ── */}
                <View style={s.statsRow}>
                    <IosCard style={{ flex: 1 }} padding="md">
                        <View style={[s.statIconBox, { backgroundColor: '#FFD60A15' }]}>
                            <Ionicons name="flash" size={16} color="#FFD60A" />
                        </View>
                        <Text style={[s.statNum, { color: C.text }]}>{user.credits_spent_this_week ?? 0}</Text>
                        <Text style={[s.statDesc, { color: C.textSecondary }]}>Credits Spent</Text>
                    </IosCard>
                    <IosCard style={{ flex: 1 }} padding="md">
                        <View style={[s.statIconBox, { backgroundColor: '#007AFF15' }]}>
                            <GraduationCap width={16} height={16} color="#007AFF" />
                        </View>
                        <Text style={[s.statNum, { color: C.text }]}>{user.study_sessions_this_week ?? 0}</Text>
                        <Text style={[s.statDesc, { color: C.textSecondary }]}>Study Sessions</Text>
                    </IosCard>
                </View>

                {/* ── Weekly Activity (Streak Calendar) ── */}
                <IosCard padding="lg" style={{ marginBottom: Spacing.lg }}>
                    <View style={s.activityHeader}>
                        <View>
                            <Text style={[s.activityTitle, { color: C.text }]}>Weekly Activity</Text>
                            <Text style={[s.activitySub, { color: C.textSecondary }]}>Your study momentum</Text>
                        </View>
                        <Activity color={C.primary} width={20} height={20} />
                    </View>
                    <View style={{ height: 10 }} />
                    <StreakCalendar data={user.weekly_activity_points ?? []} isDark={isDark} />
                    <View style={{ height: 10 }} />
                </IosCard>

                {/* ── Streaks Header ── */}
                <View style={{ paddingHorizontal: 4, marginBottom: Spacing.sm }}>
                    <Text style={[s.sectionTitle, { color: C.text }]}>Streaks</Text>
                </View>

                <IosCard padding="none" style={{ marginBottom: Spacing.lg }}>
                    <TouchableOpacity onPress={() => router.push('/streak')} style={s.streakRow} activeOpacity={0.7}>
                        <View style={[s.streakIcon, { backgroundColor: '#FF3B3015' }]}>
                            <FireFlame width={18} height={18} color="#FF3B30" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: C.text }]}>Current Streak</Text>
                            <Text style={[s.streakSub, { color: C.textSecondary }]}>Keep the fire alive</Text>
                        </View>
                        <Text style={[s.streakCount, { color: C.text }]}>{user.streak?.current_streak ?? 0}</Text>
                        <Ionicons name="chevron-forward" size={16} color={C.textTertiary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    <View style={[s.divider, { backgroundColor: C.separator }]} />
                    <TouchableOpacity onPress={() => router.push('/streak')} style={s.streakRow} activeOpacity={0.7}>
                        <View style={[s.streakIcon, { backgroundColor: '#FF950015' }]}>
                            <Trophy width={18} height={18} color="#FF9500" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.streakTitle, { color: C.text }]}>Longest Streak</Text>
                            <Text style={[s.streakSub, { color: C.textSecondary }]}>Your personal best</Text>
                        </View>
                        <Text style={[s.streakCount, { color: C.text }]}>{user.streak?.longest_streak ?? 0}</Text>
                        <Ionicons name="chevron-forward" size={16} color={C.textTertiary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </IosCard>
            </ScrollView>

            <TutorialModal
                visible={tutorialVisible}
                onDismiss={async () => {
                    setTutorialVisible(false);
                    await SecureStore.setItemAsync('tutorial_seen', 'true');
                }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    scroll: { paddingHorizontal: Spacing.md, gap: 0 },
    
    heroCard: { marginBottom: Spacing.md, marginTop: Spacing.sm },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    heroLabel: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    heroValue: { fontSize: 44, fontWeight: '700', letterSpacing: -1 },
    heroActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    upgradePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
    upgradeText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    menuCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    quickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
    quickItem: { alignItems: 'center', gap: 8 },
    quickIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: 11, fontWeight: '600' },

    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    statIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    statNum: { fontSize: 28, fontWeight: '700', marginBottom: 2 },
    statDesc: { fontSize: 13, fontWeight: '500' },

    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    activityTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    activitySub: { fontSize: 13, fontWeight: '500' },

    sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },

    streakRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
    streakIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
    streakTitle: { fontSize: FontSize.subhead, fontWeight: '600' },
    streakSub: { fontSize: FontSize.caption1, marginTop: 2 },
    streakCount: { fontSize: FontSize.title3, fontWeight: '700' },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.md },
});

const styles = StyleSheet.create({
    innerCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
