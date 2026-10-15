import { Pressable, Text, View, TouchableOpacity, TextInput, SectionList, RefreshControl, Platform, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { Icon } from '@/components/ui/Icon';
import Svg, { Circle } from 'react-native-svg';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

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
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards' | 'summaries'>('quizzes');
    const { user } = useAuthStore();
    
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    // Offline Cache States
    const [cachedQuizzes, setCachedQuizzes] = useState<QuizSession[]>([]);
    const [cachedDecks, setCachedDecks] = useState<FlashcardDeck[]>([]);
    const [cachedSummaries, setCachedSummaries] = useState<any[]>([]);

    useEffect(() => {
        const hydrate = async () => {
            const q = await storage.getItem('cache_quiz_history');
            const d = await storage.getItem('cache_flashcard_decks');
            const s = await storage.getItem('cache_saved_summaries');
            if (q) setCachedQuizzes(JSON.parse(q));
            if (d) setCachedDecks(JSON.parse(d));
            if (s) setCachedSummaries(JSON.parse(s));
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
        haptics.impactAsync();
        setRefreshing(true);
        try {
            if (activeTab === 'quizzes') await refetchQuizzes();
            else if (activeTab === 'flashcards') await refetchDecks();
        } catch {
            Alert.alert('Refresh Failed', 'Couldn\'t load your history. Check your connection and try again.');
        }
        setRefreshing(false);
    }, [refetchQuizzes, refetchDecks, activeTab]);

    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }: { id: number; type: 'quiz' | 'flashcard' }) => {
            const url = type === 'quiz' ? `quizzes/history/${id}` : `flashcards/decks/${id}`;
            return api.delete(url);
        },
        onSuccess: (_, variables) => {
            haptics.notificationAsync('success' as any);
            const queryKey = variables.type === 'quiz' ? ['quiz-history'] : ['flashcard-history'];
            queryClient.invalidateQueries({ queryKey });
            
            if (variables.type === 'flashcard') {
                queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
            }
        },
        onError: (err: any) => {
            Alert.alert('Delete Failed', err.response?.data?.message || 'Could not delete entry.');
        }
    });

    const handleDelete = (id: number, title: string, type: 'quiz' | 'flashcard') => {
        haptics.impactAsync();
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate({ id, type }) }
            ]
        );
    };

    const quizzes = quizSessions || cachedQuizzes;
    const decks = flashcardDecks || cachedDecks;
    const summaries = cachedSummaries;

    const totalSessions = quizzes.length + decks.length + summaries.length;
    const totalScore = quizzes.length > 0 ? quizzes.reduce((acc, q) => acc + (Number(q.score_percentage) || 0), 0) : 0;
    const avgMastery = quizzes.length > 0 ? Math.round(totalScore / quizzes.length) : 0;
    const totalSeconds = quizzes.reduce((acc, q) => acc + (Number(q.time_spent_seconds) || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60) + (decks.length * 5);
    const studyTimeText = totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)}h` : `${totalMinutes}m`;
    
    let currentData: any[] = [];
    let isLoading = false;
    
    if (activeTab === 'quizzes') {
        currentData = quizzes;
        isLoading = loadingQuizzes;
    } else if (activeTab === 'flashcards') {
        currentData = decks;
        isLoading = loadingDecks;
    } else {
        currentData = summaries;
    }

    useEffect(() => {
        if (activeTab === 'quizzes') refetchQuizzes();
        else if (activeTab === 'flashcards') refetchDecks();
    }, [activeTab, refetchQuizzes, refetchDecks]);
    
    const getSections = (items: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups: Record<string, any[]> = {
            'Today': [],
            'Yesterday': [],
            'This Week': [],
            'Older': []
        };

        items.forEach(item => {
            const itemDate = new Date(item.created_at);
            if (itemDate >= today) groups['Today'].push(item);
            else if (itemDate >= yesterday) groups['Yesterday'].push(item);
            else if (itemDate >= weekAgo) groups['This Week'].push(item);
            else groups['Older'].push(item);
        });

        return [
            { title: 'Today', data: groups['Today'] },
            { title: 'Yesterday', data: groups['Yesterday'] },
            { title: 'This Week', data: groups['This Week'] },
            { title: 'Older', data: groups['Older'] }
        ].filter(g => g.data.length > 0);
    };

    const sections = getSections(isLoading && currentData.length === 0 ? [] : currentData);

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScreenHeader
                title="History"
                onBack={() => (router.canGoBack() ? router.back() : router.replace('/(drawer)' as any))}
            />
            <View className="px-5 pb-4">
                <View className="mt-2 gap-4">
                    {/* Search Pill */}
                    <View className="relative w-full justify-center">
                        <View className="absolute left-3 z-10">
                            <Icon name="Search" size={18} color="textSecondary" />
                        </View>
                        <TextInput 
                            className="w-full h-12 pl-10 pr-4 rounded-full"
                            style={{
                                fontSize: 13,
                                fontWeight: '400',
                                backgroundColor: C.card,
                                color: C.text,
                                borderColor: C.border,
                                borderWidth: 1,
                            }}
                            placeholder="Search past sessions, topics, formulas..."
                            placeholderTextColor={C.textSecondary}
                        />
                    </View>

                    {/* Quick Stats Bento Banner */}
                    <View
                        style={{
                            backgroundColor: C.card,
                            borderColor: C.border,
                            borderWidth: 1,
                        }}
                        className="flex-row rounded-[24px] p-2 gap-2 shadow-sm"
                    >
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F4F3F8' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: C.text }}>
                                {totalSessions}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }} className="mt-0.5">Sessions</Text>
                        </View>
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <View className="flex-row items-center gap-1">
                                <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: C.primary }}>
                                    {avgMastery}%
                                </Text>
                                <Icon name="TrendingUp" size={14} color="primary" />
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }} className="mt-0.5">Avg Mastery</Text>
                        </View>
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F4F3F8' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: C.text }}>
                                {studyTimeText}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }} className="mt-0.5">Study Time</Text>
                        </View>
                    </View>

                    {/* Segmented Control with Counts */}
                    <View
                        style={{
                            flexDirection: 'row',
                            padding: 4,
                            borderRadius: 999,
                            backgroundColor: C.card,
                            borderColor: C.border,
                            borderWidth: 1,
                        }}
                    >
                        {[
                            { key: 'quizzes', label: 'Quizzes', count: quizzes.length },
                            { key: 'flashcards', label: 'Decks', count: decks.length },
                            { key: 'summaries', label: 'Summaries', count: summaries.length },
                        ].map(({ key, label, count }) => {
                            const isActive = activeTab === key;
                            return (
                                <Pressable
                                    key={key}
                                    onPress={() => {
                                        haptics.impactAsync();
                                        setActiveTab(key as any);
                                    }}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 8,
                                        paddingHorizontal: 4,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 999,
                                        backgroundColor: isActive ? C.primary : 'transparent',
                                        shadowColor: isActive ? C.primary : undefined,
                                        shadowOffset: isActive ? { width: 0, height: 2 } : undefined,
                                        shadowOpacity: isActive ? 0.2 : 0,
                                        shadowRadius: isActive ? 4 : 0,
                                        elevation: isActive ? 2 : 0,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: isActive ? '700' : '500',
                                            color: isActive ? '#FFFFFF' : C.textSecondary,
                                        }}
                                    >
                                        {label}{' '}
                                        <Text style={{ opacity: isActive ? 0.85 : 0.6, fontSize: 12, fontWeight: '400', color: isActive ? '#FFFFFF' : C.textSecondary }}>
                                            ({count})
                                        </Text>
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>

            <Animated.View entering={FadeInDown.delay(160).duration(400)} className="flex-1 px-5">
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item.id.toString() + index}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.textSecondary} />}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title, data } }) => (
                        <View className="flex-row items-center justify-between mt-4 mb-2 ml-1 mr-1">
                            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary }} className="uppercase">
                                {title}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: C.primary }}>
                                {data.length} items
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const isQuiz = activeTab === 'quizzes';
                        const isFlashcard = activeTab === 'flashcards';
                        const id = item.id;
                        const title = isQuiz ? (item as QuizSession).topic : (item as FlashcardDeck).title;

                        const renderRightActions = () => (
                            <View style={{ width: 90 }}>
                                <Pressable 
                                    style={{ 
                                        backgroundColor: C.destructive, 
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center', 
                                        width: 200,
                                        height: '100%', 
                                        position: 'absolute',
                                        right: 0,
                                        borderRadius: 24,
                                        marginBottom: 12
                                    }}
                                    onPress={() => handleDelete(id, title, isQuiz ? 'quiz' : 'flashcard')}
                                >
                                    <View style={{ width: 90, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon name="Trash2" size={24} color="white" />
                                    </View>
                                </Pressable>
                            </View>
                        );

                        return (
                            <Swipeable 
                                renderRightActions={renderRightActions} 
                                overshootRight={false} 
                            >
                                {isQuiz ? (
                                    <QuizCard session={item as QuizSession} isDark={isDark} C={C} />
                                ) : isFlashcard ? (
                                    <DeckCard deck={item as FlashcardDeck} isDark={isDark} C={C} />
                                ) : (
                                    <SummaryCard item={item} isDark={isDark} C={C} />
                                )}
                            </Swipeable>
                        );
                    }}
                    ListEmptyComponent={() => {
                        if (isLoading) return null;
                        return (
                            <View className="items-center justify-center py-20 px-10">
                                <View
                                    style={{ backgroundColor: isDark ? C.card : '#F4F3F8' }}
                                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                >
                                    <Icon name="FolderOpen" size={32} color="textSecondary" />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }} className="mb-2">No history yet</Text>
                                <Text style={{ fontSize: 14, color: C.textSecondary }} className="text-center">
                                    {activeTab === 'quizzes' ? 'Complete a practice quiz to view your scores here.' : activeTab === 'flashcards' ? 'Generate flashcard sets to start studying.' : 'No summaries available.'}
                                </Text>
                            </View>
                        );
                    }}
                    ListFooterComponent={
                        sections.length > 0 ? (
                            <View className="pt-6 pb-12 flex-col items-center gap-3">
                                <View className="flex-row items-center justify-center gap-4">
                                    <Text style={{ color: C.textTertiary }}>•</Text>
                                    <Pressable className="flex-row items-center gap-1.5 active:opacity-70">
                                        <Icon name="Trash2" size={16} color="textSecondary" />
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.textSecondary }}>Clear Archive</Text>
                                    </Pressable>
                                </View>
                                <Text style={{ fontSize: 13, color: C.textSecondary }}>Showing recent cloud synced sessions.</Text>
                            </View>
                        ) : null
                    }
                    contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 90 }}
                />
            </Animated.View>
        </View>
    );
}

function SummaryCard({ item, isDark, C }: { item: any; isDark: boolean; C: any }) {
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderColor: C.border,
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: C.surfaceLow, borderColor: C.border, borderWidth: 1 }}
                    >
                        <Icon name="BookOpen" size={22} color="default" />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: C.selectedBackground }}
                            >
                                <Text style={{ color: C.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                                    {item.subject || 'Summary'}
                                </Text>
                            </View>
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary }}>
                                    Summary + Map
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text }} className="mt-1" numberOfLines={1}>
                            {item.title || 'Alkene Addition Reactions'}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '400', color: C.textSecondary }} className="mt-0.5">
                            {item.subtitle || '4 Key Reaction Formulas • Mind Map Included'}
                        </Text>
                    </View>
                </View>
                <Icon name="Paperclip" size={18} color="textSecondary" style={{ marginTop: 4 }} />
            </View>

            {/* Concepts preview pills */}
            <View className="flex-row items-center gap-2 overflow-hidden py-1">
                <View
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                    className="px-2.5 py-1 rounded-xl flex-row items-center gap-1.5"
                >
                    <Icon name="FlaskConical" size={13} color="textSecondary" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>Markovnikov Rule</Text>
                </View>
                <View
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                    className="px-2.5 py-1 rounded-xl flex-row items-center gap-1.5"
                >
                    <Icon name="Network" size={13} color="textSecondary" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>Visual Map</Text>
                </View>
                <View
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                    className="px-2.5 py-1 rounded-xl"
                >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>+2 more</Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between pt-1">
                <Pressable
                    className="h-10 px-5 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                    style={{ backgroundColor: C.primary }}
                    onPress={() => router.push('/(drawer)/summary' as any)}
                >
                    <Icon name="BookOpen" size={16} color="white" />
                    <Text className="text-white" style={{ fontSize: 14, fontWeight: '600' }}>Read Summary</Text>
                </Pressable>
            </View>
        </View>
    );
}

function QuizCard({ session, isDark, C }: { session: QuizSession; isDark: boolean; C: any }) {
    const pct = session.score_percentage || 0;
    const subjectTag = session.topic ? (session.topic.split(' ')[0] || 'Quiz') : 'Quiz';
    const difficultyTag = session.difficulty ? (session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)) : 'Practice';
    
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderColor: C.border,
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        style={{ backgroundColor: C.selectedBackground, borderColor: C.selectedBorder, borderWidth: 1 }}
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                    >
                        <Icon name="CheckCircle2" size={20} color="primary" />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                style={{ backgroundColor: C.selectedBackground }}
                                className="px-2 py-0.5 rounded-full"
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.primary }}>{subjectTag}</Text>
                            </View>
                            <View
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                                className="px-2 py-0.5 rounded-full"
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary }}>
                                    {difficultyTag}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text }} className="mt-1" numberOfLines={1}>
                            {session.topic}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '400', color: C.textSecondary }} className="mt-0.5">
                            {session.total_questions} Questions • {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                
                <View className="items-end shrink-0">
                    <View
                        style={{ backgroundColor: C.selectedBackground }}
                        className="w-12 h-12 rounded-full items-center justify-center relative"
                    >
                        <Svg width={48} height={48} viewBox="0 0 36 36" style={{ transform: [{ rotate: '-90deg' }] }}>
                            <Circle cx="18" cy="18" r="15.9155" fill="none" stroke={isDark ? '#2C2C2E' : '#E3E2E7'} strokeWidth="3.5" />
                            <Circle cx="18" cy="18" r="15.9155" fill="none" stroke={C.primary} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
                        </Svg>
                        <View className="absolute inset-0 items-center justify-center">
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }}>{Math.round(pct)}%</Text>
                        </View>
                    </View>
                </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-2">
                    <Pressable
                        style={{ backgroundColor: C.primary }}
                        className="h-10 px-4 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                        onPress={() => router.push({ pathname: '/(drawer)/generate', params: { topic: session.topic } } as any)}
                    >
                        <Icon name="RotateCcw" size={16} color="white" />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Retake</Text>
                    </Pressable>
                    <Pressable
                        style={{ backgroundColor: C.surfaceLow, borderColor: C.border, borderWidth: 1 }}
                        className="h-10 px-4 rounded-full flex-row items-center gap-1 active:opacity-80"
                        onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
                    >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>Review</Text>
                        <Icon name="ChevronRight" size={16} color="secondary" />
                    </Pressable>
                </View>
                <Pressable
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    className="w-10 h-10 rounded-full items-center justify-center active:bg-surface-container-low"
                    onPress={() => {}}
                >
                    <Icon name="MoreVertical" size={18} color="textSecondary" />
                </Pressable>
            </View>
        </View>
    );
}

function DeckCard({ deck, isDark, C }: { deck: FlashcardDeck; isDark: boolean; C: any }) {
    const subjectTag = deck.title ? (deck.title.split(' ')[0] || 'Deck') : 'Deck';
    
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderColor: C.border,
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: C.surfaceLow, borderColor: C.border, borderWidth: 1 }}
                    >
                        <Icon name="Layers" size={22} color="default" />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: C.selectedBackground }}
                            >
                                <Text style={{ color: C.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{subjectTag}</Text>
                            </View>
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary }}>
                                    {deck.flashcards_count} Cards
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text }} className="mt-1" numberOfLines={1}>
                            {deck.title}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '400', color: C.textSecondary }} className="mt-0.5">
                            {new Date(deck.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                <Pressable
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    className="w-10 h-10 rounded-full items-center justify-center shrink-0"
                >
                    <Icon name="Bookmark" size={20} color="secondary" />
                </Pressable>
            </View>
            
            <View className="flex-row items-center justify-between pt-3">
                <Pressable 
                    className="h-10 px-5 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                    style={{ backgroundColor: C.primary }}
                    onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                >
                    <Icon name="Play" size={16} color="white" />
                    <Text className="text-white" style={{ fontSize: 14, fontWeight: '600' }}>Study Deck</Text>
                </Pressable>
                <Text style={{ fontSize: 13, color: C.textSecondary }}>
                    {new Date(deck.created_at).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );
}
