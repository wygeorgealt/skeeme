import { Text } from '@/components/ui/Text';
import React, { useEffect } from 'react';
import { View, TouchableOpacity, useColorScheme, Share, Platform, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import RoundArrowUp from '@/assets/icons/pikaicons/arrow-up.svg';
import Forward from '@/assets/icons/pikaicons/arrow-right.svg';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInDown, 
    SlideOutDown 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OutOfCreditsModalProps {
    visible: boolean;
    onDismiss: () => void;
    featureAttempted: 'scan' | 'quiz' | 'flashcard';
}

export default function OutOfCreditsModal({ visible, onDismiss, featureAttempted }: OutOfCreditsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const user = useAuthStore((s) => s.user);

    const [timeLeft, setTimeLeft] = React.useState('');

    // Log the event to backend
    const logEvent = async () => {
        try {
            await api.post('credits/out-of-credits', { feature_attempted: featureAttempted });
        } catch {
            // Silent fail
        }
    };

    useEffect(() => {
        if (visible) logEvent();
    }, [visible]);

    useEffect(() => {
        if (!user?.next_free_refill_at) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const refillTime = user.next_free_refill_at ? new Date(user.next_free_refill_at).getTime() : 0;
            const diff = refillTime - now;

            if (diff <= 0) {
                setTimeLeft('Now!');
                clearInterval(timer);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${mins}m ${secs}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [user?.next_free_refill_at]);

    if (!visible) return null;

    const handleUpgrade = () => {
        onDismiss();
        router.push('/paywall');
    };

    const handleShare = async () => {
        try {
            const res = await api.get('referral/my-code');
            await Share.share({
                message: res.data.share_text,
            });
        } catch {
            await Share.share({
                message: "I've been using Skeeme to study smarter — it builds quizzes and flashcards from my notes using AI. Download: https://skeeme.com/students",
            });
        }
    };

    let titleText = "You've been working hard.";
    let descText = "But you've used all your credits for now. Keep the momentum going.";

    if (user?.plan_name === 'pro' || user?.plan_name === 'max') {
        titleText = "Credits Exhausted";
        descText = "You've used your daily credits. Don't worry, your plan gives you a 500 credit refill every day.";
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View 
                    entering={FadeIn} 
                    exiting={FadeOut} 
                    style={StyleSheet.absoluteFill}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
                        <BlurView 
                            intensity={25} 
                            style={StyleSheet.absoluteFill} 
                            tint={isDark ? 'dark' : 'light'} 
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                    </Pressable>
                </Animated.View>

                {/* Bottom Sheet */}
                <Animated.View
                    entering={SlideInDown.springify().damping(20).stiffness(150)}
                    exiting={SlideOutDown}
                    style={[
                        styles.sheet,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />

                    <View style={styles.content}>
                        <View style={[
                            styles.iconWrapper, 
                            { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)' }
                        ]}>
                            <AnimatedIcon source={require('@/assets/3dicons/3dicons-wallet-front-color.png')} size={48} animationType="wobble" />
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {titleText}
                        </Text>
                        
                        <Text style={styles.message}>
                            {descText}
                        </Text>

                        {/* Refill Timer UI */}
                        {user?.next_free_refill_at && (
                            <View style={[styles.timerBox, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.05)' }]}>
                                <AnimatedIcon source={require('@/assets/3dicons/3dicons-clock-front-color.png')} size={20} animationType="spin" />
                                <Text style={styles.timerLabel}>REFILL IN: </Text>
                                <Text style={styles.timerValue}>{timeLeft || '--:--:--'}</Text>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                            {user?.plan_name !== 'pro' && user?.plan_name !== 'max' && (
                                <AnimatedButton
                                    title="Upgrade to Pro"
                                    onPress={handleUpgrade}
                                    type="capsule"
                                    backgroundColor="#007AFF"
                                    shadowColor="#0066D6"
                                    fullWidth
                                />
                            )}

                            <TouchableOpacity
                                onPress={() => {
                                    onDismiss();
                                    // Small delay to ensure the OutOfCreditsModal is fully dismissed 
                                    setTimeout(() => {
                                        router.push('/referral');
                                    }, 500);
                                }}
                                activeOpacity={0.8}
                                style={user?.plan_name === 'pro' || user?.plan_name === 'max' ? styles.primaryBtn : [styles.secondaryBtn, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}
                            >
                                <Forward width={20} height={20} color={user?.plan_name === 'pro' || user?.plan_name === 'max' ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')} />
                                <Text style={user?.plan_name === 'pro' || user?.plan_name === 'max' ? styles.primaryBtnText : [styles.secondaryBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                    Earn more credits
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        width: width,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 24,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    message: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryBtn: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
    },
    secondaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
    },
    timerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 32,
    },
    timerLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#34C759',
        marginLeft: 8,
    },
    timerValue: {
        fontSize: 14,
        fontWeight: '900',
        color: '#34C759',
    },
});
