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

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-12">
                <View className={`w-16 h-16 rounded-[22px] items-center justify-center mb-8 shadow-sm ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-black/5'}`}>
                    <Ionicons name="notifications" size={28} color="#D2B48C" />
                </View>
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Stay on track.
                </Text>
                <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Skeeme can remind you before your streak resets or when your AI context is ready.
                </Text>
            </Animated.View>

            {/* Notification reasons */}
            <View className="gap-4">
                {REASONS.map((reason, i) => (
                    <Animated.View key={i} entering={FadeInDown.duration(600).delay(300 + i * 150)}>
                        <View className={`flex-row items-center p-6 rounded-[24px] border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-white'}`}>
                            <View className={`w-12 h-12 rounded-[16px] items-center justify-center mr-5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Ionicons name={reason.icon} size={22} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`flex-1 font-bold text-[16px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{reason.text}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Buttons */}
            <View className="mt-auto pt-8">
                <Animated.View entering={FadeInUp.duration(600).delay(800)} className="gap-4">
                    <TouchableOpacity
                        onPress={handleEnable}
                        activeOpacity={0.9}
                        className="h-[64px] bg-brand-primary rounded-[24px] items-center justify-center shadow-lg shadow-brand-primary/25"
                    >
                        <Text className="font-bold text-[17px] text-white tracking-wide">Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        activeOpacity={0.7}
                        className="h-14 items-center justify-center rounded-[24px]"
                    >
                        <Text className={`font-bold text-[15px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Maybe later</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
