import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import EventSource from 'react-native-sse';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router, Stack, useFocusEffect } from 'expo-router';
import { generateUUID } from '@/lib/utils';
import { Colors } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { posthog } from '@/lib/posthog';
import { CheckCircle, DocumentText, CloudUpload, Leaf, LightbulbBolt, Rocket, FolderOpen, AltArrowLeft } from '@solar-icons/react-native/Bold';
import GlobalErrorModal from '@/components/GlobalErrorModal';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';

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
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Reward Modal State
    const [rewardData, setRewardData] = useState<any>(null);
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
    const [pendingDeckId, setPendingDeckId] = useState<number | null>(null);
    const navigation = useNavigation();
    useFocusEffect(
        useCallback(() => {
            const onBeforeRemove = (e: any) => {
                if (!isLoading) return;
                e.preventDefault();
                Alert.alert(
                    'Stop Generation?',
                    'If you leave now, the flashcard generation will be cancelled. Are you sure?',
                    [
                        { text: "No, Stay", style: 'cancel', onPress: () => {} },
                        {
                            text: 'Yes, Stop',
                            style: 'destructive',
                            onPress: () => navigation.dispatch(e.data.action),
                        },
                    ]
                );
            };
            navigation.addListener('beforeRemove', onBeforeRemove);
            return () => navigation.removeListener('beforeRemove', onBeforeRemove);
        }, [navigation, isLoading])
    );

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

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                'Idempotency-Key': idempotencyKey,
            };

            if (mode !== 'file') {
                headers['Content-Type'] = 'application/json';
            }

            const es = new EventSource(url, {
                headers,
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
                setGlobalError('Skeeme is down, Please try again later.');
                setShowErrorModal(true);
            });

        } catch (e: any) {
            clearInterval(stageInterval);
            setIsLoading(false);
            setGlobalError('Failed to start generation. Please check your connection.');
            setShowErrorModal(true);
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
            <View style={{ flex: 1, backgroundColor: C.background }}>
                <Stack.Screen options={{ 
                    headerShown: false,
                    tabBarStyle: { display: 'none' } 
                } as any} />
                
                <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={[s.headerTitle, { color: C.text }]}>Building Set...</Text>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
                    <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 20 }}>
                        <LoadingSpinner size={50} color={C.primary} />
                        <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 24, color: C.text, textAlign: 'center' }}>
                            {loadingStage || 'Skeeming...'}
                        </Text>
                        <Text style={{ fontSize: 16, color: C.textTertiary, marginTop: 8, textAlign: 'center' }}>
                            Our AI is crafting your study materials
                        </Text>
                    </View>

                    {[1, 2, 3].map(i => (
                        <View key={i} style={[s.card, { backgroundColor: C.card, padding: 30, opacity: 1 - (i * 0.2) }]}>
                            <SkeletonLoader width="60%" height={24} style={{ marginBottom: 16 }} />
                            <View style={{ height: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', marginVertical: 16 }} />
                            <SkeletonLoader width="85%" height={16} style={{ marginBottom: 8 }} />
                            <SkeletonLoader width="40%" height={16} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    activeOpacity={0.7} 
                    style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                >
                    <AltArrowLeft size={24} color={isDark ? 'white' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Create Deck</Text>
                <View style={{ width: 44 }} />
            </View>

                <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 220, paddingTop: 10 }} 
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
                                <Text style={[s.segmentText, { color: isSelected ? C.text : C.textTertiary, fontWeight: isSelected ? '700' : '500' }]}>
                                    {m === 'topic' ? 'By Topic' : 'From File'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Input Area */}
                {mode === 'topic' ? (
                    <View style={[s.card, { backgroundColor: C.card, marginBottom: 32 }]}>
                        <TextInput
                            style={[s.textInput, { color: C.text }]}
                            placeholder="E.g. Cell Biology, World War II..."
                            placeholderTextColor="#94a3b8"
                            value={topic}
                            onChangeText={setTopic}
                            multiline={false}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleFileSelect}
                        disabled={isProcessingFile}
                        activeOpacity={0.7}
                        style={[s.card, s.uploadBox, { backgroundColor: C.card, marginBottom: 32 }]}
                    >
                        {isProcessingFile ? (
                            <View style={s.centered}>
                                <LoadingSpinner size={32} />
                                <Text style={[s.processingText, { color: '#007AFF' }]}>Analyzing document...</Text>
                            </View>
                        ) : selectedFile ? (
                            <>
                                <View style={s.iconBoxRow}>
                                    <DocumentText size={24} color="#007AFF" />
                                </View>
                                <Text style={[s.uploadTitle, { color: C.text }]}>{selectedFile.name}</Text>
                                <Text style={[s.uploadSub, { color: '#10b981' }]}>Ready to generate</Text>
                            </>
                        ) : (
                            <>
                                <View style={s.iconBoxRow}>
                                    <CloudUpload size={24} color="#007AFF" />
                                </View>
                                <Text style={[s.uploadTitle, { color: C.text }]}>Tap to upload PDF or DOCX</Text>
                                <Text style={[s.uploadSub, { color: '#94a3b8' }]}>Maximum 5MB</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Number of Cards (Stepper) */}
                <Text style={[s.sectionTitle, { color: '#94a3b8' }]}>NUMBER OF CARDS</Text>
                <View style={[s.card, s.stepperCard, { backgroundColor: C.card, marginBottom: 32 }]}>
                    <Text style={[s.stepperLabel, { color: C.text }]}>Cards</Text>
                    <View style={s.stepperControls}>
                        <TouchableOpacity 
                            style={s.stepperBtn}
                            onPress={() => setCardCount(prev => String(Math.max(5, parseInt(prev) - 5)))}
                        >
                            <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[s.stepperValue, { color: C.text }]}>{cardCount}</Text>
                        <TouchableOpacity 
                            style={s.stepperBtn}
                            onPress={() => setCardCount(prev => String(Math.min(50, parseInt(prev) + 5)))}
                        >
                            <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Difficulty */}
                <Text style={[s.sectionTitle, { color: '#94a3b8' }]}>DIFFICULTY</Text>
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
                intensity={Platform.OS === 'ios' ? 90 : 100}
                tint={isDark ? 'dark' : 'light'}
                style={[s.formFooter, {
                    paddingBottom: Math.max(insets.bottom, 16) + 75,
                    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    backgroundColor: isDark
                        ? (Platform.OS === 'android' ? 'rgba(13,13,13,0.95)' : 'rgba(13,13,13,0.6)')
                        : (Platform.OS === 'android' ? 'rgba(248,250,252,0.95)' : 'rgba(248,250,252,0.7)'),
                }]}
            >
                <TouchableOpacity
                    onPress={handleGenerate}
                    disabled={!canGenerate}
                    activeOpacity={0.8}
                    style={[s.generatePillButton, { backgroundColor: canGenerate ? '#007AFF' : isDark ? '#1C1C1E' : '#E2E8F0' }]}
                >
                    <Text style={[s.generatePillText, { color: canGenerate ? '#FFF' : '#94a3b8' }]}>
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

            <GlobalErrorModal 
                visible={showErrorModal}
                error={globalError}
                onDismiss={() => setShowErrorModal(false)}
            />
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
    menuBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F8FAFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

    // Segmented Control
    segmentedControl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 24 },
    segmentedControlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segmentedControlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    segmentBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segmentBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segmentText: { fontSize: 14, letterSpacing: -0.2 },

    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 12, marginBottom: 12, marginLeft: 8, textTransform: 'uppercase' },

    // Cards
    card: { borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
    textInput: { fontSize: 16, fontWeight: '600', padding: 8 },

    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)' },
    uploadTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    uploadSub: { fontSize: 13, fontWeight: '500' },

    // Stepper
    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },

    // Difficulty Options (grouped card rows)
    optRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, minHeight: 64 },
    optIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optDesc: { fontSize: 13, fontWeight: '500' },

    // Footer
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
    generatePillButton: { width: '100%', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    generatePillText: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },

    iconBoxRow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)', marginBottom: 12 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    processingText: { fontSize: 13, fontWeight: '600', marginTop: 12 },
});

