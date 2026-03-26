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
import { router, useNavigation } from 'expo-router';
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
    const navigation = useNavigation() as any;

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

            const deckId = response.data.data?.id;

            if (response.data.reward?.earned) {
                setRewardData(response.data.reward);
                setPendingDeckId(deckId);
                setIsRewardModalVisible(true);
            } else {
                router.replace(`/(drawer)/flashcards/${deckId}`);
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

    const LOADING_STAGES_FILE = ['Reading material...', 'Identifying key concepts...', 'Creating cards...', 'Reviewing content...', 'Almost ready...'];
    const LOADING_STAGES_TOPIC = ['Analyzing Topic...', 'Researching Context...', 'Drafting cards...', 'Finalizing deck...', 'Almost ready...'];
    const PROGRESS_STAGES = ['Analyzing', 'Extracting', 'Generating', 'Finalizing'];

    return (
        <GlowBackground isRoot={true}>
            {/* Custom Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}>
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>Create Deck</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 24, paddingBottom: 160, paddingTop: 10 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Glass Section: Source */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.sectionGlass}>
                    <View style={s.sectionContent}>
                        <View style={[s.toggleContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                            {(['topic', 'file'] as QuizMode[]).map(m => (
                                <TouchableOpacity 
                                    key={m} 
                                    onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                    style={[s.toggleButton, mode === m && (isDark ? s.toggleActiveDark : s.toggleActiveLight)]}
                                >
                                    <Text style={[s.toggleText, mode === m ? { color: isDark ? '#fff' : '#0f172a' } : { color: '#94a3b8' }]}>
                                        {m}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {mode === 'topic' ? (
                            <TextInput
                                style={[s.input, isDark ? s.inputDark : s.inputLight]}
                                placeholder="e.g. Nigerian History, Algebra..."
                                placeholderTextColor="#94a3b8"
                                value={topic}
                                onChangeText={setTopic}
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={handleFileSelect}
                                disabled={isProcessingFile}
                                activeOpacity={0.7}
                                style={[s.uploadCard, isDark ? s.uploadCardDark : s.uploadCardLight]}
                            >
                                {isProcessingFile ? (
                                    <View style={s.centered}>
                                        <ActivityIndicator size="small" color="#8B5CF6" />
                                        <Text style={s.processingText}>Analyzing document...</Text>
                                    </View>
                                ) : selectedFile ? (
                                    <>
                                        <View style={s.uploadIconActive}>
                                            <Page width={18} height={18} color="#A78BFA" />
                                        </View>
                                        <Text style={[s.fileName, { color: isDark ? '#fff' : '#0f172a' }]}>{selectedFile.name}</Text>
                                        <Text style={s.fileReady}>Ready to generate</Text>
                                    </>
                                ) : (
                                    <>
                                        <View style={[s.uploadIconEmpty, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                                            <Upload width={18} height={18} color={isDark ? '#cbd5e1' : '#94a3b8'} />
                                        </View>
                                        <Text style={[s.uploadPlaceholder, { color: isDark ? '#94a3b8' : '#64748b' }]}>Tap to upload PDF/DOCX</Text>
                                        <Text style={s.uploadSubtext}>max 5MB • extractable text</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </BlurView>

                {/* Glass Section: Configuration */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.sectionGlass}>
                    <View style={s.sectionContent}>
                        
                        <View style={{ marginBottom: 24 }}>
                            <Text style={s.subLabel}>Number of Cards (5-50)</Text>
                            <TextInput
                                style={[s.input, isDark ? s.inputDark : s.inputLight]}
                                keyboardType="number-pad" 
                                value={cardCount} 
                                onChangeText={setCardCount}
                                onBlur={() => {
                                    const val = parseInt(cardCount);
                                    if (isNaN(val) || val < 5) setCardCount('5');
                                    else if (val > 50) setCardCount('50');
                                }}
                            />
                        </View>

                        <Text style={s.subLabel}>Difficulty Level</Text>
                        <View>
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    onPress={() => setDifficulty(d)}
                                    activeOpacity={0.8}
                                    style={[s.difficultyCard, { 
                                        borderColor: difficulty === d ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                                        backgroundColor: difficulty === d ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)'
                                    }]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: difficulty === d ? '#8B5CF6' : 'rgba(255,255,255,0.05)' }]}>
                                        <Sparks width={18} height={18} color={difficulty === d ? '#fff' : '#A78BFA'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
                                            {d.charAt(0).toUpperCase() + d.slice(1)}
                                        </Text>
                                        <Text style={s.cardDesc}>
                                            {d === 'easy' ? 'Focus on fundamentals' : d === 'medium' ? 'Comprehensive coverage' : 'Deep analytical questions'}
                                        </Text>
                                    </View>
                                    {difficulty === d && (
                                        <View style={s.checkCircle}>
                                            <Sparks width={14} height={14} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </BlurView>
            </ScrollView>

            {/* Glassmorphic Sticky Footer */}
            <BlurView 
                intensity={80} 
                tint={isDark ? "dark" : "light"} 
                style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24), borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
                {isLoading ? (
                    <View style={[s.loadingBanner, { backgroundColor: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }]}>
                        <View style={{ marginBottom: 16 }}>
                            <ActivityIndicator size="small" color="#A78BFA" />
                        </View>
                        <Text style={[s.stageText, { color: '#A78BFA' }]}>{loadingStage}</Text>
                        <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 11, fontWeight: '500', paddingHorizontal: 8 }}>
                            Usually takes 15-30s.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 16, width: '100%', paddingHorizontal: 8 }}>
                            {PROGRESS_STAGES.map((st, i) => {
                                const stages = mode === 'file' ? LOADING_STAGES_FILE : LOADING_STAGES_TOPIC;
                                const currentIdx = stages.indexOf(loadingStage);
                                const isComplete = i < currentIdx;
                                const isActive = i === currentIdx;
                                return (
                                    <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        {(isComplete || isActive) && (
                                            <View style={{ height: '100%', width: isComplete ? '100%' : '60%', backgroundColor: isComplete ? '#8B5CF6' : 'rgba(139,92,246,0.6)' }} />
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
                            activeOpacity={0.8}
                            style={s.generateBtn}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.generateBtnContent}
                            >
                                <Sparks width={18} height={18} color="#fff" />
                                <Text style={s.btnText}>Generate Set</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={s.costTextLower}>
                            Estimated Cost: {parseInt(cardCount) || 5} Credits | Max 5MB
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
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
    menuBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: 'rgba(255,255,255,0.6)' },

    sectionGlass: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
    sectionContent: { padding: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },
    toggleContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    toggleButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
    toggleActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    toggleActiveLight: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    toggleText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
    input: { height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 20, fontSize: 15, fontWeight: '500' },
    inputDark: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' },
    inputLight: { backgroundColor: '#fff', color: '#0f172a' },
    uploadCard: { borderStyle: 'dashed', borderWidth: 2, borderRadius: 20, padding: 24, alignItems: 'center' },
    uploadCardDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    uploadCardLight: { borderColor: '#E2E8F0', backgroundColor: '#fff' },
    centered: { alignItems: 'center', paddingVertical: 8 },
    processingText: { fontSize: 13, fontWeight: '600', color: '#A78BFA', marginTop: 16 },
    uploadIconActive: { backgroundColor: 'rgba(139,92,246,0.2)', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    fileName: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
    fileReady: { fontSize: 11, fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 1 },
    uploadIconEmpty: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    uploadPlaceholder: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    uploadSubtext: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
    subLabel: { fontSize: 12, fontWeight: '500', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
    difficultyCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardTitle: { fontSize: 14, fontWeight: '700' },
    cardDesc: { fontSize: 10, fontWeight: '500', color: '#64748b' },
    checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
    generateBtn: { borderRadius: 16, overflow: 'hidden' },
    generateBtnContent: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    btnText: { color: 'white', fontWeight: '900', fontSize: 16, marginLeft: 10 },
    costTextLower: { textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },
    loadingBanner: { borderTopWidth: 0, padding: 20, borderRadius: 24, borderWidth: 1 },
    stageText: { textAlign: 'center', fontWeight: '800', fontSize: 18, marginBottom: 4 },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
});
