import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/ui/GradientButton';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function HeatmapGrid({ activeDates }: { activeDates: string[] }) {
    if (!activeDates || activeDates.length === 0) {
        return (
            <View className="py-8 items-center justify-center">
                <Ionicons name="calendar-outline" size={36} color="#cbd5e1" />
                <Text className="text-slate-500 dark:text-slate-400 font-medium mt-3 text-sm text-center">
                    No recent activity.{'\n'}Complete a quiz or flashcard to start your streak!
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
                        className={`rounded-lg border ${isActive ? 'bg-orange-500 border-orange-600 shadow-sm shadow-orange-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                    />
                );
            })}
        </View>
    );
}

export default function DashboardScreen() {
    const { user, updateUser } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);

    // Refresh user data from API whenever this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    const res = await api.get('/me');
                    if (res.data) updateUser(res.data);
                } catch { /* silent — stale data is fine */ }
            })();
            refetchHeatmap();
        }, [])
    );

    const { data: heatmapDates = [], refetch: refetchHeatmap } = useQuery({
        queryKey: ['streak-heatmap'],
        queryFn: async () => {
            const res = await api.get('/streaks/heatmap');
            return res.data.data as string[];
        }
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/me');
            if (res.data) updateUser(res.data);
        } catch { /* silent */ }
        setRefreshing(false);
    }, []);

    if (!user) return null;

    const creditPercentage = user.is_unlimited ? 100 : Math.min(Math.round((user.credits / 500) * 100), 100);

    return (
        <ScrollView
            className="flex-1 bg-slate-50 dark:bg-brand-dark"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        >
            {/* Greeting */}
            <View className="px-6 py-8 pb-4">
                <Text className="text-slate-400 dark:text-slate-500 font-medium mb-1">{getGreeting()},</Text>
                <Text className="text-3xl font-black text-slate-900 dark:text-white">{user.name}</Text>
            </View>

            {/* Dashboard Stats Row */}
            <View className="px-6 mb-8 flex-row gap-4">
                {/* Credit Balance Card */}
                <LinearGradient
                    colors={['#4f46e5', '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-5 shadow-lg shadow-indigo-900/30 flex-1"
                >
                    <View className="flex-row justify-between flex-wrap items-start mb-3">
                        <View>
                            <Text className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-0.5">
                                Credits
                            </Text>
                            {user.is_unlimited ? (
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="infinite" size={24} color="white" />
                                    <Text className="text-2xl font-black text-white ml-1">Pro</Text>
                                </View>
                            ) : (
                                <Text className="text-3xl font-black text-white">{user.credits}</Text>
                            )}
                        </View>
                        <View className="size-10 bg-white/20 rounded-full items-center justify-center">
                            <Ionicons name="flash" size={18} color="white" />
                        </View>
                    </View>

                    {/* Credit Progress Bar (free users only) */}
                    {!user.is_unlimited && (
                        <View className="mb-3">
                            <View className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <View
                                    className="bg-white rounded-full h-1.5"
                                    style={{ width: `${creditPercentage}%` }}
                                />
                            </View>
                        </View>
                    )}

                    {!user.is_unlimited && (
                        <TouchableOpacity
                            onPress={() => router.push('/(drawer)/upgrade')}
                            className="bg-white dark:bg-slate-800 py-2 rounded-xl flex-row justify-center items-center"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="star" size={14} color="#4338ca" />
                            <Text className="text-indigo-900 dark:text-indigo-400 font-black text-xs ml-1">Upgrade</Text>
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* Study Streak Card */}
                <View className="bg-orange-500 dark:bg-orange-600 rounded-3xl p-5 shadow-lg shadow-orange-900/30 flex-1 justify-between">
                    <View className="flex-row justify-between flex-wrap items-start mb-2">
                        <View>
                            <Text className="text-orange-200 dark:text-orange-300 font-bold uppercase tracking-widest text-[10px] mb-0.5">
                                Day Streak
                            </Text>
                            <Text className="text-3xl font-black text-white">
                                {user.streak?.current_streak || 0}
                            </Text>
                        </View>
                        <View className="size-10 bg-white/20 dark:bg-black/20 rounded-full items-center justify-center">
                            <Ionicons name="flame" size={20} color="white" />
                        </View>
                    </View>

                    <View className="bg-orange-600/50 dark:bg-black/20 rounded-xl p-2.5 flex-row justify-between items-center mt-1">
                        <Text className="text-orange-100 dark:text-orange-200 font-bold text-[10px] uppercase">Longest</Text>
                        <Text className="text-white font-black text-sm">{user.streak?.longest_streak || 0} days</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-6 pb-10">
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-4">Study Tools</Text>

                <GradientButton
                    onPress={() => router.push('/generate')}
                    containerStyle="mb-4"
                    className="p-3"
                    icon={<View className="size-14 bg-white/20 rounded-2xl items-center justify-center mr-2">
                        <Ionicons name="school" size={28} color="white" />
                    </View>}
                >
                    AI Practice Quiz
                </GradientButton>

                <TouchableOpacity
                    onPress={() => router.push('/flashcards')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl mb-4 border border-slate-100 dark:border-slate-700 flex-row items-center shadow-sm shadow-slate-200 dark:shadow-none"
                    activeOpacity={0.7}
                >
                    <View className="size-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl items-center justify-center mr-4">
                        <Ionicons name="albums" size={28} color="#10b981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">Flashcards</Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Generate and study AI decks</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/billing')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex-row items-center shadow-sm shadow-slate-200 dark:shadow-none"
                    activeOpacity={0.7}
                >
                    <View className="size-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl items-center justify-center mr-4">
                        <Ionicons name="receipt" size={28} color="#64748b" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">Billing History</Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">View past invoices</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

            {/* Heatmap Card */}
            <View className="px-6 pb-12">
                <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm shadow-slate-200 dark:shadow-none">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-slate-900 dark:text-white font-bold text-lg">Activity map</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Last 28 days of study</Text>
                        </View>
                        <Ionicons name="calendar" size={20} color="#94a3b8" />
                    </View>
                    <HeatmapGrid activeDates={heatmapDates} />
                </View>
            </View>
        </ScrollView >
    );
}
