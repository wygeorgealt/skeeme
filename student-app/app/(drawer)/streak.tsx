import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Stack, router, useNavigation } from 'expo-router';
import { Menu, Snow, NavArrowLeft, Sparks, CheckCircle, GraduationCap, Book, Medal, Suitcase } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function StreakScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();
    const bgColor = isDark ? "#0f0f11" : "#fafafa";
    const tintColor = isDark ? '#ffffff' : '#0f172a';
    const cardBg = isDark ? "#161618" : "#ffffff";
    const borderColor = isDark ? "border-slate-800" : "border-slate-200";

    // Milestones
    const current = user?.streak?.current_streak || 0;
    const longest = user?.streak?.longest_streak || 0;
    
    const milestones = [
        { title: '7 Day Streak', target: 7, reward: '50 Credits' },
        { title: '14 Day Streak', target: 14, reward: '100 Credits' },
        { title: '30 Day Streak', target: 30, reward: '200 Credits' },
        { title: '60 Day Streak', target: 60, reward: '500 Credits' },
    ];

    const isElite = user?.plan_name === 'elite';
    const [freezes, setFreezes] = useState({ total_allowed: 2, used_this_month: 0 });
    const [loadingFreezes, setLoadingFreezes] = useState(true);

    useEffect(() => {
        const fetchFreezes = async () => {
            try {
                const res = await api.get('streaks/freezes');
                if (res.data) {
                    setFreezes(res.data);
                }
            } catch (err) {
                setFreezes({ total_allowed: 2, used_this_month: 0 });
            } finally {
                setLoadingFreezes(false);
            }
        };
        fetchFreezes();
    }, []);

    const freezesLeft = freezes.total_allowed - freezes.used_this_month;

    const cardBgClass = isDark ? 'bg-[#13151B]' : 'bg-white';
    const borderColorClass = isDark ? 'border-transparent' : 'border-slate-100 shadow-sm';

    return (
        <GlowBackground>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with drawer toggle */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>Streak</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={[s.statCard, isDark ? s.statCardDark : s.statCardLight]}>
                        <Text style={s.statLabel}>Current</Text>
                        <View style={s.statValueRow}>
                            <Text style={[s.statValue, isDark ? s.textWhite : s.textSlate900]}>{current}</Text>
                            <Text style={s.statUnit}>Days</Text>
                        </View>
                    </View>
                    <View style={[s.statCard, isDark ? s.statCardDark : s.statCardLight]}>
                        <Text style={s.statLabel}>Longest</Text>
                        <View style={s.statValueRow}>
                            <Text style={[s.statValue, isDark ? s.textWhite : s.textSlate900]}>{longest}</Text>
                            <Text style={s.statUnit}>Days</Text>
                        </View>
                    </View>
                </View>

                {/* Freezes */}
                <Text style={[s.sectionLabel, isDark ? s.textSlate500 : s.textSlate400]}>Streak Protection</Text>
                <View style={[
                    s.protectionCard,
                    isElite ? (isDark ? s.protectionEliteDark : s.protectionEliteLight) : (isDark ? s.protectionBasicDark : s.protectionBasicLight)
                ]}>
                    <View style={s.protectionHeader}>
                        <View style={[s.protectionIconBox, isDark ? s.protectionIconBoxDark : s.protectionIconBoxLight]}>
                            <Snow width={18} height={18} color="#6366f1" />
                        </View>
                        {!isElite ? (
                            <View style={[s.badge, isDark ? s.badgeDark : s.badgeLight]}>
                                <Text style={[s.badgeText, isDark ? s.textSlate950 : s.textWhite]}>Elite Feature</Text>
                            </View>
                        ) : loadingFreezes ? (
                            <ActivityIndicator size="small" color="#6366f1" />
                        ) : (
                            <View style={s.freezeAvailableBadge}>
                                <Text style={s.freezeAvailableText}>{freezesLeft} Available</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[s.protectionTitle, isDark ? s.textWhite : s.textSlate900]}>Peace of mind.</Text>
                    <Text style={s.protectionDesc}>
                        Streak freezes automatically protect your progress if you ever miss a day. 
                    </Text>
                    
                    {!isElite && (
                        <TouchableOpacity 
                            onPress={() => router.push('/upgrade')} 
                            style={s.upgradeBtn} 
                            activeOpacity={0.9}
                        >
                            <Text style={s.upgradeBtnText}>Get Streak Protection</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Milestones */}
                <Text style={[s.sectionLabel, isDark ? s.textSlate500 : s.textSlate400]}>Achievements</Text>
                <View style={[s.achievementCard, isDark ? s.statCardDark : s.statCardLight]}>
                    {milestones.map((m, i) => {
                        const progress = Math.min(100, (current / m.target) * 100);
                        const isUnlocked = current >= m.target;
                        
                        return (
                            <View key={i} style={[s.milestoneRow, i === milestones.length - 1 ? s.lastMilestone : null]}>
                                <View style={s.milestoneHeader}>
                                    <View>
                                        <Text style={[s.milestoneTitle, isDark ? s.textWhite : s.textSlate900]}>{m.title}</Text>
                                        <Text style={s.milestoneReward}>{m.reward}</Text>
                                    </View>
                                    <Text style={s.milestoneProgressText}>{current} / {m.target}</Text>
                                </View>
                                <View style={[s.progressBarBg, isDark ? s.progressBarBgDark : s.progressBarBgLight]}>
                                    <View 
                                        style={[
                                            s.progressBarFill, 
                                            isUnlocked ? s.progressBarFilled : (isDark ? s.progressBarEmptyDark : s.progressBarEmptyLight), 
                                            { width: `${progress}%` }
                                        ]} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },

    scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statCard: { flex: 1, borderRadius: 24, padding: 24, borderWidth: 1 },
    statCardDark: { backgroundColor: '#13151B', borderColor: 'transparent' },
    statCardLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    statLabel: { color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, marginBottom: 12 },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { fontSize: 36, fontWeight: '700', letterSpacing: -1.5 },
    statUnit: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginLeft: 6, textTransform: 'uppercase' },

    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, marginLeft: 4 },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },

    protectionCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
    protectionEliteDark: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' },
    protectionEliteLight: { backgroundColor: '#F5F3FF', borderColor: '#E0E7FF' },
    protectionBasicDark: { backgroundColor: '#13151B', borderColor: 'transparent' },
    protectionBasicLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    protectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    protectionIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    protectionIconBoxDark: { backgroundColor: 'rgba(99,102,241,0.2)' },
    protectionIconBoxLight: { backgroundColor: '#EEF2FF' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeDark: { backgroundColor: 'white' },
    badgeLight: { backgroundColor: '#0f172a' },
    badgeText: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    textSlate950: { color: '#020617' },
    freezeAvailableBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    freezeAvailableText: { color: '#10B981', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
    protectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
    protectionDesc: { color: '#64748b', fontWeight: '500', fontSize: 14, lineHeight: 22, marginBottom: 24 },
    upgradeBtn: { height: 48, backgroundColor: '#8B5CF6', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    upgradeBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    achievementCard: { borderRadius: 24, padding: 24, borderWidth: 1 },
    milestoneRow: { marginBottom: 32 },
    lastMilestone: { marginBottom: 8 },
    milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    milestoneTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
    milestoneReward: { color: '#8B5CF6', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
    milestoneProgressText: { color: '#94a3b8', fontWeight: '700', fontSize: 11, letterSpacing: -0.5, marginTop: 4 },
    progressBarBg: { height: 6, borderRadius: 999, overflow: 'hidden' },
    progressBarBgDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    progressBarBgLight: { backgroundColor: '#F1F5F9' },
    progressBarFill: { height: '100%', borderRadius: 999 },
    progressBarFilled: { backgroundColor: '#8B5CF6' },
    progressBarEmptyDark: { backgroundColor: 'rgba(139,92,246,0.2)' },
    progressBarEmptyLight: { backgroundColor: 'rgba(139,92,246,0.3)' },
});
