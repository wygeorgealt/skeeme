import { Text } from '@/components/ui/Text';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Dimensions, Modal, Platform } from 'react-native';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { BlurView } from 'expo-blur';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Animated, { 
    FadeIn, 
    FadeOut, 
    ZoomIn, 
    ZoomOut,
    withRepeat,
    withTiming,
    useSharedValue,
    useAnimatedStyle,
    withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ClaimRewardModalProps {
    visible: boolean;
    total: number;
    onClaim: () => void;
}

export default function ClaimRewardModal({ visible, total, onClaim }: ClaimRewardModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { checkAuth } = useAuthStore();
    const [claiming, setClaiming] = useState(false);

    const scale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            scale.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handleClaim = async () => {
        setClaiming(true);
        try {
            await api.post('referral/claim-rewards');
            await checkAuth(); // Refresh credits in store
            onClaim();
        } catch (e) {
            console.error('Failed to claim rewards', e);
        } finally {
            setClaiming(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.container}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
                </Animated.View>

                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={ZoomOut}
                    style={[styles.modal, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                >
                    <Animated.View style={[styles.iconWrapper, animatedStyle]}>
                        <AnimatedIcon source={require('@/assets/3dicons/3dicons-trophy-front-color.png')} size={64} animationType="wobble" />
                        <View style={styles.fireBadge}>
                            <AnimatedIcon source={require('@/assets/3dicons/3dicons-fire-iso-color.png')} size={18} animationType="pop" />
                        </View>
                    </Animated.View>

                    <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>You Got Rewards!</Text>
                    <Text style={styles.subtitle}>Someone used your referral code while you were away. Keep it up!</Text>

                    <View style={[styles.rewardBadge, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.08)' }]}>
                        <Text style={styles.rewardText}>+{total} CREDITS</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleClaim}
                        disabled={claiming}
                        activeOpacity={0.8}
                        style={styles.claimBtn}
                    >
                        <Text style={styles.claimBtnText}>{claiming ? 'Claiming...' : 'Claim My Reward'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    modal: { width: '100%', borderRadius: 32, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    iconWrapper: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255, 215, 0, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' },
    fireBadge: { position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#1C1C1E' },
    title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
    subtitle: { color: '#8E8E93', fontSize: 16, fontWeight: '500', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
    rewardBadge: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 100, marginBottom: 32 },
    rewardText: { color: '#34C759', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
    claimBtn: { backgroundColor: '#007AFF', width: '100%', height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    claimBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
