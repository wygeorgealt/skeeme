import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Animated, StyleSheet, Modal, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import ReanimatedAnimated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { streamQuizGenerate } from '@/lib/aiStream';

import { useFocusEffect, useLocalSearchParams, useNavigation, router } from 'expo-router';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import * as DocumentPicker from 'expo-document-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ShareCard } from '@/components/ui/ShareCard';
import { generateQuizHTML } from '@/lib/pdfGenerator';
// import { generateUUID } from '@/lib/utils';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';
import { posthog } from '@/lib/posthog';
import { markGenerationSuccess } from '@/lib/storeReview';
import { markFreePaywallOfferShown, shouldShowFreePaywallOffer } from '@/lib/freeOffer';
import GlobalErrorModal from '@/components/GlobalErrorModal';

import { saveOfflineQuiz } from '@/lib/offlineSaved';


import { haptics } from '@/lib/haptics';
import { QuizMode, Difficulty, FormatType, Question } from '@/components/quiz/QuizTypes';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuizCelebration } from '@/components/quiz/QuizCelebration';

import Grid from '@/assets/icons/pikaicons/grid-dashboard-02.svg';
import File from '@/assets/icons/pikaicons/file-default.svg';
import Leaf from '@/assets/icons/pikaicons/award-medal.svg';
import LightbulbBolt from '@/assets/icons/pikaicons/sparkle-ai-01.svg';
import Fire from '@/assets/icons/pikaicons/sparkle-ai-01.svg';
import List from '@/assets/icons/pikaicons/sidebar-menu.svg';
import PencilEdit from '@/assets/icons/pikaicons/pencil-edit.svg';
import LayerThree from '@/assets/icons/pikaicons/layer-three.svg';
import DocumentText from '@/assets/icons/pikaicons/file-default.svg';
import CheckCircle from '@/assets/icons/pikaicons/check-tick-circle.svg';
import CloseCircle from '@/assets/icons/pikaicons/multiple-cross-cancel-circle.svg';
import AltArrowRight from '@/assets/icons/pikaicons/arrow-right.svg';
import AltArrowLeft from '@/assets/icons/pikaicons/arrow-left.svg';
import Share from '@/assets/icons/pikaicons/send-plane-horizontal.svg';
import InfoCircle from '@/assets/icons/pikaicons/troubleshoot.svg';
import Danger from '@/assets/icons/pikaicons/troubleshoot.svg';
import CloudUpload from '@/assets/icons/pikaicons/upload-up.svg';
import CupStar from '@/assets/icons/pikaicons/award-medal.svg';
import UsersGroupRounded from '@/assets/icons/pikaicons/user-circle.svg';
import Lightbulb from '@/assets/icons/pikaicons/sparkle-ai-01.svg';
import Stopwatch from '@/assets/icons/pikaicons/clock-default.svg';
import FolderOpen from '@/assets/icons/pikaicons/folder-default.svg';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { GlassSurface } from '@/components/liquid-glass/GlassSurface';

// ── SKELETON COMPONENTS ──────────────────────────────────────────────────────
const SkeletonCard = ({ isDark }: { isDark: boolean }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={{ height: 40, width: '90%', backgroundColor: bgColor, borderRadius: 8, marginBottom: 12, opacity }} />
            <Animated.View style={{ height: 40, width: '70%', backgroundColor: bgColor, borderRadius: 8, marginBottom: 40, opacity }} />
            
            {[1, 2, 3, 4].map(i => (
                <Animated.View key={i} style={{ height: 64, width: '100%', backgroundColor: bgColor, borderRadius: 32, marginBottom: 12, opacity }} />
            ))}
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & OPTIONS
// ══════════════════════════════════════════════════════════════════════════════
const MODE_OPTIONS = [
    { key: 'topic', label: 'By Topic', Icon: Grid },
    { key: 'file',  label: 'From File', Icon: File },
];

const DIFFICULTY_OPTIONS = [
    { key: 'easy',   label: 'Easy',   Icon: Leaf, desc: 'Focus on fundamentals'    },
    { key: 'medium', label: 'Medium', Icon: LightbulbBolt, desc: 'Comprehensive coverage'   },
    { key: 'hard',   label: 'Hard',   Icon: Fire, desc: 'Deep analytical questions' },
];

const FORMAT_OPTIONS = [
    { key: 'mcq',    label: 'MCQ',    Icon: List, desc: 'Multiple choice questions' },
    { key: 'theory', label: 'Theory', Icon: PencilEdit, desc: 'Essay & analysis'           },
    { key: 'both',   label: 'Mixed',  Icon: LayerThree, desc: 'Combination of both'        },
];

function ChipButton({
    label,
    Icon,
    isSelected,
    onPress,
    isDark,
    C,
    small,
}: {
    label: string;
    Icon: React.ComponentType<any>;
    isSelected: boolean;
    onPress: () => void;
    isDark: boolean;
    C: typeof Colors.light;
    small?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            
            style={[
                sf.chipBtn,
                small ? sf.chipSmall : null,
                isSelected
                    ? { backgroundColor: '#007AFF', borderColor: '#007AFF' }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F8', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E4EF' },
            ]}
        >
            <Icon width={small ? 16 : 20} height={small ? 16 : 20} color={isSelected ? '#FFF' : C.text} style={{ marginRight: 6 }} />
            <Text style={[small ? sf.chipLabelSmall : sf.chipLabel, { color: isSelected ? '#FFF' : C.text }]}>{label}</Text>
        </Pressable>
    );
}

// Card shadow helper
const cardShadow = (C: typeof Colors.light) => ({
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: C.cardShadowColor,
    shadowOpacity: C.cardShadowOpacity,
    shadowRadius: C.cardShadowRadius,
    shadowOffset: C.cardShadowOffset,
    elevation: C.cardElevation,
});

const LOADING_STAGES_FILE = ['Skeeming...', 'Solving...', 'Extracting Context...', 'Generating Questions...', 'Almost Ready...'];
const LOADING_STAGES_TOPIC = ['Skeeming...', 'Solving...', 'Researching Topic...', 'Generating Questions...', 'Almost Ready...'];
const PROGRESS_STAGES = ['Skeeming', 'Extracting', 'Generating', 'Finalizing'];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function GenerateQuizScreen() {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';
    const C = Colors[isDark ? 'dark' : 'light'];
    const navigation = useNavigation() as any;

    // Setup state
    const [mode, setMode] = useState<QuizMode>('topic');
    const [topic, setTopic] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
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
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCelebration, setIsCelebration] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const viewShotRef = useRef<View>(null);

    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reward Modal State
    const [isSavingHistory, setIsSavingHistory] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [creditRefreshKey, setCreditRefreshKey] = useState(0);
    const [explanationQ, setExplanationQ] = useState<{ q: Question; qi: number; isCorrect: boolean } | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [extractionId, setExtractionId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Offline save
    const [isSavingOffline, setIsSavingOffline] = useState(false);
    const [isOfflineSaved, setIsOfflineSaved] = useState(false);

    // P5: Memoize score calculation — was running .filter() across all answers
    // on every render of this 1649-line component.
    const correctCount = useMemo(() =>
        Object.entries(selectedAnswers).filter(([qi, ans]) => questions[+qi]?.correct_answer === ans).length
        + Object.values(theoryResults).filter(Boolean).length,
        [selectedAnswers, questions, theoryResults]
    );
    const percentage = useMemo(() =>
        questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
        [correctCount, questions.length]
    );

    // Read topic from scan route param
    const params = useLocalSearchParams<{ topic?: string }>();
    useEffect(() => {
        if (params.topic && questions.length === 0) {
            setTopic(params.topic);
            setMode('topic');
        }
    }, [params.topic]);

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
            if (__DEV__) console.error('Sharing failed', e);
            Alert.alert('Sharing failed', 'Could not generate result image.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleExportPDF = async () => {
        if (questions.length === 0) return;
        setIsExporting(true);
        try {
            const quizTitle = mode === 'topic' ? topic : (selectedFile?.name || 'Quiz');
            const questionsForExport = questions.map((q, qi) => {
                const isTheory = q.question_type === 'essay';
                const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                return {
                    question: q.question_text,
                    question_text: q.question_text,
                    type: q.question_type,
                    question_type: q.question_type,
                    options: q.options,
                    correct_answer: q.correct_answer || q.explanation || '',
                    user_answer: isTheory ? '(Theory Answer)' : selectedAnswers[qi],
                    is_correct: isCorrect,
                    explanation: q.explanation,
                };
            });
            const html = generateQuizHTML(quizTitle, percentage, questionsForExport);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            setIsExporting(false);
            await Sharing.shareAsync(uri);
        } catch (e) {
            setIsExporting(false);
            if (__DEV__) console.error('PDF Export failed', e);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        }
    };

    const handleResetQuiz = () => {
        haptics.impactAsync();
        setQuestions([]);
        setSelectedAnswers({});
        setTheoryResults({});
        setCurrentQIndex(0);
        setIsRevealed(false);
        setIsCelebration(false);
        setTimeLeft(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTopic('');
        setSelectedFile(null);
    };

    useFocusEffect(
        useCallback(() => {
            const onBeforeRemove = (e: any) => {
                if (questions.length === 0 || currentQIndex >= questions.length) {
                    return;
                }
                e.preventDefault();
                Alert.alert(
                    'Discard Quiz?',
                    'Leaving now will discard your current progress. This quiz will not be saved.',
                    [
                        { text: 'Stay', style: 'cancel', onPress: () => {} },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => navigation.dispatch(e.data.action),
                        },
                    ]
                );
            };

            navigation.addListener('beforeRemove', onBeforeRemove);
            return () => {
                navigation.removeListener('beforeRemove', onBeforeRemove);
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, [questions.length, currentQIndex, navigation])
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
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a file smaller than 5MB. Ensure it contains extractable text.');
                    return;
                }

                setIsProcessingFile(true);
                // Set file instantly so UI updates
                setSelectedFile(asset);
                setMode('file');
                setTopic('');
                setIsProcessingFile(false);
                
                // Start background extraction
                setIsExtracting(true);
                try {
                    const fd = new FormData();
                    fd.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' } as any);
                    fd.append('type', 'quiz');
                    
                    const res = await api.post('files/extract', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        skipGlobalError: true
                    } as any);
                    
                    if (res.data?.extraction_id) {
                        setExtractionId(res.data.extraction_id);
                    }
                } catch (e: any) {
                    Alert.alert('Extraction Failed', e.response?.data?.message || 'Could not extract text from document.');
                    setSelectedFile(null);
                    setExtractionId(null);
                } finally {
                    setIsExtracting(false);
                }
            }
        } catch {
            setIsProcessingFile(false);
            setIsExtracting(false);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    // Generate
    const handleGenerate = async () => {
        if (mode === 'topic' && !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
        if (mode === 'file' && !selectedFile) return Alert.alert('Required', 'Please select a document.');
        
        const pricingConfig = useAuthStore.getState().pricingConfig;
        const planTier = user?.plan_name === 'free' ? 'free' : 'paid';
        const flatCost = (pricingConfig?.rates?.quiz_generation as any)?.[planTier] ?? 30;



        // Pre-flight check
        let currentCredits = user?.credits ?? 0;
        let isUnlimited = (user?.plan_name ?? 'free') !== 'free';

        if (!isUnlimited && currentCredits <= 0) {
            try {
                await queryClient.refetchQueries({ queryKey: ['student', 'me'] });
                const refreshed = useAuthStore.getState().user;
                if (refreshed) {
                    currentCredits = refreshed.credits ?? currentCredits;
                    isUnlimited = (refreshed.plan_name ?? 'free') !== 'free';
                }
            } catch (e) { }

            if (!isUnlimited && currentCredits <= 0) {
                setShowOutOfCredits(true);
                return;
            }
        }

        setIsLoading(true);
        setLoadingStage(mode === 'file' ? 'Analyzing Document...' : 'Analyzing Topic...');
        setQuestions([]); setSelectedAnswers({}); setTheoryResults({}); 
        setCurrentQIndex(0); setIsRevealed(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Stage cycling logic
        const stages = mode === 'file' ? LOADING_STAGES_FILE : LOADING_STAGES_TOPIC;
        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 4000);

        try {
            const types = format === 'both' ? ['mcq', 'theory'] : [format === 'theory' ? 'theory' : 'mcq'];
            let accumulatedJson = '';

            streamQuizGenerate(
                {
                    topic: topic || (selectedFile?.name ?? ''),
                    question_count: parseInt(questionCount),
                    difficulty,
                    question_types: types,
                    extraction_id: extractionId,
                },
                {
                    onStatus: (message) => {
                        setLoadingStage(message);
                    },
                    onToken: (token) => {
                        accumulatedJson += token;
                        try {
                            const partial = parsePartialJson(accumulatedJson);
                            if (partial) {
                                const qs = Array.isArray(partial) ? partial : (partial.questions || []);
                                if (qs.length > 0) setQuestions(qs);
                            }
                        } catch (e) {}
                    },
                    onComplete: (fullText) => {
                        clearInterval(stageInterval);
                        finishGeneration(fullText || accumulatedJson);
                    },
                    onError: (error, isInsufficientCredits) => {
                        clearInterval(stageInterval);
                        setIsLoading(false);
                        if (isInsufficientCredits) {
                            setShowOutOfCredits(true);
                        } else {
                            setGlobalError(error || 'Skeeme is down, Please try again later.');
                            setShowErrorModal(true);
                        }
                    },
                }
            );

        } catch (e: any) {
            clearInterval(stageInterval);
            setIsLoading(false);
            setGlobalError('Failed to start generation. Please check your connection.');
            setShowErrorModal(true);
        }
    };

    const parsePartialJson = (json: string) => {
        try {
            let testJson = json.trim();
            // Remove markdown code blocks if present
            testJson = testJson.replace(/```(?:json)?|```/g, '').trim();
            
            if (!testJson.endsWith(']') && !testJson.endsWith('}')) {
                // Try to close an array
                if (testJson.startsWith('[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) {
                        testJson = testJson.substring(0, lastObjEnd + 1) + ']';
                    } else {
                        testJson += ']';
                    }
                } 
                // Try to close a "questions": [] object
                else if (testJson.includes('"questions":[')) {
                    const lastObjEnd = testJson.lastIndexOf('}');
                    if (lastObjEnd !== -1) {
                        testJson = testJson.substring(0, lastObjEnd + 1) + ']}';
                    } else {
                        testJson += ']}';
                    }
                }
            }
            return JSON.parse(testJson);
        } catch (e) {
            return null;
        }
    };

    const finishGeneration = async (fullJson: string) => {
        setIsLoading(false);
        try {
            const cleanJson = fullJson.replace(/```(?:json)?|```/g, '').trim();
            const data = JSON.parse(cleanJson);
            const questionsArr = Array.isArray(data) ? data : (data.questions || []);

            // C5: Empty questions — show actionable message, don't strand user on blank screen
            if (questionsArr.length === 0) {
                Alert.alert(
                    'No Questions Generated',
                    "We couldn't generate questions from that. Try a different topic or document.",
                    [{ text: 'Try Again', style: 'cancel' }]
                );
                return;
            }

            setQuestions(questionsArr);
            
            posthog.capture('quiz_generated_stream', { mode, difficulty, format });
            markGenerationSuccess('quiz').catch(() => {});

            // Refresh user credits via React Query
            await queryClient.refetchQueries({ queryKey: ['student', 'me'] });
            const refreshed = useAuthStore.getState().user;
            if (refreshed) {
                if (refreshed.credits === 0 && (refreshed.plan_name ?? 'free') === 'free') {
                    setShowOutOfCredits(true);
                }
            }
            
            if (timerEnabled) startTimer(parseInt(timerMinutes) || 10);
            
            // Reset saved state for new quiz
            setIsSaved(false);
        } catch (e) {
            Alert.alert('Error', 'Failed to finalize quiz results.');
        }
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

    const saveHistory = useCallback(async () => {
        if (questions.length === 0 || totalAnswered !== questions.length || isSaved || isSavingHistory) return;

        setIsSavingHistory(true);
        setSaveError(false);

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

        try {
            const res = await api.post('quizzes/history', payload);
            setIsSaved(true);
            
            // Refresh user stats via React Query
            queryClient.invalidateQueries({ queryKey: ['student', 'me'] });
        } catch (err) {
            if (__DEV__) console.warn('Failed to save quiz history', err);
            setSaveError(true);
        } finally {
            setIsSavingHistory(false);
        }
    }, [questions, totalAnswered, isSaved, isSavingHistory, mode, topic, selectedFile, difficulty, correctCount, theoryResults, selectedAnswers, timerEnabled, timerMinutes, timeLeft]);


    // Programmatic header and tab bar control
    useEffect(() => {
        const isQuizActive = (questions.length > 0 && currentQIndex < questions.length) || isLoading;
        
        navigation.setOptions({ 
            headerShown: false, // Always hide header in this screen as we have custom headers
            tabBarStyle: isQuizActive ? { display: 'none' } : undefined
        });

        // If it's a tab navigator, we might need to set it on the parent
        const parent = navigation.getParent();
        if (parent) {
            parent.setOptions({
                tabBarStyle: isQuizActive ? { display: 'none' } : undefined
            });
        }
    }, [questions.length, currentQIndex, isLoading, navigation]);

    // Prevent accidental exit
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            const isQuizActive = (questions.length > 0 && currentQIndex < questions.length) || isLoading;
            if (!isQuizActive) return;

            e.preventDefault();
            Alert.alert(
                'Discard Quiz?',
                'Leaving now will lose your progress. Are you sure?',
                [
                    { text: 'Stay', style: 'cancel' },
                    { 
                        text: 'Discard', 
                        style: 'destructive', 
                        onPress: () => {
                            // Reset state and allow navigation
                            setQuestions([]);
                            setIsLoading(false);
                            navigation.dispatch(e.data.action);
                        }
                    }
                ]
            );
        });

        return unsubscribe;
    }, [navigation, questions.length, currentQIndex, isLoading]);

    // Automatically reset quiz when entering screen if a quiz is fully completed/refocused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (questions.length > 0 && currentQIndex >= questions.length) {
                // Fully finished/on results screen -> reset to setup form
                setQuestions([]);
                setSelectedAnswers({});
                setTheoryResults({});
                setCurrentQIndex(0);
                setIsRevealed(false);
                setIsCelebration(false);
                setTimeLeft(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setTopic('');
                setSelectedFile(null);
            }
        });

        return unsubscribe;
    }, [navigation, questions.length, currentQIndex]);

    // ── SETUP FORM ─────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        const canGenerate = mode === 'topic' ? topic.trim().length > 0 : (selectedFile !== null && !isExtracting);

        return (
            <View className="flex-1 bg-surface pt-safe">
                {/* Header */}
                <View className="h-16 px-4 flex-row items-center justify-between z-50 bg-surface-container-lowest/80" style={{ paddingTop: Math.max(insets.top, 16) }}>
                    <Pressable
                        onPress={() => router.back()}
                        
                        className="w-11 h-11 -ml-2 rounded-full items-center justify-center bg-transparent"
                    >
                        <MaterialIcons name="arrow-back" size={24} color={C.text} className="text-on-surface" />
                    </Pressable>
                    <Text className="text-[20px] font-[600] tracking-[-0.2px] text-on-surface flex-1 text-center" numberOfLines={1}>
                        {isLoading ? (loadingStage || 'Skeeming...') : 'Create Quiz'}
                    </Text>
                    <View className="w-11 h-11" />
                </View>

                {isLoading ? (
                    <View className="flex-1 px-4 pt-5">
                        <SkeletonCard isDark={isDark} />
                    </View>
                ) : (
                <ScrollView
                    className="flex-1 w-full"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220, paddingTop: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-col gap-6 w-full max-w-xl mx-auto">
                        
                        {/* Section 1: Source Material Selector */}
                        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm flex-col gap-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="dataset" size={20} color="#007AFF" />
                                    <Text className="text-[16px] font-[600] text-on-surface">Quiz Source Material</Text>
                                </View>
                            </View>

                            {/* Segmented iOS-Style Switcher */}
                            <View className="p-1 bg-surface-container-low rounded-2xl flex-row items-center gap-1">
                                <Pressable 
                                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${mode === 'topic' ? 'bg-surface-container-lowest shadow-sm' : 'bg-transparent'}`}
                                    onPress={() => { setMode('topic'); setSelectedFile(null); }}
                                    
                                >
                                    <MaterialIcons name="edit-note" size={18} color={mode === 'topic' ? '#007AFF' : C.textSecondary} />
                                    <Text className={`text-[14px] font-[600] ${mode === 'topic' ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>Input Topic</Text>
                                </Pressable>
                                <Pressable 
                                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${mode === 'file' ? 'bg-surface-container-lowest shadow-sm' : 'bg-transparent'}`}
                                    onPress={() => { setMode('file'); }}
                                    
                                >
                                    <MaterialIcons name="cloud-upload" size={18} color={mode === 'file' ? '#007AFF' : C.textSecondary} />
                                    <Text className={`text-[14px] font-[600] ${mode === 'file' ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>Upload Notes</Text>
                                </Pressable>
                            </View>

                            {/* Tab View: Topic Input */}
                            {mode === 'topic' ? (
                                <View className="flex-col gap-3">
                                    <View className="bg-surface-container-low rounded-2xl p-3">
                                        <TextInput
                                            className="w-full bg-transparent text-[15px] font-[400]"
                                            placeholder="e.g. AP Calculus Derivatives, or paste your syllabus chapter..."
                                            placeholderTextColor={C.textTertiary}
                                            value={topic}
                                            onChangeText={setTopic}
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            style={{ minHeight: 80, color: C.text }}
                                        />
                                        <View className="flex-row items-center justify-between pt-2">
                                            <Pressable onPress={() => setTopic('')} className="p-1">
                                                <MaterialIcons name="backspace" size={18} color={C.textTertiary} />
                                            </Pressable>
                                        </View>
                                    </View>

                                    {/* Quick Topic Suggestion Chips */}
                                    <View className="flex-col gap-1.5">
                                        <Text className="text-[11px] font-[700] tracking-[0.5px] text-on-surface-variant">Popular Suggestions</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {['AP Calculus', 'Cell Biology', 'World History', 'Python Basics'].map(s => (
                                                <Pressable key={s} onPress={() => setTopic(s)} className="px-3 py-1.5 rounded-full bg-surface-container-low active:bg-primary-container">
                                                    <Text className="text-[11px] font-[700] tracking-[0.5px] text-on-surface">{s}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                /* Tab View: Upload Notes */
                                <View className="flex-col gap-3">
                                    <Pressable 
                                        onPress={handleFileSelect}
                                        disabled={isProcessingFile}
                                        
                                        className="bg-surface-container-low rounded-2xl p-6 flex-col items-center justify-center text-center gap-3"
                                    >
                                        {isProcessingFile ? (
                                            <View className="items-center">
                                                <LoadingSpinner size={32} />
                                                <Text className="text-[13px] font-[400] text-primary mt-2">Analyzing document...</Text>
                                            </View>
                                        ) : selectedFile ? (
                                            <>
                                                <View className="w-14 h-14 rounded-2xl bg-surface-container-lowest items-center justify-center shadow-sm">
                                                    <MaterialIcons name="description" size={32} color="#007AFF" />
                                                </View>
                                                <View className="items-center">
                                                    <Text className="text-[16px] font-[600] text-on-surface">{selectedFile.name}</Text>
                                                    {isExtracting ? (
                                                        <View className="flex-row items-center mt-1">
                                                            <LoadingSpinner size={14} color={C.primary} />
                                                            <Text className="text-[13px] font-[400] text-primary ml-1.5">Extracting text...</Text>
                                                        </View>
                                                    ) : (
                                                        <Text className="text-[13px] font-[400] text-on-surface-variant mt-0.5">Ready to generate</Text>
                                                    )}
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <View className="w-14 h-14 rounded-2xl bg-surface-container-lowest items-center justify-center shadow-sm">
                                                    <MaterialIcons name="upload-file" size={32} color="#007AFF" />
                                                </View>
                                                <View className="items-center">
                                                    <Text className="text-[16px] font-[600] text-on-surface">Drop lecture slides, syllabus, or notes</Text>
                                                    <Text className="text-[13px] font-[400] text-on-surface-variant mt-0.5">Supports PDF, DOCX, TXT (Max 5MB)</Text>
                                                </View>
                                                <View className="mt-1 px-4 py-2 bg-primary-container rounded-xl flex-row items-center gap-1.5 shadow-sm">
                                                    <MaterialIcons name="add-circle" size={18} color="#007AFF" />
                                                    <Text className="text-[14px] font-[600] text-accent-electric-blue">Add Document</Text>
                                                </View>
                                            </>
                                        )}
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        {/* Section 2: Number of Questions */}
                        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm flex-col gap-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="format-list-numbered" size={20} color="#007AFF" />
                                    <Text className="text-[16px] font-[600] text-on-surface">Question Count</Text>
                                </View>
                            </View>

                            <View className="bg-surface-container-low rounded-2xl p-4 flex-row items-center justify-between">
                                <Pressable 
                                    className="w-11 h-11 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                                    onPress={() => setQuestionCount(prev => String(Math.max(5, parseInt(prev) - 5)))}
                                >
                                    <MaterialIcons name="remove" size={22} color={C.text} />
                                </Pressable>
                                <View className="flex-col items-center">
                                    <View className="flex-row items-baseline gap-1">
                                        <Text className="text-[40px] font-[800] tracking-[-1.2px] text-accent-electric-blue">{questionCount}</Text>
                                        <Text className="text-[16px] font-[600] text-on-surface-variant">Questions</Text>
                                    </View>
                                </View>
                                <Pressable 
                                    className="w-11 h-11 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                                    onPress={() => setQuestionCount(prev => String(Math.min(30, parseInt(prev) + 5)))}
                                >
                                    <MaterialIcons name="add" size={22} color={C.text} />
                                </Pressable>
                            </View>

                            <View className="flex-row flex-wrap gap-2 w-full justify-between">
                                {[5, 10, 15, 20, 30].map(val => (
                                    <Pressable 
                                        key={val}
                                        onPress={() => setQuestionCount(String(val))}
                                        className={`py-2 flex-1 rounded-xl items-center justify-center ${parseInt(questionCount) === val ? 'bg-accent-electric-blue shadow-sm' : 'bg-surface-container-low'}`}
                                    >
                                        <Text className={`text-[14px] font-[600] ${parseInt(questionCount) === val ? 'text-on-primary' : 'text-on-surface'}`}>{val}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Section 3: Difficulty Level */}
                        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm flex-col gap-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="psychology" size={20} color="#007AFF" />
                                    <Text className="text-[16px] font-[600] text-on-surface">Difficulty Depth</Text>
                                </View>
                                <View className="bg-primary-container px-2.5 py-0.5 rounded-full">
                                    <Text className="text-[11px] font-[700] tracking-[0.5px] text-accent-electric-blue">
                                        {difficulty === 'easy' ? 'Foundational' : difficulty === 'medium' ? 'Standard' : 'Mastery / Trap'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row gap-2.5 w-full">
                                {[
                                    { key: 'easy', icon: 'spa', label: 'Easy', desc: 'Foundations & recall' },
                                    { key: 'medium', icon: 'school', label: 'Medium', desc: 'Exam standard' },
                                    { key: 'hard', icon: 'local-fire-department', label: 'Hard', desc: 'Deep mastery & traps' },
                                ].map(opt => {
                                    const isActive = difficulty === opt.key;
                                    return (
                                        <Pressable 
                                            key={opt.key}
                                            onPress={() => setDifficulty(opt.key as Difficulty)}
                                            className={`flex-1 p-3.5 rounded-2xl flex-col justify-between h-[144px] ${isActive ? 'bg-primary-container shadow-sm' : 'bg-surface-container-low'}`}
                                        >
                                            <View className="flex-row items-center justify-between w-full">
                                                <View className="w-9 h-9 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm">
                                                    <MaterialIcons name={opt.icon as any} size={20} color={isActive ? "#007AFF" : C.textSecondary} />
                                                </View>
                                                {isActive && <MaterialIcons name="check-circle" size={20} color="#007AFF" />}
                                            </View>
                                            <View>
                                                <Text className={`text-[16px] font-[600] ${isActive ? 'text-accent-electric-blue' : 'text-on-surface'}`}>{opt.label}</Text>
                                                <Text className="text-[13px] font-[400] text-on-surface-variant mt-0.5 leading-[18px]" numberOfLines={2}>{opt.desc}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Section 4: Timer */}
                        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm flex-col gap-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-surface-container-low items-center justify-center">
                                        <MaterialIcons name="timer" size={22} color="#007AFF" />
                                    </View>
                                    <Text className="text-[16px] font-[600] text-on-surface">Quiz Timer</Text>
                                </View>
                                <Pressable 
                                    onPress={() => setTimerEnabled(!timerEnabled)}
                                    
                                    className={`w-14 h-8 rounded-full p-1 justify-center ${timerEnabled ? 'bg-accent-electric-blue' : 'bg-surface-container-highest'}`}
                                >
                                    <Animated.View style={{ transform: [{ translateX: timerEnabled ? 24 : 0 }] }}>
                                        <View className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-md" />
                                    </Animated.View>
                                </Pressable>
                            </View>

                            {timerEnabled && (
                                <View className="flex-col gap-3 pt-2">
                                    <View className="bg-surface-container-low rounded-2xl p-4 flex-row items-center justify-between">
                                        <Pressable 
                                            className="w-10 h-10 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                                            onPress={() => setTimerMinutes(prev => String(Math.max(5, parseInt(prev || '10') - 5)))}
                                        >
                                            <MaterialIcons name="remove" size={20} color={C.text} />
                                        </Pressable>
                                        <View className="flex-col items-center">
                                            <View className="flex-row items-baseline gap-1">
                                                <Text className="text-[40px] font-[800] tracking-[-1.2px] text-on-surface">{timerMinutes}</Text>
                                                <Text className="text-[16px] font-[600] text-on-surface-variant">min</Text>
                                            </View>
                                        </View>
                                        <Pressable 
                                            className="w-10 h-10 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                                            onPress={() => setTimerMinutes(prev => String(Math.min(60, parseInt(prev || '10') + 5)))}
                                        >
                                            <MaterialIcons name="add" size={20} color={C.text} />
                                        </Pressable>
                                    </View>

                                    <View className="flex-row flex-wrap gap-2 w-full justify-between">
                                        {[5, 15, 25, 45, 60].map(val => (
                                            <Pressable 
                                                key={val}
                                                onPress={() => setTimerMinutes(String(val))}
                                                className={`py-2 flex-1 rounded-xl items-center justify-center ${parseInt(timerMinutes) === val ? 'bg-accent-electric-blue shadow-sm' : 'bg-surface-container-low'}`}
                                            >
                                                <Text className={`text-[14px] font-[600] ${parseInt(timerMinutes) === val ? 'text-on-primary' : 'text-on-surface'}`}>{val}m</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Section 5: Question Format Options */}
                        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm flex-col gap-3">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="tune" size={20} color="#007AFF" />
                                    <Text className="text-[16px] font-[600] text-on-surface">Question Formats</Text>
                                </View>
                            </View>
                            <View className="flex-row flex-wrap gap-2.5">
                                {[
                                    { key: 'mcq', icon: 'radio-button-checked', label: 'Multiple Choice' },
                                    { key: 'theory', icon: 'rule', label: 'True / False / Essay' },
                                    { key: 'both', icon: 'short-text', label: 'Mixed' }
                                ].map(opt => {
                                    const isActive = format === opt.key;
                                    return (
                                        <Pressable 
                                            key={opt.key}
                                            onPress={() => setFormat(opt.key as FormatType)}
                                            className={`px-4 py-2.5 rounded-2xl flex-row items-center gap-2 ${isActive ? 'bg-primary-container' : 'bg-surface-container-low'}`}
                                        >
                                            <MaterialIcons name={opt.icon as any} size={18} color={isActive ? "#007AFF" : C.textSecondary} />
                                            <Text className={`text-[14px] font-[600] ${isActive ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>{opt.label}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                        
                    </View>
                </ScrollView>
                )}

                {/* Bottom Sticky Action Bar */}
                <BlurView
                    intensity={80}
                    tint={isDark ? 'dark' : 'light'}
                    className="absolute bottom-0 left-0 right-0 p-4 z-40 bg-surface-container-lowest/80"
                    style={{ paddingBottom: Math.max(insets.bottom, 16) }}
                >
                    <View className="max-w-xl mx-auto w-full flex-col gap-2">
                        <Pressable
                            onPress={handleGenerate}
                            disabled={!canGenerate || isLoading}
                            className={`w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 ${(!canGenerate || isLoading) ? 'opacity-50 bg-outline' : 'bg-accent-electric-blue'}`}
                            style={canGenerate ? { shadowColor: '#007AFF', shadowOffset: {width:0, height:8}, shadowOpacity: 0.35, shadowRadius: 24 } : {}}
                        >
                            {isLoading ? (
                                <LoadingSpinner size={22} color="white" />
                            ) : (
                                <MaterialIcons name="bolt" size={22} color="white" />
                            )}
                            <Text className="text-[16px] font-[600] text-on-primary">{isLoading ? 'Generating...' : 'Generate Quiz'}</Text>
                            {!isLoading && <Text className="text-[13px] font-[400] text-on-primary/80">✨</Text>}
                        </Pressable>
                        <View className="flex-row items-center justify-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-accent-electric-blue" />
                            <Text className="text-[11px] font-[700] tracking-[0.5px] text-on-surface-variant">Costs {user?.plan_name !== 'free' ? '0' : '30'} Credits • Instant AI Generation</Text>
                        </View>
                    </View>
                </BlurView>

                <OutOfCreditsModal
                    visible={showOutOfCredits}
                    onDismiss={() => setShowOutOfCredits(false)}
                    featureAttempted="quiz"
                />

                <GlobalErrorModal 
                    visible={showErrorModal}
                    error={globalError}
                    onDismiss={() => setShowErrorModal(false)}
                />
            </View>
        );
    }

    // ── QUIZ VIEW ───────────────────────────────────────────────────────────────
    if (isLoading || (questions.length > 0 && currentQIndex < questions.length)) {
        if (questions.length === 0) {
            return (
                <View className="flex-1 bg-surface pt-safe">
                    <View className="px-5 h-16 flex-row items-center justify-between" style={{ paddingTop: insets.top }}>
                        <Pressable 
                            onPress={() => { setIsLoading(false); }}
                            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container shadow-xs"
                        >
                            <MaterialIcons name="close" size={20} color={C.text} />
                        </Pressable>
                        <View className="flex-col items-center flex-1 px-2">
                            <Text className="text-[14px] font-[800] text-primary uppercase tracking-[1px]">{loadingStage || 'Skeeming...'}</Text>
                        </View>
                        <View className="w-10 h-10" />
                    </View>

                    <View className="flex-1 px-5 pt-4">
                        <SkeletonCard isDark={isDark} />
                    </View>
                </View>
            );
        }

        const q = questions[currentQIndex];
        const isTheory = q.question_type === 'essay';
        const rawProgressPct = (currentQIndex / questions.length) * 100;
        const hasSelectedAction = isTheory ? theoryResults[currentQIndex] !== undefined : selectedAnswers[currentQIndex] !== undefined;

        const handleNextPress = async () => {
            haptics.impactAsync();
            if (!isRevealed && !isTheory) {
                // Reveal the answer logic for MCQ
                setIsRevealed(true);
            } else {
                // Move to next question or finish
                if (currentQIndex === questions.length - 1) {
                    // Manual submission before celebration
                    if (!isSaved && !isSavingHistory) {
                        await saveHistory();
                    }
                    setIsCelebration(true);
                } else {
                    setIsRevealed(false);
                    setCurrentQIndex(p => p + 1);
                }
            }
        };

        const handleRetake = () => {
            haptics.impactAsync();
            setSelectedAnswers({});
            setTheoryResults({});
            setCurrentQIndex(0);
            setIsRevealed(false);
            setIsCelebration(false);
            if (timerEnabled) startTimer(parseInt(timerMinutes));
        };

        if (isCelebration) {
            return (
                <QuizCelebration 
                    score={percentage}
                    isDark={isDark}
                    onShowResults={() => {
                        setIsCelebration(false);
                        setCurrentQIndex(questions.length); // Trigger results view
                    }}
                    onRetake={handleRetake}
                />
            );
        }

        return (
            <View className="flex-1 bg-surface pt-safe">
                {/* Header */}
                <View className="h-16 px-5 flex-row items-center justify-between shadow-sm z-50 bg-surface/80" style={{ paddingTop: insets.top }}>
                    <Pressable 
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm"
                    >
                        <MaterialIcons name="chevron-left" size={24} color={C.text} />
                    </Pressable>
                    <View className="flex-1" />
                    {timerEnabled && (
                        <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                            <MaterialIcons name="timer" size={20} color={C.textTertiary} />
                        </Pressable>
                    )}
                </View>

                <ScrollView className="flex-1 w-full" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 220 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Progress area */}
                    <View className="flex-col space-y-2.5 mb-6">
                        <Text className="font-[700] text-[15px] text-on-surface">Question {currentQIndex + 1}: {topic || (selectedFile?.name || 'Quiz')}</Text>
                        
                        {/* Segmented pill progress */}
                        <View className="flex-row items-center gap-1.5 w-full">
                            {questions.map((_, i) => (
                                <View 
                                    key={i} 
                                    className={`h-1.5 flex-1 rounded-full ${i <= currentQIndex ? 'bg-accent-electric-blue' : 'bg-surface-container-high'}`} 
                                />
                            ))}
                        </View>
                        
                        <View className="flex-row items-center gap-4 text-[12px] text-on-surface-variant pt-0.5">
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="schedule" size={14} color={C.textTertiary} />
                                <Text className="text-on-surface-variant text-[12px]">Question {currentQIndex + 1}/{questions.length}</Text>
                            </View>
                            {timerEnabled && (
                                <View className="flex-row items-center gap-1">
                                    <MaterialIcons name="timer" size={14} color={timeLeft < 60 ? '#FF3B30' : C.textTertiary} />
                                    <Text className={`text-[12px] ${timeLeft < 60 ? 'text-[#FF3B30] font-[700]' : 'text-on-surface-variant'}`}>{formatTime(timeLeft)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Question Typography */}
                    <View className="flex-col items-center text-center pt-2 mb-6">
                        <View className="w-24 h-24 rounded-full bg-primary-container shadow-sm items-center justify-center mb-4">
                            <MaterialIcons name="quiz" size={40} color="#007AFF" />
                        </View>
                        <Text className="font-[700] text-[18px] text-on-surface leading-[26px] text-center">{q.question_text}</Text>
                    </View>

                    {/* Options */}
                    {!isTheory ? (
                        <View className="flex-col gap-3 pt-1">
                            {q.options?.map((opt, oi) => {
                                const isSelected = selectedAnswers[currentQIndex] === opt;
                                const isCorrectOpt = opt === q.correct_answer;
                                const letters = ['A', 'B', 'C', 'D', 'E'];
                                const letter = letters[oi] || `${oi + 1}`;

                                let btnClass = "p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm border-2 border-transparent flex-row items-center justify-between";
                                let badgeClass = "w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center";
                                let badgeTextClass = "font-[700] text-[13px] text-on-surface";
                                let textClass = "font-[500] text-[13px] text-on-surface";
                                let icon = null;

                                if (isRevealed) {
                                    if (isCorrectOpt) {
                                        btnClass = "p-3.5 rounded-2xl bg-[#ecfdf5] shadow-sm border-2 border-[#10b981] flex-row items-center justify-between";
                                        badgeClass = "w-8 h-8 rounded-full bg-[#ffffff] shadow-sm flex items-center justify-center";
                                        badgeTextClass = "font-[700] text-[13px] text-[#047857]";
                                        textClass = "font-[600] text-[13px] text-on-surface";
                                        icon = <MaterialIcons name="check-circle" size={18} color="#10b981" />;
                                    } else if (isSelected && !isCorrectOpt) {
                                        btnClass = "p-3.5 rounded-2xl bg-[#fef2f2] shadow-sm border-2 border-[#ef4444] flex-row items-center justify-between";
                                        badgeClass = "w-8 h-8 rounded-full bg-[#ffffff] shadow-sm flex items-center justify-center";
                                        badgeTextClass = "font-[700] text-[13px] text-[#b91c1c]";
                                        textClass = "font-[600] text-[13px] text-on-surface";
                                        icon = <MaterialIcons name="cancel" size={18} color="#ef4444" />;
                                    }
                                } else if (isSelected) {
                                    btnClass = "p-3.5 rounded-2xl bg-primary-container shadow-sm border-2 border-[#007AFF] flex-row items-center justify-between";
                                    badgeClass = "w-8 h-8 rounded-full bg-[#ffffff] shadow-sm flex items-center justify-center";
                                    badgeTextClass = "font-[700] text-[13px] text-[#007AFF]";
                                    textClass = "font-[600] text-[13px] text-on-surface";
                                }

                                return (
                                    <Pressable
                                        key={oi}
                                        
                                        onPress={() => {
                                            if (!isRevealed) {
                                                haptics.selectionAsync();
                                                setSelectedAnswers(p => ({ ...p, [currentQIndex]: opt }));
                                            }
                                        }}
                                        className={btnClass}
                                    >
                                        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                                            <View className={badgeClass}>
                                                <Text className={badgeTextClass}>{letter}</Text>
                                            </View>
                                            <Text className={`${textClass} flex-1`}>{opt}</Text>
                                        </View>
                                        {icon && <View className="ml-2">{icon}</View>}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ) : (
                        <TheoryCard key={currentQIndex} q={q} qi={currentQIndex} onGraded={(qi, correct) => {
                            setTheoryResults(p => ({ ...p, [qi]: correct }));
                        }} />
                    )}

                    {/* Explanation */}
                    {isRevealed && (
                        <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex-col space-y-3 mt-6">
                            <Text className="font-[700] text-[15px] text-on-surface">AI Explanation</Text>
                            <Text className="text-[13px] text-on-surface-variant leading-[20px]">
                                {(() => {
                                    const isCorrect = selectedAnswers[currentQIndex] === q.correct_answer;
                                    let rawExpl = isCorrect ? (q.explanation_right || q.explanation) : (q.explanation_wrong || q.explanation);
                                    let cleanExpl = rawExpl || `The correct answer is: ${q.correct_answer}.`;
                                    if (!q.explanation_right && !q.explanation_wrong) {
                                        cleanExpl = cleanExpl.replace(/^(correct|perfect|yes|exactly|that is correct|right|spot on|exactly right|that's right|that's correct|you're right|exactly correct|spot on|correct answer|the correct answer is)[,!\.]?\s*/i, '');
                                        cleanExpl = cleanExpl.charAt(0).toUpperCase() + cleanExpl.slice(1);
                                    }
                                    return cleanExpl;
                                })()}
                            </Text>
                        </View>
                    )}

                </ScrollView>

                {/* Navigation Footer */}
                <View className="absolute bottom-0 left-0 right-0 p-5 bg-surface/90 pt-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                    <View className="flex-row gap-3">
                        <Pressable 
                            disabled={currentQIndex === 0}
                            onPress={() => {
                                haptics.selectionAsync();
                                setCurrentQIndex(p => p - 1);
                                setIsRevealed(true); 
                            }}
                            className={`h-12 flex-1 rounded-full flex-row items-center justify-center bg-surface-container-low shadow-sm ${currentQIndex === 0 ? 'opacity-50' : ''}`}
                        >
                            <MaterialIcons name="arrow-back" size={18} color={C.text} style={{ marginRight: 4 }} />
                            <Text className="font-[600] text-[14px] text-on-surface">Previous</Text>
                        </Pressable>
                        
                        <Pressable 
                            onPress={handleNextPress}
                            disabled={!hasSelectedAction && !isRevealed}
                            className={`h-12 flex-1 rounded-full flex-row items-center justify-center shadow-sm ${hasSelectedAction || isRevealed ? 'bg-[#007AFF]' : 'bg-surface-container-high'}`}
                        >
                            <Text className={`font-[600] text-[14px] mr-1 ${hasSelectedAction || isRevealed ? 'text-white' : 'text-on-surface-variant'}`}>
                                {isTheory ? (currentQIndex === questions.length - 1 ? 'Finish' : 'Next') : (!isRevealed ? 'Check' : (currentQIndex === questions.length - 1 ? 'Finish' : 'Next'))}
                            </Text>
                            {(hasSelectedAction || isRevealed) && <MaterialIcons name="arrow-forward" size={18} color="white" />}
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── RESULTS VIEW ────────────────────────────────────────────────────────────
    const getRemark = (pct: number) => {
        if (pct >= 90) return { title: "Excellent work", subtitle: "You have a strong grasp of this topic.", icon: CupStar };
        if (pct >= 75) return { title: "Well done", subtitle: "A few more reviews will make this stick.", icon: CheckCircle };
        if (pct >= 50) return { title: "Keep practicing", subtitle: "Review the missed questions, then try again.", icon: InfoCircle };
        return { title: "Ready for another pass", subtitle: "Review the explanations and take your time.", icon: Danger };
    };
    const remark = getRemark(percentage);

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 280, paddingTop: insets.top + 20 }} showsVerticalScrollIndicator={false}>
                <View style={[s.resultsHeader, { backgroundColor: C.card, borderColor: C.separator }]}>
                    <View style={s.resultsIconBox}>
                        <remark.icon width={36} height={36} color={C.primary} />
                    </View>
                    <Text style={[s.resultsTitle, { color: C.primary }]}>{remark.title}</Text>
                    <Text style={[s.scoreValue, { color: C.text }]}>{percentage}%</Text>
                    <Text style={s.resultsSubtitle}>{remark.subtitle}</Text>

                    {/* Meta Info */}
                    <View style={s.resultsMeta}>
                        <View style={s.metaCard}>
                            <CheckCircle width={16} height={16} color="#4ADE80" />
                            <Text style={[s.metaText, { color: C.textSecondary }]}>{correctCount} OK</Text>
                        </View>
                        <View style={s.metaCard}>
                            <Stopwatch width={16} height={16} color={C.primary} />
                            <Text style={[s.metaText, { color: C.textSecondary }]}>
                                {timerEnabled ? formatTime(((parseInt(timerMinutes) || 10) * 60) - timeLeft) : 'No Timer'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Review List */}
                <Text style={s.sectionHeader}>Review Questions</Text>
                {questions.map((q, qi) => {
                    const isTheory = q.question_type === 'essay';
                    const isCorrect = isTheory ? !!theoryResults[qi] : selectedAnswers[qi] === q.correct_answer;
                    const canExplain = !isTheory;
                    return (
                        <Pressable
                            key={qi}
                            
                            onPress={() => canExplain && setExplanationQ({ q, qi, isCorrect })}
                        >
                            <View style={[s.reviewCard, { backgroundColor: C.card, borderColor: C.separator }]}>
                                <View style={[s.reviewStatusBox, { backgroundColor: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                    {isCorrect ? (
                                        <CheckCircle width={18} height={18} color="#10b981" />
                                    ) : (
                                        <CloseCircle width={18} height={18} color="#ef4444" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.reviewQuestion, { color: C.text }]} numberOfLines={1}>{q.question_text}</Text>
                                    <Text style={s.reviewMeta} numberOfLines={1}>
                                        {isTheory ? (isCorrect ? 'Mastered' : 'Review Topic') : (isCorrect ? 'Correct · Tap to explain' : 'Incorrect · Tap to explain')}
                                    </Text>
                                </View>
                                {canExplain && (
                                    <AltArrowRight width={16} height={16} color={C.textTertiary} />
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Hidden capture view for sharing */}
            <ShareCard
                type="quiz"
                data={{ 
                    topic: mode === 'topic' ? topic : (selectedFile?.name || 'File Upload'), 
                    score_percentage: percentage 
                }}
                viewShotRef={viewShotRef}
            />

            {/* Actions Footer */}
            <BlurView 
                intensity={50} 
                tint={isDark ? "dark" : "light"} 
                style={[s.footer, { 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: Math.max(insets.bottom, 16) + 115, 
                    paddingHorizontal: 24, 
                    borderTopWidth: 0,
                    backgroundColor: 'transparent'
                }]}
            >
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>

                    <Pressable
                        onPress={handleShare}
                        disabled={isSharing}
                        
                        style={[s.shareBtn, isDark ? s.shareBtnDark : s.shareBtnLight]}
                    >
                        {isSharing ? (
                            <LoadingSpinner size={24} color={C.primary} strokeWidth={3} />
                        ) : (
                            <>
                                <Share width={18} height={18} color={C.text} />
                                <Text style={[s.actionBtnText, { color: C.text }]}>Share</Text>
                            </>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={handleExportPDF}
                        disabled={isExporting}
                        
                        style={[s.exportBtn, { backgroundColor: C.primary }]}
                    >
                        <View style={s.exportBtnContent}>
                            {isExporting ? (
                                <LoadingSpinner size={24} color="white" strokeWidth={3} />
                            ) : (
                                <>
                                    <DocumentText width={18} height={18} color="white" />
                                    <Text style={s.exportBtnText}>Export</Text>
                                </>
                            )}
                        </View>
                    </Pressable>
                </View>

                {/* C3: Non-blocking history-save failure banner */}
                {saveError && (
                    <View style={{
                        marginBottom: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 16,
                        backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFF8E1',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.4)',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <Danger width={18} height={18} color="#f59e0b" />
                        <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: isDark ? '#fcd34d' : '#92400e', lineHeight: 20 }}>
                            Quiz completed, but we couldn’t save it to your history. Your results won’t appear in Study History.
                        </Text>
                        <Pressable
                            onPress={saveHistory}
                            disabled={isSavingHistory}
                            style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 10 }}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
                                {isSavingHistory ? '...' : 'Retry'}
                            </Text>
                        </Pressable>
                    </View>
                )}

                <View style={{ width: '100%', marginTop: 4 }}>
                    <AnimatedButton
                        title={isSavingOffline ? 'Saving…' : isOfflineSaved ? 'Saved for offline' : 'Save for offline'}
                        onPress={async () => {
                            if (questions.length === 0) {
                                Alert.alert("No Content", "There are no questions to save.");
                                return;
                            }
                            if (isSavingOffline || isOfflineSaved) return;
                            try {
                                setSaveError(false);
                                setIsSavingOffline(true);
                                const deckTopic = mode === 'topic' ? topic : (selectedFile?.name || 'File Upload');

                                await saveOfflineQuiz({
                                    id: `quiz_${Date.now().toString()}`,
                                    mode,
                                    topic: deckTopic,
                                    difficulty,
                                    percentage,
                                    questions: questions.map((q, qi) => ({
                                        id: qi.toString(),
                                        type: q.question_type,
                                        question_type: q.question_type,
                                        question_text: q.question_text,
                                        options: q.options,
                                        correct_answer: q.correct_answer,
                                        explanation: q.explanation,
                                        explanation_right: q.explanation_right,
                                        explanation_wrong: q.explanation_wrong,
                                        user_answer: q.question_type === 'essay' ? '(Theory Answer)' : selectedAnswers[qi],
                                    })),
                                });

                                setIsOfflineSaved(true);
                                haptics.notificationAsync('success' as any);
                            } catch {
                                setSaveError(true);
                                Alert.alert('Save Failed', 'Could not save this quiz for offline use.');
                            } finally {
                                setIsSavingOffline(false);
                            }
                        }}
                        type="capsule"
                        backgroundColor={isDark ? 'rgba(52,199,89,0.15)' : '#E6F9EE'}
                        style={{ borderColor: isDark ? 'rgba(52,199,89,0.35)' : 'rgba(52,199,89,0.35)', borderWidth: 1 }}
                        textColor={isDark ? '#34C759' : '#34C759'}
                        loading={isSavingOffline}
                        fullWidth
                    />
                </View>

                <View style={{ width: '100%', marginTop: 10 }}>
                    <AnimatedButton
                        title="Done"
                        onPress={handleResetQuiz}
                        type="capsule"
                        backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7'}
                        textColor={C.text}
                        fullWidth
                    />
                </View>

            </BlurView>


            <OutOfCreditsModal visible={showOutOfCredits} onDismiss={() => setShowOutOfCredits(false)} featureAttempted="quiz" />

            {/* Explanation Modal */}
            <Modal
                visible={explanationQ !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setExplanationQ(null)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={[
                        s.explanationSheet,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', paddingBottom: insets.bottom + 24 }
                    ]}>
                        {/* Handle */}
                        <View style={s.sheetHandle} />

                        {/* Header */}
                        <View style={s.sheetHeader}>
                            <View style={[
                                s.reviewStatusBox,
                                { backgroundColor: explanationQ?.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', marginRight: 0 }
                            ]}>
                                {explanationQ?.isCorrect ? (
                                    <CheckCircle width={18} height={18} color="#10b981" />
                                ) : (
                                    <CloseCircle width={18} height={18} color="#ef4444" />
                                )}
                            </View>
                            <Text style={[s.sheetTitle, { color: C.text }]} numberOfLines={2}>
                                {explanationQ?.q.question_text}
                            </Text>
                        </View>

                        {/* Correct Answer */}
                        {explanationQ?.q.correct_answer && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>CORRECT ANSWER</Text>
                                <View style={[s.sheetAnswerBox, { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }]}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#10b981' }}>
                                        {(() => {
                                            const options = explanationQ.q.options || [];
                                            const correctIdx = options.indexOf(explanationQ.q.correct_answer);
                                            const letter = ['A', 'B', 'C', 'D', 'E'][correctIdx];
                                            return letter ? `Option ${letter}: ${explanationQ.q.correct_answer}` : explanationQ.q.correct_answer;
                                        })()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Your Answer */}
                        {explanationQ && selectedAnswers[explanationQ.qi] && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>YOUR CHOICE</Text>
                                <View style={[
                                    s.sheetAnswerBox, 
                                    { 
                                        backgroundColor: explanationQ.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', 
                                        borderColor: explanationQ.isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' 
                                    }
                                ]}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: explanationQ.isCorrect ? '#10b981' : '#ef4444' }}>
                                        {(() => {
                                            const options = explanationQ.q.options || [];
                                            const userIdx = options.indexOf(selectedAnswers[explanationQ.qi]);
                                            const letter = ['A', 'B', 'C', 'D', 'E'][userIdx];
                                            return letter ? `Option ${letter}: ${selectedAnswers[explanationQ.qi]}` : selectedAnswers[explanationQ.qi];
                                        })()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Explanation */}
                        <Text style={[s.sheetSectionLabel, { color: C.textTertiary }]}>EXPLANATION</Text>
                        <ScrollView style={s.explanationScroll} showsVerticalScrollIndicator={false}>
                            <Text style={[s.explanationText, { color: C.textSecondary }]}>
                                {(() => {
                                    if (!explanationQ) return '';
                                    const { q, isCorrect } = explanationQ;
                                    const targeted = isCorrect ? q.explanation_right : q.explanation_wrong;
                                    return targeted || q.explanation || 'No explanation was provided for this question.';
                                })()}
                            </Text>
                        </ScrollView>

                        {/* Close */}
                        <Pressable
                            onPress={() => setExplanationQ(null)}
                            
                            style={[s.sheetCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' }]}
                        >
                            <Text style={[s.sheetCloseBtnText, { color: C.text }]}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    // ── Setup Layout Components ──
    segmentedControl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 24 },
    segmentedControlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segmentedControlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
    segmentBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segmentBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segmentText: { fontSize: 14, letterSpacing: -0.2 },
    
    card: { borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
    textInput: { fontSize: 16, fontWeight: '600', padding: 8 },
    
    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)' },
    uploadTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    uploadSub: { fontSize: 13, fontWeight: '500' },
    centered: { alignItems: 'center' },
    processingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },

    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, marginLeft: 8, color: '#94a3b8' },

    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },

    optionCard: { flexDirection: 'row', alignItems: 'center' },
    iconBoxRow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    optionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '500' },

    // Footer actions
    formFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
    generatePillButton: { width: '100%', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    generatePillText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
    loadingContainer: { alignItems: 'center', paddingVertical: 12 },
    loadingText: { fontSize: 15, fontWeight: '700' },

    // Shared Styles
    header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
    menuBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F8FAFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    sectionHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },
    footer: { paddingVertical: 16 },

    // Quiz View
    quizHeader: { paddingTop: 60, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    quizHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, justifyContent: 'space-between' },
    quitBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    progressContainer: { flex: 1, alignItems: 'center' },
    progressText: { fontWeight: '900', fontSize: 17 },
    timerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
    timerDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    timerLight: { borderColor: '#E2E8F0', backgroundColor: '#fff' },
    timerCritical: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
    timerValue: { fontWeight: '700', fontSize: 12 },
    quizNumBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    quizNumText: { fontWeight: '600', fontSize: 13 },
    quizProgressLabel: { color: '#94a3b8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    // Results View
    resultsHeader: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, padding: 24, alignItems: 'center', marginBottom: 28 },
    resultsIconBox: { width: 80, height: 80, backgroundColor: 'rgba(0,122,255,0.12)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,122,255,0.15)' },
    resultsTitle: { fontWeight: '600', fontSize: 15, marginBottom: 6 },
    scoreValue: { fontSize: 46, fontWeight: '700', letterSpacing: -1.5 },
    resultsSubtitle: { color: '#6D6D72', fontWeight: '400', fontSize: 15, marginTop: 8, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 },
    resultsMeta: { flexDirection: 'row', marginTop: 32, gap: 12, width: '100%' },
    metaCard: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    metaText: { fontWeight: '700', fontSize: 12, marginLeft: 8 },
    reviewCard: { padding: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
    reviewCardDark: { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.05)' },
    reviewCardLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },
    reviewStatusBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    reviewQuestion: { fontWeight: '600', fontSize: 14 },
    reviewMeta: { color: '#64748b', fontSize: 11, fontWeight: '500', marginTop: 2 },
    shareBtn: { height: 52, borderRadius: 16, flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
    shareBtnDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' },
    shareBtnLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },
    exportBtn: { height: 52, overflow: 'hidden', borderRadius: 16, flex: 1 },
    exportBtnContent: { height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
    actionBtnText: { fontWeight: '700', fontSize: 15, marginLeft: 8 },
    returnBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    // Explanation Bottom Sheet
    explanationSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '80%' },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(120,120,128,0.3)', alignSelf: 'center', marginBottom: 20 },
    sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
    sheetTitle: { flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 22 },
    sheetSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
    sheetAnswerBox: { padding: 14, borderRadius: 14, borderWidth: 1 },
    explanationScroll: { maxHeight: 200, marginBottom: 20 },
    explanationText: { fontSize: 15, lineHeight: 24, fontWeight: '400' },
    sheetCloseBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    sheetCloseBtnText: { fontWeight: '700', fontSize: 16 },
});

// ── Setup Form StyleSheet (sf) ───────────────────────────────────────────────
const sf = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

    segCtrl: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 20 },
    segCtrlLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
    segCtrlDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    segBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    segBtnActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    segBtnActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
    segText: { fontSize: 15 },
    chipRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginHorizontal: 0, marginBottom: 0 },
    chipBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 999, borderWidth: 1, flex: 1, minWidth: 110 },
    chipSmall: { paddingHorizontal: 10, paddingVertical: 8, minHeight: 44, minWidth: 100 },
    chipEmojiSmall: { fontSize: 16, marginRight: 6 },
    chipLabelSmall: { fontSize: 13, fontWeight: '700' },
    chipEmoji: { fontSize: 18, marginRight: 8 },
    chipLabel: { fontSize: 14, fontWeight: '700' },

    inputCard: { paddingHorizontal: 16, paddingVertical: 4, marginBottom: 24 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500' },

    uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 10, marginBottom: 24 },
    uploadTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    uploadSub: { fontSize: 13, textAlign: 'center' },
    centered: { alignItems: 'center' },

    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 5, marginBottom: 10, marginLeft: 4 },

    stepperCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 28 },
    stepperLabel: { fontSize: 16, fontWeight: '600' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    stepperBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
    stepperBtnText: { fontSize: 24, fontWeight: '400', lineHeight: 28 },
    stepperValue: { fontSize: 20, fontWeight: '800', minWidth: 32, textAlign: 'center' },

    optRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, minHeight: 64 },
    optIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    optLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optDesc: { fontSize: 13 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
    generateBtn: { width: '100%', height: 56, borderRadius: 100, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
