import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, Share, Platform } from 'react-native';
import { FireFlame, ShareAndroid } from 'iconoir-react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';

interface OutOfCreditsModalProps {
    visible: boolean;
    onDismiss: () => void;
    featureAttempted: 'scan' | 'quiz' | 'flashcard';
}

export default function OutOfCreditsModal({ visible, onDismiss, featureAttempted }: OutOfCreditsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Log the event to backend
    const logEvent = async () => {
        try {
            await api.post('credits/out-of-credits', { feature_attempted: featureAttempted });
        } catch {
            // Silent fail
        }
    };

    React.useEffect(() => {
        if (visible) logEvent();
    }, [visible]);

    if (!visible) return null;

    const handleUpgrade = () => {
        onDismiss();
        router.push('/upgrade');
    };

    const handleShare = async () => {
        try {
            const res = await api.get('referral/my-code');
            await Share.share({
                message: res.data.share_text,
            });
        } catch {
            // Fallback share without code
            await Share.share({
                message: "I've been using Skeeme to study smarter — it builds quizzes and flashcards from my notes using AI. Download: https://skeeme.com/students",
            });
        }
    };

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                justifyContent: 'flex-end',
                zIndex: 999,
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
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingHorizontal: 24,
                    paddingTop: 28,
                    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
                }}
            >
                {/* Handle */}
                <View style={{ width: 40, height: 4, backgroundColor: isDark ? '#475569' : '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

                {/* Icon */}
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF620', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
                    <FireFlame width={28} height={28} color="#8B5CF6" />
                </View>

                {/* Copy */}
                <Text style={{ color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
                    You've been working hard.
                </Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 }}>
                    You've used all your credits for now — that means you've been studying seriously. Keep the momentum going.
                </Text>

                {/* Primary CTA */}
                <TouchableOpacity
                    onPress={handleUpgrade}
                    activeOpacity={0.9}
                    style={{
                        backgroundColor: '#8B5CF6',
                        height: 56,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900' }}>
                        Top up and keep going →
                    </Text>
                </TouchableOpacity>

                {/* Secondary CTAs */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleUpgrade}
                        activeOpacity={0.8}
                        style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? '#334155' : '#F1F5F9',
                        }}
                    >
                        <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 13, fontWeight: '700' }}>
                            View plans
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleShare}
                        activeOpacity={0.8}
                        style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? '#334155' : '#F1F5F9',
                            flexDirection: 'row',
                            gap: 6,
                        }}
                    >
                        <ShareAndroid width={16} height={16} color={isDark ? '#CBD5E1' : '#475569'} />
                        <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 13, fontWeight: '700' }}>
                            Refer a friend
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Dismiss */}
                <TouchableOpacity onPress={onDismiss} style={{ marginTop: 16, alignSelf: 'center', paddingVertical: 8 }}>
                    <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                        I'll study later
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
