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
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 150, paddingTop: 100 }} showsVerticalScrollIndicator={false}>
                <Text className={`text-[32px] font-bold tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Deck</Text>

                {/* Source Selector Segment Flat Style */}
                <View className={`flex-row p-1.5 mb-10 rounded-[24px] border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    {(['topic', 'file'] as QuizMode[]).map(m => (
                        <TouchableOpacity 
                            key={m} 
                            onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                            activeOpacity={0.8}
                            className={`flex-1 items-center justify-center py-3.5 rounded-[18px] ${mode === m ? (isDark ? 'bg-slate-800' : 'bg-slate-900') : ''}`}
                        >
                            <Text
                                className={`font-bold text-[13px] uppercase tracking-widest ${mode === m ? 'text-white' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}
                            >
                                {m}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Source Input */}
                <View className="mb-10">
                    {mode === 'topic' ? (
                        <>
                            <Text className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Deck Topic</Text>
                            <TextInput
                                className={`h-[64px] rounded-2xl px-6 border-2 text-[16px] font-bold ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
                                placeholder="e.g. Spanish conjugation, AWS Services..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </>
                    ) : (
                        <>
                            <Text className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Document Source</Text>
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                activeOpacity={0.7}
                                className={`border-2 border-dashed rounded-[40px] p-10 items-center ${isDark ? 'bg-[#161618]/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
                            >
                                {isProcessingFile ? (
                                    <View className="items-center py-2">
                                        <ActivityIndicator size="large" color="#D2B48C" />
                                        <Text className="text-[15px] font-bold text-[#D2B48C] mt-5">Analyzing...</Text>
                                    </View>
                                ) : selectedFile ? (
                                    <>
                                        <View className="w-20 h-20 rounded-[28px] bg-brand-primary items-center justify-center mb-6">
                                            <Ionicons name="document-text" size={32} color="white" />
                                        </View>
                                        <Text className={`text-[16px] font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{selectedFile?.name}</Text>
                                        <Text className="text-[11px] font-black text-[#D2B48C] uppercase tracking-widest">Tap to change</Text>
                                    </>
                                ) : (
                                    <>
                                        <View className={`w-20 h-20 rounded-[28px] items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                            <Ionicons name="cloud-upload-outline" size={32} color="#D2B48C" />
                                        </View>
                                        <Text className={`text-[16px] font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Select a document</Text>
                                        <Text className="text-[12px] font-medium text-slate-500 text-center px-6">
                                            PDF, DOCX, TXT or MD (Max 5MB)
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings Base */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Card Count (5-50)</Text>
                    <TextInput
                        className={`h-[64px] rounded-2xl px-6 border-2 text-[16px] font-bold ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
                        keyboardType="number-pad" 
                        value={cardCount} 
                        onChangeText={setCardCount}
                    />
                </View>

                <Text className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Difficulty Level</Text>
                <View className="flex-row gap-3 mb-12">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <TouchableOpacity 
                            key={d} 
                            onPress={() => setDifficulty(d)}
                            activeOpacity={0.8}
                            className={`flex-1 h-[56px] rounded-2xl items-center justify-center border-2 ${difficulty === d ? (isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900') : (isDark ? 'bg-transparent border-slate-800' : 'bg-white border-slate-100')}`}
                        >
                            <Text
                                className={`font-bold text-[12px] uppercase tracking-widest ${difficulty === d ? (isDark ? 'text-slate-900' : 'text-white') : 'text-slate-400'}`}
                            >
                                {d}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Glassmorphic Sticky Footer */}
            <BlurView 
                intensity={isDark ? 40 : 80} 
                tint={isDark ? "dark" : "light"} 
                className={`absolute bottom-0 left-0 right-0 p-6 pb-10 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
            >
                {isLoading ? (
                    <View className={`rounded-[32px] p-6 border-2 ${isDark ? 'bg-[#161618] border-brand-primary/20' : 'bg-white border-brand-primary/10 shadow-sm'}`}>
                        <View className="items-center mb-6">
                            <ActivityIndicator size="small" color="#D2B48C" />
                            <Text className={`font-bold text-lg mt-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{loadingStage}</Text>
                            <Text className="text-slate-500 font-medium text-[11px] uppercase tracking-widest mt-1">Skeeme AI at work</Text>
                        </View>
                        
                        <View className="flex-row gap-2 mt-2">
                            {[0, 1, 2, 3].map((step) => {
                                const stages = mode === 'file'
                                    ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
                                    : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];
                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = step < currentIdx;
                                const isActive = step === currentIdx;
                                
                                return (
                                    <View key={step} className={`flex-1 h-1.5 rounded-full ${isComplete ? 'bg-brand-primary' : (isActive ? 'bg-brand-primary/40' : (isDark ? 'bg-slate-800' : 'bg-slate-100'))}`} />
                                );
                            })}
                        </View>
                    </View>
                ) : canGenerate ? (
                    <View>
                        <TouchableOpacity
                            onPress={handleGenerate}
                            className="bg-brand-primary h-[58px] rounded-2xl items-center flex-row justify-center shadow-lg shadow-brand-primary/20"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="sparkles" size={20} color="#fff" />
                            <Text className="text-white font-bold ml-2 text-[17px]">Generate Set</Text>
                        </TouchableOpacity>
                        <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-5">
                            Cost: {parseInt(cardCount) || 10} Credits per Set
                        </Text>
                    </View>
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


