import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, useColorScheme } from 'react-native';
import { Star, WarningTriangle, Sparks } from 'iconoir-react-native';
import { api } from '@/lib/api';
import { Question, TheoryResult } from './QuizTypes';
import { MathText } from '../ui/MathText';
import { Colors, Spacing, Radius } from '@/constants/theme';

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
    const C = Colors[isDark ? 'dark' : 'light'];

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
        <View style={s.cardOuter}>
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
                    content={q.question_text}
                    color={C.text}
                    fontSize={17}
                    containerStyle={{ minHeight: 50, marginBottom: 8 }}
                />

                {result ? (
                    <View style={s.resultSection}>
                        {(() => {
                            const isVeryCorrect = result.score === result.max;
                            const isPartiallyCorrect = result.score > 0 && result.score < result.max;
                            const isWrong = result.score === 0;
                            
                            let label = isVeryCorrect ? 'Correct' : isPartiallyCorrect ? 'Almost there' : "You didn't get it";
                            let color = isVeryCorrect ? '#34C759' : isPartiallyCorrect ? '#FF9500' : '#FF3B30';
                            let iconColor = isVeryCorrect ? '#34C759' : isPartiallyCorrect ? '#FF9500' : '#FF3B30';

                            return (
                                <View style={[s.scoreBox, { borderColor: color, backgroundColor: color + '10' }]}>
                                    <View style={[s.scoreIconCircle, { backgroundColor: color }]}>
                                        {isVeryCorrect ? (
                                            <Star width={18} height={18} color="#fff" />
                                        ) : (
                                            <WarningTriangle width={18} height={18} color="#fff" />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={[s.scoreText, { color: color }]}>{label}</Text>
                                    </View>
                                </View>
                            );
                        })()}

                        <Text style={[s.sectionTitle, { color: C.textTertiary }]}>AI Feedback</Text>
                        <View style={[s.feedbackBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator }]}>
                            <MathText
                                content={result.feedback}
                                color={C.textSecondary}
                                fontSize={15}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={s.inputSection}>
                        <TextInput
                            multiline
                            placeholder="Write your answer..."
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={answer}
                            onChangeText={setAnswer}
                            style={[
                                s.textArea,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator, color: C.text }
                            ]}
                            textAlignVertical="top"
                            editable={!grading}
                        />

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={grading || answer.trim().length === 0}
                            activeOpacity={0.8}
                            style={[s.submitBtn, { backgroundColor: grading ? (isDark ? '#2C2C2E' : '#E5E5EA') : C.primary }]}
                        >
                            {grading ? (
                                <ActivityIndicator color={C.textTertiary} size="small" />
                            ) : (
                                <>
                                    <Sparks width={18} height={18} color="#fff" />
                                    <Text style={s.submitBtnText}>Mark Answer</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
    
    resultSection: { marginTop: 24 },
    scoreBox: { borderRadius: 16, borderWidth: 2, flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 16 },
    scoreIconCircle: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16, width: 44, height: 44 },
    scoreText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    scoreLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
    
    sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    feedbackBox: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },

    inputSection: { marginTop: 24 },
    textArea: { height: 160, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '500', borderWidth: StyleSheet.hairlineWidth, marginBottom: 20 },
    
    submitBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

