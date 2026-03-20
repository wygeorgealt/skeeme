import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { 
    Check, Xmark, CheckCircle, XmarkCircle, LightBulb, MagicWand, 
    NavArrowLeft, ShareAndroid, Page 
} from 'iconoir-react-native';
import { useState, useRef, useEffect } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { QuizShareCard } from '@/components/QuizShareCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import * as Print from 'expo-print';
import { generateQuizHTML } from '@/lib/pdfGenerator';
import { GlowBackground } from '@/components/ui/GlowBackground';
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
        <View className={`mb-10`}>
            {/* Header */}
            <View className="flex-row items-start mb-6">
                <View className={`size-10 rounded-full items-center justify-center mr-4 ${q.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {q.is_correct ? (
                        <Check width={18} height={18} color="#10b981" strokeWidth={2.5} />
                    ) : (
                        <Xmark width={18} height={18} color="#ef4444" strokeWidth={2.5} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-widest mb-2">
                        Question {index + 1}
                    </Text>
                    <MathText
                        content={q.question}
                        color={isDark ? 'white' : '#0f172a'}
                        fontSize={18}
                        containerStyle={{ width: '100%' }}
                    />
                </View>
            </View>

            {/* Answer Display */}
            <View className="pl-14">
                {isTheory ? (
                    <View className="space-y-6">
                        <View>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Model Answer</Text>
                            <MathText
                                content={q.correct_answer}
                                color={isDark ? '#cbd5e1' : '#334155'}
                                fontSize={15}
                            />
                        </View>
                        {q.explanation && (
                            <View className={`p-5 rounded-[24px] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                                <View className="flex-row items-center mb-3">
                                    <MagicWand width={14} height={14} color="#10b981" />
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
                    <View>
                        {parsedOptions.map((opt, i) => {
                            const isSelected = q.user_answer === opt;
                            const isCorrectOpt = q.correct_answer === opt;

                            let bg = 'bg-transparent', 
                                borderColor = isDark ? 'border-white/5' : 'border-slate-100',
                                text = isDark ? 'text-white/40' : 'text-slate-400', 
                                icon = null;

                            if (isCorrectOpt) {
                                bg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'; 
                                text = isDark ? 'text-emerald-400' : 'text-emerald-700'; 
                                icon = 'checkmark-circle';
                            } else if (isSelected && !isCorrectOpt) {
                                bg = isDark ? 'bg-red-500/10' : 'bg-red-50'; 
                                text = isDark ? 'text-red-400' : 'text-red-700'; 
                                icon = 'close-circle';
                            }

                            return (
                                <View key={i} className={`flex-row items-center p-4 h-14 rounded-2xl border mb-3 ${bg} ${borderColor}`}>
                                    <Text className={`flex-1 font-medium text-[14px] ${text}`}>{opt}</Text>
                                    {icon === 'checkmark-circle' && <CheckCircle width={18} height={18} color="#10b981" />}
                                    {icon === 'close-circle' && <XmarkCircle width={18} height={18} color="#ef4444" />}
                                </View>
                            );
                        })}
                        
                        {q.explanation && (
                            <View className={`mt-6 p-5 rounded-[24px] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                                <View className="flex-row items-center mb-3">
                                    <LightBulb width={14} height={14} color="#10b981" />
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
        <GlowBackground useSafeArea>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="px-6 pt-4 pb-6">
                <TouchableOpacity onPress={() => router.back()} className="size-12 rounded-full items-center justify-center bg-white/10">
                    <NavArrowLeft width={24} height={24} color="white" />
                </TouchableOpacity>
            </View>
            <View className="items-center py-10">
                <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 20 }} />
                <SkeletonLoader width={120} height={40} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="60%" height={20} />
            </View>
            <View className={`flex-1 rounded-t-[40px] px-6 pt-10 ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                {[1, 2, 3].map(i => (
                    <View key={i} className="flex-row items-center mb-10">
                        <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                        <View className="flex-1">
                            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                    </View>
                ))}
            </View>
        </GlowBackground>
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
        <GlowBackground useSafeArea>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <View ref={viewShotRef} collapsable={false}>
                    <QuizShareCard
                        topic={session.topic}
                        percentage={Math.round(session.score_percentage)}
                    />
                </View>
            </View>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Custom Header */}
                <View className="px-6 pt-0 pb-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        className={`size-12 rounded-full items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                    >
                        <NavArrowLeft width={24} height={24} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <Text className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quiz Results</Text>
                    <View className="size-12" />
                </View>

                {/* Top Score Area */}
                <View className="items-center pt-6 pb-12">
                    <View className={`size-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        {remark.icon === 'star' && <MagicWand width={36} height={36} color="#8B5CF6" />}
                        {remark.icon === 'trophy' && <MagicWand width={36} height={36} color="#8B5CF6" />}
                        {remark.icon === 'school' && <MagicWand width={36} height={36} color="#8B5CF6" />}
                        {remark.icon === 'trending-up' && <MagicWand width={36} height={36} color="#8B5CF6" />}
                    </View>
                    <Text className="text-brand-primary font-bold text-[13px] uppercase tracking-[0.2em] mb-2">{remark.title}</Text>
                    <Text className={`text-[80px] font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {Math.round(session.score_percentage)}%
                    </Text>
                    <Text className={`text-[15px] p-6 text-center leading-relaxed font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                        {remark.subtitle}
                    </Text>
                </View>

                {/* Bottom Content Container */}
                <View className={`flex-1 rounded-t-[40px] px-6 pt-10 min-h-[600px] ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                    
                    {/* Topic Box - Borderless */}
                    <View className={`p-6 rounded-[24px] mb-8 ${isDark ? 'bg-[#13151B]' : 'bg-slate-50'}`}>
                        <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Topic</Text>
                        <Text className={`text-[18px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.topic}</Text>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row gap-4 mb-10">
                        <View className={`flex-1 p-6 rounded-[24px] ${isDark ? 'bg-[#13151B]' : 'bg-slate-50'}`}>
                            <Text className="text-emerald-500 font-bold text-[11px] uppercase tracking-widest mb-1">Correct</Text>
                            <Text className={`text-[28px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.correct_answers}</Text>
                        </View>
                        <View className={`flex-1 p-6 rounded-[24px] ${isDark ? 'bg-[#13151B]' : 'bg-slate-50'}`}>
                            <Text className="text-red-500 font-bold text-[11px] uppercase tracking-widest mb-1">Missed</Text>
                            <Text className={`text-[28px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.total_questions - session.correct_answers}</Text>
                        </View>
                    </View>

                    {/* Detailed Review Section */}
                    <View className="mb-6 flex-row items-center">
                        <View className="w-1 h-4 bg-[#8B5CF6] rounded-full mr-3" />
                        <Text className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Detailed Review</Text>
                    </View>

                    {session.questions.map((q, i) => (
                        <HistoryQuestionCard key={q.id} q={q} index={i} />
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Buttons */}
            <View className={`absolute bottom-0 left-0 right-0 p-6 flex-row gap-4 border-t ${isDark ? 'bg-[#090A0F]/90 border-white/5' : 'bg-white/90 border-slate-100'}`}>
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={isExporting}
                    activeOpacity={0.7}
                    className={`flex-1 h-[60px] rounded-full flex-row items-center justify-center ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                >
                    {isExporting ? <ActivityIndicator size="small" color={isDark ? 'black' : 'white'} /> : (
                        <>
                            <Page width={20} height={20} color={isDark ? 'black' : 'white'} className="mr-3" />
                            <Text className={`font-bold text-[16px] ${isDark ? 'text-black' : 'text-white'}`}>Save Report</Text>
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
                    activeOpacity={0.7}
                    disabled={isSharing}
                    className="size-[60px] rounded-full items-center justify-center bg-brand-primary"
                >
                    {isSharing ? <ActivityIndicator size="small" color="white" /> : (
                        <ShareAndroid width={20} height={20} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </GlowBackground>
    );
}
