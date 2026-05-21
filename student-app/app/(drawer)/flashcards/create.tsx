import React, { useCallback, useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router, useFocusEffect } from 'expo-router';
import { generateUUID } from '@/lib/utils';
import { Colors } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { posthog } from '@/lib/posthog';
import { CheckCircle, DocumentText, CloudUpload, Leaf, LightbulbBolt, Rocket, AltArrowLeft } from '@solar-icons/react-native/Bold';
import GlobalErrorModal from '@/components/GlobalErrorModal';
import { useNavigation } from '@react-navigation/native';

import OutOfCreditsModal from '@/components/OutOfCreditsModal';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

const MODE_OPTIONS = [
    { key: 'topic', label: 'By Topic', emoji: '🧠' },
    { key: 'file', label: 'From File', emoji: '📄' },
];

const DIFFICULTY_OPTIONS = [
    { key: 'easy', label: 'Easy', emoji: '🌱', desc: 'Focus on fundamentals' },
    { key: 'medium', label: 'Medium', emoji: '💡', desc: 'Balanced challenge' },
    { key: 'hard', label: 'Hard', emoji: '🔥', desc: 'Deep analytical questions' },
];

function ChipButton({
    label,
    emoji,
    isSelected,
    onPress,
    isDark,
    C,
    small,
}: {
    label: string;
    emoji: string;
    isSelected: boolean;
    onPress: () => void;
    isDark: boolean;
    C: typeof Colors.light;
    small?: boolean;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                s.chip,
                small ? s.chipSmall : null,
                isSelected
                    ? { backgroundColor: '#007AFF', borderColor: '#007AFF' }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F8', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E4EF' },
            ]}
        >
            <Text style={small ? s.chipEmojiSmall : s.chipEmoji}>{emoji}</Text>
            <Text style={[small ? s.chipLabelSmall : s.chipLabel, { color: isSelected ? '#fff' : C.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function GenerateFlashcardScreen() {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const [animKey, setAnimKey] = useState(0);

    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [cardCount, setCardCount] = useState('10');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const clampedCardCount = Math.min(Math.max(parseInt(cardCount) || 10, 5), 30);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [extractionId, setExtractionId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const navigation = useNavigation();
    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
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
        }, [navigation])
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
                // Set file instantly so UI updates
                setSelectedFile(asset);
                setMode('file');
                setTopic('');
                setIsProcessingFile(false);
                
                // Start background extraction
                setIsExtracting(true);
                try {
                    const fd = new FormData();
                    fd.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' } as any);
                    fd.append('type', 'flashcard');
                    
                    const res = await api.post('files/extract', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        skipGlobalError: true
                    } as any);
                    
                    if (res.data?.extraction_id) {
                        setExtractionId(res.data.extraction_id);
                    }
                } catch (e: any) {
                    Alert.alert('Extraction Failed', e.response?.data?.message || 'Could not extract text from document.');
                    setSelectedFile(null);
                    setExtractionId(null);
                } finally {
                    setIsExtracting(false);
                }
            }
        } catch {
            setIsProcessingFile(false);
            setIsExtracting(false);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        
        const pricingConfig = useAuthStore.getState().pricingConfig;
        const planTier = user?.plan_name === 'free' ? 'free' : 'paid';
        const flatCost = (pricingConfig?.rates?.flashcard_flat as any)?.[planTier] ?? (planTier === 'free' ? 30 : 25);
        const cardCountValue = clampedCardCount;
        
        // Pre-flight check
        let currentCredits = user?.credits ?? 0;
        let isUnlimited = user?.is_unlimited ?? false;

        if (!isUnlimited && currentCredits <= 0) {
            try {
                const userRes = await api.get('me');
                if (userRes.data) {
                    updateUser(userRes.data);
                    currentCredits = userRes.data.credits ?? 0;
                    isUnlimited = userRes.data.is_unlimited ?? false;
                }
            } catch (e) { }

            if (!isUnlimited && currentCredits <= 0) {
                setShowOutOfCredits(true);
                return;
            }
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
            const cardCountValue = clampedCardCount;
            const idempotencyKey = generateUUID();
            let res;

            if (mode === 'file' && selectedFile) {
                if (extractionId) {
                    res = await api.post('flashcards/decks', { extraction_id: extractionId }, { skipGlobalError: true } as any);
                } else {
                    // Fallback to old method just in case
                    const fd = new FormData();
                    fd.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'application/octet-stream' } as any);
                    res = await api.post('flashcards/decks', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        skipGlobalError: true
                    } as any);
                }
            } else {
                res = await api.post('flashcards/decks', { topic }, { skipGlobalError: true } as any);
            }

            const deckId = res.data.data.id;
            
            const params = new URLSearchParams({
                autoStart: 'true',
                topic: topic || '',
                card_count: String(cardCountValue),
                difficulty: difficulty,
                mode: mode,
                idempotency: idempotencyKey
            });
            
            clearInterval(stageInterval);
            setIsLoading(false);
            
            router.replace(`/(drawer)/flashcards/${deckId}?${params.toString()}`);

        } catch (e: any) {
            clearInterval(stageInterval);
            setIsLoading(false);
            setGlobalError(e.response?.data?.message || 'Failed to start generation. Please check your connection.');
            setShowErrorModal(true);
        }
    };

    const parsePartialJson = (json: string) => {
        try {
            let testJson = json.trim();
            testJson = testJson.replace(/```(?:json)?|```/g, '').trim();
            if (!testJson.endsWith(']')) {
                const lastObjEnd = testJson.lastIndexOf('}');
                if (lastObjEnd !== -1) {
                    testJson = testJson.substring(0, lastObjEnd + 1) + ']';
                } else {
                    testJson += ']';
                }
            }
            return JSON.parse(testJson);
        } catch (e) {
            return null;
        }
    };

    const canGenerate = mode === 'topic' ? topic.trim().length > 0 : (selectedFile !== null && !isExtracting);
    const estimatedCost = clampedCardCount;
    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(500)} style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}> 
                <TouchableOpacity 
                    onPress={() => router.replace('/')} 
                    activeOpacity={0.7} 
                    style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                >
                    <AltArrowLeft size={24} color={isDark ? 'white' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Create Deck</Text>
                <View style={{ width: 44 }} />
            </Animated.View>

                <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 220, paddingTop: 10 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Segmented Control */}
                <Animated.View entering={FadeInDown.delay(80).duration(400)} style={[s.chipRow, { marginBottom: 24 }]}> 
                    {MODE_OPTIONS.map(option => (
                        <ChipButton
                            key={option.key}
                            label={option.label}
                            emoji={option.emoji}
                            isSelected={mode === option.key}
                            onPress={() => { setMode(option.key as QuizMode); if (option.key === 'topic') setSelectedFile(null); }}
                            isDark={isDark}
                            C={C}
                        />
                    ))}
                </Animated.View>

                {/* Input Area */}
                {mode === 'topic' ? (
                    <Animated.View entering={FadeInDown.delay(160).duration(400)} style={[s.card, { backgroundColor: C.card, marginBottom: 32 }]}>
                        <TextInput
                            style={[s.textInput, { color: C.text }]}
                            placeholder="E.g. Cell Biology, World War II..."
                            placeholderTextColor="#94a3b8"
                            value={topic}
                            onChangeText={setTopic}
                            multiline={false}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.delay(160).duration(400)}>
                        <TouchableOpacity
                            onPress={handleFileSelect}
                            disabled={isProcessingFile || isExtracting}
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
                                {isExtracting ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <LoadingSpinner size={14} color="#007AFF" />
                                        <Text style={[s.uploadSub, { color: '#007AFF', marginLeft: 6 }]}>Extracting text...</Text>
                                    </View>
                                ) : (
                                    <Text style={[s.uploadSub, { color: '#10b981' }]}>Ready to generate</Text>
                                )}
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
                    </Animated.View>
                )}

                {/* Number of Cards (Stepper) */}
                <Animated.View entering={FadeInDown.delay(240).duration(400)}>
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
                                onPress={() => setCardCount(prev => String(Math.min(30, parseInt(prev) + 5)))}
                            >
                                <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                </View>
                </Animated.View>

                {/* Difficulty */}
                <Animated.View entering={FadeInDown.delay(320).duration(400)}>
                    <Text style={[s.sectionTitle, { color: '#94a3b8' }]}>DIFFICULTY</Text>
                    <View style={[s.card, { backgroundColor: C.card, padding: 16 }]}> 
                        <View style={s.chipRow}>
                            {DIFFICULTY_OPTIONS.map(opt => (
                                <ChipButton
                                    key={opt.key}
                                    label={opt.label}
                                    emoji={opt.emoji}
                                    isSelected={difficulty === opt.key}
                                    onPress={() => setDifficulty(opt.key as Difficulty)}
                                    isDark={isDark}
                                    C={C}
                                    small
                                />
                            ))}
                    </View>
                </View>
                </Animated.View>
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
                    disabled={!canGenerate || isLoading}
                    activeOpacity={0.8}
                    style={[s.generatePillButton, { backgroundColor: canGenerate ? '#007AFF' : isDark ? '#1C1C1E' : '#E2E8F0' }]}
                >
                    {isLoading ? (
                        <LoadingSpinner size={24} color="white" strokeWidth={3} />
                    ) : (
                        <Text style={[s.generatePillText, { color: canGenerate ? '#FFF' : '#94a3b8' }]}>
                            Generate Set
                        </Text>
                    )}
                </TouchableOpacity>
                <OutOfCreditsModal 
                    visible={showOutOfCredits} 
                    onDismiss={() => setShowOutOfCredits(false)} 
                    featureAttempted="flashcard" 
                />
            </BlurView>

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

    chipRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'nowrap', marginHorizontal: 0, marginBottom: 0 },
    chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 999, borderWidth: 1, marginHorizontal: 6, minHeight: 52, flex: 1, minWidth: 110, maxWidth: 160 },
    chipSmall: { paddingHorizontal: 10, paddingVertical: 8, minHeight: 44, minWidth: 90, maxWidth: 130 },
    chipEmoji: { fontSize: 18, marginRight: 10 },
    chipEmojiSmall: { fontSize: 16, marginRight: 8 },
    chipLabel: { fontSize: 14, fontWeight: '700' },
    chipLabelSmall: { fontSize: 13, fontWeight: '700' },

    // Footer
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
    generatePillButton: { width: '100%', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    generatePillText: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },

    iconBoxRow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)', marginBottom: 12 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    processingText: { fontSize: 13, fontWeight: '600', marginTop: 12 },
});
