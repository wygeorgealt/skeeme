import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, Stack, useLocalSearchParams } from 'expo-router';
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
        const stages = mode === 'file'
            ? ['Analyzing Document...', 'Extracting Context...', 'Generating Questions...', 'Finalizing Quiz...', 'Almost Ready...']
            : ['Analyzing Topic...', 'Researching Context...', 'Generating Questions...', 'Finalizing Quiz...', 'Almost Ready...'];

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

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        const canGenerate = mode === 'topic' ? topic.trim().length > 0 : selectedFile !== null;
        
        const difficultyOptions = [
            { key: 'easy', label: 'Easy', icon: 'leaf-outline', desc: 'Focus on fundamentals' },
            { key: 'medium', label: 'Medium', icon: 'bulb-outline', desc: 'Comprehensive coverage' },
            { key: 'hard', label: 'Hard', icon: 'rocket-outline', desc: 'Deep analytical questions' },
        ];

        const formatOptions = [
            { key: 'mcq', label: 'MCQ', icon: 'list-circle-outline', desc: 'Multiple choice questions' },
            { key: 'theory', label: 'Theory', icon: 'create-outline', desc: 'Essay & analysis' },
            { key: 'both', label: 'Mixed', icon: 'shapes-outline', desc: 'Combination of both' },
        ];

        return (
            <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
                <Stack.Screen options={{ headerShown: false }} />
                
                <ScrollView 
                    style={{ flex: 1 }} 
                    contentContainerStyle={{ padding: 24, paddingBottom: 160, paddingTop: insets.top + 20 }} 
                    showsVerticalScrollIndicator={false}
                >
                    <Text className={`text-[32px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} mb-8`}>
                        Build Quiz
                    </Text>

                    {/* Source Selector */}
                    <View className={`flex-row ${isDark ? 'bg-[#161618]' : 'bg-slate-100'} rounded-2xl p-1 mb-8 border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        {(['topic', 'file'] as QuizMode[]).map(m => (
                            <TouchableOpacity 
                                key={m} 
                                onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                className={`flex-1 items-center justify-center py-3 rounded-xl ${mode === m ? (isDark ? 'bg-slate-800' : 'bg-white shadow-sm') : ''}`}
                            >
                                <Text className={`font-semibold text-[14px] capitalize ${mode === m ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Source Input */}
                    <View className="mb-8">
                        {mode === 'topic' ? (
                            <>
                                <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Topic</Text>
                                <TextInput
                                    className={`h-[60px] ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-2xl px-5 text-[16px] font-medium`}
                                    placeholder="e.g. Nigerian History, Algebra..."
                                    placeholderTextColor="#94a3b8"
                                    value={topic}
                                    onChangeText={setTopic}
                                />
                            </>
                        ) : (
                            <>
                                <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Document</Text>
                                <TouchableOpacity
                                    onPress={handleFileSelect}
                                    disabled={isProcessingFile}
                                    activeOpacity={0.7}
                                    className={`border-2 border-dashed ${isDark ? 'border-slate-800 bg-[#161618]' : 'border-slate-200 bg-white'} rounded-2xl p-8 items-center`}
                                >
                                    {isProcessingFile ? (
                                        <View className="items-center py-2">
                                            <ActivityIndicator size="small" color="#D2B48C" />
                                            <Text className="text-[14px] font-medium text-brand-primary mt-4">Analyzing document...</Text>
                                        </View>
                                    ) : selectedFile ? (
                                        <>
                                            <View className="bg-brand-primary/10 w-12 h-12 rounded-xl items-center justify-center mb-4">
                                                <Ionicons name="document-text" size={24} color="#D2B48C" />
                                            </View>
                                            <Text className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'} text-center mb-1`}>{selectedFile.name}</Text>
                                            <Text className="text-[12px] font-medium text-brand-primary uppercase tracking-wider">Ready to generate</Text>
                                        </>
                                    ) : (
                                        <>
                                            <View className={`w-12 h-12 rounded-xl items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                <Ionicons name="cloud-upload-outline" size={24} color={isDark ? '#475569' : '#94a3b8'} />
                                            </View>
                                            <Text className={`text-[15px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Tap to upload PDF/DOCX</Text>
                                            <Text className="text-[12px] font-medium text-slate-400">max 5MB • extractable text</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Question Count */}
                    <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Total Questions</Text>
                    <TextInput
                        className={`h-[60px] ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-2xl px-5 text-[16px] font-medium mb-8`}
                        keyboardType="number-pad" 
                        value={questionCount} 
                        onChangeText={setQuestionCount}
                    />

                    {/* Difficulty Selection */}
                    <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Difficulty</Text>
                    <View className="gap-3 mb-8">
                        {difficultyOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setDifficulty(opt.key as Difficulty)}
                                activeOpacity={0.8}
                                className={`flex-row items-center p-4 rounded-2xl border-[1.5px] ${
                                    difficulty === opt.key
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : isDark ? 'border-slate-800 bg-[#161618]' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                                    difficulty === opt.key ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-50'
                                }`}>
                                    <Ionicons name={opt.icon as any} size={20} color={difficulty === opt.key ? '#fff' : '#D2B48C'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.label}</Text>
                                    <Text className="text-[12px] font-medium text-slate-400">{opt.desc}</Text>
                                </View>
                                {difficulty === opt.key && (
                                    <Ionicons name="checkmark-circle" size={22} color="#D2B48C" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Format Selection */}
                    <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Format</Text>
                    <View className="gap-3 mb-8">
                        {formatOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setFormat(opt.key as FormatType)}
                                activeOpacity={0.8}
                                className={`flex-row items-center p-4 rounded-2xl border-[1.5px] ${
                                    format === opt.key
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : isDark ? 'border-slate-800 bg-[#161618]' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                                    format === opt.key ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-50'
                                }`}>
                                    <Ionicons name={opt.icon as any} size={20} color={format === opt.key ? '#fff' : '#D2B48C'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.label}</Text>
                                    <Text className="text-[12px] font-medium text-slate-400">{opt.desc}</Text>
                                </View>
                                {format === opt.key && (
                                    <Ionicons name="checkmark-circle" size={22} color="#D2B48C" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Timer Toggle */}
                    <View className={`flex-row justify-between items-center p-5 rounded-2xl border-[1.5px] ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'} mb-4`}>
                        <View className="flex-1 mr-4">
                            <Text className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Strict Timer</Text>
                            <Text className="text-[12px] font-medium text-slate-400 mt-0.5">Auto-submit when time expires</Text>
                        </View>
                        <TouchableOpacity onPress={() => setTimerEnabled(!timerEnabled)}
                            className={`w-12 h-7 rounded-full justify-center p-1 transition-colors ${timerEnabled ? 'bg-brand-primary' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}>
                            <Animated.View className="w-5 h-5 rounded-full bg-white shadow-sm" style={{ transform: [{ translateX: timerEnabled ? 20 : 0 }] }} />
                        </TouchableOpacity>
                    </View>

                    {timerEnabled && (
                        <View className="flex-row items-center mb-8 gap-3">
                            <TextInput
                                className={`flex-1 h-[60px] ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'} border-[1.5px] rounded-2xl px-5 text-[16px] font-medium`}
                                keyboardType="number-pad" 
                                value={timerMinutes} 
                                onChangeText={setTimerMinutes} 
                                placeholder="10" 
                                placeholderTextColor="#94a3b8"
                            />
                            <Text className="font-semibold text-slate-400 text-[14px] w-12 text-center">mins</Text>
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
                        <View className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-[28px] p-6 border-2 border-brand-primary/20 items-center overflow-hidden">
                            <View className="mb-4">
                                <ActivityIndicator size="small" color="#D2B48C" />
                            </View>
                            <Text className="text-brand-primary font-black text-lg tracking-tight mb-1 text-center">{loadingStage}</Text>
                            <Text className="text-slate-500 dark:text-slate-400 font-medium text-[11px] text-center px-2">
                                Usually takes 15-30s.
                            </Text>
                            <View className="flex-row gap-1.5 mt-4 w-full px-2">
                                {['Analyzing', 'Extracting', 'Generating', 'Finalizing'].map((s, i) => {
                                    const stages = mode === 'file'
                                        ? ['Analyzing Document...', 'Extracting Context...', 'Generating Questions...', 'Almost Ready...']
                                        : ['Analyzing Topic...', 'Researching Context...', 'Generating Questions...', 'Almost Ready...'];
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
                                className="bg-[#D2B48C] rounded-2xl py-4 items-center flex-row justify-center shadow-lg shadow-[#D2B48C]/20"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="sparkles" size={20} color="#fff" />
                                <Text className="text-white font-black ml-2 text-[17px]">Generate Quiz</Text>
                            </TouchableOpacity>
                            <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">
                                Estimated Cost: {parseInt(questionCount) || 10} Credits | Max 5MB
                            </Text>
                        </>
                    ) : null}
                </BlurView>
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    if (questions.length > 0 && totalAnswered < questions.length) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
                <Stack.Screen options={{ 
                    title: 'Quiz', 
                    headerShown: true, 
                    headerStyle: { backgroundColor: bgColor }, 
                    headerTitleStyle: { fontWeight: '600' },
                    headerTintColor: tintColor, 
                    headerBackVisible: false, 
                    headerShadowVisible: false 
                }} />

                {/* Progress Header */}
                <View className={`px-6 py-4 flex-row items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Text className={`font-semibold text-[13px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalAnswered + 1}</Text>
                        </View>
                        <Text className="text-slate-400 font-medium text-[13px] uppercase tracking-wider">Question of {questions.length}</Text>
                    </View>
                    
                    {timerEnabled && timeLeft > 0 && (
                        <View className={`px-3 py-1.5 rounded-xl border ${timeLeft < 60 ? 'border-red-500 bg-red-500/5' : (isDark ? 'border-slate-800 bg-[#161618]' : 'border-slate-100 bg-white')}`}>
                            <Text className={`font-semibold text-[13px] ${timeLeft < 60 ? 'text-red-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
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
        if (pct >= 90) return { title: "GENIUS!", subtitle: "You've completely mastered this topic!", icon: "trophy-outline" };
        if (pct >= 75) return { title: "WELL DONE!", subtitle: "Excellent performance, keep it up!", icon: "star-outline" };
        if (pct >= 50) return { title: "SOLID EFFORT!", subtitle: "Good job, but there's room to grow.", icon: "medal-outline" };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: "trending-up-outline" };
    };
    const remark = getRemark(percentage);

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <Stack.Screen options={{ 
                title: 'Results', 
                headerShown: true, 
                headerStyle: { backgroundColor: bgColor }, 
                headerTitleStyle: { fontWeight: '600' },
                headerTintColor: tintColor, 
                headerBackVisible: false,
                headerShadowVisible: false
            }} />

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 150 }}>
                {/* Score Header */}
                <View className="items-center py-10">
                    <View className="w-20 h-20 bg-brand-primary/10 rounded-2xl items-center justify-center mb-6">
                        <Ionicons name={remark.icon as any} size={40} color="#D2B48C" />
                    </View>
                    <Text className="text-brand-primary font-bold text-[13px] uppercase tracking-[0.2em] mb-2">{remark.title}</Text>
                    <Text className={`text-[48px] font-semibold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{percentage}%</Text>
                    <Text className="text-slate-500 font-medium text-[15px] mt-2 text-center px-4">{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View className="flex-row mt-8 gap-3">
                        <View className={`px-4 py-2 rounded-xl flex-row items-center border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text className={`font-semibold text-[13px] ml-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{correctCount} Correct</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-xl flex-row items-center border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}>
                            <Ionicons name="time-outline" size={16} color="#6366f1" />
                            <Text className={`font-semibold text-[13px] ml-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {timerEnabled ? formatTime(((parseInt(timerMinutes) || 10) * 60) - timeLeft) : 'No Timer'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Review List */}
                <Text className={`text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1`}>Review Questions</Text>
                {questions.map((q, qi) => {
                    const isTheory = q.question_type === 'essay';
                    const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                    return (
                        <View key={qi} className={`p-4 rounded-2xl border mb-3 flex-row items-center ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}>
                            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-4 ${isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                <Ionicons name={isCorrect ? "checkmark" : "close"} size={18} color={isCorrect ? "#10b981" : "#ef4444"} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{q.question_text}</Text>
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
            <View className={`absolute bottom-0 left-0 right-0 p-6 pb-10 border-t ${isDark ? 'bg-[#0f0f11]/95 border-slate-800' : 'bg-white/95 border-slate-100'}`}>
                <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        className={`h-[56px] rounded-2xl flex-1 items-center justify-center flex-row border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100'}`}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#D2B48C" />
                        ) : (
                            <>
                                <Ionicons name="share-outline" size={20} color={isDark ? '#fff' : '#0f172a'} />
                                <Text className={`font-bold text-[16px] ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        className="h-[56px] bg-brand-primary rounded-2xl flex-1 items-center justify-center flex-row"
                    >
                        {isExporting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="document-text-outline" size={20} color="white" />
                                <Text className="text-white font-bold text-[16px] ml-2">Export</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                    activeOpacity={0.8}
                    className={`h-[56px] rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                >
                    <Text className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Return Home</Text>
                </TouchableOpacity>
            </View>

            <RewardModal isVisible={isRewardModalVisible} onClose={() => setIsRewardModalVisible(false)} reward={rewardData} />
            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="quiz" />
        </View>
    );
}

