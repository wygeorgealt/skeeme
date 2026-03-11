import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Storage helpers
const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            return await FileSystem.readAsStringAsync(path);
        } catch (e) { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                const path = `${FileSystem.documentDirectory}${key}.json`;
                await FileSystem.writeAsStringAsync(path, value);
            }
        } catch (e) { /* ignore */ }
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

function SkeletonDeck() {
    return (
        <View className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4">
            <View className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
            <View className="flex-row gap-3">
                <View className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <View className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </View>
        </View>
    );
}

export default function FlashcardsDashboard() {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [cachedDecks, setCachedDecks] = useState<FlashcardDeck[] | null>(null);

    // Hydrate cache on mount
    useEffect(() => {
        const hydrate = async () => {
            const cached = await storage.getItem('cache_flashcard_decks');
            if (cached) setCachedDecks(JSON.parse(cached));
        };
        hydrate();
    }, []);

    const { data: remoteDecks, isLoading, refetch } = useQuery({
        queryKey: ['flashcard-decks'],
        queryFn: async () => {
            const res = await api.get('flashcards/decks');
            const data = res.data.data as FlashcardDeck[];
            await storage.setItem('cache_flashcard_decks', JSON.stringify(data));
            return data;
        }
    });

    const decks = remoteDecks || cachedDecks;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`flashcards/decks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
        },
        onError: (error: any) => {
            Alert.alert('Delete Failed', error.response?.data?.message || 'Could not delete deck. Please try again.');
        }
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDelete = (id: number, title: string) => {
        Alert.alert(
            "Delete Deck",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-8 pb-4">
                <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white">Flashcards</Text>
                <Text className="text-slate-500 font-bold text-[15px] mt-1">Master topics with spaced repetition</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "#121212"} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Create New Button */}
                <View className="mb-8">
                    <GradientButton
                        onPress={() => router.push('/(drawer)/flashcards/create')}
                        icon={<Ionicons name="add" size={24} color={isDark ? '#121212' : 'white'} />}
                    >
                        Generate New Deck
                    </GradientButton>
                </View>

                <View className="flex-row justify-between items-end mb-6">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400">Your Decks</Text>
                    {decks && decks.length > 0 && <Text className="text-slate-400 font-black text-[11px] tracking-widest uppercase">{decks.length} Decks</Text>}
                </View>

                {isLoading ? (
                    <><SkeletonDeck /><SkeletonDeck /><SkeletonDeck /></>
                ) : decks?.length === 0 ? (
                    <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50">
                        <View className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 items-center justify-center mb-6">
                            <Ionicons name="layers" size={40} color={isDark ? 'white' : '#121212'} />
                        </View>
                        <Text className="text-slate-900 dark:text-white font-black text-[22px] tracking-tight mb-2">No Decks Yet</Text>
                        <Text className="text-slate-500 font-bold text-[14px] text-center px-8 leading-relaxed">
                            Generate your first set of flashcards to start studying smarter.
                        </Text>
                    </View>
                ) : (
                    decks?.map(deck => (
                        <TouchableOpacity
                            key={deck.id}
                            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                            className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row justify-between items-start mb-6">
                                <Text className="text-slate-900 dark:text-white font-black text-[19px] tracking-tight flex-1 mr-4" numberOfLines={2}>
                                    {deck.title}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDelete(deck.id, deck.title)}
                                    className="p-2 -mr-2 -mt-2 opacity-50 justify-center items-center rounded-xl"
                                >
                                    <Ionicons name="trash" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <View className="flex-row items-center border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-dark px-3 py-1.5 rounded-xl mr-2 mb-2 w-auto">
                                    <Ionicons name="copy" size={12} color={isDark ? "white" : "#121212"} />
                                    <Text className="text-slate-900 dark:text-white font-bold text-[11px] ml-1.5 uppercase tracking-widest">{deck.flashcards_count} Cards</Text>
                                </View>
                                <View className="flex-row items-center mt-[-6px]">
                                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                    <Text className="text-slate-400 font-bold text-[11px] ml-1 uppercase tracking-widest">
                                        {new Date(deck.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
