import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';

import { RewardModal } from '@/components/RewardModal';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_COLORS: Record<string, string> = {
    easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
};

export default function GenerateFlashcardScreen() {
    const { updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

    const canGenerate = mode === 'topic' ? topic.trim().length > 0 : selectedFile !== null;

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 60, paddingTop: 100 }} showsVerticalScrollIndicator={false}>
                <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white mb-8">Build Deck</Text>

                {/* Source Selector Segment Flat Style */}
                <View className="flex-row bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 mb-8 border-2 border-slate-100 dark:border-slate-800">
                    {(['topic', 'file'] as QuizMode[]).map(m => (
                        <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                            className="flex-1 items-center justify-center py-3 rounded-xl"
                            style={[
                                mode === m ? {
                                    backgroundColor: isDark ? '#121212' : '#ffffff',
                                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
                                    borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0'
                                } : {}
                            ]}>
                            <Text
                                className="font-black text-[14px] uppercase tracking-widest"
                                style={{ color: mode === m ? (isDark ? '#ffffff' : '#121212') : (isDark ? '#475569' : '#94a3b8') }}
                            >
                                {m}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Source Input */}
                <View className="mb-8">
                    {mode === 'topic' ? (
                        <>
                            <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Topic</Text>
                            <TextInput
                                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white"
                                placeholder="e.g. Spanish conjugation, AWS Services..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </>
                    ) : (
                        <>
                            <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Document</Text>
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] p-8 items-center bg-slate-50 dark:bg-slate-900/50"
                            >
                                {isProcessingFile ? (
                                    <View className="items-center py-2">
                                        <ActivityIndicator size="large" color="#2EBD85" />
                                        <Text className="text-[15px] font-bold text-brand-primary mt-4">Analyzing...</Text>
                                    </View>
                                ) : selectedFile ? (
                                    <>
                                        <Ionicons name="document-text" size={40} color="#2EBD85" />
                                        <Text className="text-[15px] font-bold text-slate-900 dark:text-white mt-4 text-center">{selectedFile?.name}</Text>
                                        <Text className="text-[12px] font-bold text-[#2EBD85] mt-2 uppercase tracking-widest">Attached & Ready</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={40} color={isDark ? '#475569' : '#cbd5e1'} />
                                        <Text className="text-[15px] font-bold text-slate-500 mt-4">Tap to select PDF/DOCX/TXT/MD</Text>
                                        <Text className="text-[12px] font-bold text-slate-400 mt-2 lowercase">max 5MB • extractable text only</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings Base */}
                <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Number of Cards (5-50)</Text>
                <TextInput
                    className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white mb-8"
                    keyboardType="number-pad" value={cardCount} onChangeText={setCardCount}
                />

                <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Difficulty</Text>
                <View className="flex-row gap-3 mb-8">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <TouchableOpacity key={d} onPress={() => setDifficulty(d)}
                            className="flex-1 rounded-2xl py-4 items-center justify-center"
                            style={[
                                { borderWidth: 2 },
                                difficulty === d
                                    ? { borderColor: isDark ? '#ffffff' : '#121212', backgroundColor: isDark ? '#ffffff' : '#121212' }
                                    : { borderColor: isDark ? '#1e293b' : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' }
                            ]}>
                            <Text
                                className="font-black text-[13px] uppercase tracking-widest"
                                style={{ color: difficulty === d ? (isDark ? '#121212' : '#ffffff') : '#94a3b8' }}
                            >
                                {d}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="h-4" />
            </ScrollView>

            {/* Glassmorphic Sticky Footer */}
            <BlurView 
                intensity={80} 
                tint={isDark ? "dark" : "light"} 
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom || 24, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
                {isLoading ? (
                    <View className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-[28px] p-6 border-2 border-brand-primary/20 items-center overflow-hidden">
                        <View className="mb-4">
                            <ActivityIndicator size="small" color="#2EBD85" />
                        </View>
                        <Text className="text-brand-primary font-black text-lg tracking-tight mb-1 text-center">{loadingStage}</Text>
                        <Text className="text-slate-500 dark:text-slate-400 font-medium text-[11px] text-center px-2">
                            Usually takes 15-30s.
                        </Text>
                        <View className="flex-row gap-1.5 mt-4 w-full px-2">
                            {['Analyzing', 'Extracting', 'Generating', 'Finalizing'].map((s, i) => {
                                const stages = mode === 'file'
                                    ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
                                    : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];
                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = i < currentIdx;
                                const isActive = i === currentIdx;
                                return (
                                    <View key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                        {(isComplete || isActive) && (
                                            <View className={`h-full ${isComplete ? 'bg-brand-primary' : 'bg-brand-primary/60'}`} style={{ width: isComplete ? '100%' : '60%' }} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : canGenerate ? (
                    <>
                        <TouchableOpacity
                            onPress={handleGenerate}
                            className="bg-[#2EBD85] rounded-2xl py-4 items-center flex-row justify-center shadow-lg shadow-[#2EBD85]/20"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="sparkles" size={20} color="#fff" />
                            <Text className="text-white font-black ml-2 text-[17px]">Generate Flashcards</Text>
                        </TouchableOpacity>
                        <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">
                            Estimated Cost: {parseInt(cardCount) || 10} Credits | Max 5MB
                        </Text>
                    </>
                ) : null}
            </BlurView>

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


