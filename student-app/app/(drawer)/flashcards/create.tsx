import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme
} from 'react-native';
import { 
    Page, Upload, Sparks, NavArrowLeft
} from 'iconoir-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { GlowBackground } from '@/components/ui/GlowBackground';

import { RewardModal } from '@/components/RewardModal';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

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
        <GlowBackground>
            {/* Custom Header */}
            <View style={{ paddingTop: Math.max(insets.top, 8) }} className="px-5 pb-3 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className={`size-10 rounded-full items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/60'}`}>
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <Text className={`text-[18px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Deck</Text>
                <View className="size-10" />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 180, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
                {/* Source Selector */}
                <View className={`flex-row p-1.5 mb-8 rounded-[20px] ${isDark ? 'bg-[#13151B]' : 'bg-white/80 border border-white/50'}`}>
                    {(['topic', 'file'] as QuizMode[]).map(m => (
                        <TouchableOpacity 
                            key={m} 
                            onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                            activeOpacity={0.8}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, overflow: 'hidden' }}
                        >
                            {mode === m ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }}
                                />
                            ) : null}
                            <Text
                                className={`font-bold text-[12px] uppercase tracking-widest ${mode === m ? 'text-white' : 'text-slate-400'}`}
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
                            <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Deck Topic</Text>
                            <TextInput
                                className={`h-[56px] rounded-2xl px-5 text-[15px] font-bold ${isDark ? 'bg-[#13151B] text-white' : 'bg-white/80 text-slate-900 border border-white/50'}`}
                                placeholder="e.g. Spanish conjugation, AWS Services..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </>
                    ) : (
                        <>
                            <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Document Source</Text>
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                activeOpacity={0.7}
                                className={`border-2 border-dashed rounded-[28px] p-8 items-center ${isDark ? 'bg-[#13151B]/50 border-slate-700' : 'bg-white/60 border-slate-200'}`}
                            >
                                {isProcessingFile ? (
                                    <View className="items-center py-2">
                                        <ActivityIndicator size="large" color="#8B5CF6" />
                                        <Text className="text-[14px] font-bold text-[#8B5CF6] mt-5">Analyzing...</Text>
                                    </View>
                                ) : selectedFile ? (
                                    <>
                                        <LinearGradient
                                            colors={['#8B5CF6', '#6366F1']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{ width: 80, height: 80, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
                                        >
                                            <Page width={32} height={32} color="white" />
                                        </LinearGradient>
                                        <Text className={`text-[15px] font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{selectedFile?.name}</Text>
                                        <Text className="text-[11px] font-black text-[#8B5CF6] uppercase tracking-widest">Tap to change</Text>
                                    </>
                                ) : (
                                    <>
                                        <View className={`w-20 h-20 rounded-[32px] items-center justify-center mb-5 ${isDark ? 'bg-white/5' : 'bg-indigo-50'}`}>
                                            <Upload width={32} height={32} color="#8B5CF6" strokeWidth={1.5} />
                                        </View>
                                        <Text className={`text-[15px] font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Select a document</Text>
                                        <Text className="text-[11px] font-medium text-slate-500 text-center px-5">
                                            PDF, DOCX, TXT or MD (Max 5MB)
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings */}
                <View className="mb-8">
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Card Count (5-50)</Text>
                    <TextInput
                        className={`h-[56px] rounded-2xl px-5 text-[15px] font-bold ${isDark ? 'bg-[#13151B] text-white' : 'bg-white/80 text-slate-900 border border-white/50'}`}
                        keyboardType="number-pad" 
                        value={cardCount} 
                        onChangeText={setCardCount}
                    />
                </View>

                <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Difficulty Level</Text>
                <View className="flex-row gap-3 mb-10">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <TouchableOpacity 
                            key={d} 
                            onPress={() => setDifficulty(d)}
                            activeOpacity={0.8}
                            style={{ flex: 1, height: 48, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {difficulty === d ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                />
                            ) : (
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDark ? '#13151B' : 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: isDark ? 'transparent' : 'rgba(255,255,255,0.5)', borderRadius: 16 }} />
                            )}
                            <Text
                                className={`font-bold text-[11px] uppercase tracking-widest ${difficulty === d ? 'text-white' : 'text-slate-400'}`}
                            >
                                {d}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <BlurView 
                intensity={isDark ? 40 : 60} 
                tint={isDark ? "dark" : "light"} 
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Math.max(insets.bottom, 20) + 8, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
                {isLoading ? (
                    <View className={`rounded-[24px] p-5 ${isDark ? 'bg-[#13151B]' : 'bg-white/80'}`}>
                        <View className="items-center mb-4">
                            <ActivityIndicator size="small" color="#8B5CF6" />
                            <Text className={`font-bold text-lg mt-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{loadingStage}</Text>
                            <Text className="text-slate-400 font-medium text-[11px] uppercase tracking-widest mt-1">Skeeme AI at work</Text>
                        </View>
                        <View className="flex-row gap-2 mt-1">
                            {[0, 1, 2, 3].map((step) => {
                                const stages = mode === 'file'
                                    ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
                                    : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];
                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = step < currentIdx;
                                const isActive = step === currentIdx;
                                return (
                                    <View key={step} style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                        {(isComplete || isActive) ? (
                                            <LinearGradient
                                                colors={['#8B5CF6', '#6366F1']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{ flex: 1, opacity: isActive ? 0.5 : 1 }}
                                            />
                                        ) : (
                                            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : canGenerate ? (
                    <View>
                        <TouchableOpacity
                            onPress={handleGenerate}
                            activeOpacity={0.8}
                            style={{ height: 56, borderRadius: 20, overflow: 'hidden' }}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Sparks width={20} height={20} color="#fff" strokeWidth={2} />
                                <Text className="text-white font-bold ml-2.5 text-[16px]">Generate Set</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">
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
        </GlowBackground>
    );
}
