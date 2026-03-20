import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, useColorScheme } from 'react-native';
import { Star, WarningTriangle, Sparks } from 'iconoir-react-native';
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
        <View className="mb-6">
            <View className={`rounded-[24px] p-5 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Text className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Question {qi + 1}</Text>
                    <View className={`px-2.5 py-1 rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {q.difficulty_level}
                        </Text>
                    </View>
                </View>

                <MathText
                    content={q.question_text}
                    color={isDark ? 'white' : '#121212'}
                    fontSize={17}
                    containerStyle={{ minHeight: 50, marginBottom: 8 }}
                />

                {result ? (
                    <View className="mt-6">
                        <View className={`p-4 rounded-xl border-2 flex-row items-center mb-5 ${result.passed ? 'border-brand-primary bg-brand-primary/5' : 'border-red-500 bg-red-500/5'}`}>
                            <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4 ${result.passed ? 'bg-brand-primary' : 'bg-red-500'}`}>
                                {result.passed ? (
                                    <Star width={18} height={18} color="#fff" />
                                ) : (
                                    <WarningTriangle width={18} height={18} color="#fff" />
                                )}
                            </View>
                            <View>
                                <Text className={`text-[18px] font-bold tracking-tight ${result.passed ? 'text-brand-primary' : 'text-red-500'}`}>
                                    {result.score}/{result.max} marks
                                </Text>
                                <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-0.5">
                                    {result.passed ? "Success" : "Needs Review"}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3 ml-1">AI Feedback</Text>
                        <View className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <MathText
                                content={result.feedback}
                                color={isDark ? '#CBD5E1' : '#475569'}
                                fontSize={15}
                            />
                        </View>
                    </View>
                ) : (
                    <View className="mt-6">
                        <TextInput
                            multiline
                            placeholder="Write your answer..."
                            placeholderTextColor="#94a3b8"
                            value={answer}
                            onChangeText={setAnswer}
                            className={`p-4 rounded-xl border-2 ${isDark ? 'bg-[#0f0f11] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} h-[160px] mb-5 text-[14px] font-medium`}
                            textAlignVertical="top"
                            editable={!grading}
                        />

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={grading || answer.trim().length === 0}
                            activeOpacity={0.8}
                            className={`h-[48px] rounded-xl items-center justify-center flex-row ${grading ? 'bg-slate-200 dark:bg-slate-800' : 'bg-brand-primary shadow-sm'}`}
                        >
                            {grading ? (
                                <ActivityIndicator color="#94a3b8" size="small" />
                            ) : (
                                <>
                                    <Sparks width={18} height={18} color="#fff" />
                                    <Text className="text-white font-bold text-[15px] ml-2">Mark Answer</Text>
                                </>
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
