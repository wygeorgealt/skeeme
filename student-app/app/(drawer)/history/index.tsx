import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
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

type FlashcardDeck = {
    id: number;
    title: string;
    flashcards_count: number;
    created_at: string;
};

// Platform-safe storage helpers (consistent with authStore)
const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        const SecureStore = await import('expo-secure-store');
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        await SecureStore.setItemAsync(key, value);
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
            const data = res.data.data as QuizSession[];
            await storage.setItem('cache_quiz_history', JSON.stringify(data));
            return data;
        }
    });

    const { data: flashcardDecks, isLoading: loadingDecks, refetch: refetchDecks } = useQuery({
        queryKey: ['flashcard-history'],
        queryFn: async () => {
            const res = await api.get('flashcards/decks');
            const data = res.data.data as FlashcardDeck[];
            await storage.setItem('cache_flashcard_decks', JSON.stringify(data));
            return data;
        }
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (activeTab === 'quizzes') await refetchQuizzes();
        else await refetchDecks();
        setRefreshing(false);
    }, [refetchQuizzes, refetchDecks, activeTab]);

    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'quizzes') refetchQuizzes();
            else refetchDecks();
        }, [refetchQuizzes, refetchDecks, activeTab])
    );

    const quizzes = quizSessions || cachedQuizzes;
    const decks = flashcardDecks || cachedDecks;
    const isLoading = activeTab === 'quizzes' ? loadingQuizzes : loadingDecks;

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-8 pb-4">
                <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white">Study History</Text>

                {/* Segmented Control */}
                <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mt-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('quizzes')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'quizzes' ? 'bg-white dark:bg-brand-primary shadow-sm' : ''}`}
                    >
                        <Text className={`font-black text-sm ${activeTab === 'quizzes' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Quizzes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('flashcards')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'flashcards' ? 'bg-white dark:bg-brand-primary shadow-sm' : ''}`}
                    >
                        <Text className={`font-black text-sm ${activeTab === 'flashcards' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Flashcards</Text>
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
                    <View className="py-12 items-center">
                        <Text className="text-slate-400 font-bold">Loading your progress...</Text>
                    </View>
                ) : activeTab === 'quizzes' ? (
                    quizzes.length === 0 ? <NoHistory message="Complete a practice quiz to see results here." /> :
                        quizzes.map(session => <QuizCard key={session.id} session={session} />)
                ) : (
                    decks.length === 0 ? <NoHistory message="Generate some flashcards to start studying." /> :
                        decks.map(deck => <DeckCard key={deck.id} deck={deck} isDark={isDark} />)
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}

function NoHistory({ message }: { message: string }) {
    return (
        <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50">
            <Text className="text-slate-500 font-bold text-[14px] text-center px-8 leading-relaxed">{message}</Text>
        </View>
    );
}

function QuizCard({ session }: { session: QuizSession }) {
    const getScoreColor = (pct: number) => {
        if (pct >= 80) return '#2EBD85';
        if (pct >= 60) return '#FCD34D';
        return '#ef4444';
    };

    return (
        <TouchableOpacity
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

function DeckCard({ deck, isDark }: { deck: FlashcardDeck, isDark: boolean }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4"
            activeOpacity={0.8}
        >
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-slate-900 dark:text-white font-black text-[19px] tracking-tight flex-1 mr-4" numberOfLines={2}>
                    {deck.title}
                </Text>
                <Ionicons name="albums-outline" size={24} color="#6366f1" />
            </View>
            <View className="flex-row items-center">
                <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 mr-3">
                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] lowercase tracking-widest">{deck.flashcards_count} Cards</Text>
                </View>
                <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-[11px] ml-1">
                    {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
