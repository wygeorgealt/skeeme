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
        <View className={`flex-1 px-8 pt-20 pb-8 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-12">
                <View className={`w-20 h-20 rounded-[28px] items-center justify-center mb-10 shadow-sm ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-black/5'}`}>
                    <Ionicons name="flame" size={36} color="#D2B48C" />
                </View>
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Study every day.
                </Text>
                <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Build your learning habit and unlock free bonus credits at every milestone.
                </Text>
            </Animated.View>

            {/* Milestones */}
            <View className="gap-4">
                {MILESTONES.map((m, i) => (
                    <Animated.View key={m.days} entering={FadeInDown.duration(600).delay(300 + i * 120)}>
                        <View className={`flex-row items-center p-6 rounded-[24px] border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-50 bg-white'}`}>
                            <View className={`w-12 h-12 rounded-[16px] items-center justify-center mr-5 ${i === 0 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Ionicons name="flame" size={20} color={i === 0 ? '#fff' : '#D2B48C'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-[17px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                            </View>
                            <View className={`px-4 py-1.5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                                <Text className={`font-bold text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>+{m.reward} credits</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Day 1 active */}
            {/* Day 1 active */}
            <Animated.View entering={FadeInUp.duration(600).delay(800)}>
                <View className={`rounded-[24px] p-6 flex-row items-center mt-8 border-2 ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-900 bg-slate-900'}`}>
                    <View className="bg-brand-primary w-11 h-11 rounded-[14px] items-center justify-center mr-5 shadow-sm">
                        <Ionicons name="checkmark" size={22} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-[16px] text-white">Day 1 Started!</Text>
                        <Text className="font-medium text-[14px] mt-0.5 text-slate-400">6 more days until your first reward.</Text>
                    </View>
                </View>
            </Animated.View>

            {/* CTA */}
            <View className="mt-auto">
                <Animated.View entering={FadeInUp.duration(600).delay(1000)} className="pt-8">
                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/notifications')}
                        activeOpacity={0.9}
                        className="h-[64px] bg-brand-primary rounded-[24px] items-center justify-center flex-row shadow-lg shadow-brand-primary/25"
                    >
                        <Text className="font-bold text-[17px] mr-2 text-white tracking-wide">Secure your Streak</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
