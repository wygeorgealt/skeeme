import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle, DocumentText, CloudUpload, Leaf, LightbulbBolt, Rocket, FolderOpen, AltArrowLeft } from '@solar-icons/react-native/Bold';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';
import React from 'react';

type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function GenerateFlashcardScreen() {
    const { user } = useAuthStore();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [cardCount, setCardCount] = useState('10');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);

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
                    Alert.alert('File too large', 'Please upload a file smaller than 5MB.');
                    return;
                }
                setSelectedFile(asset);
                setMode('file');
                setTopic('');
            }
        } catch {
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        
        // Safety Net Check
        if (!user?.is_unlimited && (user?.credits ?? 0) <= 0) {
            setShowOutOfCredits(true);
            return;
        }

        if (mode === 'file') {
            Alert.alert('Coming Soon', 'File-based flashcards are being optimized. Please use Topic for now.');
            return;
        }

        // Redirect to the viewer which will handle the stream
        router.push({
            pathname: '/flashcards/[id]',
            params: {
                id: 'new',
                topic: topic,
                card_count: cardCount,
                difficulty: difficulty
            }
        } as any);
    };

    const canGenerate = mode === 'topic' ? topic.trim().length > 0 : selectedFile !== null;

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ title: 'Create Deck', headerShown: false }} />
            
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
                                style={[s.segmentedOption, isSelected && s.segmentedOptionActive]}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.segmentedText, isSelected ? s.segmentedTextActive : { color: C.textSecondary }]}>
                                    {m === 'topic' ? 'Topic' : 'Document'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {mode === 'topic' ? (
                    <View style={[s.card, { backgroundColor: C.card }]}>
                        <View style={s.inputHeader}>
                            <LightbulbBolt size={18} color="#007AFF" />
                            <Text style={[s.inputLabel, { color: C.text }]}>What should we cover?</Text>
                        </View>
                        <TextInput
                            style={[s.topicInput, { color: C.text, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
                            placeholder="e.g. Photosynthesis, Civil Rights Movement..."
                            placeholderTextColor={C.textTertiary}
                            value={topic}
                            onChangeText={setTopic}
                            multiline
                        />
                        <View style={s.tipsContainer}>
                            <CheckCircle size={14} color="#34C759" />
                            <Text style={s.tipText}>Specific topics give better results</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity 
                        onPress={handleFileSelect}
                        activeOpacity={0.7}
                        style={[s.uploadCard, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                    >
                        {selectedFile ? (
                            <View style={s.fileSelectedContainer}>
                                <View style={s.fileIconBox}>
                                    <DocumentText size={32} color="#007AFF" />
                                </View>
                                <Text style={[s.fileName, { color: C.text }]} numberOfLines={1}>{selectedFile.name}</Text>
                                <Text style={s.fileSize}>{(selectedFile.size! / (1024 * 1024)).toFixed(2)} MB</Text>
                                <TouchableOpacity onPress={() => setSelectedFile(null)} style={s.removeFileBtn}>
                                    <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={s.uploadPrompt}>
                                <View style={s.uploadIconBox}>
                                    {isProcessingFile ? <LoadingSpinner size={24} color="#007AFF" /> : <CloudUpload size={28} color="#007AFF" />}
                                </View>
                                <Text style={[s.uploadTitle, { color: C.text }]}>Upload Study Material</Text>
                                <Text style={s.uploadSubtitle}>PDF, Word, or Text files (max 10MB)</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                <View style={s.settingsSection}>
                    <Text style={[s.sectionTitle, { color: C.textSecondary }]}>DECK SETTINGS</Text>
                    
                    {/* Card Count */}
                    <View style={[s.settingRow, { backgroundColor: C.card }]}>
                        <View style={s.settingInfo}>
                            <Rocket size={20} color="#FF9500" />
                            <Text style={[s.settingLabel, { color: C.text }]}>Cards</Text>
                        </View>
                        <View style={s.stepper}>
                            <TouchableOpacity 
                                onPress={() => setCardCount(Math.max(5, parseInt(cardCount) - 5).toString())}
                                style={s.stepBtn}
                            >
                                <Text style={s.stepBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={[s.stepValue, { color: C.text }]}>{cardCount}</Text>
                            <TouchableOpacity 
                                onPress={() => setCardCount(Math.min(50, parseInt(cardCount) + 5).toString())}
                                style={s.stepBtn}
                            >
                                <Text style={s.stepBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Difficulty */}
                    <View style={[s.settingRow, { backgroundColor: C.card, marginTop: 12 }]}>
                        <View style={s.settingInfo}>
                            <FolderOpen size={20} color="#5856D6" />
                            <Text style={[s.settingLabel, { color: C.text }]}>Depth</Text>
                        </View>
                        <View style={s.difficultyPills}>
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                                <TouchableOpacity 
                                    key={d}
                                    onPress={() => setDifficulty(d)}
                                    style={[s.diffPill, difficulty === d && { backgroundColor: '#007AFF', borderColor: '#007AFF' }]}
                                >
                                    <Text style={[s.diffPillText, difficulty === d && { color: '#FFF' }]}>
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={s.formFooter}>
                <View style={s.costInfo}>
                    <View style={s.costBadge}>
                        <Text style={s.costText}>Costs {cardCount} credits</Text>
                    </View>
                    <Text style={s.balanceText}>Balance: {user?.credits ?? 0}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleGenerate}
                    disabled={!canGenerate}
                    activeOpacity={0.8}
                    style={[s.generatePillButton, { backgroundColor: canGenerate ? '#007AFF' : (isDark ? '#2C2C2E' : '#E5E5EA') }]}
                >
                    <Text style={[s.generatePillText, { color: canGenerate ? '#FFF' : (isDark ? '#48484A' : '#A1A1A1') }]}>
                        Start Generating
                    </Text>
                </TouchableOpacity>
            </BlurView>

            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="flashcard" />
        </View>
    );
}

const s = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, zIndex: 10 },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    menuBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },
    segmentedControl: { flexDirection: 'row', padding: 6, borderRadius: 999, marginBottom: 24 },
    segmentedControlDark: { backgroundColor: 'rgba(255,255,255,0.05)' },
    segmentedControlLight: { backgroundColor: '#F1F5F9' },
    segmentedOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 999 },
    segmentedOptionActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    segmentedText: { fontSize: 14, fontWeight: '700' },
    segmentedTextActive: { color: '#000' },
    card: { borderRadius: 24, padding: 24, marginBottom: 24 },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    inputLabel: { fontSize: 16, fontWeight: '700' },
    topicInput: { height: 120, borderRadius: 16, borderWidth: 1, padding: 16, fontSize: 16, fontWeight: '500', textAlignVertical: 'top' },
    tipsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    tipText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
    uploadCard: { borderRadius: 24, padding: 32, marginBottom: 24, borderStyle: 'dashed', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    uploadPrompt: { alignItems: 'center' },
    uploadIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    uploadTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
    uploadSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
    fileSelectedContainer: { alignItems: 'center', width: '100%' },
    fileIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    fileName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    fileSize: { fontSize: 13, color: '#8E8E93', marginBottom: 16 },
    removeFileBtn: { padding: 8 },
    settingsSection: { gap: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginLeft: 4, marginBottom: 4 },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 20 },
    settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 16, fontWeight: '700' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    stepBtnText: { fontSize: 20, fontWeight: '700', color: '#007AFF' },
    stepValue: { fontSize: 17, fontWeight: '800', width: 24, textAlign: 'center' },
    difficultyPills: { flexDirection: 'row', gap: 8 },
    diffPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    diffPillText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 44 : 32, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    costInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    costBadge: { backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
    costText: { color: '#34C759', fontWeight: '800', fontSize: 12 },
    balanceText: { fontSize: 12, fontWeight: '700', color: '#8E8E93' },
    generatePillButton: { height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    generatePillText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
});
