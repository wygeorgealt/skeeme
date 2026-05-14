import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { posthog } from '@/lib/posthog';
import { CheckCircle, DocumentText, CloudUpload, Leaf, LightbulbBolt, Rocket, FolderOpen } from '@solar-icons/react-native/Bold';

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
            ? ['Skeeming...', 'Solving...', 'Identifying key concepts...', 'Creating cards...', 'Almost ready...']
            : ['Skeeming...', 'Solving...', 'Researching Topic...', 'Drafting cards...', 'Almost ready...'];

        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 2500);

        try {
            const token = useAuthStore.getState().token;
            const idempotencyKey = generateUUID();
            const url = `${process.env.EXPO_PUBLIC_API_URL}flashcards/generate/stream`;

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
            } as any);

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
                    if (chunk.type === 'status') {
                        setLoadingStage(chunk.message);
                    }
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

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner size={60} color={C.primary} />
                <Text style={{ fontFamily: 'Outfit-Bold', fontSize: 24, marginTop: 24, color: isDark ? '#fff' : '#000' }}>
                    {loadingStage || 'Skeeming...'}
                </Text>
                <Text style={{ fontFamily: 'Outfit-Regular', fontSize: 16, marginTop: 8, color: '#8E8E93' }}>
                    Generating your flashcard deck...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={[s.headerTitle, { color: C.text }]}>Create Deck</Text>
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
                                <LoadingSpinner size={32} />
                                <Text style={[s.processingText, { color: '#007AFF' }]}>Analyzing document...</Text>
                            </View>
                        ) : selectedFile ? (
                            <>
                                <DocumentText size={32} color="#007AFF" style={{ marginBottom: 12 }} />
                                <Text style={[s.uploadTitle, { color: C.text }]}>{selectedFile.name}</Text>
                                <Text style={[s.uploadSub, { color: '#34C759' }]}>Ready to generate</Text>
                            </>
                        ) : (
                            <>
                                <CloudUpload size={32} color="#8E8E93" style={{ marginBottom: 12 }} />
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
                <Text style={[s.sectionTitle, { color: C.textTertiary }]}>DIFFICULTY</Text>
                <View style={[s.card, { backgroundColor: C.card }]}>
                    {[
                        { key: 'easy',   label: 'Easy',   Icon: Leaf,               desc: 'Focus on fundamentals'    },
                        { key: 'medium', label: 'Medium', Icon: LightbulbBolt,     desc: 'Comprehensive coverage'   },
                        { key: 'hard',   label: 'Hard',   Icon: Rocket,      desc: 'Deep analytical questions' },
                    ].map((opt, index, arr) => {
                        const isSelected = difficulty === opt.key;
                        const isLast = index === arr.length - 1;
                        const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setDifficulty(opt.key as Difficulty)}
                                activeOpacity={0.75}
                                style={[
                                    s.optRow,
                                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                ]}
                            >
                                <View style={[s.optIcon, { backgroundColor: iconBg }]}>
                                    <opt.Icon size={20} color="#007AFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.optLabel, { color: C.text }]}>{opt.label}</Text>
                                    <Text style={[s.optDesc, { color: C.textSecondary }]}>{opt.desc}</Text>
                                </View>
                                {isSelected && <CheckCircle size={22} color="#007AFF" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <BlurView
                intensity={Platform.OS === 'ios' ? 100 : 0}
                tint={isDark ? 'dark' : 'light'}
                style={[s.formFooter, {
                    paddingBottom: Math.max(insets.bottom, 16) + 75,
                    borderTopColor: C.separator,
                    backgroundColor: isDark
                        ? (Platform.OS === 'android' ? '#0D0D0D' : 'rgba(13,13,13,0.9)')
                        : (Platform.OS === 'android' ? '#F0F2F7' : 'rgba(240,242,247,0.9)'),
                }]}
            >
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
    header: { paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

    // Segmented Control
    segmentedControl: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20 },
    segmentedControlLight: { backgroundColor: '#E5E7EB' },
    segmentedControlDark: { backgroundColor: '#2C2C2E' },
    segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    segmentBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
    segmentBtnActiveDark: { backgroundColor: '#3A3A3C', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 2 },
    segmentText: { fontSize: 15 },

    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 12, marginBottom: 10, paddingLeft: 4, textTransform: 'uppercase' },

    // Cards
    card: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3, marginBottom: 28 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500', paddingHorizontal: 16 },

    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 10 },
    uploadTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    uploadSub: { fontSize: 13, textAlign: 'center' },

    // Stepper
    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    stepperBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    stepperBtnText: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
    stepperValue: { fontSize: 22, fontWeight: '800', minWidth: 32, textAlign: 'center' },

    // Difficulty Options (grouped card rows)
    optRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, minHeight: 64 },
    optIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optDesc: { fontSize: 13 },

    // Legacy (kept for compatibility)
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    iconBoxRow: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optionDesc: { fontSize: 13 },

    // Footer
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
    generatePillButton: { height: 56, borderRadius: 100, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    generatePillText: { color: 'white', fontWeight: '700', fontSize: 16 },

    loadingContainer: { alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: 14, fontWeight: '600' },
    centered: { alignItems: 'center', justifyContent: 'center' },
    processingText: { fontSize: 13, fontWeight: '600', marginTop: 12 },
});

