import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, ScrollView, FlatList, RefreshControl, Alert, useColorScheme, Platform, StyleSheet, StatusBar } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { router, useNavigation } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import { FlashcardDeck } from '@/types';
import { Swipeable } from 'react-native-gesture-handler';
import { AltArrowRight, DocumentText, TrashBinTrash } from '@solar-icons/react-native/Bold';

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
    const C = Colors[isDark ? 'dark' : 'light'];
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
        onSuccess: (_, deletedId) => {
            haptics.notificationAsync('success' as any);
            
            // 1. Optimistic UI update: Filter local state
            setAllDecks(prev => prev.filter(d => d.id !== deletedId));
            
            // 2. Update FileSystem cache
            const updatedCache = (allDecks || []).filter(d => d.id !== deletedId);
            storage.setItem('cache_flashcard_decks', JSON.stringify(updatedCache));
            
            // 3. Invalidate queries for fresh data and cross-page sync
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
            queryClient.invalidateQueries({ queryKey: ['flashcard-history'] });
        },
        onError: (error: any) => {
            Alert.alert('Delete Failed', error.response?.data?.message || 'Could not delete deck. Please try again.');
        }
    });

    const onRefresh = useCallback(async () => {
        haptics.impactAsync();
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDelete = (id: number, title: string) => {
        haptics.impactAsync();
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
        haptics.impactAsync();
        router.push(`/(drawer)/flashcards/${id}` as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={s.headerContent}>
                    <Text style={[s.headerTitle, { color: C.text }]}>Flashcards</Text>
                    <Text style={[s.headerSubtitle, { color: C.textSecondary }]}>Master topics with Skeeme AI</Text>
                </View>
                <View style={{ width: 48 }} />
            </View>

            <FlatList
                style={s.scrollView}
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
                showsVerticalScrollIndicator={false}
                data={(!decks && isLoading) ? [] : decks}
                keyExtractor={(item) => String(item.id)}
                ListHeaderComponent={
                    <>
                        <View style={s.createBtnWrapper}>
                            <TouchableOpacity
                                onPress={() => {
                                    haptics.impactAsync();
                                    router.push('/(drawer)/flashcards/create');
                                }}
                                activeOpacity={0.8}
                                style={[s.createBtn, { backgroundColor: C.primary }]}
                            >
                                <View style={s.createBtnGradient}>
                                    <Text style={s.createBtnText}>Generate New Deck</Text>
                                </View>
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
                    </>
                }
                renderItem={({ item: deck }) => {
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
                                onPress={() => handleDelete(deck.id, deck.title)}
                            >
                                <View style={{ width: 90, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrashBinTrash size={22} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    );

                    return (
                        <Swipeable renderRightActions={renderRightActions} overshootRight={false} containerStyle={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 3 } }) }}>
                            <TouchableOpacity
                                onPress={() => handleDeckPress(deck.id)}
                                activeOpacity={0.9}
                                style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                            >
                                <View style={{ flex: 1, marginRight: 16 }}>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginBottom: 6 }} numberOfLines={2}>{deck.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93' }}>{deck.flashcards_count} Cards</Text>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#C7C7CC' }} />
                                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#8E8E93' }}>{new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                    </View>
                                </View>
                                <AltArrowRight size={20} color="#C7C7CC" strokeWidth={3} />
                            </TouchableOpacity>
                        </Swipeable>
                    );
                }}
                ListEmptyComponent={
                    isLoading ? (
                        <View>
                            <SkeletonDeck isDark={isDark} />
                            <SkeletonDeck isDark={isDark} />
                            <SkeletonDeck isDark={isDark} />
                        </View>
                    ) : (
                        <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={[s.emptyState, isDark ? s.glassBorderDark : s.glassBorderLight]}>
                            <View style={[s.emptyIconBox, isDark ? s.bgWhite5 : s.bgIndigo50]}>
                                <DocumentText size={40} color="#8B5CF6" />
                            </View>
                            <Text style={[s.emptyTitle, isDark ? s.textWhite : s.textSlate900]}>No Decks Yet</Text>
                            <Text style={[s.emptySubtitle, isDark ? s.textSlate500 : s.textSlate400]}>
                                Turn your notes or topics into interactive study sets with Skeeme AI.
                            </Text>
                        </BlurView>
                    )
                }
                ListFooterComponent={
                    hasMore && decks && decks.length >= 10 ? (
                        <TouchableOpacity
                            onPress={() => setPage(p => p + 1)}
                            style={[s.loadMoreBtn, isDark ? s.bgWhite10 : s.bgWhite60]}
                        >
                            {isLoading ? (
                                <LoadingSpinner size={24} />
                            ) : (
                                <Text style={[s.loadMoreText, isDark ? s.textWhite : s.textSlate900]}>Load More</Text>
                            )}
                        </TouchableOpacity>
                    ) : null
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24 },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    headerSubtitle: { fontWeight: '600', fontSize: 14, marginTop: 4, letterSpacing: -0.2 },
    menuBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    loadMoreBtn: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    loadMoreText: { fontWeight: '800', fontSize: 14, letterSpacing: -0.2 },

    scrollView: { flex: 1, paddingHorizontal: 16 },
    createBtnWrapper: { marginBottom: 32 },
    createBtn: { height: 64, borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
    createBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    createBtnText: { color: 'white', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
    countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    countBadgeText: { fontWeight: '800', fontSize: 11 },

    deckBtn: { marginBottom: 16 },
    deckCard: { padding: 16, borderRadius: 16, borderBottomWidth: 2 },
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
