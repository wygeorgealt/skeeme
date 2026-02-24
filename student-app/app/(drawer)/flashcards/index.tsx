import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';

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
        <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm shadow-slate-200 dark:shadow-none">
            <View className="h-5 w-3/4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-3" />
            <View className="flex-row items-center gap-3">
                <View className="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <View className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </View>
        </View>
    );
}

export default function FlashcardsDashboard() {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: decks, isLoading, refetch } = useQuery({
        queryKey: ['flashcard-decks'],
        queryFn: async () => {
            const res = await api.get('/flashcards/decks');
            return res.data.data as FlashcardDeck[];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/flashcards/decks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
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
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            {/* Header */}
            <View className="px-6 py-6 pb-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-3xl font-black text-slate-900 dark:text-white">Flashcards</Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Master topics with spaced repetition</Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
                {/* Create New Button */}
                <GradientButton
                    onPress={() => router.push('/(drawer)/flashcards/create')}
                    containerStyle="mb-8"
                    className="p-3"
                    icon={<View className="size-12 bg-white/20 rounded-2xl items-center justify-center mr-2">
                        <Ionicons name="add" size={28} color="white" />
                    </View>}
                >
                    Generate Deck
                </GradientButton>

                <View className="flex-row justify-between items-end mb-4">
                    <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your Decks</Text>
                    {decks && decks.length > 0 && <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs">{decks.length} DECKS</Text>}
                </View>

                {isLoading ? (
                    <><SkeletonDeck /><SkeletonDeck /><SkeletonDeck /></>
                ) : decks?.length === 0 ? (
                    <View className="items-center py-10">
                        <View className="size-20 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                            <Ionicons name="layers" size={32} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-2">No Decks Yet</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center px-4">
                            Generate your first set of flashcards to start studying smarter.
                        </Text>
                    </View>
                ) : (
                    decks?.map(deck => (
                        <TouchableOpacity
                            key={deck.id}
                            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm shadow-slate-200 dark:shadow-none"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <Text className="text-slate-900 dark:text-white font-bold text-lg flex-1" numberOfLines={2}>
                                    {deck.title}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDelete(deck.id, deck.title)}
                                    className="p-2 ml-2 -mr-2 -mt-2 opacity-50 hover:opacity-100"
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <View className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mr-3">
                                    <Ionicons name="copy" size={12} color="#4f46e5" />
                                    <Text className="text-indigo-700 dark:text-indigo-300 font-bold text-xs ml-1.5">{deck.flashcards_count} Cards</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                    <Text className="text-slate-400 dark:text-slate-500 font-medium text-xs ml-1">
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
