import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { api } from '@/lib/api';

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitOnboarding = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
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
        router.replace('/paywall?fromOnboarding=true');
    };

    const handleEnableNotifications = async () => {
        if (isSubmitting) return;
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.warn('Notification permission failed', e);
        }
        
        // Wait a moment so the user sees any interaction or the modal before navigating away
        setTimeout(() => {
            submitOnboarding();
        }, 500);
    };

    const handleSkip = async () => {
        if (isSubmitting) return;
        await submitOnboarding();
    };

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>
            <SafeAreaView style={s.safeArea}>

                {/* Visual Illustration */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={s.illustrationSection}>
                    {/* Decorative Background Glow */}
                    <View style={[s.glow, { backgroundColor: '#007AFF' }]} />
                    
                    {/* Mock Notification 1 */}
                    <Animated.View 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={[s.mockNotification, { 
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            transform: [{ rotate: '-2deg' }, { translateY: -20 }] 
                        }]}
                    >
                        <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={s.mockHeader}>
                            <View style={[s.mockIconBadge, { backgroundColor: '#007AFF' }]}>
                                <HugeiconsIcon icon={Notification01Icon} size={14} color="#FFF" />
                            </View>
                            <Text style={[s.mockAppName, { color: C.textSecondary }]}>Skeeme</Text>
                            <Text style={[s.mockTime, { color: C.textSecondary }]}>now</Text>
                        </View>
                        <Text style={[s.mockTitle, { color: C.text }]}>Study Reminder 📚</Text>
                        <Text style={[s.mockBody, { color: C.textSecondary }]}>Time to review your Biology flashcards. Keep your streak alive!</Text>
                    </Animated.View>

                    {/* Mock Notification 2 */}
                    <Animated.View 
                        entering={FadeInDown.duration(800).delay(600).springify()}
                        style={[s.mockNotification, { 
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            transform: [{ rotate: '2deg' }, { translateY: 10 }] 
                        }]}
                    >
                        <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={s.mockHeader}>
                            <View style={[s.mockIconBadge, { backgroundColor: '#10B981' }]}>
                                <HugeiconsIcon icon={Tick01Icon} size={14} color="#FFF" />
                            </View>
                            <Text style={[s.mockAppName, { color: C.textSecondary }]}>Skeeme</Text>
                            <Text style={[s.mockTime, { color: C.textSecondary }]}>1h ago</Text>
                        </View>
                        <Text style={[s.mockTitle, { color: C.text }]}>Goal Reached 🎯</Text>
                        <Text style={[s.mockBody, { color: C.textSecondary }]}>Awesome work! You scored 100% on your Physics quiz.</Text>
                    </Animated.View>
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
                        <HugeiconsIcon icon={Notification01Icon} size={18} color="#FFFFFF" />
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

    // Illustration Section
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
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.15,
        transform: [{ scale: 1.5 }],
    },
    mockNotification: {
        width: '100%',
        maxWidth: 320,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
        marginVertical: -10,
    },
    mockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    mockIconBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    mockAppName: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    mockTime: {
        fontSize: 12,
        fontWeight: '400',
    },
    mockTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    mockBody: {
        fontSize: 14,
        lineHeight: 20,
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
