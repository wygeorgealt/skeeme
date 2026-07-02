import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, SectionList, RefreshControl, useColorScheme, Platform, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { AltArrowRight, Book, Copy, Notebook, TrashBinTrash, DocumentText } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';

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
    const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
    const { user } = useAuthStore();
    
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

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
            else await refetchDecks();
        } catch { }
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
            
            // Cross-invalidate the flashcard library if we delete a deck from here
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
    const isLoading = activeTab === 'quizzes' ? loadingQuizzes : loadingDecks;

    useEffect(() => {
        if (activeTab === 'quizzes') refetchQuizzes();
        else refetchDecks();
    }, [activeTab, refetchQuizzes, refetchDecks]);

    useEffect(() => {
        // History is a paid feature. Free users should be redirected to the paywall.
        if (user?.plan_name === 'free') {
            router.replace('/paywall');
        }
    }, [user?.plan_name]);

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

    const sections = getSections(isLoading && quizzes.length === 0 && decks.length === 0 ? [] : (activeTab === 'quizzes' ? quizzes : decks));

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Animated.View entering={FadeInUp.duration(500)} style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Text style={[s.headerTitle, { color: C.text }]}>History</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.tabContainer}>
                <View style={[s.segmentContainer, isDark ? s.segmentContainerDark : s.segmentContainerLight]}>
                    {(['quizzes', 'flashcards'] as const).map(tab => {
                        const isActive = activeTab === tab;
                        const Icon = tab === 'quizzes' ? Book : Copy;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => {
                                    haptics.impactAsync();
                                    setActiveTab(tab);
                                }}
                                activeOpacity={0.9}
                                style={[
                                    s.segmentPill,
                                    isActive && (isDark ? s.segmentPillActiveDark : s.segmentPillActiveLight)
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Icon size={14} color={isActive ? (isDark ? '#FFF' : '#000') : C.textTertiary} />
                                    <Text style={[
                                        s.segmentText,
                                        isActive ? { color: C.text, fontWeight: '700' } : { color: C.textTertiary, fontWeight: '500' }
                                    ]}>
                                        {tab === 'quizzes' ? 'Quizzes' : 'Flashcards'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ flex: 1, paddingHorizontal: 20 }}>
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item.id.toString() + index}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={[s.sectionHeader, { color: C.textSecondary }]}>
                            {title.toUpperCase()}
                        </Text>
                    )}
                    renderItem={({ item }) => {
                        const isQuiz = activeTab === 'quizzes';
                        const id = item.id;
                        const title = isQuiz ? (item as QuizSession).topic : (item as FlashcardDeck).title;

                        const renderRightActions = () => (
                            <View style={{ width: 90 }}>
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    style={{ 
                                        backgroundColor: '#FF3B30', 
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center', 
                                        width: 200,
                                        height: '100%', 
                                        position: 'absolute',
                                        right: 0,
                                    }}
                                    onPress={() => handleDelete(id, title, isQuiz ? 'quiz' : 'flashcard')}
                                >
                                    <View style={{ width: 90, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrashBinTrash size={22} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );

                        return (
                            <Swipeable 
                                renderRightActions={renderRightActions} 
                                overshootRight={false} 
                                containerStyle={{ 
                                    marginBottom: 12, 
                                    borderRadius: 24,
                                    overflow: 'hidden',
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.03,
                                            shadowRadius: 12,
                                        },
                                        android: {
                                            elevation: 2
                                        }
                                    })
                                }}
                            >
                                {isQuiz ? (
                                    <QuizCard session={item as QuizSession} isDark={isDark} C={C} />
                                ) : (
                                    <DeckCard deck={item as FlashcardDeck} isDark={isDark} C={C} />
                                )}
                            </Swipeable>
                        );
                    }}
                    ListEmptyComponent={() => {
                        if (isLoading) return null;
                        return (
                            <View style={s.emptyContainer}>
                                <View style={[s.emptyIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                                    <AnimatedIcon source={require('@/assets/3dicons/3dicons-folder-front-color.png')} size={48} animationType="pop" />
                                </View>
                                <Text style={[s.emptyTitle, { color: C.text }]}>No history yet</Text>
                                <Text style={[s.emptySub, { color: C.textSecondary }]}>
                                    {activeTab === 'quizzes' ? 'Complete a practice quiz to view your scores here.' : 'Generate flashcard sets to start studying.'}
                                </Text>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </Animated.View>
        </View>
    );
}

function QuizCard({ session, isDark, C }: { session: QuizSession; isDark: boolean; C: any }) {
    const [expanded, setExpanded] = useState(false);
    const pct = session.score_percentage || 0;
    
    // Status color selection
    let statusColor = '#34C759'; // Green
    let statusBg = isDark ? 'rgba(52,199,89,0.15)' : '#E8F5E9';
    if (pct < 60) {
        statusColor = '#FF3B30';
        statusBg = isDark ? 'rgba(255,59,48,0.15)' : '#FFEBEE';
    }

    return (
        <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.9}
            style={[s.card, isDark ? s.cardDark : s.cardLight]}
        >
            <View style={s.cardBody}>
                <View style={[s.iconWrapper, isDark ? s.iconWrapperDark : s.iconWrapperLight, { backgroundColor: 'transparent' }]}>
                    <AnimatedIcon source={require('@/assets/3dicons/3dicons-bookmark-iso-color.png')} size={24} animationType="wobble" />
                </View>
                <View style={s.cardContent}>
                    <Text style={[s.cardTitle, { color: C.text }]} numberOfLines={1}>{session.topic}</Text>
                    <Text style={[s.cardSub, { color: C.textSecondary }]}>
                        {session.difficulty ? session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1) : ''} • {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={[s.metricPill, { backgroundColor: statusBg }]}>
                    <Text style={[s.metricText, { color: statusColor }]}>{Math.round(pct)}%</Text>
                </View>
            </View>

            {expanded && (
                <View style={[s.cardExpanded, { borderTopColor: C.separator }]}>
                    <View>
                        <Text style={[s.expandedLabel, { color: C.textTertiary }]}>SCORE</Text>
                        <Text style={[s.expandedValue, { color: C.text }]}>{session.correct_answers} / {session.total_questions}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push(`/(drawer)/history/${session.id}` as any)} activeOpacity={0.8} style={s.actionPill}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                             <Text style={s.actionPillText}>View Details</Text>
                             <AltArrowRight size={14} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
}

function DeckCard({ deck, isDark, C }: { deck: FlashcardDeck; isDark: boolean; C: any }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            activeOpacity={0.9}
            style={[s.card, isDark ? s.cardDark : s.cardLight]}
        >
            <View style={s.cardBody}>
                <View style={[s.iconWrapper, isDark ? s.iconWrapperDark : s.iconWrapperLight, { backgroundColor: 'transparent' }]}>
                    <AnimatedIcon source={require('@/assets/3dicons/3dicons-copy-front-color.png')} size={24} animationType="wobble" />
                </View>
                <View style={s.cardContent}>
                    <Text style={[s.cardTitle, { color: C.text }]} numberOfLines={1}>{deck.title}</Text>
                    <Text style={[s.cardSub, { color: C.textSecondary }]}>
                        {new Date(deck.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={[s.metricPill, { backgroundColor: C.primaryLight }]}>
                    <Text style={[s.metricText, { color: C.primary }]}>{deck.flashcards_count} Cards</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 24 },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

    // Segmented Pill Control
    tabContainer: { paddingHorizontal: 20, marginBottom: 24 },
    segmentContainer: { flexDirection: 'row', borderRadius: 999, padding: 4 },
    segmentContainerLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segmentContainerDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segmentPill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
    segmentPillActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segmentPillActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segmentText: { fontSize: 14, letterSpacing: -0.2 },

    // Sections
    sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 16, marginBottom: 16, paddingLeft: 4 },

    // Card Glass Design
    card: { borderRadius: 24, padding: 16 },
    cardLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 3 },
    cardDark: { backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardBody: { flexDirection: 'row', alignItems: 'center' },
    
    iconWrapper: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    iconWrapperLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
    iconWrapperDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
    
    cardContent: { flex: 1, marginRight: 12 },
    cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4, letterSpacing: -0.4 },
    cardSub: { fontSize: 13, fontWeight: '500' },
    
    metricPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    metricText: { fontSize: 13, fontWeight: '800' },

    // Expanded State
    cardExpanded: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    expandedLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
    expandedValue: { fontSize: 17, fontWeight: '800' },
    actionPill: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100 },
    actionPillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    // Empty State
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyIconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
    emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
