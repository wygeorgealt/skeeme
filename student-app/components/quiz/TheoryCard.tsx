import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { Question, DIFF_COLORS, TheoryResult } from './QuizTypes';
import { MathText } from '../ui/MathText';

export function TheoryCard({
    q, qi, onGraded,
}: {
    q: Question;
    qi: number;
    onGraded: (qi: number, passed: boolean) => void;
}) {
    const [answer, setAnswer] = useState('');
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState<TheoryResult | null>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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
            <View className="bg-white dark:bg-brand-dark rounded-[24px] p-6 border-2 border-brand-primary/10 dark:border-brand-primary/20">
                <View style={styles.cardHeader}>
                    <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400">Q{qi + 1} · Theory</Text>
                    <View style={[styles.diffBadge, { borderWidth: 1, borderColor: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                        <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>{q.difficulty_level}</Text>
                    </View>
                </View>
                <MathText
                    content={q.question_text}
                    color={isDark ? 'white' : '#0f172a'}
                    fontSize={17}
                    containerStyle={{ minHeight: 50, marginBottom: 8 }}
                />

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
                        <MathText
                            content={result.feedback}
                            color={isDark ? '#e2e8f0' : '#1e293b'}
                            fontSize={15}
                            containerStyle={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', padding: 16, borderRadius: 12, borderWeight: 1, borderColor: isDark ? '#334155' : '#f1f5f9' }}
                        />
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
                            className={`rounded-xl py-4 flex-row items-center justify-center ${grading ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-primary'}`}
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

const styles = StyleSheet.create({
    cardOuter: { marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(148, 163, 184, 0.1)' },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
});
