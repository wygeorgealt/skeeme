import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FireFlame, Check, NavArrowRight } from 'iconoir-react-native';

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
        <View className={`flex-1 px-6 pt-16 pb-6 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-10">
                <View className={`w-20 h-20 rounded-[28px] items-center justify-center mb-8 shadow-sm ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-black/5'}`}>
                    <FireFlame width={36} height={36} color="#8B5CF6" />
                </View>
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Study every day.
                </Text>
                <Text className={`text-[15px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Build your learning habit and unlock free bonus credits at every milestone.
                </Text>
            </Animated.View>

            {/* Milestones */}
            <View className="gap-4">
                {MILESTONES.map((m, i) => (
                    <Animated.View key={m.days} entering={FadeInDown.duration(600).delay(300 + i * 120)}>
                        <View className={`flex-row items-center p-5 rounded-[24px] border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-50 bg-white'}`}>
                            <View className={`w-12 h-12 rounded-[16px] items-center justify-center mr-5 ${i === 0 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <FireFlame width={18} height={18} color={i === 0 ? '#fff' : '#8B5CF6'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                            </View>
                            <View className={`px-4 py-1.5 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                                <Text className={`font-bold text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>+{m.reward} credits</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Day 1 active */}
            {/* Day 1 active */}
            <Animated.View entering={FadeInUp.duration(600).delay(800)}>
                <View className={`rounded-[24px] p-5 flex-row items-center mt-6 border-2 ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-900 bg-slate-900'}`}>
                    <View className="bg-brand-primary w-11 h-11 rounded-[14px] items-center justify-center mr-5 shadow-sm">
                        <Check width={18} height={18} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-[15px] text-white">Day 1 Started!</Text>
                        <Text className="font-medium text-[13px] mt-0.5 text-slate-400">6 more days until your first reward.</Text>
                    </View>
                </View>
            </Animated.View>

            {/* CTA */}
            <View className="mt-auto">
                <Animated.View entering={FadeInUp.duration(600).delay(1000)} className="pt-8">
                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/notifications')}
                        activeOpacity={0.9}
                        className="h-[56px] bg-brand-primary rounded-[24px] items-center justify-center flex-row shadow-lg shadow-brand-primary/25"
                    >
                        <Text className="font-bold text-[15px] mr-2 text-white tracking-wide">Secure your Streak</Text>
                        <NavArrowRight width={18} height={18} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
