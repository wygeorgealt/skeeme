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
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center mb-8">
                {/* Flame */}
                <Text className="text-[64px] mb-4">🔥</Text>
                <Text className={`text-[28px] font-black tracking-tight text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Study every day.{'\n'}Earn free credits.
                </Text>
                <Text className={`text-[15px] font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Keep your streak alive and unlock bonus credits at every milestone.
                </Text>
            </Animated.View>

            {/* Milestones */}
            <View className="gap-3 mb-6">
                {MILESTONES.map((m, i) => (
                    <Animated.View key={m.days} entering={FadeInDown.duration(400).delay(300 + i * 80)}>
                        <View className={`flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-slate-900/80' : 'bg-slate-50'}`}>
                            <View className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${i === 0 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <Ionicons name="flame" size={20} color={i === 0 ? '#fff' : '#f59e0b'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                            </View>
                            <View className="bg-brand-primary/10 px-3 py-1.5 rounded-full">
                                <Text className="text-brand-primary font-black text-[13px]">+{m.reward} credits</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Day 1 active */}
            <Animated.View entering={FadeInUp.duration(500).delay(650)}>
                <View className="bg-brand-primary/10 border-2 border-brand-primary/30 rounded-2xl p-4 flex-row items-center mb-6">
                    <View className="bg-brand-primary w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-brand-primary font-black text-[14px]">Day 1 — You're already started!</Text>
                        <Text className={`font-medium text-[12px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>6 more days until your first reward.</Text>
                    </View>
                </View>
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeInUp.duration(500).delay(800)} className="mt-auto pb-12">
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/notifications')}
                    activeOpacity={0.9}
                    className="bg-brand-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/30 flex-row"
                >
                    <Text className="text-white font-black text-[17px] mr-2">Let's go</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
