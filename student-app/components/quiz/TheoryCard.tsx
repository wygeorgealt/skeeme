import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, useColorScheme } from 'react-native';
import { api } from '@/lib/api';
import { Question, TheoryResult } from './QuizTypes';
import { MathText } from '../ui/MathText';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import DangerTriangle from '@/assets/icons/pikaicons/troubleshoot.svg';
import Star from '@/assets/icons/pikaicons/award-medal.svg';
import Stars from '@/assets/icons/pikaicons/award-medal.svg';

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
        <View style={{ marginBottom: 20 }}>
            {/* Header matches active quiz header logic if needed, but here we focus on content */}

                {result ? (
                    <View style={{ marginTop: 20 }}>
                         {/* Results are now handled by the parent's bottom card for consistency in generate.tsx, 
                             but we show a small status indicator here if needed or just the feedback */}
                        <View style={[s.feedbackBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator, borderRadius: 24, padding: 20 }]}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: C.textTertiary, textTransform: 'uppercase', marginBottom: 12 }}>Your Answer Assessment</Text>
                            <MathText
                                content={result.feedback}
                                color={C.textSecondary}
                                fontSize={16}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: 10 }}>
                        <TextInput
                            multiline
                            placeholder="Type your detailed answer here..."
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={answer}
                            onChangeText={setAnswer}
                            style={[
                                s.textArea,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: C.separator, color: C.text, borderRadius: 24 }
                            ]}
                            textAlignVertical="top"
                            editable={!grading}
                        />

                        <View style={{ width: '100%', marginTop: 8 }}>
                            <AnimatedButton
                                title="Grade Answer"
                                onPress={handleSubmit}
                                disabled={grading || answer.trim().length === 0}
                                loading={grading}
                                type="capsule"
                                backgroundColor="#007AFF"
                                shadowColor="#0066D6"
                                fullWidth
                            />
                        </View>
                    </View>
                )}
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
