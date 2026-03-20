import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Platform } from 'react-native';
import { Stack, router, useNavigation } from 'expo-router';
import { Menu, Snow, NavArrowLeft, Sparks, CheckCircle, GraduationCap, Book, Medal, Suitcase } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function StreakScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();
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

    const cardBgClass = isDark ? 'bg-[#13151B]' : 'bg-white';
    const borderColorClass = isDark ? 'border-transparent' : 'border-slate-100 shadow-sm';

    return (
        <GlowBackground>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with drawer toggle */}
            <View style={{ paddingTop: Math.max(insets.top, 8) }} className="px-5 pb-4 flex-row items-center justify-between">
                <Text className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Streak</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-xl items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View className="flex-row gap-4 mb-8">
                    <View className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[24px] p-6`}>
                        <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mb-3">Current</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[36px] font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{current}</Text>
                            <Text className="text-[11px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </View>
                    <View className={`flex-1 ${cardBgClass} border ${borderColorClass} rounded-[24px] p-6`}>
                        <Text className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mb-3">Longest</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-[36px] font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{longest}</Text>
                            <Text className="text-[11px] font-bold text-slate-400 ml-1.5 uppercase">Days</Text>
                        </View>
                    </View>
                </View>

                {/* Freezes */}
                <Text className={`text-[11px] font-bold uppercase tracking-widest mb-5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Streak Protection</Text>
                <View className={`p-6 rounded-[24px] border mb-8 ${isElite ? (isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100') : (isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm')}`}>
                    <View className="flex-row justify-between items-center mb-8">
                        <View className={`size-12 rounded-xl items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <Snow width={18} height={18} color="#6366f1" />
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
                    <Text className={`font-bold text-[20px] tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Peace of mind.</Text>
                    <Text className="text-slate-500 font-medium text-[14px] leading-relaxed mb-6">
                        Streak freezes automatically protect your progress if you ever miss a day. 
                    </Text>
                    
                    {!isElite && (
                        <TouchableOpacity 
                            onPress={() => router.push('/upgrade')} 
                            className="bg-brand-primary h-[48px] rounded-[20px] items-center justify-center shadow-lg shadow-brand-primary/20" 
                            activeOpacity={0.9}
                        >
                            <Text className="text-white font-bold text-[15px]">Get Streak Protection</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Milestones */}
                <Text className={`text-[11px] font-bold uppercase tracking-widest mb-5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Achievements</Text>
                <View className={`${cardBgClass} rounded-[24px] p-6 border ${borderColorClass}`}>
                    {milestones.map((m, i) => {
                        const progress = Math.min(100, (current / m.target) * 100);
                        const isUnlocked = current >= m.target;
                        
                        return (
                            <View key={i} className={`mb-8 ${i === milestones.length - 1 ? 'mb-2' : ''}`}>
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className={`font-bold text-[15px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.title}</Text>
                                        <Text className="text-brand-primary font-bold text-[11px] uppercase tracking-widest mt-1">{m.reward}</Text>
                                    </View>
                                    <Text className="text-slate-400 font-bold text-[11px] tracking-tighter mt-1">{current} / {m.target}</Text>
                                </View>
                                <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                                    <View 
                                        className={`h-full rounded-full ${isUnlocked ? 'bg-brand-primary' : (isDark ? 'bg-brand-primary/20' : 'bg-[#8B5CF6]/30')}`} 
                                        style={{ width: `${progress}%` }} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </GlowBackground>
    );
}
