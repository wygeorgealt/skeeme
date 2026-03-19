import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function StreakCalendar({ activeDates, isLoading, isDark }: { activeDates: string[], isLoading: boolean, isDark: boolean }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = today.getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (isLoading) {
        return (
            <View className="flex-row flex-wrap gap-2.5 justify-start">
                {days.slice(0, 14).map((d) => (
                    <View
                        key={`skel-${d}`}
                        style={{ width: '11.5%', aspectRatio: 1 }}
                        className={`rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}
                    />
                ))}
            </View>
        );
    }

    const safeDates = activeDates || [];

    return (
        <View className="flex-row flex-wrap gap-2.5 justify-start">
            {days.map(d => {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isActive = safeDates.includes(dateStr);
                const isFuture = d > currentDay;

                return (
                    <View
                        key={d}
                        style={{ width: '11.5%', aspectRatio: 1 }}
                        className={`rounded-lg items-center justify-center border ${
                            isActive 
                                ? 'bg-brand-primary border-brand-primary' 
                                : isFuture 
                                    ? 'bg-transparent border-slate-100 dark:border-slate-800 opacity-20' 
                                    : (isDark ? 'bg-slate-800/10 border-slate-800' : 'bg-slate-50 border-slate-100')
                        }`}
                    >
                        <Text className={`font-bold text-[10px] ${isActive ? 'text-white' : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                            {d}
                        </Text>
                    </View>
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

    const { data: heatmapDates = [], isLoading: isLoadingHeatmap } = useQuery({
        queryKey: ['streak-heatmap'],
        queryFn: async () => {
            const res = await api.get('streaks/heatmap');
            return res.data.data as string[];
        },
        enabled: !!user, // Don't fetch if not logged in
        staleTime: 1000 * 60 * 60 * 4, // 4 hours
    });

    // Fetch user data with 5-minute throttling (H2: reduced from 30s to avoid server overload)
    useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
            return res.data;
        },
        enabled: !!user,
        staleTime: 300000, // 5 minutes
        refetchInterval: 300000, // Background refresh every 5 minutes
        refetchOnWindowFocus: true, // Refresh when app comes to foreground
    });

    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        try {
            const res = await api.get('me');
            if (res.data) updateUser(res.data);
        } catch { /* silent */ }
        setRefreshing(false);
    }, [user, updateUser]);

    if (!user) return null;

    const cardBgClass = isDark ? 'bg-[#161618]' : 'bg-white';
    const borderColorClass = isDark ? 'border-slate-800' : 'border-slate-100 shadow-sm';

    return (
        <ScrollView
            className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2B48C" />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className={`px-10 pt-16 pb-8 flex-row justify-between items-center`}>
                <View>
                    <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {user.name.split(' ')[0]}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="sunny-outline" size={14} color="#D2B48C" className="mr-1.5" />
                        <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-[0.1em]">
                            {getGreeting()}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push('/account')} 
                    activeOpacity={0.7}
                    className={`size-14 rounded-2xl items-center justify-center border ${cardBgClass} ${borderColorClass}`}
                >
                    <Ionicons name="person-outline" size={22} color={isDark ? '#cbd5e1' : '#0f172a'} />
                </TouchableOpacity>
            </View>

            {/* Credits Area */}
            <View className="px-8 pb-10">
                <View className={`${cardBgClass} border ${borderColorClass} rounded-[40px] p-8`}>
                    <Text className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 ml-1">
                        Available Balance
                    </Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-baseline">
                            {user.is_unlimited ? (
                                <View className="flex-row items-center">
                                    <Ionicons name="sparkles" size={32} color="#D2B48C" />
                                    <Text className={`text-[36px] font-bold tracking-tight ml-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Unlimited</Text>
                                </View>
                            ) : (
                                <Text className={`text-[46px] font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {user.credits.toLocaleString()}
                                </Text>
                            )}
                        </View>
                        {isFreePlan && (
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className="bg-brand-primary h-14 px-8 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/20"
                                activeOpacity={0.9}
                            >
                                <Text className="text-white font-bold text-[14px] uppercase tracking-widest">Upgrade</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {isFreePlan && (
                        <View className={`flex-row items-center mt-8 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                            <Ionicons name="rocket-outline" size={14} color="#D2B48C" />
                            <Text className="text-slate-500 font-medium text-[13px] ml-2.5">Switch to Skeeme Elite for unlimited access</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Promo Banner */}
            {isFreePlan && (
                <View className="px-8 pb-12">
                    <TouchableOpacity
                        onPress={() => router.push('/upgrade')}
                        activeOpacity={0.9}
                        className={`rounded-[32px] p-8 flex-row items-center justify-between border ${isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900 shadow-xl'}`}
                    >
                        <View className="flex-1 pr-6">
                            <Text className={`text-[20px] font-bold tracking-tight mb-2 ${isDark ? 'text-slate-950' : 'text-white'}`}>
                                Reach your peak
                            </Text>
                            <Text className={`font-medium text-[13px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Join thousands of top students studying 5x faster with Skeeme AI.
                            </Text>
                            <View className="flex-row items-center mt-6">
                                <Text className={`font-bold text-[12px] uppercase tracking-widest mr-2 ${isDark ? 'text-slate-950' : 'text-white'}`}>Join Elite</Text>
                                <Ionicons name="chevron-forward" size={16} color={isDark ? '#000000' : 'white'} />
                            </View>
                        </View>
                        <View className={`size-16 rounded-[24px] items-center justify-center ${isDark ? 'bg-slate-100' : 'bg-white/10'}`}>
                            <Ionicons name="flash" size={28} color={isDark ? '#0f172a' : 'white'} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Study Tools */}
            <View className="px-8 pb-10">
                <Text className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Toolbox</Text>

                <View className="gap-4">
                    {[
                        { title: 'AI Practice Quiz', sub: 'Infinite exam simulations', icon: 'school-outline', route: '/generate', color: isDark ? '#fff' : '#0f172a' },
                        { title: 'Flashcards', sub: 'Memorize with AI decks', icon: 'albums-outline', route: '/flashcards', color: '#D2B48C', badge: 'NEW' },
                        { title: 'Scan & Solve', sub: 'Instant photo solutions', icon: 'camera-outline', route: '/scan', color: isDark ? '#fff' : '#0f172a' },
                    ].map((tool, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => router.push(tool.route as any)}
                            className={`${cardBgClass} border ${borderColorClass} p-5 rounded-[28px] flex-row items-center`}
                            activeOpacity={0.7}
                        >
                            <View className={`size-14 rounded-2xl items-center justify-center mr-5 border ${isDark ? 'bg-slate-800/10 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className={`text-[17px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{tool.title}</Text>
                                    {tool.badge && (
                                        <View className="bg-brand-primary/10 px-2.5 py-0.5 rounded-full ml-3">
                                            <Text className="text-brand-primary font-bold text-[9px] uppercase tracking-widest">{tool.badge}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-[13px] text-slate-500 font-medium mt-1">{tool.sub}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Streak & Activity */}
            <View className="px-8 pb-12">
                <Text className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Activity</Text>

                <View className="flex-row gap-4 mb-4">
                    <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[32px] p-6`}>
                        <View className="flex-row justify-between items-start mb-3">
                            <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px]">Current</Text>
                            <Ionicons name="flame" size={16} color="#D2B48C" />
                        </View>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.streak?.current_streak || 0}</Text>
                            <Text className="text-[11px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/streak')} activeOpacity={0.7} className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[32px] p-6`}>
                        <View className="flex-row justify-between items-start mb-3">
                            <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px]">Longest</Text>
                            <Ionicons name="trophy-outline" size={16} color="#D2B48C" />
                        </View>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.streak?.longest_streak || 0}</Text>
                            <Text className="text-[11px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    onPress={() => router.push('/streak')} 
                    activeOpacity={0.9} 
                    className={`${cardBgClass} border ${borderColorClass} p-8 rounded-[40px]`}
                >
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <View className="bg-brand-primary/10 px-4 py-1.5 rounded-full">
                            <Text className="text-brand-primary font-bold text-[10px] uppercase tracking-[0.2em]">Heatmap</Text>
                        </View>
                    </View>
                    <StreakCalendar activeDates={heatmapDates} isLoading={isLoadingHeatmap} isDark={isDark} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
