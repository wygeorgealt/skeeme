import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { CheckCircle, XmarkCircle, Check, Xmark, NavArrowLeft } from 'iconoir-react-native';
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

    const getOptionStyles = (opt: string) => {
        const isSelected = selectedAnswer === opt;
        const isCorrectOpt = opt === q.correct_answer;
        
        if (!answered) {
            return {
                container: isDark ? 'border-slate-800 bg-[#161618]/50' : 'border-slate-100 bg-slate-50',
                text: isDark ? 'text-white' : 'text-slate-900',
                icon: null,
                iconColor: ''
            };
        }

        if (isCorrectOpt) {
            return {
                container: 'border-brand-primary bg-brand-primary/10',
                text: 'text-brand-primary',
                icon: 'checkmark-circle' as const,
                iconColor: '#A1C4FD'
            };
        }

        if (isSelected && !isCorrectOpt) {
            return {
                container: 'border-red-500 bg-red-500/10',
                text: 'text-red-500',
                icon: 'close-circle' as const,
                iconColor: '#ef4444'
            };
        }

        return {
            container: isDark ? 'border-slate-800 bg-transparent' : 'border-slate-100 bg-transparent',
            text: isDark ? 'text-slate-500' : 'text-slate-400',
            icon: null,
            iconColor: ''
        };
    };

    const front = (
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
                containerStyle={{ minHeight: 60 }}
            />

            {/* Options */}
            <View className="mt-6 gap-3">
                {q.options.map((opt, oi) => {
                    const styles = getOptionStyles(opt);
                    return (
                        <TouchableOpacity
                            key={oi}
                            activeOpacity={answered ? 1 : 0.8}
                            onPress={() => { if (!answered && !quizFinished) onAnswer(qi, opt); }}
                            className={`flex-row items-center p-4 rounded-xl border-2 ${styles.container}`}
                        >
                            <Text className={`flex-1 font-semibold text-[14px] ${styles.text}`}>{opt}</Text>
                            {styles.icon === 'checkmark-circle' && <CheckCircle width={18} height={18} color={styles.iconColor} />}
                            {styles.icon === 'close-circle' && <XmarkCircle width={18} height={18} color={styles.iconColor} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Flip to Explain button */}
            {answered && q.explanation ? (
                <View className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex-row items-center justify-between">
                    <View className={`px-3 py-1.5 rounded-lg flex-row items-center border ${isCorrect ? 'border-brand-primary bg-brand-primary/5' : 'border-red-500 bg-red-500/5'}`}>
                        {isCorrect ? (
                            <Check width={14} height={14} color="#A1C4FD" />
                        ) : (
                            <Xmark width={14} height={14} color="#ef4444" />
                        )}
                        <Text className={`font-bold ml-1.5 text-[11px] uppercase tracking-wider ${isCorrect ? 'text-brand-primary' : 'text-red-500'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                        </Text>
                    </View>
                    
                    <TouchableOpacity
                        onPress={() => setFlipped(true)}
                        activeOpacity={0.8}
                        className={`h-10 px-5 rounded-lg items-center justify-center ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                    >
                        <Text className={`font-bold text-[12px] ${isDark ? 'text-slate-900' : 'text-white'}`}>See Explanation</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );

    const back = (
        <View className={`rounded-[24px] p-5 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <TouchableOpacity onPress={() => setFlipped(false)} className="flex-row items-center mb-5">
                <NavArrowLeft width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                <Text className={`font-bold ml-2 text-[13px] uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Back</Text>
            </TouchableOpacity>
            
            <Text className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3 ml-1">Explanation</Text>
            <View className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <MathText
                    content={q.explanation || ''}
                    color={isDark ? '#CBD5E1' : '#475569'}
                    fontSize={15}
                />
            </View>
            
            {!isCorrect && (
                <View className="mt-5 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <Text className="text-[10px] font-bold tracking-widest uppercase text-brand-primary mb-2 ml-1">Correct Answer</Text>
                    <View className={`p-4 rounded-lg border border-brand-primary/20 bg-brand-primary/5`}>
                        <Text className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.correct_answer}</Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View className="mb-6">
            <QuizFlipCard
                front={front}
                back={back}
                isFlipped={flipped}
            />
        </View>
    );
}
