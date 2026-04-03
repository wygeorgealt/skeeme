import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Snow, NavArrowLeft, Sparks, CheckCircle, GraduationCap, Book, Medal, Suitcase } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { ShareCard } from '@/components/ui/ShareCard';
import { Colors } from '@/constants/theme';

export default function StreakScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    // Milestones
    const current = user?.streak?.current_streak || 0;
    const longest = user?.streak?.longest_streak || 0;
    const viewShotRef = useRef<any>(null);

    const shareStreak = async () => {
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                        dialogTitle: 'Share your Skeeme Streak',
                        mimeType: 'image/jpeg',
                    });
                }
            }
        } catch (error) {
            if (__DEV__) console.error('Sharing failed', error);
        }
    };
    
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
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            <ShareCard type="streak" data={{ current_streak: current }} viewShotRef={viewShotRef} />

            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}>
                    <NavArrowLeft width={24} height={24} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Streak</Text>
                <View style={{ width: 44 }} />
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

                {/* Share Button */}
                {(current > 0 || longest > 0) && (
                    <TouchableOpacity
                        onPress={shareStreak}
                        activeOpacity={0.8}
                        style={[s.shareBtn, isDark ? s.bgWhite10 : s.bgWhite]}
                    >
                        <Sparks width={18} height={18} color={C.primary} style={{ marginRight: 8 }} />
                        <Text style={[s.shareBtnText, { color: C.primary }]}>Share Milestone</Text>
                    </TouchableOpacity>
                )}

                {/* Freezes */}
                <Text style={[s.sectionLabel, isDark ? s.textSlate500 : s.textSlate400]}>Streak Protection</Text>
                <View style={[
                    s.protectionCard,
                    isElite ? (isDark ? s.protectionEliteDark : s.protectionEliteLight) : (isDark ? s.protectionBasicDark : s.protectionBasicLight)
                ]}>
                    <View style={s.protectionHeader}>
                        <View style={[s.protectionIconBox, isDark ? s.protectionIconBoxDark : s.protectionIconBoxLight]}>
                            <Snow width={18} height={18} color={C.primary} />
                        </View>
                        {!isElite ? (
                            <View style={[s.badge, isDark ? s.badgeDark : s.badgeLight]}>
                                <Text style={[s.badgeText, isDark ? s.textSlate950 : s.textWhite]}>Elite Feature</Text>
                            </View>
                        ) : loadingFreezes ? (
                            <ActivityIndicator size="small" color={C.primary} />
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
                            onPress={() => router.push('/upgrade' as any)} 
                            style={[s.upgradeBtn, { backgroundColor: C.primary }]} 
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
                                        <Text style={[s.milestoneTitle, { color: C.text }]}>{m.title}</Text>
                                        <Text style={[s.milestoneReward, { color: C.primary }]}>{m.reward}</Text>
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
        </View>
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
    statCardDark: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
    statCardLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    statLabel: { color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, marginBottom: 12 },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { fontSize: 36, fontWeight: '700', letterSpacing: -1.5 },
    statUnit: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginLeft: 6, textTransform: 'uppercase' },

    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(0,122,255,0.1)' },
    shareBtnText: { fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },

    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, marginLeft: 4 },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite: { backgroundColor: 'white' },
    textIndigo600: { color: '#4F46E5' },

    protectionCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
    protectionEliteDark: { backgroundColor: 'rgba(0,122,255,0.1)', borderColor: 'rgba(0,122,255,0.2)' },
    protectionEliteLight: { backgroundColor: 'rgba(0,122,255,0.05)', borderColor: 'rgba(0,122,255,0.1)' },
    protectionBasicDark: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
    protectionBasicLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    protectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    protectionIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    protectionIconBoxDark: { backgroundColor: 'rgba(0,122,255,0.2)' },
    protectionIconBoxLight: { backgroundColor: 'rgba(0,122,255,0.1)' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeDark: { backgroundColor: 'white' },
    badgeLight: { backgroundColor: '#0f172a' },
    badgeText: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    textSlate950: { color: '#020617' },
    freezeAvailableBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    freezeAvailableText: { color: '#10B981', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
    protectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
    protectionDesc: { color: '#64748b', fontWeight: '500', fontSize: 14, lineHeight: 22, marginBottom: 24 },
    upgradeBtn: { height: 48, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    upgradeBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    achievementCard: { borderRadius: 24, padding: 24, borderWidth: 1 },
    milestoneRow: { marginBottom: 32 },
    lastMilestone: { marginBottom: 8 },
    milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    milestoneTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
    milestoneReward: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
    milestoneProgressText: { color: '#94a3b8', fontWeight: '700', fontSize: 11, letterSpacing: -0.5, marginTop: 4 },
    progressBarBg: { height: 6, borderRadius: 999, overflow: 'hidden' },
    progressBarBgDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    progressBarBgLight: { backgroundColor: '#F1F5F9' },
    progressBarFill: { height: '100%', borderRadius: 999 },
    progressBarFilled: { backgroundColor: '#007AFF' },
    progressBarEmptyDark: { backgroundColor: 'rgba(0,122,255,0.2)' },
    progressBarEmptyLight: { backgroundColor: 'rgba(0,122,255,0.2)' },
});
