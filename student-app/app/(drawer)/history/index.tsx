import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, SectionList, RefreshControl, useColorScheme, Platform, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
    Activity, MultiplePages, Page, NavArrowRight, 
    Search, Filter, Calendar
} from 'iconoir-react-native';
import { router, useNavigation } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
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
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Text style={[s.headerTitle, { color: C.text }]}>History</Text>
                <View style={{ width: 48 }} />
            </View>

            <View style={s.tabContainer}>
                <View style={[s.tabRow, isDark ? s.tabRowDark : s.tabRowLight]}>
                    {(['quizzes', 'flashcards'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                            style={[s.tabButton, activeTab === tab && (isDark ? s.tabActiveDark : s.tabActiveLight)]}
                        >
                            <Text style={[s.tabText, activeTab === tab ? (isDark ? s.textWhite : s.textSlate900) : (isDark ? s.textWhite40 : s.textSlate400)]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ flex: 1, backgroundColor: C.background, paddingHorizontal: 16 }}>
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item.id.toString() + index}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 16, paddingLeft: 8 }}>
                            {title}
                        </Text>
                    )}
                    renderItem={({ item }) => {
                        if (activeTab === 'quizzes') return <QuizCard session={item as QuizSession} isDark={isDark} />;
                        return <DeckCard deck={item as FlashcardDeck} isDark={isDark} />;
                    }}
                    ListEmptyComponent={() => {
                        if (isLoading) return null;
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 100 }}>
                                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                    <Page width={32} height={32} color="#8E8E93" />
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginBottom: 8 }}>No study sessions yet</Text>
                                <Text style={{ fontSize: 15, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 40 }}>
                                    {activeTab === 'quizzes' ? 'Complete a practice quiz to see your scores here.' : 'Generate flashcards to start studying.'}
                                </Text>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ paddingBottom: 60 }}
                />
            </View>
        </View>
    );
}

function QuizCard({ session, isDark }: { session: QuizSession; isDark: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const pct = session.score_percentage || 0;
    const isPass = pct >= 60;

    return (
        <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.9}
            style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                        <Activity width={20} height={20} color="#007AFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginBottom: 4 }} numberOfLines={1}>{session.topic}</Text>
                        <Text style={{ fontSize: 13, color: '#8E8E93' }}>{session.difficulty} • {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: isPass ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.12)' }}>
                    <Text style={{ fontWeight: '800', fontSize: 13, color: isPass ? '#34C759' : '#FF3B30' }}>{Math.round(pct)}%</Text>
                </View>
            </View>

            {expanded && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5EA', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>Score</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#FFF' : '#000' }}>{session.correct_answers} / {session.total_questions}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push(`/(drawer)/history/${session.id}` as any)} style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>View Details</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
}

function DeckCard({ deck, isDark }: { deck: FlashcardDeck; isDark: boolean }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
            activeOpacity={0.9}
            style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <MultiplePages width={20} height={20} color="#007AFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginBottom: 4 }} numberOfLines={1}>{deck.title}</Text>
                    <Text style={{ fontSize: 13, color: '#8E8E93' }}>{new Date(deck.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: '#007AFF' }}>{deck.flashcards_count} Cards</Text>
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 16, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
    menuBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },

    tabContainer: { paddingHorizontal: 16, marginBottom: 32 },
    tabRow: { flexDirection: 'row', padding: 4, borderRadius: 999 },
    tabRowDark: { backgroundColor: '#13151B' },
    tabRowLight: { backgroundColor: '#F1F5F9' },
    tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 999 },
    tabActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabActiveLight: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },

    contentContainer: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 32 },
    bgDark: { backgroundColor: '#000000' },
    bgWhite: { backgroundColor: '#F2F2F7' },
    scrollView: { flex: 1 },

    skeletonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    flex1: { flex: 1 },

    emptyState: { alignItems: 'center', paddingVertical: 80, borderStyle: 'dashed', borderWidth: 2, borderRadius: 28 },
    emptyStateDark: { backgroundColor: 'rgba(19,21,27,0.5)', borderColor: 'transparent' },
    emptyStateLight: { backgroundColor: 'white', borderColor: '#E2E8F0' },
    emptyStateText: { color: '#64748b', fontWeight: '500', fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20, marginTop: 16 },

    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 },
    cardRight: { alignItems: 'flex-end' },
    iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconBoxDark: { backgroundColor: '#1C1C1E' },
    iconBoxLight: { backgroundColor: '#F2F2F7' },
    topicText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    metaText: { fontSize: 13 },
    progressText: { fontSize: 11, fontWeight: '500', marginTop: 2 },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textWhite40: { color: 'rgba(255,255,255,0.4)' },
    textWhite30: { color: 'rgba(255,255,255,0.3)' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    spacer: { height: 40 },
});
