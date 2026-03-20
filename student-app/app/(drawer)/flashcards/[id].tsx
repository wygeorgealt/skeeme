import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useColorScheme, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { 
    Sparks, CheckCircle, WarningTriangle, 
    NavArrowLeft, NavArrowRight, Check
} from 'iconoir-react-native';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MathText } from '@/components/ui/MathText';
import * as SecureStore from 'expo-secure-store';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Card = { id: number; front: string; back: string; order_column: number };

function FlashcardItem({ card, isActive, isDark }: { card: Card; isActive: boolean; isDark: boolean }) {
    const flipAnim = useSharedValue(0);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        flipAnim.value = 0;
        setFlipped(false);
    }, [card.id, flipAnim]);

    const handleFlip = () => {
        flipAnim.value = withSpring(flipped ? 0 : 180, { damping: 20, stiffness: 80 });
        setFlipped(!flipped);
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [0, 180]);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            zIndex: flipped ? 0 : 1,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [180, 360]);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: flipped ? 1 : 0,
        };
    });

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <TouchableOpacity 
                activeOpacity={0.95} 
                onPress={handleFlip} 
                style={{ flex: 1 }}
            >
                {/* FRONT */}
                <Animated.View 
                    style={[frontAnimatedStyle, {
                        flex: 1,
                        borderRadius: 28,
                        padding: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isDark ? '#1a1b2e' : '#ffffff',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(139,92,246,0.15)' : '#e2e8f0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isDark ? 0.3 : 0.08,
                        shadowRadius: 12,
                        elevation: isDark ? 4 : 4,
                    }]}
                >
                    <View style={{ position: 'absolute', top: 28, right: 28, zIndex: 20 }}>
                        <Sparks width={20} height={20} color="#8B5CF6" style={{ opacity: 0.3 }} />
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', zIndex: 20 }}>
                        <MathText
                            content={card.front}
                            color={isDark ? 'white' : '#0f172a'}
                            fontSize={24}
                            containerStyle={{ width: '100%', alignItems: 'center' }}
                        />
                    </View>
                    <View style={{ position: 'absolute', bottom: 28, alignItems: 'center', zIndex: 20 }}>
                        <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Tap to reveal answer</Text>
                    </View>
                </Animated.View>

                {/* BACK */}
                <Animated.View 
                    style={[backAnimatedStyle, {
                        flex: 1,
                        borderRadius: 28,
                        padding: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#6366F1',
                    }]}
                >
                    <View style={{ position: 'absolute', top: 28, right: 28, zIndex: 20 }}>
                        <CheckCircle width={20} height={20} color="rgba(255,255,255,0.4)" />
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', zIndex: 20 }}>
                        <MathText
                            content={card.back}
                            color="white"
                            fontSize={20}
                            containerStyle={{ width: '100%', alignItems: 'center' }}
                        />
                    </View>
                    <View style={{ position: 'absolute', bottom: 28, alignItems: 'center', zIndex: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Tap to view question</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

export default function StudyDeckScreen() {
    const { id } = useLocalSearchParams();
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cachedDeck, setCachedDeck] = useState<any>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        const hydrate = async () => {
            const cacheKey = `cache_deck_detail_${id}`;
            const cached = await storage.getItem(cacheKey);
            if (cached) setCachedDeck(JSON.parse(cached));
        };
        hydrate();
    }, [id]);

    const { data: remoteDeck, isLoading, error } = useQuery({
        queryKey: ['deck', id],
        queryFn: async () => {
            const res = await api.get(`/flashcards/decks/${id}`);
            const data = res.data.data;
            await storage.setItem(`cache_deck_detail_${id}`, JSON.stringify(data));
            return data;
        }
    });

    const deck = remoteDeck || cachedDeck;

    if (error && !deck) return (
        <GlowBackground useSafeArea>
            <View className="flex-1 justify-center items-center px-10">
                <WarningTriangle width={64} height={64} color="#ef4444" />
                <Text className={`font-black text-lg mt-5 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Deck not found</Text>
                <Text className="text-slate-500 font-medium text-center mt-2 mb-6">
                    We couldn&apos;t load this flashcard deck. It might have been deleted or there was a connection issue.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 }}
                    >
                        <Text className="text-white font-black">Go Back</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </GlowBackground>
    );

    if (isLoading && !deck) {
        return (
            <GlowBackground useSafeArea>
                <View className="flex-1 px-5 pt-12">
                    <View className="items-center mt-6">
                        <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
                        <SkeletonLoader width="60%" height={32} style={{ marginBottom: 32 }} />
                        <View className={`w-full aspect-[3/4] rounded-[28px] border-2 p-6 justify-center items-center ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-200'}`}>
                            <SkeletonLoader width="80%" height={24} style={{ marginBottom: 12 }} />
                            <SkeletonLoader width="60%" height={24} />
                        </View>
                    </View>
                </View>
            </GlowBackground>
        );
    }

    if (!deck || !deck.flashcards) return (
        <GlowBackground useSafeArea>
            <View className="flex-1 justify-center items-center">
                <Text className="text-slate-500 font-bold">No cards found in this deck.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-[#8B5CF6] font-black">Go Back</Text></TouchableOpacity>
            </View>
        </GlowBackground>
    );

    const cards: Card[] = deck.flashcards;
    const progress = ((currentIndex + 1) / cards.length) * 100;

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            const nextIndex = currentIndex + 1;
            scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
            setCurrentIndex(nextIndex);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            scrollRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
            setCurrentIndex(prevIndex);
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / SCREEN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < cards.length) {
            setCurrentIndex(index);
        }
    };

    return (
        <GlowBackground useSafeArea>
            {/* Custom Header */}
            <View className="px-5 pt-2 pb-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className={`size-10 rounded-full items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/60'}`}>
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <Text className={`text-[16px] font-bold tracking-tight flex-1 text-center mx-4 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                    {deck.title || 'Study Deck'}
                </Text>
                <View className="size-10" />
            </View>

            {/* Progress Bar Area */}
            <View className="px-6 pt-2 pb-4">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Learning Session</Text>
                    <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/5' : 'bg-indigo-50'}`}>
                        <Text className={`font-bold text-[11px] ${isDark ? 'text-white' : 'text-indigo-600'}`}>{currentIndex + 1} of {cards.length}</Text>
                    </View>
                </View>
                <View className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: '100%', width: `${progress}%`, borderRadius: 999 }}
                    />
                </View>
            </View>

            {/* Pager */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {cards.map((card, index) => (
                    <View key={card.id.toString()} style={{ width: SCREEN_WIDTH, height: '100%' }}>
                        <FlashcardItem card={card} isActive={currentIndex === index} isDark={isDark} />
                    </View>
                ))}
            </ScrollView>

            {/* Controls */}
            <View className="px-6 pb-10 pt-4 flex-row items-center gap-4">
                <TouchableOpacity
                    onPress={prevCard}
                    disabled={currentIndex === 0}
                    activeOpacity={0.8}
                    className={`size-[56px] rounded-full items-center justify-center ${currentIndex === 0 ? 'opacity-20' : ''}`}
                    style={currentIndex > 0 ? { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' } : undefined}
                >
                    <NavArrowLeft width={22} height={22} color={isDark ? 'white' : '#0f172a'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={currentIndex === cards.length - 1 ? () => router.back() : nextCard}
                    activeOpacity={0.8}
                    style={{ flex: 1, height: 56, borderRadius: 28, overflow: 'hidden' }}
                >
                    <LinearGradient
                        colors={currentIndex === cards.length - 1 ? ['#22c55e', '#16a34a'] : ['#8B5CF6', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text className="text-white font-bold text-[16px]">
                            {currentIndex === cards.length - 1 ? 'Complete Session' : 'Next Card'}
                        </Text>
                        {currentIndex === cards.length - 1 ? (
                            <Check width={20} height={20} color="white" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                        ) : (
                            <NavArrowRight width={20} height={20} color="white" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </GlowBackground>
    );
}
