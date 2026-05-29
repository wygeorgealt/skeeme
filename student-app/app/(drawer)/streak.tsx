import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Modal, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { ShareCard } from '@/components/ui/ShareCard';
import { AltArrowLeft, Share } from '@solar-icons/react-native/Bold';
import { StreakAnimation } from '@/components/StreakAnimation';
import { Colors } from '@/constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';

const MILESTONES = [
    { title: '7 Day Streak', target: 7, reward: '50 Credits' },
    { title: '14 Day Streak', target: 14, reward: '100 Credits' },
    { title: '30 Day Streak', target: 30, reward: '200 Credits' },
    { title: '60 Day Streak', target: 60, reward: '500 Credits' },
];

function SectionLabel({ label }: { label: string }) {
    return <Text style={styles.sectionLabel}>{label}</Text>;
}

function StatCard({ label, value, unit, C }: { label: string; value: number; unit: string; C: typeof Colors.light }) {
    return (
        <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.separator }]}> 
            <Text style={[styles.statLabel, { color: C.textTertiary }]}>{label}</Text>
            <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: C.text }]}>{value}</Text>
                <Text style={[styles.statUnit, { color: C.textTertiary }]}>{unit}</Text>
            </View>
        </View>
    );
}

function MilestoneRow({ milestone, current, C, isDark }: { milestone: { title: string; target: number; reward: string }; current: number; C: typeof Colors.light; isDark: boolean }) {
    const progress = Math.min(100, (current / milestone.target) * 100);
    const isUnlocked = current >= milestone.target;

    return (
        <View style={styles.milestoneRow}>
            <View style={styles.milestoneInfo}>
                <View>
                    <Text style={[styles.milestoneTitle, { color: C.text }]}>{milestone.title}</Text>
                    <Text style={[styles.milestoneReward, { color: isUnlocked ? '#34C759' : C.primary }]}>{milestone.reward}</Text>
                </View>
                <Text style={[styles.milestoneProgressText, { color: C.textTertiary }]}>{current} / {milestone.target}</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}> 
                <View style={[styles.progressBarFill, { backgroundColor: isUnlocked ? '#34C759' : C.primary, width: `${progress}%` }]} />
            </View>
        </View>
    );
}

export default function StreakScreen() {
    const { user, updateUser } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    const viewShotRef = useRef<any>(null);

    const current = user?.streak?.current_streak || 0;
    const longest = user?.streak?.longest_streak || 0;

    const queryClient = useQueryClient();

    const [claimModalVisible, setClaimModalVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (user?.streak?.unclaimed_reward && user.streak.unclaimed_reward > 0) {
            setClaimModalVisible(true);
        }
    }, [user?.streak?.unclaimed_reward]);

    const handleClaimReward = async () => {
        setIsClaiming(true);
        try {
                const res = await api.post('streaks/claim-reward');
                // Refresh cached user state
                queryClient.invalidateQueries({ queryKey: ['student', 'me'] });
            setClaimModalVisible(false);
            Alert.alert('Reward Claimed!', `You received ${user?.streak?.unclaimed_reward} credits!`);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Could not claim reward');
        } finally {
            setIsClaiming(false);
        }
    };

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

    return (
        <View style={[styles.container, { backgroundColor: C.background }]}> 
            <Stack.Screen options={{ headerShown: false }} />
            <ShareCard type="streak" data={{ current_streak: current }} viewShotRef={viewShotRef} />

            <Animated.View entering={FadeInDown.duration(450)} style={[styles.hero, { paddingTop: Math.max(insets.top, 18) }]}> 
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.75}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <AltArrowLeft size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={[styles.heroTitle, { color: C.text }]}>Momentum</Text>
                <Text style={[styles.heroSub, { color: C.textSecondary }]}>A streak built day by day makes every study session count.</Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 120) }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.animationWrap}> 
                    <StreakAnimation streakCount={current} size={220} isDark={isDark} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(180).duration(600)} style={styles.statsGrid}> 
                    <StatCard label="Current Streak" value={current} unit="Days" C={C} />
                    <StatCard label="Personal Best" value={longest} unit="Days" C={C} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(260).duration(600)} style={styles.section}> 
                    <SectionLabel label="Achievements" />
                    <View style={[styles.milestoneBoard, { backgroundColor: C.card, borderColor: C.separator }]}> 
                        {MILESTONES.map((milestone, index) => (
                            <View key={milestone.target} style={index < MILESTONES.length - 1 ? styles.milestoneSeparator : undefined}> 
                                <MilestoneRow milestone={milestone} current={current} C={C} isDark={isDark} />
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Claim Reward Modal */}
            <Modal
                visible={claimModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setClaimModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center' }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(52,199,89,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 32 }}>🎁</Text>
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8 }}>Claim Reward</Text>
                        <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, textAlign: 'center', lineHeight: 22 }}>
                            You have an unclaimed reward of <Text style={{ fontWeight: '700', color: '#34C759' }}>{user?.streak?.unclaimed_reward} Credits</Text> for your study streak!
                        </Text>
                        
                        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', alignItems: 'center' }}
                                onPress={() => setClaimModalVisible(false)}
                                disabled={isClaiming}
                            >
                                <Text style={{ color: C.text, fontWeight: '600', fontSize: 16 }}>Later</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#34C759', alignItems: 'center', opacity: isClaiming ? 0.5 : 1 }}
                                onPress={handleClaimReward}
                                disabled={isClaiming}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{isClaiming ? 'Claiming...' : 'Claim Now'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    hero: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -1.2,
        lineHeight: 42,
        marginBottom: 10,
    },
    heroSub: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '400',
    },

    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    animationWrap: {
        alignItems: 'center',
        marginBottom: 28,
    },

    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        padding: 20,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    statValue: {
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -1,
    },
    statUnit: {
        fontSize: 12,
        fontWeight: '700',
    },

    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 14,
        color: '#007AFF',
    },

    milestoneBoard: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    milestoneSeparator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    milestoneRow: {
        padding: 20,
    },
    milestoneInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
        gap: 12,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    milestoneReward: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    milestoneProgressText: {
        fontSize: 11,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 10,
    },

});
