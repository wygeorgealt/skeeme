import { View, Text, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, Platform, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
    Menu, Activity, MultiplePages, Page, NavArrowRight, 
    Search, Filter, Calendar
} from 'iconoir-react-native';
import { router, useNavigation } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();

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
        <GlowBackground>
            {/* Header with drawer toggle */}
            <View style={{ paddingTop: Math.max(insets.top, 16) }} className="px-6 pb-6 flex-row items-center justify-between">
                <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>History</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-12 rounded-full items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                >
                    <Menu width={22} height={22} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            {/* Segmented Control - Minimalist */}
            <View className="px-6 mb-8">
                <View className={`flex-row p-1 rounded-full ${isDark ? 'bg-[#13151B]' : 'bg-slate-100'}`}>
                    {(['quizzes', 'flashcards'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                            className={`flex-1 items-center justify-center py-2.5 rounded-full ${activeTab === tab ? (isDark ? 'bg-white/10' : 'bg-white shadow-sm') : ''}`}
                        >
                            <Text className={`font-bold text-[12px] capitalize ${activeTab === tab ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-white/40' : 'text-slate-400')}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Bottom Half Container Content */}
            <View className={`flex-1 rounded-t-[40px] px-6 pt-8 ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                <ScrollView
                    className="flex-1"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
                    showsVerticalScrollIndicator={false}
                >
                {isLoading && quizzes.length === 0 && decks.length === 0 ? (
                    <View className="space-y-6">
                        <View className="flex-row items-center">
                            <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                            <View className="flex-1">
                                <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
                                <SkeletonLoader width="30%" height={12} />
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                            <View className="flex-1">
                                <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                                <SkeletonLoader width="40%" height={12} />
                            </View>
                        </View>
                    </View>
                ) : activeTab === 'quizzes' ? (
                    quizzes.length === 0 ? (
                        <View className={`items-center py-20 border-2 border-dashed rounded-[28px] ${isDark ? 'bg-[#13151B]/50 border-transparent' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <Calendar width={40} height={40} color="#8B5CF6" style={{ opacity: 0.5 }} />
                            <Text className="text-slate-500 font-medium text-[13px] text-center px-10 leading-relaxed mt-4">
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
                        <View className={`items-center py-20 border-2 border-dashed rounded-[28px] ${isDark ? 'bg-[#13151B]/50 border-transparent' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <MultiplePages width={40} height={40} color="#8B5CF6" style={{ opacity: 0.5 }} />
                            <Text className="text-slate-500 font-medium text-[13px] text-center px-10 leading-relaxed mt-4">
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
        </GlowBackground>
    );
}

function QuizCard({ session, isDark }: { session: QuizSession; isDark: boolean }) {
    const getScoreColor = (pct: number) => {
        if (pct >= 80) return '#8B5CF6';
        if (pct >= 60) return '#fbbf24';
        return '#ef4444';
    };

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-8"
        >
            <View className="flex-row items-center flex-1 pr-4">
                <View className={`size-12 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-[#13151B]' : 'bg-slate-50'}`}>
                    <Calendar width={20} height={20} color={getScoreColor(session.score_percentage)} />
                </View>
                <View className="flex-1">
                    <Text className={`text-[16px] font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                        {session.topic}
                    </Text>
                    <Text className={`text-[13px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {session.difficulty}
                    </Text>
                </View>
            </View>
            <View className="items-end">
                <Text className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {Math.round(session.score_percentage)}%
                </Text>
                <Text className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    {session.correct_answers}/{session.total_questions}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function DeckCard({ deck, isDark }: { deck: FlashcardDeck; isDark: boolean }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-8"
        >
            <View className="flex-row items-center flex-1 pr-4">
                <View className={`size-12 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-[#13151B]' : 'bg-slate-50'}`}>
                    <MultiplePages width={20} height={20} color="#8B5CF6" />
                </View>
                <View className="flex-1 ml-4 justify-center">
                    <Text className={`text-[16px] font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                        {deck.title}
                    </Text>
                    <Text className={`text-[13px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                        {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
            <View className="items-end">
                <Text className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {deck.flashcards_count}
                </Text>
                <Text className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    Cards
                </Text>
            </View>
        </TouchableOpacity>
    );
}
