import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { QuizShareCard } from '@/components/QuizShareCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MathText } from '@/components/ui/MathText';

// Storage helpers
const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            return await FileSystem.readAsStringAsync(path);
        } catch (e) { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                const path = `${FileSystem.documentDirectory}${key}.json`;
                await FileSystem.writeAsStringAsync(path, value);
            }
        } catch (e) { /* ignore */ }
    },
};

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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isTheory = q.type === 'essay' || q.type === 'theory';
    const parsedOptions: string[] = q.options ? JSON.parse(q.options) : [];

    return (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-4">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-xs font-bold text-brand-primary dark:text-brand-primary uppercase tracking-widest mb-1">
                        Question {index + 1}
                    </Text>
                    <MathText
                        content={q.question}
                        color={isDark ? 'white' : '#0f172a'}
                        fontSize={16}
                        containerStyle={{ flex: 1 }}
                    />
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
                        <MathText
                            content={q.correct_answer}
                            color={isDark ? '#cbd5e1' : '#334155'}
                            fontSize={14}
                        />
                    </View>
                    {q.explanation && (
                        <View className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                            <Text className="text-xs font-bold text-brand-primary dark:text-brand-primary uppercase tracking-wider mb-2">AI Feedback</Text>
                            <MathText
                                content={q.explanation}
                                color={isDark ? '#bef264' : '#064e3b'}
                                fontSize={14}
                            />
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
                <View className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <Text className="text-xs font-bold text-brand-primary dark:text-brand-primary uppercase tracking-wider mb-1">Explanation</Text>
                    <MathText
                        content={q.explanation || ''}
                        color={isDark ? '#bef264' : '#064e3b'}
                        fontSize={14}
                    />
                </View>
            )}
        </View>
    );
}

export default function QuizHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#282828' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#0f172a';
    const [isSharing, setIsSharing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [cachedSession, setCachedSession] = useState<QuizSessionDetail | null>(null);
    const viewShotRef = useRef<View>(null);

    // Hydrate cache on mount
    useEffect(() => {
        const hydrate = async () => {
            const cacheKey = `cache_quiz_detail_${id}`;
            const cached = await storage.getItem(cacheKey);
            if (cached) setCachedSession(JSON.parse(cached));
        };
        hydrate();
    }, [id]);

    const { data: remoteSession, isLoading } = useQuery({
        queryKey: ['quiz-history', id],
        queryFn: async () => {
            const res = await api.get(`/quizzes/history/${id}`);
            const data = res.data.data as QuizSessionDetail;
            await storage.setItem(`cache_quiz_detail_${id}`, JSON.stringify(data));
            return data;
        }
    });

    const session = remoteSession || cachedSession;

    const handleExport = async () => {
        if (!session) return;
        setIsExporting(true);
        try {
            const response = await api.get(`/quizzes/history/${id}/export`);
            const { base64, filename } = response.data;

            const fileUri = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(fileUri);
        } catch (err) {
            console.warn('Quiz Export failed', err);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading && !session) return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark px-6 pt-12">
            <Stack.Screen options={{ title: 'Loading...', headerShown: true, headerStyle: { backgroundColor: bgColor }, headerTintColor: tintColor, headerBackVisible: false, headerShadowVisible: false }} />

            {/* Header Skeleton */}
            <View className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-8 items-center">
                <SkeletonLoader width={40} height={12} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="40%" height={40} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="60%" height={24} style={{ marginBottom: 20 }} />
                <View className="flex-row justify-center space-x-4 w-full pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <SkeletonLoader width={60} height={30} />
                    <SkeletonLoader width={60} height={30} />
                </View>
            </View>

            {/* Questions Skeleton */}
            <SkeletonLoader width={120} height={16} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
                <View key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 mb-4">
                    <SkeletonLoader width={80} height={12} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="90%" height={20} style={{ marginBottom: 12 }} />
                    <SkeletonLoader width="100%" height={48} borderRadius={12} />
                </View>
            ))}
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

            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <View ref={viewShotRef} collapsable={false}>
                    <QuizShareCard
                        topic={session.topic}
                        percentage={Math.round(session.score_percentage)}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
                <View className={`p-6 rounded-3xl border mb-6 items-center shadow-sm shadow-slate-200 dark:shadow-none ${dsColor}`}>
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Score</Text>
                    <Text className={`text-4xl font-black mb-2 ${getScoreColor(session.score_percentage)}`}>
                        {Math.round(session.score_percentage)}%
                    </Text>
                    <Text className="text-slate-700 dark:text-slate-300 font-bold mb-4 text-center">
                        {session.topic}
                    </Text>

                    <View className="flex-row items-center justify-center space-x-4 w-full pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mb-6">
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

                    <View className="flex-row gap-3 w-full">
                        <TouchableOpacity
                            onPress={handleExport}
                            disabled={isExporting}
                            className="flex-1 flex-row items-center justify-center bg-slate-900 dark:bg-white px-4 py-4 rounded-2xl active:opacity-90"
                        >
                            {isExporting ? <ActivityIndicator size="small" color={isDark ? '#0f172a' : 'white'} /> : (
                                <>
                                    <Ionicons name="download-outline" size={18} color={isDark ? '#0f172a' : 'white'} style={{ marginRight: 8 }} />
                                    <Text className="text-white dark:text-slate-900 font-black">Export PDF</Text>
                                </>
                            )}
                        </TouchableOpacity>

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
                            className="flex-1 flex-row items-center justify-center bg-brand-primary px-4 py-4 rounded-2xl active:opacity-90"
                        >
                            {isSharing ? <ActivityIndicator size="small" color="white" /> : (
                                <>
                                    <Ionicons name="share-social" size={18} color="white" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-black">Share</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
