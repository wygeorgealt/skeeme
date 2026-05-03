import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, TouchableOpacity, useColorScheme, Share, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CircleArrowUp02Icon, Share01Icon } from '@hugeicons/core-free-icons';

import { router } from 'expo-router';
import { api } from '@/lib/api';
import RevenueCatUI from 'react-native-purchases-ui';
import { useAuthStore } from '@/store/authStore';

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

    const handleUpgrade = async () => {
        try {
            await RevenueCatUI.presentPaywall();
            // Refresh user status after paywall dismisses
            await useAuthStore.getState().checkAuth();
        } catch (e) {}
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

    const user = useAuthStore((s) => s.user);

    let titleText = "You've been working hard.";
    let descText = "You've used all your credits for now — that means you've been studying seriously. Keep the momentum going.";

    if (user?.next_free_refill_at) {
        titleText = "Out of credits.";
        try {
            const date = new Date(user.next_free_refill_at);
            const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            descText = `You're out of free credits for now. They will renew by ${timeString}. Upgrade to Pro to keep going immediately!`;
        } catch (e) {
            // fallback if date parsing fails
            descText = "You're out of free credits for now. They will renew soon. Upgrade to Pro to keep going immediately!";
        }
    }

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
                    <HugeiconsIcon icon={CircleArrowUp02Icon} size={28} color="#8B5CF6" />

                </View>

                {/* Copy */}
                <Text style={{ color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
                    {titleText}
                </Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 }}>
                    {descText}
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
                        Upgrade to keep going →
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
                        <HugeiconsIcon icon={Share01Icon} size={16} color={isDark ? '#CBD5E1' : '#475569'} />
                        <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 13, fontWeight: '700' }}>
                            Refer a friend
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* No 'I'll study later' — user must upgrade to continue */}
                <View style={{ height: 24 }} />

            </View>
        </View>
    );
}
