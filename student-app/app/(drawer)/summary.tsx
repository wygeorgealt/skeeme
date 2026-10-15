import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Pressable, 
    ScrollView, 
    Alert, 
    StyleSheet, 
    TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { haptics } from '@/lib/haptics';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';
import { 
    AiSummary, 
    getStoredSummaries, 
    generateAiSummary, 
    deleteSummary 
} from '@/lib/summaryService';

const SUGGESTIONS = [
    'Physics: Motion & Force',
    'Cell Biology: Mitosis',
    'Macroeconomics: Inflation',
    'Calculus: Derivatives',
];

export default function SummaryScreen() {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const params = useLocalSearchParams<{ topic?: string }>();

    const [mode, setMode] = useState<'topic' | 'file'>('topic');
    const [topic, setTopic] = useState(params.topic || '');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewingSummary, setViewingSummary] = useState<AiSummary | null>(null);
    const [pastSummaries, setPastSummaries] = useState<AiSummary[]>([]);
    const [activeTab, setActiveTab] = useState<'notes' | 'mindmap'>('notes');

    const loadSummaries = useCallback(async () => {
        const stored = await getStoredSummaries();
        setPastSummaries(stored);
        if (stored.length > 0 && !viewingSummary && !topic) {
            // Default to most recent if available
            setViewingSummary(stored[0]);
        }
    }, [viewingSummary, topic]);

    useEffect(() => {
        loadSummaries();
    }, [loadSummaries]);

    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) {
            return Alert.alert('Required', 'Please enter a topic to summarize.');
        }
        if (mode === 'file' && !selectedFile) {
            return Alert.alert('Required', 'Please select a document to summarize.');
        }

        setIsLoading(true);
        try {
            await haptics.impactAsync();
            let extractedText: string | undefined = undefined;

            if (mode === 'file' && selectedFile) {
                try {
                    const fd = new FormData();
                    fd.append('file', {
                        uri: selectedFile.uri,
                        name: selectedFile.name || 'document',
                        type: selectedFile.mimeType || 'application/octet-stream',
                    } as any);
                    fd.append('type', 'summary');
                    const res = await api.post('files/extract', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    extractedText = res.data?.text || res.data?.extracted_text;
                } catch {
                    // Fall back cleanly if upload extraction endpoint is offline
                }
            }

            const targetTopic = mode === 'topic' ? topic : (selectedFile?.name || 'Document Summary');
            const summary = await generateAiSummary(targetTopic, extractedText);
            setViewingSummary(summary);
            await loadSummaries();
        } catch {
            Alert.alert('Error', 'Failed to generate summary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
            });
            if (!res.canceled && res.assets && res.assets[0]) {
                setSelectedFile(res.assets[0]);
            }
        } catch {
            Alert.alert('Error', 'Could not open document picker.');
        }
    };

    const handleDeleteSummary = async (id: string) => {
        await deleteSummary(id);
        if (viewingSummary?.id === id) {
            setViewingSummary(null);
        }
        await loadSummaries();
    };

    // ── VIEWING ACTIVE SUMMARY ──────────────────────────────────────────────────
    if (viewingSummary) {
        return (
            <View style={{ flex: 1, backgroundColor: C.background }}>
                <ScreenHeader 
                    title="Summary"
                    subtitle={viewingSummary.subtitle}
                    onBack={() => setViewingSummary(null)}
                    rightAction={
                        <TouchableOpacity
                            onPress={() => setViewingSummary(null)}
                            activeOpacity={0.7}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#e0edff',
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary }}>New</Text>
                        </TouchableOpacity>
                    }
                />

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 130 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Content Format Tabs */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Pressable
                            onPress={() => {
                                haptics.selectionAsync();
                                setActiveTab('notes');
                            }}
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 9,
                                borderRadius: 999,
                                backgroundColor: activeTab === 'notes' ? (isDark ? '#2C2C2E' : '#FFFFFF') : 'transparent',
                                borderWidth: 1,
                                borderColor: activeTab === 'notes' ? C.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                                shadowColor: '#000',
                                shadowOpacity: activeTab === 'notes' ? 0.06 : 0,
                                shadowRadius: 6,
                                elevation: activeTab === 'notes' ? 2 : 0,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'notes' ? C.primary : C.textSecondary }}>
                                Notes
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                haptics.selectionAsync();
                                setActiveTab('mindmap');
                            }}
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 9,
                                borderRadius: 999,
                                backgroundColor: activeTab === 'mindmap' ? (isDark ? '#2C2C2E' : '#FFFFFF') : 'transparent',
                                borderWidth: 1,
                                borderColor: activeTab === 'mindmap' ? C.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                                shadowColor: '#000',
                                shadowOpacity: activeTab === 'mindmap' ? 0.06 : 0,
                                shadowRadius: 6,
                                elevation: activeTab === 'mindmap' ? 2 : 0,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'mindmap' ? C.primary : C.textSecondary }}>
                                Mind Map
                            </Text>
                        </Pressable>
                    </View>

                    {activeTab === 'notes' ? (
                        <>
                            {/* Main Summary Card */}
                            <View 
                                style={{
                                    backgroundColor: isDark ? C.card : '#FFFFFF',
                                    borderRadius: 24,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 10,
                                    elevation: 2,
                                    marginBottom: 18,
                                }}
                            >
                                <Text style={{ fontSize: 15, lineHeight: 22, color: C.textSecondary, marginBottom: 16 }}>
                                    {viewingSummary.conceptText}
                                </Text>

                                <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 }}>
                                    Key Points
                                </Text>

                                <View style={{ gap: 10, marginBottom: 18 }}>
                                    {viewingSummary.keyPoints.map((point, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                                            <View 
                                                style={{ 
                                                    width: 6, 
                                                    height: 6, 
                                                    borderRadius: 3, 
                                                    backgroundColor: C.primary, 
                                                    marginTop: 7, 
                                                    flexShrink: 0 
                                                }} 
                                            />
                                            <Text style={{ fontSize: 14, lineHeight: 20, color: C.text, flex: 1 }}>
                                                {point}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Visual Diagram / Formula Box */}
                                {viewingSummary.mainFormula && (
                                    <View 
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFD',
                                            borderRadius: 18,
                                            padding: 16,
                                            borderWidth: 1,
                                            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E9ECEF',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
                                            {viewingSummary.mainFormula.variables.map((v, i) => (
                                                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                                                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSecondary }}>{v.label}</Text>
                                                    <Text style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>↓</Text>
                                                </View>
                                            ))}
                                        </View>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' }}>
                                            <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: 1.2, color: C.text }}>
                                                {viewingSummary.mainFormula.expression}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Important Formulas / Relationships Carousel */}
                            {viewingSummary.relatedFormulas && viewingSummary.relatedFormulas.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 }}>
                                        Important Formulas
                                    </Text>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                                    >
                                        {viewingSummary.relatedFormulas.map((rf, idx) => (
                                            <View 
                                                key={idx}
                                                style={{
                                                    width: 170,
                                                    backgroundColor: isDark ? C.card : '#FFFFFF',
                                                    borderRadius: 18,
                                                    padding: 16,
                                                    borderWidth: 1,
                                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                    justifyContent: 'space-between',
                                                    minHeight: 110,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.04,
                                                    shadowRadius: 6,
                                                    elevation: 1,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                    <View 
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            borderRadius: 10,
                                                            backgroundColor: C.surfaceLow,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Icon name="Zap" size={16} color="default" />
                                                    </View>
                                                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }} numberOfLines={1}>
                                                        {rf.title}
                                                    </Text>
                                                </View>
                                                <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSecondary }}>
                                                    {rf.expression}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </>
                    ) : (
                        /* Mind Map View */
                        <View style={{ gap: 14, marginBottom: 20 }}>
                            {(viewingSummary.mindmapNodes || []).map((node, i) => (
                                <View 
                                    key={i}
                                    style={{
                                        backgroundColor: isDark ? C.card : '#FFFFFF',
                                        borderRadius: 20,
                                        padding: 18,
                                        borderWidth: 1,
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                        flexDirection: 'row',
                                        alignItems: 'flex-start',
                                        gap: 14,
                                    }}
                                >
                                    <View 
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 14,
                                            backgroundColor: C.surfaceLow,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon name="Brain" size={20} color="default" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 }}>
                                            {node.title}
                                        </Text>
                                        <Text style={{ fontSize: 13, lineHeight: 18, color: C.textSecondary }}>
                                            {node.desc}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Follow-up Action Dock */}
                <View 
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingBottom: Math.max(insets.bottom, 16) + 8,
                        paddingTop: 12,
                        paddingHorizontal: 16,
                        backgroundColor: isDark ? 'rgba(18,18,18,0.92)' : 'rgba(255,255,255,0.92)',
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7',
                        flexDirection: 'row',
                        gap: 12,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            haptics.impactAsync();
                            router.push({
                                pathname: '/(drawer)/generate',
                                params: { topic: viewingSummary.title },
                            });
                        }}
                        style={{
                            flex: 1,
                            height: 52,
                            borderRadius: 16,
                            backgroundColor: '#007AFF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#007AFF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 4,
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Quiz Me</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            haptics.impactAsync();
                            router.push({
                                pathname: '/(drawer)/flashcards/create',
                                params: { topic: viewingSummary.title },
                            });
                        }}
                        style={{
                            flex: 1,
                            height: 52,
                            borderRadius: 16,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F0F3F8',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#D0D7DE',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: C.text, fontSize: 15, fontWeight: '700' }}>Make Flashcards</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // ── SUMMARY CREATOR & PAST SUMMARIES ───────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScreenHeader 
                title="AI Summary"
                onBack={() => {
                    if (router.canGoBack()) router.back();
                    else router.replace('/(drawer)' as any);
                }}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Source Selection Card */}
                <View 
                    style={{
                        backgroundColor: isDark ? C.card : '#FFFFFF',
                        borderRadius: 24,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        marginBottom: 20,
                    }}
                >
                    {/* Segmented Switcher */}
                    <View 
                        style={{
                            flexDirection: 'row',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0F2F6',
                            borderRadius: 14,
                            padding: 4,
                            marginBottom: 16,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                haptics.selectionAsync();
                                setMode('topic');
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: mode === 'topic' ? (isDark ? '#2C2C2E' : '#FFFFFF') : 'transparent',
                                shadowColor: '#000',
                                shadowOpacity: mode === 'topic' ? 0.05 : 0,
                                shadowRadius: 4,
                                elevation: mode === 'topic' ? 1 : 0,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: mode === 'topic' ? C.primary : C.textSecondary }}>
                                Input Topic
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                haptics.selectionAsync();
                                setMode('file');
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: mode === 'file' ? (isDark ? '#2C2C2E' : '#FFFFFF') : 'transparent',
                                shadowColor: '#000',
                                shadowOpacity: mode === 'file' ? 0.05 : 0,
                                shadowRadius: 4,
                                elevation: mode === 'file' ? 1 : 0,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: mode === 'file' ? C.primary : C.textSecondary }}>
                                Upload Notes
                            </Text>
                        </Pressable>
                    </View>

                    {mode === 'topic' ? (
                        <>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 8 }}>
                                Subject or Concept
                            </Text>
                            <TextInput
                                placeholder="e.g. Physics: Motion & Force, Cell Mitosis, Calculus..."
                                placeholderTextColor={C.textTertiary}
                                value={topic}
                                onChangeText={setTopic}
                                multiline
                                numberOfLines={3}
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    color: C.text,
                                    borderRadius: 16,
                                    padding: 14,
                                    fontSize: 15,
                                    minHeight: 80,
                                    textAlignVertical: 'top',
                                    borderWidth: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                                    marginBottom: 14,
                                }}
                            />

                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 8 }}>
                                Popular Topics
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                                {SUGGESTIONS.map((item) => (
                                    <Pressable
                                        key={item}
                                        onPress={() => {
                                            haptics.selectionAsync();
                                            setTopic(item);
                                        }}
                                        style={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 7,
                                            borderRadius: 999,
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F4F9',
                                            borderWidth: 1,
                                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary }}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    ) : (
                        <View style={{ marginBottom: 18 }}>
                            <TouchableOpacity
                                onPress={handlePickFile}
                                activeOpacity={0.7}
                                style={{
                                    padding: 20,
                                    borderRadius: 18,
                                    borderWidth: 1.5,
                                    borderStyle: 'dashed',
                                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                                    gap: 8,
                                }}
                            >
                                <Icon name="UploadCloud" size={28} color="default" />
                                <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>
                                    {selectedFile ? selectedFile.name : 'Tap to Upload PDF or Notes'}
                                </Text>
                                <Text style={{ fontSize: 12, color: C.textSecondary }}>
                                    {selectedFile ? `${Math.round((selectedFile.size || 0) / 1024)} KB` : 'Supports PDF, Word, TXT, Markdown'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Generate Button */}
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <AnimatedButton
                            title="Generate Summary"
                            onPress={handleGenerate}
                            loading={isLoading}
                            type="capsule"
                            backgroundColor="#007AFF"
                            shadowColor="#0066D6"
                            fullWidth
                        />
                    </View>
                </View>

                {/* Past Summaries Section */}
                {pastSummaries.length > 0 && (
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 }}>
                            Saved Summaries
                        </Text>
                        <View style={{ gap: 10 }}>
                            {pastSummaries.map((s) => (
                                <Pressable
                                    key={s.id}
                                    onPress={() => {
                                        haptics.selectionAsync();
                                        setViewingSummary(s);
                                    }}
                                    style={{
                                        backgroundColor: isDark ? C.card : '#FFFFFF',
                                        borderRadius: 18,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <View 
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                backgroundColor: C.surfaceLow,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Icon name="BookOpen" size={20} color="default" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }} numberOfLines={1}>
                                                {s.title}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }} numberOfLines={1}>
                                                {s.subtitle}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleDeleteSummary(s.id)}
                                        style={{ padding: 6 }}
                                    >
                                        <Icon name="Trash2" size={16} color="destructive" />
                                    </TouchableOpacity>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
