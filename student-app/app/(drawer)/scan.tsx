import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import {
    NavArrowLeft, Menu, Scanning, Camera,
    Album, Sparks, ShareAndroid, Flash,
    Refresh, Page, FireFlame
} from 'iconoir-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withDelay,
    Easing,
    interpolate
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useAuthStore } from '@/store/authStore';
import { Stack, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MathText } from '@/components/ui/MathText';

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { generateScanHTML } from '@/lib/pdfGenerator';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';
import { scannerService, ScanResult } from '@/lib/scanner';

// ─── Types ─────────────────────────────────────────────────────────────────────
// Redundant local type removed in favor of @/lib/scanner

const BASE_SCAN_COST = 2;
const COST_PER_SOLUTION = 4;

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';
    const router = useRouter();
    const navigation = useNavigation() as any;

    const { user, updateUser } = useAuthStore();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [results, setResults] = useState<ScanResult[]>([]);
    const [lastScanCost, setLastScanCost] = useState<number | null>(null);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);

    const scanAnim = useSharedValue(0);

    useState(() => {
        scanAnim.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    });

    const pickImage = async (useCamera: boolean) => {
        setResults([]);
        setLastScanCost(null);

        const permissionMethod = useCamera
            ? ImagePicker.requestCameraPermissionsAsync
            : ImagePicker.requestMediaLibraryPermissionsAsync;

        const { status } = await permissionMethod();
        if (status !== 'granted') {
            Alert.alert('Permission Required', `Please allow ${useCamera ? 'camera' : 'gallery'} access to scan questions.`);
            return;
        }

        const launchMethod = useCamera
            ? ImagePicker.launchCameraAsync
            : ImagePicker.launchImageLibraryAsync;

        const result = await launchMethod({
            mediaTypes: ['images'],
            quality: 0.5,
            base64: true,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };

    const handleSolve = async () => {
        if (!imageBase64) return;

        const minCost = BASE_SCAN_COST + COST_PER_SOLUTION;
        if (!user?.is_unlimited && (user?.credits ?? 0) < minCost) {
            setShowOutOfCredits(true);
            return;
        }

        setLoading(true);
        setLoadingStage('Scanning image...');

        const stages = ['Scanning image...', 'Reading handwriting...', 'Detecting questions...', 'AI Solving...', 'Double checking...', 'Finalizing results...'];
        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
        }, 2500);

        try {
            const data = await scannerService.solve(imageBase64, 'base64');
            setImageBase64(null);
            setResults(data.results || []);
            setLastScanCost(data.cost);
            
            // Refresh user stats for the dashboard
            const userRes = await api.get('me');
            if (userRes.data) {
                updateUser(userRes.data);
            }
        } catch (err: any) {
            let msg = 'Failed to solve. Try a clearer photo.';
            if (err?.response?.data?.message) msg = err.response.data.message;
            else if (err?.message) msg = err.message;
            Alert.alert('Error', msg);
        } finally {
            clearInterval(stageInterval);
            setLoading(false);
            setLoadingStage('');
        }
    };

    const handleExport = async () => {
        if (results.length === 0) return;
        setLoading(true);
        setLoadingStage('Preparing PDF...');

        try {
            const html = generateScanHTML(results);
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });
            await Sharing.shareAsync(uri);
        } catch (err) {
            if (__DEV__) console.warn('PDF Export failed', err);
            Alert.alert('Export Failed', 'Could not generate PDF report.');
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    };

    const resetScan = () => {
        setImageUri(null);
        setImageBase64(null);
        setResults([]);
        setLastScanCost(null);
    };

    return (
        <GlowBackground isRoot={true}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    style={[s.headerBtn, isDark ? s.headerBtnDark : s.headerBtnLight]}
                >
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: isDark ? 'white' : 'black' }]}>Scan & Solve</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    style={[s.headerBtn, isDark ? s.headerBtnDark : s.headerBtnLight]}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {!imageUri && results.length === 0 && (
                    <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={s.emptyStateCard}>
                        <View style={[s.iconBox, isDark ? s.bgWhite5 : s.bgWhite60]}>
                            <Scanning width={72} height={72} color="#8B5CF6" strokeWidth={1.5} />
                        </View>

                        <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>Scan Question(s)</Text>
                        <Text style={s.heroDesc}>
                            Snap a page or question. Get instant answers and explanations.
                        </Text>

                        <View style={s.btnRow}>
                            <TouchableOpacity onPress={() => pickImage(true)} activeOpacity={0.8} style={s.primaryBtnShadow}>
                                <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtnGradient}>
                                    <Camera width={18} height={18} color="white" />
                                    <Text style={s.primaryBtnText}>Camera</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage(false)} activeOpacity={0.8} style={[s.secondaryBtnGlass, isDark ? s.bgWhite10 : s.bgWhite60]}>
                                <Album width={18} height={18} color={isDark ? '#fff' : '#475569'} />
                                <Text style={[s.secondaryBtnText, isDark ? s.textWhite : s.textSlate600]}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[s.costInfo, isDark ? s.bgWhite5 : s.bgWhite60]}>
                            <FireFlame width={16} height={16} color="#8B5CF6" />
                            <Text style={s.costText}>
                                <Text style={{ color: '#8B5CF6' }}>{BASE_SCAN_COST} cr</Text> base + <Text style={{ color: '#8B5CF6' }}>{COST_PER_SOLUTION} cr</Text> per q
                            </Text>
                        </View>
                    </BlurView>
                )}

                {imageUri && results.length === 0 && (
                    <View style={s.previewContainer}>
                        <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={s.previewCard}>
                            <Image source={{ uri: imageUri }} style={s.previewImage} contentFit="cover" />
                        </BlurView>

                        {loading ? (
                            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={s.loadingCard}>
                                <View style={s.spinnerBox}>
                                    <ActivityIndicator size="large" color="#8B5CF6" />
                                </View>
                                <Text style={[s.loadingStage, isDark ? s.textWhite : s.textSlate900]}>{loadingStage || 'Processing...'}</Text>
                                <Text style={s.loadingSub}>Skeeme AI is working hard</Text>
                            </BlurView>
                        ) : (
                            <View style={s.fullBtnGroup}>
                                <TouchableOpacity onPress={handleSolve} activeOpacity={0.8} style={s.primaryBtnShadow}>
                                    <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtnGradient}>
                                        <Sparks width={18} height={18} color="#fff" />
                                        <Text style={s.fullBtnText}>Solve Everything</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={resetScan} activeOpacity={0.8} style={[s.fullSecondaryBtnGlass, isDark ? s.bgWhite10 : s.bgWhite60]}>
                                    <Text style={[s.retakeText, isDark ? s.textWhite : s.textSlate600]}>Retake Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {results.length > 0 && (
                    <View>
                        <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={s.resultsHeaderGlass}>
                            <View>
                                <Text style={[s.resultsTitle, isDark ? s.textWhite : s.textSlate900]}>{results.length} Solutions found</Text>
                                <Text style={s.resultsSub}>Deep scan complete</Text>
                            </View>
                            <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.costBadgeGradient}>
                                <Text style={s.costBadgeText}>-{lastScanCost} CR</Text>
                            </LinearGradient>
                        </BlurView>

                        {results.map((item, index) => (
                            <BlurView key={index} intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={s.questionCardGlass}>
                                <View style={s.questionHeader}>
                                    <View style={s.questionMeta}>
                                        <Text style={s.questionMetaText}>Q{index + 1}</Text>
                                        <View style={s.typeTag}>
                                            <Text style={s.typeTagText}>{item.type}</Text>
                                        </View>
                                    </View>
                                    {item.topic && (
                                        <View style={[s.topicTag, isDark ? s.bgWhite10 : s.bgWhite60]}>
                                            <Text style={s.topicTagText}>{item.topic}</Text>
                                        </View>
                                    )}
                                </View>
                                <MathText content={item.question} color={isDark ? 'white' : '#0f172a'} fontSize={18} containerStyle={{ marginBottom: 24 }} />

                                <View style={s.solutionGap}>
                                    {item.steps && item.steps.length > 0 && (
                                        <View style={[s.stepsContainer, isDark ? s.bgBlack20 : s.bgWhite60]}>
                                            <Text style={s.stepsLabel}>Solution Strategy</Text>
                                            {item.steps?.map((step, i) => (
                                                <View key={i} style={s.stepRow}>
                                                    <View style={s.stepNum}>
                                                        <Text style={s.stepNumText}>{i + 1}</Text>
                                                    </View>
                                                    <MathText content={step} color={isDark ? '#cbd5e1' : '#475569'} fontSize={15} containerStyle={{ flex: 1 }} />
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    <LinearGradient colors={['rgba(139,92,246,0.15)', 'rgba(99,102,241,0.05)']} style={s.finalAnswerBoxGradient}>
                                        <Text style={s.finalAnswerLabel}>Final Solution</Text>
                                        <MathText content={item.solution || item.summary || ''} color={isDark ? 'white' : '#0f172a'} fontSize={18} />
                                    </LinearGradient>
                                </View>
                            </BlurView>
                        ))}
                    </View>
                )}
                <View style={{ height: 24 }} />
            </ScrollView>

            {results.length > 0 && (
                <BlurView
                    intensity={isDark ? 40 : 80}
                    tint={isDark ? "dark" : "light"}
                    style={[s.footerBlur, isDark ? { borderTopColor: '#1e293b' } : { borderTopColor: '#f1f5f9' }]}
                >
                    <View style={s.footerStack}>
                        <TouchableOpacity
                            onPress={() => {
                                const topics = results.map(r => r.topic).filter(Boolean);
                                const uniqueTopics = [...new Set(topics)];
                                const combinedTopic = uniqueTopics.join(', ') || 'General';
                                router.push({ pathname: '/generate', params: { topic: combinedTopic } });
                            }}
                            activeOpacity={0.8}
                            style={s.primaryBtnShadow}
                        >
                            <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtnGradient}>
                                <Sparks width={18} height={18} color="white" />
                                <Text style={s.primaryBtnText}>Practice Similar Quiz</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={s.footerRow}>
                            <TouchableOpacity
                                onPress={handleExport}
                                disabled={loading}
                                activeOpacity={0.8}
                                style={[s.footerSecondaryBtnGlass, isDark ? s.bgWhite10 : s.bgWhite60]}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#8B5CF6" />
                                ) : (
                                    <View style={s.rowBtnContent}>
                                        <Page width={18} height={18} color={isDark ? '#fff' : '#475569'} />
                                        <Text style={[s.rowBtnText, { color: isDark ? 'white' : '#475569' }]}>Export PDF</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={resetScan}
                                activeOpacity={0.8}
                                style={[s.footerTertiaryBtnGlass, isDark ? s.bgWhite10 : s.bgWhite60]}
                            >
                                <View style={s.rowBtnContent}>
                                    <Camera width={18} height={18} color={isDark ? '#fff' : '#475569'} />
                                    <Text style={[s.rowBtnText, { color: isDark ? 'white' : '#475569' }]}>Next Scan</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            )}
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    headerBtnLight: { backgroundColor: 'rgba(255,255,255,0.6)' },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },

    emptyStateCard: { alignItems: 'center', padding: 32, borderRadius: 40, marginTop: 10 },
    iconBox: { width: 140, height: 140, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    heroTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center', letterSpacing: -1 },
    heroDesc: { color: '#64748b', textAlign: 'center', fontWeight: '600', fontSize: 14, marginBottom: 40, paddingHorizontal: 10, lineHeight: 22 },
    
    btnRow: { flexDirection: 'row', width: '100%', gap: 12 },
    primaryBtnShadow: { flex: 1, height: 56, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 },
    secondaryBtnGlass: { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    secondaryBtnText: { fontWeight: '800', fontSize: 16, letterSpacing: -0.3, marginLeft: 8 },

    costInfo: { marginTop: 32, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
    costText: { color: '#64748b', fontWeight: '800', fontSize: 12, marginLeft: 8 },

    previewContainer: { alignItems: 'center' },
    previewCard: { width: '100%', borderRadius: 32, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: 'rgba(139, 92, 246, 0.3)' },
    previewImage: { width: '100%', height: 350 },
    
    loadingCard: { alignItems: 'center', paddingVertical: 40, width: '100%', borderRadius: 32, marginTop: 24 },
    spinnerBox: { marginBottom: 20 },
    loadingStage: { fontWeight: '800', fontSize: 17, letterSpacing: -0.5 },
    loadingSub: { color: '#64748b', fontWeight: '600', fontSize: 13, marginTop: 4 },
    
    fullBtnGroup: { width: '100%', gap: 12, marginTop: 24 },
    fullBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    fullSecondaryBtnGlass: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    retakeText: { fontWeight: '800', fontSize: 15 },

    resultsHeaderGlass: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: 24, borderRadius: 32, borderBottomWidth: 2, borderBottomColor: 'rgba(139, 92, 246, 0.2)' },
    resultsTitle: { fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
    resultsSub: { color: '#64748b', fontWeight: '700', fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    costBadgeGradient: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    costBadgeText: { color: 'white', fontWeight: '900', fontSize: 11, letterSpacing: 1 },

    questionCardGlass: { marginBottom: 24, width: '100%', padding: 24, borderRadius: 32, borderBottomWidth: 2, borderBottomColor: 'rgba(139, 92, 246, 0.1)' },
    questionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16 },
    questionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    questionMetaText: { color: '#94a3b8', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
    typeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.1)' },
    typeTagText: { fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#8B5CF6' },
    topicTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    topicTagText: { color: '#64748b', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

    solutionGap: { gap: 20 },
    stepsContainer: { padding: 20, borderRadius: 20 },
    bgBlack20: { backgroundColor: 'rgba(0,0,0,0.2)' },
    stepsLabel: { color: '#94a3b8', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    stepRow: { flexDirection: 'row', marginBottom: 16 },
    stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(139, 92, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
    stepNumText: { color: '#8B5CF6', fontWeight: '900', fontSize: 11 },

    finalAnswerBoxGradient: { borderRadius: 20, padding: 20, overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: '#8B5CF6' },
    finalAnswerLabel: { color: '#8B5CF6', fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },

    footerBlur: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40, borderTopWidth: 1 },
    footerStack: { gap: 12 },
    footerRow: { flexDirection: 'row', gap: 12 },
    footerSecondaryBtnGlass: { height: 56, borderRadius: 16, flex: 1, alignItems: 'center', justifyContent: 'center' },
    footerTertiaryBtnGlass: { height: 56, borderRadius: 16, flex: 1, alignItems: 'center', justifyContent: 'center' },
    rowBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowBtnText: { fontWeight: '800', fontSize: 15 },

    bgWhite5: { backgroundColor: 'rgba(255,255,255,0.05)' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate600: { color: '#475569' },
});
