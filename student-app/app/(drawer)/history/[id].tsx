import { Text } from '@/components/ui/Text';
import { View, ScrollView, Pressable, Platform, Alert, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { useState, useRef, useEffect } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ShareCard } from '@/components/ui/ShareCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import * as Print from 'expo-print';
import { generateQuizHTML } from '@/lib/pdfGenerator';
import { MathText, formatMathPlainText } from '@/components/ui/MathText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { BlurView } from 'expo-blur';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { haptics } from '@/lib/haptics';
import Svg, { Circle } from 'react-native-svg';

// Storage helpers
const storage = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web') return localStorage.getItem(key);
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            return await FileSystem.readAsStringAsync(path);
        } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                const path = `${FileSystem.documentDirectory}${key}.json`;
                await FileSystem.writeAsStringAsync(path, value);
            }
        } catch { /* ignore */ }
    },
};

type QuizQuestionItem = {
    id: number;
    question: string;
    type: string;
    options: string | null;  // JSON string
    correct_answer: string;
    user_answer: string | null;
    is_correct: boolean;
    explanation: string | null;
};

type QuizSessionDetail = {
    id: number;
    topic: string;
    difficulty: string;
    score_percentage: number;
    total_questions: number;
    correct_answers: number;
    time_spent_seconds: number | null;
    created_at: string;
    questions: QuizQuestionItem[];
};

function HistoryQuestionCard({ q, index }: { q: QuizQuestionItem, index: number }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const isTheory = q.type === 'essay' || q.type === 'theory';
    const [showExplanation, setShowExplanation] = useState(!q.is_correct);

    const parsedOptions: string[] = (() => {
        const raw: any = q.options;
        if (Array.isArray(raw)) return raw;
        if (typeof raw !== 'string' || !raw) return [];
        try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
    })();

    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: 18,
                borderWidth: 1,
                borderColor: C.border,
                marginBottom: 14,
                gap: 12,
            }}
        >
            {/* Header Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: C.surfaceLow,
                        }}
                    >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: C.text }}>
                            Q{index + 1}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            paddingHorizontal: 9,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: q.is_correct
                                ? (isDark ? 'rgba(16,185,129,0.14)' : '#ECFDF5')
                                : (isDark ? 'rgba(239,68,68,0.14)' : '#FEF2F2'),
                        }}
                    >
                        <Icon
                            name={q.is_correct ? 'CheckCircle2' : 'XCircle'}
                            size={13}
                            color={q.is_correct ? 'success' : 'destructive'}
                        />
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color: q.is_correct ? '#10B981' : '#EF4444',
                            }}
                        >
                            {q.is_correct ? 'Correct' : 'Missed'}
                        </Text>
                    </View>
                </View>

                {q.explanation ? (
                    <Pressable
                        onPress={() => {
                            haptics.selectionAsync();
                            setShowExplanation(prev => !prev);
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 999,
                            backgroundColor: C.surfaceLow,
                        }}
                    >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }}>
                            {showExplanation ? 'Hide Why' : 'Explain'}
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Question Stem */}
            <MathText
                content={q.question}
                color={C.text}
                fontSize={15}
                fontWeight="700"
                containerStyle={{ width: '100%' }}
            />

            {/* Options / Model Answer */}
            {isTheory ? (
                <View style={{ gap: 10 }}>
                    <View
                        style={{
                            backgroundColor: C.surfaceLow,
                            borderRadius: 16,
                            padding: 14,
                            gap: 6,
                        }}
                    >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: C.textSecondary, letterSpacing: 1 }}>
                            MODEL ANSWER
                        </Text>
                        <MathText
                            content={q.correct_answer}
                            color={C.text}
                            fontSize={14}
                        />
                    </View>
                </View>
            ) : (
                <View style={{ gap: 8 }}>
                    {parsedOptions.map((opt, i) => {
                        const isSelected = q.user_answer === opt;
                        const isCorrectOpt = q.correct_answer === opt;
                        const letter = ['A', 'B', 'C', 'D', 'E'][i] || `${i + 1}`;

                        let rowBg = C.surfaceLow;
                        let rowBorder = 'transparent';
                        let optColor = C.textSecondary;
                        let badgeBg = C.card;
                        let badgeText = C.textSecondary;

                        if (isCorrectOpt) {
                            rowBg = isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5';
                            rowBorder = '#10B981';
                            optColor = isDark ? '#34D399' : '#047857';
                            badgeBg = '#10B981';
                            badgeText = '#FFFFFF';
                        } else if (isSelected && !isCorrectOpt) {
                            rowBg = isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2';
                            rowBorder = '#EF4444';
                            optColor = isDark ? '#F87171' : '#B91C1C';
                            badgeBg = '#EF4444';
                            badgeText = '#FFFFFF';
                        }

                        return (
                            <View
                                key={i}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 12,
                                    paddingVertical: 11,
                                    borderRadius: 14,
                                    backgroundColor: rowBg,
                                    borderWidth: 1,
                                    borderColor: rowBorder,
                                    gap: 10,
                                }}
                            >
                                <View
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        backgroundColor: badgeBg,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: badgeText }}>
                                        {letter}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <MathText content={opt} color={optColor} fontSize={14} fontWeight="600" />
                                </View>
                                {isCorrectOpt && <Icon name="CheckCircle2" size={16} color="success" />}
                                {isSelected && !isCorrectOpt && <Icon name="XCircle" size={16} color="destructive" />}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Collapsible AI Explanation */}
            {q.explanation && showExplanation && (
                <View
                    style={{
                        backgroundColor: C.surfaceLow,
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: C.border,
                        gap: 6,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon name="Lightbulb" size={14} color="default" />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: C.text, letterSpacing: 0.6 }}>
                            AI EXPLANATION
                        </Text>
                    </View>
                    <MathText
                        content={q.explanation}
                        color={C.textSecondary}
                        fontSize={14}
                    />
                </View>
            )}
        </View>
    );
}

export default function QuizHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const bgColor = C.background;
    const [isSharing, setIsSharing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [reviewFilter, setReviewFilter] = useState<'all' | 'missed' | 'correct'>('all');
    const [cachedSession, setCachedSession] = useState<QuizSessionDetail | null>(null);
    const viewShotRef = useRef<View>(null);
    const insets = useSafeAreaInsets();

    // Hydrate cache on mount
    useEffect(() => {
        const hydrate = async () => {
            const cacheKey = `cache_quiz_detail_${id}`;
            const cached = await storage.getItem(cacheKey);
            if (cached) setCachedSession(JSON.parse(cached));
        };
        hydrate();
    }, [id]);

    const { data: remoteSession, isLoading } = useQuery({
        queryKey: ['quiz-history', id],
        queryFn: async () => {
            const res = await api.get(`/quizzes/history/${id}`);
            const body = res.data?.data ?? res.data;
            const data = { ...body, questions: Array.isArray(body?.questions) ? body.questions : [] } as QuizSessionDetail;
            await storage.setItem(`cache_quiz_detail_${id}`, JSON.stringify(data));
            return data;
        }
    });

    const session = remoteSession || cachedSession;

    const handleExport = async () => {
        if (!session) return;
        setIsExporting(true);
        try {
            const html = generateQuizHTML(session.topic, session.score_percentage, session.questions ?? []);
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });
            await Sharing.shareAsync(uri);
        } catch (err) {
            if (__DEV__) console.warn('Quiz Export failed', err);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async () => {
        if (!viewShotRef.current) return;
        setIsSharing(true);
        try {
            const uri = await captureRef(viewShotRef.current, { format: 'png', quality: 1.0 });
            await Sharing.shareAsync(uri);
        } catch (e) {
            if (__DEV__) console.error(e);
        } finally {
            setIsSharing(false);
        }
    };

    if (isLoading && !session) return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader title="Quiz Report" />
            <View style={s.loadingHeader}>
                <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 20 }} />
                <SkeletonLoader width={120} height={40} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="60%" height={20} />
            </View>
            <View style={[s.contentContainer, isDark ? s.bgDark : s.bgWhite]}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={s.skeletonRow}>
                        <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
                        <View style={s.flex1}>
                            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    if (!session) return null;

    const scorePct = Math.round(session.score_percentage || 0);
    const totalQ = session.total_questions || (session.questions?.length ?? 0);
    const correctQ = session.correct_answers ?? (session.questions?.filter(q => q.is_correct).length ?? 0);
    const missedQ = Math.max(0, totalQ - correctQ);

    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: 'Excellent Mastery', subtitle: 'Topic mastered with high accuracy.', tier: 'A+ · Mastery', accent: '#10B981', icon: 'Trophy' as const };
        if (pct >= 75) return { title: 'Strong Understanding', subtitle: 'Great grasp of core concepts.', tier: 'B+ · Strong', accent: '#007AFF', icon: 'Award' as const };
        if (pct >= 50) return { title: 'Good Progress', subtitle: 'Review missed items below to lock this in.', tier: 'C · Developing', accent: '#F59E0B', icon: 'Target' as const };
        return { title: 'Needs Practice', subtitle: 'Review the explanations and retake.', tier: 'Review Mode', accent: '#EF4444', icon: 'Flame' as const };
    };

    const remark = getRemark(scorePct);
    const ringSize = 92;
    const ringStroke = 8;
    const ringRadius = (ringSize - ringStroke) / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringDashoffset = ringCircumference * (1 - Math.min(100, Math.max(0, scorePct)) / 100);

    const allQuestions = (session.questions ?? []).map((q, index) => ({ q, index }));
    const filteredQuestions = allQuestions.filter(({ q }) => {
        if (reviewFilter === 'missed') return !q.is_correct;
        if (reviewFilter === 'correct') return q.is_correct;
        return true;
    });

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <Stack.Screen options={{ headerShown: false }} />

            <ShareCard
                type="quiz"
                data={{ topic: session.topic, score_percentage: scorePct }}
                viewShotRef={viewShotRef}
            />

            <ScreenHeader
                title="Quiz Report"
                subtitle={formatMathPlainText(session.topic || 'Study Session')}
                rightAction={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable
                            onPress={handleShare}
                            disabled={isSharing}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: C.surfaceLow,
                                borderWidth: 1,
                                borderColor: C.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isSharing ? (
                                <LoadingSpinner size={16} color={C.primary} strokeWidth={2.5} />
                            ) : (
                                <Icon name="Share2" size={17} color="default" />
                            )}
                        </Pressable>
                        <Pressable
                            onPress={handleExport}
                            disabled={isExporting}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: C.surfaceLow,
                                borderWidth: 1,
                                borderColor: C.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isExporting ? (
                                <LoadingSpinner size={16} color={C.primary} strokeWidth={2.5} />
                            ) : (
                                <Icon name="Download" size={17} color="default" />
                            )}
                        </Pressable>
                    </View>
                }
            />

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 24) + 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Split Bento Scorecard Hero */}
                <View
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 28,
                        padding: 22,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 14,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    alignSelf: 'flex-start',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 999,
                                    backgroundColor: C.surfaceLow,
                                    marginBottom: 10,
                                }}
                            >
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: remark.accent }} />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.3 }}>
                                    {remark.tier}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                <Text style={{ fontSize: 48, fontWeight: '900', color: C.text, letterSpacing: -1.8, lineHeight: 52 }}>
                                    {scorePct}%
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textSecondary }}>
                                    SCORE
                                </Text>
                            </View>

                            <Text style={{ fontSize: 16, fontWeight: '800', color: C.text, marginTop: 6 }}>
                                {remark.title}
                            </Text>
                            <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2, lineHeight: 18 }}>
                                {remark.subtitle}
                            </Text>
                        </View>

                        <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={ringSize} height={ringSize}>
                                <Circle
                                    cx={ringSize / 2}
                                    cy={ringSize / 2}
                                    r={ringRadius}
                                    stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                                    strokeWidth={ringStroke}
                                    fill="none"
                                />
                                <Circle
                                    cx={ringSize / 2}
                                    cy={ringSize / 2}
                                    r={ringRadius}
                                    stroke={remark.accent}
                                    strokeWidth={ringStroke}
                                    strokeDasharray={ringCircumference}
                                    strokeDashoffset={ringDashoffset}
                                    strokeLinecap="round"
                                    fill="none"
                                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                                />
                            </Svg>
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 46,
                                    height: 46,
                                    borderRadius: 15,
                                    backgroundColor: C.surfaceLow,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon name={remark.icon} size={22} color="default" />
                            </View>
                        </View>
                    </View>

                    {/* Segmented Accuracy Bar */}
                    <View style={{ marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary }} numberOfLines={1}>
                                Topic: {formatMathPlainText(session.topic)}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }}>
                                {correctQ} of {totalQ} correct
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: C.surfaceLow, gap: 3 }}>
                            {correctQ > 0 && (
                                <View style={{ flex: correctQ, backgroundColor: '#10B981', borderRadius: 4 }} />
                            )}
                            {missedQ > 0 && (
                                <View style={{ flex: missedQ, backgroundColor: '#EF4444', borderRadius: 4 }} />
                            )}
                        </View>
                    </View>
                </View>

                {/* 3-Column Bento Metrics Strip */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: C.card,
                            borderRadius: 22,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: C.border,
                            gap: 10,
                        }}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="CheckCircle2" size={18} color="default" />
                        </View>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>
                                {correctQ}/{totalQ}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginTop: 1 }}>
                                Correct
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: C.card,
                            borderRadius: 22,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: C.border,
                            gap: 10,
                        }}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="XCircle" size={18} color="default" />
                        </View>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>
                                {missedQ}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginTop: 1 }}>
                                Missed
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: C.card,
                            borderRadius: 22,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: C.border,
                            gap: 10,
                        }}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="Brain" size={18} color="default" />
                        </View>
                        <View>
                            <Text style={{ fontSize: 17, fontWeight: '800', color: C.text, textTransform: 'capitalize' }} numberOfLines={1}>
                                {session.difficulty || 'Standard'}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginTop: 1 }}>
                                Difficulty
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Detailed Review Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: C.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="Layers" size={15} color="default" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>
                        Detailed Review
                    </Text>
                </View>

                {allQuestions.map(({ q, index }) => (
                    <HistoryQuestionCard key={q.id || index} q={q} index={index} />
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    qCard: { marginBottom: 40 },
    qHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
    qIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    bgEmerald10: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    bgRed10: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    qLabel: { fontSize: 11, fontWeight: '700', color: '#007AFF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    answerPl: { paddingLeft: 56 },
    modelAnswerLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    feedbackBox: { padding: 20, borderRadius: 24 },
    bgEmeraldDark: { backgroundColor: 'rgba(16, 185, 129, 0.05)' },
    bgEmeraldLight: { backgroundColor: '#F0FDF4' },
    feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    feedbackTitle: { fontSize: 10, fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8 },

    optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, height: 56, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    borderWhite5: { borderColor: 'rgba(255,255,255,0.05)' },
    borderSlate100: { borderColor: '#F1F5F9' },
    bgEmerald50: { backgroundColor: '#ECFDF5' },
    bgRed50: { backgroundColor: '#FEF2F2' },
    textEmerald400: { color: '#34D399' },
    textEmerald700: { color: '#047857' },
    textRed400: { color: '#F87171' },
    textRed700: { color: '#B91C1C' },
    optionText: { flex: 1, fontWeight: '500', fontSize: 14 },

    topControls: { paddingHorizontal: 24, paddingBottom: 24 },
    backBtnSkeleton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
    loadingHeader: { alignItems: 'center', paddingVertical: 40 },
    contentContainer: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 40 },
    bgDark: { backgroundColor: '#090A0F' },
    bgWhite: { backgroundColor: 'white' },
    skeletonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },

    shareArea: { position: 'absolute', left: -9999, top: -9999 },
    scrollView: { flex: 1 },
    headerRow: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    menuBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgSlate100: { backgroundColor: '#F1F5F9' },
    bgSlate900: { backgroundColor: '#0f172a' },
    headerText: { fontSize: 16, fontWeight: '700' },
    size12: { width: 48 },

    scoreArea: { alignItems: 'center', paddingTop: 24, paddingBottom: 48 },
    scoreIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    scoreTag: { color: '#007AFF', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
    scoreText: { fontSize: 64, fontWeight: '900', letterSpacing: -2 },
    scoreSubtitle: { fontSize: 15, paddingHorizontal: 24, textAlign: 'center', fontWeight: '500', lineHeight: 22 },

    topicBox: { padding: 24, borderRadius: 24, marginBottom: 32 },
    bgGrayDark: { backgroundColor: '#13151B' },
    bgGrayLight: { backgroundColor: '#F8FAFC' },
    topicLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    topicTitle: { fontSize: 18, fontWeight: '700' },

    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    statCard: { flex: 1, padding: 24, borderRadius: 24 },
    statLabelCorrect: { color: '#10B981', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    statLabelMissed: { color: '#EF4444', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    statValue: { fontSize: 28, fontWeight: '900' },

    reviewDividerRow: { marginBottom: 24, flexDirection: 'row', alignItems: 'center' },
    dividerLine: { width: 4, height: 16, backgroundColor: '#007AFF', borderRadius: 2, marginRight: 12 },
    reviewTitle: { fontSize: 15, fontWeight: '700' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, flexDirection: 'row', gap: 16 },
    footerDark: {},
    footerLight: {},
    exportBtn: { flex: 1, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    exportBtnContent: { flexDirection: 'row', alignItems: 'center' },
    exportBtnText: { fontWeight: '700', fontSize: 16, marginLeft: 12 },
    textBlack: { color: 'black' },
    shareBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF' },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textWhite40: { color: 'rgba(255,255,255,0.4)' },
    textWhite60: { color: 'rgba(255,255,255,0.6)' },
    textWhite30: { color: 'rgba(255,255,255,0.3)' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
});
