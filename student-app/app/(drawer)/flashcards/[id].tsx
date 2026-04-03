import { Text } from '@/components/ui/Text';
import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useColorScheme, StyleSheet, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { 
    Sparks, CheckCircle, WarningTriangle, 
    NavArrowLeft, NavArrowRight, Check, Restart
} from 'iconoir-react-native';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MathText } from '@/components/ui/MathText';
import { useAuthStore } from '@/store/authStore';
import * as SecureStore from 'expo-secure-store';
import Animated, { 
    interpolate, 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    withTiming, 
    Easing,
    LayoutAnimation,
    withRepeat
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator } from 'react-native';
import { Flashcard as Card, FlashcardDeck } from '@/types';

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


const FlashcardItem = memo(({ card, isActive, isDark }: { card: Card; isActive: boolean; isDark: boolean }) => {
    const flipAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(1);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        flipAnim.value = 0;
        setFlipped(false);
    }, [card.id, flipAnim]);

    const handleFlip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

    const CardSide = ({ type, text, footer, rotateY }: any) => (
        <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderRadius: 24, padding: 32, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
            <View style={{ position: 'absolute', top: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>{type}</Text>
                {type === 'QUESTION' ? <Sparks width={20} height={20} color="#007AFF" /> : <CheckCircle width={20} height={20} color="#34C759" />}
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MathText
                    content={text}
                    color={isDark ? '#FFF' : '#000'}
                    fontSize={type === 'QUESTION' ? 26 : 20}
                    containerStyle={{ width: '100%' }}
                />
            </View>

            <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#C7C7CC', textTransform: 'uppercase', letterSpacing: 1.5 }}>{footer}</Text>
            </View>
        </View>
    );

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
    const { id } = useLocalSearchParams();
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cachedDeck, setCachedDeck] = useState<any>(null);
    const [isComplete, setIsComplete] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const progressAnim = useSharedValue(0);
    const syncAnim = useSharedValue(0);
    const { updateUser } = useAuthStore();
    const [isSavingSession, setIsSavingSession] = useState(false);

    const { data: remoteDeck, isLoading, error } = useQuery({
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
    const cards = useMemo(() => deck?.flashcards || [], [deck?.flashcards]);

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

    // Reset state when deck ID changes
    useEffect(() => {
        setCurrentIndex(0);
        setIsComplete(false);
        progressAnim.value = 0;
    }, [id]);

    useEffect(() => {
        const hydrate = async () => {
            const cacheKey = `cache_deck_detail_${id}`;
            const cached = await storage.getItem(cacheKey);
            if (cached) setCachedDeck(JSON.parse(cached));
        };
        hydrate();
    }, [id]);

    useEffect(() => {
        if (deck?.flashcards) {
            progressAnim.value = withTiming((currentIndex + 1) / deck.flashcards.length, { duration: 300 });
        }
    }, [currentIndex, deck]);

    const nextCard = () => {
        if (!deck?.flashcards) return;
        if (currentIndex < deck.flashcards.length - 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const nextIndex = currentIndex + 1;
            scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
            // The scroll listener will update the index to ensure smooth transition
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsComplete(true);
        }
    };

    const prevCard = () => {
        if (!deck?.flashcards) return;
        if (currentIndex > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const prevIndex = currentIndex - 1;
            scrollRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
            // The scroll listener will update the index
        }
    };

    const saveFlashcardSession = useCallback(async () => {
        if (!deck || isSavingSession) return;
        
        setIsSavingSession(true);
        try {
            // Record the completion in history/sessions
            await api.post('flashcards/history', {
                deck_id: id,
                cards_count: deck.flashcards.length,
                completed_at: new Date().toISOString(),
            });

            // Refresh user stats for the dashboard
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsComplete(false);
        setCurrentIndex(0);
        scrollRef.current?.scrollTo({ x: 0, animated: false });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!deck?.flashcards) return;
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / SCREEN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < deck.flashcards.length) {
            setCurrentIndex(index);
        }
    };

    if (error && !deck) return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={s.errorCenter}>
                <WarningTriangle width={64} height={64} color="#ef4444" />
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

    if (!deck || !deck.flashcards) return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={s.errorCenter}>
                <Text style={s.noCardsText}>No cards found in this deck.</Text>
                <TouchableOpacity onPress={() => router.back()} style={s.mt4}>
                    <Text style={s.goBackTextPrimary}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isComplete) return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={s.successCenter}>
                <View style={s.successIconBox}>
                    <View style={[s.successIconGradient, { backgroundColor: '#007AFF' }]}>
                        <Check width={48} height={48} color="white" strokeWidth={3} />
                    </View>
                </View>
                <Text style={[s.successTitle, isDark ? s.textWhite : s.textSlate900]}>Session Complete!</Text>
                <Text style={s.successSubtitle}>You've mastered all {deck.flashcards.length} cards in this set. Great job!</Text>
                
                <View style={s.successActions}>
                    <TouchableOpacity onPress={restartSession} activeOpacity={0.8} style={s.flex1}>
                        <View style={[s.outlineBtn, isDark ? s.outlineBtnDark : s.outlineBtnLight]}>
                            <Restart width={20} height={20} color={isDark ? 'white' : '#0f172a'} />
                            <Text style={[s.outlineBtnText, isDark ? s.textWhite : s.textSlate900]}>Retake</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.flex1}>
                        <View style={[s.blueBtnGradient, { backgroundColor: '#007AFF' }]}>
                            <Text style={s.btnTextLarge}>Finish</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const progressWidth = cards.length > 0 ? `${((currentIndex + 1) / cards.length) * 100}%` : '0%';

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            {/* Header */}
            <View style={[s.headerRow, { paddingBottom: 16 }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.backBtn, isDark ? s.bgWhite10 : s.bgWhite60]}>
                    <NavArrowLeft width={24} height={24} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <View style={s.headerTextContainer}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {currentIndex + 1} of {cards.length}
                    </Text>
                    <View style={s.flexRowGap2}>
                        <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900, { maxWidth: SCREEN_WIDTH * 0.5, marginTop: 4 }]} numberOfLines={1}>
                            {deck?.title || 'Study Deck'}
                        </Text>
                        {isLoading && (
                             <Animated.View style={syncAnimatedStyle}>
                                <Sparks width={14} height={14} color="#007AFF" />
                            </Animated.View>
                        )}
                    </View>
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
                 {cards.map((card: Card, index: number) => (
                    <View key={card.id.toString()} style={{ width: SCREEN_WIDTH, height: '100%', paddingHorizontal: 24 }}>
                        <FlashcardItem card={card} isActive={currentIndex === index} isDark={isDark} />
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Progress Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 24 }}>
                {cards.map((_: any, idx: number) => (
                    <View key={idx} style={{ 
                        width: currentIndex === idx ? 8 : 6, 
                        height: currentIndex === idx ? 8 : 6, 
                        borderRadius: 4, 
                        backgroundColor: currentIndex === idx ? '#007AFF' : (isDark ? '#3A3A3C' : '#D1D1D6') 
                    }} />
                ))}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    headerRow: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
    pagerContent: { paddingVertical: 20 },
    
    cardContainer: { height: SCREEN_HEIGHT * 0.55, marginVertical: 10 },
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

    footer: { paddingHorizontal: 16, paddingBottom: 50, paddingTop: 20 },
    controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    navIconBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
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
    loadingPlaceholder: { width: '100%', aspectRatio: 3/4, borderRadius: 16, padding: 32, justifyContent: 'center' },
    bgGrayDark: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    bgWhite: { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
    flexRowGap2: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    
    textWhite: { color: 'white' },
    textWhite40: { color: 'rgba(255,255,255,0.4)' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
});
