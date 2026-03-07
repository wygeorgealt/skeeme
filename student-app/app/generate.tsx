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
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { QuizShareCard } from '@/components/QuizShareCard';
import { RewardModal } from '@/components/RewardModal';

import { QuizMode, Difficulty, FormatType, Question, TheoryResult } from '@/components/quiz/QuizTypes';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';



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

    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reward Modal State
    const [rewardData, setRewardData] = useState<any>(null);
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);

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
            api.post('/quizzes/history', payload).then(res => {
                if (res.data.reward?.earned) {
                    setRewardData(res.data.reward);
                    setIsRewardModalVisible(true);
                }
            }).catch(err => { console.warn('Failed to save quiz history', err); });
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

            <RewardModal
                isVisible={isRewardModalVisible}
                onClose={() => setIsRewardModalVisible(false)}
                reward={rewardData}
            />
        </View>
    );
}

