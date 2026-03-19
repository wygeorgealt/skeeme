import { View, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const REASONS = [
    { icon: 'trophy-outline' as const, text: 'Approaching a credit reward milestone' },
    { icon: 'flame-outline' as const, text: 'Streak about to reset' },
    { icon: 'battery-half-outline' as const, text: 'Credits running low' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, completeOnboarding } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(8);
    }, []);

    const handleEnable = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('[Onboarding] Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.error('[Onboarding] Failed to request notifications', e);
        }
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    return (
        <View className={`flex-1 px-8 pt-16 pb-8 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center mb-10">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-6 shadow-sm ${isDark ? 'bg-[#1c1c1e] border border-slate-800' : 'bg-white border border-slate-100'}`}>
                    <Ionicons name="notifications-outline" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </View>
                <Text className={`text-[28px] font-semibold tracking-tight text-center leading-[34px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Don't break your streak.
                </Text>
                <Text className={`text-[16px] font-normal text-center leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Skeeme will remind you before your streak resets so you never lose progress.
                </Text>
            </Animated.View>

            {/* Notification reasons */}
            <View className="gap-3 mb-10">
                {REASONS.map((reason, i) => (
                    <Animated.View key={i} entering={FadeInDown.duration(400).delay(300 + i * 100)}>
                        <View className={`flex-row items-center p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-[#1c1c1e]' : 'border-slate-200 bg-white shadow-sm'}`}>
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
                                <Ionicons name={reason.icon} size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`flex-1 font-medium text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{reason.text}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.duration(500).delay(700)} className="mt-auto gap-3">
                <TouchableOpacity
                    onPress={handleEnable}
                    activeOpacity={0.8}
                    className="h-[56px] bg-brand-primary rounded-2xl items-center justify-center shadow-sm"
                >
                    <Text className="font-bold text-[16px] text-white">Turn on reminders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSkip}
                    activeOpacity={0.8}
                    className="h-[50px] items-center justify-center rounded-2xl"
                >
                    <Text className={`font-medium text-[15px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Maybe later</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
