import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { QuizShareCard } from '@/components/QuizShareCard';

type QuizQuestionItem = {
    id: number;
    question: string;
    type: string;
    options: string | null;  // JSON string
    correct_answer: string;
    user_answer: string | null;
    is_correct: boolean;
    explanation: string | null;
};

type QuizSessionDetail = {
    id: number;
    topic: string;
    difficulty: string;
    score_percentage: number;
    total_questions: number;
    correct_answers: number;
    time_spent_seconds: number | null;
    created_at: string;
    questions: QuizQuestionItem[];
};

function HistoryQuestionCard({ q, index }: { q: QuizQuestionItem, index: number }) {
    const isTheory = q.type === 'essay' || q.type === 'theory';
    const parsedOptions: string[] = q.options ? JSON.parse(q.options) : [];

    return (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-4">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                        Question {index + 1}
                    </Text>
                    <Text className="text-slate-900 dark:text-white font-bold text-base leading-snug">
                        {q.question}
                    </Text>
                </View>
                <View className={`ml-3 px-2 py-1 rounded-full flex-row items-center ${q.is_correct ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                    <Ionicons name={q.is_correct ? 'checkmark-circle' : 'close-circle'} size={14} color={q.is_correct ? '#10b981' : '#ef4444'} />
                </View>
            </View>

            {/* Answer Display */}
            {isTheory ? (
                <View className="mt-2 space-y-3">
                    <View className="bg-slate-50 dark:bg-brand-dark/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Model Answer</Text>
                        <Text className="text-slate-700 dark:text-slate-300">{q.correct_answer}</Text>
                    </View>
                    {q.explanation && (
                        <View className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                            <Text className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">AI Feedback</Text>
                            <Text className="text-indigo-900 dark:text-indigo-200">{q.explanation}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View className="mt-2 space-y-2">
                    {parsedOptions.map((opt, i) => {
                        const isSelected = q.user_answer === opt;
                        const isCorrectOpt = q.correct_answer === opt;

                        let bg = 'bg-slate-50 dark:bg-brand-dark/50', border = 'border-slate-100 dark:border-slate-700', text = 'text-slate-500 dark:text-slate-400', icon = null;

                        if (isCorrectOpt) {
                            bg = 'bg-emerald-50 dark:bg-emerald-900/30'; border = 'border-emerald-200 dark:border-emerald-800/50'; text = 'text-emerald-700 dark:text-emerald-400'; icon = 'checkmark-circle';
                        } else if (isSelected && !isCorrectOpt) {
                            bg = 'bg-red-50 dark:bg-red-900/30'; border = 'border-red-200 dark:border-red-800/50'; text = 'text-red-700 dark:text-red-400'; icon = 'close-circle';
                        } else if (isSelected && isCorrectOpt) {
                            // Correct and selected is handled by the first if block
                        }

                        return (
                            <View key={i} className={`flex-row items-center p-3 rounded-xl border ${bg} ${border}`}>
                                <Text className={`flex-1 font-medium ${text}`}>{opt}</Text>
                                {icon && <Ionicons name={icon as any} size={18} color={isCorrectOpt ? '#10b981' : '#ef4444'} />}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* MCQ Explanation */}
            {!isTheory && q.explanation && (
                <View className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <Text className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Explanation</Text>
                    <Text className="text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed">{q.explanation}</Text>
                </View>
            )}
        </View>
    );
}

export default function QuizHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colorScheme } = require('nativewind').useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#010100' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#0f172a';
    const [isSharing, setIsSharing] = useState(false);
    const viewShotRef = useRef<View>(null);

    const { data: session, isLoading } = useQuery({
        queryKey: ['quiz-history', id],
        queryFn: async () => {
            const res = await api.get(`/quizzes/history/${id}`);
            return res.data.data as QuizSessionDetail;
        }
    });

    if (isLoading) return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark justify-center items-center">
            <Stack.Screen options={{ title: 'Loading...', headerStyle: { backgroundColor: bgColor }, headerTintColor: tintColor, headerBackVisible: false, headerShadowVisible: false }} />
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );

    if (!session) return null;

    const getScoreColor = (pct: number) => {
        if (pct >= 80) return 'text-emerald-500 dark:text-emerald-400';
        if (pct >= 60) return 'text-amber-500 dark:text-amber-400';
        return 'text-red-500 dark:text-red-400';
    };

    const dsColor = session.score_percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50' : (session.score_percentage >= 60 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50');

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{
                title: 'Quiz Results',
                headerShown: true,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: tintColor
            }} />

            {/* Hidden capture view for sharing */}
            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <View ref={viewShotRef} collapsable={false}>
                    <QuizShareCard
                        topic={session.topic}
                        percentage={Math.round(session.score_percentage)}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
                {/* Result Overview Card */}
                <View className={`p-6 rounded-3xl border mb-6 items-center shadow-sm shadow-slate-200 dark:shadow-none ${dsColor}`}>
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Score</Text>
                    <Text className={`text-4xl font-black mb-2 ${getScoreColor(session.score_percentage)}`}>
                        {Math.round(session.score_percentage)}%
                    </Text>
                    <Text className="text-slate-700 dark:text-slate-300 font-bold mb-4 text-center">
                        {session.topic}
                    </Text>

                    <View className="flex-row items-center justify-center space-x-4 w-full pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mb-4">
                        <View className="items-center">
                            <Text className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase mb-1">Correct</Text>
                            <Text className="text-slate-700 dark:text-slate-300 font-bold">{session.correct_answers}/{session.total_questions}</Text>
                        </View>
                        <View className="h-6 w-[1px] bg-slate-300 dark:bg-slate-600" />
                        <View className="items-center">
                            <Text className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase mb-1">Diff</Text>
                            <Text className="text-slate-700 dark:text-slate-300 font-bold capitalize">{session.difficulty}</Text>
                        </View>
                        {session.time_spent_seconds && (
                            <>
                                <View className="h-6 w-[1px] bg-slate-300 dark:bg-slate-600" />
                                <View className="items-center">
                                    <Text className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase mb-1">Time</Text>
                                    <Text className="text-slate-700 dark:text-slate-300 font-bold">
                                        {Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={async () => {
                            if (!viewShotRef.current) return;
                            setIsSharing(true);
                            try {
                                const uri = await captureRef(viewShotRef.current, { format: 'png', quality: 1.0 });
                                await Sharing.shareAsync(uri);
                            } catch (e) {
                                console.error(e);
                            } finally {
                                setIsSharing(false);
                            }
                        }}
                        disabled={isSharing}
                        className="flex-row items-center bg-indigo-600 px-6 py-3 rounded-2xl shadow-sm shadow-indigo-300 active:opacity-90"
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="white" className="mr-2" />
                        ) : (
                            <Ionicons name="share-social" size={18} color="white" className="mr-2" />
                        )}
                        <Text className="text-white font-bold">{isSharing ? 'Generating...' : 'Share Results'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Questions List */}
                <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Review Answers</Text>

                {session.questions.map((q, i) => (
                    <HistoryQuestionCard key={q.id} q={q} index={i} />
                ))}

            </ScrollView>
        </View>
    );
}
