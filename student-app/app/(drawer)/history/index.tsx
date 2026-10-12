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
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

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
    const summaries: any[] = [
        {
            id: 101,
            title: 'Alkene Addition Reactions',
            subject: 'Organic Chemistry',
            subtitle: '4 Key Reaction Formulas • Mind Map Included',
            created_at: new Date().toISOString(),
        },
        {
            id: 102,
            title: 'Thermodynamics & Heat Capacity',
            subject: 'Physics',
            subtitle: 'First Law • Enthalpy & Entropy Summary',
            created_at: new Date(Date.now() - 86400000).toISOString(),
        }
    ];
    
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
        <View style={{ flex: 1, backgroundColor: isDark ? '#0D0D0D' : '#F2F2F7' }}>
            <Animated.View entering={FadeInUp.duration(500)} style={{ paddingTop: Math.max(insets.top, 16) }} className="px-5 pb-4">
                <View className="flex-row items-center gap-2">
                    <Pressable 
                        onPress={() => {
                            haptics.selectionAsync(true);
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(drawer)' as any);
                            }
                        }} 
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}
                        className="w-11 h-11 items-center justify-center rounded-full" 
                    >
                        <MaterialIcons name="arrow-back-ios-new" size={20} color={C.text} />
                    </Pressable>
                    <Text style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: C.text }}>History</Text>
                </View>
                
                <View className="mt-4 gap-4">
                    {/* Search Pill */}
                    <View className="relative w-full justify-center">
                        <View className="absolute left-3 z-10">
                            <MaterialIcons name="search" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                        </View>
                        <TextInput 
                            className="w-full h-12 pl-10 pr-4 rounded-full"
                            style={{
                                fontSize: 13,
                                fontWeight: '400',
                                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                color: C.text,
                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                borderWidth: 1,
                            }}
                            placeholder="Search past sessions, topics, formulas..."
                            placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                        />
                    </View>

                    {/* Quick Stats Bento Banner */}
                    <View
                        style={{
                            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            borderWidth: 1,
                        }}
                        className="flex-row rounded-[24px] p-2 gap-2 shadow-sm"
                    >
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F4F3F8' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: C.text }}>
                                {quizzes.length + decks.length + summaries.length || 38}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }} className="mt-0.5">Sessions</Text>
                        </View>
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <View className="flex-row items-center gap-0.5">
                                <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: '#007AFF' }}>94%</Text>
                                <MaterialIcons name="trending-up" size={14} color="#007AFF" />
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#007AFF' }} className="mt-0.5">Avg Mastery</Text>
                        </View>
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F4F3F8' }}
                            className="flex-1 items-center justify-center py-2 px-1 rounded-2xl"
                        >
                            <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: C.text }}>14.2h</Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }} className="mt-0.5">Study Time</Text>
                        </View>
                    </View>

                    {/* Segmented Control with Counts */}
                    <View
                        style={{
                            flexDirection: 'row',
                            padding: 4,
                            borderRadius: 999,
                            backgroundColor: isDark ? '#1C1C1E' : '#E3E2E7',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
                            borderWidth: isDark ? 1 : 0,
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
                                        backgroundColor: isActive ? '#007AFF' : 'transparent',
                                        shadowColor: isActive ? '#007AFF' : undefined,
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
                                            color: isActive ? '#FFFFFF' : (isDark ? '#8E8E93' : '#48484A'),
                                        }}
                                    >
                                        {label}{' '}
                                        <Text style={{ opacity: isActive ? 0.85 : 0.6, fontSize: 12, fontWeight: '400', color: isActive ? '#FFFFFF' : (isDark ? '#8E8E93' : '#48484A') }}>
                                            ({count})
                                        </Text>
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </Animated.View>

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
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#007AFF' }}>
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
                                        backgroundColor: '#ba1a1a', 
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
                                        <MaterialIcons name="delete" size={24} color="white" />
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
                                    style={{ backgroundColor: isDark ? '#1C1C1E' : '#F4F3F8' }}
                                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                >
                                    <MaterialIcons name="folder-open" size={32} color={C.textSecondary} />
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
                                        <MaterialIcons name="delete-outline" size={18} color={C.textSecondary} />
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
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: isDark ? 'rgba(0,103,98,0.25)' : '#61F9EF' }}
                    >
                        <MaterialIcons name="auto-stories" size={24} color={isDark ? '#39DCD2' : '#006762'} />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: isDark ? 'rgba(0,103,98,0.3)' : 'rgba(97, 249, 239, 0.3)' }}
                            >
                                <Text style={{ color: isDark ? '#39DCD2' : '#00504C', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                                    {item.subject || 'Organic Chemistry'}
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
                <MaterialIcons name="attachment" size={20} color={C.textSecondary} style={{ marginTop: 4 }} />
            </View>

            {/* Concepts preview pills */}
            <View className="flex-row items-center gap-2 overflow-hidden py-1">
                <View
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                    className="px-2.5 py-1 rounded-xl flex-row items-center gap-1"
                >
                    <MaterialIcons name="science" size={14} color={C.textSecondary} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>Markovnikov Rule</Text>
                </View>
                <View
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                    className="px-2.5 py-1 rounded-xl flex-row items-center gap-1"
                >
                    <MaterialIcons name="schema" size={14} color={C.textSecondary} />
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
                    style={{ backgroundColor: '#00837C' }}
                    onPress={() => {}}
                >
                    <MaterialIcons name="menu-book" size={18} color="white" />
                    <Text className="text-white" style={{ fontSize: 14, fontWeight: '600' }}>Read Summary</Text>
                </Pressable>
            </View>
        </View>
    );
}

function QuizCard({ session, isDark, C }: { session: QuizSession; isDark: boolean; C: any }) {
    const pct = session.score_percentage || 0;
    
    return (
        <View
            style={{
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#E5F1FF' }}
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                    >
                        <MaterialIcons name="task-alt" size={24} color="#007AFF" />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : 'rgba(0,122,255,0.1)' }}
                                className="px-2 py-0.5 rounded-full"
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: '#007AFF' }}>Physics</Text>
                            </View>
                            <View
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                                className="px-2 py-0.5 rounded-full"
                            >
                                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary }}>
                                    {session.difficulty ? session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1) : 'Midterm'}
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
                        style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.08)' }}
                        className="w-12 h-12 rounded-full items-center justify-center relative"
                    >
                        <Svg width={48} height={48} viewBox="0 0 36 36" style={{ transform: [{ rotate: '-90deg' }] }}>
                            <Circle cx="18" cy="18" r="15.9155" fill="none" stroke={isDark ? '#2C2C2E' : '#E3E2E7'} strokeWidth="3.5" />
                            <Circle cx="18" cy="18" r="15.9155" fill="none" stroke="#007AFF" strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
                        </Svg>
                        <View className="absolute inset-0 items-center justify-center">
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#007AFF' }}>{Math.round(pct)}%</Text>
                        </View>
                    </View>
                </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-2">
                    <Pressable
                        style={{ backgroundColor: '#007AFF' }}
                        className="h-10 px-4 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                        onPress={() => {}}
                    >
                        <MaterialIcons name="replay" size={18} color="white" />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Retake</Text>
                    </Pressable>
                    <Pressable
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F3F8' }}
                        className="h-10 px-4 rounded-full flex-row items-center gap-1 active:opacity-80"
                        onPress={() => router.push(`/(drawer)/history/${session.id}` as any)}
                    >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#007AFF' }}>Review</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#007AFF" />
                    </Pressable>
                </View>
                <Pressable
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    className="w-10 h-10 rounded-full items-center justify-center active:bg-surface-container-low"
                    onPress={() => {}}
                >
                    <MaterialIcons name="more-vert" size={20} color={C.textSecondary} />
                </Pressable>
            </View>
        </View>
    );
}

function DeckCard({ deck, isDark, C }: { deck: FlashcardDeck; isDark: boolean; C: any }) {
    return (
        <View
            style={{
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderWidth: 1,
            }}
            className="p-5 rounded-[24px] mb-3 flex-col gap-3.5 shadow-sm"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row items-start gap-3 flex-1">
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: isDark ? 'rgba(88,86,214,0.2)' : '#E2DFFF' }}
                    >
                        <MaterialIcons name="style" size={24} color="#5856D6" />
                    </View>
                    <View className="flex-1 flex-col">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: isDark ? 'rgba(88,86,214,0.2)' : '#E2DFFF' }}
                            >
                                <Text style={{ color: isDark ? '#A5B4FC' : '#3631B4', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>Biology</Text>
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
                    <MaterialIcons name="star-border" size={22} color="#f59e0b" />
                </Pressable>
            </View>
            
            <View className="flex-col gap-1.5 mt-2">
                <View className="flex-row items-center justify-between">
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }}>Mastery Progress</Text>
                    <Text style={{ color: isDark ? '#A5B4FC' : '#4C4ACA', fontSize: 11, fontWeight: '700' }}>
                        13 of {deck.flashcards_count} Memorized
                    </Text>
                </View>
                <View
                    style={{ backgroundColor: isDark ? '#2C2C2E' : '#E3E2E7' }}
                    className="w-full h-2 rounded-full overflow-hidden"
                >
                    <View className="h-full rounded-full" style={{ width: '87%', backgroundColor: '#5856D6' }} />
                </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-3">
                <Pressable 
                    className="h-10 px-5 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                    style={{ backgroundColor: '#5856D6' }}
                    onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                >
                    <MaterialIcons name="play-arrow" size={18} color="white" />
                    <Text className="text-white" style={{ fontSize: 14, fontWeight: '600' }}>Study Deck</Text>
                </Pressable>
                <Text style={{ fontSize: 13, color: C.textSecondary }}>
                    {new Date(deck.created_at).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );
}
