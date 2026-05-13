import { Text } from '@/components/ui/Text';
import React from 'react';
import { Modal as ReanimatedModal } from 'react-native-reanimated-modal';
import { View, TouchableOpacity, StyleSheet, Dimensions, useColorScheme } from 'react-native';

import { BlurView } from 'expo-blur';
import { CupStar } from '@solar-icons/react-native/Bold';

import Animated, { FadeInUp, ZoomIn, FadeOutDown } from 'react-native-reanimated';

interface RewardModalProps {
    isVisible: boolean;
    onClose: () => void;
    reward: {
        credits: number;
        milestone: number;
        message: string;
    } | null;
}

const { width } = Dimensions.get('window');

export const RewardModal: React.FC<RewardModalProps> = ({ isVisible, onClose, reward }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!reward) return null;

    return (
        <ReanimatedModal
            visible={isVisible}
            onHide={onClose}
            animation="fade"
            backdrop={<BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />}
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeInUp.springify()}
                    exiting={FadeOutDown}
                    style={[
                        styles.modalContainer,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                >
                    <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <CupStar size={50} color="#FFD700" />
                        </View>
                    </Animated.View>

                    <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        Streak Reward!
                    </Text>

                    <Text style={styles.creditText}>
                        +{reward.credits} Credits
                    </Text>

                    <Text style={[styles.message, { color: isDark ? '#AEAEB2' : '#636366' }]}>
                        {reward.message}
                    </Text>

                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.button}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Awesome!</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </ReanimatedModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'Outfit-Bold',
    },
    creditText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFD700',
        marginBottom: 16,
        fontFamily: 'Outfit-Black',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontFamily: 'Outfit-Regular',
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFD700',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Outfit-SemiBold',
    },
});
