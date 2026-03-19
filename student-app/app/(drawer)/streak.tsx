import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StreakScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#ffffff' : '#121212';
    
    // Milestones
    const current = user?.streak?.current_streak || 0;
    const longest = user?.streak?.longest_streak || 0;
    
    const milestones = [
        { title: '7 Day Streak', target: 7, reward: '50 Credits' },
        { title: '14 Day Streak', target: 14, reward: '100 Credits' },
        { title: '30 Day Streak', target: 30, reward: '200 Credits' },
        { title: '60 Day Streak', target: 60, reward: '500 Credits' },
    ];

    const isElite = user?.plan_name === 'elite';
    const [freezes, setFreezes] = useState({ total_allowed: 2, used_this_month: 0 });
    const [loadingFreezes, setLoadingFreezes] = useState(true);

    useEffect(() => {
        const fetchFreezes = async () => {
            try {
                // If the backend doesn't have an endpoint specifically for this yet, we fallback.
                const res = await api.get('streaks/freezes');
                if (res.data) {
                    setFreezes(res.data);
                }
            } catch (err) {
                // Feature backend handles freezes silently, so we provide cosmetic fallback unless implemented.
                setFreezes({ total_allowed: 2, used_this_month: 0 });
            } finally {
                setLoadingFreezes(false);
            }
        };
        fetchFreezes();
    }, []);

    const freezesLeft = freezes.total_allowed - freezes.used_this_month;

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <Stack.Screen options={{ 
                title: 'Streak & Milestones',
                headerShown: true,
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: tintColor,
                headerShadowVisible: false,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Stats */}
                <View className="flex-row gap-3 mb-8">
                    <View className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5">
                        <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Current Streak</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{current}</Text>
                            <Text className="text-sm font-bold text-slate-400 ml-1">Days</Text>
                        </View>
                    </View>
                    <View className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5">
                        <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Longest Streak</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{longest}</Text>
                            <Text className="text-sm font-bold text-slate-400 ml-1">Days</Text>
                        </View>
                    </View>
                </View>

                {/* Freezes */}
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-3 tracking-tight">Streak Freezes</Text>
                <View className="bg-blue-50 dark:bg-blue-900/20 rounded-[24px] p-5 border border-blue-200 dark:border-blue-800 mb-8">
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="bg-blue-100 dark:bg-blue-900/40 w-12 h-12 rounded-2xl items-center justify-center">
                            <Ionicons name="snow" size={24} color="#3B82F6" />
                        </View>
                        {!isElite ? (
                            <View className="bg-blue-600 px-3 py-1 rounded-full">
                                <Text className="text-white font-black text-[10px] uppercase">Elite Only</Text>
                            </View>
                        ) : loadingFreezes ? (
                            <View className="bg-blue-100 dark:bg-blue-900/40 px-5 py-1 rounded-full">
                                <ActivityIndicator size="small" color="#3B82F6" />
                            </View>
                        ) : (
                            <View className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                                <Text className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase">{freezesLeft} Available</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-slate-900 dark:text-white font-black text-base mb-1">Missed a day? No problem.</Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium text-[13px] leading-relaxed mb-4">
                        Elite members receive 2 automatic streak freezes every month. If you forget to study, your streak won't reset.
                    </Text>
                    
                    {isElite ? (
                        <View className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-3 flex-row items-center">
                            <Ionicons name="information-circle" size={18} color="#3B82F6" />
                            <Text className="text-blue-600 dark:text-blue-400 font-bold pl-2 text-xs flex-1">
                                You have {freezesLeft} freezes remaining this month. Applied automatically.
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => router.push('/upgrade')} className="bg-blue-600 rounded-xl py-3 items-center" activeOpacity={0.8}>
                            <Text className="text-white font-black text-[13px]">Upgrade to Elite</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Milestones */}
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">Milestones</Text>
                <View className="bg-slate-50 dark:bg-slate-900 rounded-[24px] p-5 border border-slate-200 dark:border-slate-800">
                    {milestones.map((m, i) => {
                        const progress = Math.min(100, (current / m.target) * 100);
                        const isUnlocked = current >= m.target;
                        
                        return (
                            <View key={i} className={`mb-5 ${i === milestones.length - 1 ? 'mb-0' : ''}`}>
                                <View className="flex-row justify-between items-end mb-2">
                                    <View>
                                        <Text className="text-slate-900 dark:text-white font-black text-[15px]">{m.title}</Text>
                                        <Text className="text-brand-primary font-bold text-[11px] mt-0.5">{m.reward}</Text>
                                    </View>
                                    <Text className="text-slate-400 dark:text-slate-500 font-black text-[11px]">{current} / {m.target}</Text>
                                </View>
                                <View className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <View 
                                        className={`h-full rounded-full ${isUnlocked ? 'bg-brand-primary' : 'bg-[#2EBD85]/40'}`} 
                                        style={{ width: `${progress}%` }} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
