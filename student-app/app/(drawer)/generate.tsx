import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme, Animated, StyleSheet
} from 'react-native';
import { 
    Page, Upload, Sparks, Check, 
    NavArrowLeft, Timer, Settings, 
    ShareAndroid, Trophy, WarningTriangle,
    Notes, InfoCircle, Leaf, LightBulb, 
    Rocket, List, Group, CheckCircle,
    Download, Menu, Xmark
} from 'iconoir-react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { QuizShareCard } from '@/components/QuizShareCard';
import { RewardModal } from '@/components/RewardModal';
import { generateQuizHTML } from '@/lib/pdfGenerator';
import CreditStatusBar from '@/components/CreditStatusBar';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';

import { QuizMode, Difficulty, FormatType, Question } from '@/components/quiz/QuizTypes';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & OPTIONS
// ══════════════════════════════════════════════════════════════════════════════
const DIFFICULTY_OPTIONS = [
    { key: 'easy', label: 'Easy', icon: Leaf, desc: 'Focus on fundamentals' },
    { key: 'medium', label: 'Medium', icon: LightBulb, desc: 'Comprehensive coverage' },
    { key: 'hard', label: 'Hard', icon: Rocket, desc: 'Deep analytical questions' },
];

const FORMAT_OPTIONS = [
    { key: 'mcq', label: 'MCQ', icon: List, desc: 'Multiple choice questions' },
    { key: 'theory', label: 'Theory', icon: Notes, desc: 'Essay & analysis' },
    { key: 'both', label: 'Mixed', icon: Group, desc: 'Combination of both' },
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
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, [])
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
        const estimatedCost = parseInt(questionCount) || 10;
        if (!user?.is_unlimited && (user?.credits ?? 0) < estimatedCost) {
            setShowOutOfCredits(true);
            return;
        }

        setIsLoading(true);
        setLoadingStage(mode === 'file' ? 'Analyzing Document...' : 'Analyzing Topic...');
        setQuestions([]); setSelectedAnswers({}); setTheoryResults({});
        if (timerRef.current) clearInterval(timerRef.current);

        // Stage cycling logic
        const stages = mode === 'file' ? LOADING_STAGES_FILE : LOADING_STAGES_TOPIC;

        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 2500);

        try {
            const questionTypes = format === 'both' ? ['mcq', 'theory'] : [format === 'theory' ? 'theory' : 'mcq'];
            let response;
            if (mode === 'file' && selectedFile) {
                const fd = new FormData();
                fd.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'application/octet-stream' } as any);
                fd.append('question_count', questionCount);
                fd.append('difficulty', difficulty);
                questionTypes.forEach((t, i) => fd.append(`question_types[${i}]`, t));
                response = await api.post('quizzes/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await api.post('quizzes/generate', { topic, question_count: parseInt(questionCount), question_types: questionTypes, difficulty });
            }
            setQuestions(response.data.questions);
            if (response.data.remaining_credits !== undefined) {
                updateUser({ credits: response.data.remaining_credits });
                setCreditRefreshKey(k => k + 1);
            }
            if (timerEnabled) startTimer(parseInt(timerMinutes) || 10);
        } catch (e: any) {
            let msg = 'Something went wrong. Please try again.';
            const data = e.response?.data;

            if (data?.errors) {
                const firstKey = Object.keys(data.errors)[0];
                msg = data.errors[firstKey][0];
            } else if (data?.message) {
                msg = data.message;
            }

            if (e.response?.status === 403) {
                setShowOutOfCredits(true);
            } else {
                Alert.alert('Failed', msg);
            }
        } finally {
            clearInterval(stageInterval);
            setIsLoading(false);
            setLoadingStage('');
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
            
            // Refresh user stats for the dashboard
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
        
        return (
            <GlowBackground>
                {/* Header with drawer toggle */}
                <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                    <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>
                        Build Quiz
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Open Menu"
                        style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                    >
                        <Menu width={22} height={22} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
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
                                    style={[s.uploadBox, isDark ? s.uploadBoxDark : s.uploadBoxLight]}
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
                                <Text style={s.subLabel}>Number of Questions</Text>
                                <TextInput
                                    style={[s.input, isDark ? s.inputDark : s.inputLight]}
                                    keyboardType="number-pad" 
                                    value={questionCount} 
                                    onChangeText={setQuestionCount}
                                    onBlur={() => {
                                        const val = parseInt(questionCount);
                                        if (isNaN(val) || val < 10) setQuestionCount('10');
                                        else if (val > 30) setQuestionCount('30');
                                    }}
                                />
                            </View>

                            <Text style={s.subLabel}>Difficulty Level</Text>
                            <View style={{ marginBottom: 24 }}>
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        onPress={() => setDifficulty(opt.key as Difficulty)}
                                        activeOpacity={0.8}
                                        style={[s.difficultyCard, { 
                                            borderColor: difficulty === opt.key ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                                            backgroundColor: difficulty === opt.key ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)'
                                        }]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: difficulty === opt.key ? '#8B5CF6' : 'rgba(255,255,255,0.05)' }]}>
                                            <opt.icon width={18} height={18} color={difficulty === opt.key ? '#fff' : '#A78BFA'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[s.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>{opt.label}</Text>
                                            <Text style={s.cardDesc}>{opt.desc}</Text>
                                        </View>
                                        {difficulty === opt.key && (
                                            <CheckCircle width={18} height={18} color="#A78BFA" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={s.subLabel}>Question Format</Text>
                            <View>
                                {FORMAT_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        onPress={() => setFormat(opt.key as FormatType)}
                                        activeOpacity={0.8}
                                        style={[s.difficultyCard, { 
                                            borderColor: format === opt.key ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                                            backgroundColor: format === opt.key ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)'
                                        }]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: format === opt.key ? '#8B5CF6' : 'rgba(255,255,255,0.05)' }]}>
                                            <opt.icon width={18} height={18} color={format === opt.key ? '#fff' : '#A78BFA'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[s.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>{opt.label}</Text>
                                            <Text style={s.cardDesc}>{opt.desc}</Text>
                                        </View>
                                        {format === opt.key && (
                                            <CheckCircle width={18} height={18} color="#A78BFA" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </BlurView>

                    {/* Timer Glass Section */}
                    <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.sectionGlass}>
                        <View style={s.sectionContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <View style={{ flex: 1, marginRight: 16 }}>
                                    <Text style={[s.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Strict Timer</Text>
                                    <Text style={s.cardDesc}>Auto-submit when time expires</Text>
                                </View>
                                <TouchableOpacity onPress={() => setTimerEnabled(!timerEnabled)}
                                    style={[{ width: 48, height: 28, borderRadius: 14, justifyContent: 'center', padding: 4 }, { backgroundColor: timerEnabled ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0') }]}>
                                    <Animated.View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', transform: [{ translateX: timerEnabled ? 20 : 0 }] }} />
                                </TouchableOpacity>
                            </View>

                            {timerEnabled && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 }}>
                                    <TextInput
                                        style={[s.input, isDark ? s.inputDark : s.inputLight, { flex: 1 }]}
                                        keyboardType="number-pad" 
                                        value={timerMinutes} 
                                        onChangeText={setTimerMinutes} 
                                        placeholder="10" 
                                        placeholderTextColor="#94a3b8"
                                    />
                                    <Text style={[s.toggleText, { color: '#94a3b8', width: 48, textAlign: 'center' }]}>mins</Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </ScrollView>

                {/* Glassmorphic Sticky Footer */}
                <BlurView 
                    intensity={80} 
                    tint={isDark ? "dark" : "light"} 
                    style={[s.footer, { paddingBottom: insets.bottom || 24, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
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
                                    <Text style={s.btnText}>Generate Quiz</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={s.costText}>
                                Estimated Cost: {parseInt(questionCount) || 10} Credits | Max 5MB
                            </Text>
                        </>
                    ) : null}
                </BlurView>
            </GlowBackground>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    if (questions.length > 0 && totalAnswered < questions.length) {
        return (
            <GlowBackground>
                {/* Progress Header */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[s.quizHeader, { paddingTop: Math.max(insets.top, 8) }]}>
                    <View style={s.quizHeaderContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[s.quizNumBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                                <Text style={[s.quizNumText, { color: isDark ? '#fff' : '#0f172a' }]}>{totalAnswered + 1}</Text>
                            </View>
                            <Text style={s.quizProgressLabel}>Question {totalAnswered + 1} of {questions.length}</Text>
                        </View>
                        
                        {timerEnabled && timeLeft > 0 && (
                            <View style={[s.timerBadge, timeLeft < 60 ? s.timerCritical : (isDark ? s.timerDark : s.timerLight)]}>
                                <Text style={[s.timerValue, timeLeft < 60 ? { color: '#f87171' } : (isDark ? { color: '#cbd5e1' } : { color: '#475569' })]}>
                                    {formatTime(timeLeft)}
                                </Text>
                            </View>
                        )}
                    </View>
                </BlurView>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    {questions.map((q, qi) =>
                        q.question_type === 'multiple_choice' ? (
                            <MCQCard key={qi} q={q} qi={qi} onAnswer={handleMCQAnswer} selectedAnswer={selectedAnswers[qi]} quizFinished={false} />
                        ) : (
                            <TheoryCard key={qi} q={q} qi={qi} onGraded={handleTheoryGraded} />
                        )
                    )}
                </ScrollView>
            </GlowBackground>
        );
    }

    // ── RESULTS VIEW ────────────────────────────────────────────────────────────
    const percentage = Math.round((correctCount / questions.length) * 100);
    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "GENIUS!", subtitle: "You've completely mastered this topic!", icon: Trophy };
        if (pct >= 75) return { title: "WELL DONE!", subtitle: "Excellent performance, keep it up!", icon: CheckCircle };
        if (pct >= 50) return { title: "SOLID EFFORT!", subtitle: "Good job, but there's room to grow.", icon: InfoCircle };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: WarningTriangle };
    };
    const remark = getRemark(percentage);

    return (
        <GlowBackground>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160, paddingTop: insets.top + 20 }} showsVerticalScrollIndicator={false}>
                {/* Score Header Glass Card */}
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.resultsHeader}>
                    <View style={s.resultsIconBox}>
                        <remark.icon width={36} height={36} color="#A78BFA" />
                    </View>
                    <Text style={s.resultsTitle}>{remark.title}</Text>
                    <Text style={[s.scoreValue, { color: isDark ? '#fff' : '#0f172a' }]}>{percentage}%</Text>
                    <Text style={s.resultsSubtitle}>{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View style={s.resultsMeta}>
                        <View style={s.metaCard}>
                            <CheckCircle width={16} height={16} color="#4ADE80" />
                            <Text style={[s.metaText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{correctCount} OK</Text>
                        </View>
                        <View style={s.metaCard}>
                            <Timer width={16} height={16} color="#A78BFA" />
                            <Text style={[s.metaText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
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
                    return (
                        <BlurView 
                            key={qi} 
                            intensity={10} 
                            tint={isDark ? "dark" : "light"} 
                            style={[s.reviewCard, isDark ? s.reviewCardDark : s.reviewCardLight]}
                        >
                            <View style={[s.reviewStatusBox, { backgroundColor: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                {isCorrect ? (
                                    <Check width={18} height={18} color="#10b981" />
                                ) : (
                                    <Xmark width={18} height={18} color="#ef4444" />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.reviewQuestion, { color: isDark ? '#fff' : '#0f172a' }]} numberOfLines={1}>{q.question_text}</Text>
                                <Text style={s.reviewMeta} numberOfLines={1}>
                                    {isTheory ? (isCorrect ? "Mastered" : "Review Topic") : (isCorrect ? `Correct Answer` : `Missed Question`)}
                                </Text>
                            </View>
                        </BlurView>
                    );
                })}
            </ScrollView>

            {/* Hidden capture view for sharing */}
            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <View ref={viewShotRef} collapsable={false}>
                    <QuizShareCard
                        topic={mode === 'topic' ? topic : (selectedFile?.name || 'File Upload')}
                        percentage={percentage}
                    />
                </View>
            </View>

            {/* Actions Footer */}
            <BlurView 
                intensity={80} 
                tint={isDark ? "dark" : "light"} 
                style={[s.footer, { paddingBottom: insets.bottom || 24, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        style={[s.shareBtn, isDark ? s.shareBtnDark : s.shareBtnLight]}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#A78BFA" />
                        ) : (
                            <>
                                <ShareAndroid width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                                <Text style={[s.actionBtnText, { color: isDark ? '#fff' : '#0f172a' }]}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        style={s.exportBtn}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.exportBtnContent}
                        >
                            {isExporting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Page width={18} height={18} color="white" />
                                    <Text style={s.exportBtnText}>Export</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                    activeOpacity={0.8}
                    style={[s.returnBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}
                >
                    <Text style={[s.actionBtnText, { color: isDark ? '#fff' : '#0f172a' }]}>Return Home</Text>
                </TouchableOpacity>
            </BlurView>

            <RewardModal isVisible={isRewardModalVisible} onClose={() => setIsRewardModalVisible(false)} reward={rewardData} />
            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="quiz" />
        </GlowBackground>
    );
}

const s = StyleSheet.create({
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
    uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderRadius: 20, padding: 24, alignItems: 'center' },
    uploadBoxDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    uploadBoxLight: { borderColor: '#E2E8F0', backgroundColor: '#fff' },
    centered: { alignItems: 'center', paddingVertical: 8 },
    processingText: { fontSize: 13, fontWeight: '600', color: '#A78BFA', marginTop: 16 },
    uploadIconActive: { backgroundColor: 'rgba(139,92,246,0.2)', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    fileName: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
    fileReady: { fontSize: 11, fontWeight: '700', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 1 },
    uploadIconEmpty: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    uploadPlaceholder: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    uploadSubtext: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
    // Configuration
    subLabel: { fontSize: 12, fontWeight: '500', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
    difficultyCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardTitle: { fontSize: 14, fontWeight: '700' },
    cardDesc: { fontSize: 10, fontWeight: '500', color: '#64748b' },
    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
    generateBtn: { borderRadius: 16, overflow: 'hidden' },
    generateBtnContent: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    btnText: { color: '#fff', fontWeight: '900', fontSize: 15, marginLeft: 8 },
    costText: { textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },
    loadingBanner: { borderRadius: 28, padding: 20, borderWidth: 2, alignItems: 'center', overflow: 'hidden' },
    stageText: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4, textAlign: 'center' },

    // Shared Styles
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -1 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    sectionHeader: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },

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
    resultsHeader: { borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 32, alignItems: 'center', marginBottom: 32 },
    resultsIconBox: { width: 80, height: 80, backgroundColor: 'rgba(139,92,246,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
    resultsTitle: { color: '#A78BFA', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
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
});

