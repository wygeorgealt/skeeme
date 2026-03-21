import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme, StyleSheet
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
        <GlowBackground isRoot={true}>
            {/* Custom Header */}
            <View style={[s.headerRow, { paddingTop: Math.max(insets.top, 8) }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.menuBtn, isDark ? s.bgWhite10 : s.bgWhite60]}>
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>Create Deck</Text>
                <View style={s.size10} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 180, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
                {/* Source Selector */}
                <View style={[s.selectorWrapper, isDark ? s.bgGrayDark : s.selectorWrapperLight]}>
                    {(['topic', 'file'] as QuizMode[]).map(m => (
                        <TouchableOpacity 
                            key={m} 
                            onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                            activeOpacity={0.8}
                            style={s.selectorBtn}
                        >
                            {mode === m ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={s.selectorGradient}
                                />
                            ) : null}
                            <Text
                                style={[s.selectorText, mode === m ? s.textWhite : s.textSlate400]}
                            >
                                {m}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Source Input */}
                <View style={s.mb8}>
                    {mode === 'topic' ? (
                        <>
                            <Text style={s.label}>Deck Topic</Text>
                            <TextInput
                                style={[s.input, isDark ? s.bgGrayDark : s.inputLight, { color: isDark ? 'white' : '#0f172a' }]}
                                placeholder="e.g. Spanish conjugation, AWS Services..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={s.label}>Document Source</Text>
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                activeOpacity={0.7}
                                style={[s.uploadCard, isDark ? s.uploadCardDark : s.uploadCardLight]}
                            >
                                {isProcessingFile ? (
                                    <View style={s.analyzingWrapper}>
                                        <ActivityIndicator size="large" color="#8B5CF6" />
                                        <Text style={s.analyzingText}>Analyzing...</Text>
                                    </View>
                                ) : selectedFile ? (
                                    <>
                                        <LinearGradient
                                            colors={['#8B5CF6', '#6366F1']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={s.fileIconBox}
                                        >
                                            <Page width={32} height={32} color="white" />
                                        </LinearGradient>
                                        <Text style={[s.fileNameText, isDark ? s.textWhite : s.textSlate900]} numberOfLines={1}>{selectedFile?.name}</Text>
                                        <Text style={s.changeFileText}>Tap to change</Text>
                                    </>
                                ) : (
                                    <>
                                        <View style={[s.uploadIconBox, isDark ? s.bgWhite5 : s.bgIndigo50]}>
                                            <Upload width={32} height={32} color="#8B5CF6" strokeWidth={1.5} />
                                        </View>
                                        <Text style={[s.selectDocTitle, isDark ? s.textWhite : s.textSlate900]}>Select a document</Text>
                                        <Text style={s.uploadHint}>
                                            PDF, DOCX, TXT or MD (Max 5MB)
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings */}
                <View style={s.mb8}>
                    <Text style={s.label}>Card Count (5-50)</Text>
                    <TextInput
                        style={[s.input, isDark ? s.bgGrayDark : s.inputLight, { color: isDark ? 'white' : '#0f172a' }]}
                        keyboardType="number-pad" 
                        value={cardCount} 
                        onChangeText={setCardCount}
                    />
                </View>

                <Text style={s.label}>Difficulty Level</Text>
                <View style={s.difficultyRow}>
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <TouchableOpacity 
                            key={d} 
                            onPress={() => setDifficulty(d)}
                            activeOpacity={0.8}
                            style={s.diffBtn}
                        >
                            {difficulty === d ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={s.diffGradient}
                                />
                            ) : (
                                <View style={[s.diffInactive, isDark ? s.bgGrayDark : s.diffInactiveLight]} />
                            )}
                            <Text
                                style={[s.diffText, difficulty === d ? s.textWhite : s.textSlate400]}
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
                    <View style={[s.loadingBox, isDark ? s.bgGrayDark : s.bgWhite]}>
                        <View style={s.loadingCenter}>
                            <ActivityIndicator size="small" color="#8B5CF6" />
                            <Text style={[s.loadingTitle, isDark ? s.textWhite : s.textSlate900]}>{loadingStage}</Text>
                            <Text style={s.loadingSubtitle}>Skeeme AI at work</Text>
                        </View>
                        <View style={s.progressStepsRow}>
                            {[0, 1, 2, 3].map((step) => {
                                const stages = mode === 'file'
                                    ? ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...']
                                    : ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];
                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = step < currentIdx;
                                const isActive = step === currentIdx;
                                return (
                                    <View key={step} style={s.stepBarWrapper}>
                                        {(isComplete || isActive) ? (
                                            <LinearGradient
                                                colors={['#8B5CF6', '#6366F1']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={[s.flex1, { opacity: isActive ? 0.5 : 1 }]}
                                            />
                                        ) : (
                                            <View style={[s.flex1, isDark ? s.bgWhite5 : s.bgSlate100]} />
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
                            style={s.generateBtn}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.generateBtnGradient}
                            >
                                <Sparks width={20} height={20} color="#fff" strokeWidth={2} />
                                <Text style={s.generateBtnText}>Generate Set</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={s.costText}>
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

const s = StyleSheet.create({
    flex1: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
    menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    size10: { width: 40 },

    selectorWrapper: { flexDirection: 'row', padding: 6, marginBottom: 32, borderRadius: 20 },
    selectorWrapperLight: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    selectorBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, overflow: 'hidden' },
    selectorGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 },
    selectorText: { fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 },

    label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },
    input: { height: 56, borderRadius: 16, fontSize: 15, fontWeight: '700', paddingHorizontal: 20 },
    inputLight: { backgroundColor: 'rgba(255,255,255,0.8)', color: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    bgGrayDark: { backgroundColor: '#13151B' },

    uploadCard: { borderStyle: 'dotted', borderWidth: 2, borderRadius: 28, padding: 32, alignItems: 'center' },
    uploadCardDark: { backgroundColor: 'rgba(19, 21, 27, 0.5)', borderColor: '#334155' },
    uploadCardLight: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: '#e2e8f0' },
    analyzingWrapper: { alignItems: 'center', paddingVertical: 8 },
    analyzingText: { fontSize: 14, fontWeight: '700', color: '#8B5CF6', marginTop: 20 },
    fileIconBox: { width: 80, height: 80, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    fileNameText: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
    changeFileText: { fontSize: 11, fontWeight: '900', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 1.5 },
    uploadIconBox: { width: 80, height: 80, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    bgWhite5: { backgroundColor: 'rgba(255,255,255,0.05)' },
    bgIndigo50: { backgroundColor: '#EEF2FF' },
    selectDocTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
    uploadHint: { fontSize: 11, fontWeight: '500', color: '#64748b', textAlign: 'center', paddingHorizontal: 20 },

    mb8: { marginBottom: 32 },
    difficultyRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
    diffBtn: { flex: 1, height: 48, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    diffGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    diffInactive: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 },
    diffInactiveLight: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    diffText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },

    loadingBox: { borderRadius: 24, padding: 20 },
    bgWhite: { backgroundColor: 'rgba(255,255,255,0.8)' },
    loadingCenter: { alignItems: 'center', marginBottom: 16 },
    loadingTitle: { fontWeight: '700', fontSize: 18, marginTop: 12, letterSpacing: -0.3 },
    loadingSubtitle: { color: '#94a3b8', fontWeight: '500', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
    progressStepsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    stepBarWrapper: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },

    generateBtn: { height: 56, borderRadius: 20, overflow: 'hidden' },
    generateBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    generateBtnText: { color: 'white', fontWeight: '700', marginLeft: 10, fontSize: 16 },
    costText: { textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },

    bgSlate100: { backgroundColor: '#f1f5f9' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
});
