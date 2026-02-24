import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Card = { id: number; front: string; back: string; order_column: number };

function FlashcardItem({ card, isActive }: { card: Card; isActive: boolean }) {
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
                    flex: 1, backgroundColor: 'white', borderRadius: 32, padding: 32,
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#6366f1', shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
                    borderWidth: 1, borderColor: '#e0e7ff'
                }]} className="dark:bg-slate-800 dark:border-slate-700">
                    <View style={{ position: 'absolute', top: 24, right: 24 }}>
                        <Ionicons name="sparkles" size={24} color="#c7d2fe" />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center', lineHeight: 34 }} className="text-slate-900 dark:text-white">
                        {card.front}
                    </Text>
                    <Text style={{ position: 'absolute', bottom: 24, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }} className="text-slate-400 dark:text-slate-500">
                        Tap to flip
                    </Text>
                </Animated.View>

                {/* BACK */}
                <Animated.View style={[backAnimatedStyle, {
                    flex: 1, backgroundColor: '#4f46e5', borderRadius: 32, padding: 32,
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
                }]}>
                    <View style={{ position: 'absolute', top: 24, right: 24 }}>
                        <Ionicons name="checkmark-circle" size={24} color="#818cf8" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '600', color: 'white', textAlign: 'center', lineHeight: 30 }}>
                        {card.back}
                    </Text>
                    <Text style={{ position: 'absolute', bottom: 24, fontSize: 13, fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1 }}>
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

    const { data: deck, isLoading } = useQuery({
        queryKey: ['deck', id],
        queryFn: async () => {
            const res = await api.get(`/flashcards/decks/${id}`);
            return res.data.data;
        }
    });

    if (isLoading) return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark justify-center items-center">
            <Stack.Screen options={{ title: 'Loading...', headerStyle: { backgroundColor: '#010100' }, headerTintColor: '#fff' }} />
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );

    if (!deck || !deck.flashcards) return null;

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
            <Stack.Screen options={{
                title: deck.title,
                headerShown: true,
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: '#010100' },
                headerTintColor: '#fff'
            }} />

            {/* Progress Bar */}
            <View className="px-6 pt-6 pb-2">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Progress</Text>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{currentIndex + 1} / {cards.length}</Text>
                </View>
                <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <Animated.View
                        className="h-full bg-indigo-500 rounded-full"
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
                        <FlashcardItem card={card} isActive={currentIndex === index} />
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
                    onPress={nextCard}
                    disabled={currentIndex === cards.length - 1}
                    className={`flex-1 rounded-full py-4 items-center justify-center ${currentIndex === cards.length - 1 ? 'bg-emerald-500' : 'bg-slate-900 border-2 border-slate-900'}`}
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
