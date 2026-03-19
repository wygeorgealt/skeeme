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
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center mb-8">
                <View className="bg-amber-500/10 w-20 h-20 rounded-full items-center justify-center mb-6">
                    <Ionicons name="notifications" size={36} color="#f59e0b" />
                </View>
                <Text className={`text-[28px] font-black tracking-tight text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Don't break{'\n'}your streak.
                </Text>
                <Text className={`text-[15px] font-medium text-center leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Skeeme will remind you before your streak resets so you never lose progress.
                </Text>
            </Animated.View>

            {/* Notification reasons */}
            <View className="gap-3 mb-8">
                {REASONS.map((reason, i) => (
                    <Animated.View key={i} entering={FadeInDown.duration(400).delay(300 + i * 100)}>
                        <View className={`flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-slate-900/80' : 'bg-slate-50'}`}>
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <Ionicons name={reason.icon} size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`flex-1 font-medium text-[14px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{reason.text}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.duration(500).delay(700)} className="mt-auto pb-12 gap-3">
                <TouchableOpacity
                    onPress={handleEnable}
                    activeOpacity={0.9}
                    className="bg-brand-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/30"
                >
                    <Text className="text-white font-black text-[17px]">Turn on reminders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSkip}
                    activeOpacity={0.8}
                    className="h-14 rounded-2xl items-center justify-center"
                >
                    <Text className={`font-bold text-[15px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Maybe later</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
