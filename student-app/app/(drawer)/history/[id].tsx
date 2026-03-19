import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
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
import * as Print from 'expo-print';
import { generateQuizHTML } from '@/lib/pdfGenerator';

// Storage helpers
const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            return await FileSystem.readAsStringAsync(path);
        } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                const path = `${FileSystem.documentDirectory}${key}.json`;
                await FileSystem.writeAsStringAsync(path, value);
            }
        } catch { /* ignore */ }
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
        <View className={`rounded-[32px] p-8 border mb-6 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                    <Text className="text-[11px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-3">
                        Question {index + 1}
                    </Text>
                    <MathText
                        content={q.question}
                        color={isDark ? 'white' : '#0f172a'}
                        fontSize={18}
                        containerStyle={{ width: '100%' }}
                    />
                </View>
                <View className={`ml-4 h-10 w-10 rounded-full items-center justify-center ${q.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <Ionicons name={q.is_correct ? 'checkmark' : 'close'} size={20} color={q.is_correct ? '#10b981' : '#ef4444'} />
                </View>
            </View>

            {/* Answer Display */}
            {isTheory ? (
                <View className="space-y-4">
                    <View className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Model Answer</Text>
                        <MathText
                            content={q.correct_answer}
                            color={isDark ? '#cbd5e1' : '#334155'}
                            fontSize={15}
                        />
                    </View>
                    {q.explanation && (
                        <View className={`p-6 rounded-2xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="sparkles" size={14} color="#10b981" />
                                <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest ml-2">AI Feedback</Text>
                            </View>
                            <MathText
                                content={q.explanation}
                                color={isDark ? '#bef264' : '#064e3b'}
                                fontSize={15}
                            />
                        </View>
                    )}
                </View>
            ) : (
                <View className="space-y-3">
                    {parsedOptions.map((opt, i) => {
                        const isSelected = q.user_answer === opt;
                        const isCorrectOpt = q.correct_answer === opt;

                        let bg = isDark ? 'bg-[#0f0f11]' : 'bg-slate-50', 
                            border = isDark ? 'border-slate-800' : 'border-slate-100', 
                            text = isDark ? 'text-slate-400' : 'text-slate-500', 
                            icon = null;

                        if (isCorrectOpt) {
                            bg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'; 
                            border = isDark ? 'border-emerald-500/20' : 'border-emerald-200'; 
                            text = isDark ? 'text-emerald-400' : 'text-emerald-700'; 
                            icon = 'checkmark-circle';
                        } else if (isSelected && !isCorrectOpt) {
                            bg = isDark ? 'bg-red-500/10' : 'bg-red-50'; 
                            border = isDark ? 'border-red-500/20' : 'border-red-200'; 
                            text = isDark ? 'text-red-400' : 'text-red-700'; 
                            icon = 'close-circle';
                        }

                        return (
                            <View key={i} className={`flex-row items-center p-4 rounded-xl border ${bg} ${border}`}>
                                <Text className={`flex-1 font-medium text-[15px] ${text}`}>{opt}</Text>
                                {icon && <Ionicons name={icon as any} size={20} color={isCorrectOpt ? '#10b981' : '#ef4444'} />}
                            </View>
                        );
                    })}
                    
                    {q.explanation && (
                        <View className={`mt-4 p-6 rounded-2xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="bulb-outline" size={14} color="#10b981" />
                                <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest ml-2">Explanation</Text>
                            </View>
                            <MathText
                                content={q.explanation}
                                color={isDark ? '#bef264' : '#064e3b'}
                                fontSize={15}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

export default function QuizHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#121212';
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
            const html = generateQuizHTML(session.topic, session.score_percentage, session.questions);
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });
            await Sharing.shareAsync(uri);
        } catch (err) {
            if (__DEV__) console.warn('Quiz Export failed', err);
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

    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "GENIUS!", subtitle: "Incredible work. You've mastered this topic.", icon: "star" };
        if (pct >= 80) return { title: "GREAT JOB!", subtitle: "Solid understanding. Keep pushing forward!", icon: "trophy" };
        if (pct >= 60) return { title: "GOOD EFFORT!", subtitle: "You're getting there. A quick review will help.", icon: "school" };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: "trending-up" };
    };

    const remark = getRemark(session.score_percentage);

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <Stack.Screen options={{
                title: 'Quiz Results',
                headerShown: true,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: isDark ? '#0f0f11' : '#fafafa' },
                headerTintColor: isDark ? 'white' : '#0f172a'
            }} />

            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <View ref={viewShotRef} collapsable={false}>
                    <QuizShareCard
                        topic={session.topic}
                        percentage={Math.round(session.score_percentage)}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
                {/* Motivational Header */}
                <View className="items-center py-10 pb-6">
                    <View className={`w-24 h-24 rounded-[32px] items-center justify-center mb-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200'}`}>
                        <Ionicons name={remark.icon as any} size={48} color="#D2B48C" />
                    </View>
                    <Text className="text-brand-primary font-bold text-[13px] uppercase tracking-[0.3em] mb-3">{remark.title}</Text>
                    <Text className={`font-black text-[56px] tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.round(session.score_percentage)}%</Text>
                    <Text className="text-slate-500 font-medium text-[16px] mt-4 text-center px-8 leading-relaxed">{remark.subtitle}</Text>
                </View>

                {/* Score Breakdown Area */}
                <View className="flex-row gap-4 mb-10">
                    <View className={`flex-1 rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-2">Topic</Text>
                        <Text className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{session.topic}</Text>
                    </View>
                </View>

                <View className="flex-row gap-4 mb-12">
                    <View className={`flex-1 rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-emerald-500 font-bold text-[11px] uppercase tracking-[0.2em] mb-2">Correct</Text>
                        <Text className={`font-black text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.correct_answers}</Text>
                    </View>
                    <View className={`flex-1 rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-red-500 font-bold text-[11px] uppercase tracking-[0.2em] mb-2">Missed</Text>
                        <Text className={`font-black text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.total_questions - session.correct_answers}</Text>
                    </View>
                </View>

                {/* Questions List */}
                <View className="flex-row items-center mb-6 ml-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-3" />
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">Detailed Review</Text>
                </View>

                {session.questions.map((q, i) => (
                    <HistoryQuestionCard key={q.id} q={q} index={i} />
                ))}

            </ScrollView>

            {/* Sticky Action Footer */}
            <View className="absolute bottom-0 left-0 right-0 py-8 px-6 border-t border-slate-200/20 dark:border-slate-800/30" style={{ backgroundColor: isDark ? 'rgba(15, 15, 17, 0.95)' : 'rgba(250, 250, 250, 0.95)' }}>
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={handleExport}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        className={`flex-1 flex-row items-center justify-center h-[60px] rounded-2xl border ${isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'} shadow-sm`}
                    >
                        {isExporting ? <ActivityIndicator size="small" color={isDark ? '#0f0f11' : 'white'} /> : (
                            <>
                                <Ionicons name="document-text-outline" size={20} color={isDark ? '#0f0f11' : 'white'} style={{ marginRight: 10 }} />
                                <Text className={`font-bold text-[16px] ${isDark ? 'text-slate-900' : 'text-white'}`}>Save Report</Text>
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
                                if (__DEV__) console.error(e);
                            } finally {
                                setIsSharing(false);
                            }
                        }}
                        activeOpacity={0.8}
                        disabled={isSharing}
                        className="w-[60px] h-[60px] rounded-2xl items-center justify-center bg-brand-primary shadow-sm"
                    >
                        {isSharing ? <ActivityIndicator size="small" color="white" /> : (
                            <Ionicons name="share-social" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
