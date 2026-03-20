import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, useColorScheme, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { 
    Menu, Sparks, Bin, Group, Calendar, 
    Page, NavArrowRight, Plus 
} from 'iconoir-react-native';
import { router, useNavigation } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <View className={`p-6 rounded-[28px] mb-4 ${isDark ? 'bg-[#13151B]' : 'bg-white/80 border border-white/50 shadow-sm'}`}>
            <View className={`h-5 w-3/4 rounded-lg mb-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
            <View className="flex-row gap-3">
                <View className={`h-7 w-20 rounded-full ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                <View className={`h-7 w-24 rounded-full ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
            </View>
        </View>
    );
}

export default function FlashcardsDashboard() {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();
    const [cachedDecks, setCachedDecks] = useState<FlashcardDeck[] | null>(null);

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
        <GlowBackground>
            {/* Header */}
            <View style={{ paddingTop: Math.max(insets.top, 8) }} className="px-5 pb-4 flex-row items-center justify-between">
                <View>
                    <Text className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Flashcards</Text>
                    <Text className={`font-medium text-[13px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Master topics with spaced repetition</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-full items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/60'}`}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-2"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Create New Button */}
                <View className="mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/(drawer)/flashcards/create')}
                        activeOpacity={0.8}
                        style={{ height: 56, borderRadius: 20, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Sparks width={20} height={20} color="white" strokeWidth={2} />
                            <Text className="text-white font-bold ml-2.5 text-[16px]">Generate New Deck</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-end mb-5 px-1">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Your Study Sets</Text>
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
                    <View className={`items-center py-16 border-2 border-dashed rounded-[32px] ${isDark ? 'bg-[#13151B]/50 border-transparent' : 'bg-white/60 border-slate-200'}`}>
                        <View className={`w-24 h-24 rounded-[32px] items-center justify-center mb-6 ${isDark ? 'bg-[#13151B]' : 'bg-indigo-50'}`}>
                            <Page width={40} height={40} color="#8B5CF6" strokeWidth={1.5} />
                        </View>
                        <Text className={`font-bold text-[22px] tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Decks Yet</Text>
                        <Text className={`font-medium text-[14px] text-center px-10 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Turn your notes or topics into interactive study sets.
                        </Text>
                    </View>
                ) : (
                    decks.map(deck => (
                        <TouchableOpacity
                            key={deck.id}
                            onPress={() => router.push(`/(drawer)/flashcards/${deck.id}` as any)}
                            activeOpacity={0.8}
                            className={`p-6 rounded-[28px] mb-4 ${isDark ? 'bg-[#13151B]' : 'bg-white/80 border border-white/50 shadow-sm'}`}
                        >
                            <View className="flex-row justify-between items-start mb-5">
                                <Text className={`font-bold text-[17px] tracking-tight flex-1 mr-4 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                                    {deck.title}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDelete(deck.id, deck.title)}
                                    className={`size-9 rounded-full items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}
                                >
                                    <Bin width={16} height={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center border-t border-slate-50 dark:border-slate-800/50 pt-4">
                                <View className={`flex-row items-center px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-indigo-50'}`}>
                                    <Group width={13} height={13} color="#8B5CF6" strokeWidth={2} />
                                    <Text className={`font-bold text-[11px] ml-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-indigo-600'}`}>
                                        {deck.flashcards_count} Cards
                                    </Text>
                                </View>
                                <View className="flex-row items-center ml-auto">
                                    <Calendar width={13} height={13} color="#94a3b8" />
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
        </GlowBackground>
    );
}
