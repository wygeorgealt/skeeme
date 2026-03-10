import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { GradientButton } from '@/components/ui/GradientButton';
import { RewardModal } from '@/components/RewardModal';

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
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [cardCount, setCardCount] = useState('10');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [isLoading, setIsLoading] = useState(false);

    // Reward Modal State
    const [rewardData, setRewardData] = useState<any>(null);
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
    const [pendingDeckId, setPendingDeckId] = useState<number | null>(null);

    const handleFileSelect = async () => {
        try {
            const r = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'text/markdown', 'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: false,
            });
            if (!r.canceled && r.assets?.length) {
                const asset = r.assets[0];
                setIsProcessingFile(true);
                // Simulate quick extraction check/UI feedback
                setTimeout(() => {
                    setSelectedFile(asset);
                    setMode('file');
                    setTopic('');
                    setIsProcessingFile(false);
                }, 800);
            }
        } catch {
            setIsProcessingFile(false);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');

        const count = parseInt(cardCount);
        if (isNaN(count) || count < 5 || count > 50) return Alert.alert('Invalid Count', 'Please request 5 to 50 cards.');

        setIsLoading(true);
        setLoadingStage(mode === 'file' ? 'Analyzing Document...' : 'Analyzing Topic...');

        // Stage cycling logic
        const stages = mode === 'file'
            ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
            : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];

        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 2500);

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
                response = await api.post('flashcards/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await api.post('flashcards/generate', {
                    topic,
                    card_count: count,
                    difficulty
                });
            }

            if (response.data.remaining_credits !== undefined) {
                updateUser({ credits: response.data.remaining_credits });
            }

            // Invalidate decks list then go into the new deck
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });

            if (response.data.reward?.earned) {
                setRewardData(response.data.reward);
                setPendingDeckId(response.data.deck_id);
                setIsRewardModalVisible(true);
            } else {
                router.replace(`/(drawer)/flashcards/${response.data.deck_id}`);
            }

        } catch (e: any) {
            let msg = 'Failed to generate flashcards. Please try again.';
            const data = e.response?.data;
            if (data?.message) msg = data.message;
            if (e.response?.status === 403) Alert.alert('Insufficient Credits', msg);
            else Alert.alert('Failed', msg);
        } finally {
            clearInterval(stageInterval);
            setIsLoading(false);
            setLoadingStage('');
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                {/* Source card */}
                <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="size-10 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="sparkles" size={20} color="#2EBD85" />
                            </View>
                            <Text className="text-base font-black text-slate-800 dark:text-white">Material</Text>
                        </View>
                        <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 }}>
                            {(['topic', 'file'] as QuizMode[]).map(m => (
                                <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                    style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }, mode === m ? { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {}]} activeOpacity={0.8}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'capitalize', color: mode === m ? '#2EBD85' : '#94a3b8' }}>{m}</Text>
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
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                style={{
                                    borderWidth: 2,
                                    borderStyle: 'dashed',
                                    borderColor: isProcessingFile ? '#2EBD85' : '#cbd5e1',
                                    borderRadius: 16,
                                    padding: 24,
                                    alignItems: 'center',
                                    backgroundColor: isProcessingFile ? '#F0FDF4' : '#f8fafc'
                                }}
                                activeOpacity={0.7}
                            >
                                {isProcessingFile ? (
                                    <>
                                        <ActivityIndicator size="large" color="#2EBD85" />
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#2EBD85', marginTop: 12 }}>Analyzing...</Text>
                                    </>
                                ) : selectedFile ? (
                                    <>
                                        <Ionicons name="document-text" size={28} color="#2EBD85" />
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 12, textAlign: 'center' }}>{selectedFile.name}</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#2EBD85', marginTop: 4, textTransform: 'uppercase' }}>Attached & Ready</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={28} color="#94a3b8" />
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b', marginTop: 12 }}>Tap to browse files</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>.pdf · .docx · .txt · .md</Text>
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
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                            <TouchableOpacity key={d} onPress={() => setDifficulty(d)} activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    borderWidth: 2,
                                    borderRadius: 16,
                                    paddingVertical: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderColor: difficulty === d ? DIFF_COLORS[d] : '#e2e8f0',
                                    backgroundColor: difficulty === d ? DIFF_COLORS[d] + '11' : '#f8fafc'
                                }}>
                                <Text style={{
                                    fontWeight: '900',
                                    fontSize: 12,
                                    textTransform: 'capitalize',
                                    color: difficulty === d ? DIFF_COLORS[d] : '#94a3b8'
                                }}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Generate button */}
                {isLoading ? (
                    <View className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-[32px] p-8 border-2 border-brand-primary/20 items-center overflow-hidden">
                        <View className="mb-6">
                            <ActivityIndicator size="large" color="#2EBD85" />
                        </View>
                        <Text className="text-brand-primary font-black text-xl tracking-tight mb-2 text-center">{loadingStage}</Text>
                        <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm text-center px-4">
                            Our AI is processing your request. This usually takes 15-30 seconds depending on complexity.
                        </Text>

                        {/* Multi-stage Progress Indicators */}
                        <View className="flex-row gap-2 mt-8 w-full px-4">
                            {['Reading', 'Identifying', 'Creating', 'Reviewing'].map((s, i) => {
                                const stages = mode === 'file'
                                    ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
                                    : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];

                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = i < currentIdx;
                                const isActive = i === currentIdx;

                                return (
                                    <View key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                        {(isComplete || isActive) && (
                                            <View
                                                className={`h-full ${isComplete ? 'bg-brand-primary' : 'bg-brand-primary/40'}`}
                                                style={{ width: isComplete ? '100%' : '60%' }}
                                            />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleGenerate}
                        className="bg-[#2EBD85] rounded-2xl py-5 items-center flex-row justify-center shadow-lg shadow-[#2EBD85]/20"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="sparkles" size={20} color="#fff" />
                        <Text className="text-white font-black ml-2 text-[17px]">Generate Flashcards</Text>
                    </TouchableOpacity>
                )}
                <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-3 font-medium">Credits scale with content length & card count.</Text>
            </ScrollView>

            <RewardModal
                isVisible={isRewardModalVisible}
                onClose={() => {
                    setIsRewardModalVisible(false);
                    if (pendingDeckId) {
                        router.replace(`/(drawer)/flashcards/${pendingDeckId}`);
                    } else {
                        router.back();
                    }
                }}
                reward={rewardData}
            />
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
