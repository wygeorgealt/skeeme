import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/ui/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { QuizShareCard } from '@/components/QuizShareCard';

// ─── Types ─────────────────────────────────────────────────────────────────────
type QuizMode = 'topic' | 'file';
type Difficulty = 'easy' | 'medium' | 'hard';
type FormatType = 'mcq' | 'theory' | 'both';

type Question = {
    question_text: string;
    question_type: 'multiple_choice' | 'essay';
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty_level: string;
};

type TheoryResult = {
    score: number;
    max: number;
    feedback: string;
    passed: boolean;
};

// ─── Difficulty colours ─────────────────────────────────────────────────────────
const DIFF_COLORS: Record<string, string> = {
    easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
};

// ──────────────────────────────────────────────────────────────────────────────
// 3‑D FLIP CARD
// The outer container has a fixed height so both faces overlap correctly.
// Front: question + options  |  Back: explanation panel
// ──────────────────────────────────────────────────────────────────────────────
function QuizFlipCard({
    front, back, isFlipped
}: {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped: boolean;
}) {
    const rot = useSharedValue(0);
    const [frontHeight, setFrontHeight] = useState(0);
    const [backHeight, setBackHeight] = useState(0);

    useEffect(() => {
        rot.value = withTiming(isFlipped ? 1 : 0, { duration: 500 });
    }, [isFlipped]);

    const frontStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(rot.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` },
        ],
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: isFlipped ? 0 : 1,
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(rot.value, [0, 1], [-180, 0], Extrapolation.CLAMP)}deg` },
        ],
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: isFlipped ? 1 : 0,
    }));

    // Give a nice default min block so it doesn't snap to 0 immediately
    const containerHeight = Math.max(frontHeight, backHeight, 150);

    return (
        <View style={{ minHeight: containerHeight }}>
            <Animated.View style={frontStyle} pointerEvents={isFlipped ? 'none' : 'auto'} onLayout={(e) => setFrontHeight(e.nativeEvent.layout.height)}>
                {front}
            </Animated.View>
            <Animated.View style={backStyle} pointerEvents={isFlipped ? 'auto' : 'none'} onLayout={(e) => setBackHeight(e.nativeEvent.layout.height)}>
                {back}
            </Animated.View>
        </View>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// QUIZ CARD WRAPPER — manages its own flip + answer state
// ──────────────────────────────────────────────────────────────────────────────
function MCQCard({
    q, qi, onAnswer, selectedAnswer, quizFinished,
}: {
    q: Question;
    qi: number;
    onAnswer: (qi: number, opt: string) => void;
    selectedAnswer: string | undefined;
    quizFinished: boolean;
}) {
    const [flipped, setFlipped] = useState(false);
    const answered = selectedAnswer !== undefined;
    const isCorrect = selectedAnswer === q.correct_answer;

    const { colorScheme } = require('nativewind').useColorScheme();
    const isDark = colorScheme === 'dark';

    const optionStyle = (opt: string) => {
        if (!answered) return { bg: isDark ? '#1e293b' : '#f8fafc', border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#94a3b8' : '#334155', iconName: null, iconColor: '' };
        if (opt === q.correct_answer) return { bg: isDark ? 'rgba(21, 128, 61, 0.2)' : '#f0fdf4', border: isDark ? 'rgba(74, 222, 128, 0.5)' : '#4ade80', text: isDark ? '#4ade80' : '#166534', iconName: 'checkmark-circle', iconColor: '#22c55e' };
        if (opt === selectedAnswer) return { bg: isDark ? 'rgba(153, 27, 27, 0.2)' : '#fef2f2', border: isDark ? 'rgba(248, 113, 113, 0.5)' : '#f87171', text: isDark ? '#f87171' : '#991b1b', iconName: 'close-circle', iconColor: '#ef4444' };
        return { bg: isDark ? '#1e293b' : '#f8fafc', border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#475569' : '#94a3b8', iconName: null, iconColor: '' };
    };

    const front = (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5">
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text style={styles.qLabel}>Q{qi + 1} · MCQ</Text>
                <View style={[styles.diffBadge, { backgroundColor: (DIFF_COLORS[q.difficulty_level] ?? '#f59e0b') + '22' }]}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#f59e0b' }]}>
                        {q.difficulty_level}
                    </Text>
                </View>
            </View>
            <Text className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug">{q.question_text}</Text>

            {/* Options */}
            <View style={{ marginTop: 12 }}>
                {q.options.map((opt, oi) => {
                    const s = optionStyle(opt);
                    return (
                        <TouchableOpacity
                            key={oi}
                            activeOpacity={answered ? 1 : 0.7}
                            onPress={() => { if (!answered && !quizFinished) onAnswer(qi, opt); }}
                            style={[styles.optionBtn, { backgroundColor: s.bg, borderColor: s.border }]}
                        >
                            <Text style={[styles.optionText, { color: s.text, flex: 1 }]}>{opt}</Text>
                            {s.iconName && (
                                <Ionicons name={s.iconName as any} size={20} color={s.iconColor} style={{ marginLeft: 8 }} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Flip to Explain button — only visible once answered */}
            {answered && q.explanation ? (
                <TouchableOpacity onPress={() => setFlipped(true)} style={styles.explainBtn}>
                    <View className={`rounded-full px-2 py-1 flex-row items-center gap-1.5 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                        <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={16} color={isCorrect ? '#22c55e' : '#ef4444'} />
                        <Text className={`font-bold text-[13px] ${isCorrect ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                        </Text>
                    </View>
                    <View className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                        <Ionicons name="arrow-redo" size={13} color="#4f46e5" />
                        <Text style={styles.explainPillText}>Flip for Explanation</Text>
                    </View>
                </TouchableOpacity>
            ) : null}
        </View>
    );

    const back = (
        <View className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-5 border border-indigo-100 dark:border-indigo-900/50">
            <TouchableOpacity onPress={() => setFlipped(false)} style={styles.backBtn}>
                <Ionicons name="arrow-undo" size={14} color="#4f46e5" />
                <Text style={styles.backBtnText}>Back to Question</Text>
            </TouchableOpacity>
            <Text style={styles.explainTitle}>Explanation</Text>
            <Text className="text-[14px] font-medium text-indigo-900 dark:text-indigo-200 leading-snug">{q.explanation}</Text>
            {!isCorrect && (
                <View className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800/50">
                    <Text style={styles.correctAnswerLabel}>CORRECT ANSWER</Text>
                    <Text className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-400">{q.correct_answer}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.cardOuter}>
            <QuizFlipCard
                front={front}
                back={back}
                isFlipped={flipped}
            />
        </View>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// THEORY CARD — submit for AI grading
// ──────────────────────────────────────────────────────────────────────────────
function TheoryCard({
    q, qi, onGraded,
}: {
    q: Question;
    qi: number;
    onGraded: (qi: number, passed: boolean) => void;
}) {
    const [answer, setAnswer] = useState('');
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState<TheoryResult | null>(null);

    const handleSubmit = async () => {
        if (answer.trim().length < 5) return Alert.alert('Too short', 'Please write at least a few words.');
        setGrading(true);
        try {
            const res = await api.post('/quizzes/grade-theory', {
                question_text: q.question_text,
                student_answer: answer.trim(),
                model_answer: q.correct_answer || q.explanation || '',
            });
            const data: TheoryResult = res.data;
            setResult(data);
            onGraded(qi, data.passed);
        } catch (e: any) {
            Alert.alert('Grading Error', e.response?.data?.message || 'Could not grade answer.');
        } finally {
            setGrading(false);
        }
    };

    return (
        <View style={styles.cardOuter}>
            <View className="bg-white dark:bg-slate-800 rounded-3xl p-5">
                <View style={styles.cardHeader}>
                    <Text style={styles.qLabel}>Q{qi + 1} · Theory</Text>
                    <View style={[styles.diffBadge, { backgroundColor: (DIFF_COLORS[q.difficulty_level] ?? '#f59e0b') + '22' }]}>
                        <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#f59e0b' }]}>{q.difficulty_level}</Text>
                    </View>
                </View>
                <Text className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug">{q.question_text}</Text>

                {result ? (
                    // Grading result view
                    <View style={{ marginTop: 14 }}>
                        <View className={`flex-row items-center border-[1.5px] rounded-2xl p-4 mb-4 ${result.passed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-800'}`}>
                            <Ionicons name={result.passed ? 'trophy' : 'close-circle'} size={22} color={result.passed ? '#22c55e' : '#ef4444'} />
                            <View style={{ marginLeft: 10 }}>
                                <Text className={`text-[17px] font-extrabold ${result.passed ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                                    {result.score}/{result.max} marks
                                </Text>
                                <Text className={`text-[12px] font-semibold mt-0.5 ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {result.passed ? 'Passed ✓' : 'Below pass mark'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.feedbackTitle}>AI Feedback</Text>
                        <Text className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug">{result.feedback}</Text>
                    </View>
                ) : (
                    // Answer input view
                    <View style={{ marginTop: 12 }}>
                        <TextInput
                            multiline
                            placeholder="Write your answer here..."
                            placeholderTextColor="#94a3b8"
                            value={answer}
                            onChangeText={setAnswer}
                            className="bg-slate-50 dark:bg-brand-dark/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-900 dark:text-white min-h-[110px] mb-3"
                            textAlignVertical="top"
                            editable={!grading}
                        />
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={grading}
                            style={[styles.submitBtn, { opacity: grading ? 0.6 : 1 }]}
                        >
                            {grading ? (
                                <>
                                    <ActivityIndicator color="white" size="small" />
                                    <Text style={styles.submitBtnText}>Grading with AI...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done" size={18} color="white" />
                                    <Text style={styles.submitBtnText}>Submit for Marking</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function GenerateQuizScreen() {
    const { updateUser } = useAuthStore();
    const { colorScheme } = require('nativewind').useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#010100' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#0f172a';

    // Setup state
    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
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

    // Timer
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            const uri = await captureRef(viewShotRef.current, {
                format: 'png',
                quality: 1.0,
            });
            await Sharing.shareAsync(uri);
        } catch (e) {
            console.error('Sharing failed', e);
            Alert.alert('Sharing failed', 'Could not generate result image.');
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

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
                // 2MB size limit to prevent huge processing costs or timeouts
                if (asset.size && asset.size > 2 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a file smaller than 2MB. Ensure it contains extractable text, not just scanned images.');
                    return;
                }
                setSelectedFile(asset);
                setMode('file');
                setTopic('');
            }
        } catch { Alert.alert('Error', 'Failed to pick document.'); }
    };

    // Generate
    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        setIsLoading(true);
        setQuestions([]); setSelectedAnswers({}); setTheoryResults({});
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            const questionTypes = format === 'both' ? ['mcq', 'theory'] : [format === 'theory' ? 'theory' : 'mcq'];
            let response;
            if (mode === 'file' && selectedFile) {
                const fd = new FormData();
                fd.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'application/octet-stream' } as any);
                fd.append('question_count', questionCount);
                fd.append('difficulty', difficulty);
                questionTypes.forEach((t, i) => fd.append(`question_types[${i}]`, t));
                response = await api.post('/quizzes/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await api.post('/quizzes/generate', { topic, question_count: parseInt(questionCount), question_types: questionTypes, difficulty });
            }
            setQuestions(response.data.questions);
            if (response.data.remaining_credits !== undefined) updateUser({ credits: response.data.remaining_credits });
            if (timerEnabled) startTimer(parseInt(timerMinutes) || 10);
        } catch (e: any) {
            if (e.response?.status === 403) Alert.alert('Insufficient Credits', e.response.data.message);
            else Alert.alert('Failed', e.response?.data?.message || 'Something went wrong. Please try again.');
        } finally { setIsLoading(false); }
    };

    const handleMCQAnswer = (qi: number, opt: string) => {
        setSelectedAnswers(p => ({ ...p, [qi]: opt }));
    };

    const handleTheoryGraded = (qi: number, passed: boolean) => {
        setTheoryResults(p => ({ ...p, [qi]: passed }));
    };

    // Score stats
    const mcqAnswered = Object.keys(selectedAnswers).length;
    const theoryAnswered = Object.keys(theoryResults).length;
    const totalAnswered = mcqAnswered + theoryAnswered;
    const correctCount = Object.entries(selectedAnswers).filter(([qi, ans]) => questions[+qi]?.correct_answer === ans).length
        + Object.values(theoryResults).filter(Boolean).length;

    // Save quiz history when finished
    useEffect(() => {
        if (questions.length > 0 && totalAnswered === questions.length) {
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

            api.post('/quizzes/history', payload).catch(err => {
                console.warn('Failed to save quiz history', err);
            });
        }
    }, [totalAnswered]);

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        return (
            <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
                <Stack.Screen options={{ title: 'AI Practice Quiz', headerShown: true, headerBackVisible: false, headerStyle: { backgroundColor: bgColor }, headerTintColor: tintColor, headerShadowVisible: false }} />
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                    {/* Source card */}
                    <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <View style={styles.rowBetween}>
                            <View style={styles.rowCenter}>
                                <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center mr-3"><Ionicons name="sparkles" size={20} color="#4f46e5" /></View>
                                <Text className="text-[15px] font-bold text-slate-900 dark:text-white">Quiz Source</Text>
                            </View>
                            <View className="flex-row bg-slate-100 dark:bg-brand-dark rounded-xl p-1">
                                {(['topic', 'file'] as QuizMode[]).map(m => (
                                    <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                        className={`px-3 py-1.5 rounded-lg ${mode === m ? 'bg-white dark:bg-slate-800' : ''}`}
                                        style={mode === m ? { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : {}}>
                                        <Text className={`font-bold text-[11px] capitalize ${mode === m ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        {mode === 'topic' ? (
                            <>
                                <Text style={styles.label}>What do you want to practice?</Text>
                                <TextInput className="bg-slate-50 dark:bg-brand-dark/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white mb-3" placeholder="e.g. History of the Internet, Calculus..." placeholderTextColor="#94a3b8" value={topic} onChangeText={setTopic} />
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Upload study material</Text>
                                <TouchableOpacity onPress={handleFileSelect} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-5 items-center bg-slate-50 dark:bg-slate-800">
                                    {selectedFile ? (
                                        <>
                                            <Ionicons name="document-text" size={28} color="#4f46e5" />
                                            <Text className="text-sm font-bold text-slate-900 dark:text-white mt-2 text-center">{selectedFile.name}</Text>
                                            <Text style={styles.fileChangeText}>Tap to change</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="cloud-upload-outline" size={28} color="#94a3b8" />
                                            <Text style={styles.fileHintText}>Tap to browse files</Text>
                                            <Text style={styles.fileTypeText}>.pdf · .docx · .txt · .md</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Settings card */}
                    <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <Text className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Settings</Text>

                        <Text style={styles.label}>Number of Questions (10–50)</Text>
                        <TextInput className="bg-slate-50 dark:bg-brand-dark/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white mb-3" keyboardType="number-pad" value={questionCount} onChangeText={setQuestionCount} />

                        <Text style={styles.label}>Difficulty</Text>
                        <View style={styles.optionRow}>
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                                <TouchableOpacity key={d} onPress={() => setDifficulty(d)}
                                    className={`flex-1 border-2 rounded-xl py-3 items-center justify-center flex-row gap-1 ${difficulty === d ? '' : 'border-slate-200 dark:border-slate-700'}`}
                                    style={difficulty === d ? { borderColor: DIFF_COLORS[d] } : { opacity: 0.6 }}>
                                    <Text className="font-bold text-xs capitalize" style={{ color: difficulty === d ? DIFF_COLORS[d] : '#94a3b8' }}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Question Format</Text>
                        <View style={styles.optionRow}>
                            {([{ id: 'mcq', label: 'MCQ', icon: 'list' }, { id: 'theory', label: 'Theory', icon: 'create-outline' }, { id: 'both', label: 'Both', icon: 'layers-outline' }] as any[]).map(f => (
                                <TouchableOpacity key={f.id} onPress={() => setFormat(f.id)}
                                    className={`flex-1 border-2 rounded-xl py-3 items-center justify-center flex-row gap-1 ${format === f.id ? 'border-indigo-600 bg-indigo-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
                                    <Ionicons name={f.icon} size={14} color={format === f.id ? '#4f46e5' : '#94a3b8'} />
                                    <Text className={`font-bold text-xs ml-1 ${format === f.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{f.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.rowBetween, { marginBottom: timerEnabled ? 10 : 0 }]}>
                            <View style={styles.rowCenter}>
                                <Ionicons name="timer-outline" size={17} color="#64748b" />
                                <Text style={[styles.label, { marginBottom: 0, marginLeft: 6 }]}>Study Timer</Text>
                            </View>
                            <TouchableOpacity onPress={() => setTimerEnabled(!timerEnabled)}
                                style={[styles.toggle, { backgroundColor: timerEnabled ? '#4f46e5' : '#e2e8f0' }]}>
                                <View style={[styles.toggleThumb, { transform: [{ translateX: timerEnabled ? 18 : 2 }] }]} />
                            </TouchableOpacity>
                        </View>
                        {timerEnabled && (
                            <View style={styles.rowCenter}>
                                <TextInput className="flex-1 bg-slate-50 dark:bg-brand-dark/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white" keyboardType="number-pad" value={timerMinutes} onChangeText={setTimerMinutes} placeholder="10" placeholderTextColor="#94a3b8" />
                                <Text style={{ color: '#64748b', marginLeft: 10, fontWeight: '600' }}>minutes</Text>
                            </View>
                        )}
                    </View>

                    {/* Generate button */}
                    <GradientButton
                        onPress={handleGenerate}
                        loading={isLoading}
                        containerStyle="mt-2"
                        icon={<Ionicons name="sparkles" size={18} color="white" />}
                    >
                        {isLoading ? 'Generating...' : 'Generate Quiz'}
                    </GradientButton>
                    <Text style={styles.creditHint}>Credits scale with content length & question count.</Text>
                </ScrollView>
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{ title: 'AI Practice Quiz', headerShown: true, headerStyle: { backgroundColor: bgColor }, headerTintColor: tintColor, headerBackVisible: false, headerShadowVisible: false }} />

            {/* Quiz header bar */}
            <View style={styles.quizBar}>
                <Text style={styles.quizBarStat}>{totalAnswered}/{questions.length} done</Text>
                {timerEnabled && timeLeft > 0 && (
                    <View style={[styles.timerPill, { borderColor: timeLeft < 60 ? '#ef4444' : '#6366f1' }]}>
                        <Ionicons name="timer-outline" size={13} color={timeLeft < 60 ? '#ef4444' : '#a5b4fc'} />
                        <Text style={[styles.timerText, { color: timeLeft < 60 ? '#ef4444' : '#a5b4fc' }]}>{formatTime(timeLeft)}</Text>
                    </View>
                )}
                <Text style={styles.quizBarScore}>{correctCount} correct</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: totalAnswered === questions.length ? 110 : 60 }}>

                {questions.map((q, qi) =>
                    q.question_type === 'multiple_choice' ? (
                        <MCQCard key={qi} q={q} qi={qi} onAnswer={handleMCQAnswer} selectedAnswer={selectedAnswers[qi]} quizFinished={totalAnswered === questions.length} />
                    ) : (
                        <TheoryCard key={qi} q={q} qi={qi} onGraded={handleTheoryGraded} />
                    )
                )}
            </ScrollView>

            {/* Sticky completion footer — always visible when quiz is done */}
            {totalAnswered === questions.length && (
                <>
                    {/* Hidden capture view for sharing */}
                    <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                        <View ref={viewShotRef} collapsable={false}>
                            <QuizShareCard
                                topic={mode === 'topic' ? topic : (selectedFile?.name || 'File Upload')}
                                percentage={Math.round((correctCount / questions.length) * 100)}
                            />
                        </View>
                    </View>

                    <LinearGradient
                        colors={['#4f46e5', '#0ea5e9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.completionFooter}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.completionLabel}>QUIZ COMPLETE</Text>
                            <Text style={styles.completionScore2}>{correctCount}/{questions.length} · {Math.round((correctCount / questions.length) * 100)}%</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={handleShare}
                                disabled={isSharing}
                                style={styles.completionFooterBtn}
                            >
                                {isSharing ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="share-social" size={16} color="white" />
                                )}
                                <Text style={styles.tryAgainText}>{isSharing ? 'Generating...' : 'Share'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                                style={styles.completionFooterBtn}
                            >
                                <Ionicons name="refresh" size={16} color="white" />
                                <Text style={styles.tryAgainText}>New Quiz</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </>
            )}
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Cards
    cardOuter: { marginBottom: 18, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    cardInner: { backgroundColor: '#ffffff', borderRadius: 24, padding: 18 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    qLabel: { fontSize: 11, fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    diffText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
    questionText: { fontSize: 15, fontWeight: '600', color: '#1e293b', lineHeight: 22 },
    // Options
    optionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8 },
    optionText: { fontSize: 14, fontWeight: '500' },
    // Explain
    explainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    resultPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
    resultPillText: { fontWeight: '700', fontSize: 13 },
    explainPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
    explainPillText: { color: '#4f46e5', fontWeight: '700', fontSize: 12 },
    // Back face
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    backBtnText: { color: '#4f46e5', fontWeight: '700', fontSize: 13 },
    explainTitle: { fontSize: 11, fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    explainBody: { fontSize: 14, color: '#3730a3', fontWeight: '500', lineHeight: 21 },
    correctAnswerBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#c7d2fe' },
    correctAnswerLabel: { fontSize: 10, fontWeight: '800', color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    correctAnswerText: { fontSize: 14, fontWeight: '600', color: '#166534' },
    // Theory
    theoryInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 14, fontSize: 14, minHeight: 110, marginBottom: 10 },
    submitBtn: { backgroundColor: '#4f46e5', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    submitBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
    gradePill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, padding: 14, marginBottom: 14 },
    gradeScore: { fontSize: 17, fontWeight: '800' },
    gradeLabel: { fontSize: 12, fontWeight: '600', marginTop: 1 },
    feedbackTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    feedbackBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
    // Setup form
    settingsCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    inputField: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, marginBottom: 14 },
    fileDropzone: { borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed', borderRadius: 16, padding: 22, alignItems: 'center' },
    fileNameText: { fontSize: 14, fontWeight: '700', marginTop: 8, textAlign: 'center' },
    fileChangeText: { fontSize: 11, fontWeight: '700', color: '#4f46e5', marginTop: 4 },
    fileHintText: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 8 },
    fileTypeText: { fontSize: 11, color: '#94a3b8', marginTop: 3 },
    optionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterBtn: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
    filterBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
    filterBtnText: { fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    iconBubble: { width: 38, height: 38, backgroundColor: '#eef2ff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    toggleRow: { flexDirection: 'row', borderRadius: 12, padding: 3 },
    toggleItem: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    toggleItemActive: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    toggleText: { fontWeight: '700', fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' },
    toggleTextActive: { color: '#4f46e5' },
    toggle: { width: 42, height: 24, borderRadius: 12, justifyContent: 'center', padding: 2 },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    generateBtn: { backgroundColor: '#4f46e5', borderRadius: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    generateBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    creditHint: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 10 },
    // Quiz bar
    quizBar: { backgroundColor: '#010100', paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    quizBarStat: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
    quizBarScore: { color: '#4ade80', fontWeight: '700', fontSize: 13 },
    timerPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    timerText: { fontWeight: '800', fontSize: 13 },
    // Completion sticky footer
    completionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 16, paddingBottom: 28, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
    completionLabel: { color: '#a5b4fc', fontWeight: '800', fontSize: 10, letterSpacing: 2, marginBottom: 2 },
    completionScore2: { color: 'white', fontWeight: '900', fontSize: 22 },
    completionScore: { color: 'white', fontWeight: '900', fontSize: 48 },
    completionPct: { color: '#c7d2fe', fontWeight: '600', fontSize: 14, marginTop: 2 },
    completionFooterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
    tryAgainBtn: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999 },
    tryAgainText: { color: 'white', fontWeight: '700', fontSize: 14 },
});
