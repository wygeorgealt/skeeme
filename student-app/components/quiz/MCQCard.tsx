import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { QuizFlipCard } from './QuizFlipCard';
import { Question } from './QuizTypes';
import { MathText } from '../ui/MathText';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { AltArrowLeft, CheckCircle, CloseCircle, Refresh } from '@solar-icons/react-native/Bold';

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
    const C = Colors[isDark ? 'dark' : 'light'];

    const getOptionStyles = (opt: string) => {
        const isSelected = selectedAnswer === opt;
        const isCorrectOpt = opt === q.correct_answer;
        
        if (!answered) {
            return {
                container: { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator },
                text: { color: C.text },
                icon: null,
                iconColor: ''
            };
        }

        if (isCorrectOpt) {
            return {
                container: { borderColor: C.success, backgroundColor: isDark ? 'rgba(48,209,88,0.1)' : 'rgba(52,199,89,0.1)' },
                text: { color: C.success },
                icon: 'checkmark-circle' as const,
                iconColor: C.success
            };
        }

        if (isSelected && !isCorrectOpt) {
            return {
                container: { borderColor: C.destructive, backgroundColor: isDark ? 'rgba(255,69,58,0.1)' : 'rgba(255,59,48,0.1)' },
                text: { color: C.destructive },
                icon: 'close-circle' as const,
                iconColor: C.destructive
            };
        }

        return {
            container: { borderColor: C.separator, opacity: 0.5 },
            text: { color: C.textSecondary },
            icon: null,
            iconColor: ''
        };
    };

    const front = (
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.separator }]}>
            {/* Header */}
            <View style={[s.cardHeader, { borderBottomColor: C.separator }]}>
                <Text style={[s.qNum, { color: C.textTertiary }]}>Question {qi + 1}</Text>
                <View style={[s.diffBadge, { borderColor: C.separator }]}>
                    <Text style={[s.diffText, { color: C.textSecondary }]}>
                        {q.difficulty_level}
                    </Text>
                </View>
            </View>

            <MathText
                content={q.question_text || ''}
                color={C.text}
                fontSize={17}
                containerStyle={{ minHeight: 60 }}
            />

            {/* Options */}
            <View style={s.optionsGrid}>
                {(q.options || []).map((opt, oi) => {
                    const styles = getOptionStyles(opt);
                    return (
                        <TouchableOpacity
                            key={oi}
                            activeOpacity={answered ? 1 : 0.8}
                            onPress={() => { if (!answered && !quizFinished) onAnswer(qi, opt); }}
                            style={[s.optionBtn, styles.container]}
                        >
                            <View style={{ flex: 1, paddingRight: 8 }}>
                                <MathText content={opt} color={styles.text.color} fontSize={15} />
                            </View>
                            {styles.icon === 'checkmark-circle' && <CheckCircle size={18} color={styles.iconColor} />}
                            {styles.icon === 'close-circle' && <CloseCircle size={18} color={styles.iconColor} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Flip to Explain button */}
            {answered && (
                <View style={[s.footer, { borderTopColor: C.separator }]}>
                    <View style={[s.statusBadge, { borderColor: isCorrect ? C.success : C.destructive, backgroundColor: isCorrect ? (isDark ? 'rgba(48,209,88,0.1)' : 'rgba(52,199,89,0.1)') : (isDark ? 'rgba(255,69,58,0.1)' : 'rgba(255,59,48,0.1)') }]}>
                        {isCorrect ? (
                            <CheckCircle size={14} color={C.success} />
                        ) : (
                            <CloseCircle size={14} color={C.destructive} />
                        )}
                        <Text style={[s.statusText, { color: isCorrect ? C.success : C.destructive }]}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                        </Text>
                    </View>
                    
                    <TouchableOpacity
                        onPress={() => setFlipped(true)}
                        activeOpacity={0.8}
                        style={[s.explainBtn, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    >
                        <Refresh size={16} color={isDark ? '#000' : '#FFF'} style={{ marginRight: 8 }} />
                        <Text style={[s.explainBtnText, { color: isDark ? '#000' : '#FFF' }]}>Flip for Explanation</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const back = (
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.separator }]}>
            <TouchableOpacity onPress={() => setFlipped(false)} style={s.backBtn}>
                <AltArrowLeft size={18} color={C.text} />
                <Text style={[s.backText, { color: C.text }]}>Back</Text>
            </TouchableOpacity>
            
            <Text style={[s.sectionTitle, { color: C.textTertiary }]}>Explanation</Text>
            <View style={[s.feedbackBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator }]}>
                {q.explanation ? (
                    <MathText
                        content={q.explanation}
                        color={C.textSecondary}
                        fontSize={15}
                    />
                ) : (
                    <Text style={{ color: C.textSecondary, fontStyle: 'italic', fontSize: 13 }}>No explanation provided for this question.</Text>
                )}
            </View>
            
            {!isCorrect && q.correct_answer && (
                <View style={[s.correctSection, { borderTopColor: C.separator }]}>
                    <Text style={[s.correctTitle, { color: C.primary }]}>Correct Answer</Text>
                        <View style={[s.correctBox, { borderColor: C.primary + '30', backgroundColor: C.primary + '10' }]}>
                            <MathText content={q.correct_answer} color={C.text} fontSize={15} />
                        </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={s.cardOuter}>
            <QuizFlipCard
                front={front}
                back={back}
                isFlipped={flipped}
            />
        </View>
    );
}

const s = StyleSheet.create({
    cardOuter: { marginBottom: Spacing.lg },
    card: { borderRadius: Radius.lg, padding: 20, borderWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    qNum: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
    diffText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    optionsGrid: { marginTop: 24, gap: 12 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2 },
    optionText: { flex: 1, fontWeight: '600', fontSize: 15 },

    footer: { marginTop: 24, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'column', gap: 12, paddingTop: 20 },
    statusBadge: { borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
    statusText: { fontWeight: '700', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, marginLeft: 6 },
    
    explainBtn: { borderRadius: 100, alignItems: 'center', justifyContent: 'center', height: 48, flexDirection: 'row', width: '100%' },
    explainBtnText: { fontWeight: '700', fontSize: 14 },

    backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backText: { fontWeight: '700', marginLeft: 8, textTransform: 'uppercase', fontSize: 13, letterSpacing: 1 },
    
    sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    feedbackBox: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
    
    correctSection: { marginTop: 20, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth },
    correctTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
    correctBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
    correctAnswerText: { fontWeight: '600', fontSize: 15 },
});
