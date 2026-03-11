import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useColorScheme } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MathText } from '@/components/ui/MathText';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Storage helpers
const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            return await SecureStore.getItemAsync(key);
        } catch (e) { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (e) { /* ignore */ }
    },
};

const { width } = Dimensions.get('window');

type Card = { id: number; front: string; back: string; order_column: number };

function FlashcardItem({ card, isActive, isDark }: { card: Card; isActive: boolean; isDark: boolean }) {
    const flipAnim = useSharedValue(0);
    const [flipped, setFlipped] = useState(false);

    // Reset flip state when card changes
    useEffect(() => {
        flipAnim.value = 0;
        setFlipped(false);
    }, [card.id]);

    const handleFlip = () => {
        flipAnim.value = withSpring(flipped ? 0 : 180, { damping: 20, stiffness: 100 });
        setFlipped(!flipped);
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [0, 180]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            zIndex: flipped ? 0 : 1,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnim.value, [0, 180], [180, 360]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: flipped ? 1 : 0,
        };
    });

    return (
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleFlip} style={{ flex: 0.8 }}>
                {/* FRONT */}
                <Animated.View style={[frontAnimatedStyle, {
                    flex: 1, borderRadius: 32, padding: 32,
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#2EBD85', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
                    borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0'
                }]} className="bg-white dark:bg-slate-800">
                    <View style={{ position: 'absolute', top: 24, right: 24 }}>
                        <Ionicons name="sparkles" size={24} color="#2EBD85" style={{ opacity: 0.3 }} />
                    </View>
                    <MathText
                        content={card.front}
                        color={isDark ? 'white' : '#121212'}
                        fontSize={24}
                        containerStyle={{ flex: 0.6 }}
                    />
                    <Text style={{ position: 'absolute', bottom: 24, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }} className="text-slate-400 dark:text-slate-500">
                        Tap to flip
                    </Text>
                </Animated.View>

                {/* BACK */}
                <Animated.View style={[backAnimatedStyle, {
                    flex: 1, backgroundColor: '#2EBD85', borderRadius: 32, padding: 32,
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#2EBD85', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
                }]}>
                    <View style={{ position: 'absolute', top: 24, right: 24 }}>
                        <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.4)" />
                    </View>
                    <MathText
                        content={card.back}
                        color="white"
                        fontSize={20}
                        containerStyle={{ flex: 0.6 }}
                    />
                    <Text style={{ position: 'absolute', bottom: 24, fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Tap to flip back
                    </Text>
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

    // Hydrate cache on mount
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
        <View className="flex-1 bg-white dark:bg-brand-dark justify-center items-center px-10">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-slate-900 dark:text-white font-black text-xl mt-6 text-center">Deck not found</Text>
            <Text className="text-slate-500 font-medium text-center mt-2 mb-8">
                We couldn't load this flashcard deck. It might have been deleted or there was a connection issue.
            </Text>
            <TouchableOpacity
                onPress={() => router.back()}
                className="bg-slate-900 dark:bg-white px-8 py-4 rounded-2xl"
            >
                <Text className="text-white dark:text-slate-900 font-black">Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading && !deck) {
        const bgColor = isDark ? '#121212' : '#f8fafc';
        const tintColor = isDark ? '#fff' : '#121212';
        return (
            <View className="flex-1 bg-white dark:bg-brand-dark px-6 pt-12">
                <Stack.Screen options={{ 
                    title: 'Loading Deck...', 
                    headerShown: true, 
                    headerStyle: { 
                        backgroundColor: bgColor,
                    }, 
                    headerTintColor: tintColor, 
                    headerBackVisible: false, 
                    headerShadowVisible: false 
                }} />

                <View className="items-center mt-8">
                    <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
                    <SkeletonLoader width="60%" height={32} style={{ marginBottom: 32 }} />

                    {/* Flashcard Skeleton */}
                    <View className="w-full aspect-[3/4] bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 p-8 justify-center items-center">
                        <SkeletonLoader width="80%" height={24} style={{ marginBottom: 12 }} />
                        <SkeletonLoader width="60%" height={24} />
                    </View>

                    {/* Controls Skeleton */}
                    <View className="flex-row mt-12 space-x-6">
                        <SkeletonLoader width={64} height={64} borderRadius={32} />
                        <SkeletonLoader width={64} height={64} borderRadius={32} />
                    </View>
                </View>
            </View>
        );
    }

    if (!deck || !deck.flashcards) return (
        <View className="flex-1 bg-white dark:bg-brand-dark justify-center items-center">
            <Text className="text-slate-500 font-bold">No cards found in this deck.</Text>
            <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-brand-primary font-black">Go Back</Text></TouchableOpacity>
        </View>
    );

    const cards: Card[] = deck.flashcards;
    const progress = ((currentIndex + 1) / cards.length) * 100;

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            const nextIndex = currentIndex + 1;
            scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
            setCurrentIndex(nextIndex);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true });
            setCurrentIndex(prevIndex);
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        if (index !== currentIndex && index >= 0 && index < cards.length) {
            setCurrentIndex(index);
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{ title: deck.title || 'Study Deck' }} />

            {/* Progress Bar */}
            <View className="px-6 pt-6 pb-2">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Progress</Text>
                    <Text className="text-brand-primary font-black text-sm">{currentIndex + 1} / {cards.length}</Text>
                </View>
                <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <Animated.View
                        className="h-full bg-brand-primary rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
            </View>

            {/* Pager */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {cards.map((card, index) => (
                    <View key={card.id.toString()} style={{ width }}>
                        <FlashcardItem card={card} isActive={currentIndex === index} isDark={isDark} />
                    </View>
                ))}
            </ScrollView>

            {/* Controls */}
            <View className="px-6 pb-12 pt-4 flex-row justify-between items-center gap-4">
                <TouchableOpacity
                    onPress={prevCard}
                    disabled={currentIndex === 0}
                    className={`size-14 rounded-full items-center justify-center border-2 border-slate-200 dark:border-slate-700 ${currentIndex === 0 ? 'opacity-30' : 'bg-white dark:bg-slate-800'}`}
                >
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={currentIndex === cards.length - 1 ? () => router.back() : nextCard}
                    className={`flex-1 rounded-full py-4 items-center justify-center ${currentIndex === cards.length - 1 ? 'bg-brand-primary' : 'bg-slate-900 border-2 border-slate-900'}`}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-black text-base">
                        {currentIndex === cards.length - 1 ? 'Finish Deck' : 'Next Card'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
