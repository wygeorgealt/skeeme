import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, Platform, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const OFFLINE_ICON = require('../assets/3dicons/3dicons-wifi-front-color.png');
const ERROR_ICON = require('../assets/3dicons/warning-3d icon.png');

interface GlobalErrorModalProps {
    visible: boolean;
    error: string | null;
    onDismiss: () => void;
    onContinueOffline?: () => void;
    onRetry?: () => void;
    retrying?: boolean;
}

export default function GlobalErrorModal({ visible, error, onDismiss, onContinueOffline, onRetry, retrying = false }: GlobalErrorModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isOffline = error?.toLowerCase().includes('offline') || error?.toLowerCase().includes('internet');
    const title = isOffline ? 'You’re offline' : 'Skeeme is unavailable';
    const badgeLabel = isOffline ? 'NO INTERNET CONNECTION' : 'SERVICE STATUS';
    const badgeColor = isOffline ? '#FF9500' : '#FF3B30';
    const badgeBg = isOffline
        ? (isDark ? 'rgba(255, 149, 0, 0.16)' : 'rgba(255, 149, 0, 0.1)')
        : (isDark ? 'rgba(255, 59, 48, 0.16)' : 'rgba(255, 59, 48, 0.1)');
    const iconBoxBg = isOffline
        ? (isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)')
        : (isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)');
    const iconSource = isOffline ? OFFLINE_ICON : ERROR_ICON;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
        >
            <View style={styles.container}>
                {/* Backdrop with Blur */}
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={StyleSheet.absoluteFill}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
                        <BlurView 
                            intensity={25} 
                            style={StyleSheet.absoluteFill} 
                            tint={isDark ? 'dark' : 'light'} 
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
                    </Pressable>
                </Animated.View>

                {/* The Actual Bottom Sheet */}
                <Animated.View
                    entering={SlideInDown.springify().damping(20).stiffness(150)}
                    exiting={SlideOutDown.duration(180)}
                    style={[
                        styles.sheet,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />

                    <View style={styles.content}>
                        <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
                            <AnimatedIcon
                                source={iconSource}
                                size={52}
                                animationType={isOffline ? 'twist' : 'wobble'}
                            />
                        </View>

                        <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
                            <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
                            <Text style={[styles.statusPillText, { color: badgeColor }]}>
                                {badgeLabel}
                            </Text>
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {title}
                        </Text>
                        
                        <Text style={[styles.message, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                            {error || 'Skeeme is having trouble connecting to the servers. Please check your connection and try again.'}
                        </Text>

                        <View style={styles.actions}>
                            <AnimatedButton
                                title={onRetry ? (retrying ? 'Checking connection…' : 'Try Again') : 'Got it'}
                                onPress={onRetry || onDismiss}
                                loading={retrying}
                                loadingText="Checking connection…"
                                type="capsule"
                                backgroundColor="#007AFF"
                                shadowColor="#0066D6"
                                fullWidth
                            />

                            {onRetry ? (
                                <TouchableOpacity
                                    onPress={isOffline ? (onContinueOffline || onDismiss) : onDismiss}
                                    activeOpacity={0.75}
                                    style={[
                                        styles.secondaryBtn,
                                        { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }
                                    ]}
                                >
                                    <Text style={[styles.secondaryBtnText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
                                        {isOffline ? 'Continue offline' : 'Dismiss'}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
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
        paddingBottom: Platform.OS === 'ios' ? 42 : 30,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 22,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconBox: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        marginBottom: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15.5,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        paddingHorizontal: 8,
    },
    actions: {
        width: '100%',
        gap: 6,
    },
    secondaryBtn: {
        width: '100%',
        height: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
