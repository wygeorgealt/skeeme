import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function HeatmapGrid({ activeDates }: { activeDates: string[] }) {
    if (!activeDates || activeDates.length === 0) {
        return (
            <View className="py-8 items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
                <Text className="text-slate-500 dark:text-slate-400 font-medium mt-3 text-sm text-center">
                    No recent activity.{'\n'}Complete a quiz to start your streak!
                </Text>
            </View>
        );
    }

    // Generate an array of the last 28 days for a 4x7 grid
    const today = new Date();
    const days = [];
    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    return (
        <View className="flex-row flex-wrap gap-[6px] justify-start">
            {days.map(d => {
                const isActive = activeDates.includes(d);
                return (
                    <View
                        key={d}
                        style={{ width: '12%', minWidth: 28, maxWidth: 42, aspectRatio: 1 }}
                        className={`rounded-sm border ${isActive ? 'bg-[#2EBD85] border-[#2EBD85]' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                    />
                );
            })}
        </View>
    );
}

export default function DashboardScreen() {
    const { user, updateUser } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isFreePlan = !user?.is_unlimited && (!user?.plan_name || user?.plan_name === 'free');

    const { data: heatmapDates = [] } = useQuery({
        queryKey: ['streak-heatmap'],
        queryFn: async () => {
            const res = await api.get('streaks/heatmap');
            return res.data.data as string[];
        },
        enabled: !!user, // Don't fetch if not logged in
        staleTime: 1000 * 60 * 60 * 4, // 4 hours
    });

    // Fetch user data with 30s throttling
    useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
            return res.data;
        },
        enabled: !!user,
        staleTime: 30000, // Keep data fresh for 30s (prevents refetch on focus within this window)
        refetchInterval: 30000, // Background refresh every 30s
    });

    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        try {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
        } catch { /* silent */ }
        setRefreshing(false);
    }, [user]);

    if (!user) return null;

    return (
        <ScrollView
            className="flex-1 bg-white dark:bg-brand-dark"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2EBD85" />}
        >
            {/* Header */}
            <View className="px-6 py-8 pb-6 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {user.name}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
                        {getGreeting()}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/account')} className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Ionicons name="person" size={18} color={isDark ? '#cbd5e1' : '#0f172a'} />
                </TouchableOpacity>
            </View>

            {/* Stake-Style Balance Area */}
            <View className="px-6 pb-8">
                <View className="flex-row items-end justify-between mb-2">
                    <View>
                        <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">
                            Available Credits
                        </Text>
                        <View className="flex-row items-baseline">
                            {user.is_unlimited ? (
                                <View className="flex-row items-center">
                                    <Ionicons name="infinite" size={36} color={isDark ? "white" : "black"} />
                                    <Text className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter ml-2">Unlimited</Text>
                                </View>
                            ) : (
                                <Text className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {user.credits.toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>
                    {isFreePlan && (
                        <TouchableOpacity
                            onPress={() => router.push('/upgrade')}
                            className="bg-[#2EBD85] px-5 py-3 rounded-full flex-row items-center"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={18} color="white" />
                            <Text className="text-white font-black text-sm ml-1">Add</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {isFreePlan && (
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="trending-up" size={14} color="#2EBD85" />
                        <Text className="text-[#2EBD85] font-bold text-xs ml-1">Top up today</Text>
                    </View>
                )}
            </View>

            {/* Promo Banner (Black & White Stake Style) */}
            {isFreePlan && (
                <View className="px-6 pb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/upgrade')}
                        activeOpacity={0.8}
                        className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-5 flex-row items-center justify-between border border-slate-900 dark:border-slate-700"
                    >
                        <View className="flex-1 pr-4">
                            <Text className="text-white text-xl font-black tracking-tight mb-1">
                                UPGRADE TO PRO
                            </Text>
                            <Text className="text-slate-400 text-xs font-medium leading-relaxed">
                                Get unlimited answers, priority speed, and priority access for one flat fee.
                            </Text>
                            <View className="flex-row items-center mt-3">
                                <Text className="text-white font-bold text-xs mr-1">Unlock now</Text>
                                <Ionicons name="arrow-forward" size={14} color="white" />
                            </View>
                        </View>
                        <View className="size-16 bg-white/10 rounded-2xl items-center justify-center rotate-3">
                            <Ionicons name="infinite" size={32} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Study Tools (Clean outline cards) */}
            <View className="px-6 pb-6">
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">Study Tools</Text>

                <View className="gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/generate')}
                        className="bg-white dark:bg-brand-dark p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <View className="size-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="school" size={24} color={isDark ? '#e2e8f0' : '#0f172a'} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-black text-slate-900 dark:text-white tracking-tight">AI Practice Quiz</Text>
                            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Generate unlimited quizzes</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/flashcards')}
                        className="bg-white dark:bg-brand-dark p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <View className="size-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="albums" size={24} color={isDark ? '#e2e8f0' : '#0f172a'} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-black text-slate-900 dark:text-white tracking-tight">Flashcards</Text>
                            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Generate and study AI decks</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/scan')}
                        className="bg-white dark:bg-brand-dark p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <View className="size-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="scan" size={24} color={isDark ? '#e2e8f0' : '#0f172a'} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-black text-slate-900 dark:text-white tracking-tight">Scan & Solve</Text>
                            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Snap a photo, get the answer</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Streak & Activity */}
            <View className="px-6 pb-12">
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">Activity</Text>

                <View className="flex-row gap-3 mb-3">
                    <View className="flex-1 bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                        <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Current Streak</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{user.streak?.current_streak || 0}</Text>
                            <Text className="text-xs font-bold text-slate-400 ml-1">Days</Text>
                        </View>
                    </View>
                    <View className="flex-1 bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                        <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Longest Streak</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{user.streak?.longest_streak || 0}</Text>
                            <Text className="text-xs font-bold text-slate-400 ml-1">Days</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white dark:bg-brand-dark p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-slate-900 dark:text-white font-bold text-sm">Last 28 days</Text>
                        <Ionicons name="flame" size={16} color="#2EBD85" />
                    </View>
                    <HeatmapGrid activeDates={heatmapDates} />
                </View>
            </View>
        </ScrollView>
    );
}
