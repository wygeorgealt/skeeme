import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { 
    Scanning, GraduationCap, MultiplePages, Activity, FireFlame, Trophy, 
    NavArrowRight, Plus, Rocket, Book, Calendar, CheckCircle,
    Crown, Flash, Menu, Sparks
} from 'iconoir-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
                        <Text style={[s.weekLabel, isToday ? (isDark ? s.textWhite : s.textSlate900) : s.textSlate400]}>{day[0]}</Text>
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
                                    <Text style={[s.calDayText, 
                                        isToday ? (isDark ? s.textWhite : s.textIndigo600)
                                            : isFuture ? (isDark ? s.textSlate800 : s.textSlate300)
                                            : (isDark ? s.textSlate600 : s.textSlate400)
                                    ]}>{d}</Text>
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

    flex1: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    heroRow: { paddingHorizontal: 24, paddingBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    heroSublabel: { fontSize: 14, fontWeight: '500', letterSpacing: 0.5, marginBottom: 8, opacity: 0.7 },
    heroValueRow: { flexDirection: 'row', alignItems: 'center' },
    heroValue: { fontSize: 48, fontWeight: '700', letterSpacing: -1 },
    heroValueUnlimited: { fontSize: 40, fontWeight: '700', letterSpacing: -1 },
    mr8: { marginRight: 8 },
    heroActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    upgradeBtn: { height: 40, paddingHorizontal: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12, marginLeft: 6 },
    menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },

    quickActionsRow: { paddingHorizontal: 32, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickActionWrap: { alignItems: 'center' },
    quickActionIconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)' },
    quickActionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.3, color: '#94a3b8' },

    bottomHalf: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 40, paddingHorizontal: 24, minHeight: 600, paddingBottom: 48 },
    bgBlack: { backgroundColor: '#090A0F' },
    bgWhiteTrans: { backgroundColor: 'rgba(255,255,255,0.4)' },
    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    card: { padding: 24, borderRadius: 32, marginBottom: 32 },
    bgGrayDark: { backgroundColor: '#13151B' },
    cardLight: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardSubtitle: { color: '#94a3b8', fontSize: 11, fontWeight: '500', marginTop: 2 },

    streakSection: { marginBottom: 32 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 20 },
    streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    streakInfo: { flexDirection: 'row', alignItems: 'center' },
    streakIconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    streakLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    streakSubtitle: { fontSize: 11, color: '#94a3b8' },
    streakBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    streakBadgeText: { fontSize: 13, fontWeight: '900' },
    bgIndigo50: { backgroundColor: '#EEF2FF' },
    bgAmber50: { backgroundColor: '#FFFBEB' },
    bgWhite5: { backgroundColor: 'rgba(255,255,255,0.05)' },
    textIndigo600: { color: '#4F46E5' },
    textAmber600: { color: '#D97706' },

    textWhite: { color: 'white' },
    textWhite60: { color: 'rgba(255,255,255,0.6)' },
    textSlate900: { color: '#0f172a' },
    textSlate800: { color: '#1e293b' },
    textSlate600: { color: '#475569' },
    textSlate500: { color: '#64748b' },
    textSlate400: { color: '#94a3b8' },
    textSlate300: { color: '#cbd5e1' },
    textIndigo600_alt: { color: '#4F46E5' },
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
    const queryClient = useQueryClient();

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
                queryClient.refetchQueries({ queryKey: ['streak-heatmap'] })
            ]);
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [queryClient]);

    if (!user) return null;

    const availableBalanceLabel = isDark ? s.textWhite60 : s.textSlate500;
    const availableBalanceValue = isDark ? s.textWhite : s.textSlate900;

    return (
        <GlowBackground>
            <ScrollView
                style={s.flex1}
                contentContainerStyle={[s.scrollContent, { paddingTop: Math.max(insets.top, 16) }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={['#8B5CF6']} />}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* TOP HERO SECTION */}
                <View style={s.heroRow}>
                    <View>
                        <Text style={[s.heroSublabel, availableBalanceLabel]}>
                            Available Balance
                        </Text>
                        <View style={s.heroValueRow}>
                            {user.is_unlimited ? (
                                <>
                                    <Sparks width={28} height={28} color="#8B5CF6" style={s.mr8} />
                                    <Text style={[s.heroValueUnlimited, availableBalanceValue]}>
                                        Unlimited
                                    </Text>
                                </>
                            ) : (
                                <Text style={[s.heroValue, availableBalanceValue]}>
                                    {user.credits.toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={s.heroActions}>
                        {isFreePlan && (
                            <TouchableOpacity onPress={() => router.push('/upgrade')} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={['#8B5CF6', '#6366F1']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={s.upgradeBtn}
                                    >
                                        <Crown width={16} height={16} color="white" />
                                        <Text style={s.upgradeBtnText}>Upgrade</Text>
                                    </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            onPress={() => navigation.openDrawer()} 
                            activeOpacity={0.7}
                            style={[s.menuBtn, isDark ? s.bgWhite10 : s.bgWhite60]}
                        >
                            <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View style={s.quickActionsRow}>
                    {[
                        { title: 'Scan', icon: Scanning, route: '/scan' },
                        { title: 'Quiz', icon: GraduationCap, route: '/generate' },
                        { title: 'Decks', icon: MultiplePages, route: '/flashcards' },
                        { title: 'History', icon: Activity, route: '/history' },
                    ].map((tool, idx) => (
                        <View key={idx} style={s.quickActionWrap}>
                            <TouchableOpacity onPress={() => router.push(tool.route as any)} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={isDark ? ['rgba(139,92,246,0.2)', 'rgba(99,102,241,0.1)'] : ['rgba(139,92,246,0.08)', 'rgba(99,102,241,0.04)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={s.quickActionIconBox}
                                >
                                    <tool.icon width={24} height={24} color={isDark ? '#C4B5FD' : '#7C3AED'} strokeWidth={1.5} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={s.quickActionLabel}>
                                {tool.title}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* BOTTOM HALF */}
                <View style={[s.bottomHalf, isDark ? s.bgBlack : s.bgWhiteTrans]}>
                    
                    {/* Stats */}
                    <View style={s.statsGrid}>
                        <StatCard label="Credits Spent" value={(user as any).credits_spent_this_week || 0} icon={Flash} color="#f59e0b" isDark={isDark} />
                        <StatCard label="Study Sessions" value={(user as any).study_sessions_this_week || 0} icon={GraduationCap} color="#8B5CF6" isDark={isDark} />
                    </View>

                    {/* Weekly Activity */}
                    <View style={[s.card, isDark ? s.bgGrayDark : s.cardLight]}>
                        <View style={s.cardHeader}>
                            <View>
                                <Text style={[s.cardTitle, isDark ? s.textWhite : s.textSlate900]}>Weekly Activity</Text>
                                <Text style={s.cardSubtitle}>Your study momentum</Text>
                            </View>
                            <Activity width={18} height={18} color="#8B5CF6" />
                        </View>
                        <WeeklyActivity data={(user as any).weekly_activity_points || []} isDark={isDark} />
                    </View>

                    {/* Streaks */}
                    <View style={s.streakSection}>
                        <Text style={[s.sectionTitle, isDark ? s.textWhite : s.textSlate900]}>Streaks</Text>
                        
                        <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} style={s.streakRow}>
                            <View style={s.streakInfo}>
                                <View style={[s.streakIconBox, isDark ? s.bgGrayDark : s.cardLight]}>
                                    <FireFlame width={18} height={18} color="#8B5CF6" />
                                </View>
                                <View>
                                    <Text style={[s.streakLabel, isDark ? s.textWhite : s.textSlate900]}>Current Streak</Text>
                                    <Text style={s.streakSubtitle}>Keep the fire alive</Text>
                                </View>
                            </View>
                            <View style={[s.streakBadge, isDark ? s.bgWhite5 : s.bgIndigo50]}>
                                <Text style={[s.streakBadgeText, isDark ? s.textWhite : s.textIndigo600]}>
                                    {user.streak?.current_streak || 0}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} style={s.streakRow}>
                            <View style={s.streakInfo}>
                                <View style={[s.streakIconBox, isDark ? s.bgGrayDark : s.cardLight]}>
                                    <Trophy width={18} height={18} color="#f59e0b" />
                                </View>
                                <View>
                                    <Text style={[s.streakLabel, isDark ? s.textWhite : s.textSlate900]}>Longest Streak</Text>
                                    <Text style={s.streakSubtitle}>Your personal best</Text>
                                </View>
                            </View>
                            <View style={[s.streakBadge, isDark ? s.bgWhite5 : s.bgAmber50]}>
                                <Text style={[s.streakBadgeText, isDark ? s.textWhite : s.textAmber600]}>
                                    {user.streak?.longest_streak || 0}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Activity Calendar */}
                    <View style={[s.card, isDark ? s.bgGrayDark : s.cardLight]}>
                        <View style={s.cardHeader}>
                            <View>
                                <Text style={[s.cardTitle, isDark ? s.textWhite : s.textSlate900]}>Activity Calendar</Text>
                                <Text style={s.cardSubtitle}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                            </View>
                        </View>
                        <StreakCalendar activeDates={heatmapDates} isLoading={isLoadingHeatmap} isDark={isDark} />
                    </View>
                </View>
            </ScrollView>
        </GlowBackground>
    );
}
