import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, Platform, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

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

type FlashcardDeck = {
    id: number;
    title: string;
    flashcards_count: number;
    created_at: string;
};

// Storage helpers using FileSystem for larger cache data
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

export default function StudyHistoryDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Offline Cache States
    const [cachedQuizzes, setCachedQuizzes] = useState<QuizSession[]>([]);
    const [cachedDecks, setCachedDecks] = useState<FlashcardDeck[]>([]);

    // Hydrate cache on mount
    useEffect(() => {
        const hydrate = async () => {
            const q = await storage.getItem('cache_quiz_history');
            const d = await storage.getItem('cache_flashcard_decks');
            if (q) setCachedQuizzes(JSON.parse(q));
            if (d) setCachedDecks(JSON.parse(d));
        };
        hydrate();
    }, []);

    const { data: quizSessions, isLoading: loadingQuizzes, refetch: refetchQuizzes } = useQuery({
        queryKey: ['quiz-history'],
        queryFn: async () => {
            const res = await api.get('quizzes/history');
            const data = (res.data.data || []) as QuizSession[];
            await storage.setItem('cache_quiz_history', JSON.stringify(data));
            return data;
        },
        enabled: true,
    });

    const { data: flashcardDecks, isLoading: loadingDecks, refetch: refetchDecks } = useQuery({
        queryKey: ['flashcard-history'],
        queryFn: async () => {
            const res = await api.get('flashcards/decks');
            const data = (res.data.data || []) as FlashcardDeck[];
            await storage.setItem('cache_flashcard_decks', JSON.stringify(data));
            return data;
        },
        enabled: true,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'quizzes') await refetchQuizzes();
            else await refetchDecks();
        } catch { }
        setRefreshing(false);
    }, [refetchQuizzes, refetchDecks, activeTab]);

    const quizzes = quizSessions || cachedQuizzes;
    const decks = flashcardDecks || cachedDecks;
    const isLoading = activeTab === 'quizzes' ? loadingQuizzes : loadingDecks;

    // Use standard effect for refetching on tab change
    useEffect(() => {
        if (activeTab === 'quizzes') refetchQuizzes();
        else refetchDecks();
    }, [activeTab, refetchQuizzes, refetchDecks]);

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            {/* Header */}
            <View className="px-6 py-8 pb-3">
                <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Study History</Text>

                {/* Segmented Control */}
                <View className={`flex-row p-1.5 mt-8 rounded-[24px] border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    {(['quizzes', 'flashcards'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                            className={`flex-1 items-center justify-center py-3.5 rounded-[18px] ${activeTab === tab ? (isDark ? 'bg-slate-800' : 'bg-slate-900') : ''}`}
                        >
                            <Text className={`font-bold text-[13px] uppercase tracking-widest ${activeTab === tab ? 'text-white' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2B48C" />}
                showsVerticalScrollIndicator={false}
            >
                {isLoading && quizzes.length === 0 && decks.length === 0 ? (
                    <View>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </View>
                ) : activeTab === 'quizzes' ? (
                    quizzes.length === 0 ? (
                        <View className={`items-center py-20 border-2 border-dashed rounded-[40px] ${isDark ? 'bg-[#161618]/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <Ionicons name="time-outline" size={40} color="#D2B48C" style={{ opacity: 0.5 }} />
                            <Text className="text-slate-500 font-medium text-[14px] text-center px-10 leading-relaxed mt-4">
                                Complete a practice quiz to see results here.
                            </Text>
                        </View>
                    ) : (
                        quizzes.map(session => (
                            <QuizCard key={session.id} session={session} isDark={isDark} />
                        ))
                    )
                ) : (
                    decks.length === 0 ? (
                        <View className={`items-center py-20 border-2 border-dashed rounded-[40px] ${isDark ? 'bg-[#161618]/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <Ionicons name="layers-outline" size={40} color="#D2B48C" style={{ opacity: 0.5 }} />
                            <Text className="text-slate-500 font-medium text-[14px] text-center px-10 leading-relaxed mt-4">
                                Generate some flashcards to start studying.
                            </Text>
                        </View>
                    ) : (
                        decks.map(deck => (
                            <DeckCard key={deck.id} deck={deck} isDark={isDark} />
                        ))
                    )
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}

function QuizCard({ session, isDark }: { session: QuizSession; isDark: boolean }) {
    const getScoreColor = (pct: number) => {
        if (pct >= 80) return '#D2B48C';
        if (pct >= 60) return '#FCD34D';
        return '#ef4444';
    };

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
            activeOpacity={0.8}
            className={`p-6 rounded-[32px] border mb-6 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
        >
            <View className="flex-row justify-between items-start mb-6">
                <Text className={`font-bold text-[19px] tracking-tight flex-1 mr-4 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                    {session.topic}
                </Text>
                <View className={`px-4 py-2 rounded-2xl border-2`} style={{ borderColor: getScoreColor(session.score_percentage) + '40', backgroundColor: getScoreColor(session.score_percentage) + '10' }}>
                    <Text className="font-bold text-[16px]" style={{ color: getScoreColor(session.score_percentage) }}>
                        {Math.round(session.score_percentage)}%
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center border-t border-slate-50 dark:border-slate-800/50 pt-5">
                <View className={`flex-row items-center px-3 py-1.5 rounded-xl border mr-4 ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Ionicons name="flash-outline" size={14} color="#D2B48C" />
                    <Text className={`font-bold text-[11px] ml-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {session.difficulty}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text className="text-slate-400 font-bold text-[11px] ml-1.5 uppercase tracking-widest">
                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function DeckCard({ deck, isDark }: { deck: FlashcardDeck; isDark: boolean }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            activeOpacity={0.8}
            className={`p-6 rounded-[32px] border mb-6 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
        >
            <View className="flex-row justify-between items-start mb-6">
                <Text className={`font-bold text-[19px] tracking-tight flex-1 mr-4 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                    {deck.title}
                </Text>
                <View className={`p-2 rounded-xl ${isDark ? 'bg-brand-primary/10' : 'bg-slate-50'}`}>
                    <Ionicons name="layers-outline" size={20} color="#D2B48C" />
                </View>
            </View>

            <View className="flex-row items-center border-t border-slate-50 dark:border-slate-800/50 pt-5">
                <View className={`flex-row items-center px-3 py-1.5 rounded-xl border mr-4 ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Text className={`font-bold text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {deck.flashcards_count} Cards
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text className="text-slate-400 font-bold text-[11px] ml-1.5 uppercase tracking-widest">
                        {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
