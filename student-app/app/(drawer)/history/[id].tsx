import { Text } from '@/components/ui/Text';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme, Platform, Alert, StyleSheet } from 'react-native';
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
import { MathText } from '@/components/ui/MathText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick01Icon, Cancel01Icon, MagicWand01Icon, CheckmarkCircle01Icon, IdeaIcon, ArrowLeft01Icon, DocumentCodeIcon, Share01Icon } from '@hugeicons/core-free-icons';
import { BlurView } from 'expo-blur';

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
    const isTheory = q.type === 'essay' || q.type === 'theory';
    const parsedOptions: string[] = q.options ? JSON.parse(q.options) : [];

    return (
        <View style={s.qCard}>
            {/* Header */}
            <View style={s.qHeader}>
                <View style={[s.qIcon, q.is_correct ? s.bgEmerald10 : s.bgRed10]}>
                    {q.is_correct ? (
                        <HugeiconsIcon icon={Tick01Icon} size={18} color="#10b981" />
                    ) : (
                        <HugeiconsIcon icon={Cancel01Icon} size={18} color="#ef4444" />
                    )}
                </View>
                <View style={s.flex1}>
                    <Text style={s.qLabel}>
                        Question {index + 1}
                    </Text>
                    <MathText
                        content={q.question}
                        color={isDark ? 'white' : '#0f172a'}
                        fontSize={18}
                        containerStyle={{ width: '100%' }}
                    />
                </View>
            </View>

            {/* Answer Display */}
            <View style={s.answerPl}>
                {isTheory ? (
                    <View>
                        <View>
                            <Text style={s.modelAnswerLabel}>Model Answer</Text>
                            <MathText
                                content={q.correct_answer}
                                color={isDark ? '#cbd5e1' : '#334155'}
                                fontSize={15}
                            />
                        </View>
                        {q.explanation && (
                            <View style={[s.feedbackBox, isDark ? s.bgEmeraldDark : s.bgEmeraldLight, { marginTop: 24 }]}>
                                <View style={s.feedbackHeader}>
                                    <HugeiconsIcon icon={MagicWand01Icon} size={14} color="#10b981" />
                                    <Text style={s.feedbackTitle}>AI Feedback</Text>
                                </View>
                                <MathText
                                    content={q.explanation}
                                    color={isDark ? '#bef264' : '#064e3b'}
                                    fontSize={15}
                                />
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        {parsedOptions.map((opt, i) => {
                            const isSelected = q.user_answer === opt;
                            const isCorrectOpt = q.correct_answer === opt;

                            let bg = null, 
                                borderColor = isDark ? s.borderWhite5 : s.borderSlate100,
                                text = isDark ? s.textWhite40 : s.textSlate400,
                                icon = null;

                            if (isCorrectOpt) {
                                bg = isDark ? s.bgEmerald10 : s.bgEmerald50; 
                                text = isDark ? s.textEmerald400 : s.textEmerald700; 
                                icon = 'checkmark-circle';
                            } else if (isSelected && !isCorrectOpt) {
                                bg = isDark ? s.bgRed10 : s.bgRed50; 
                                text = isDark ? s.textRed400 : s.textRed700; 
                                icon = 'close-circle';
                            }

                            return (
                                <View key={i} style={[s.optionRow, bg, borderColor]}>
                                    <Text style={[s.optionText, text]}>{opt}</Text>
                                    {icon === 'checkmark-circle' && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} color="#10b981" />}
                                    {icon === 'close-circle' && <HugeiconsIcon icon={Cancel01Icon} size={18} color="#ef4444" />}
                                </View>
                            );
                        })}
                        
                        {q.explanation && (
                            <View style={[s.feedbackBox, isDark ? s.bgEmeraldDark : s.bgEmeraldLight]}>
                                <View style={s.feedbackHeader}>
                                    <HugeiconsIcon icon={IdeaIcon} size={14} color="#10b981" />
                                    <Text style={s.feedbackTitle}>Explanation</Text>
                                </View>
                                <MathText
                                    content={q.explanation}
                                    color={isDark ? '#bef264' : '#064e3b'}
                                    fontSize={15}
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default function QuizHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#121212';
    const [isSharing, setIsSharing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
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
            const data = res.data.data as QuizSessionDetail;
            await storage.setItem(`cache_quiz_detail_${id}`, JSON.stringify(data));
            return data;
        }
    });

    const session = remoteSession || cachedSession;

    const handleExport = async () => {
        if (!session) return;
        setIsExporting(true);
        try {
            const html = generateQuizHTML(session.topic, session.score_percentage, session.questions);
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

    if (isLoading && !session) return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[s.topControls, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtnSkeleton}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="white" />
                </TouchableOpacity>
            </View>
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

    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "GENIUS!", subtitle: "Incredible work. You've mastered this topic.", icon: "star" };
        if (pct >= 80) return { title: "GREAT JOB!", subtitle: "Solid understanding. Keep pushing forward!", icon: "trophy" };
        if (pct >= 60) return { title: "GOOD EFFORT!", subtitle: "You're getting there. A quick review will help.", icon: "school" };
        return { title: "KEEP TRYING!", subtitle: "Learning is a journey. Review and try again!", icon: "trending-up" };
    };

    const remark = getRemark(session.score_percentage);

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <Stack.Screen options={{ headerShown: false }} />

            <ShareCard
                type="quiz"
                data={{ topic: session.topic, score_percentage: Math.round(session.score_percentage) }}
                viewShotRef={viewShotRef}
            />

            <ScrollView 
                style={s.scrollView} 
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Custom Header */}
                <View style={[s.headerRow, { paddingTop: 16 }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={[s.menuBtn, isDark ? s.bgWhite10 : s.bgSlate100]}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <Text style={[s.headerText, isDark ? s.textWhite : s.textSlate900]}>Quiz Results</Text>
                    <View style={s.size12} />
                </View>

                {/* Top Score Area */}
                <View style={s.scoreArea}>
                    <View style={[s.scoreIconBox, isDark ? s.bgWhite10 : s.bgSlate100]}>
                        <HugeiconsIcon icon={MagicWand01Icon} size={36} color="#8B5CF6" />
                    </View>
                    <Text style={s.scoreTag}>{remark.title}</Text>
                    <Text style={[s.scoreText, isDark ? s.textWhite : s.textSlate900]}>
                        {Math.round(session.score_percentage)}%
                    </Text>
                    <Text style={[s.scoreSubtitle, isDark ? s.textWhite60 : s.textSlate500]}>
                        {remark.subtitle}
                    </Text>
                </View>

                {/* Bottom Content Container */}
                <View style={[s.contentContainer, isDark ? s.bgDark : s.bgWhite]}>
                    
                    {/* Topic Box - Borderless */}
                    <View style={[s.topicBox, isDark ? s.bgGrayDark : s.bgGrayLight]}>
                        <Text style={s.topicLabel}>Topic</Text>
                        <Text style={[s.topicTitle, isDark ? s.textWhite : s.textSlate900]}>{session.topic}</Text>
                    </View>

                    {/* Stats Row */}
                    <View style={s.statsRow}>
                        <View style={[s.statCard, isDark ? s.bgGrayDark : s.bgGrayLight]}>
                            <Text style={s.statLabelCorrect}>Correct</Text>
                            <Text style={[s.statValue, isDark ? s.textWhite : s.textSlate900]}>{session.correct_answers}</Text>
                        </View>
                        <View style={[s.statCard, isDark ? s.bgGrayDark : s.bgGrayLight]}>
                            <Text style={s.statLabelMissed}>Missed</Text>
                            <Text style={[s.statValue, isDark ? s.textWhite : s.textSlate900]}>{session.total_questions - session.correct_answers}</Text>
                        </View>
                    </View>

                    {/* Detailed Review Section */}
                    <View style={s.reviewDividerRow}>
                        <View style={s.dividerLine} />
                        <Text style={[s.reviewTitle, isDark ? s.textWhite : s.textSlate900]}>Detailed Review</Text>
                    </View>

                    {session.questions.map((q, i) => (
                        <HistoryQuestionCard key={q.id} q={q} index={i} />
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Buttons */}
            <BlurView 
                intensity={Platform.OS === 'ios' ? 80 : 0} 
                tint={isDark ? "dark" : "light"} 
                style={[
                    s.footer, 
                    isDark ? s.footerDark : s.footerLight,
                        {
                            bottom: 0,
                            paddingBottom: Math.max(insets.bottom, 16) + 75,
                            backgroundColor: isDark 
                                ? (Platform.OS === 'android' ? '#000000' : 'rgba(0,0,0,0.8)') 
                                : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
                        }
                ]}
            >
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={isExporting}
                    activeOpacity={0.7}
                    style={[s.exportBtn, isDark ? s.bgWhite : s.bgSlate900]}
                >
                    {isExporting ? <ActivityIndicator size="small" color={isDark ? 'black' : 'white'} /> : (
                        <View style={s.exportBtnContent}>
                            <HugeiconsIcon icon={DocumentCodeIcon} size={20} color={isDark ? 'black' : 'white'} />
                            <Text style={[s.exportBtnText, isDark ? s.textBlack : s.textWhite]}>Save Report</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
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
                    }}
                    activeOpacity={0.7}
                    disabled={isSharing}
                    style={s.shareBtn}
                >
                    {isSharing ? <ActivityIndicator size="small" color="white" /> : (
                        <HugeiconsIcon icon={Share01Icon} size={20} color="white" />
                    )}
                </TouchableOpacity>
            </BlurView>
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
    qLabel: { fontSize: 11, fontWeight: '700', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
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
    scoreTag: { color: '#8B5CF6', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
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
    dividerLine: { width: 4, height: 16, backgroundColor: '#8B5CF6', borderRadius: 2, marginRight: 12 },
    reviewTitle: { fontSize: 15, fontWeight: '700' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, flexDirection: 'row', gap: 16, borderTopWidth: 1 },
    footerDark: { backgroundColor: 'rgba(9, 10, 15, 0.9)', borderTopColor: 'rgba(255,255,255,0.05)' },
    footerLight: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderTopColor: '#F1F5F9' },
    exportBtn: { flex: 1, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    exportBtnContent: { flexDirection: 'row', alignItems: 'center' },
    exportBtnText: { fontWeight: '700', fontSize: 16, marginLeft: 12 },
    textBlack: { color: 'black' },
    shareBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6' },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textWhite40: { color: 'rgba(255,255,255,0.4)' },
    textWhite60: { color: 'rgba(255,255,255,0.6)' },
    textWhite30: { color: 'rgba(255,255,255,0.3)' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
});
