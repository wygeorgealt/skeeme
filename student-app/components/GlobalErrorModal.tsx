import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { DangerTriangle } from '@solar-icons/react-native/Bold';

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
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                justifyContent: 'flex-end',
                zIndex: 1000,
            }}
        >
            {/* Backdrop */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onDismiss}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            />

            {/* Bottom Sheet */}
            <View
                style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingHorizontal: 24,
                    paddingTop: 28,
                    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
                }}
            >
                {/* Handle */}
                <View style={{ width: 40, height: 4, backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

                {/* Icon */}
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
                    <DangerTriangle size={28} color="#FF3B30" />
                </View>

                {/* Copy */}
                <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
                    Something went wrong
                </Text>
                <Text style={{ color: isDark ? '#8E8E93' : '#8E8E93', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 }}>
                    {error || 'Skeeme is currently down. Please try again later.'}
                </Text>

                {/* Primary CTA */}
                <TouchableOpacity
                    onPress={onDismiss}
                    activeOpacity={0.9}
                    style={{
                        backgroundColor: '#007AFF',
                        height: 56,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900' }}>
                        Okay
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
