import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme, Animated
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
                <View style={{ paddingTop: Math.max(insets.top, 8) }} className="px-5 pb-4 flex-row items-center justify-between">
                    <Text className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Build Quiz
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        activeOpacity={0.7}
                        className={`size-10 rounded-xl items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                    >
                        <Menu width={22} height={22} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={{ flex: 1 }} 
                    contentContainerStyle={{ padding: 24, paddingBottom: 160, paddingTop: 10 }} 
                    showsVerticalScrollIndicator={false}
                >
                    {/* Source Selector */}
                    <View className={`flex-row ${isDark ? 'bg-[#13151B]' : 'bg-slate-100'} rounded-xl p-1 mb-6 border ${isDark ? 'border-transparent' : 'border-slate-100'}`}>
                        {(['topic', 'file'] as QuizMode[]).map(m => (
                            <TouchableOpacity 
                                key={m} 
                                onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                className={`flex-1 items-center justify-center py-3 rounded-lg ${mode === m ? (isDark ? 'bg-white/10 shadow-sm' : 'bg-white shadow-sm') : ''}`}
                            >
                                <Text className={`font-semibold text-[13px] capitalize ${mode === m ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Source Input */}
                    <View className="mb-6">
                        {mode === 'topic' ? (
                            <>
                                <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Topic</Text>
                                <TextInput
                                    className={`h-[52px] ${isDark ? 'bg-[#13151B] border-transparent text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-xl px-5 text-[15px] font-medium`}
                                    placeholder="e.g. Nigerian History, Algebra..."
                                    placeholderTextColor="#94a3b8"
                                    value={topic}
                                    onChangeText={setTopic}
                                />
                            </>
                        ) : (
                            <>
                                <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Document</Text>
                                <TouchableOpacity
                                    onPress={handleFileSelect}
                                    disabled={isProcessingFile}
                                    activeOpacity={0.7}
                                    className={`border-2 border-dashed ${isDark ? 'border-transparent bg-[#13151B]' : 'border-slate-200 bg-white'} rounded-xl p-6 items-center`}
                                >
                                    {isProcessingFile ? (
                                        <View className="items-center py-2">
                                            <ActivityIndicator size="small" color="#8B5CF6" />
                                            <Text className="text-[13px] font-medium text-brand-primary mt-4">Analyzing document...</Text>
                                        </View>
                                    ) : selectedFile ? (
                                        <>
                                            <View className="bg-brand-primary/10 w-12 h-12 rounded-lg items-center justify-center mb-4">
                                                <Page width={18} height={18} color="#8B5CF6" />
                                            </View>
                                            <Text className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'} text-center mb-1`}>{selectedFile.name}</Text>
                                            <Text className="text-[11px] font-medium text-brand-primary uppercase tracking-wider">Ready to generate</Text>
                                        </>
                                    ) : (
                                        <>
                                            <View className={`w-12 h-12 rounded-lg items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                                <Upload width={18} height={18} color={isDark ? '#cbd5e1' : '#94a3b8'} />
                                            </View>
                                            <Text className={`text-[14px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Tap to upload PDF/DOCX</Text>
                                            <Text className="text-[11px] font-medium text-slate-400">max 5MB • extractable text</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Question Count */}
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Total Questions</Text>
                    <TextInput
                        className={`h-[52px] ${isDark ? 'bg-[#13151B] border-transparent text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-xl px-5 text-[15px] font-medium mb-6`}
                        keyboardType="number-pad" 
                        value={questionCount} 
                        onChangeText={setQuestionCount}
                    />

                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Difficulty</Text>
                    <View className="gap-3 mb-6">
                        {DIFFICULTY_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setDifficulty(opt.key as Difficulty)}
                                activeOpacity={0.8}
                                className={`flex-row items-center p-4 rounded-xl border-[1.5px] ${
                                    difficulty === opt.key
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : isDark ? 'border-transparent bg-[#13151B]' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${
                                    difficulty === opt.key ? 'bg-brand-primary' : isDark ? 'bg-white/5' : 'bg-slate-50'
                                }`}>
                                    <opt.icon width={18} height={18} color={difficulty === opt.key ? '#fff' : '#8B5CF6'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.label}</Text>
                                    <Text className="text-[11px] font-medium text-slate-400">{opt.desc}</Text>
                                </View>
                                {difficulty === opt.key && (
                                    <CheckCircle width={18} height={18} color="#8B5CF6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Format</Text>
                    <View className="gap-3 mb-6">
                        {FORMAT_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setFormat(opt.key as FormatType)}
                                activeOpacity={0.8}
                                className={`flex-row items-center p-4 rounded-xl border-[1.5px] ${
                                    format === opt.key
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : isDark ? 'border-transparent bg-[#13151B]' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${
                                    format === opt.key ? 'bg-brand-primary' : isDark ? 'bg-white/5' : 'bg-slate-50'
                                }`}>
                                    <opt.icon width={18} height={18} color={format === opt.key ? '#fff' : '#8B5CF6'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.label}</Text>
                                    <Text className="text-[11px] font-medium text-slate-400">{opt.desc}</Text>
                                </View>
                                {format === opt.key && (
                                    <CheckCircle width={18} height={18} color="#8B5CF6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Timer Toggle */}
                    <View className={`flex-row justify-between items-center p-4 rounded-xl border-[1.5px] ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100'} mb-4`}>
                        <View className="flex-1 mr-4">
                            <Text className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Strict Timer</Text>
                            <Text className="text-[11px] font-medium text-slate-400 mt-0.5">Auto-submit when time expires</Text>
                        </View>
                        <TouchableOpacity onPress={() => setTimerEnabled(!timerEnabled)}
                            className={`w-12 h-7 rounded-full justify-center p-1 transition-colors ${timerEnabled ? 'bg-brand-primary' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}>
                            <Animated.View className="w-5 h-5 rounded-full bg-white shadow-sm" style={{ transform: [{ translateX: timerEnabled ? 20 : 0 }] }} />
                        </TouchableOpacity>
                    </View>

                    {timerEnabled && (
                        <View className="flex-row items-center mb-6 gap-3">
                            <TextInput
                                className={`flex-1 h-[52px] ${isDark ? 'bg-[#13151B] border-transparent text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-xl px-5 text-[15px] font-medium`}
                                keyboardType="number-pad" 
                                value={timerMinutes} 
                                onChangeText={setTimerMinutes} 
                                placeholder="10" 
                                placeholderTextColor="#94a3b8"
                            />
                            <Text className="font-semibold text-slate-400 text-[13px] w-12 text-center">mins</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Glassmorphic Sticky Footer */}
                <BlurView 
                    intensity={80} 
                    tint={isDark ? "dark" : "light"} 
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom || 24, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                >
                    {isLoading ? (
                        <View className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-[28px] p-5 border-2 border-brand-primary/20 items-center overflow-hidden">
                            <View className="mb-4">
                                <ActivityIndicator size="small" color="#8B5CF6" />
                            </View>
                            <Text className="text-brand-primary font-black text-lg tracking-tight mb-1 text-center">{loadingStage}</Text>
                            <Text className="text-slate-500 dark:text-slate-400 font-medium text-[11px] text-center px-2">
                                Usually takes 15-30s.
                            </Text>
                            <View className="flex-row gap-1.5 mt-4 w-full px-2">
                                {PROGRESS_STAGES.map((s, i) => {
                                    const stages = mode === 'file' ? LOADING_STAGES_FILE : LOADING_STAGES_TOPIC;
                                    const currentIdx = stages.indexOf(loadingStage);
                                    const isComplete = i < currentIdx;
                                    const isActive = i === currentIdx;
                                    return (
                                        <View key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                            {(isComplete || isActive) && (
                                                <View className={`h-full ${isComplete ? 'bg-brand-primary' : 'bg-brand-primary/60'}`} style={{ width: isComplete ? '100%' : '60%' }} />
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
                                className="bg-[#8B5CF6] rounded-xl py-4 items-center flex-row justify-center shadow-lg shadow-[#8B5CF6]/20"
                                activeOpacity={0.8}
                            >
                                <Sparks width={18} height={18} color="#fff" />
                                <Text className="text-white font-black ml-2 text-[15px]">Generate Quiz</Text>
                            </TouchableOpacity>
                            <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">
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
            <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
                {/* Quiz header managed by navigation */}

                {/* Progress Header */}
                <View className={`px-5 py-4 flex-row items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Text className={`font-semibold text-[12px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalAnswered + 1}</Text>
                        </View>
                        <Text className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Question of {questions.length}</Text>
                    </View>
                    
                    {timerEnabled && timeLeft > 0 && (
                        <View className={`px-3 py-1.5 rounded-lg border ${timeLeft < 60 ? 'border-red-500 bg-red-500/5' : (isDark ? 'border-slate-800 bg-[#161618]' : 'border-slate-100 bg-white')}`}>
                            <Text className={`font-semibold text-[12px] ${timeLeft < 60 ? 'text-red-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                {formatTime(timeLeft)}
                            </Text>
                        </View>
                    )}
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    {questions.map((q, qi) =>
                        q.question_type === 'multiple_choice' ? (
                            <MCQCard key={qi} q={q} qi={qi} onAnswer={handleMCQAnswer} selectedAnswer={selectedAnswers[qi]} quizFinished={false} />
                        ) : (
                            <TheoryCard key={qi} q={q} qi={qi} onGraded={handleTheoryGraded} />
                        )
                    )}
                </ScrollView>
            </View>
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
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            {/* Results header managed by navigation */}

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 150 }}>
                {/* Score Header */}
                <View className="items-center py-8">
                    <View className="w-20 h-20 bg-brand-primary/10 rounded-xl items-center justify-center mb-5">
                        <remark.icon width={40} height={40} color="#8B5CF6" />
                    </View>
                    <Text className="text-brand-primary font-bold text-[12px] uppercase tracking-widest mb-2">{remark.title}</Text>
                    <Text className={`text-[36px] font-semibold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{percentage}%</Text>
                    <Text className="text-slate-500 font-medium text-[14px] mt-2 text-center px-4">{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View className="flex-row mt-6 gap-3">
                        <View className={`px-4 py-2 rounded-lg flex-row items-center border ${isDark ? 'bg-[#161618] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <CheckCircle width={16} height={16} color="#4ADE80" />
                            <Text className={`font-semibold text-[12px] ml-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{correctCount} Correct</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-lg flex-row items-center border ${isDark ? 'bg-[#161618] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <Timer width={16} height={16} color="#6366f1" />
                            <Text className={`font-semibold text-[12px] ml-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {timerEnabled ? formatTime(((parseInt(timerMinutes) || 10) * 60) - timeLeft) : 'No Timer'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Review List */}
                <Text className={`text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1`}>Review Questions</Text>
                {questions.map((q, qi) => {
                    const isTheory = q.question_type === 'essay';
                    const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                    return (
                        <View key={qi} className={`p-4 rounded-xl border mb-3 flex-row items-center ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}>
                            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-4 ${isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                {isCorrect ? (
                                    <Check width={18} height={18} color="#10b981" />
                                ) : (
                                    <Xmark width={18} height={18} color="#ef4444" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className={`font-semibold text-[13px] ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{q.question_text}</Text>
                                <Text className="text-slate-400 text-[11px] mt-0.5" numberOfLines={1}>
                                    {isTheory ? (isCorrect ? "Mastered" : "Review Topic") : (isCorrect ? `Correct Answer` : `Missed Question`)}
                                </Text>
                            </View>
                        </View>
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
            <View className={`absolute bottom-0 left-0 right-0 p-5 pb-8 border-t ${isDark ? 'bg-[#0f0f11]/95 border-slate-800' : 'bg-white/95 border-slate-100'}`}>
                <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        className={`h-[48px] rounded-xl flex-1 items-center justify-center flex-row border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        ) : (
                            <>
                                <ShareAndroid width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                                <Text className={`font-bold text-[15px] ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        className="h-[48px] bg-brand-primary rounded-xl flex-1 items-center justify-center flex-row"
                    >
                        {isExporting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Page width={18} height={18} color="white" />
                                <Text className="text-white font-bold text-[15px] ml-2">Export</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                    activeOpacity={0.8}
                    className={`h-[48px] rounded-xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                >
                    <Text className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Return Home</Text>
                </TouchableOpacity>
            </View>

            <RewardModal isVisible={isRewardModalVisible} onClose={() => setIsRewardModalVisible(false)} reward={rewardData} />
            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="quiz" />
        </View>
    );
}

