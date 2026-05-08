import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { DocumentCodeIcon, Upload01Icon, SparklesIcon, ArrowLeft01Icon, Leaf01Icon, IdeaIcon, Rocket01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import EventSource from 'react-native-sse';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { generateUUID } from '@/lib/utils';
import { Colors } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { posthog } from '@/lib/posthog';

import { RewardModal } from '@/components/RewardModal';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function GenerateFlashcardScreen() {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

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
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a file smaller than 5MB. Ensure it contains extractable text.');
                    return;
                }

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
        
        const count = parseInt(cardCount) || 10;
        if (!user?.is_unlimited && (user?.credits ?? 0) < count) {
            Alert.alert('Insufficient Credits', 'You need more credits to generate this deck.');
            return;
        }

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
            const token = useAuthStore.getState().token;
            const idempotencyKey = generateUUID();
            const url = `${process.env.EXPO_PUBLIC_API_URL}student/flashcards/generate/stream`;

            const es = new EventSource(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Idempotency-Key': idempotencyKey,
                },
                method: 'POST',
                body: mode === 'file' && selectedFile 
                    ? (() => {
                        const fd = new FormData();
                        fd.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'application/octet-stream' } as any);
                        fd.append('card_count', cardCount);
                        fd.append('difficulty', difficulty);
                        return fd;
                      })()
                    : JSON.stringify({ topic, card_count: count, difficulty }),
            });

            let accumulatedJson = '';

            es.addEventListener('message', (event) => {
                if (event.data === '[DONE]') {
                    es.close();
                    clearInterval(stageInterval);
                    // Final check - results are saved on backend
                    return;
                }

                try {
                    const chunk = JSON.parse(event.data || '{}');
                    if (chunk.text) {
                        accumulatedJson += chunk.text;
                    }
                    if (chunk.db_id) {
                        finishFlashcardGen(chunk.db_id);
                    }
                    if (chunk.error) throw new Error(chunk.error);
                } catch (e) {}
            });

            es.addEventListener('error', (event) => {
                es.close();
                setIsLoading(false);
                clearInterval(stageInterval);
                Alert.alert('Error', 'Streaming failed.');
            });

        } catch (e: any) {
            clearInterval(stageInterval);
            setIsLoading(false);
            Alert.alert('Error', 'Failed to start generation.');
        }
    };

    const finishFlashcardGen = async (deckId: number) => {
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
        
        try {
            posthog.capture('flashcards_generated_stream', { difficulty, card_count: parseInt(cardCount) });
        } catch(e) {}

        const userRes = await api.get('me');
        if (userRes.data) updateUser(userRes.data);

        router.replace(`/(drawer)/flashcards/${deckId}`);
    };

    const canGenerate = mode === 'topic' ? topic.trim().length > 0 : selectedFile !== null;
    const estimatedCost = parseInt(cardCount) || 10;

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <Text style={[s.headerTitle, { color: C.text }]}>
                    Create Deck
                </Text>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220, paddingTop: 10 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Segmented Control */}
                <View style={[s.segmentedControl, isDark ? s.segmentedControlDark : s.segmentedControlLight]}>
                    {(['topic', 'file'] as QuizMode[]).map(m => {
                        const isSelected = mode === m;
                        return (
                            <TouchableOpacity 
                                key={m} 
                                onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                style={[s.segmentBtn, isSelected && (isDark ? s.segmentBtnActiveDark : s.segmentBtnActiveLight)]}
                            >
                                <Text style={[s.segmentText, isSelected ? { color: C.text, fontWeight: '700' } : { color: C.textTertiary, fontWeight: '500' }]}>
                                    {m === 'topic' ? 'By Topic' : 'From File'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Input Area */}
                {mode === 'topic' ? (
                    <View style={[s.card, { backgroundColor: C.card, marginBottom: 24 }]}>
                        <TextInput
                            style={[s.textInput, { color: C.text }]}
                            placeholder="E.g. Cell Biology, World War II..."
                            placeholderTextColor="#8E8E93"
                            value={topic}
                            onChangeText={setTopic}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleFileSelect}
                        disabled={isProcessingFile}
                        activeOpacity={0.7}
                        style={[s.card, s.uploadBox, { backgroundColor: C.card, marginBottom: 24 }]}
                    >
                        {isProcessingFile ? (
                            <View style={s.centered}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={[s.processingText, { color: '#007AFF' }]}>Analyzing document...</Text>
                            </View>
                        ) : selectedFile ? (
                            <>
                                <HugeiconsIcon icon={DocumentCodeIcon} size={32} color="#007AFF" style={{ marginBottom: 12 }} />
                                <Text style={[s.uploadTitle, { color: C.text }]}>{selectedFile.name}</Text>
                                <Text style={[s.uploadSub, { color: '#34C759' }]}>Ready to generate</Text>
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon icon={Upload01Icon} size={32} color="#8E8E93" style={{ marginBottom: 12 }} />
                                <Text style={[s.uploadTitle, { color: C.text }]}>Tap to upload PDF or DOCX</Text>
                                <Text style={[s.uploadSub, { color: '#8E8E93' }]}>Maximum 5MB</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Number of Cards (Stepper) */}
                <Text style={s.sectionTitle}>NUMBER OF CARDS</Text>
                <View style={[s.card, s.stepperCard, { backgroundColor: C.card }]}>
                    <Text style={[s.stepperLabel, { color: C.text }]}>Cards</Text>
                    <View style={s.stepperControls}>
                        <TouchableOpacity 
                            style={[s.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                            onPress={() => setCardCount(prev => String(Math.max(5, parseInt(prev) - 5)))}
                        >
                            <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[s.stepperValue, { color: C.text }]}>{cardCount}</Text>
                        <TouchableOpacity 
                            style={[s.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                            onPress={() => setCardCount(prev => String(Math.min(50, parseInt(prev) + 5)))}
                        >
                            <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Difficulty */}
                <Text style={s.sectionTitle}>DIFFICULTY</Text>
                <View style={{ gap: 12, marginBottom: 24 }}>
                    {[
                        { key: 'easy', label: 'Easy', icon: Leaf01Icon, desc: 'Focus on fundamentals' },
                        { key: 'medium', label: 'Medium', icon: IdeaIcon, desc: 'Comprehensive coverage' },
                        { key: 'hard', label: 'Hard', icon: Rocket01Icon, desc: 'Deep analytical questions' },
                    ].map(opt => {
                        const isSelected = difficulty === opt.key;
                        const Icon = opt.icon;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setDifficulty(opt.key as Difficulty)}
                                activeOpacity={0.8}
                                style={[s.card, s.optionCard, { backgroundColor: C.card, borderColor: isSelected ? '#007AFF' : 'transparent', borderWidth: 2 }]}
                            >
                                <View style={[s.iconBoxRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                    <HugeiconsIcon icon={Icon} size={18} color="#007AFF" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={[s.optionTitle, { color: C.text }]}>{opt.label}</Text>
                                    <Text style={[s.optionDesc, { color: '#8E8E93' }]}>{opt.desc}</Text>
                                </View>
                                {isSelected && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} color="#007AFF" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Glassmorphic Sticky Footer */}
            <BlurView 
                intensity={Platform.OS === 'ios' ? 100 : 0} 
                tint={isDark ? "dark" : "light"} 
                style={[s.formFooter, { 
                    paddingBottom: Math.max(insets.bottom, 16) + 75, 
                    borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    backgroundColor: isDark 
                        ? (Platform.OS === 'android' ? '#121212' : 'rgba(18,18,18,0.8)') 
                        : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
                }]}
            >
                {isLoading ? (
                    <View style={s.loadingContainer}>
                        <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 12 }} />
                        <Text style={[s.loadingText, { color: C.text }]}>{loadingStage}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!canGenerate}
                        activeOpacity={0.8}
                        style={[s.generatePillButton, { backgroundColor: canGenerate ? '#007AFF' : '#A2C9F4' }]}
                    >
                            <Text style={s.generatePillText}>
                                Generate Set
                            </Text>
                    </TouchableOpacity>
                )}
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

const s = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 24 },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

    // Segmented Pill Control
    segmentedControl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 24 },
    segmentedControlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segmentedControlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
    segmentBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segmentBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segmentText: { fontSize: 14, letterSpacing: -0.2 },

    sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 12, marginBottom: 12, paddingLeft: 4, color: '#8E8E93' },

    // Input Cards
    card: { borderRadius: 24, padding: 16 },
    textInput: { height: 28, fontSize: 17, fontWeight: '500' },
    
    uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#C7C7CC', alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
    uploadTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    uploadSub: { fontSize: 13, fontWeight: '500' },

    // Stepper
    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    stepperLabel: { fontSize: 17, fontWeight: '600' },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 17, fontWeight: '700', minWidth: 24, textAlign: 'center' },

    // Difficulty Options
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    iconBoxRow: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '500' },

    // Footer
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
    generatePillButton: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    generatePillText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: -0.2 },
    
    loadingContainer: { alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: 14, fontWeight: '600' },

    // Helpers
    centered: { alignItems: 'center', justifyContent: 'center' },
    processingText: { fontSize: 13, fontWeight: '600', marginTop: 12 },
});
