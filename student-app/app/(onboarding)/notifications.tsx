import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Bell } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

export default function NotificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isPreview = params.preview === 'true';
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

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

    return (
        <SafeAreaView style={[s.container, { backgroundColor: C.background }]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <View style={s.stepRow}>
                        <Text style={[s.stepText, { color: '#007AFF' }]}>Finally</Text>
                        <View style={s.progressBar}>
                            <View style={[s.progressFill, { width: '100%', backgroundColor: '#007AFF' }]} />
                        </View>
                    </View>
                </View>

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
                                <Bell size={12} color="#FFFFFF" />
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

                {/* Text */}
                <Animated.View entering={FadeInDown.duration(600).delay(420)} style={s.textSection}>
                    <Text style={[s.titleBig, { color: C.text }]}>Stay on track—on autopilot.</Text>
                </Animated.View>

                {/* Buttons */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)} style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        onPress={handleEnableNotifications}
                        activeOpacity={0.85}
                        style={s.primaryBtn}
                    >
                        <AnimatedIcon 
                            source={require('@/assets/3dicons/3dicons-bell-front-color.png')} 
                            size={24} 
                            animationType="wobble"
                        />
                        <Text style={s.primaryBtnText}>Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={s.skipBtn}>
                        <Text style={[s.skipBtnText, { color: C.textSecondary }]}>Not now</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    illustrationSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
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

    // Text
    textSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
        marginBottom: 32,
    },
    titleBig: {
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

    headerSection: { paddingHorizontal: 24, paddingBottom: 12 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    stepText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
});
