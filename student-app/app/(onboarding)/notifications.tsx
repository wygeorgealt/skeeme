import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, ScrollView, Platform } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Radius } from '@/constants/theme';
import * as Notifications from 'expo-notifications';
import Bell from '@/assets/icons/pikaicons/notification-bell-on.svg';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';

export default function NotificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isPreview = params.preview === 'true';
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const [isSubmitting, setIsSubmitting] = useState(false);

    const goToOnboardingLoading = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.replace(`/(onboarding)/onboarding-loading?preview=${isPreview ? 'true' : 'false'}`);
    };

    const handleEnableNotifications = async () => {
        if (isSubmitting) return;

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.warn('Notification permission failed', e);
        }

        setTimeout(() => {
            goToOnboardingLoading();
        }, 500);
    };

    const handleSkip = async () => {
        if (isSubmitting) return;
        await goToOnboardingLoading();
    };

    const SkipButton = (
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={s.skipBtn}>
            <Text style={[s.skipBtnText, { color: C.textSecondary }]}>Not now</Text>
        </TouchableOpacity>
    );

    return (
        <OnboardingShell
            step={10}
            totalSteps={10}
            stepLabel="Finally"
            title="Stay on track—on autopilot."
            subtitle="Get timely reminders before your exams to keep your streak alive."
            ctaTitle="Enable Notifications"
            onCta={handleEnableNotifications}
            footerExtra={SkipButton}
            showBack={false}
        >
            {/* iOS-style single notification */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={s.illustrationSection}>
                <View style={[s.glow, { backgroundColor: '#007AFF', opacity: 0.18 }]} />

                <Animated.View
                    entering={FadeInDown.duration(700).delay(300).springify()}
                    style={[
                        s.iosCard,
                        {
                            backgroundColor: isDark ? 'rgba(22, 22, 28, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                    ]}
                >
                    <View style={s.iosTopRow}>
                        <View style={[s.appDot, { backgroundColor: '#007AFF' }]}>
                            <Bell width={12} height={12} color="#FFFFFF" />
                        </View>
                        <Text style={[s.appName, { color: C.textSecondary }]}>Skeeme</Text>
                        <Text style={[s.timeText, { color: C.textSecondary }]}>now</Text>
                    </View>

                    <Text style={[s.title, { color: C.text }]}>Study Reminder</Text>
                    <Text style={[s.body, { color: C.textSecondary }]}>
                        Time to review your flashcards. Keep your streak alive.
                    </Text>

                    <View style={[s.banner, { backgroundColor: isDark ? 'rgba(0,122,255,0.25)' : 'rgba(0,122,255,0.14)' }]}>
                        <Text style={[s.bannerText, { color: isDark ? '#93C5FD' : '#2563EB' }]}>Review in 10 minutes</Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </OnboardingShell>
    );
}

const s = StyleSheet.create({
    illustrationSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 24,
        position: 'relative',
        minHeight: 280,
    },
    glow: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        opacity: 0.15,
        transform: [{ scale: 1.3 }],
    },

    iosCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
    },

    iosTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    appDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: { fontSize: 13, fontWeight: '700', flex: 1 },
    timeText: { fontSize: 12, fontWeight: '500' },

    title: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
    body: { fontSize: 14, lineHeight: 20 },

    banner: {
        marginTop: 12,
        borderRadius: 14,
        paddingVertical: 9,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerText: { fontSize: 12, fontWeight: '800' },

    skipBtn: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    skipBtnText: {
        fontSize: 17,
        fontWeight: '600',
    },
});
