import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Share } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { AltArrowLeft, Copy, Share as ShareIcon } from '@solar-icons/react-native/Bold';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

export default function ReferralScreen() {
    const { user, updateUser } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    const [stats, setStats] = useState({ code: '', total_referred: 0, credits_earned: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [copied, setCopied] = useState(false);

    // Reanimated shared value for copy button scale
    const copyScale = useSharedValue(1);
    const copyScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: copyScale.value }],
    }));

    useEffect(() => {
        Promise.all([
            api.get('referral/my-code').then(res => setStats(prev => ({ ...prev, code: res.data.code }))).catch(() => {}),
            api.get('referral/stats').then(res => setStats(prev => ({ ...prev, total_referred: res.data.total_referred ?? res.data.total_referrals ?? 0, credits_earned: res.data.credits_earned || 0 }))).catch(() => {})
        ]).finally(() => setLoadingStats(false));
    }, []);

    const handleShare = async () => {
        if (!stats.code) return;
        try {
            await Share.share({
                message: `I've been using Skeeme to study smarter — it builds quizzes and flashcards from my notes using AI. Use my code ${stats.code} and get 100 bonus credits free. Download: https://play.google.com/store/apps/details?id=com.skeeme.app`,
                title: 'Join me on Skeeme!',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleCopy = async () => {
        if (!stats.code) return;
        await Clipboard.setStringAsync(stats.code);
        setCopied(true);

        // Animate scale using reanimated
        copyScale.value = withSequence(
            withTiming(0.85, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );

        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <Animated.View entering={FadeInUp.duration(500)} style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
                <TouchableOpacity onPress={() => router.navigate({ pathname: '/(drawer)/account' })} activeOpacity={0.7} style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}>
                    <AltArrowLeft size={24} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <View style={s.headerTextContainer}>
                    <Text style={[s.headerTitle, { color: C.text }]}>Earn Rewards</Text>
                    <Text style={[s.headerSubtitle, { color: C.textSecondary }]}>Invite friends & earn credits</Text>
                </View>
                <View style={{ width: 44 }} />
            </Animated.View>

            <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Hero Code Card */}
                <Animated.View entering={FadeInUp.duration(500)}>
                    <View style={[s.heroCard, { backgroundColor: C.primary }]}>  {/* ← now properly closed below */}
                        <Text style={s.heroLabel}>Your Referral Code</Text>
                        {loadingStats ? (
                            <LoadingSpinner size={20} color="rgba(255,255,255,0.7)" />
                        ) : (
                            <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
                                <Text style={s.heroCode}>{stats.code || '...'}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={s.buttonRow}>
                            <Animated.View style={[{ flex: 1 }, copyScaleStyle]}>
                                <TouchableOpacity
                                    onPress={handleCopy}
                                    disabled={loadingStats || !stats.code}
                                    activeOpacity={0.8}
                                    style={[s.actionBtn, s.copyBtn, { backgroundColor: copied ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255,255,255,0.2)' }]}
                                >
                                    <Copy size={20} color="white" />
                                    <Text style={s.btnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity
                                onPress={handleShare}
                                disabled={loadingStats || !stats.code}
                                activeOpacity={0.8}
                                style={[s.actionBtn, s.shareActionBtn, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
                            >
                                <ShareIcon size={20} color={C.primary} />
                                <Text style={[s.btnText, { color: C.primary, fontWeight: '800' }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>  {/* ← closes heroCard View */}
                </Animated.View>

                {/* Stats Summary */}
                <Animated.View entering={FadeInDown.delay(160).duration(400)} style={s.statsRow}>
                    <View style={[s.statCard, isDark ? s.statCardDark : s.statCardLight]}>
                        <Text style={[s.statNum, { color: C.primary }]}>{stats.total_referred}</Text>
                        <Text style={[s.statLabel, { color: C.textSecondary }]}>Friends Joined</Text>
                    </View>
                    <View style={[s.statCard, isDark ? s.statCardDark : s.statCardLight]}>
                        <Text style={[s.statNum, { color: '#34C759' }]}>{stats.credits_earned}</Text>
                        <Text style={[s.statLabel, { color: C.textSecondary }]}>Credits Earned</Text>
                    </View>
                </Animated.View>

                {/* How It Works */}
                <Animated.View entering={FadeInDown.delay(240).duration(400)}>
                    <Text style={[s.sectionHeading, { color: C.text }]}>How It Works</Text>
                    <View style={{ gap: 12 }}>
                        <RewardStep
                            number="1"
                            title="Share Your Code"
                            desc="Send your code to friends or on social media"
                            color={C.primary}
                            isDark={isDark}
                        />
                        <RewardStep
                            number="2"
                            title="Friend Joins Skeeme"
                            desc="They download and enter your code during signup"
                            color="#34C759"
                            isDark={isDark}
                        />
                        <RewardStep
                            number="3"
                            title="You Both Win"
                            desc="You get 200 credits, they get 100 bonus credits"
                            color="#FF9500"
                            isDark={isDark}
                        />
                        <RewardStep
                            number="4"
                            title="Earn More"
                            desc="Get 50 credits when your friends refer others"
                            color="#A78BFA"
                            isDark={isDark}
                        />
                    </View>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

function RewardStep({ number, title, desc, color, isDark }: any) {
    return (
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', paddingVertical: 4 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <Text style={{ color, fontWeight: '800', fontSize: 14 }}>{number}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: isDark ? 'white' : '#0f172a', marginBottom: 4 }}>{title}</Text>
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 18 }}>{desc}</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTextContainer: { flex: 1, paddingHorizontal: 16, alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    headerSubtitle: { fontWeight: '500', fontSize: 13, marginTop: 2, textAlign: 'center' },
    menuBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },

    scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

    heroCard: { borderRadius: 28, padding: 36, marginBottom: 24, alignItems: 'center' },
    heroLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 16 },
    heroCode: { color: 'white', fontWeight: '900', fontSize: 40, letterSpacing: 3, marginBottom: 6 },
    copiedLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 12, marginTop: 8 },

    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 28, width: '100%' },
    actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    copyBtn: {},
    shareActionBtn: {},
    btnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statCard: { flex: 1, paddingVertical: 20, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    statCardDark: { backgroundColor: '#1C1C1E', borderColor: 'transparent' },
    statCardLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    statNum: { fontWeight: '900', fontSize: 28, marginBottom: 6 },
    statLabel: { fontWeight: '600', fontSize: 12, textAlign: 'center' },

    sectionHeading: { fontSize: 18, fontWeight: '800', marginBottom: 16, letterSpacing: -0.3 },

    bonusCard: { borderRadius: 18, padding: 20, marginTop: 24, borderWidth: 1 },
    bonusCardDark: { backgroundColor: '#1C1C1E', borderColor: 'transparent' },
    bonusCardLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    bonusTitle: { fontWeight: '700', fontSize: 14, marginBottom: 8 },
    bonusDesc: { fontSize: 13, lineHeight: 20, fontWeight: '500' },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
});