import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const MILESTONES = [
    { days: 7, reward: 50, label: '7-Day Streak' },
    { days: 14, reward: 100, label: '14-Day Streak' },
    { days: 30, reward: 200, label: '30-Day Streak' },
    { days: 60, reward: 500, label: '60-Day Streak' },
];

export default function StreakIntroScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

    return (
        <View className={`flex-1 px-8 pt-16 pb-8 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center mb-10">
                {/* Flame */}
                <Text className="text-[56px] mb-4">🔥</Text>
                <Text className={`text-[28px] font-semibold tracking-tight text-center leading-[34px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Study every day. Earn free credits.
                </Text>
                <Text className={`text-[16px] font-normal leading-relaxed text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Keep your streak alive and unlock bonus credits at every milestone.
                </Text>
            </Animated.View>

            {/* Milestones */}
            <View className="gap-3 mb-8">
                {MILESTONES.map((m, i) => (
                    <Animated.View key={m.days} entering={FadeInDown.duration(400).delay(300 + i * 80)}>
                        <View className={`flex-row items-center p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-[#1c1c1e]' : 'border-slate-200 bg-white shadow-sm'}`}>
                            <View className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${i === 0 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <Ionicons name="flame" size={20} color={i === 0 ? '#fff' : (isDark ? '#94a3b8' : '#cbd5e1')} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                            </View>
                            <View className={`px-3 py-1.5 rounded-full border ${isDark ? 'border-slate-700 bg-[#27272a]' : 'border-slate-200 bg-slate-50'}`}>
                                <Text className={`font-semibold text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>+{m.reward} credits</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Day 1 active */}
            <Animated.View entering={FadeInUp.duration(500).delay(650)}>
                <View className={`rounded-2xl p-4 flex-row items-center mb-6 border ${isDark ? 'border-white bg-[#1c1c1e]' : 'border-slate-900 bg-white shadow-sm'}`}>
                    <View className="bg-brand-primary w-10 h-10 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Day 1 — You're already started!</Text>
                        <Text className={`font-normal text-[13px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>6 more days until your first reward.</Text>
                    </View>
                </View>
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeInUp.duration(500).delay(800)} className="mt-auto pb-4">
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/notifications')}
                    activeOpacity={0.8}
                    className="h-[56px] bg-brand-primary rounded-2xl items-center justify-center flex-row shadow-sm"
                >
                    <Text className="font-bold text-[16px] mr-2 text-white">Let's go</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
