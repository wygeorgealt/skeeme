import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, useColorScheme, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import * as FileSystem from 'expo-file-system/legacy';

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
        <View className={`p-6 rounded-[32px] border mb-6 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <View className={`h-6 w-3/4 rounded-lg mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
            <View className="flex-row gap-3">
                <View className={`h-8 w-24 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                <View className={`h-8 w-32 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
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
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            {/* Header */}
            <View className="px-6 py-8 pb-4">
                <Text className={`text-[32px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Flashcards</Text>
                <Text className="text-slate-500 font-medium text-[15px] mt-1">Master topics with spaced repetition</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2B48C" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Create New Button */}
                <View className="mb-10">
                    <TouchableOpacity
                        onPress={() => router.push('/(drawer)/flashcards/create')}
                        activeOpacity={0.8}
                        className="h-[58px] bg-brand-primary rounded-2xl items-center justify-center flex-row shadow-sm"
                    >
                        <Ionicons name="sparkles" size={20} color="white" />
                        <Text className="text-white font-bold ml-2 text-[16px]">Generate New Deck</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-end mb-6 px-1">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400">Your Study Sets</Text>
                    {decks && decks.length > 0 && (
                        <Text className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">{decks.length} Sets</Text>
                    )}
                </View>

                {isLoading ? (
                    <View>
                        <SkeletonDeck isDark={isDark} />
                        <SkeletonDeck isDark={isDark} />
                        <SkeletonDeck isDark={isDark} />
                    </View>
                ) : !decks || decks.length === 0 ? (
                    <View className={`items-center py-16 border-2 border-dashed rounded-[40px] ${isDark ? 'bg-[#161618]/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <View className={`w-24 h-24 rounded-[32px] border items-center justify-center mb-8 ${isDark ? 'bg-[#1c1c1e] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <Ionicons name="library-outline" size={40} color="#D2B48C" />
                        </View>
                        <Text className={`font-bold text-[22px] tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Decks Yet</Text>
                        <Text className="text-slate-500 font-medium text-[15px] text-center px-10 leading-relaxed">
                            Turn your notes or topics into interactive study sets.
                        </Text>
                    </View>
                ) : (
                    decks.map(deck => (
                        <TouchableOpacity
                            key={deck.id}
                            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                            activeOpacity={0.8}
                            className={`p-6 rounded-[32px] border mb-6 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                        >
                            <View className="flex-row justify-between items-start mb-6">
                                <Text className={`font-bold text-[19px] tracking-tight flex-1 mr-4 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                                    {deck.title}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDelete(deck.id, deck.title)}
                                    className={`p-2 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center border-t border-slate-50 dark:border-slate-800/50 pt-5">
                                <View className={`flex-row items-center px-3 py-1.5 rounded-xl border mr-4 ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                    <Ionicons name="layers-outline" size={14} color="#D2B48C" />
                                    <Text className={`font-bold text-[11px] ml-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {deck.flashcards_count} Cards
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                    <Text className="text-slate-400 font-bold text-[11px] ml-1.5 uppercase tracking-widest">
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
