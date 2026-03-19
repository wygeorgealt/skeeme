import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Platform } from 'react-native';
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
    const bgColor = isDark ? "#0f0f11" : "#fafafa";
    const tintColor = isDark ? '#ffffff' : '#0f172a';
    const cardBg = isDark ? "#161618" : "#ffffff";
    const borderColor = isDark ? "border-slate-800" : "border-slate-200";

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
                const res = await api.get('streaks/freezes');
                if (res.data) {
                    setFreezes(res.data);
                }
            } catch (err) {
                setFreezes({ total_allowed: 2, used_this_month: 0 });
            } finally {
                setLoadingFreezes(false);
            }
        };
        fetchFreezes();
    }, []);

    const freezesLeft = freezes.total_allowed - freezes.used_this_month;

    const cardBgClass = isDark ? 'bg-[#161618]' : 'bg-white';
    const borderColorClass = isDark ? 'border-slate-800' : 'border-slate-100 shadow-sm';

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <Stack.Screen options={{ 
                title: 'Streak',
                headerShown: true,
                headerStyle: { backgroundColor: isDark ? '#0f0f11' : '#fafafa' },
                headerTitleStyle: { fontWeight: '700' },
                headerTintColor: tintColor,
                headerShadowVisible: false,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 24, paddingBottom: 100 }}>
                {/* Stats */}
                <View className="flex-row gap-4 mb-10">
                    <View className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[32px] p-8`}>
                        <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mb-3">Current</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[36px] font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{current}</Text>
                            <Text className="text-[12px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </View>
                    <View className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[32px] p-8`}>
                        <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mb-3">Longest</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[36px] font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{longest}</Text>
                            <Text className="text-[12px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </View>
                </View>

                {/* Freezes */}
                <Text className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Streak Protection</Text>
                <View className={`p-8 rounded-[32px] border mb-10 ${isElite ? (isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100') : (isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm')}`}>
                    <View className="flex-row justify-between items-center mb-10">
                        <View className={`size-14 rounded-2xl items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <Ionicons name="snow" size={24} color="#6366f1" />
                        </View>
                        {!isElite ? (
                            <View className="bg-slate-900 dark:bg-white px-3 py-1.5 rounded-lg">
                                <Text className="text-white dark:text-slate-950 font-bold text-[10px] uppercase tracking-wider">Elite Feature</Text>
                            </View>
                        ) : loadingFreezes ? (
                            <ActivityIndicator size="small" color="#6366f1" />
                        ) : (
                            <View className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                <Text className="text-emerald-500 font-bold text-[11px] uppercase tracking-widest">{freezesLeft} Available</Text>
                            </View>
                        )}
                    </View>
                    <Text className={`font-bold text-[24px] tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Peace of mind.</Text>
                    <Text className="text-slate-500 font-medium text-[15px] leading-relaxed mb-8">
                        Streak freezes automatically protect your progress if you ever miss a day. 
                    </Text>
                    
                    {!isElite && (
                        <TouchableOpacity 
                            onPress={() => router.push('/upgrade')} 
                            className="bg-brand-primary h-[56px] rounded-[20px] items-center justify-center shadow-lg shadow-brand-primary/20" 
                            activeOpacity={0.9}
                        >
                            <Text className="text-white font-bold text-[16px]">Get Streak Protection</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Milestones */}
                <Text className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Achievements</Text>
                <View className={`${cardBgClass} rounded-[32px] p-8 border ${borderColorClass}`}>
                    {milestones.map((m, i) => {
                        const progress = Math.min(100, (current / m.target) * 100);
                        const isUnlocked = current >= m.target;
                        
                        return (
                            <View key={i} className={`mb-10 ${i === milestones.length - 1 ? 'mb-2' : ''}`}>
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className={`font-bold text-[17px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.title}</Text>
                                        <Text className="text-brand-primary font-bold text-[12px] uppercase tracking-widest mt-1">{m.reward}</Text>
                                    </View>
                                    <Text className="text-slate-400 font-bold text-[12px] tracking-tighter mt-1">{current} / {m.target}</Text>
                                </View>
                                <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <View 
                                        className={`h-full rounded-full ${isUnlocked ? 'bg-brand-primary' : (isDark ? 'bg-brand-primary/20' : 'bg-[#D2B48C]/30')}`} 
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
