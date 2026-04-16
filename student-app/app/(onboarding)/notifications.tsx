import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Notifications from 'expo-notifications';
import { api } from '@/lib/api';

// Placeholder screen recording video — replace with your actual notification demo
const NOTIFICATION_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

export default function NotificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { setOnboardingStep, completeOnboarding, onboardingData, user } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    const player = useVideoPlayer(NOTIFICATION_VIDEO, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    const submitOnboarding = async () => {
        // Send personalization data to the backend
        try {
            await api.post('me/onboarding', {
                education_level: onboardingData.education_level,
                field_of_study: onboardingData.field_of_study,
                dob_month: onboardingData.dob_month,
                dob_year: onboardingData.dob_year,
                age: onboardingData.age,
            });
        } catch (e) {
            if (__DEV__) console.warn('Failed to submit onboarding data', e);
        }
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    const handleEnableNotifications = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.warn('Notification permission failed', e);
        }
        await submitOnboarding();
    };

    const handleSkip = async () => {
        await submitOnboarding();
    };

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>
            <SafeAreaView style={s.safeArea}>

                {/* Video Preview */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={s.videoSection}>
                    <View style={[s.phoneFrame, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                        <VideoView
                            player={player}
                            style={s.video}
                            nativeControls={false}
                            contentFit="cover"
                        />
                    </View>
                </Animated.View>

                {/* Text */}
                <Animated.View entering={FadeInDown.duration(600).delay(400)} style={s.textSection}>
                    <Text style={[s.title, { color: C.text }]}>
                        Never miss a study session
                    </Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        Get smart reminders and tips to keep you on track. You can change this later in Settings.
                    </Text>
                </Animated.View>

                {/* Buttons */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)} style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        onPress={handleEnableNotifications}
                        activeOpacity={0.8}
                        style={s.primaryBtn}
                    >
                        <IconSymbol name="bell.fill" size={18} color="#FFFFFF" />
                        <Text style={s.primaryBtnText}>Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        activeOpacity={0.7}
                        style={s.skipBtn}
                    >
                        <Text style={[s.skipBtnText, { color: C.textSecondary }]}>Not now</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Video Section
    videoSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 24,
    },
    phoneFrame: {
        width: 240,
        height: 420,
        borderRadius: 32,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    video: {
        width: '100%',
        height: '100%',
    },

    // Text
    textSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#007AFF',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    },
    skipBtn: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipBtnText: {
        fontSize: 17,
        fontWeight: '600',
    },
});
