import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, useColorScheme, Platform, StyleSheet, StatusBar } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { 
    Menu, Sparks, Bin, Group, Calendar, 
    Page, NavArrowRight, Plus 
} from 'iconoir-react-native';
import { router, useNavigation } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

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

type FlashcardDeck = {
    id: number;
    title: string;
    description: string | null;
    source_type: string;
    flashcards_count: number;
    created_at: string;
};

function SkeletonDeck({ isDark }: { isDark: boolean }) {
    return (
        <View style={[s.deckCard, isDark ? s.bgGrayDark : s.deckCardLight]}>
            <View style={[s.skeletonTitle, isDark ? s.bgSlate800_50 : s.bgSlate100]} />
            <View style={s.flexRowGap3}>
                <View style={[s.skeletonBadge, isDark ? s.bgSlate800_50 : s.bgSlate100]} />
                <View style={[s.skeletonBadge, isDark ? s.bgSlate800_50 : s.bgSlate100, { width: 96 }]} />
            </View>
        </View>
    );
}

export default function FlashcardsDashboard() {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();
    const [cachedDecks, setCachedDecks] = useState<FlashcardDeck[] | null>(null);

    useEffect(() => {
        const hydrate = async () => {
            const cached = await storage.getItem('cache_flashcard_decks');
            if (cached) setCachedDecks(JSON.parse(cached));
        };
        hydrate();
    }, []);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { data: remoteDecks, isLoading, refetch } = useQuery({
        queryKey: ['flashcard-decks', page],
        queryFn: async () => {
            const res = await api.get('flashcards/decks', { params: { page, limit: 10 } });
            const data = res.data.data as FlashcardDeck[];
            
            // If we're on page 1, replace cache. If > 1, would append in real app.
            if (page === 1) {
                await storage.setItem('cache_flashcard_decks', JSON.stringify(data));
            }

            // Simple heuristic for "hasMore" until backend provides meta
            if (data.length < 10) setHasMore(false);
            
            return data;
        }
    });

    const [allDecks, setAllDecks] = useState<FlashcardDeck[]>([]);

    useEffect(() => {
        if (remoteDecks) {
            if (page === 1) {
                setAllDecks(remoteDecks);
            } else {
                setAllDecks(prev => [...prev, ...remoteDecks]);
            }
        }
    }, [remoteDecks, page]);

    const decks = allDecks.length > 0 ? allDecks : cachedDecks;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`flashcards/decks/${id}`),
        onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
        },
        onError: (error: any) => {
            Alert.alert('Delete Failed', error.response?.data?.message || 'Could not delete deck. Please try again.');
        }
    });

    const onRefresh = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDelete = (id: number, title: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Deck",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const handleDeckPress = (id: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(drawer)/flashcards/${id}` as any);
    };

    return (
        <GlowBackground isRoot={true}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={s.headerContent}>
                    <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>Flashcards</Text>
                    <Text style={[s.headerSubtitle, isDark ? s.textSlate500 : s.textSlate400]}>Master topics with Skeeme AI</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    style={[s.menuBtn, isDark ? s.bgWhite10 : s.bgWhite60]}
                >
                    <Menu width={22} height={22} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Create New Button */}
                <View style={s.createBtnWrapper}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/(drawer)/flashcards/create');
                        }}
                        activeOpacity={0.8}
                        style={s.createBtn}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.createBtnGradient}
                        >
                            <Sparks width={20} height={20} color="white" strokeWidth={2.5} />
                            <Text style={s.createBtnText}>Generate New Deck</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={s.sectionHeaderRow}>
                    <Text style={s.sectionTitle}>Your Library</Text>
                    {decks && decks.length > 0 && (
                        <View style={[s.countBadge, isDark ? s.bgWhite10 : s.bgIndigo50]}>
                            <Text style={[s.countBadgeText, isDark ? s.textWhite : s.textIndigo600]}>{decks.length} Sets</Text>
                        </View>
                    )}
                </View>

                {isLoading && !decks ? (
                    <View>
                        <SkeletonDeck isDark={isDark} />
                        <SkeletonDeck isDark={isDark} />
                        <SkeletonDeck isDark={isDark} />
                    </View>
                ) : !decks || decks.length === 0 ? (
                    <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={[s.emptyState, isDark ? s.glassBorderDark : s.glassBorderLight]}>
                        <View style={[s.emptyIconBox, isDark ? s.bgWhite5 : s.bgIndigo50]}>
                            <Page width={40} height={40} color="#8B5CF6" strokeWidth={1.5} />
                        </View>
                        <Text style={[s.emptyTitle, isDark ? s.textWhite : s.textSlate900]}>No Decks Yet</Text>
                        <Text style={[s.emptySubtitle, isDark ? s.textSlate500 : s.textSlate400]}>
                            Turn your notes or topics into interactive study sets with Skeeme AI.
                        </Text>
                    </BlurView>
                ) : (
                    decks.map(deck => (
                        <TouchableOpacity
                            key={deck.id}
                            onPress={() => handleDeckPress(deck.id)}
                            activeOpacity={0.9}
                            style={s.deckBtn}
                        >
                            <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={[s.deckCard, isDark ? s.glassBorderDark : s.glassBorderLight]}>
                                <View style={s.deckHeader}>
                                    <View style={s.titleContainer}>
                                        <Text style={[s.deckTitle, isDark ? s.textWhite : s.textSlate900]} numberOfLines={2}>
                                            {deck.title}
                                        </Text>
                                        <View style={s.deckMeta}>
                                            <Calendar width={12} height={12} color="#94a3b8" />
                                            <Text style={s.dateText}>
                                                {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(deck.id, deck.title)}
                                        style={[s.binBtn, isDark ? s.bgRed10 : s.bgRed50]}
                                    >
                                        <Bin width={16} height={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                <View style={s.deckFooter}>
                                    <View style={[s.badge, isDark ? s.bgWhite10 : s.bgIndigo50]}>
                                        <Group width={14} height={14} color="#8B5CF6" strokeWidth={2.5} />
                                        <Text style={[s.badgeText, isDark ? s.textWhite : s.textIndigo600]}>
                                            {deck.flashcards_count} Cards
                                        </Text>
                                    </View>
                                    <View style={s.studyHint}>
                                        <Text style={s.studyHintText}>Tap to Study</Text>
                                        <NavArrowRight width={14} height={14} color="#8B5CF6" strokeWidth={3} />
                                    </View>
                                </View>
                            </BlurView>
                        </TouchableOpacity>
                    ))
                )}

                {hasMore && decks && decks.length >= 10 && (
                    <TouchableOpacity
                        onPress={() => setPage(p => p + 1)}
                        style={[s.loadMoreBtn, isDark ? s.bgWhite10 : s.bgWhite60]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        ) : (
                            <Text style={[s.loadMoreText, isDark ? s.textWhite : s.textSlate900]}>Load More</Text>
                        )}
                    </TouchableOpacity>
                )}
                <View style={s.h20} />
            </ScrollView>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24 },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    headerSubtitle: { fontWeight: '600', fontSize: 14, marginTop: 4, letterSpacing: -0.2 },
    menuBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    loadMoreBtn: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    loadMoreText: { fontWeight: '800', fontSize: 14, letterSpacing: -0.2 },

    scrollView: { flex: 1, paddingHorizontal: 24 },
    createBtnWrapper: { marginBottom: 32 },
    createBtn: { height: 64, borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
    createBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    createBtnText: { color: 'white', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
    countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    countBadgeText: { fontWeight: '800', fontSize: 11 },

    deckBtn: { marginBottom: 16 },
    deckCard: { padding: 24, borderRadius: 32, borderBottomWidth: 2 },
    deckCardLight: { backgroundColor: 'rgba(255,255,255,0.8)' },
    glassBorderDark: { borderColor: 'rgba(255,255,255,0.05)', borderBottomColor: 'rgba(139, 92, 246, 0.2)' },
    glassBorderLight: { borderColor: 'rgba(0,0,0,0.02)', borderBottomColor: 'rgba(139, 92, 246, 0.1)' },
    
    deckHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    titleContainer: { flex: 1, marginRight: 16 },
    deckTitle: { fontWeight: '800', fontSize: 19, letterSpacing: -0.5, marginBottom: 8 },
    deckMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
    
    binBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    bgRed10: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    bgRed50: { backgroundColor: '#FEF2F2' },
    bgIndigo50: { backgroundColor: '#EEF2FF' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },

    deckFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    bgWhite5: { backgroundColor: 'rgba(255,255,255,0.05)' },
    badgeText: { fontWeight: '800', fontSize: 12, letterSpacing: -0.2 },
    textIndigo600: { color: '#4F46E5' },
    
    studyHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    studyHintText: { color: '#8B5CF6', fontWeight: '800', fontSize: 13, letterSpacing: -0.3 },

    emptyState: { alignItems: 'center', borderRadius: 40, paddingVertical: 64, paddingHorizontal: 40, borderStyle: 'dashed', borderWidth: 2 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyTitle: { fontWeight: '900', fontSize: 24, letterSpacing: -0.5, marginBottom: 12 },
    emptySubtitle: { fontWeight: '600', fontSize: 15, textAlign: 'center', lineHeight: 22, color: '#94a3b8' },

    skeletonTitle: { height: 20, width: '75%', borderRadius: 8, marginBottom: 16 },
    bgGrayDark: { backgroundColor: '#13151B' },
    bgSlate800_50: { backgroundColor: 'rgba(30, 41, 59, 0.5)' },
    bgSlate100: { backgroundColor: '#F1F5F9' },
    flexRowGap3: { flexDirection: 'row', gap: 12 },
    skeletonBadge: { height: 28, width: 80, borderRadius: 14 },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate500: { color: '#64748b' },
    textSlate400: { color: '#94a3b8' },
    h20: { height: 80 },
});
