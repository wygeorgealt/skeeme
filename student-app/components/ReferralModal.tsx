import { Text } from '@/components/ui/Text';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, useColorScheme, Share, Platform, StyleSheet, Dimensions, Modal, Pressable, Clipboard } from 'react-native';
import { Copy, Forward, CupStar, UsersGroupTwoRounded, WalletMoney, CheckCircle } from '@solar-icons/react-native/Bold';
import { BlurView } from 'expo-blur';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ReferralModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function ReferralModal({ visible, onDismiss }: ReferralModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [referralData, setReferralData] = useState<{ referral_code: string; share_text: string } | null>(null);
    const [stats, setStats] = useState<{ total_referrals: number; credits_earned: number } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible]);

    const fetchData = async () => {
        try {
            const [codeRes, statsRes] = await Promise.all([
                api.get('referral/my-code'),
                api.get('referral/stats')
            ]);
            setReferralData(codeRes.data);
            setStats(statsRes.data);
        } catch (e) {
            console.error('Failed to fetch referral data', e);
        }
    };

    const handleCopy = () => {
        if (referralData?.referral_code) {
            Clipboard.setString(referralData.referral_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (referralData?.share_text) {
            try {
                await Share.share({ message: referralData.share_text });
            } catch (e) {}
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
            <View style={styles.container}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
                        <BlurView intensity={25} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                    </Pressable>
                </Animated.View>

                <Animated.View
                    entering={SlideInDown.springify().damping(20)}
                    exiting={SlideOutDown}
                    style={[styles.sheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                >
                    <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />

                    <View style={styles.content}>
                        <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)' }]}>
                            <CupStar size={32} color="#007AFF" />
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Earn More Credits</Text>
                        <Text style={styles.subtitle}>Invite friends to Skeeme and get rewarded when they start studying.</Text>

                        {/* Reward Tiers */}
                        <View style={styles.tierContainer}>
                            <View style={[styles.tierCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                                <Text style={styles.tierValue}>200</Text>
                                <Text style={styles.tierLabel}>Direct Refer</Text>
                            </View>
                            <View style={[styles.tierCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                                <Text style={styles.tierValue}>50</Text>
                                <Text style={styles.tierLabel}>Friend of Friend</Text>
                            </View>
                            <View style={[styles.tierCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                                <Text style={styles.tierValue}>100</Text>
                                <Text style={styles.tierLabel}>Friend's Bonus</Text>
                            </View>
                        </View>

                        {/* Referral Code Box */}
                        <View style={[styles.codeBox, { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}>
                            <View>
                                <Text style={styles.codeLabel}>YOUR UNIQUE CODE</Text>
                                <Text style={[styles.codeValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                    {referralData?.referral_code || '------'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleCopy} activeOpacity={0.7} style={styles.copyBtn}>
                                {copied ? <CheckCircle size={20} color="#34C759" /> : <Copy size={20} color="#007AFF" />}
                            </TouchableOpacity>
                        </View>

                        {/* Stats Bar */}
                        <View style={styles.statsBar}>
                            <View style={styles.statItem}>
                                <UsersGroupTwoRounded size={18} color={isDark ? '#8E8E93' : '#64748B'} />
                                <Text style={styles.statText}>{stats?.total_referrals || 0} Joins</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <WalletMoney size={18} color={isDark ? '#8E8E93' : '#64748B'} />
                                <Text style={styles.statText}>{stats?.credits_earned || 0} Earned</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={styles.shareBtn}>
                            <Forward size={20} color="#FFFFFF" />
                            <Text style={styles.shareBtnText}>Share Invite Link</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    sheet: { width: width, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 44 : 32 },
    handle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 24 },
    content: { paddingHorizontal: 24, alignItems: 'center' },
    iconWrapper: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { color: '#8E8E93', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
    tierContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    tierCard: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center' },
    tierValue: { fontSize: 18, fontWeight: '900', color: '#007AFF', marginBottom: 2 },
    tierLabel: { fontSize: 10, fontWeight: '700', color: '#8E8E93', textAlign: 'center' },
    codeBox: { width: '100%', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    codeLabel: { fontSize: 11, fontWeight: '800', color: '#8E8E93', letterSpacing: 1, marginBottom: 4 },
    codeValue: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
    copyBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    statsBar: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statText: { fontSize: 14, fontWeight: '700', color: '#8E8E93' },
    statDivider: { width: 1, height: 16, backgroundColor: '#3A3A3C' },
    shareBtn: { backgroundColor: '#007AFF', width: '100%', height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    shareBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
