import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';

type QuizSession = {
    id: number;
    topic: string;
    difficulty: string;
    score_percentage: number;
    total_questions: number;
    correct_answers: number;
    time_spent_seconds: number | null;
    created_at: string;
};

function SkeletonItem() {
    return (
        <View className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4">
            <View className="flex-row justify-between mb-4">
                <View className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <View className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </View>
            <View className="flex-row gap-3">
                <View className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <View className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </View>
        </View>
    );
}

const getScoreColor = (pct: number) => {
    if (pct >= 80) return '#2EBD85'; // Green
    if (pct >= 60) return '#FCD34D'; // Yellow
    return '#ef4444'; // Red
};

export default function QuizHistoryDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { data: sessions, isLoading, refetch } = useQuery({
        queryKey: ['quiz-history'],
        queryFn: async () => {
            const res = await api.get('quizzes/history');
            return res.data.data as QuizSession[];
        }
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const formatTime = (s: number | null) => {
        if (!s) return null;
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-8 pb-4">
                <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white">Quiz History</Text>
                <Text className="text-[15px] font-bold text-slate-500 mt-1">Review past performance & answers</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "#0f172a"} />}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row justify-between items-end mb-6">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400">Past Sessions</Text>
                    {(sessions?.length ?? 0) > 0 && <Text className="text-slate-400 font-black text-[11px] tracking-widest uppercase">{sessions!.length} Quizzes</Text>}
                </View>

                {isLoading ? (
                    <><SkeletonItem /><SkeletonItem /><SkeletonItem /><SkeletonItem /></>
                ) : sessions?.length === 0 ? (
                    <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50">
                        <View className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 items-center justify-center mb-6">
                            <Ionicons name="time" size={40} color={isDark ? 'white' : '#0f172a'} />
                        </View>
                        <Text className="text-slate-900 dark:text-white font-black text-[22px] tracking-tight mb-2">No History Yet</Text>
                        <Text className="text-slate-500 font-bold text-[14px] text-center px-8 mb-8 leading-relaxed">
                            Complete a practice quiz to review your results here.
                        </Text>
                        <View className="w-full px-8">
                            <GradientButton
                                onPress={() => router.push('/generate')}
                                icon={<Ionicons name="arrow-forward" size={18} color={isDark ? '#0f172a' : 'white'} />}
                            >
                                Take a Quiz
                            </GradientButton>
                        </View>
                    </View>
                ) : (
                    sessions?.map(session => (
                        <TouchableOpacity
                            key={session.id}
                            onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
                            className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row justify-between items-start mb-6">
                                <Text className="text-slate-900 dark:text-white font-black text-[19px] tracking-tight flex-1 mr-4" numberOfLines={2}>
                                    {session.topic}
                                </Text>
                                <View className={`items-end border-2 px-3 py-1.5 rounded-xl`} style={{ borderColor: getScoreColor(session.score_percentage) }}>
                                    <Text className="font-black text-[15px]" style={{ color: getScoreColor(session.score_percentage) }}>
                                        {Math.round(session.score_percentage)}%
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap items-center mt-2">
                                <View className="flex-row items-center border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-dark px-3 py-1.5 rounded-xl mr-2 mb-2">
                                    <Text className="text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">{session.difficulty}</Text>
                                </View>
                                <View className="flex-row items-center border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-dark px-3 py-1.5 rounded-xl mr-2 mb-2">
                                    <Ionicons name="checkmark-circle" size={12} color="#64748b" />
                                    <Text className="text-slate-600 dark:text-slate-400 font-bold text-[11px] ml-1.5">{session.correct_answers}/{session.total_questions}</Text>
                                </View>
                                {session.time_spent_seconds && (
                                    <View className="flex-row items-center border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-dark px-3 py-1.5 rounded-xl mr-2 mb-2">
                                        <Ionicons name="timer-outline" size={12} color="#64748b" />
                                        <Text className="text-slate-600 dark:text-slate-400 font-bold text-[11px] ml-1">{formatTime(session.time_spent_seconds)}</Text>
                                    </View>
                                )}
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                                    <Text className="text-slate-400 font-bold text-[11px] ml-1">
                                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
