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
        return (
            <View className="flex-1 bg-white dark:bg-brand-dark">
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120, paddingTop: 100 }} showsVerticalScrollIndicator={false}>

                    <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white mb-8">Build Quiz</Text>

                    {/* Source Selector Segment Flat Style */}
                    <View className="flex-row bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 mb-8 border-2 border-slate-100 dark:border-slate-800">
                        {(['topic', 'file'] as QuizMode[]).map(m => (
                            <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                className="flex-1 items-center justify-center py-3 rounded-xl"
                                style={[
                                    mode === m ? {
                                        backgroundColor: isDark ? '#121212' : '#ffffff',
                                        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
                                        borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0'
                                    } : {}
                                ]}>
                                <Text
                                    className="font-black text-[14px] uppercase tracking-widest"
                                    style={{ color: mode === m ? (isDark ? '#ffffff' : '#121212') : (isDark ? '#475569' : '#94a3b8') }}
                                >
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Source Input */}
                    <View className="mb-8">
                        {mode === 'topic' ? (
                            <>
                                <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Topic</Text>
                                <TextInput
                                    className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white"
                                    placeholder="e.g. Nigerian History, Algebra..."
                                    placeholderTextColor="#94a3b8"
                                    value={topic}
                                    onChangeText={setTopic}
                                />
                            </>
                        ) : (
                            <>
                                <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Document</Text>
                                <TouchableOpacity
                                    onPress={handleFileSelect}
                                    disabled={isProcessingFile}
                                    className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] p-8 items-center bg-slate-50 dark:bg-slate-900/50"
                                >
                                    {isProcessingFile ? (
                                        <View className="items-center py-2">
                                            <ActivityIndicator size="large" color="#2EBD85" />
                                            <Text className="text-[15px] font-bold text-brand-primary mt-4">Analyzing...</Text>
                                        </View>
                                    ) : selectedFile ? (
                                        <>
                                            <Ionicons name="document-text" size={40} color="#2EBD85" />
                                            <Text className="text-[15px] font-bold text-slate-900 dark:text-white mt-4 text-center">{selectedFile.name}</Text>
                                            <Text className="text-[12px] font-bold text-[#2EBD85] mt-2 uppercase tracking-widest">Attached & Ready</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="cloud-upload-outline" size={40} color={isDark ? '#475569' : '#cbd5e1'} />
                                            <Text className="text-[15px] font-bold text-slate-500 mt-4">Tap to select PDF/DOCX/TXT</Text>
                                            <Text className="text-[12px] font-bold text-slate-400 mt-2 lowercase">max 5MB • extractable text only</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Settings Base */}
                    <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Questions</Text>
                    <TextInput
                        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white mb-8"
                        keyboardType="number-pad" value={questionCount} onChangeText={setQuestionCount}
                    />

                    <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Difficulty</Text>
                    <View className="flex-row gap-3 mb-8">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                            <TouchableOpacity key={d} onPress={() => setDifficulty(d)}
                                className="flex-1 rounded-2xl py-4 items-center justify-center"
                                style={[
                                    { borderWidth: 2 },
                                    difficulty === d
                                        ? { borderColor: isDark ? '#ffffff' : '#121212', backgroundColor: isDark ? '#ffffff' : '#121212' }
                                        : { borderColor: isDark ? '#1e293b' : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' }
                                ]}>
                                <Text
                                    className="font-black text-[13px] uppercase tracking-widest"
                                    style={{ color: difficulty === d ? (isDark ? '#121212' : '#ffffff') : '#94a3b8' }}
                                >
                                    {d}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Format</Text>
                    <View className="flex-row gap-3 mb-8">
                        {([{ id: 'mcq', label: 'MCQ' }, { id: 'theory', label: 'Theory' }, { id: 'both', label: 'Both' }] as any[]).map(f => (
                            <TouchableOpacity key={f.id} onPress={() => setFormat(f.id)}
                                className="flex-1 rounded-2xl py-4 items-center justify-center"
                                style={[
                                    { borderWidth: 2 },
                                    format === f.id
                                        ? { borderColor: isDark ? '#ffffff' : '#121212', backgroundColor: isDark ? '#ffffff' : '#121212' }
                                        : { borderColor: isDark ? '#1e293b' : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' }
                                ]}>
                                <Text
                                    className="font-black text-[13px] uppercase tracking-widest"
                                    style={{ color: format === f.id ? (isDark ? '#121212' : '#ffffff') : '#94a3b8' }}
                                >
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Timer */}
                    <View className="flex-row justify-between items-center mb-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                        <View>
                            <Text className="text-[14px] font-bold text-slate-900 dark:text-white">Strict Timer</Text>
                            <Text className="text-[12px] font-medium text-slate-500 mt-1">Force submission when time ends</Text>
                        </View>
                        <TouchableOpacity onPress={() => setTimerEnabled(!timerEnabled)}
                            className={`w-14 h-8 rounded-full justify-center p-1 px-1.5 transition-colors ${timerEnabled ? 'bg-[#2EBD85]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <View className={`w-6 h-6 rounded-full bg-white shadow-sm`} style={{ transform: [{ translateX: timerEnabled ? 24 : 0 }] }} />
                        </TouchableOpacity>
                    </View>

                    {timerEnabled && (
                        <View className="flex-row items-center mb-8 gap-3">
                            <TextInput
                                className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white"
                                keyboardType="number-pad" value={timerMinutes} onChangeText={setTimerMinutes} placeholder="10" placeholderTextColor="#94a3b8"
                            />
                            <Text className="font-black text-[14px] text-slate-400 uppercase tracking-widest w-16">Mins</Text>
                        </View>
                    )}

                    <View className="h-4" />
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
                                <ActivityIndicator size="small" color="#2EBD85" />
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
                                className="bg-[#2EBD85] rounded-2xl py-4 items-center flex-row justify-center shadow-lg shadow-[#2EBD85]/20"
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
            <View className="flex-1 bg-white dark:bg-brand-dark">
                <Stack.Screen options={{ 
                    title: 'Quiz Active', 
                    headerShown: true, 
                    headerStyle: { 
                        backgroundColor: bgColor,
                    }, 
                    headerTintColor: tintColor, 
                    headerBackVisible: false, 
                    headerShadowVisible: false 
                }} />

                {/* Flat header bar */}
                <View className="border-b-0 px-6 py-4 flex-row items-center justify-between bg-white dark:bg-brand-dark z-20">
                    <Text className="text-slate-500 font-black text-[12px] uppercase tracking-widest">{totalAnswered}/{questions.length} DONE</Text>
                    {timerEnabled && timeLeft > 0 && (
                        <View className={`border-2 px-3 py-1 rounded-full ${timeLeft < 60 ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                            <Text className={`font-black text-[13px] tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatTime(timeLeft)}</Text>
                        </View>
                    )}
                    <Text className="text-[#2EBD85] font-black text-[12px] uppercase tracking-widest">{correctCount} RIGHT</Text>
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
        if (pct >= 90) return { title: "GENIUS!", subtitle: "You've completely mastered this topic!", icon: "trophy" };
        if (pct >= 75) return { title: "WELL DONE!", subtitle: "Excellent performance, keep it up!", icon: "star" };
        if (pct >= 50) return { title: "SOLID EFFORT!", subtitle: "Good job, but there's room to grow.", icon: "medal" };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: "trending-up" };
    };
    const remark = getRemark(percentage);

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{ 
                title: 'Quiz Results', 
                headerShown: true, 
                headerStyle: { 
                    backgroundColor: bgColor,
                }, 
                headerTintColor: tintColor, 
                headerBackVisible: false,
                headerShadowVisible: false
            }} />

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                {/* Motivational Header */}
                <View className="items-center py-8 pb-4">
                    <View className="w-20 h-20 bg-[#2EBD85]/10 dark:bg-[#2EBD85]/20 rounded-[28px] items-center justify-center mb-6">
                        <Ionicons name={remark.icon as any} size={42} color="#2EBD85" />
                    </View>
                    <Text className="text-[#2EBD85] font-black text-[14px] uppercase tracking-[4px] mb-2">{remark.title}</Text>
                    <Text className="text-slate-900 dark:text-white font-black text-[42px] tracking-tight">{percentage}%</Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-[15px] mt-2 text-center px-8">{remark.subtitle}</Text>

                    {/* Persistence Indicator */}
                    <View className="mt-4 flex-row items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                        {isSavingHistory ? (
                            <>
                                <ActivityIndicator size="small" color="#64748b" className="mr-2" />
                                <Text className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Syncing Results...</Text>
                            </>
                        ) : saveError ? (
                            <TouchableOpacity onPress={saveHistory} className="flex-row items-center">
                                <Ionicons name="alert-circle" size={14} color="#ef4444" className="mr-2" />
                                <Text className="text-red-500 font-bold text-[11px] uppercase tracking-widest">Failed to Save • Retry</Text>
                            </TouchableOpacity>
                        ) : isSaved ? (
                            <>
                                <Ionicons name="checkmark-circle" size={14} color="#2EBD85" className="mr-2" />
                                <Text className="text-[#2EBD85] font-bold text-[11px] uppercase tracking-widest">Saved to History</Text>
                            </>
                        ) : null}
                    </View>
                </View>

                {/* Score Breakdown */}
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] p-6 shadow-sm">
                        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Correct</Text>
                        <Text className="text-slate-900 dark:text-white font-black text-2xl">{correctCount}</Text>
                    </View>
                    <View className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] p-6 shadow-sm">
                        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Incorrect</Text>
                        <Text className="text-red-500 font-black text-2xl">{questions.length - correctCount}</Text>
                    </View>
                </View>

                {/* Question Summary */}
                <Text className="text-slate-400 font-black text-[11px] uppercase tracking-widest mb-4 ml-2">Quick Review</Text>
                {questions.map((q, qi) => {
                    const isTheory = q.question_type === 'essay';
                    const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                    return (
                        <View key={qi} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center">
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${isCorrect ? 'bg-[#2EBD85]/10' : 'bg-red-500/10'}`}>
                                <Ionicons name={isCorrect ? "checkmark" : "close"} size={18} color={isCorrect ? "#2EBD85" : "#ef4444"} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 dark:text-white font-bold text-[14px]" numberOfLines={1}>{q.question_text}</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5" numberOfLines={1}>
                                    {isTheory ? (isCorrect ? "Mastered" : "Review Topic") : (isCorrect ? `Answer: ${q.correct_answer}` : `Correct: ${q.correct_answer}`)}
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

            {/* Footer Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 py-8 px-6 border-t-2 border-slate-100 dark:border-slate-800 backdrop-blur-xl">
                <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        className="bg-slate-900 dark:bg-white rounded-2xl px-8 py-5 flex-1 items-center justify-center flex-row"
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color={isDark ? '#121212' : 'white'} />
                        ) : (
                            <>
                                <Ionicons name="share-outline" size={20} color={isDark ? '#121212' : 'white'} style={{ marginRight: 8 }} />
                                <Text className="text-white dark:text-slate-900 font-black text-[16px]">Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        activeOpacity={0.8}
                        className="bg-brand-primary rounded-2xl px-8 py-5 flex-1 items-center justify-center flex-row shadow-lg shadow-brand-primary/20"
                    >
                        {isExporting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="document-text-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-black text-[16px]">Export PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                    activeOpacity={0.8}
                    className="bg-slate-100 dark:bg-slate-800 rounded-2xl py-5 items-center justify-center"
                >
                    <Text className="text-slate-900 dark:text-white font-black text-[16px]">Done</Text>
                </TouchableOpacity>
            </View>

            <RewardModal isVisible={isRewardModalVisible} onClose={() => setIsRewardModalVisible(false)} reward={rewardData} />
            <OutOfCreditsModal
                visible={showOutOfCredits}
                onDismiss={() => setShowOutOfCredits(false)}
                featureAttempted="quiz"
            />
        </View>
    );
}

