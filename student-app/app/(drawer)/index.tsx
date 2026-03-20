import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { 
    Scanning, GraduationCap, MultiplePages, Activity, FireFlame, Trophy, 
    NavArrowRight, Plus, Rocket, Book, Calendar, CheckCircle
} from 'iconoir-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Sub-components use ONLY style props (no className) ────────────────────────
// NativeWind's css-interop wraps components using className and tries to access
// the navigation context, which can fail during render. Using style props avoids
// this entirely.

function StatCard({ label, value, icon: Icon, color, isDark }: any) {
    return (
        <View style={[s.statCard, isDark ? s.statCardDark : s.statCardLight]}>
            <View style={[s.statIcon, { backgroundColor: `${color}15` }]}>
                <Icon width={20} height={20} color={color} />
            </View>
            <Text style={[s.statValue, { color: isDark ? '#fff' : '#0f172a' }]}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
}

function WeeklyActivity({ data, isDark }: any) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = days.map((_, i) => {
        if (Array.isArray(data) && data[i]) {
            return typeof data[i] === 'object' ? data[i].value || 0 : data[i];
        }
        return 0;
    });
    const max = Math.max(...values, 1);
    
    return (
        <View style={s.weekRow}>
            {days.map((day, i) => {
                const val = values[i];
                const heightPct = Math.max((val / max) * 100, 6);
                const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1);
                return (
                    <View key={i} style={s.weekCol}>
                        <View style={s.weekBarWrap}>
                            {val > 0 ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={{ height: `${heightPct}%`, width: 8, borderRadius: 4, minHeight: 4 }}
                                />
                            ) : (
                                <View style={{ height: `${heightPct}%`, width: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', minHeight: 4 }} />
                            )}
                        </View>
                        <Text style={[s.weekLabel, { color: isToday ? (isDark ? '#fff' : '#0f172a') : '#94a3b8' }]}>{day[0]}</Text>
                    </View>
                );
            })}
        </View>
    );
}

function StreakCalendar({ activeDates, isLoading, isDark }: { activeDates: string[], isLoading: boolean, isDark: boolean }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = today.getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const blanks = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, () => 0);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const grid = [...blanks, ...days];
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    if (isLoading) {
        return (
            <View>
                <View style={s.calWeekHeader}>
                    {weekDays.map((d, i) => (
                        <View key={`wh-${i}`} style={s.calWeekDay}>
                            <Text style={s.calWeekDayText}>{d}</Text>
                        </View>
                    ))}
                </View>
                <View style={s.calGrid}>
                    {Array.from({ length: 14 }).map((_, i) => (
                        <View key={`skel-${i}`} style={s.calCell}>
                            <View style={[s.calCellInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }]} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    const safeDates = activeDates || [];

    return (
        <View>
            <View style={s.calWeekHeader}>
                {weekDays.map((d, i) => (
                    <View key={`wh-${i}`} style={s.calWeekDay}>
                        <Text style={s.calWeekDayText}>{d}</Text>
                    </View>
                ))}
            </View>
            <View style={s.calGrid}>
                {grid.map((d, idx) => {
                    if (d === 0) return <View key={`blank-${idx}`} style={s.calCell} />;
                    
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isActive = safeDates.includes(dateStr);
                    const isToday = d === currentDay;
                    const isFuture = d > currentDay;

                    return (
                        <View key={`day-${d}`} style={s.calCell}>
                            {isActive ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={s.calCellGradient}
                                >
                                    <Text style={s.calActiveText}>{d}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={[
                                    s.calCellInner,
                                    isToday && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#EEF2FF', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#C7D2FE' },
                                    !isToday && !isFuture && { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' },
                                    isFuture && { opacity: 0.2 },
                                ]}>
                                    <Text style={[s.calDayText, {
                                        color: isToday ? (isDark ? '#fff' : '#4F46E5')
                                            : isFuture ? (isDark ? '#334155' : '#cbd5e1')
                                            : (isDark ? '#64748b' : '#94a3b8')
                                    }]}>{d}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Stylesheet ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // Stat card
    statCard: { flex: 1, padding: 20, borderRadius: 28 },
    statCardDark: { backgroundColor: '#13151B' },
    statCardLight: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    statValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
    statLabel: { color: '#94a3b8', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
    // Weekly activity
    weekRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, paddingHorizontal: 4 },
    weekCol: { alignItems: 'center', flex: 1, gap: 8 },
    weekBarWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
    weekLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    // Calendar
    calWeekHeader: { flexDirection: 'row', marginBottom: 12 },
    calWeekDay: { flex: 1, alignItems: 'center' },
    calWeekDayText: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
    calCellInner: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    calCellGradient: { flex: 1, width: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    calActiveText: { color: '#fff', fontWeight: '700', fontSize: 11 },
    calDayText: { fontWeight: '700', fontSize: 11 },
});

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardScreen() {
    const { user, updateUser } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isFreePlan = !user?.is_unlimited && (!user?.plan_name || user?.plan_name === 'free');
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();

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
        if (!user) return;
        setRefreshing(true);
        try {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
        } catch { /* silent */ }
        setRefreshing(false);
    }, [user, updateUser]);

    if (!user) return null;

    return (
        <GlowBackground>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: Math.max(insets.top, 16) }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* TOP HERO SECTION */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '500', letterSpacing: 0.5, marginBottom: 8, opacity: 0.7, color: isDark ? '#fff' : '#64748b' }}>
                            Available Balance
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {user.is_unlimited ? (
                                <>
                                    <Sparks width={28} height={28} color="#8B5CF6" style={{ marginRight: 8 }} />
                                    <Text style={{ fontSize: 40, fontWeight: '700', letterSpacing: -1, color: isDark ? '#fff' : '#0f172a' }}>
                                        Unlimited
                                    </Text>
                                </>
                            ) : (
                                <Text style={{ fontSize: 48, fontWeight: '700', letterSpacing: -1, color: isDark ? '#fff' : '#0f172a' }}>
                                    {user.credits.toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {isFreePlan && (
                            <TouchableOpacity onPress={() => router.push('/upgrade')} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ height: 40, paddingHorizontal: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Crown width={16} height={16} color="white" />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, marginLeft: 6 }}>Upgrade</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            onPress={() => navigation.openDrawer()} 
                            activeOpacity={0.7}
                            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)' }}
                        >
                            <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View style={{ paddingHorizontal: 32, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {[
                        { title: 'Scan', icon: Scanning, route: '/scan' },
                        { title: 'Quiz', icon: GraduationCap, route: '/generate' },
                        { title: 'Decks', icon: MultiplePages, route: '/flashcards' },
                        { title: 'History', icon: Activity, route: '/history' },
                    ].map((tool, idx) => (
                        <View key={idx} style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => router.push(tool.route as any)} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={isDark ? ['rgba(139,92,246,0.2)', 'rgba(99,102,241,0.1)'] : ['rgba(139,92,246,0.08)', 'rgba(99,102,241,0.04)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ 
                                        width: 60, height: 60, borderRadius: 30,
                                        alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 10,
                                        borderWidth: 1,
                                        borderColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
                                    }}
                                >
                                    <tool.icon width={24} height={24} color={isDark ? '#C4B5FD' : '#7C3AED'} strokeWidth={1.5} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.3, color: isDark ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                                {tool.title}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* BOTTOM HALF */}
                <View style={{ flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 40, paddingHorizontal: 24, minHeight: 600, paddingBottom: 48, backgroundColor: isDark ? '#090A0F' : 'rgba(255,255,255,0.4)' }}>
                    
                    {/* Stats */}
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
                        <StatCard label="Credits Spent" value={(user as any).credits_spent_this_week || 0} icon={Flash} color="#f59e0b" isDark={isDark} />
                        <StatCard label="Study Sessions" value={(user as any).study_sessions_this_week || 0} icon={GraduationCap} color="#8B5CF6" isDark={isDark} />
                    </View>

                    {/* Weekly Activity */}
                    <View style={[{ padding: 24, borderRadius: 32, marginBottom: 32 }, isDark ? { backgroundColor: '#13151B' } : { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>Weekly Activity</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '500', marginTop: 2 }}>Your study momentum</Text>
                            </View>
                            <Activity width={18} height={18} color="#8B5CF6" />
                        </View>
                        <WeeklyActivity data={(user as any).weekly_activity_points || []} isDark={isDark} />
                    </View>

                    {/* Streaks */}
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 20, color: isDark ? '#fff' : '#0f172a' }}>Streaks</Text>
                        
                        <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: isDark ? '#13151B' : 'rgba(255,255,255,0.8)' }}>
                                    <FireFlame width={18} height={18} color="#8B5CF6" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 2, color: isDark ? '#fff' : '#0f172a' }}>Current Streak</Text>
                                    <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>Keep the fire alive</Text>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#EEF2FF' }}>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: isDark ? '#fff' : '#4F46E5' }}>
                                    {user.streak?.current_streak || 0}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: isDark ? '#13151B' : 'rgba(255,255,255,0.8)' }}>
                                    <Trophy width={18} height={18} color="#f59e0b" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 2, color: isDark ? '#fff' : '#0f172a' }}>Longest Streak</Text>
                                    <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>Your personal best</Text>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFBEB' }}>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: isDark ? '#fff' : '#D97706' }}>
                                    {user.streak?.longest_streak || 0}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Activity Calendar */}
                    <View style={[{ padding: 24, borderRadius: 32 }, isDark ? { backgroundColor: '#13151B' } : { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>Activity Calendar</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '500', marginTop: 2 }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                            </View>
                        </View>
                        <StreakCalendar activeDates={heatmapDates} isLoading={isLoadingHeatmap} isDark={isDark} />
                    </View>
                </View>
            </ScrollView>
        </GlowBackground>
    );
}
