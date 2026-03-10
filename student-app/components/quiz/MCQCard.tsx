import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizFlipCard } from './QuizFlipCard';
import { Question, DIFF_COLORS } from './QuizTypes';
import { MathText } from '../ui/MathText';

export function MCQCard({
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
        <View className="bg-white dark:bg-brand-dark rounded-[24px] p-6 border-2 border-brand-primary/10 dark:border-brand-primary/20">
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text className="text-[12px] font-black tracking-widest uppercase text-slate-400">Q{qi + 1} · MCQ</Text>
                <View style={[styles.diffBadge, { borderWidth: 1, borderColor: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[q.difficulty_level] ?? '#FCD34D' }]}>
                        {q.difficulty_level}
                    </Text>
                </View>
            </View>
            <MathText
                content={q.question_text}
                color={isDark ? 'white' : '#0f172a'}
                fontSize={17}
                containerStyle={{ minHeight: 60 }}
            />

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
                <TouchableOpacity
                    onPress={() => setFlipped(true)}
                    style={styles.explainBtn}
                    activeOpacity={0.7}
                >
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
                    <View className="bg-slate-900 dark:bg-white rounded-xl px-4 py-2">
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
            <MathText
                content={q.explanation || ''}
                color={isDark ? '#e2e8f0' : '#1e293b'}
                fontSize={15}
                containerStyle={{ flex: 1 }}
            />
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

const styles = StyleSheet.create({
    cardOuter: { marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(148, 163, 184, 0.1)' },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18, marginBottom: 12 },
    optionText: { fontSize: 15, fontWeight: '700' },
    explainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTopWidth: 2, borderTopColor: 'rgba(148, 163, 184, 0.1)' },
});
