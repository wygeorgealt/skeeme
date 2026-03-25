import { View, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl, useColorScheme, Platform, StyleSheet } from 'react-native';
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
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>History</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Open Menu"
                    style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                >
                    <Menu width={22} height={22} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            {/* Segmented Control - Minimalist */}
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

            {/* Bottom Half Container Content */}
            <View style={[s.contentContainer, isDark ? s.bgDark : s.bgWhite]}>
                <FlatList<any>
                    style={s.scrollView}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
                    showsVerticalScrollIndicator={false}
                    data={isLoading && quizzes.length === 0 && decks.length === 0 ? [] : (activeTab === 'quizzes' ? quizzes : decks)}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => {
                        if (activeTab === 'quizzes') {
                            return <QuizCard session={item as QuizSession} isDark={isDark} />;
                        } else {
                            return <DeckCard deck={item as FlashcardDeck} isDark={isDark} />;
                        }
                    }}
                    ListEmptyComponent={() => {
                        if (isLoading) {
                            return (
                                <View>
                                    <View style={s.skeletonRow}>
                                        <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                                        <View style={s.flex1}>
                                            <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
                                            <SkeletonLoader width="30%" height={12} />
                                        </View>
                                    </View>
                                    <View style={s.skeletonRow}>
                                        <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                                        <View style={s.flex1}>
                                            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                                            <SkeletonLoader width="40%" height={12} />
                                        </View>
                                    </View>
                                </View>
                            );
                        }
                        if (activeTab === 'quizzes') {
                            return (
                                <View style={[s.emptyState, isDark ? s.emptyStateDark : s.emptyStateLight]}>
                                    <Calendar width={40} height={40} color="#8B5CF6" style={{ opacity: 0.5 }} />
                                    <Text style={s.emptyStateText}>
                                        Complete a practice quiz to see results here.
                                    </Text>
                                </View>
                            );
                        } else {
                            return (
                                <View style={[s.emptyState, isDark ? s.emptyStateDark : s.emptyStateLight]}>
                                    <MultiplePages width={40} height={40} color="#8B5CF6" style={{ opacity: 0.5 }} />
                                    <Text style={s.emptyStateText}>
                                        Generate some flashcards to start studying.
                                    </Text>
                                </View>
                            );
                        }
                    }}
                />
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
            style={s.card}
        >
            <View style={s.cardLeft}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <Calendar width={20} height={20} color={getScoreColor(session.score_percentage)} />
                </View>
                <View style={s.flex1}>
                    <Text style={[s.topicText, isDark ? s.textWhite : s.textSlate900]} numberOfLines={1}>
                        {session.topic}
                    </Text>
                    <Text style={[s.metaText, isDark ? s.textWhite40 : s.textSlate500]}>
                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {session.difficulty}
                    </Text>
                </View>
            </View>
            <View style={s.cardRight}>
                <Text style={[s.topicText, isDark ? s.textWhite : s.textSlate900]}>
                    {Math.round(session.score_percentage)}%
                </Text>
                <Text style={[s.progressText, isDark ? s.textWhite30 : s.textSlate400]}>
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
            style={s.card}
        >
            <View style={s.cardLeft}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <MultiplePages width={20} height={20} color="#8B5CF6" />
                </View>
                <View style={[s.flex1, { marginLeft: 16, justifyContent: 'center' }]}>
                    <Text style={[s.topicText, isDark ? s.textWhite : s.textSlate900]} numberOfLines={1}>
                        {deck.title}
                    </Text>
                    <Text style={[s.metaText, isDark ? s.textWhite40 : s.textSlate500]}>
                        {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
            <View style={s.cardRight}>
                <Text style={[s.topicText, isDark ? s.textWhite : s.textSlate900]}>
                    {deck.flashcards_count}
                </Text>
                <Text style={[s.progressText, isDark ? s.textWhite30 : s.textSlate400]}>
                    Cards
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
    menuBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },

    tabContainer: { paddingHorizontal: 24, marginBottom: 32 },
    tabRow: { flexDirection: 'row', padding: 4, borderRadius: 999 },
    tabRowDark: { backgroundColor: '#13151B' },
    tabRowLight: { backgroundColor: '#F1F5F9' },
    tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 999 },
    tabActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabActiveLight: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },

    contentContainer: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 32 },
    bgDark: { backgroundColor: '#090A0F' },
    bgWhite: { backgroundColor: 'white' },
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
    iconBoxDark: { backgroundColor: '#13151B' },
    iconBoxLight: { backgroundColor: '#F8FAFC' },
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
