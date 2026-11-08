import { Text } from '@/components/ui/Text';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useCallback, useEffect } from 'react';
import AltArrowLeft from '@/assets/icons/pikaicons/arrow-left.svg';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import Gift from '@/assets/icons/pikaicons/gift-default.svg';
import CopyDefault from '@/assets/icons/pikaicons/copy-default.svg';
import SendPlane from '@/assets/icons/pikaicons/send-plane-horizontal.svg';
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
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function ReferralScreen() {
    const { user, updateUser } = useAuthStore();

    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const [stats, setStats] = useState({ code: '' });
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyScale = useSharedValue(1);
    const copyScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: copyScale.value }],
    }));

    const loadStats = useCallback(() => {
        setLoadingStats(true);
        setStatsError(false);
        api.get('referral/my-code')
            .then(res => setStats({ code: res.data.code || '' }))
            .catch(() => setStatsError(true))
            .finally(() => setLoadingStats(false));
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const handleShare = async () => {
        if (!stats.code) return;
        try {
            await Share.share({
                message: `I've been using Skeeme as my AI study partner. Join me and use my code ${stats.code} when you sign up: https://play.google.com/store/apps/details?id=com.skeeme.app`,
                title: 'Study with Skeeme',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleCopy = async () => {
        if (!stats.code) return;
        await Clipboard.setStringAsync(stats.code);
        setCopied(true);
        copyScale.value = withSequence(
            withTiming(0.85, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScreenHeader 
            title="Invite a Classmate"
                onBack={() => (router.canGoBack() ? router.back() : router.replace('/(drawer)/settings' as any))}
            />

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Code Card */}
                <Animated.View key={`hero-${animKey}`} entering={FadeInUp.duration(500)} style={[s.heroCard, { backgroundColor: C.primary }]}>
                    <AnimatedIcon size={64} animationType="pop">
                        <Gift width={56} height={56} color="#FF9500" />
                    </AnimatedIcon>
                    <Text style={[s.heroLabel, { marginTop: 16 }]}>Your Referral Code</Text>
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
                                style={[
                                    s.actionBtn,
                                    s.copyBtn,
                                    { backgroundColor: copied ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255,255,255,0.2)' },
                                ]}
                            >
                                <AnimatedIcon size={24}>
                                    <CopyDefault width={24} height={24} color="#FFF" />
                                </AnimatedIcon>
                                <Text style={s.btnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <TouchableOpacity
                            onPress={handleShare}
                            disabled={loadingStats || !stats.code}
                            activeOpacity={0.8}
                            style={[s.actionBtn, s.shareActionBtn, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
                        >
                            <AnimatedIcon size={24}>
                                <SendPlane width={24} height={24} color={C.primary} />
                            </AnimatedIcon>
                            <Text style={[s.btnText, { color: C.primary, fontWeight: '800' }]}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {statsError && (
                    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                        <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: '500' }}>Couldn't load your invite code.</Text>
                        <View style={{ width: 120 }}>
                            <AnimatedButton
                                title="Retry"
                                onPress={loadStats}
                                type="capsule"
                                backgroundColor={C.primary}
                                shadowColor="#0066D6"
                                fullWidth
                            />
                        </View>
                    </View>
                )}

                {/* How it works */}
                <Animated.View key={`how-${animKey}`} entering={FadeInDown.delay(160).duration(400)}>
                    <Text style={[s.sectionHeading, { color: C.text }]}>Study together</Text>
                    <View style={{ gap: 12 }}>
                        <Animated.View key={`step1-${animKey}`} entering={FadeInDown.delay(180).duration(400)}>
                            <RewardStep
                                number="1"
                                title="Share Your Code"
                                desc="Share your code with someone you study with"
                                color={C.primary}
                                isDark={isDark}
                            />
                        </Animated.View>
                        <Animated.View key={`step2-${animKey}`} entering={FadeInDown.delay(240).duration(400)}>
                            <RewardStep
                                number="2"
                                title="Friend Joins Skeeme"
                                desc="They enter your code when they create an account"
                                color="#34C759"
                                isDark={isDark}
                            />
                        </Animated.View>
                        <Animated.View key={`step3-${animKey}`} entering={FadeInDown.delay(300).duration(400)}>
                            <RewardStep
                                number="3"
                                title="Learn with Skeeme"
                                desc="Explore AI chats, quizzes, flashcards, and summaries together"
                                color="#FF9500"
                                isDark={isDark}
                            />
                        </Animated.View>
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
    copyBtn: {paddingHorizontal: 30},
    shareActionBtn: {},
    btnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    sectionHeading: { fontSize: 18, fontWeight: '800', marginBottom: 16, letterSpacing: -0.3 },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
});