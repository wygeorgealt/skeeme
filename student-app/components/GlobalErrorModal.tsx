import { Text } from '@/components/ui/Text';
import React, { useEffect } from 'react';
import { View, TouchableOpacity, useColorScheme, Platform, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { DangerTriangle } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { BlurView } from 'expo-blur';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface GlobalErrorModalProps {
    visible: boolean;
    error: string | null;
    onDismiss: () => void;
}

export default function GlobalErrorModal({ visible, error, onDismiss }: GlobalErrorModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!visible) return null;

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

                {/* The Actual Bottom Sheet */}
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
                            styles.iconBox, 
                            { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)' }
                        ]}>
                            <AnimatedIcon source={require('@/assets/3dicons/warning-3d icon.png')} size={48} animationType="wobble" />
                        </View>

                        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            Connection Error
                        </Text>
                        
                        <Text style={styles.message}>
                            {error || 'Skeeme is having trouble connecting to the servers. Please try again.'}
                        </Text>

                        <TouchableOpacity
                            onPress={onDismiss}
                            activeOpacity={0.8}
                            style={styles.btn}
                        >
                            <Text style={styles.btnText}>Got it</Text>
                        </TouchableOpacity>
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
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        // No shadows or extra borders to prevent "ghost cards"
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
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
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
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    btn: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 62,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
