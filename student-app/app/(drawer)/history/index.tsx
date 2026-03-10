import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, Platform, ActivityIndicator, StyleSheet } from 'react-native';
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
        } catch (e) { }
        setRefreshing(false);
    }, [refetchQuizzes, refetchDecks, activeTab]);

    const quizzes = quizSessions || cachedQuizzes;
    const decks = flashcardDecks || cachedDecks;
    const isLoading = activeTab === 'quizzes' ? loadingQuizzes : loadingDecks;

    // Use standard effect for refetching on tab change
    useEffect(() => {
        if (activeTab === 'quizzes') refetchQuizzes();
        else refetchDecks();
    }, [activeTab]);

    return (
        <View style={styles.container} className="flex-1 bg-white dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-8 pb-3">
                <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white">Study History</Text>

                {/* Segmented Control using inline styles for stability */}
                <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mt-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('quizzes')}
                        style={[
                            styles.tabButton,
                            activeTab === 'quizzes' && { backgroundColor: isDark ? '#2EBD85' : 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'quizzes' ? { color: isDark ? 'white' : '#0f172a', fontWeight: '900' } : { color: '#94a3b8' }
                        ]}>Quizzes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('flashcards')}
                        style={[
                            styles.tabButton,
                            activeTab === 'flashcards' && { backgroundColor: isDark ? '#2EBD85' : 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'flashcards' ? { color: isDark ? 'white' : '#0f172a', fontWeight: '900' } : { color: '#94a3b8' }
                        ]}>Flashcards</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "#0f172a"} />}
                showsVerticalScrollIndicator={false}
            >
                {isLoading && quizzes.length === 0 && decks.length === 0 ? (
                    <View className="py-2">
                        {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                    </View>
                ) : activeTab === 'quizzes' ? (
                    quizzes.length === 0 ? (
                        <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50">
                            <Text className="text-slate-500 font-bold text-[14px] text-center px-8 leading-relaxed">Complete a practice quiz to see results here.</Text>
                        </View>
                    ) : (
                        quizzes.map(session => (
                            <QuizCard key={session.id} session={session} />
                        ))
                    )
                ) : (
                    decks.length === 0 ? (
                        <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50">
                            <Text className="text-slate-500 font-bold text-[14px] text-center px-8 leading-relaxed">Generate some flashcards to start studying.</Text>
                        </View>
                    ) : (
                        decks.map(deck => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))
                    )
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
    }
});

function QuizCard({ session }: { session: QuizSession }) {
    const getScoreColor = (pct: number) => {
        if (pct >= 80) return '#2EBD85';
        if (pct >= 60) return '#FCD34D';
        return '#ef4444';
    };

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
            className="bg-brand-primary/5 dark:bg-brand-primary/5 p-6 rounded-[24px] border border-brand-primary/20 dark:border-brand-primary/30 mb-4 overflow-hidden"
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
            <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-[11px] ml-1">
                    {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
                <View className="mx-3 w-1 h-1 bg-slate-300 rounded-full" />
                <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">{session.difficulty}</Text>
            </View>
        </TouchableOpacity>
    );
}

function DeckCard({ deck }: { deck: FlashcardDeck }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            className="bg-brand-primary/5 dark:bg-brand-primary/5 p-6 rounded-[24px] border border-brand-primary/20 dark:border-brand-primary/30 mb-4 overflow-hidden"
            activeOpacity={0.8}
        >
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-slate-900 dark:text-white font-black text-[19px] tracking-tight flex-1 mr-4" numberOfLines={2}>
                    {deck.title}
                </Text>
                <Ionicons name="albums-outline" size={24} color="#2EBD85" />
            </View>
            <View className="flex-row items-center">
                <View className="bg-brand-primary/10 dark:bg-brand-primary/20 px-3 py-1 rounded-full border border-brand-primary/20 dark:border-brand-primary/30 mr-3">
                    <Text className="text-brand-primary dark:text-brand-primary font-bold text-[11px] lowercase tracking-widest">{deck.flashcards_count} Cards</Text>
                </View>
                <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-[11px] ml-1">
                    {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
