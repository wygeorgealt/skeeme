import { Text } from '@/components/ui/Text';
import React, { useEffect } from 'react';
import { View, TouchableOpacity, useColorScheme, Share, Platform, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { Icon } from '@/components/ui/Icon';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInDown, 
    SlideOutDown,
    Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OutOfCreditsModalProps {
    visible: boolean;
    onDismiss: () => void;
    featureAttempted: 'scan' | 'quiz' | 'flashcard' | 'chat';
}

export default function OutOfCreditsModal({ visible, onDismiss, featureAttempted }: OutOfCreditsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const user = useAuthStore((s) => s.user);

    const [timeLeft, setTimeLeft] = React.useState('');

    // Log the event to backend
    const logEvent = async () => {
        // Only log if they are actually out of credits (ignore upsell popups)
        if (featureAttempted !== 'chat' && user && (user.credits ?? 0) > 0) return;
        
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
        if (!visible) return;
        if (featureAttempted !== 'chat' && !user?.next_free_refill_at) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            let refillTime = 0;

            if (featureAttempted === 'chat') {
                const nextDay = new Date();
                nextDay.setHours(24, 0, 0, 0);
                refillTime = nextDay.getTime();
            } else if (user?.next_free_refill_at) {
                refillTime = new Date(user.next_free_refill_at).getTime();
            }

            const diff = refillTime - now;

            if (diff <= 0) {
                setTimeLeft('Now!');
                return false;
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${mins}m ${secs}s`);
                return true;
            }
        };

        updateCountdown();
        const timer = setInterval(() => {
            if (!updateCountdown()) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [visible, featureAttempted, user?.next_free_refill_at]);

    if (!visible) return null;

    const handleUpgrade = () => {
        onDismiss();
        router.push('/paywall');
    };

    const isPro = user?.plan_name === 'pro' || user?.plan_name === 'max';

    let titleText = "You've been working hard.";
    let descText = "But you've used all your credits for now. Keep the momentum going.";
    let iconName: any = "Wallet";

    if (featureAttempted === 'chat') {
        titleText = "Ur limit has reached";
        descText = "You've used your 2 free messages for today. Upgrade to Pro for unlimited messages.";
        iconName = "MessageSquare";
    } else if (isPro) {
        titleText = "Credits Exhausted";
        descText = "You've used your daily credits. Don't worry, your plan gives you a 500 credit refill every day.";
        iconName = "Wallet";
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
                    entering={FadeIn.duration(180)} 
                    exiting={FadeOut.duration(150)} 
                    style={StyleSheet.absoluteFill}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
                        <BlurView 
                            intensity={5} 
                            blurMethod="dimezisBlurView"
                            style={StyleSheet.absoluteFill} 
                            tint={isDark ? 'dark' : 'light'} 
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.18)' }]} />
                    </Pressable>
                </Animated.View>

                {/* Bottom Sheet */}
                <Animated.View
                    entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
                    exiting={SlideOutDown.duration(180).easing(Easing.in(Easing.cubic))}
                    style={[
                        styles.sheet,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />

                    <View style={styles.content}>
                        <View style={[
                            styles.iconWrapper, 
                            { backgroundColor: isDark ? '#252528' : '#F5F5F7' }
                        ]}>
                            <Icon name={iconName} size={32} color="default" />
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {titleText}
                        </Text>
                        
                        <Text style={styles.message}>
                            {descText}
                        </Text>

                        {/* Refill Timer UI */}
                        {(featureAttempted === 'chat' || user?.next_free_refill_at) && (
                            <View style={[styles.timerBox, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.05)' }]}>
                                <Icon name="Clock" size={18} color="#34C759" />
                                <Text style={styles.timerLabel}>REFILL IN: </Text>
                                <Text style={styles.timerValue}>{timeLeft || '--:--:--'}</Text>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                            {!isPro ? (
                                <AnimatedButton
                                    title="Upgrade to Pro"
                                    onPress={handleUpgrade}
                                    type="capsule"
                                    backgroundColor="#007AFF"
                                    shadowColor="#0066D6"
                                    fullWidth
                                />
                            ) : (
                                <TouchableOpacity
                                    onPress={onDismiss}
                                    activeOpacity={0.8}
                                    style={styles.primaryBtn}
                                >
                                    <Text style={styles.primaryBtnText}>Got it</Text>
                                </TouchableOpacity>
                            )}
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
        width: 68,
        height: 68,
        borderRadius: 34,
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
