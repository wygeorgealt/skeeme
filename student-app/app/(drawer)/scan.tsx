import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/lib/haptics';
import Animated, {
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    FadeIn,
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MathText } from '@/components/ui/MathText';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Clipboard from 'expo-clipboard';

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { generateScanHTML } from '@/lib/pdfGenerator';
import { scannerService, ScanResult } from '@/lib/scanner';
import { posthog } from '@/lib/posthog';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { ScanIcon, ArrowLeft01Icon, EnergyIcon, Image01Icon, CreditCardIcon, Shield01Icon, ListViewIcon, CheckmarkCircle01Icon, ThumbsUpIcon, ThumbsDownIcon, ArrowRight01Icon, Share01Icon, Camera01Icon } from '@hugeicons/core-free-icons';

const BASE_SCAN_COST = 50;
const COST_PER_SOLUTION = 0;
const { width } = Dimensions.get('window');
const CROP_BOX_WIDTH = width * 0.85;
const CROP_BOX_HEIGHT = 160;

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const C = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const { user, updateUser } = useAuthStore();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [results, setResults] = useState<ScanResult[]>([]);
    const [lastScanCost, setLastScanCost] = useState<number | null>(null);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [feedback, setFeedback] = useState<Record<number, 'helpful' | 'unhelpful'>>({});

    const [progressPercent, setProgressPercent] = useState(0);

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
            const base64Data = result.assets[0].base64 || null;
            setImageUri(result.assets[0].uri);
            setImageBase64(base64Data);

            if (base64Data) {
                // Yield to allow the UI to transition to the preview screen before heavy processing
                setTimeout(() => {
                    handleSolve(base64Data);
                }, 50);
            }
        }
    };

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            haptics.impactAsync();
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

            if (photo) {
                setLoading(true);
                setLoadingStage('Preparing image...');
                setProgressPercent(0);

                // Resize and compress, do not crop (avoids aspect ratio mismatch bugs)
                const manipulated = await manipulateAsync(
                    photo.uri,
                    [{ resize: { width: 1080 } }],
                    { compress: 0.7, format: SaveFormat.JPEG, base64: true }
                );

                setImageUri(manipulated.uri);
                setImageBase64(manipulated.base64 || null);

                // Immediately start solving instead of waiting for a button click
                if (manipulated.base64) {
                    await handleSolve(manipulated.base64);
                } else {
                    setLoading(false);
                }
            }
        } catch (e) {
            if (__DEV__) console.warn('Capture failed', e);
            Alert.alert('Error', 'Could not take picture.');
            setLoading(false);
        }
    };

    const handleSolve = async (directBase64?: string) => {
        const targetBase64 = directBase64 || imageBase64;
        if (!targetBase64) return;

        let currentCredits = user?.credits ?? 0;
        let isUnlimited = user?.is_unlimited ?? false;
        
        const minCost = BASE_SCAN_COST + COST_PER_SOLUTION;
        if (!isUnlimited && currentCredits < minCost) {
            // Force refresh user from API before failing, in case they just topped up
            try {
                const userRes = await api.get('me');
                if (userRes.data) {
                    updateUser(userRes.data);
                    currentCredits = userRes.data.credits ?? 0;
                    isUnlimited = userRes.data.is_unlimited ?? false;
                }
            } catch (e) {}

            if (!isUnlimited && currentCredits < minCost) {
                setShowOutOfCredits(true);
                return;
            }
        }

        setLoading(true);
        setLoadingStage('Scan image...');
        setProgressPercent(10);

        const stages = ['Scan image...', 'Reading handwriting...', 'Detecting questions...', 'AI Solving...', 'Double checking...', 'Finalizing results...'];
        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            stageIdx = Math.min(stageIdx + 1, stages.length - 1);
            setLoadingStage(stages[stageIdx]);
            setProgressPercent(prev => Math.min(prev + 15, 90));
        }, 2500);

        try {
            const data = await scannerService.solve(targetBase64, 'base64');
            setProgressPercent(100);
            
            setImageBase64(null);
            setResults(data.results || []);
            setLastScanCost(data.cost);

            try {
                posthog.capture('scan_solved', {
                    questions_found: data.results?.length || 0,
                    cost: data.cost
                });
            } catch (e) { /* ignore */ }

            const userRes = await api.get('me');
            if (userRes.data) {
                updateUser(userRes.data);
            }
        } catch (err: any) {
            if (err?.response?.status !== 402 && err?.response?.status !== 403) {
                let msg = 'Failed to solve. Try a clearer photo.';
                if (err?.response?.data?.message) msg = err.response.data.message;
                else if (err?.message) msg = err.message;
                Alert.alert('Error', msg);
            }
        } finally {
            clearInterval(stageInterval);
            setLoading(false);
            setLoadingStage('');
        }
    };

    const handleCopy = async (text: string) => {
        await Clipboard.setStringAsync(text);
        haptics.notificationAsync('success' as any);
    };

    const handleExport = async () => {
        if (results.length === 0) return;
        setLoading(true);
        setLoadingStage('Preparing PDF...');

        try {
            const html = generateScanHTML(results);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            await Sharing.shareAsync(uri);
            try { posthog.capture('scan_exported'); } catch (e) { }
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

    const [enableTorch, setEnableTorch] = useState(false);
    const showLiveScanner = !imageUri && results.length === 0;

    if (showLiveScanner) {
        return (
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <Stack.Screen options={{ headerShown: false }} />
                {!permission ? (
                    <View style={{ flex: 1 }} />
                ) : !permission.granted ? (
                    <View style={s.permissionContainer}>
                        <HugeiconsIcon icon={ScanIcon} size={64} color={C.primary} style={{ marginBottom: 24 }} />
                        <Text style={[s.heroTitle, { color: C.text }]}>Camera Access Needed</Text>
                        <Text style={[s.heroDesc, { paddingHorizontal: 40 }]}>
                            Skeeme needs your camera to scan equations and past questions instantly.
                        </Text>
                        <TouchableOpacity onPress={requestPermission} style={[s.primaryBtnShadow, { width: 200, backgroundColor: C.primary }]}>
                            <View style={s.primaryBtnGradient}>
                                <Text style={s.primaryBtnText}>Grant Access</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={StyleSheet.absoluteFill}>
                        <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} enableTorch={enableTorch} />

                        <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between' }]}>
                            {/* Top Semi-transparent Overlay */}
                            <View style={[s.topChrome, { paddingTop: Math.max(insets.top, 16) }]}>
                                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.overlayTopBtn}>
                                    <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEnableTorch(!enableTorch)} activeOpacity={0.7} style={s.overlayTopBtn}>
                                    {enableTorch ? (
                                        <HugeiconsIcon icon={EnergyIcon} size={24} color="white" />
                                    ) : (
                                        <HugeiconsIcon icon={EnergyIcon} size={24} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Center Viewfinder */}
                            <View style={s.centerViewfinder}>
                                <Text style={s.instructionText}>Take a clear photo of your questions</Text>
                            </View>

                            {/* Bottom Semi-transparent Overlay */}
                            <View style={[s.bottomChrome, { paddingBottom: Math.max(insets.bottom, 32) + 90 }]}>
                                <TouchableOpacity onPress={() => pickImage(false)} activeOpacity={0.8} style={s.galleryBtn}>
                                    <HugeiconsIcon icon={Image01Icon} size={28} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleCapture} activeOpacity={0.8} style={s.shutterOuter}>
                                    <View style={s.shutterInner} />
                                </TouchableOpacity>

                                {/* Empty view to balance the gallery button for centered flex layout */}
                                <View style={{ width: 44, height: 44 }} />
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={resetScan} activeOpacity={0.7} style={[s.headerBtn, { backgroundColor: isDark ? C.card : C.cardSecondary }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={C.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Results</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {!!imageUri && results.length === 0 && (
                    <View style={s.previewContainer}>
                        <BlurView 
                            intensity={Platform.OS === 'ios' ? (isDark ? 30 : 60) : 0} 
                            tint={isDark ? 'dark' : 'light'} 
                            style={[s.previewCard, {
                                backgroundColor: isDark 
                                    ? (Platform.OS === 'android' ? '#1C1C1E' : 'rgba(28,28,30,0.4)') 
                                    : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.6)')
                            }]}
                        >
                            <View style={{ width: '100%', height: 350, overflow: 'hidden' }}>
                                <ExpoImage source={{ uri: imageUri }} style={s.previewImage} contentFit="cover" />
                                {loading && (
                                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                                )}
                            </View>
                        </BlurView>

                        {loading && (
                            <BlurView 
                                intensity={Platform.OS === 'ios' ? (isDark ? 40 : 80) : 0} 
                                tint={isDark ? 'dark' : 'light'} 
                                style={[s.loadingCard, {
                                    backgroundColor: isDark 
                                        ? (Platform.OS === 'android' ? '#121212' : 'rgba(18,18,18,0.7)') 
                                        : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
                                }]}
                            >
                                <Text style={[s.loadingStage, isDark ? s.textWhite : s.textSlate900, { marginBottom: 16 }]}>{loadingStage || 'Processing...'}</Text>
                                
                                <View style={s.progressBarContainer}>
                                    <View style={[s.progressBarFill, { width: `${progressPercent}%` }]} />
                                </View>

                                <Text style={s.loadingSub}>Skeeme AI is working hard</Text>
                            </BlurView>
                        )}
                    </View>
                )}

                {!!(results.length > 0) && (
                    <View>
                        {/* Captured Image Thumbnail */}
                        {!!imageUri && (
                            <View style={[s.capturedImageBar, isDark ? s.cardDark : s.cardLight]}>
                                <ExpoImage source={{ uri: imageUri }} style={s.capturedThumb} contentFit="contain" />
                            </View>
                        )}

                        {/* Metadata Bar (Credits Used + Accuracy) */}
                        <View style={[s.metaBar, isDark ? s.cardDark : s.cardLight]}>
                            <View style={s.metaItem}>
                                <HugeiconsIcon icon={CreditCardIcon} size={14} color={C.primary} />
                                <Text style={[s.metaLabel, isDark ? s.textSlate400d : s.textSlate500l]}>Credits</Text>
                                <Text style={[s.metaValue, isDark ? s.textWhite : s.textSlate900]}>{lastScanCost ?? '—'}</Text>
                            </View>
                            <View style={s.metaDivider} />
                            <View style={s.metaItem}>
                                <HugeiconsIcon icon={Shield01Icon} size={14} color="#10b981" />
                                <Text style={[s.metaLabel, isDark ? s.textSlate400d : s.textSlate500l]}>Accuracy</Text>
                                <Text style={[s.metaValue, isDark ? s.textWhite : s.textSlate900]}>High</Text>
                            </View>
                        </View>

                        {/* Solutions */}
                        {results.map((item, index) => (
                            <View key={index} style={[s.answerCard, isDark ? s.cardDark : s.cardLight]}>
                                {/* Question Section */}
                                <View style={s.sectionHeaderRow}>
                                    <View style={s.sectionTitleContainer}>
                                        <Text style={[s.sectionTitle, isDark ? s.textWhite : s.textSlate900]}>Question</Text>
                                    </View>
                                    {!!item.topic && (
                                        <View style={s.topicPill}>
                                            <Text style={s.topicPillText}>{item.topic}</Text>
                                        </View>
                                    )}
                                </View>
                                <MathText
                                    content={item.question || 'No question text found.'}
                                    color={isDark ? '#e2e8f0' : '#1e293b'}
                                    fontSize={16}
                                    containerStyle={{ marginBottom: 24 }}
                                />

                                {/* Answer Section */}
                                <View style={[s.sectionDivider, isDark ? s.dividerDark : s.dividerLight]} />
                                <View style={s.sectionHeaderRow}>
                                    <View style={s.answerIconRow}>
                                        <HugeiconsIcon icon={ListViewIcon} size={18} color={C.primary} />
                                        <Text style={[s.sectionTitle, isDark ? s.textWhite : s.textSlate900]}>Answer</Text>
                                    </View>
                                </View>

                                {!!(item.solution || item.summary) && (
                                    <View style={[s.answerHighlight, isDark ? s.answerHighlightDark : s.answerHighlightLight]}>
                                        <MathText
                                            content={item.solution || item.summary || ''}
                                            color={isDark ? '#f1f5f9' : '#0f172a'}
                                            fontSize={17}
                                            containerStyle={{ paddingVertical: 8 }}
                                        />
                                    </View>
                                )}

                                {/* Explanation Section — Gauth-style flowing document */}
                                <View style={[s.sectionDivider, isDark ? s.dividerDark : s.dividerLight]} />

                                <MathText
                                    content={
                                        item.explanation
                                            ? item.explanation
                                            : (item.steps && item.steps.length > 0 ? item.steps.join('\n\n') : 'No detailed explanation available.')
                                    }
                                    color={isDark ? '#cbd5e1' : '#334155'}
                                    fontSize={16}
                                    containerStyle={{ marginBottom: 20 }}
                                />

                                {/* Feedback Row */}
                                <View style={s.feedbackRow}>
                                    {feedback[index] ? (
                                        <Animated.View entering={FadeIn.duration(300)} style={s.feedbackDone}>
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="#10b981" />
                                            <Text style={[s.feedbackDoneText, { color: '#10b981' }]}>
                                                Thanks for the feedback!
                                            </Text>
                                        </Animated.View>
                                    ) : (
                                        <>
                                            <Text style={[s.feedbackPrompt, isDark ? s.textSlate400d : s.textSlate500l]}>Happy with the answer?</Text>
                                            <View style={s.feedbackBtns}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        haptics.notificationAsync('success' as any);
                                                        setFeedback(prev => ({ ...prev, [index]: 'helpful' }));
                                                    }}
                                                    activeOpacity={0.7}
                                                    style={[s.feedbackBtn, isDark ? s.feedbackBtnDark : s.feedbackBtnLight]}
                                                >
                                                    <HugeiconsIcon icon={ThumbsUpIcon} size={14} color={isDark ? 'white' : '#0f172a'} />
                                                    <Text style={[s.feedbackBtnText, isDark ? s.textWhite : s.textSlate900]}>Helpful</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        haptics.notificationAsync('warning' as any);
                                                        setFeedback(prev => ({ ...prev, [index]: 'unhelpful' }));
                                                    }}
                                                    activeOpacity={0.7}
                                                    style={[s.feedbackBtn, isDark ? s.feedbackBtnDark : s.feedbackBtnLight]}
                                                >
                                                    <HugeiconsIcon icon={ThumbsDownIcon} size={14} color={isDark ? 'white' : '#0f172a'} />
                                                    <Text style={[s.feedbackBtnText, isDark ? s.textWhite : s.textSlate900]}>Unhelpful</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Follow-up Bar */}
                        <TouchableOpacity
                            onPress={() => {
                                const topics = results.map(r => r.topic).filter(Boolean);
                                const uniqueTopics = [...new Set(topics)];
                                const combinedTopic = uniqueTopics.join(', ') || 'General';
                                router.push({ pathname: '/generate', params: { topic: combinedTopic } });
                            }}
                            activeOpacity={0.8}
                            style={[s.followUpBar, isDark ? s.cardDark : s.cardLight]}
                        >
                            <View style={s.followUpInner}>
                                <Text style={[s.followUpText, isDark ? s.textSlate400d : s.textSlate500l]}>Practice similar questions...</Text>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={C.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 24 }} />
            </ScrollView>

            {/* Slim Bottom Actions */}
            {!!(results.length > 0) && (
                <BlurView 
                    intensity={Platform.OS === 'ios' ? (isDark ? 80 : 100) : 0} 
                    tint={isDark ? "dark" : "light"} 
                    style={[
                        s.slimFooter, 
                        isDark ? s.slimFooterDark : s.slimFooterLight,
                        {
                            bottom: 90,
                            backgroundColor: isDark 
                                ? (Platform.OS === 'android' ? '#000000' : 'rgba(0,0,0,0.8)') 
                                : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.9)')
                        }
                    ]}
                >
                    <TouchableOpacity onPress={handleExport} disabled={loading} activeOpacity={0.7} style={s.slimFooterBtn}>
                        {loading ? (
                            <ActivityIndicator size="small" color={C.primary} />
                        ) : (
                            <>
                                <HugeiconsIcon icon={Share01Icon} size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                                <Text style={[s.slimFooterBtnText, isDark ? s.textSlate400d : s.textSlate500l]}>Share PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={[s.slimFooterDivider, isDark ? s.dividerDark : s.dividerLight]} />
                    <TouchableOpacity onPress={resetScan} activeOpacity={0.7} style={s.slimFooterBtn}>
                        <HugeiconsIcon icon={Camera01Icon} size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                        <Text style={[s.slimFooterBtnText, isDark ? s.textSlate400d : s.textSlate500l]}>Scan New</Text>
                    </TouchableOpacity>
                </BlurView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    headerBtnLight: { backgroundColor: 'rgba(255,255,255,0.6)' },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },

    heroTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center', letterSpacing: -1 },
    heroDesc: { color: '#64748b', textAlign: 'center', fontWeight: '600', fontSize: 14, marginBottom: 30, lineHeight: 22 },

    primaryBtnShadow: { height: 56, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, alignItems: 'center', justifyContent: 'center' },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 },

    // Live Camera Overlays
    topChrome: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.45)' },
    overlayTopBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

    centerViewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    viewfinderBox: { width: CROP_BOX_WIDTH, height: CROP_BOX_HEIGHT, backgroundColor: 'transparent', marginBottom: 24 },
    cropCornerTL: { position: 'absolute', top: -2, left: -2, width: 32, height: 32, borderTopWidth: 4, borderLeftWidth: 4, borderColor: 'white' },
    cropCornerTR: { position: 'absolute', top: -2, right: -2, width: 32, height: 32, borderTopWidth: 4, borderRightWidth: 4, borderColor: 'white' },
    cropCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 32, height: 32, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: 'white' },
    cropCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderBottomWidth: 4, borderRightWidth: 4, borderColor: 'white' },
    instructionText: { color: 'white', fontSize: 13, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

    bottomChrome: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 24, backgroundColor: 'rgba(0,0,0,0.45)' },
    shutterOuter: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'transparent', borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
    shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#007AFF' },
    galleryBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

    // Preview (before solve)
    previewContainer: { alignItems: 'center' },
    previewCard: { width: '100%', borderRadius: 24, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: 'rgba(139, 92, 246, 0.3)' },
    previewImage: { width: '100%', height: '100%' },
    scanLineContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, opacity: 0.8 },
    loadingCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, width: '100%', borderRadius: 24, marginTop: 24 },
    spinnerBox: { marginBottom: 20 },
    loadingStage: { fontWeight: '800', fontSize: 17, letterSpacing: -0.5 },
    loadingSub: { color: '#64748b', fontWeight: '600', fontSize: 13, marginTop: 12 },
    
    progressBarContainer: { width: '100%', height: 6, backgroundColor: 'rgba(0,122,255,0.15)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 3 },
    fullBtnGroup: { width: '100%', gap: 12, marginTop: 24 },
    fullBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    fullSecondaryBtnGlass: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    retakeText: { fontWeight: '800', fontSize: 15 },

    // === Minimalistic Results (Gauth-inspired) ===

    // Card containers
    cardDark: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardLight: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(60,60,67,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },

    // Captured image bar
    capturedImageBar: { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
    capturedThumb: { width: '100%', height: 180 },

    // Metadata bar (Credits Used + Accuracy)
    metaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
    metaItem: { flex: 1, alignItems: 'center', gap: 4 },
    metaLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },
    metaValue: { fontSize: 16, fontWeight: '800' },
    metaDivider: { width: 1, height: 24, backgroundColor: 'rgba(148,163,184,0.2)' },

    // Answer cards — Gauth-inspired clean document layout
    answerCard: { borderRadius: 24, padding: 24, marginBottom: 16 },

    // Section layout
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
    answerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },

    copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(148,163,184,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    copyBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

    topicPill: { backgroundColor: 'rgba(0,122,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    topicPillText: { color: '#007AFF', fontWeight: '700', fontSize: 11, letterSpacing: 0.3 },

    // Section divider (thin, spacious)
    sectionDivider: { height: 1.5, marginTop: 4, marginBottom: 20, opacity: 0.1 },

    // Answer highlight box
    answerHighlight: { borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#10b981', marginBottom: 20, padding: 25 },
    answerHighlightLight: { backgroundColor: 'rgba(16,185,129,0.03)' },
    answerHighlightDark: { backgroundColor: 'rgba(16,185,129,0.06)' },

    // Feedback
    feedbackRow: { alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.08)' },
    feedbackBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    feedbackPrompt: { fontSize: 13, fontWeight: '600', marginBottom: 16 },
    feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
    feedbackBtnDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
    feedbackBtnLight: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    feedbackBtnText: { fontSize: 13, fontWeight: '700' },
    feedbackDone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 14 },
    feedbackDoneText: { fontSize: 13, fontWeight: '700' },

    // Follow-up bar
    followUpBar: { borderRadius: 20, padding: 20, marginTop: 4 },
    followUpInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    followUpText: { fontSize: 15, fontWeight: '600' },

    // Slim footer
    slimFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingBottom: 40, borderTopWidth: 1 },
    slimFooterDark: { backgroundColor: 'rgba(0,0,0,0.8)', borderTopColor: 'rgba(255,255,255,0.08)' },
    slimFooterLight: { backgroundColor: 'rgba(255,255,255,0.9)', borderTopColor: 'rgba(60,60,67,0.08)' },
    slimFooterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 10 },
    slimFooterBtnText: { fontSize: 15, fontWeight: '700' },
    slimFooterDivider: { width: 1, height: 24 },

    // Text utilities
    textSlate400d: { color: '#94a3b8' },
    textSlate500l: { color: '#64748b' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate600: { color: '#475569' },
    dividerDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
    dividerLight: { backgroundColor: '#f1f5f9' },
    sectionTitleContainer: { flex: 1 },
});
