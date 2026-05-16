import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, Animated, StyleSheet, Modal, Platform } from 'react-native';
import EventSource from 'react-native-sse';

import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ShareCard } from '@/components/ui/ShareCard';
import { generateQuizHTML } from '@/lib/pdfGenerator';
import { generateUUID } from '@/lib/utils';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';
import { posthog } from '@/lib/posthog';
import GlobalErrorModal from '@/components/GlobalErrorModal';

import { haptics } from '@/lib/haptics';
import { QuizMode, Difficulty, FormatType, Question } from '@/components/quiz/QuizTypes';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuizCelebration } from '@/components/quiz/QuizCelebration';

import {
    Leaf,
    LightbulbBolt,
    Fire,
    List,
    DocumentText,
    UsersGroupRounded,
    CheckCircle,
    CloseCircle,
    Lightbulb,
    Stopwatch,
    AltArrowRight,
    Share,
    InfoCircle,
    Danger,
    CloudUpload,
    FolderOpen,
    CupStar,
} from '@solar-icons/react-native/Bold';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// ── SKELETON COMPONENTS ──────────────────────────────────────────────────────
const SkeletonCard = ({ isDark }: { isDark: boolean }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={{ height: 40, width: '90%', backgroundColor: bgColor, borderRadius: 8, marginBottom: 12, opacity }} />
            <Animated.View style={{ height: 40, width: '70%', backgroundColor: bgColor, borderRadius: 8, marginBottom: 40, opacity }} />
            
            {[1, 2, 3, 4].map(i => (
                <Animated.View key={i} style={{ height: 64, width: '100%', backgroundColor: bgColor, borderRadius: 32, marginBottom: 12, opacity }} />
            ))}
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & OPTIONS
// ══════════════════════════════════════════════════════════════════════════════
const DIFFICULTY_OPTIONS = [
    { key: 'easy',   label: 'Easy',   Icon: Leaf,                  desc: 'Focus on fundamentals'    },
    { key: 'medium', label: 'Medium', Icon: LightbulbBolt,        desc: 'Comprehensive coverage'   },
    { key: 'hard',   label: 'Hard',   Icon: Fire,  desc: 'Deep analytical questions' },
];

const FORMAT_OPTIONS = [
    { key: 'mcq',    label: 'MCQ',    Icon: List,     desc: 'Multiple choice questions' },
    { key: 'theory', label: 'Theory', Icon: DocumentText, desc: 'Essay & analysis'           },
    { key: 'both',   label: 'Mixed',  Icon: UsersGroupRounded,        desc: 'Combination of both'        },
];

// Card shadow helper
const cardShadow = (C: typeof Colors.light) => ({
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: C.cardShadowColor,
    shadowOpacity: C.cardShadowOpacity,
    shadowRadius: C.cardShadowRadius,
    shadowOffset: C.cardShadowOffset,
    elevation: C.cardElevation,
});

const LOADING_STAGES_FILE = ['Skeeming...', 'Solving...', 'Extracting Context...', 'Generating Questions...', 'Almost Ready...'];
const LOADING_STAGES_TOPIC = ['Skeeming...', 'Solving...', 'Researching Topic...', 'Generating Questions...', 'Almost Ready...'];
const PROGRESS_STAGES = ['Skeeming', 'Extracting', 'Generating', 'Finalizing'];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function GenerateQuizScreen() {
    const { user, updateUser } = useAuthStore();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';
    const C = Colors[isDark ? 'dark' : 'light'];
    const navigation = useNavigation() as any;

    // Setup state
    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [questionCount, setQuestionCount] = useState('10');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [format, setFormat] = useState<FormatType>('mcq');
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timerMinutes, setTimerMinutes] = useState('10');

    // Quiz state
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [theoryResults, setTheoryResults] = useState<Record<number, boolean>>({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCelebration, setIsCelebration] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const viewShotRef = useRef<View>(null);

    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reward Modal State
    const [isSavingHistory, setIsSavingHistory] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [creditRefreshKey, setCreditRefreshKey] = useState(0);
    const [explanationQ, setExplanationQ] = useState<{ q: Question; qi: number; isCorrect: boolean } | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [extractionId, setExtractionId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Score calculations
    const correctCount = Object.entries(selectedAnswers).filter(([qi, ans]) => questions[+qi]?.correct_answer === ans).length
        + Object.values(theoryResults).filter(Boolean).length;
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // Read topic from scan route param
    const params = useLocalSearchParams<{ topic?: string }>();
    useEffect(() => {
        if (params.topic && questions.length === 0) {
            setTopic(params.topic);
            setMode('topic');
        }
    }, [params.topic]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const startTimer = useCallback((minutes: number) => {
        setTimeLeft(minutes * 60);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current!); Alert.alert("Time's Up!", "Your study session has ended."); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handleShare = async () => {
        if (!viewShotRef.current) return;
        setIsSharing(true);
        try {
            const uri = await captureRef(viewShotRef.current, { format: 'png', quality: 1.0 });
            await Sharing.shareAsync(uri);
        } catch (e) {
            if (__DEV__) console.error('Sharing failed', e);
            Alert.alert('Sharing failed', 'Could not generate result image.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleExportPDF = async () => {
        if (questions.length === 0) return;
        setIsExporting(true);
        try {
            const quizTitle = mode === 'topic' ? topic : (selectedFile?.name || 'Quiz');
            const questionsForExport = questions.map((q, qi) => {
                const isTheory = q.question_type === 'essay';
                const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                return {
                    question: q.question_text,
                    question_text: q.question_text,
                    type: q.question_type,
                    question_type: q.question_type,
                    options: q.options,
                    correct_answer: q.correct_answer || q.explanation || '',
                    user_answer: isTheory ? '(Theory Answer)' : selectedAnswers[qi],
                    is_correct: isCorrect,
                    explanation: q.explanation,
                };
            });
            const html = generateQuizHTML(quizTitle, percentage, questionsForExport);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            setIsExporting(false);
            await Sharing.shareAsync(uri);
        } catch (e) {
            setIsExporting(false);
            if (__DEV__) console.error('PDF Export failed', e);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            const onBeforeRemove = (e: any) => {
                if (questions.length === 0 || currentQIndex >= questions.length) {
                    return;
                }
                e.preventDefault();
                Alert.alert(
                    'Discard Quiz?',
                    'Leaving now will discard your current progress. This quiz will not be saved.',
                    [
                        { text: 'Stay', style: 'cancel', onPress: () => {} },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => navigation.dispatch(e.data.action),
                        },
                    ]
                );
            };

            navigation.addListener('beforeRemove', onBeforeRemove);
            return () => {
                navigation.removeListener('beforeRemove', onBeforeRemove);
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, [questions.length, currentQIndex, navigation])
    );

    // File picker
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
                    fd.append('type', 'quiz');
                    
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

    // Generate
    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        
        // Pre-flight check (Safety Net: allow if > 0)
        if (!user?.is_unlimited && (user?.credits ?? 0) <= 0) {
            setShowOutOfCredits(true);
            return;
        }

        setIsLoading(true);
        setLoadingStage(mode === 'file' ? 'Analyzing Document...' : 'Analyzing Topic...');
        setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); 
        setCurrentQIndex(0); setIsRevealed(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Stage cycling logic
        const stages = mode === 'file' ? LOADING_STAGES_FILE : LOADING_STAGES_TOPIC;
        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 4000);

        try {
            const token = useAuthStore.getState().token;
            const types = format === 'both' ? ['mcq', 'theory'] : [format === 'theory' ? 'theory' : 'mcq'];
            const idempotencyKey = generateUUID();
            const url = `${process.env.EXPO_PUBLIC_API_URL}quizzes/generate/stream`;
            let accumulatedJson = '';
            
            let es: EventSource;

            if (mode === 'file' && selectedFile) {
                if (extractionId) {
                    es = new EventSource(url, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Idempotency-Key': idempotencyKey,
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify({
                            topic: topic,
                            question_count: questionCount,
                            difficulty: difficulty,
                            question_types: types,
                            extraction_id: extractionId
                        })
                    } as any);
                } else {
                    const fd = new FormData();
                    fd.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'application/octet-stream' } as any);
                    fd.append('question_count', questionCount);
                    fd.append('difficulty', difficulty);
                    types.forEach((t, i) => fd.append(`question_types[${i}]`, t));
                    if (topic) fd.append('topic', topic);

                    es = new EventSource(url, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Idempotency-Key': idempotencyKey
                        },
                        method: 'POST',
                        body: fd
                    } as any);
                }
            } else {
                es = new EventSource(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Idempotency-Key': idempotencyKey,
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({ 
                        topic, 
                        question_count: parseInt(questionCount), 
                        question_types: types, 
                        difficulty 
                    }),
                } as any);
            }

            es.addEventListener('message', (event) => {
                if (event.data === '[DONE]') {
                    es.close();
                    finishGeneration(accumulatedJson);
                    clearInterval(stageInterval);
                    return;
                }

                try {
                    const chunk = JSON.parse(event.data || '{}');
                    if (chunk.type === 'status') {
                        setLoadingStage(chunk.message);
                    }
                    if (chunk.text) {
                        accumulatedJson += chunk.text;
                        // Partial parse to show questions early
                        try {
                            const partial = parsePartialJson(accumulatedJson);
                            if (partial) {
                                const qs = Array.isArray(partial) ? partial : (partial.questions || []);
                                if (qs.length > 0) setQuestions(qs);
                            }
                        } catch (e) {}
                    }
                    if (chunk.error) throw new Error(chunk.error);
                } catch (e) {}
            });

            es.addEventListener('error', (event: any) => {
                es.close();
                setIsLoading(false);
                clearInterval(stageInterval);
                
                if (event?.xhr?.status === 429 || event?.message?.includes('429')) {
                    useAuthStore.getState().toggleCooldownModal(true);
                    return;
                }
                
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

    const parsePartialJson = (json: string) => {
        try {
            let testJson = json.trim();
            // Remove markdown code blocks if present
            testJson = testJson.replace(/```(?:json)?|```/g, '').trim();
            
            if (!testJson.endsWith(']') && !testJson.endsWith('}')) {
                // Try to close an array
                if (testJson.startsWith('[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) {
                        testJson = testJson.substring(0, lastObjEnd + 1) + ']';
                    } else {
                        testJson += ']';
                    }
                } 
                // Try to close a "questions": [] object
                else if (testJson.includes('"questions":[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) {
                        testJson = testJson.substring(0, lastObjEnd + 1) + ']}';
                    } else {
                        testJson += ']}';
                    }
                }
            }
            return JSON.parse(testJson);
        } catch (e) {
            return null;
        }
    };

    const finishGeneration = async (fullJson: string) => {
        setIsLoading(false);
        try {
            const cleanJson = fullJson.replace(/```(?:json)?|```/g, '').trim();
            const data = JSON.parse(cleanJson);
            const questionsArr = Array.isArray(data) ? data : (data.questions || []);
            setQuestions(questionsArr);
            
            posthog.capture('quiz_generated_stream', { mode, difficulty, format });
            
            // Refresh user credits
            const userRes = await api.get('me');
            if (userRes.data) {
                updateUser(userRes.data);
                if (userRes.data.credits === 0 && !userRes.data.is_unlimited) {
                    setShowOutOfCredits(true);
                }
            }
            
            if (timerEnabled) startTimer(parseInt(timerMinutes) || 10);
            
            // Reset saved state for new quiz
            setIsSaved(false);
        } catch (e) {
            Alert.alert('Error', 'Failed to finalize quiz results.');
        }
    };

    const handleMCQAnswer = (qi: number, opt: string) => {
        setSelectedAnswers(p => ({ ...p, [qi]: opt }));
    };

    const handleTheoryGraded = (qi: number, passed: boolean) => {
        setTheoryResults(p => ({ ...p, [qi]: passed }));
    };

    const mcqAnswered = Object.keys(selectedAnswers).length;
    const theoryAnswered = Object.keys(theoryResults).length;
    const totalAnswered = mcqAnswered + theoryAnswered;

    const saveHistory = useCallback(async () => {
        if (questions.length === 0 || totalAnswered !== questions.length || isSaved || isSavingHistory) return;

        setIsSavingHistory(true);
        setSaveError(false);

        const timeSpent = timerEnabled ? ((parseInt(timerMinutes) || 10) * 60) - timeLeft : null;
        const payload = {
            topic: mode === 'topic' ? topic : (selectedFile?.name || 'File Upload'),
            difficulty,
            total_questions: questions.length,
            correct_answers: correctCount,
            score_percentage: (correctCount / questions.length) * 100,
            time_spent_seconds: timeSpent,
            questions: questions.map((q, qi) => {
                const isTheory = q.question_type === 'essay';
                const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                return {
                    question: q.question_text,
                    type: q.question_type,
                    options: q.options,
                    correct_answer: q.correct_answer || q.explanation || '',
                    user_answer: isTheory ? '(Theory Answer)' : selectedAnswers[qi],
                    is_correct: isCorrect,
                    explanation: q.explanation,
                };
            }),
        };

        try {
            const res = await api.post('quizzes/history', payload);
            setIsSaved(true);
            
            // RefreshCcw user stats for the dashboard
            const userRes = await api.get('me');
            if (userRes.data) {
                updateUser(userRes.data);
            }
        } catch (err) {
            if (__DEV__) console.warn('Failed to save quiz history', err);
            setSaveError(true);
        } finally {
            setIsSavingHistory(false);
        }
    }, [questions, totalAnswered, isSaved, isSavingHistory, mode, topic, selectedFile, difficulty, correctCount, theoryResults, selectedAnswers, timerEnabled, timerMinutes, timeLeft]);


    // Programmatic header and tab bar control
    useEffect(() => {
        const isQuizActive = (questions.length > 0 && currentQIndex < questions.length) || isLoading;
        
        navigation.setOptions({ 
            headerShown: false, // Always hide header in this screen as we have custom headers
            tabBarStyle: isQuizActive ? { display: 'none' } : undefined
        });

        // If it's a tab navigator, we might need to set it on the parent
        const parent = navigation.getParent();
        if (parent) {
            parent.setOptions({
                tabBarStyle: isQuizActive ? { display: 'none' } : undefined
            });
        }
    }, [questions.length, currentQIndex, isLoading, navigation]);

    // Prevent accidental exit
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            const isQuizActive = (questions.length > 0 && currentQIndex < questions.length) || isLoading;
            if (!isQuizActive) return;

            e.preventDefault();
            Alert.alert(
                'Discard Quiz?',
                'Leaving now will lose your progress. Are you sure?',
                [
                    { text: 'Stay', style: 'cancel' },
                    { 
                        text: 'Discard', 
                        style: 'destructive', 
                        onPress: () => {
                            // Reset state and allow navigation
                            setQuestions([]);
                            setIsLoading(false);
                            navigation.dispatch(e.data.action);
                        } 
                    }
                ]
            );
        });

        return unsubscribe;
    }, [navigation, questions.length, currentQIndex, isLoading]);

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0 && !isLoading) {
        const canGenerate = mode === 'topic' ? topic.trim().length > 0 : (selectedFile !== null && !isExtracting);
        const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';

        return (
            <View style={{ flex: 1, backgroundColor: C.background }}>
                {/* Header */}
                <View style={[sf.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={[sf.headerTitle, { color: C.text }]}>Build Quiz</Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Segmented Control */}
                    <View style={[sf.segCtrl, isDark ? sf.segCtrlDark : sf.segCtrlLight]}>
                        {(['topic', 'file'] as QuizMode[]).map(m => {
                            const isSelected = mode === m;
                            return (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                    style={[sf.segBtn, isSelected && (isDark ? sf.segBtnActiveDark : sf.segBtnActiveLight)]}
                                >
                                    <Text style={[sf.segText, { color: isSelected ? C.text : C.textTertiary, fontWeight: isSelected ? '700' : '500' }]}>
                                        {m === 'topic' ? 'By Topic' : 'From File'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Input */}
                    {mode === 'topic' ? (
                        <View style={[cardShadow(C), sf.inputCard]}>
                            <TextInput
                                style={[sf.textInput, { color: C.text }]}
                                placeholder="E.g. Cell Biology, World War II..."
                                placeholderTextColor={C.textTertiary}
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleFileSelect}
                            disabled={isProcessingFile}
                            activeOpacity={0.75}
                            style={[cardShadow(C), sf.uploadBox]}
                        >
                            {isProcessingFile ? (
                                <View style={sf.centered}>
                                    <LoadingSpinner size={32} />
                                    <Text style={[sf.uploadSub, { color: C.primary, marginTop: 10 }]}>Analyzing document...</Text>
                                </View>
                            ) : selectedFile ? (
                                <>
                                    <FolderOpen size={32} color={C.primary} />
                                    <Text style={[sf.uploadTitle, { color: C.text }]}>{selectedFile.name}</Text>
                                    {isExtracting ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <LoadingSpinner size={14} color={C.primary} />
                                            <Text style={[sf.uploadSub, { color: C.primary, marginLeft: 6 }]}>Extracting text...</Text>
                                        </View>
                                    ) : (
                                        <Text style={[sf.uploadSub, { color: '#34C759' }]}>Ready to generate</Text>
                                    )}
                                </>
                            ) : (
                                <>
                                    <CloudUpload size={32} color={C.textTertiary} />
                                    <Text style={[sf.uploadTitle, { color: C.text }]}>Tap to upload PDF or DOCX</Text>
                                    <Text style={[sf.uploadSub, { color: C.textTertiary }]}>Maximum 5MB</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Number of Questions */}
                    <Text style={[sf.sectionLabel, { color: C.textTertiary }]}>NUMBER OF QUESTIONS</Text>
                    <View style={[cardShadow(C), sf.stepperCard]}>
                        <Text style={[sf.stepperLabel, { color: C.text }]}>Questions</Text>
                        <View style={sf.stepperRow}>
                            <TouchableOpacity
                                style={[sf.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F0F2F7' }]}
                                onPress={() => setQuestionCount(prev => String(Math.max(10, parseInt(prev) - 5)))}
                            >
                                <Text style={[sf.stepperBtnText, { color: C.primary }]}>-</Text>
                            </TouchableOpacity>
                            <Text style={[sf.stepperValue, { color: C.text }]}>{questionCount}</Text>
                            <TouchableOpacity
                                style={[sf.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F0F2F7' }]}
                                onPress={() => setQuestionCount(prev => String(Math.min(30, parseInt(prev) + 5)))}
                            >
                                <Text style={[sf.stepperBtnText, { color: C.primary }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Difficulty */}
                    <Text style={[sf.sectionLabel, { color: C.textTertiary }]}>DIFFICULTY</Text>
                    <View style={[cardShadow(C), { marginBottom: 20 }]}>
                        {DIFFICULTY_OPTIONS.map((opt, index) => {
                            const isSelected = difficulty === opt.key;
                            const isLast = index === DIFFICULTY_OPTIONS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setDifficulty(opt.key as Difficulty)}
                                    activeOpacity={0.75}
                                    style={[
                                        sf.optRow,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[sf.optIcon, { backgroundColor: iconBg }]}>
                                        <opt.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[sf.optLabel, { color: C.text }]}>{opt.label}</Text>
                                        <Text style={[sf.optDesc, { color: C.textSecondary }]}>{opt.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Question Format */}
                    <Text style={[sf.sectionLabel, { color: C.textTertiary }]}>QUESTION FORMAT</Text>
                    <View style={[cardShadow(C), { marginBottom: 20}]}>
                        {FORMAT_OPTIONS.map((opt, index) => {
                            const isSelected = format === opt.key;
                            const isLast = index === FORMAT_OPTIONS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setFormat(opt.key as FormatType)}
                                    activeOpacity={0.75}
                                    style={[
                                        sf.optRow,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[sf.optIcon, { backgroundColor: iconBg }]}>
                                        <opt.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[sf.optLabel, { color: C.text }]}>{opt.label}</Text>
                                        <Text style={[sf.optDesc, { color: C.textSecondary }]}>{opt.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                </ScrollView>

                {/* Sticky Footer */}
                <BlurView
                    intensity={50}
                    tint={isDark ? 'dark' : 'light'}
                    style={[sf.footer, {
                        paddingBottom: Math.max(insets.bottom, 16) + 75,
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                    }]}
                >
                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!canGenerate}
                        activeOpacity={0.85}
                        style={[sf.generateBtn, { backgroundColor: canGenerate ? '#007AFF' : (isDark ? '#1E3A5F' : '#A2C9F4') }]}
                    >
                        <Text style={sf.generateBtnText}>Generate Quiz</Text>
                    </TouchableOpacity>
                </BlurView>

                <OutOfCreditsModal
                    visible={showOutOfCredits}
                    onDismiss={() => setShowOutOfCredits(false)}
                    featureAttempted="quiz"
                />

                <GlobalErrorModal 
                    visible={showErrorModal}
                    error={globalError}
                    onDismiss={() => setShowErrorModal(false)}
                />
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    if (isLoading || (questions.length > 0 && currentQIndex < questions.length)) {
        if (questions.length === 0) {
            return (
                <View style={{ flex: 1, backgroundColor: C.background }}>
                    {/* Header with back button to cancel */}
                    <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <TouchableOpacity 
                            onPress={() => { setIsLoading(false); }}
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <CloseCircle size={24} color={C.text} />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>{loadingStage || 'Skeeming...'}</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        <SkeletonCard isDark={isDark} />
                    </View>

                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Math.max(insets.bottom, 20), borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <View style={{ padding: 16 }}>
                            <View style={{ height: 56, borderRadius: 16, backgroundColor: isDark ? '#1E1E1E' : '#F2F2F7', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }}>
                                <LoadingSpinner size={20} color={C.textSecondary} />
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#8E8E93' }}>Generating Quiz...</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>
            );
        }

        const q = questions[currentQIndex];
        const isTheory = q.question_type === 'essay';
        const rawProgressPct = (currentQIndex / questions.length) * 100;
        const hasSelectedAction = isTheory ? theoryResults[currentQIndex] !== undefined : selectedAnswers[currentQIndex] !== undefined;

        const handleNextPress = async () => {
            haptics.impactAsync();
            if (!isRevealed && !isTheory) {
                // Reveal the answer logic for MCQ
                setIsRevealed(true);
            } else {
                // Move to next question or finish
                if (currentQIndex === questions.length - 1) {
                    // Manual submission before celebration
                    if (!isSaved && !isSavingHistory) {
                        await saveHistory();
                    }
                    setIsCelebration(true);
                } else {
                    setIsRevealed(false);
                    setCurrentQIndex(p => p + 1);
                }
            }
        };

        const handleRetake = () => {
            haptics.impactAsync();
            setSelectedAnswers({});
            setTheoryResults({});
            setCurrentQIndex(0);
            setIsRevealed(false);
            setIsCelebration(false);
            if (timerEnabled) startTimer(parseInt(timerMinutes));
        };

        if (isCelebration) {
            return (
                <QuizCelebration 
                    score={percentage}
                    isDark={isDark}
                    onShowResults={() => {
                        setIsCelebration(false);
                        setCurrentQIndex(questions.length); // Trigger results view
                    }}
                    onRetake={handleRetake}
                />
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                {/* Thin Progress line at safe area boundary */}
                <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                    <View style={{ width: '100%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <Animated.View style={{ width: `${rawProgressPct}%`, height: '100%', backgroundColor: '#007AFF' }} />
                    </View>
                </View>

                {/* Progress Text overlay */}
                <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#8E8E93', letterSpacing: -0.2 }}>
                        Q {currentQIndex + 1}/{questions.length}
                    </Text>
                    
                    {timerEnabled && timeLeft > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,59,48,0.1)' : '#FFF5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
                            <Stopwatch size={14} color={timeLeft < 60 ? '#FF3B30' : '#8E8E93'} />
                            <Text style={[{ fontSize: 13, fontWeight: '700', marginLeft: 4 }, timeLeft < 60 ? { color: '#FF3B30' } : { color: '#8E8E93' }]}>
                                {formatTime(timeLeft)}
                            </Text>
                        </View>
                    )}
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }} showsVerticalScrollIndicator={false}>
                    {/* Large Question Typography */}
                    <View style={{ marginBottom: 40, marginTop: 10 }}>
                        <Text style={{ fontSize: 32, fontWeight: '800', color: C.text, lineHeight: 42, letterSpacing: -0.5 }}>
                            {q.question_text}
                        </Text>
                    </View>

                    {/* Stacked Options */}
                    {!isTheory ? (
                        <View style={{ gap: 12 }}>
                            {q.options?.map((opt, oi) => {
                                const isSelected = selectedAnswers[currentQIndex] === opt;
                                const isCorrectOpt = opt === q.correct_answer;
                                const letters = ['A', 'B', 'C', 'D', 'E'];
                                const letter = letters[oi] || `${oi + 1}`;
                                
                                let bgColor = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
                                let borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                                let textColor = C.text;
                                let letterBg = isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9';
                                let letterColor = C.textSecondary;
                                let icon = null;

                                if (isRevealed) {
                                    if (isCorrectOpt) {
                                        borderColor = '#34C759';
                                        textColor = '#34C759';
                                        letterBg = 'rgba(52,199,89,0.1)';
                                        letterColor = '#34C759';
                                        icon = <CheckCircle size={20} color="#34C759" />;
                                    } else if (isSelected && !isCorrectOpt) {
                                        borderColor = '#FF3B30';
                                        textColor = '#FF3B30';
                                        letterBg = 'rgba(255,59,48,0.1)';
                                        letterColor = '#FF3B30';
                                        icon = <CloseCircle size={20} color="#FF3B30" />;
                                    }
                                } else if (isSelected) {
                                    borderColor = '#007AFF';
                                    textColor = '#007AFF';
                                    letterBg = '#007AFF';
                                    letterColor = '#FFFFFF';
                                }

                                return (
                                    <TouchableOpacity
                                        key={oi}
                                        activeOpacity={isRevealed ? 1 : 0.8}
                                        onPress={() => {
                                            if (!isRevealed) {
                                                haptics.selectionAsync();
                                                setSelectedAnswers(p => ({ ...p, [currentQIndex]: opt }));
                                            }
                                        }}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 100,
                                            backgroundColor: bgColor, borderWidth: 1, borderColor: borderColor,
                                            minHeight: 64, marginBottom: 4
                                        }}
                                    >
                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: letterBg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Text style={{ fontSize: 15, fontWeight: '800', color: letterColor }}>{letter}</Text>
                                        </View>
                                        <Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: textColor }}>{opt}</Text>
                                        <View style={{ marginRight: 8 }}>{icon}</View>
                                    </TouchableOpacity>
                                );
                            })}

                        </View>
                    ) : (
                        <TheoryCard key={currentQIndex} q={q} qi={currentQIndex} onGraded={(qi, correct) => {
                            setTheoryResults(p => ({ ...p, [qi]: correct }));
                        }} />
                    )}
                </ScrollView>

                {/* Redesigned Feedback Card & Next Button */}
                <BlurView 
                    intensity={80} 
                    tint={isDark ? 'dark' : 'light'} 
                    style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        paddingHorizontal: 20, 
                        paddingTop: 20, 
                        paddingBottom: Math.max(insets.bottom, 20),
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -10 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 20
                    }}
                >
                    {isRevealed && (() => {
                        const isCorrect = selectedAnswers[currentQIndex] === q.correct_answer;
                        let rawExpl = isCorrect ? (q.explanation_right || q.explanation) : (q.explanation_wrong || q.explanation);
                        let cleanExpl = rawExpl || `The correct answer is: ${q.correct_answer}.`;
                        
                        if (!q.explanation_right && !q.explanation_wrong) {
                            cleanExpl = cleanExpl.replace(/^(correct|perfect|yes|exactly|that is correct|right|spot on|exactly right|that's right|that's correct|you're right|exactly correct|spot on|correct answer|the correct answer is)[,!\.]?\s*/i, '');
                            cleanExpl = cleanExpl.charAt(0).toUpperCase() + cleanExpl.slice(1);
                        }

                        return (
                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isCorrect ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Lightbulb size={18} color={isCorrect ? '#34C759' : '#FF3B30'} />
                                    </View>
                                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '800', color: C.text }}>
                                        {isCorrect ? 'Spot on!' : 'Not quite!'}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22, fontWeight: '500' }}>
                                    {cleanExpl}
                                </Text>
                            </View>
                        );
                    })()}

                    <TouchableOpacity
                        disabled={!hasSelectedAction}
                        onPress={handleNextPress}
                        activeOpacity={0.8}
                        style={{
                            width: '100%', height: 64, borderRadius: 100, 
                            backgroundColor: hasSelectedAction ? '#007AFF' : (isDark ? '#2C2C2E' : '#E5E5EA'),
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: '#007AFF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: hasSelectedAction ? 0.3 : 0,
                            shadowRadius: 12,
                        }}
                    >
                        {isSavingHistory ? (
                            <LoadingSpinner size={24} color="white" />
                        ) : (
                            <Text style={{ color: hasSelectedAction ? 'white' : '#8E8E93', fontWeight: '800', fontSize: 18, letterSpacing: -0.2 }}>
                                {isTheory ? (currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question') : (!isRevealed ? 'Check Answer' : (currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'))}
                            </Text>
                        )}
                    </TouchableOpacity>
                </BlurView>
            </View>
        );
    }

    // ── RESULTS VIEW ────────────────────────────────────────────────────────────
    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "GENIUS!", subtitle: "You've completely mastered this topic!", icon: CupStar };
        if (pct >= 75) return { title: "WELL DONE!", subtitle: "Excellent performance, keep it up!", icon: CheckCircle };
        if (pct >= 50) return { title: "SOLID EFFORT!", subtitle: "Good job, but there's room to grow.", icon: InfoCircle };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: Danger };
    };
    const remark = getRemark(percentage);

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 280, paddingTop: insets.top + 20 }} showsVerticalScrollIndicator={false}>
                {/* Score Header Glass Card */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.resultsHeader}>
                    <View style={s.resultsIconBox}>
                        <remark.icon size={36} color={C.primary} />
                    </View>
                    <Text style={[s.resultsTitle, { color: C.primary }]}>{remark.title}</Text>
                    <Text style={[s.scoreValue, { color: C.text }]}>{percentage}%</Text>
                    <Text style={s.resultsSubtitle}>{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View style={s.resultsMeta}>
                        <View style={s.metaCard}>
                            <CheckCircle size={16} color="#4ADE80" />
                            <Text style={[s.metaText, { color: C.textSecondary }]}>{correctCount} OK</Text>
                        </View>
                        <View style={s.metaCard}>
                            <Stopwatch size={16} color={C.primary} />
                            <Text style={[s.metaText, { color: C.textSecondary }]}>
                                {timerEnabled ? formatTime(((parseInt(timerMinutes) || 10) * 60) - timeLeft) : 'No Timer'}
                            </Text>
                        </View>
                    </View>
                </BlurView>

                {/* Review List */}
                <Text style={s.sectionHeader}>Review Questions</Text>
                {questions.map((q, qi) => {
                    const isTheory = q.question_type === 'essay';
                    const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                    const canExplain = !isTheory;
                    return (
                        <TouchableOpacity
                            key={qi}
                            activeOpacity={canExplain ? 0.7 : 1}
                            onPress={() => canExplain && setExplanationQ({ q, qi, isCorrect })}
                        >
                            <BlurView 
                                intensity={10} 
                                tint={isDark ? "dark" : "light"} 
                                style={[s.reviewCard, isDark ? s.reviewCardDark : s.reviewCardLight]}
                            >
                                <View style={[s.reviewStatusBox, { backgroundColor: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                    {isCorrect ? (
                                        <CheckCircle size={18} color="#10b981" />
                                    ) : (
                                        <CloseCircle size={18} color="#ef4444" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.reviewQuestion, { color: C.text }]} numberOfLines={1}>{q.question_text}</Text>
                                    <Text style={s.reviewMeta} numberOfLines={1}>
                                        {isTheory ? (isCorrect ? 'Mastered' : 'Review Topic') : (isCorrect ? 'Correct · Tap to explain' : 'Incorrect · Tap to explain')}
                                    </Text>
                                </View>
                                {canExplain && (
                                    <AltArrowRight size={16} color={C.textTertiary} />
                                )}
                            </BlurView>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Hidden capture view for sharing */}
            <ShareCard
                type="quiz"
                data={{ 
                    topic: mode === 'topic' ? topic : (selectedFile?.name || 'File Upload'), 
                    score_percentage: percentage 
                }}
                viewShotRef={viewShotRef}
            />

            {/* Actions Footer */}
            <BlurView 
                intensity={50} 
                tint={isDark ? "dark" : "light"} 
                style={[s.footer, { 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: Math.max(insets.bottom, 16) + 75, 
                    paddingHorizontal: 24, 
                    borderTopWidth: 0,
                    backgroundColor: 'transparent'
                }]}
            >
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        style={[s.shareBtn, isDark ? s.shareBtnDark : s.shareBtnLight]}
                    >
                        {isSharing ? (
                            <LoadingSpinner size={24} color={C.primary} strokeWidth={3} />
                        ) : (
                            <>
                                <Share size={18} color={C.text} />
                                <Text style={[s.actionBtnText, { color: C.text }]}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        style={[s.exportBtn, { backgroundColor: C.primary }]}
                    >
                        <View style={s.exportBtnContent}>
                            {isExporting ? (
                                <LoadingSpinner size={24} color="white" strokeWidth={3} />
                            ) : (
                                <>
                                    <DocumentText size={18} color="white" />
                                    <Text style={s.exportBtnText}>Export</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

            </BlurView>

            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="quiz" />

            {/* Explanation Modal */}
            <Modal
                visible={explanationQ !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setExplanationQ(null)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={[
                        s.explanationSheet,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', paddingBottom: insets.bottom + 24 }
                    ]}>
                        {/* Handle */}
                        <View style={s.sheetHandle} />

                        {/* Header */}
                        <View style={s.sheetHeader}>
                            <View style={[
                                s.reviewStatusBox,
                                { backgroundColor: explanationQ?.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', marginRight: 0 }
                            ]}>
                                {explanationQ?.isCorrect ? (
                                    <CheckCircle size={18} color="#10b981" />
                                ) : (
                                    <CloseCircle size={18} color="#ef4444" />
                                )}
                            </View>
                            <Text style={[s.sheetTitle, { color: C.text }]} numberOfLines={2}>
                                {explanationQ?.q.question_text}
                            </Text>
                        </View>

                        {/* Correct Answer */}
                        {explanationQ?.q.correct_answer && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>CORRECT ANSWER</Text>
                                <View style={[s.sheetAnswerBox, { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }]}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#10b981' }}>
                                        {(() => {
                                            const options = explanationQ.q.options || [];
                                            const correctIdx = options.indexOf(explanationQ.q.correct_answer);
                                            const letter = ['A', 'B', 'C', 'D', 'E'][correctIdx];
                                            return letter ? `Option ${letter}: ${explanationQ.q.correct_answer}` : explanationQ.q.correct_answer;
                                        })()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Your Answer */}
                        {explanationQ && selectedAnswers[explanationQ.qi] && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>YOUR CHOICE</Text>
                                <View style={[
                                    s.sheetAnswerBox, 
                                    { 
                                        backgroundColor: explanationQ.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', 
                                        borderColor: explanationQ.isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' 
                                    }
                                ]}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: explanationQ.isCorrect ? '#10b981' : '#ef4444' }}>
                                        {(() => {
                                            const options = explanationQ.q.options || [];
                                            const userIdx = options.indexOf(selectedAnswers[explanationQ.qi]);
                                            const letter = ['A', 'B', 'C', 'D', 'E'][userIdx];
                                            return letter ? `Option ${letter}: ${selectedAnswers[explanationQ.qi]}` : selectedAnswers[explanationQ.qi];
                                        })()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Explanation */}
                        <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>EXPLANATION</Text>
                        <ScrollView style={s.explanationScroll} showsVerticalScrollIndicator={false}>
                            <Text style={[s.explanationText, { color: C.textSecondary }]}>
                                {(() => {
                                    if (!explanationQ) return '';
                                    const { q, isCorrect } = explanationQ;
                                    const targeted = isCorrect ? q.explanation_right : q.explanation_wrong;
                                    return targeted || q.explanation || 'No explanation was provided for this question.';
                                })()}
                            </Text>
                        </ScrollView>

                        {/* Close */}
                        <TouchableOpacity
                            onPress={() => setExplanationQ(null)}
                            activeOpacity={0.8}
                            style={[s.sheetCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' }]}
                        >
                            <Text style={[s.sheetCloseBtnText, { color: C.text }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    // ── Setup Layout Components ──
    segmentedControl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 24 },
    segmentedControlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segmentedControlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
    segmentBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segmentBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segmentText: { fontSize: 14, letterSpacing: -0.2 },
    
    card: { borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
    textInput: { fontSize: 16, fontWeight: '600', padding: 8 },
    
    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)' },
    uploadTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    uploadSub: { fontSize: 13, fontWeight: '500' },
    centered: { alignItems: 'center' },
    processingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },

    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, marginLeft: 8, color: '#94a3b8' },

    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },

    optionCard: { flexDirection: 'row', alignItems: 'center' },
    iconBoxRow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    optionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '500' },

    // Footer actions
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
    generatePillButton: { width: '100%', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    generatePillText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
    loadingContainer: { alignItems: 'center', paddingVertical: 12 },
    loadingText: { fontSize: 15, fontWeight: '700' },

    // Shared Styles
    header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
    menuBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F8FAFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    sectionHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },
    footer: { paddingVertical: 16 },

    // Quiz View
    quizHeader: { paddingTop: 60, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    quizHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, justifyContent: 'space-between' },
    quitBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    progressContainer: { flex: 1, alignItems: 'center' },
    progressText: { fontWeight: '900', fontSize: 17 },
    timerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
    timerDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    timerLight: { borderColor: '#E2E8F0', backgroundColor: '#fff' },
    timerCritical: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
    timerValue: { fontWeight: '700', fontSize: 12 },
    quizNumBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    quizNumText: { fontWeight: '600', fontSize: 13 },
    quizProgressLabel: { color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    // Results View
    resultsHeader: { borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(60,60,67,0.12)', padding: 32, alignItems: 'center', marginBottom: 32 },
    resultsIconBox: { width: 80, height: 80, backgroundColor: 'rgba(0,122,255,0.12)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,122,255,0.15)' },
    resultsTitle: { fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    scoreValue: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    resultsSubtitle: { color: '#64748b', fontWeight: '500', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 },
    resultsMeta: { flexDirection: 'row', marginTop: 32, gap: 12, width: '100%' },
    metaCard: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    metaText: { fontWeight: '700', fontSize: 12, marginLeft: 8 },
    reviewCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
    reviewCardDark: { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.05)' },
    reviewCardLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },
    reviewStatusBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    reviewQuestion: { fontWeight: '600', fontSize: 14 },
    reviewMeta: { color: '#64748b', fontSize: 11, fontWeight: '500', marginTop: 2 },
    shareBtn: { height: 52, borderRadius: 16, flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
    shareBtnDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' },
    shareBtnLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },
    exportBtn: { height: 52, overflow: 'hidden', borderRadius: 16, flex: 1 },
    exportBtnContent: { height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
    actionBtnText: { fontWeight: '700', fontSize: 15, marginLeft: 8 },
    returnBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    // Explanation Bottom Sheet
    explanationSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '80%' },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(120,120,128,0.3)', alignSelf: 'center', marginBottom: 20 },
    sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
    sheetTitle: { flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 22 },
    sheetSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
    sheetAnswerBox: { padding: 14, borderRadius: 14, borderWidth: 1 },
    explanationScroll: { maxHeight: 200, marginBottom: 20 },
    explanationText: { fontSize: 15, lineHeight: 24, fontWeight: '400' },
    sheetCloseBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    sheetCloseBtnText: { fontWeight: '700', fontSize: 16 },
});

// ── Setup Form StyleSheet (sf) ───────────────────────────────────────────────
const sf = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

    segCtrl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 20 },
    segCtrlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segCtrlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    segBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segText: { fontSize: 15 },

    inputCard: { paddingHorizontal: 16, paddingVertical: 4, marginBottom: 24 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500' },

    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 10, marginBottom: 24 },
    uploadTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    uploadSub: { fontSize: 13, textAlign: 'center' },
    centered: { alignItems: 'center' },

    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 5, marginBottom: 10, marginLeft: 4 },

    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 28 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    stepperBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 20, fontWeight: '800', minWidth: 32, textAlign: 'center' },

    optRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, minHeight: 64 },
    optIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optDesc: { fontSize: 13 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
    generateBtn: { width: '100%', height: 56, borderRadius: 100, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});