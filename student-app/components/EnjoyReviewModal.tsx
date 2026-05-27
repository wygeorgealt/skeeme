import { Text } from '@/components/ui/Text';
import React from 'react';
import {
    View,
    TouchableOpacity,
    useColorScheme,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { CupStar, Like, Dislike } from '@solar-icons/react-native/Bold';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import {
    handleReviewPositive,
    handleReviewLater,
    handleReviewDecline,
} from '@/lib/storeReview';

interface EnjoyReviewModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function EnjoyReviewModal({ visible, onDismiss }: EnjoyReviewModalProps) {
    const isDark = useColorScheme() === 'dark';

    if (!visible) return null;

    const close = () => onDismiss();

    const onYes = async () => {
        close();
        await handleReviewPositive();
    };

    const onLater = async () => {
        close();
        await handleReviewLater();
    };

    const onNoThanks = async () => {
        close();
        await handleReviewDecline();
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onLater}>
            <View style={styles.container}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onLater}>
                        <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
                    </Pressable>
                </Animated.View>

                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={ZoomOut}
                    style={[styles.modal, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.18)' : 'rgba(0, 122, 255, 0.1)' }]}>
                        <CupStar size={40} color="#007AFF" />
                    </View>

                    <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        Enjoying Skeeme?
                    </Text>
                    <Text style={styles.subtitle}>
                        Your feedback helps us improve study tools for students like you.
                    </Text>

                    <TouchableOpacity onPress={onYes} activeOpacity={0.85} style={styles.primaryBtn}>
                        <Like size={20} color="#FFFFFF" />
                        <Text style={styles.primaryBtnText}>Yes, love it!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onLater}
                        activeOpacity={0.7}
                        style={[styles.secondaryBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' }]}
                    >
                        <Text style={[styles.secondaryBtnText, { color: isDark ? '#FFFFFF' : '#3C3C43' }]}>
                            Maybe later
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNoThanks} activeOpacity={0.7} style={styles.tertiaryBtn}>
                        <Dislike size={16} color="#8E8E93" />
                        <Text style={styles.tertiaryBtnText}>No thanks</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    modal: {
        width: '100%',
        borderRadius: 28,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    primaryBtn: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    secondaryBtn: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    secondaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    tertiaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
    },
    tertiaryBtnText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '600',
    },
});
