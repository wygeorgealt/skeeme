import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { GradientButton } from '@/components/ui/GradientButton';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_COLORS: Record<string, string> = {
    easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
};

export default function GenerateFlashcardScreen() {
    const { updateUser } = useAuthStore();
    const queryClient = useQueryClient();

    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [cardCount, setCardCount] = useState('10');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = async () => {
        try {
            const r = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'text/markdown', 'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: false,
            });
            if (!r.canceled && r.assets?.length) {
                setSelectedFile(r.assets[0]);
                setMode('file');
                setTopic('');
            }
        } catch {
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');

        const count = parseInt(cardCount);
        if (isNaN(count) || count < 5 || count > 50) return Alert.alert('Invalid Count', 'Please request 5 to 50 cards.');

        setIsLoading(true);
        try {
            let response;
            if (mode === 'file' && selectedFile) {
                const fd = new FormData();
                fd.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || 'application/octet-stream'
                } as any);
                fd.append('card_count', cardCount);
                fd.append('difficulty', difficulty);
                response = await api.post('/flashcards/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await api.post('/flashcards/generate', {
                    topic,
                    card_count: count,
                    difficulty
                });
            }

            if (response.data.remaining_credits !== undefined) {
                updateUser({ credits: response.data.remaining_credits });
            }

            // Invalidate decks list then go back
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
            router.back();

        } catch (e: any) {
            if (e.response?.status === 403) Alert.alert('Insufficient Credits', e.response.data.message);
            else Alert.alert('Failed', e.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{
                title: 'New Deck',
                headerShown: true,
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: '#010100' },
                headerTintColor: '#fff'
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                {/* Source card */}
                <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="size-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="sparkles" size={20} color="#4f46e5" />
                            </View>
                            <Text className="text-base font-black text-slate-800 dark:text-white">Material</Text>
                        </View>
                        <View className="flex-row bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
                            {(['topic', 'file'] as QuizMode[]).map(m => (
                                <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                    className={`px-4 py-2 rounded-lg ${mode === m ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`} activeOpacity={0.8}>
                                    <Text className={`font-bold text-xs capitalize ${mode === m ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {mode === 'topic' ? (
                        <>
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">What do you want to memorize?</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-medium mb-2"
                                placeholder="e.g. Spanish conjugation, AWS Services..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </>
                    ) : (
                        <>
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Upload study material</Text>
                            <TouchableOpacity onPress={handleFileSelect} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 items-center bg-slate-50 dark:bg-brand-dark/50" activeOpacity={0.7}>
                                {selectedFile ? (
                                    <>
                                        <Ionicons name="document-text" size={28} color="#4f46e5" />
                                        <Text className="text-sm font-bold text-slate-900 dark:text-white mt-3 text-center">{selectedFile.name}</Text>
                                        <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">Tap to change</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={28} color="#94a3b8" />
                                        <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-3">Tap to browse files</Text>
                                        <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">.pdf · .docx · .txt · .md</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings card */}
                <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <Text className="text-base font-black text-slate-800 dark:text-white mb-4">Settings</Text>

                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Number of Cards (5–50)</Text>
                    <TextInput
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-medium mb-4"
                        keyboardType="number-pad"
                        value={cardCount}
                        onChangeText={setCardCount}
                    />

                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Difficulty Depth</Text>
                    <View className="flex-row gap-2 mt-1">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                            <TouchableOpacity key={d} onPress={() => setDifficulty(d)} activeOpacity={0.7}
                                className={`flex-1 border-2 rounded-2xl py-3 items-center justify-center ${difficulty === d ? '' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-dark/50'}`}
                                style={difficulty === d ? { borderColor: DIFF_COLORS[d], backgroundColor: DIFF_COLORS[d] + '11' } : {}}>
                                <Text className={`font-black text-xs capitalize ${difficulty === d ? '' : 'text-slate-400 dark:text-slate-500'}`}
                                    style={difficulty === d ? { color: DIFF_COLORS[d] } : {}}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Generate button */}
                <GradientButton
                    onPress={handleGenerate}
                    loading={isLoading}
                    containerStyle="mt-2"
                    icon={<Ionicons name="flash" size={18} color="white" />}
                >
                    {isLoading ? 'Creating Deck...' : 'Generate Flashcards'}
                </GradientButton>
                <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-3 font-medium">Credits scale with content length & card count.</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    settingsCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputField: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1e293b', marginBottom: 16, fontWeight: '500' },
    fileDropzone: { borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', backgroundColor: '#f8fafc' },
    fileNameText: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 10, textAlign: 'center' },
    fileChangeText: { fontSize: 12, fontWeight: '700', color: '#4f46e5', marginTop: 4 },
    fileHintText: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 10 },
    fileTypeText: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
    optionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    filterBtn: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    filterBtnText: { fontWeight: '800', fontSize: 13, textTransform: 'capitalize' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    iconBubble: {
        width: 40, height: 40, backgroundColor: '#eef2ff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    toggleRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
    toggleItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    toggleItemActive: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    toggleText: { fontWeight: '700', fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' },
    toggleTextActive: { color: '#4f46e5' },
});
