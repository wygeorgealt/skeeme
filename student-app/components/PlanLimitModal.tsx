import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { Icon } from '@/components/ui/Icon';
import { router } from 'expo-router';
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

type PlanLimitFeature = 'scan' | 'quiz' | 'flashcard' | 'chat' | 'summary';
type IconName = React.ComponentProps<typeof Icon>['name'];

interface PlanLimitModalProps {
    visible: boolean;
    onDismiss: () => void;
    featureAttempted: PlanLimitFeature;
}

const featureDetails: Record<PlanLimitFeature, { free: string; pro: string; icon: IconName }> = {
    chat: { free: '2 tutor chats', pro: '200 tutor chats', icon: 'MessageSquare' },
    scan: { free: '1 scan and solve', pro: '30 scans and solves', icon: 'ScanLine' },
    quiz: { free: '1 quiz of up to 10 questions', pro: '30 quizzes', icon: 'CircleHelp' },
    flashcard: { free: '1 flashcard set of up to 10 cards', pro: '30 flashcard sets', icon: 'Layers' },
    summary: { free: '1 study summary', pro: '30 study summaries', icon: 'FileText' },
};

export default function PlanLimitModal({ visible, onDismiss, featureAttempted }: PlanLimitModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const user = useAuthStore((s) => s.user);
    const planName = user?.plan_name?.toLowerCase() || 'free';
    const isPro = planName !== 'free';
    const detail = featureDetails[featureAttempted];

    if (!visible) return null;

    const handleUpgrade = () => {
        onDismiss();
        router.push('/paywall');
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
            <View style={styles.container}>
                <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
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

                <Animated.View
                    entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
                    exiting={SlideOutDown.duration(180).easing(Easing.in(Easing.cubic))}
                    style={[styles.sheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                >
                    <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />
                    <View style={styles.content}>
                        <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#252528' : '#F5F5F7' }]}>
                            <Icon name={detail.icon} size={32} color="default" />
                        </View>
                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {isPro ? 'Daily fair-use limit reached' : "You've reached today's Free limit"}
                        </Text>
                        <Text style={styles.message}>
                            {isPro
                                ? `You've reached today's limit for ${detail.pro.toLowerCase()}. Your allowance resets at midnight UTC.`
                                : `Free includes ${detail.free} per day. Your allowance resets at midnight UTC. Skeeme Pro includes ${detail.pro} per day.`}
                        </Text>
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
                                <TouchableOpacity onPress={onDismiss} activeOpacity={0.8} style={styles.primaryBtn}>
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
    container: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        width,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingTop: 14,
        paddingBottom: 44,
    },
    handle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 24 },
    content: { paddingHorizontal: 28, alignItems: 'center' },
    iconWrapper: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
    message: { color: '#8E8E93', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 23, marginBottom: 28 },
    actions: { width: '100%' },
    primaryBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
