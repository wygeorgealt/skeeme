import { Text } from '@/components/ui/Text';
import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useColorScheme, StyleSheet, Platform, LayoutAnimation, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { CheckCircle, AltArrowLeft, AltArrowRight, Refresh, DangerTriangle, LightbulbBolt } from '@solar-icons/react-native/Bold';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MathText } from '@/components/ui/MathText';
import { useAuthStore } from '@/store/authStore';
import EventSource from 'react-native-sse';

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
    ZoomIn
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import { Flashcard as Card, FlashcardDeck } from '@/types';
import { StreakAnimation } from '@/components/StreakAnimation';

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

    const CardSide = ({ type, text, footer, rotateY }: any) => {
        const showLoading = isGenerating && !text;
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderRadius: 24, padding: 32, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                <View style={{ position: 'absolute', top: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>{type}</Text>
                    {type === 'QUESTION' ? <LightbulbBolt size={20} color="#007AFF" /> : <CheckCircle size={20} color="#34C759" />}
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {showLoading ? (
                        <View style={{ alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={{ marginTop: 14, fontSize: 16, color: isDark ? '#FFFFFF' : '#1E293B', textAlign: 'center', maxWidth: 260 }}>Generating card...</Text>
                        </View>
                    ) : (
                        <MathText
                            content={text}
                            color={isDark ? '#FFF' : '#000'}
                            fontSize={type === 'QUESTION' ? 22 : 18}
                            containerStyle={{ width: '100%' }}
                        />
                    )}
                </View>

                <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#C7C7CC', textTransform: 'uppercase', letterSpacing: 1.5 }}>{footer}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={s.cardContainer}>
            <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={s.flex1}>
                <Animated.View style={frontAnimatedStyle}>
                    <CardSide type="QUESTION" text={card.front} footer="Tap to reveal answer" />
                </Animated.View>

                <Animated.View style={backAnimatedStyle}>
                    <CardSide type="ANSWER" text={card.back} footer="Tap to view question" />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
});

export default function StudyDeckScreen() {
    const { id, autoStart, topic, card_count, difficulty, mode, idempotency } = useLocalSearchParams();
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
    const progressAnim = useSharedValue(0);
    const syncAnim = useSharedValue(0);
    const { user, updateUser } = useAuthStore();
    const [isSavingSession, setIsSavingSession] = useState(false);
    const [rewardMessage, setRewardMessage] = useState('');
    const [showMilestone, setShowMilestone] = useState(false);

    const { data: remoteDeck, isLoading, error, refetch } = useQuery({
        queryKey: ['deck', id],
        queryFn: async () => {
            const res = await api.get(`/flashcards/decks/${id}`);
            const data = res.data.data;
            await storage.setItem(`cache_deck_detail_${id}`, JSON.stringify(data));
            return data;
        },
        staleTime: 5000,
    });

    const deck = useMemo(() => remoteDeck || cachedDeck, [remoteDeck, cachedDeck]);

    // Merge remote cards and streaming cards
    const cards = useMemo(() => {
        const base = deck?.flashcards || [];
        const streaming = streamingCards.filter((sc: any) => !base.some((bc: any) => bc.front === sc.front));
        return [...base, ...streaming];
    }, [deck?.flashcards, streamingCards]);

    const totalCards = parseInt(card_count as string) || 0;
    const maxVisibleDots = 15;
    const visibleDotCount = Math.min(cards.length, maxVisibleDots);
    const dotWindowStart = cards.length > visibleDotCount
        ? Math.min(Math.max(0, currentIndex - Math.floor(visibleDotCount / 2)), cards.length - visibleDotCount)
        : 0;
    const visibleDotIndexes = Array.from({ length: visibleDotCount }, (_, idx) => dotWindowStart + idx);
    const activeDotIndex = currentIndex - dotWindowStart;
    
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
        setStreamingCards([]);
        setGenStage('Researching...');
        setIsGenerating(false);
        progressAnim.value = 0;
    }, [id]);

    // Handle auto-start generation — cleanup on unmount to prevent memory leak (C2)
    useEffect(() => {
        if (autoStart === 'true' && id) {
            startLiveGeneration();
        }
        return () => {
            esRef.current?.close();
        };
    }, [id, autoStart]);

    const startLiveGeneration = () => {
        setIsGenerating(true);
        const token = useAuthStore.getState().token;
        const url = `${process.env.EXPO_PUBLIC_API_URL}flashcards/generate/stream`;

        let accumulatedJson = '';

        const es = new EventSource(url, {
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Idempotency-Key': (idempotency as string) || '',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                deck_id: id,
                topic: topic,
                card_count: card_count,
                difficulty: difficulty
            })
        } as any);

        esRef.current = es;

        es.addEventListener('message', (event) => {
            if (event.data === '[DONE]') {
                es.close();
                esRef.current = null;
                handleStreamComplete(accumulatedJson);
                return;
            }

            try {
                const chunk = JSON.parse(event.data || '{}');
                if (chunk.error) {
                    Alert.alert('Generation Failed', chunk.error);
                    es.close();
                    esRef.current = null;
                    setIsGenerating(false);
                    if (autoStart === 'true') {
                        api.delete(`/flashcards/decks/${id}`).catch(() => {});
                    }
                    router.back();
                    return;
                }
                if (chunk.type === 'status') setGenStage(chunk.message);
                if (chunk.text) {
                    accumulatedJson += chunk.text;
                    const partial = parsePartialJson(accumulatedJson);
                    if (partial && Array.isArray(partial)) {
                        setStreamingCards(partial);
                        if (__DEV__) {
                            console.log(`Streaming: ${partial.length} cards accumulated (expecting ~${card_count})`);
                        }
                    }
                }
            } catch (e) {
                if (__DEV__) console.warn('Message parse error:', e);
            }
        });

        es.addEventListener('error', (event: any) => {
            es.close();
            esRef.current = null;
            setIsGenerating(false);
            if (event?.xhr?.status === 429 || event?.message?.includes('429')) {
                useAuthStore.getState().toggleCooldownModal(true);
            } else {
                Alert.alert('Generation Error', 'The study generation server encountered an issue. Please try again.');
                if (autoStart === 'true') {
                    api.delete(`/flashcards/decks/${id}`).catch(() => {});
                }
                router.back();
            }
        });
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

            // RefreshCcw user stats for the dashboard
            const userRes = await api.get('me');
            if (userRes.data) {
                updateUser(userRes.data);
            }
        } catch (err) {
            if (__DEV__) console.warn('Failed to save flashcard session:', err);
        } finally {
            setIsSavingSession(false);
        }
    }, [id, deck, isSavingSession, updateUser]);

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
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={s.errorCenter}>
                <DangerTriangle size={64} color="#ef4444" />
                <Text style={[s.errorTitle, isDark ? s.textWhite : s.textSlate900]}>Deck not found</Text>
                <Text style={s.errorSubtitle}>
                    We couldn't load this flashcard deck. It might have been deleted or there was a connection issue.
                </Text>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                    <View style={[s.blueBtnGradient, { backgroundColor: '#007AFF' }]}>
                        <Text style={s.btnTextLarge}>Go Back</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading && !deck) return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
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
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={s.errorCenter}>
                <Text style={s.noCardsText}>No cards found in this deck.</Text>
                <TouchableOpacity onPress={() => router.back()} style={s.mt4}>
                    <Text style={s.goBackTextPrimary}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isComplete) {
        const streak = typeof user?.streak === 'number' ? user.streak : (user?.streak?.current_streak || 1);

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
                                You're on fire! Keep up the amazing work.
                            </Text>

                            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ width: '100%' }}>
                                <View style={[s.blueBtnGradient, { backgroundColor: '#007AFF', width: 240, borderRadius: 32 }]}>
                                    <Text style={s.btnTextLarge}>Awesome!</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <View style={s.successCenter}>
                    <Animated.View entering={ZoomIn.duration(800)}>
                        <View style={s.successIconBox}>
                            <View style={[s.successIconGradient, { backgroundColor: '#34C759' }]}>
                                <CheckCircle size={48} color="white" />
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(300).duration(600)}>
                        <Text style={[s.successTitle, isDark ? s.textWhite : s.textSlate900]}>Good Job! 👍</Text>
                        <Text style={s.successSubtitle}>{rewardMessage || "You've mastered all " + deck.flashcards.length + " cards in this set. Great job!"}</Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(600).duration(600)} style={s.successActions}>
                        <TouchableOpacity onPress={restartSession} activeOpacity={0.8} style={s.flex1}>
                            <View style={[s.outlineBtn, isDark ? s.outlineBtnDark : s.outlineBtnLight]}>
                                <Refresh size={20} color={isDark ? 'white' : '#0f172a'} />
                                <Text style={[s.outlineBtnText, isDark ? s.textWhite : s.textSlate900]}>Retake</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.flex1}>
                            <View style={[s.blueBtnGradient, { backgroundColor: '#007AFF' }]}>
                                <Text style={s.btnTextLarge}>Finish</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        );
    }

    const progressWidth = cards.length > 0 ? `${((currentIndex + 1) / cards.length) * 100}%` : '0%';

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[s.headerRow, { paddingBottom: 16 }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.backBtn, isDark ? s.bgWhite10 : s.bgWhite60]}>
                    <AltArrowLeft size={24} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <View style={s.headerTextContainer}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {cardCounterDisplay}
                    </Text>
                    <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900, { maxWidth: SCREEN_WIDTH * 0.65, marginTop: 4 }]} numberOfLines={1}>
                        {headerTitle}
                    </Text>
                    {isGenerating && (
                        <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: '700', marginTop: 4 }}>{genStage}</Text>
                    )}
                </View>
                <View style={s.size10} />
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

            {/* Bottom Progress Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                {visibleDotIndexes.map((idx: number, dotIdx: number) => (
                    <View key={idx} style={{
                        width: activeDotIndex === dotIdx ? 8 : 6,
                        height: activeDotIndex === dotIdx ? 8 : 6,
                        borderRadius: 4,
                        backgroundColor: activeDotIndex === dotIdx ? '#007AFF' : (isDark ? '#3A3A3C' : '#D1D1D6')
                    }} />
                ))}
            </View>

            {/* Navigation Footer */}
            <View style={s.footer}>
                {currentIndex === cards.length - 1 ? (
                    <TouchableOpacity
                        onPress={nextCard}
                        activeOpacity={0.8}
                        style={s.finishBtn}
                    >
                        <View style={[s.mainActionGradient, { backgroundColor: '#007AFF' }]}>
                            <Text style={s.mainActionLabel}>Finish Deck</Text>
                            <CheckCircle size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={[s.controlsRow, { justifyContent: 'center', gap: 24 }]}>
                        <TouchableOpacity
                            onPress={prevCard}
                            disabled={currentIndex === 0}
                            activeOpacity={0.7}
                            style={[s.navIconBtn, isDark ? s.bgWhite10 : s.bgWhite, currentIndex === 0 && { opacity: 0.3 }]}
                        >
                            <AltArrowLeft size={24} color={isDark ? 'white' : '#1e293b'} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={nextCard}
                            activeOpacity={0.8}
                            style={[s.navIconBtn, isDark ? s.bgWhite10 : s.bgWhite]}
                        >
                            <AltArrowRight size={24} color={isDark ? 'white' : '#1e293b'} />
                        </TouchableOpacity>
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
