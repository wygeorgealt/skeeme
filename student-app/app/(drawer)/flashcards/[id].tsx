import { Text } from '@/components/ui/Text';
import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { Pressable, View, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, Platform, LayoutAnimation, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { MathText } from '@/components/ui/MathText';
import { useAuthStore } from '@/store/authStore';
import { streamFlashcardGenerate } from '@/lib/aiStream';
import * as SecureStore from 'expo-secure-store';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Easing,
    withRepeat,
    FadeIn,
    ZoomIn,
    withSequence
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashcardDeckSummary } from '@/components/flashcards/FlashcardDeckSummary';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

import { Flashcard as Card, FlashcardDeck } from '@/types';
import { StreakAnimation } from '@/components/StreakAnimation';
import { markGenerationSuccess } from '@/lib/storeReview';
import { saveOfflineDeck } from '@/lib/offlineSaved';

// Storage helpers

const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            return await SecureStore.getItemAsync(key);
        } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch { /* ignore */ }
    },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const REWARD_MESSAGES = [
    "Brilliant! You've mastered this set.",
    "Spectacular! Your memory is getting sharper.",
    "Fantastic! You've successfully cleared the deck.",
    "Great work! You've crushed this study session.",
    "Success! You've reviewed every single card.",
    "Impressive! You've got this topic down pat.",
    "Well done! You're making serious progress.",
    "Excellent! Another study goal achieved.",
    "Bravo! You've completed the entire set."
];


const FlashcardItem = memo(({ card, isActive, isDark, isGenerating }: { card: Card; isActive: boolean; isDark: boolean; isGenerating: boolean }) => {
    const flipAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(1);
    const [flipped, setFlipped] = useState(false);
    
    const bounceAnim = useSharedValue(0);
    useEffect(() => {
        bounceAnim.value = withRepeat(
            withSequence(
                withTiming(-4, { duration: 500, easing: Easing.out(Easing.ease) }),
                withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);
    const bounceStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bounceAnim.value }]
    }));

    useEffect(() => {
        flipAnim.value = 0;
        setFlipped(false);
    }, [card.id, flipAnim]);

    const handleFlip = useCallback(() => {
        haptics.impactAsync();
        scaleAnim.value = withTiming(0.97, { duration: 100 }, () => {
            scaleAnim.value = withSpring(1);
        });
        flipAnim.value = withSpring(flipped ? 0 : 180, { damping: 15, stiffness: 90 });
        setFlipped(!flipped);
    }, [flipped, flipAnim, scaleAnim]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [0, 180]);
        return {
            transform: [{ perspective: 1500 }, { scale: scaleAnim.value }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            zIndex: flipped ? 0 : 1,
            opacity: interpolate(flipAnim.value, [0, 90], [1, 0]),
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [180, 360]);
        return {
            transform: [{ perspective: 1500 }, { scale: scaleAnim.value }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            zIndex: flipped ? 1 : 0,
            opacity: interpolate(flipAnim.value, [90, 180], [0, 1]),
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        };
    });

    const showLoading = isGenerating && !card.front;

    return (
        <View style={{ height: 400, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {/* Layers behind active card */}
            <View style={{ position: 'absolute', width: '86%', height: 350, backgroundColor: isDark ? '#2A2A2D' : '#e9e7ed', borderRadius: 28, transform: [{ translateY: 28 }, { scale: 0.90 }], opacity: 0.5 }} />
            <View style={{ position: 'absolute', width: '93%', height: 368, backgroundColor: isDark ? '#3A3A3E' : '#eeedf3', borderRadius: 30, transform: [{ translateY: 14 }, { scale: 0.95 }], opacity: 0.8 }} />

            <Pressable  onPress={handleFlip} style={{ flex: 1, width: '100%' }}>
                {/* FRONT FACE */}
                <Animated.View style={[frontAnimatedStyle, { flex: 1 }]}>
                    <View className="flex-1 rounded-[32px] p-6 justify-between shadow-xl" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.12)' }}>
                        {/* Top Metadata */}
                        <View className="flex-row items-center justify-between">
                            <View className="px-2 py-1 rounded-full bg-surface-container">
                                <Text className="text-on-surface-variant font-label-sm" style={{ fontSize: 11, fontWeight: '700' }}>Medium</Text>
                            </View>
                        </View>

                        {/* Center Content */}
                        <View className="flex-1 justify-center items-center">
                            {showLoading ? (
                                <View className="items-center">
                                    <ActivityIndicator size="large" color="#007AFF" />
                                    <Text className="mt-4 text-center" style={{ fontSize: 16, color: isDark ? '#FFFFFF' : '#1E293B' }}>Generating card...</Text>
                                </View>
                            ) : (
                                <MathText
                                    content={card.front}
                                    color={isDark ? '#FFF' : '#000'}
                                    fontSize={22}
                                    containerStyle={{ width: '100%', textAlign: 'center' }}
                                />
                            )}
                        </View>

                        {/* Bottom Prompt */}
                        <View className="flex-col gap-2 items-center pb-2">
                            <Animated.View style={bounceStyle} className="flex-row items-center py-1.5 px-3 rounded-full bg-surface-container-low gap-1.5">
                                <Icon name="Hand" size={16} color="secondary" />
                                <Text className="font-label-sm" style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#EBEBF5' : '#48484A' }}>Tap anywhere to flip card</Text>
                            </Animated.View>
                        </View>
                    </View>
                </Animated.View>

                {/* BACK FACE */}
                <Animated.View style={[backAnimatedStyle, { flex: 1 }]}>
                    <View className="flex-1 rounded-[32px] p-6 justify-between shadow-xl" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.12)' }}>
                        {/* Top Back Tag */}
                        <View className="flex-row items-center justify-between">
                            <View className="px-2.5 py-1 rounded-full bg-tertiary flex-row items-center gap-1">
                                <Icon name="CheckCircle2" size={14} color="white" />
                                <Text className="text-on-tertiary font-label-sm" style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>Verified Solution</Text>
                            </View>
                            <View className="h-8 px-3 rounded-full bg-surface-container flex-row items-center gap-1 justify-center">
                                <Icon name="RotateCcw" size={14} color={isDark ? '#EBEBF5' : '#48484A'} />
                                <Text className="text-on-surface-variant font-label-sm" style={{ fontSize: 11, fontWeight: '600' }}>Question</Text>
                            </View>
                        </View>

                        {/* Center Content */}
                        <View className="flex-1 justify-center items-center">
                            {showLoading ? (
                                <View className="items-center">
                                    <ActivityIndicator size="large" color="#34C759" />
                                </View>
                            ) : (
                                <MathText
                                    content={card.back}
                                    color={isDark ? '#FFF' : '#000'}
                                    fontSize={18}
                                    containerStyle={{ width: '100%', textAlign: 'center' }}
                                />
                            )}
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </View>
    );
});

FlashcardItem.displayName = 'FlashcardItem';


export default function StudyDeckScreen() {
    const { id, autoStart, topic, card_count, difficulty } = useLocalSearchParams();
    const scrollRef = useRef<ScrollView>(null);
    const esRef = useRef<any>(null);
    const queryClient = useQueryClient();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cachedDeck, setCachedDeck] = useState<any>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [streamingCards, setStreamingCards] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(autoStart === 'true');
    const [genStage, setGenStage] = useState('Researching...');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const progressAnim = useSharedValue(0);
    const syncAnim = useSharedValue(0);
    const { user, updateUser } = useAuthStore();
    const [isSavingSession, setIsSavingSession] = useState(false);
    const [rewardMessage, setRewardMessage] = useState('');
    const [showMilestone, setShowMilestone] = useState(false);

    
    const [isSavingOffline, setIsSavingOffline] = useState(false);
    const [isOfflineSaved, setIsOfflineSaved] = useState(false);
    
    // NEW STATES
    const insets = useSafeAreaInsets();
    const [ratings, setRatings] = useState({ easy: 0, good: 0, hard: 0, again: 0 });
    const [sessionStartTime] = useState(Date.now());
    const [isFlagged, setIsFlagged] = useState(false);
    
    const pulseAnim = useSharedValue(1);
    useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            true
        );
    }, []);
    const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseAnim.value }));
    
    const handleRating = (ratingType: 'again' | 'hard' | 'good' | 'easy') => {
        setRatings(prev => ({ ...prev, [ratingType]: prev[ratingType] + 1 }));
        nextCard();
    };



    const { data: remoteDeck, isLoading, error, refetch } = useQuery({
        queryKey: ['deck', id],
        queryFn: async () => {
            const res = await api.get(`/flashcards/decks/${id}`);
            const raw = res.data?.data || res.data?.deck || res.data;
            if (!raw) return null;
            const normalized = {
                ...raw,
                flashcards: raw.flashcards || raw.cards || (res.data?.cards) || [],
            };
            await storage.setItem(`cache_deck_detail_${id}`, JSON.stringify(normalized));
            return normalized;
        },
        staleTime: 5000,
    });

    const deck = useMemo(() => remoteDeck || cachedDeck, [remoteDeck, cachedDeck]);

    // Merge remote cards and streaming cards
    const cards = useMemo(() => {
        const base = deck?.flashcards || deck?.cards || [];
        const streaming = streamingCards.filter((sc: any) => !base.some((bc: any) => bc.front === sc.front));
        return [...base, ...streaming];
    }, [deck?.flashcards, deck?.cards, streamingCards]);

    const totalCards = parseInt(card_count as string) || 0;
    // Decode title if it's URL-encoded
    const decodedTitle = deck?.title 
        ? decodeURIComponent(deck.title).replace(/\.pdf$|\.docx?$|\.txt$|\.md$/i, '')
        : '';
    
    // Show generation progress while generating (X/30), otherwise show card counter (X of Y)
    const cardCounterDisplay = isGenerating 
        ? `${cards.length}/${totalCards}`
        : `${currentIndex + 1}/${cards.length}`;
    
    const headerTitle = decodedTitle || (isGenerating ? 'Generating...' : 'Study Deck');

    // Sync animation for loading state
    useEffect(() => {
        if (isLoading && !remoteDeck) {
            syncAnim.value = withRepeat(
                withTiming(360, { duration: 1500, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            syncAnim.value = withTiming(0);
        }
    }, [isLoading, remoteDeck]);

    const syncAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${syncAnim.value}deg` }
            ]
        };
    });

    // Reset completion state when screen regains focus (fixes returning from history)
    useFocusEffect(
        useCallback(() => {
            setIsComplete(false);
        }, [])
    );

    // Reset state when deck ID changes
    useEffect(() => {
        setCurrentIndex(0);
        setIsComplete(false);
        setCachedDeck(null);
        setStreamingCards([]);
        setGenStage('Researching...');
        setIsGenerating(autoStart === 'true');
        progressAnim.value = 0;
    }, [id]);

    // Handle auto-start generation — cleanup on unmount to prevent memory leak (C2)
    useEffect(() => {
        if (autoStart === 'true' && id) {
            setIsGenerating(true);
            startLiveGeneration();
        }
        return () => {
            esRef.current?.close();
        };
    }, [id, autoStart]);

    const startLiveGeneration = () => {
        setIsGenerating(true);
        let accumulatedJson = '';

        const cleanup = streamFlashcardGenerate(
            {
                deck_id: id as string,
                topic: (topic as string) || decodedTitle || 'General Study',
                card_count: parseInt(card_count as string) || 10,
                difficulty: (difficulty as string) || 'medium',
            },
            {
                onStatus: (message) => {
                    setGenStage(message);
                },
                onToken: (token) => {
                    accumulatedJson += token;
                    const partial = parsePartialJson(accumulatedJson);
                    if (partial && Array.isArray(partial)) {
                        setStreamingCards(partial);
                        if (__DEV__) {
                            console.log(`Streaming: ${partial.length} cards accumulated (expecting ~${card_count})`);
                        }
                    }
                },
                onComplete: (fullText) => {
                    handleStreamComplete(fullText || accumulatedJson);
                },
                onError: (error, isInsufficientCredits) => {
                    setIsGenerating(false);
                    if (isInsufficientCredits) {
                        Alert.alert('Insufficient Credits', 'You need more credits to generate flashcards.');
                    } else {
                        Alert.alert('Generation Error', error || 'The study generation server encountered an issue. Please try again.');
                    }
                    if (autoStart === 'true') {
                        api.delete(`/flashcards/decks/${id}`).catch(() => {});
                    }
                    router.back();
                },
            }
        );

        esRef.current = { close: cleanup } as any;
    };

    const saveGeneratedFlashcards = async (cards: any[]) => {
        if (!id || cards.length === 0) return;
        await api.post(`flashcards/decks/${id}/cards`, { cards });
    };

    const handleStreamComplete = async (fullJson: string) => {
        const cards = parsePartialJson(fullJson);
        if (!cards || !Array.isArray(cards)) {
            Alert.alert('Generation Error', 'Unable to parse generated flashcards. Please try again.');
            setIsGenerating(false);
            if (autoStart === 'true') {
                api.delete(`/flashcards/decks/${id}`).catch(() => {});
            }
            router.back();
            return;
        }

        setStreamingCards(cards);

        try {
            await saveGeneratedFlashcards(cards);
            queryClient.invalidateQueries({ queryKey: ['deck', id] });
            const res = await refetch();
            if (__DEV__) {
                console.log('Saved and refetched deck:', {
                    deckCardCount: res.data?.data?.flashcards?.length,
                    streamedCount: cards.length,
                    id
                });
            }
            markGenerationSuccess('flashcard').catch(() => {});
        } catch (err) {
            if (__DEV__) console.warn('Failed to save streamed flashcards:', err);
            Alert.alert('Save Failed', 'Unable to persist generated flashcards. Please try again.');
            if (autoStart === 'true') {
                api.delete(`/flashcards/decks/${id}`).catch(() => {});
            }
            router.back();
        } finally {
            setIsGenerating(false);
        }
    };

    const parsePartialJson = (json: string) => {
        try {
            let testJson = json.trim();
            testJson = testJson.replace(/```(?:json)?|```/g, '').trim();
            if (!testJson.endsWith(']') && !testJson.endsWith('}')) {
                if (testJson.startsWith('[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) testJson = testJson.substring(0, lastObjEnd + 1) + ']';
                    else testJson += ']';
                } else if (testJson.includes('"front"')) {
                    // Wrapped object fallback — extract array if present
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) testJson = testJson.substring(0, lastObjEnd + 1) + ']}';
                    else testJson += ']}';
                }
            }
            const parsed = JSON.parse(testJson);
            return Array.isArray(parsed) ? parsed : (parsed.cards || parsed.flashcards || null);
        } catch (e) { return null; }
    };

    useEffect(() => {
        const hydrate = async () => {
            const cacheKey = `cache_deck_detail_${id}`;
            const cached = await storage.getItem(cacheKey);
            if (cached) setCachedDeck(JSON.parse(cached));
        };
        hydrate();
    }, [id]);

    useEffect(() => {
        if (cards.length > 0) {
            progressAnim.value = withTiming((currentIndex + 1) / cards.length, { duration: 300 });
        }
    }, [currentIndex, cards]);

    const nextCard = () => {
        if (cards.length === 0) return;
        if (currentIndex < cards.length - 1) {
            haptics.impactAsync();
            const nextIndex = currentIndex + 1;
            scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
            // The scroll listener will update the index to ensure smooth transition
        } else if (!isGenerating) {
            // Only mark complete once streaming has finished
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            haptics.notificationAsync('success' as any);
            setRewardMessage(REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)]);

            // Determine if we should show the big celebration
            const streak = typeof user?.streak === 'number' ? user.streak : (user?.streak?.current_streak || 0);
            const lastDate = typeof user?.streak === 'object' ? user.streak?.last_study_date : null;
            const today = new Date().toISOString().split('T')[0];

            // Show milestone if they haven't studied today yet AND it's a milestone count
            // (Note: streak will increment after saving, so we check current+1)
            const nextStreak = streak + 1;
            const isFirstStudyToday = lastDate !== today;
            const isMilestoneCount = nextStreak === 1 || nextStreak % 7 === 0;

            setShowMilestone(isFirstStudyToday && isMilestoneCount);
            setIsComplete(true);
        }
    };

    const prevCard = () => {
        if (cards.length === 0) return;
        if (currentIndex > 0) {
            haptics.impactAsync();
            const prevIndex = currentIndex - 1;
            scrollRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            // The scroll listener will update the index
        }
    };

    const saveFlashcardSession = useCallback(async () => {
        if (!deck || isSavingSession) return;

        setIsSavingSession(true);
        try {
            // Record the completion in history/sessions
            const res = await api.post('flashcards/history', {
                deck_id: id,
                cards_count: deck.flashcards.length,
                completed_at: new Date().toISOString(),
            });

            // Refresh user stats via React Query cache
            queryClient.invalidateQueries({ queryKey: ['student', 'me'] });
        } catch (err) {
            if (__DEV__) console.warn('Failed to save flashcard session:', err);
        } finally {
            setIsSavingSession(false);
        }
    }, [id, deck, isSavingSession]);

    useEffect(() => {
        if (isComplete) {
            saveFlashcardSession();
        }
    }, [isComplete]);

    const restartSession = () => {
        haptics.impactAsync();
        setIsComplete(false);
        setCurrentIndex(0);
        scrollRef.current?.scrollTo({ x: 0, animated: false });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (cards.length === 0) return;
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / SCREEN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < cards.length) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCurrentIndex(index);
        }
    };

    if (error && !deck) return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScreenHeader title="Study Deck" onBack={() => router.back()} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, paddingBottom: 48 }}>
                <View
                    style={{
                        width: '100%',
                        backgroundColor: C.card,
                        borderRadius: 28,
                        padding: 28,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: C.border,
                    }}
                >
                    <View
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 22,
                            backgroundColor: C.surfaceLow,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <Icon name="AlertTriangle" size={30} color="warning" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 }}>
                        Deck Unavailable
                    </Text>
                    <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 24 }}>
                        We couldn&apos;t load this flashcard deck. It may have been removed or your connection was interrupted.
                    </Text>
                    <View style={{ width: '100%', gap: 10 }}>
                        <AnimatedButton
                            title="Retry Loading"
                            onPress={() => refetch()}
                            type="capsule"
                            backgroundColor="#007AFF"
                            shadowColor="#0066D6"
                            fullWidth
                        />
                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                height: 48,
                                borderRadius: 999,
                                backgroundColor: C.surfaceLow,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>Go Back</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );

    if (isLoading && !deck) return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScreenHeader title="Loading Deck..." onBack={() => router.back()} />
            <View style={s.loadingWrapper}>
                <SkeletonLoader width={120} height={16} style={{ marginBottom: 12, borderRadius: 8 }} />
                <SkeletonLoader width="60%" height={32} style={{ marginBottom: 48, borderRadius: 12 }} />
                <View style={[s.loadingPlaceholder, isDark ? s.bgGrayDark : s.bgWhite]}>
                    <SkeletonLoader width="80%" height={24} style={{ marginBottom: 12, borderRadius: 6 }} />
                    <SkeletonLoader width="60%" height={24} style={{ borderRadius: 6 }} />
                </View>
            </View>
        </View>
    );

    // Show "no cards" only if we're NOT generating AND don't have streaming cards AND deck is empty
    if (!deck || !deck.flashcards || (!isGenerating && streamingCards.length === 0 && deck.flashcards.length === 0)) return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScreenHeader
                title={decodedTitle || 'Flashcard Deck'}
                subtitle="Empty Deck"
                onBack={() => router.back()}
            />

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Main Empty State Card */}
                <View
                    style={{
                        width: '100%',
                        backgroundColor: C.card,
                        borderRadius: 28,
                        padding: 28,
                        borderWidth: 1,
                        borderColor: C.border,
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 20,
                            backgroundColor: C.surfaceLow,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <Icon name="Layers" size={30} color="default" />
                    </View>

                    {decodedTitle ? (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: C.surfaceLow,
                                marginBottom: 14,
                            }}
                        >
                            <Icon name="BookOpen" size={14} color="default" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textSecondary }} numberOfLines={1}>
                                {decodedTitle}
                            </Text>
                        </View>
                    ) : null}

                    <Text style={{ fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', letterSpacing: -0.4, marginBottom: 8 }}>
                        No Cards in This Deck
                    </Text>
                    <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 }}>
                        This deck doesn&apos;t have any study cards yet. You can generate AI flashcards for this topic right now or create a new deck.
                    </Text>

                    {/* Primary & Secondary Actions */}
                    <View style={{ width: '100%', gap: 10 }}>
                        <AnimatedButton
                            title={decodedTitle ? 'Generate Cards for Deck' : 'Create New Flashcards'}
                            onPress={() => {
                                haptics.impactAsync();
                                if (id && (decodedTitle || topic)) {
                                    startLiveGeneration();
                                } else {
                                    router.replace('/(drawer)/flashcards' as any);
                                }
                            }}
                            type="capsule"
                            backgroundColor="#007AFF"
                            shadowColor="#0066D6"
                            fullWidth
                        />

                        <Pressable
                            onPress={() => {
                                haptics.selectionAsync();
                                router.back();
                            }}
                            style={{
                                height: 48,
                                borderRadius: 999,
                                backgroundColor: C.surfaceLow,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <Icon name="ArrowLeft" size={16} color="default" />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>
                                Back to Library
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );

    if (isComplete) {
        const streak = typeof user?.streak === 'number' ? user.streak : (user?.streak?.current_streak || 1);
        const cardsForOffline = (deck?.flashcards || []).map((c: any) => ({
            front: c.front,
            back: c.back,
        }));


        if (showMilestone) {
            return (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#000' : '#FFF', zIndex: 9999 }]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                        <StreakAnimation
                            streakCount={streak}
                            isDark={isDark}
                            size={SCREEN_WIDTH * 0.7}
                        />
                        <Animated.View entering={FadeIn.delay(2000).duration(800)} style={{ alignItems: 'center' }}>
                            <Text style={[s.successTitle, isDark ? s.textWhite : s.textSlate900, { fontSize: 32 }]}>
                                {streak} Day Streak!
                            </Text>
                            <Text style={[s.successSubtitle, { marginBottom: 40 }]}>
                                You&apos;re on fire! Keep up the amazing work.
                            </Text>

                            <View style={{ width: '100%' }}>
                                <AnimatedButton
                                    title="Awesome!"
                                    onPress={() => router.back()}
                                    type="capsule"
                                    backgroundColor="#007AFF"
                                    shadowColor="#0066D6"
                                    fullWidth
                                />
                            </View>
                        </Animated.View>
                    </View>
                </View>
            );
        }

        
        const totalTimeSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(totalTimeSeconds / 60);
        const seconds = totalTimeSeconds % 60;
        const timeSpent = `${minutes}m ${seconds}s`;

        return (
            <FlashcardDeckSummary
                deckTitle={decodedTitle || 'Study Deck'}
                subject="General"
                totalCards={deck.flashcards.length}
                ratings={ratings}
                sessionDurationMs={totalTimeSeconds * 1000}
                streakCount={useAuthStore.getState().user?.streak?.current_streak || 0}
                onFinish={() => router.back()}
                onRetake={restartSession}
                onPracticeQuiz={() => router.push('/(drawer)/generate')}
            />
        );
    

    }

    const progressWidth = cards.length > 0 ? `${((currentIndex + 1) / cards.length) * 100}%` : '0%';

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <ScreenHeader
                title=""
                onBack={() => router.back()}
                rightAction={
                    <Pressable
                        onPress={() => setIsFlagged(!isFlagged)}
                        hitSlop={8}
                        className="w-10 h-10 items-center justify-center rounded-full"
                    >
                        <Icon name={isFlagged ? "BookmarkCheck" : "Bookmark"} size={22} color={isFlagged ? "primary" : "textSecondary"} />
                    </Pressable>
                }
            />

            {/* Progress Section */}
            <View className="flex-col w-full px-4 mb-4 mt-2">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5">
                        <Animated.View style={pulseStyle} className="w-2 h-2 rounded-full bg-accent-electric-blue" />
                        <Text className="font-label-sm uppercase tracking-wider" style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }}>
                            {headerTitle}
                        </Text>
                    </View>
                </View>
                <View className="flex-col gap-1.5">
                    <View className="flex-row justify-between items-center">
                        <Text className="font-label-sm" style={{ fontSize: 11, fontWeight: '600', color: C.text }}>
                            Card {currentIndex + 1} of {cards.length > 0 ? cards.length : totalCards}
                        </Text>
                    </View>
                    <View className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                        <Animated.View className="h-full bg-accent-electric-blue rounded-full" style={{ width: progressWidth as any }} />
                    </View>
                </View>
            </View>

            {/* Main Pager */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={s.pager}
                contentContainerStyle={s.pagerContent}
                scrollEventThrottle={16}
            >
                {cards.map((card: any, index: number) => (
                    <View key={card.id?.toString() || `stream-${index}`} style={{ width: SCREEN_WIDTH, height: '100%', paddingHorizontal: 24 }}>
                        <FlashcardItem card={card} isActive={currentIndex === index} isDark={isDark} isGenerating={isGenerating} />
                    </View>
                ))}
                {isGenerating && cards.length < (parseInt(card_count as string) || 0) && (
                    <View style={{ width: SCREEN_WIDTH, height: '100%', paddingHorizontal: 24 }}>
                        <View style={[s.loadingPlaceholder, isDark ? s.bgGrayDark : s.bgWhite, { marginTop: 20 }]}>
                            <SkeletonLoader width="60%" height={24} style={{ marginBottom: 16 }} />
                            <SkeletonLoader width="80%" height={16} />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Navigation Footer */}
            <View className="px-4 pb-12 pt-5">
                {currentIndex === cards.length - 1 && !isGenerating ? (
                    <View className="w-full h-16 rounded-full overflow-hidden">
                        <AnimatedButton
                            title="Finish Deck"
                            onPress={nextCard}
                            type="capsule"
                            backgroundColor="#007AFF"
                            shadowColor="#0066D6"
                            fullWidth
                        />
                    </View>
                ) : (
                    <View>
                        {/* Spaced Repetition Rating Bar */}
                        <View className="flex-col gap-2">
                            <View className="flex-row justify-between items-center px-1">
                                <Text className="font-label-sm" style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>How well did you know this?</Text>
                            </View>
                            <View className="flex-row gap-2 justify-between">
                                <Pressable 
                                    onPress={() => handleRating('again')} 
                                    className="flex-1 flex-col items-center justify-center py-2.5 px-1 rounded-2xl shadow-sm"
                                    style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
                                >
                                    <View className="w-2 h-2 rounded-full bg-error mb-1" />
                                    <Text className="font-label-sm font-bold" style={{ fontSize: 11, color: C.text }}>Again</Text>
                                    <Text className="font-label-sm" style={{ fontSize: 10, color: C.textSecondary }}>&lt; 1m</Text>
                                </Pressable>
                                
                                <Pressable 
                                    onPress={() => handleRating('hard')} 
                                    className="flex-1 flex-col items-center justify-center py-2.5 px-1 rounded-2xl shadow-sm"
                                    style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
                                >
                                    <View className="w-2 h-2 rounded-full bg-accent-indigo mb-1" />
                                    <Text className="font-label-sm font-bold" style={{ fontSize: 11, color: C.text }}>Hard</Text>
                                    <Text className="font-label-sm" style={{ fontSize: 10, color: C.textSecondary }}>10m</Text>
                                </Pressable>
                                
                                <Pressable 
                                    onPress={() => handleRating('good')} 
                                    className="flex-1 flex-col items-center justify-center py-2.5 px-1 rounded-2xl shadow-md"
                                    style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#e0edff', borderColor: C.primary, borderWidth: 1.5 }}
                                >
                                    <View className="w-2 h-2 rounded-full bg-accent-electric-blue mb-1" />
                                    <Text className="font-label-sm font-bold text-accent-electric-blue" style={{ fontSize: 11 }}>Good</Text>
                                    <Text className="font-label-sm text-accent-electric-blue font-medium" style={{ fontSize: 10 }}>1d</Text>
                                </Pressable>
                                
                                <Pressable 
                                    onPress={() => handleRating('easy')} 
                                    className="flex-1 flex-col items-center justify-center py-2.5 px-1 rounded-2xl shadow-sm"
                                    style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
                                >
                                    <View className="w-2 h-2 rounded-full bg-tertiary mb-1" />
                                    <Text className="font-label-sm font-bold" style={{ fontSize: 11, color: C.text }}>Easy</Text>
                                    <Text className="font-label-sm" style={{ fontSize: 10, color: C.textSecondary }}>4d</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Bottom Utility Dock */}
                        <View className="flex-row items-center justify-between mt-6">
                            <Pressable 
                                onPress={prevCard} 
                                disabled={currentIndex === 0} 
                                className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center"
                                style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
                            >
                                <Icon name="RotateCcw" size={20} color="default" style={{ opacity: currentIndex === 0 ? 0.3 : 1 }} />
                            </Pressable>

                            <Pressable 
                                onPress={() => setIsFlagged(!isFlagged)} 
                                className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center"
                                style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
                            >
                                <Icon name={isFlagged ? "BookmarkCheck" : "Bookmark"} size={20} color={isFlagged ? "primary" : "textSecondary"} />
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    headerRow: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTextContainer: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
    headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    size10: { width: 44 },

    progressContainer: { paddingHorizontal: 16, alignItems: 'center', gap: 12 },
    progressBarBg: { height: 6, width: 100, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
    bgWhite5: { backgroundColor: 'rgba(255,255,255,0.05)' },
    bgSlate200: { backgroundColor: 'rgba(0,0,0,0.05)' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },

    pager: { flex: 1 },
    pagerContent: { paddingTop: 20, paddingBottom: 0 },

    cardContainer: { height: SCREEN_HEIGHT * 0.48, marginVertical: 0 },
    cardBase: { flex: 1, borderRadius: 16, overflow: 'hidden' },
    glassCard: { flex: 1, borderRadius: 16, padding: 32, justifyContent: 'center', borderBottomWidth: 4 },
    glassBorderDark: { borderColor: 'rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,122,255,0.3)' },
    glassBorderLight: { borderColor: 'rgba(0,0,0,0.05)', borderBottomColor: 'rgba(0,122,255,0.15)' },
    glassBorderBack: { borderColor: 'rgba(0,122,255,0.2)', borderBottomColor: 'rgba(0,122,255,0.4)' },

    cardHeader: { position: 'absolute', top: 32, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,122,255,0.1)' },
    typeBadgeText: { fontSize: 10, fontWeight: '900', color: '#007AFF', letterSpacing: 1 },

    cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
    mathTextContainer: { width: '100%' },

    cardFooterTextPos: { position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
    cardFooterText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
    cardBackFooterText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },

    footer: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 20 },
    controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    navIconBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    finishBtn: { width: '100%', height: 64, borderRadius: 32, overflow: 'hidden' },
    mainActionBtn: { flex: 1, height: 64, borderRadius: 32, overflow: 'hidden' },
    mainActionBlur: { flex: 1 },
    mainActionGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    mainActionLabel: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
    opacity0: { opacity: 0 },

    successCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    successIconBox: { width: 100, height: 100, borderRadius: 50, marginBottom: 32, padding: 8, backgroundColor: 'rgba(0,122,255,0.1)' },
    successIconGradient: { flex: 1, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
    successTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: -1 },
    successSubtitle: { fontSize: 16, fontWeight: '500', color: '#94a3b8', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    successActions: { flexDirection: 'row', gap: 16, width: '100%' },
    outlineBtn: { height: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2 },
    outlineBtnDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    outlineBtnLight: { borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'white' },
    outlineBtnText: { fontWeight: '700', fontSize: 15 },
    blueBtnGradient: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    btnTextLarge: { color: 'white', fontWeight: '800', fontSize: 16 },

    errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    errorTitle: { fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 8 },
    errorSubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    noCardsText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
    goBackTextPrimary: { color: '#007AFF', fontWeight: '800', fontSize: 15 },
    mt4: { marginTop: 16 },

    loadingWrapper: { flex: 1, paddingHorizontal: 16, paddingTop: 100 },
    loadingPlaceholder: { width: '100%', aspectRatio: 3 / 4, borderRadius: 16, padding: 32, justifyContent: 'center' },
    bgGrayDark: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    bgWhite: { backgroundColor: '#FFFFFF' },
    flexRowGap2: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    textWhite: { color: 'white' },
    textWhite40: { color: 'rgba(255,255,255,0.4)' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
});
