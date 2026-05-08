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
import { RewardModal } from '@/components/RewardModal';
import { generateQuizHTML } from '@/lib/pdfGenerator';
import { generateUUID } from '@/lib/utils';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';
import { posthog } from '@/lib/posthog';

import { haptics } from '@/lib/haptics';
import { QuizMode, Difficulty, FormatType, Question } from '@/components/quiz/QuizTypes';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { DocumentCodeIcon, Upload01Icon, CheckmarkCircle01Icon, Cancel01Icon, IdeaIcon, Timer01Icon, Tick01Icon, ArrowRight01Icon, Share01Icon, Leaf01Icon, FireIcon, ListViewIcon, UserGroupIcon, Medal01Icon, InformationCircleIcon, Alert01Icon } from '@hugeicons/core-free-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & OPTIONS
// ══════════════════════════════════════════════════════════════════════════════
const DIFFICULTY_OPTIONS = [
    { key: 'easy', label: 'Easy', icon: Leaf01Icon, desc: 'Focus on fundamentals' },
    { key: 'medium', label: 'Medium', icon: IdeaIcon, desc: 'Comprehensive coverage' },
    { key: 'hard', label: 'Hard', icon: FireIcon, desc: 'Deep analytical questions' },
];

const FORMAT_OPTIONS = [
    { key: 'mcq', label: 'MCQ', icon: ListViewIcon, desc: 'Multiple choice questions' },
    { key: 'theory', label: 'Theory', icon: DocumentCodeIcon, desc: 'Essay & analysis' },
    { key: 'both', label: 'Mixed', icon: UserGroupIcon, desc: 'Combination of both' },
];

const LOADING_STAGES_FILE = ['Analyzing Document...', 'Extracting Context...', 'Generating Questions...', 'Finalizing Quiz...', 'Almost Ready...'];
const LOADING_STAGES_TOPIC = ['Analyzing Topic...', 'Researching Context...', 'Generating Questions...', 'Finalizing Quiz...', 'Almost Ready...'];
const PROGRESS_STAGES = ['Analyzing', 'Extracting', 'Generating', 'Finalizing'];

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
    const [isSharing, setIsSharing] = useState(false);
    const viewShotRef = useRef<View>(null);

    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reward Modal State
    const [isSavingHistory, setIsSavingHistory] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [rewardData, setRewardData] = useState<any>(null);
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [creditRefreshKey, setCreditRefreshKey] = useState(0);
    const [explanationQ, setExplanationQ] = useState<{ q: Question; qi: number; isCorrect: boolean } | null>(null);

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
            await Sharing.shareAsync(uri);
        } catch (e) {
            if (__DEV__) console.error('PDF Export failed', e);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        } finally {
            setIsExporting(false);
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
                // Simulate quick extraction check/UI feedback
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

    // Generate
    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        
        // Pre-flight check
        const estimatedCost = 30; // Flat rate
        if (!user?.is_unlimited && (user?.credits ?? 0) < estimatedCost) {
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
            const questionTypes = format === 'both' ? ['mcq', 'theory'] : [format === 'theory' ? 'theory' : 'mcq'];
            const idempotencyKey = generateUUID();
            
            const url = `${process.env.EXPO_PUBLIC_API_URL}quizzes/generate/stream`;
            
            let accumulatedJson = '';
            
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
                        fd.append('question_count', questionCount);
                        fd.append('difficulty', difficulty);
                        questionTypes.forEach((t, i) => fd.append(`question_types[${i}]`, t));
                        return fd;
                      })()
                    : JSON.stringify({ 
                        topic, 
                        question_count: parseInt(questionCount), 
                        question_types: questionTypes, 
                        difficulty 
                      }),
            } as any);

            es.addEventListener('message', (event) => {
                if (event.data === '[DONE]') {
                    es.close();
                    finishGeneration(accumulatedJson);
                    clearInterval(stageInterval);
                    return;
                }

                try {
                    const chunk = JSON.parse(event.data || '{}');
                    if (chunk.text) {
                        accumulatedJson += chunk.text;
                        // Partial parse to show questions early
                        try {
                            const partial = parsePartialJson(accumulatedJson);
                            if (partial && partial.questions) {
                                setQuestions(partial.questions);
                            }
                        } catch (e) {}
                    }
                    if (chunk.error) throw new Error(chunk.error);
                } catch (e) {}
            });

            es.addEventListener('error', (event) => {
                es.close();
                setIsLoading(false);
                clearInterval(stageInterval);
                Alert.alert('Error', 'Streaming interrupted.');
            });

        } catch (e: any) {
            clearInterval(stageInterval);
            setIsLoading(false);
            Alert.alert('Error', 'Failed to start generation.');
        }
    };

    const parsePartialJson = (json: string) => {
        try {
            let testJson = json.trim();
            if (!testJson.endsWith(']}')) {
                if (testJson.includes('"questions":[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) {
                        testJson = testJson.substring(0, lastObjEnd + 1) + ']}';
                    } else {
                        testJson += ']}';
                    }
                } else {
                    testJson += '"}';
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
            setQuestions(data.questions || []);
            
            posthog.capture('quiz_generated_stream', { mode, difficulty, format });
            
            // Refresh user credits
            const userRes = await api.get('me');
            if (userRes.data) updateUser(userRes.data);
            
            if (timerEnabled) startTimer(parseInt(timerMinutes) || 10);
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
    const correctCount = Object.entries(selectedAnswers).filter(([qi, ans]) => questions[+qi]?.correct_answer === ans).length
        + Object.values(theoryResults).filter(Boolean).length;

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

            if (res.data.reward?.earned) {
                setRewardData(res.data.reward);
                setIsRewardModalVisible(true);
            }
        } catch (err) {
            if (__DEV__) console.warn('Failed to save quiz history', err);
            setSaveError(true);
        } finally {
            setIsSavingHistory(false);
        }
    }, [questions, totalAnswered, isSaved, isSavingHistory, mode, topic, selectedFile, difficulty, correctCount, theoryResults, selectedAnswers, timerEnabled, timerMinutes, timeLeft]);

    // Save quiz history
    useEffect(() => {
        if (questions.length > 0 && totalAnswered === questions.length && !isSaved && !isSavingHistory) {
            saveHistory();
        }
    }, [totalAnswered, questions, isSaved, isSavingHistory, saveHistory]);

    // Programmatic header control
    useEffect(() => {
        if (questions.length === 0) {
            navigation.setOptions({ headerShown: false });
        }
    }, [questions.length, navigation]);

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        const canGenerate = mode === 'topic' ? topic.trim().length > 0 : selectedFile !== null;
        const estimatedCost = parseInt(questionCount) || 10;
        
        return (
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                {/* Header */}
                <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                    <Text style={[s.headerTitle, { color: C.text }]}>
                        Build Quiz
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
                                    <LoadingSpinner size={32} />
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

                    {/* Number of Questions (Stepper) */}
                    <Text style={s.sectionTitle}>NUMBER OF QUESTIONS</Text>
                    <View style={[s.card, s.stepperCard, { backgroundColor: C.card }]}>
                        <Text style={[s.stepperLabel, { color: C.text }]}>Questions</Text>
                        <View style={s.stepperControls}>
                            <TouchableOpacity 
                                style={[s.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                                onPress={() => setQuestionCount(prev => String(Math.max(10, parseInt(prev) - 5)))}
                            >
                                <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>-</Text>
                            </TouchableOpacity>
                            <Text style={[s.stepperValue, { color: C.text }]}>{questionCount}</Text>
                            <TouchableOpacity 
                                style={[s.stepperBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                                onPress={() => setQuestionCount(prev => String(Math.min(30, parseInt(prev) + 5)))}
                            >
                                <Text style={[s.stepperBtnText, { color: '#007AFF' }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Difficulty */}
                    <Text style={s.sectionTitle}>DIFFICULTY</Text>
                    <View style={{ gap: 12, marginBottom: 24 }}>
                        {DIFFICULTY_OPTIONS.map(opt => {
                            const isSelected = difficulty === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setDifficulty(opt.key as Difficulty)}
                                    activeOpacity={0.8}
                                    style={[s.card, s.optionCard, { backgroundColor: C.card, borderColor: isSelected ? '#007AFF' : 'transparent', borderWidth: 2 }]}
                                >
                                    <View style={[s.iconBoxRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                        <HugeiconsIcon icon={opt.icon} size={18} color="#007AFF" />
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

                    {/* Format */}
                    <Text style={s.sectionTitle}>QUESTION FORMAT</Text>
                    <View style={{ gap: 12, marginBottom: 24 }}>
                        {FORMAT_OPTIONS.map(opt => {
                            const isSelected = format === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setFormat(opt.key as FormatType)}
                                    activeOpacity={0.8}
                                    style={[s.card, s.optionCard, { backgroundColor: C.card, borderColor: isSelected ? '#007AFF' : 'transparent', borderWidth: 2 }]}
                                >
                                    <View style={[s.iconBoxRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                        <HugeiconsIcon icon={opt.icon} size={18} color="#007AFF" />
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
                            <LoadingSpinner size={32} />
                            <Text style={[s.loadingText, { color: C.text, marginTop: 12 }]}>{loadingStage}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleGenerate}
                            disabled={!canGenerate}
                            activeOpacity={0.8}
                            style={[s.generatePillButton, { backgroundColor: canGenerate ? '#007AFF' : '#A2C9F4' }]}
                        >
                                <Text style={s.generatePillText}>
                                    Generate Quiz
                                </Text>
                        </TouchableOpacity>
                    )}
                </BlurView>
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    if (questions.length > 0 && currentQIndex < questions.length) {
        const q = questions[currentQIndex];
        const isTheory = q.question_type === 'essay';
        const rawProgressPct = (currentQIndex / questions.length) * 100;
        const hasSelectedAction = isTheory ? theoryResults[currentQIndex] !== undefined : selectedAnswers[currentQIndex] !== undefined;

        const handleNextPress = () => {
            haptics.impactAsync();
            if (!isRevealed && !isTheory) {
                // Reveal the answer logic for MCQ
                setIsRevealed(true);
            } else {
                // Move to next question
                setIsRevealed(false);
                setCurrentQIndex(p => p + 1);
            }
        };

        return (
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                {/* Thin Progress line at safe area boundary */}
                <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                    <View style={{ width: '100%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <Animated.View style={{ width: `${rawProgressPct}%`, height: '100%', backgroundColor: '#007AFF' }} />
                    </View>
                </View>

                {/* Progress Text overlay */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Question {currentQIndex + 1} of {questions.length}
                    </Text>
                    
                    {timerEnabled && timeLeft > 0 && (
                        <Text style={[{ fontSize: 13, fontWeight: '700' }, timeLeft < 60 ? { color: '#FF3B30' } : { color: '#8E8E93' }]}>
                            {formatTime(timeLeft)}
                        </Text>
                    )}
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
                    {/* Centered Large Question Card */}
                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, lineHeight: 32, textAlign: 'center' }}>
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
                                        icon = <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#34C759" />;
                                    } else if (isSelected && !isCorrectOpt) {
                                        borderColor = '#FF3B30';
                                        textColor = '#FF3B30';
                                        letterBg = 'rgba(255,59,48,0.1)';
                                        letterColor = '#FF3B30';
                                        icon = <HugeiconsIcon icon={Cancel01Icon} size={20} color="#FF3B30" />;
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
                                            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20,
                                            backgroundColor: bgColor, borderWidth: 1, borderColor: borderColor,
                                            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
                                        }}
                                    >
                                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: letterBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: letterColor }}>{letter}</Text>
                                        </View>
                                        <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: textColor }}>{opt}</Text>
                                        {icon}
                                    </TouchableOpacity>
                                );
                            })}

                            {isRevealed && (() => {
                                const isCorrect = selectedAnswers[currentQIndex] === q.correct_answer;
                                // Use targeted explanation if available, otherwise fallback to the unified one
                                let rawExpl = isCorrect 
                                    ? (q.explanation_right || q.explanation) 
                                    : (q.explanation_wrong || q.explanation);
                                
                                let cleanExpl = rawExpl || `The correct answer is: ${q.correct_answer}. Keep practicing!`;
                                
                                // Strip AI's baked-in affirmative prefixes if it's the old explanation field
                                if (!q.explanation_right && !q.explanation_wrong) {
                                    cleanExpl = cleanExpl.replace(/^(correct|perfect|yes|exactly|that is correct|right|spot on|exactly right|that's right|that's correct|you're right|exactly correct|spot on|correct answer|the correct answer is)[,!\.]?\s*/i, '');
                                    cleanExpl = cleanExpl.charAt(0).toUpperCase() + cleanExpl.slice(1);
                                }

                                return (
                                    <View style={{ marginTop: 16, marginBottom: 24, padding: 16, backgroundColor: isDark ? 'rgba(0,122,255,0.1)' : '#F0F8FF', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <HugeiconsIcon icon={IdeaIcon} size={20} color="#007AFF" />
                                            <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#007AFF' }}>
                                                {isCorrect ? 'Spot on! 🎉' : 'Nice try, but not quite! 🤔'}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 15, color: C.text, lineHeight: 22 }}>
                                            {cleanExpl}
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>
                    ) : (
                        <TheoryCard key={currentQIndex} q={q} qi={currentQIndex} onGraded={(qi, correct) => {
                            setTheoryResults(p => ({ ...p, [qi]: correct }));
                        }} />
                    )}
                </ScrollView>

                {/* Sticky Active Quiz Next Button */}
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 100 : 0} 
                    tint={isDark ? 'dark' : 'light'} 
                    style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        paddingHorizontal: 24, 
                        paddingTop: 16, 
                        paddingBottom: Math.max(insets.bottom, 16) + 75, 
                        borderTopWidth: 1, 
                        borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        backgroundColor: isDark 
                            ? (Platform.OS === 'android' ? '#1C1C1E' : 'rgba(28,28,30,0.8)') 
                            : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
                    }}
                >
                    <TouchableOpacity
                        disabled={!hasSelectedAction}
                        onPress={handleNextPress}
                        activeOpacity={0.8}
                        style={{
                            width: '100%', height: 56, borderRadius: 100, 
                            backgroundColor: hasSelectedAction ? '#007AFF' : (isDark ? '#2C2C2E' : '#E5E5EA'),
                            alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Text style={{ color: hasSelectedAction ? 'white' : '#8E8E93', fontWeight: '700', fontSize: 16, letterSpacing: -0.2 }}>
                            {isTheory ? (currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question') : (!isRevealed ? 'Check Answer' : (currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'))}
                        </Text>
                    </TouchableOpacity>
                </BlurView>
            </View>
        );
    }

    // ── RESULTS VIEW ────────────────────────────────────────────────────────────
    const percentage = Math.round((correctCount / questions.length) * 100);
    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "GENIUS!", subtitle: "You've completely mastered this topic!", icon: Medal01Icon };
        if (pct >= 75) return { title: "WELL DONE!", subtitle: "Excellent performance, keep it up!", icon: CheckmarkCircle01Icon };
        if (pct >= 50) return { title: "SOLID EFFORT!", subtitle: "Good job, but there's room to grow.", icon: InformationCircleIcon };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: Alert01Icon };
    };
    const remark = getRemark(percentage);

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160, paddingTop: insets.top + 20 }} showsVerticalScrollIndicator={false}>
                {/* Score Header Glass Card */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.resultsHeader}>
                    <View style={s.resultsIconBox}>
                        <HugeiconsIcon icon={remark.icon} size={36} color={C.primary} />
                    </View>
                    <Text style={[s.resultsTitle, { color: C.primary }]}>{remark.title}</Text>
                    <Text style={[s.scoreValue, { color: C.text }]}>{percentage}%</Text>
                    <Text style={s.resultsSubtitle}>{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View style={s.resultsMeta}>
                        <View style={s.metaCard}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="#4ADE80" />
                            <Text style={[s.metaText, { color: C.textSecondary }]}>{correctCount} OK</Text>
                        </View>
                        <View style={s.metaCard}>
                            <HugeiconsIcon icon={Timer01Icon} size={16} color={C.primary} />
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
                                        <HugeiconsIcon icon={Tick01Icon} size={18} color="#10b981" />
                                    ) : (
                                        <HugeiconsIcon icon={Cancel01Icon} size={18} color="#ef4444" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.reviewQuestion, { color: C.text }]} numberOfLines={1}>{q.question_text}</Text>
                                    <Text style={s.reviewMeta} numberOfLines={1}>
                                        {isTheory ? (isCorrect ? 'Mastered' : 'Review Topic') : (isCorrect ? 'Correct · Tap to explain' : 'Incorrect · Tap to explain')}
                                    </Text>
                                </View>
                                {canExplain && (
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={C.textTertiary} />
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
                intensity={Platform.OS === 'ios' ? 100 : 0} 
                tint={isDark ? "dark" : "light"} 
                style={[s.footer, { 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: Math.max(insets.bottom, 16) + 75, 
                    paddingHorizontal: 24, 
                    borderTopWidth: 1,
                    borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    backgroundColor: isDark 
                        ? (Platform.OS === 'android' ? '#121212' : 'rgba(18,18,18,0.8)') 
                        : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
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
                                <HugeiconsIcon icon={Share01Icon} size={18} color={C.text} />
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
                                    <HugeiconsIcon icon={DocumentCodeIcon} size={18} color="white" />
                                    <Text style={s.exportBtnText}>Export</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                    activeOpacity={0.8}
                    style={[s.returnBtn, { backgroundColor: isDark ? C.card : '#F2F2F7' }]}
                >
                    <Text style={[s.actionBtnText, { color: C.text }]}>Return Home</Text>
                </TouchableOpacity>
            </BlurView>

            <RewardModal isVisible={isRewardModalVisible} onClose={() => setIsRewardModalVisible(false)} reward={rewardData} />
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
                                    <HugeiconsIcon icon={Tick01Icon} size={18} color="#10b981" />
                                ) : (
                                    <HugeiconsIcon icon={Cancel01Icon} size={18} color="#ef4444" />
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
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
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

