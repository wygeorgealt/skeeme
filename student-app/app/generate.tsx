import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet, useColorScheme
} from 'react-native';
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation,
} from 'react-native-reanimated';
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
    easy: '#2EBD85', medium: '#FCD34D', hard: '#ef4444',
};

// ──────────────────────────────────────────────────────────────────────────────
// 3‑D FLIP CARD
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
// QUIZ CARD WRAPPER
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

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const optionStyle = (opt: string) => {
        if (!answered) return { bg: isDark ? '#0f172a' : '#f8fafc', border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#f8fafc' : '#0f172a', iconName: null, iconColor: '' };
        if (opt === q.correct_answer) return { bg: isDark ? 'rgba(46, 189, 133, 0.1)' : '#ecfdf5', border: '#2EBD85', text: '#2EBD85', iconName: 'checkmark-circle', iconColor: '#2EBD85' };
        if (opt === selectedAnswer) return { bg: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', border: '#ef4444', text: '#ef4444', iconName: 'close-circle', iconColor: '#ef4444' };
        return { bg: isDark ? '#0f172a' : '#f8fafc', border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#475569' : '#94a3b8', iconName: null, iconColor: '' };
    };

    const front = (
        <View className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border-2 border-slate-100 dark:border-slate-800">
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400">Q{qi + 1} · MCQ</Text>
                <View style={[styles.diffBadge, { borderWidth: 1, borderColor: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                        {q.difficulty_level}
                    </Text>
                </View>
            </View>
            <Text className="text-[17px] font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">{q.question_text}</Text>

            {/* Options */}
            <View style={{ marginTop: 24 }}>
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

            {/* Flip to Explain button */}
            {answered && q.explanation ? (
                <TouchableOpacity onPress={() => setFlipped(true)} style={styles.explainBtn}>
                    <View
                        className="rounded-xl px-3 py-1.5 flex-row items-center border"
                        style={[
                            isCorrect
                                ? { borderColor: '#2EBD85', backgroundColor: 'rgba(46, 189, 133, 0.1)' }
                                : { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                        ]}
                    >
                        <Ionicons name={isCorrect ? 'checkmark' : 'close'} size={14} color={isCorrect ? '#2EBD85' : '#ef4444'} />
                        <Text
                            className="font-black ml-1 text-[11px] uppercase tracking-wider"
                            style={{ color: isCorrect ? '#2EBD85' : '#ef4444' }}
                        >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                        </Text>
                    </View>
                    <View className="bg-slate-900 dark:bg-white rounded-xl px-4 py-2 hover:opacity-80">
                        <Text className="text-white dark:text-slate-900 font-bold text-[12px]">Explain</Text>
                    </View>
                </TouchableOpacity>
            ) : null}
        </View>
    );

    const back = (
        <View className="bg-slate-50 dark:bg-slate-800 rounded-[24px] p-6 border-2 border-slate-200 dark:border-slate-700">
            <TouchableOpacity onPress={() => setFlipped(false)} className="flex-row items-center mb-6">
                <Ionicons name="arrow-back" size={16} color={isDark ? '#e2e8f0' : '#0f172a'} />
                <Text className="text-slate-900 dark:text-white font-black ml-2 text-[13px] uppercase tracking-widest">Back</Text>
            </TouchableOpacity>
            <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400 mb-2">Explanation</Text>
            <Text className="text-[15px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{q.explanation}</Text>
            {!isCorrect && (
                <View className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                    <Text className="text-[10px] font-black tracking-widest uppercase text-[#2EBD85] mb-2">Correct Answer</Text>
                    <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{q.correct_answer}</Text>
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
// THEORY CARD
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
            const res = await api.post('quizzes/grade-theory', {
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
            <View className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border-2 border-slate-100 dark:border-slate-800">
                <View style={styles.cardHeader}>
                    <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400">Q{qi + 1} · Theory</Text>
                    <View style={[styles.diffBadge, { borderWidth: 1, borderColor: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                        <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>{q.difficulty_level}</Text>
                    </View>
                </View>
                <Text className="text-[17px] font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">{q.question_text}</Text>

                {result ? (
                    <View style={{ marginTop: 20 }}>
                        <View
                            className="flex-row items-center border-[2px] rounded-xl p-4 mb-6"
                            style={[
                                result.passed
                                    ? { borderColor: '#2EBD85', backgroundColor: 'rgba(46, 189, 133, 0.1)' }
                                    : { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                            ]}
                        >
                            <Ionicons name={result.passed ? 'star' : 'code-outline'} size={24} color={result.passed ? '#2EBD85' : '#ef4444'} />
                            <View style={{ marginLeft: 12 }}>
                                <Text className={`text-[19px] font-black tracking-tight ${result.passed ? 'text-[#2EBD85]' : 'text-red-500'}`}>
                                    {result.score}/{result.max} marks
                                </Text>
                                <Text className={`text-[12px] font-bold uppercase tracking-widest mt-0.5 ${result.passed ? 'text-[#2EBD85]/70' : 'text-red-500/70'}`}>
                                    {result.passed ? 'Passed' : 'Below passing'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400 mb-2">AI Feedback</Text>
                        <Text className="text-[15px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">{result.feedback}</Text>
                    </View>
                ) : (
                    <View style={{ marginTop: 20 }}>
                        <TextInput
                            multiline
                            placeholder="Write your answer..."
                            placeholderTextColor="#94a3b8"
                            value={answer}
                            onChangeText={setAnswer}
                            className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-[15px] text-slate-900 dark:text-white h-[140px] mb-4 font-medium"
                            textAlignVertical="top"
                            editable={!grading}
                        />
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={grading}
                            className={`rounded-xl py-4 flex-row items-center justify-center ${grading ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-900 dark:bg-white'}`}
                        >
                            {grading ? (
                                <ActivityIndicator color="#94a3b8" size="small" />
                            ) : (
                                <Text className="text-white dark:text-slate-900 font-bold text-[16px]">Mark Answer</Text>
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#010100' : '#ffffff';
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
            const uri = await captureRef(viewShotRef.current, { format: 'png', quality: 1.0 });
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
                if (asset.size && asset.size > 2 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a file smaller than 2MB. Ensure it contains extractable text.');
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

    const mcqAnswered = Object.keys(selectedAnswers).length;
    const theoryAnswered = Object.keys(theoryResults).length;
    const totalAnswered = mcqAnswered + theoryAnswered;
    const correctCount = Object.entries(selectedAnswers).filter(([qi, ans]) => questions[+qi]?.correct_answer === ans).length
        + Object.values(theoryResults).filter(Boolean).length;

    // Save quiz history
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
            api.post('/quizzes/history', payload).catch(err => { console.warn('Failed to save quiz history', err); });
        }
    }, [totalAnswered]);

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        return (
            <View className="flex-1 bg-white dark:bg-brand-dark">
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 60, paddingTop: 100 }} showsVerticalScrollIndicator={false}>

                    <Text className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white mb-8">Build Quiz</Text>

                    {/* Source Selector Segment Flat Style */}
                    <View className="flex-row bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 mb-8 border-2 border-slate-100 dark:border-slate-800">
                        {(['topic', 'file'] as QuizMode[]).map(m => (
                            <TouchableOpacity key={m} onPress={() => { setMode(m); if (m === 'topic') setSelectedFile(null); }}
                                className="flex-1 items-center justify-center py-3 rounded-xl"
                                style={[
                                    mode === m ? {
                                        backgroundColor: isDark ? '#010100' : '#ffffff',
                                        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
                                        borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0'
                                    } : {}
                                ]}>
                                <Text
                                    className="font-black text-[14px] uppercase tracking-widest"
                                    style={{ color: mode === m ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#475569' : '#94a3b8') }}
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
                                <TouchableOpacity onPress={handleFileSelect} className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] p-8 items-center bg-slate-50 dark:bg-slate-900/50">
                                    {selectedFile ? (
                                        <>
                                            <Ionicons name="document-text" size={40} color={isDark ? '#e2e8f0' : '#0f172a'} />
                                            <Text className="text-[15px] font-bold text-slate-900 dark:text-white mt-4 text-center">{selectedFile.name}</Text>
                                            <Text className="text-[12px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Tap to change</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="folder-open" size={40} color="#cbd5e1" />
                                            <Text className="text-[15px] font-bold text-slate-500 mt-4">Tap to select PDF/DOCX/TXT</Text>
                                            <Text className="text-[12px] font-bold text-slate-400 mt-2">Max 2MB</Text>
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
                                        ? { borderColor: isDark ? '#ffffff' : '#0f172a', backgroundColor: isDark ? '#ffffff' : '#0f172a' }
                                        : { borderColor: isDark ? '#1e293b' : '#e2e8f0', backgroundColor: isDark ? '#0f172a' : '#ffffff' }
                                ]}>
                                <Text
                                    className="font-black text-[13px] uppercase tracking-widest"
                                    style={{ color: difficulty === d ? (isDark ? '#0f172a' : '#ffffff') : '#94a3b8' }}
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
                                        ? { borderColor: isDark ? '#ffffff' : '#0f172a', backgroundColor: isDark ? '#ffffff' : '#0f172a' }
                                        : { borderColor: isDark ? '#1e293b' : '#e2e8f0', backgroundColor: isDark ? '#0f172a' : '#ffffff' }
                                ]}>
                                <Text
                                    className="font-black text-[13px] uppercase tracking-widest"
                                    style={{ color: format === f.id ? (isDark ? '#0f172a' : '#ffffff') : '#94a3b8' }}
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

                    <GradientButton
                        onPress={handleGenerate}
                        loading={isLoading}
                    >
                        {isLoading ? 'Generating Context...' : 'Generate Quiz'}
                    </GradientButton>

                    <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-6">
                        Estimated Cost: {parseInt(questionCount) || 10} Credits
                    </Text>
                </ScrollView>
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <Stack.Screen options={{ title: 'Quiz Active', headerShown: true, headerStyle: { backgroundColor: bgColor }, headerTintColor: tintColor, headerBackVisible: false, headerShadowVisible: false }} />

            {/* Flat header bar */}
            <View className="border-b-2 border-slate-100 dark:border-slate-900 px-6 py-4 flex-row items-center justify-between bg-white dark:bg-brand-dark z-20">
                <Text className="text-slate-500 font-black text-[12px] uppercase tracking-widest">{totalAnswered}/{questions.length} DONE</Text>
                {timerEnabled && timeLeft > 0 && (
                    <View className={`border-2 px-3 py-1 rounded-full ${timeLeft < 60 ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        <Text className={`font-black text-[13px] tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatTime(timeLeft)}</Text>
                    </View>
                )}
                <Text className="text-[#2EBD85] font-black text-[12px] uppercase tracking-widest">{correctCount} RIGHT</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: totalAnswered === questions.length ? 140 : 60 }} showsVerticalScrollIndicator={false}>
                {questions.map((q, qi) =>
                    q.question_type === 'multiple_choice' ? (
                        <MCQCard key={qi} q={q} qi={qi} onAnswer={handleMCQAnswer} selectedAnswer={selectedAnswers[qi]} quizFinished={totalAnswered === questions.length} />
                    ) : (
                        <TheoryCard key={qi} q={q} qi={qi} onGraded={handleTheoryGraded} />
                    )
                )}
            </ScrollView>

            {/* Sticky completion footer solid Stake flat style */}
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

                    <View className="absolute bottom-0 left-0 right-0 bg-slate-900 dark:bg-white px-6 py-6 pb-10 flex-row items-center justify-between border-t border-slate-800 dark:border-slate-200 shadow-2xl">
                        <View className="flex-1">
                            <Text className="text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-widest mb-1">Results</Text>
                            <Text className="text-white dark:text-slate-900 font-black text-[28px] tracking-tight">{Math.round((correctCount / questions.length) * 100)}%</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleShare}
                                disabled={isSharing}
                                className="bg-slate-800 dark:bg-slate-100 rounded-xl px-5 py-4 justify-center items-center flex-row"
                            >
                                {isSharing ? (
                                    <ActivityIndicator size="small" color={isDark ? '#0f172a' : 'white'} />
                                ) : (
                                    <Text className="text-white dark:text-slate-900 font-bold text-[14px]">Share</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); if (timerRef.current) clearInterval(timerRef.current); }}
                                className="bg-white dark:bg-slate-900 rounded-xl px-6 py-4 justify-center items-center flex-row"
                            >
                                <Text className="text-slate-900 dark:text-white font-black text-[14px]">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    cardOuter: { marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(148, 163, 184, 0.1)' },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18, marginBottom: 12 },
    optionText: { fontSize: 15, fontWeight: '700' },
    explainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTopWidth: 2, borderTopColor: 'rgba(148, 163, 184, 0.1)' },
});
