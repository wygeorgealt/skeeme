import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
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
        <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm shadow-slate-200 dark:shadow-none">
            <View className="flex-row justify-between mb-3">
                <View className="h-5 w-1/2 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <View className="h-5 w-12 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </View>
            <View className="flex-row items-center gap-3">
                <View className="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <View className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </View>
        </View>
    );
}

const getScoreColor = (pct: number) => {
    if (pct >= 80) return '#22c55e'; // Green
    if (pct >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
};

export default function QuizHistoryDashboard() {
    const [refreshing, setRefreshing] = useState(false);

    const { data: sessions, isLoading, refetch } = useQuery({
        queryKey: ['quiz-history'],
        queryFn: async () => {
            const res = await api.get('/quizzes/history');
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
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-6 pb-2">
                <Text className="text-3xl font-black text-slate-900 dark:text-white">Quiz History</Text>
                <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Review your past performance and answers</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
                <View className="flex-row justify-between items-end mb-4">
                    <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Past Sessions</Text>
                    {(sessions?.length ?? 0) > 0 && <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs">{sessions!.length} QUIZZES</Text>}
                </View>

                {isLoading ? (
                    <><SkeletonItem /><SkeletonItem /><SkeletonItem /><SkeletonItem /></>
                ) : sessions?.length === 0 ? (
                    <View className="items-center py-10">
                        <View className="size-20 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                            <Ionicons name="time" size={32} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-2">No History Yet</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center px-4 mb-6">
                            Complete a practice quiz to see your results and review answers here.
                        </Text>
                        <View className="w-full px-8 items-center mt-2">
                            <GradientButton
                                onPress={() => router.push('/generate')}
                                icon={<Ionicons name="arrow-forward" size={16} color="white" />}
                                className="px-6 py-3"
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
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm shadow-slate-200 dark:shadow-none"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <Text className="text-slate-900 dark:text-white font-bold text-lg flex-1 mr-4" numberOfLines={2}>
                                    {session.topic}
                                </Text>
                                <View className="items-end bg-slate-50 dark:bg-brand-dark/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <Text className="font-black text-lg" style={{ color: getScoreColor(session.score_percentage) }}>
                                        {Math.round(session.score_percentage)}%
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap items-center mt-1">
                                <View className="flex-row items-center bg-slate-50 dark:bg-brand-dark/50 px-2 py-1 rounded-md mr-3 mb-2">
                                    <Ionicons name="filter" size={12} color="#64748b" />
                                    <Text className="text-slate-600 dark:text-slate-400 font-medium text-xs ml-1.5 capitalize">{session.difficulty}</Text>
                                </View>
                                <View className="flex-row items-center bg-slate-50 dark:bg-brand-dark/50 px-2 py-1 rounded-md mr-3 mb-2">
                                    <Ionicons name="checkmark-circle" size={12} color="#64748b" />
                                    <Text className="text-slate-600 dark:text-slate-400 font-medium text-xs ml-1.5">{session.correct_answers}/{session.total_questions}</Text>
                                </View>
                                {session.time_spent_seconds && (
                                    <View className="flex-row items-center bg-slate-50 dark:bg-brand-dark/50 px-2 py-1 rounded-md mb-2 mr-3">
                                        <Ionicons name="timer-outline" size={12} color="#64748b" />
                                        <Text className="text-slate-600 dark:text-slate-400 font-medium text-xs ml-1">{formatTime(session.time_spent_seconds)}</Text>
                                    </View>
                                )}
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                                    <Text className="text-slate-400 dark:text-slate-500 font-medium text-xs ml-1">
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
