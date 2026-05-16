import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, Platform, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { RoundArrowUp, Stopwatch } from '@solar-icons/react-native/Bold';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInDown, 
    SlideOutDown 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface CooldownModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function CooldownModal({ visible, onDismiss }: CooldownModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const user = useAuthStore((s) => s.user);

    if (!visible) return null;

    const handleUpgrade = () => {
        onDismiss();
        router.push('/paywall');
    };

    const isFree = user?.plan_name !== 'pro' && user?.plan_name !== 'max';

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
                            { backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.08)' }
                        ]}>
                            <Stopwatch size={32} color="#FF9500" />
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            Whoa, slow down!
                        </Text>
                        
                        <Text style={styles.message}>
                            You are generating material a bit too fast. Please wait a minute to let the AI cool down.
                        </Text>

                        {/* Actions */}
                        <View style={styles.actions}>
                            {isFree && (
                                <TouchableOpacity
                                    onPress={handleUpgrade}
                                    activeOpacity={0.8}
                                    style={styles.primaryBtn}
                                >
                                    <RoundArrowUp size={20} color="#FFFFFF" />
                                    <Text style={styles.primaryBtnText}>
                                        Upgrade to Pro (15/min limit)
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={onDismiss}
                                activeOpacity={0.8}
                                style={!isFree ? styles.primaryBtn : [styles.secondaryBtn, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}
                            >
                                <Text style={!isFree ? styles.primaryBtnText : [styles.secondaryBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                    Okay, I'll wait
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
        backgroundColor: '#FF9500',
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
});
