import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useColorScheme, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
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

const { width } = Dimensions.get('window');

type Card = { id: number; front: string; back: string; order_column: number };

function FlashcardItem({ card, isActive, isDark }: { card: Card; isActive: boolean; isDark: boolean }) {
    const flipAnim = useSharedValue(0);
    const [flipped, setFlipped] = useState(false);

    // Reset flip state when card changes
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
        <View className="flex-1 p-6 justify-center">
            <TouchableOpacity 
                activeOpacity={0.95} 
                onPress={handleFlip} 
                className="flex-[0.85]"
            >
                {/* FRONT */}
                <Animated.View 
                    style={[frontAnimatedStyle]} 
                    className={`flex-1 rounded-[40px] p-10 justify-center items-center border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200'}`}
                >
                    <View className="absolute top-10 right-10">
                        <Ionicons name="sparkles" size={24} color="#D2B48C" style={{ opacity: 0.2 }} />
                    </View>
                    <MathText
                        content={card.front}
                        color={isDark ? 'white' : '#0f172a'}
                        fontSize={26}
                        containerStyle={{ width: '100%', alignItems: 'center' }}
                    />
                    <View className="absolute bottom-10 items-center">
                        <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Tap to reveal answer</Text>
                    </View>
                </Animated.View>

                {/* BACK */}
                <Animated.View 
                    style={[backAnimatedStyle]} 
                    className="flex-1 bg-brand-primary rounded-[40px] p-10 justify-center items-center"
                >
                    <View className="absolute top-10 right-10">
                        <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.3)" />
                    </View>
                    <MathText
                        content={card.back}
                        color="white"
                        fontSize={22}
                        containerStyle={{ width: '100%', alignItems: 'center' }}
                    />
                    <View className="absolute bottom-10 items-center">
                        <Text className="text-white/60 font-bold text-[11px] uppercase tracking-[0.2em]">Tap to view question</Text>
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
                We couldn&apos;t load this flashcard deck. It might have been deleted or there was a connection issue.
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
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <Stack.Screen options={{ 
                title: deck.title || 'Study Deck',
                headerShown: true,
                headerStyle: { backgroundColor: isDark ? '#0f0f11' : '#fafafa' },
                headerTintColor: isDark ? 'white' : '#0f172a',
                headerShadowVisible: false
            }} />

            {/* Progress Bar Area */}
            <View className="px-8 pt-8 pb-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Learning Session</Text>
                    <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Text className={`font-bold text-[12px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentIndex + 1} of {cards.length}</Text>
                    </View>
                </View>
                <View className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
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
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {cards.map((card, index) => (
                    <View key={card.id.toString()} style={{ width }}>
                        <FlashcardItem card={card} isActive={currentIndex === index} isDark={isDark} />
                    </View>
                ))}
            </ScrollView>

            {/* Controls */}
            <View className={`px-8 pb-12 pt-6 flex-row items-center gap-4`}>
                <TouchableOpacity
                    onPress={prevCard}
                    disabled={currentIndex === 0}
                    activeOpacity={0.8}
                    className={`h-[60px] w-[60px] rounded-full items-center justify-center border-2 ${currentIndex === 0 ? 'opacity-20 border-slate-200 dark:border-slate-800' : (isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm')}`}
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : '#0f172a'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={currentIndex === cards.length - 1 ? () => router.back() : nextCard}
                    activeOpacity={0.8}
                    className={`flex-1 h-[60px] rounded-2xl items-center justify-center flex-row ${currentIndex === cards.length - 1 ? 'bg-brand-primary' : (isDark ? 'bg-white' : 'bg-slate-900 shadow-sm')}`}
                >
                    <Text className={`font-bold text-[16px] ${currentIndex === cards.length - 1 ? 'text-white' : (isDark ? 'text-slate-900' : 'text-white')}`}>
                        {currentIndex === cards.length - 1 ? 'Complete Session' : 'Next Card'}
                    </Text>
                    <Ionicons 
                        name={currentIndex === cards.length - 1 ? "checkmark-done" : "arrow-forward"} 
                        size={20} 
                        color={currentIndex === cards.length - 1 ? 'white' : (isDark ? '#0f172a' : 'white')} 
                        style={{ marginLeft: 8 }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
