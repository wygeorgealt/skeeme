import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import Share from '@/assets/icons/pikaicons/send-plane-horizontal.svg';
import Dislike from '@/assets/icons/pikaicons/minus-circle.svg'; // Using Dislike/Like or just an icon for Feedback

import { useRouter } from 'expo-router';

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    onShare: () => void;
    isDark: boolean;
}

export function ShareModal({ visible, onClose, onShare, isDark }: ShareModalProps) {
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();

    const handleFeedback = () => {
        onClose();
        setTimeout(() => {
            router.push('/support' as any);
        }, 300);
    };

    const handleShare = () => {
        onClose();
        setTimeout(() => {
            onShare();
        }, 300);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={[styles.sheet, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: isDark ? '#334155' : '#cbd5e1' }]} />
                        </View>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity style={styles.optionBtn} onPress={handleShare}>
                                <Share width={24} height={24} color={isDark ? '#f8fafc' : '#0f172a'} />
                                <Text style={[styles.optionText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionBtn} onPress={handleFeedback}>
                                <Dislike width={24} height={24} color={isDark ? '#f8fafc' : '#0f172a'} />
                                <Text style={[styles.optionText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Feedback</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        paddingTop: 12,
        paddingHorizontal: 24,
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    optionsContainer: {
        gap: 24,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    optionText: {
        fontSize: 17,
        fontWeight: '600',
    }
});
