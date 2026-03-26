import { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, StyleSheet, Dimensions
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
    NavArrowLeft, Menu, Scanning, Camera,
    Album, Sparks, Page, Type
} from 'iconoir-react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
    useSharedValue, 
    withRepeat, 
    withTiming, 
    Easing,
    FadeIn
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useAuthStore } from '@/store/authStore';
import { Stack, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MathText } from '@/components/ui/MathText';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { generateScanHTML } from '@/lib/pdfGenerator';
import { scannerService, ScanResult } from '@/lib/scanner';

const BASE_SCAN_COST = 2;
const COST_PER_SOLUTION = 4;
const { width } = Dimensions.get('window');
const CROP_BOX_WIDTH = width * 0.85;
const CROP_BOX_HEIGHT = 160;

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const navigation = useNavigation() as any;

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

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            
            if (photo) {
                setLoading(true);
                setLoadingStage('Cropping...');

                // Calculate crop coordinates relative to image size
                const screenHeight = Dimensions.get('window').height;
                const headerHeight = 44 + Math.max(insets.top, 16);
                const remainingHeight = screenHeight - headerHeight;
                const topFlexHeight = (remainingHeight - CROP_BOX_HEIGHT) / 2;
                
                const cropTop = headerHeight + topFlexHeight;
                const cropLeft = (width - CROP_BOX_WIDTH) / 2;

                // Scale to image dimensions
                const scaleX = photo.width / width;
                const scaleY = photo.height / screenHeight;

                const originX = cropLeft * scaleX;
                const originY = cropTop * scaleY;
                const cropWidth = CROP_BOX_WIDTH * scaleX;
                const cropHeight = CROP_BOX_HEIGHT * scaleY;

                const manipulated = await manipulateAsync(
                    photo.uri,
                    [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
                    { compress: 0.7, format: SaveFormat.JPEG, base64: true }
                );

                setImageUri(manipulated.uri);
                setImageBase64(manipulated.base64 || null);
                setLoading(false);
            }
        } catch (e) {
            if (__DEV__) console.warn('Capture failed', e);
            Alert.alert('Error', 'Could not take picture.');
            setLoading(false);
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
            const { uri } = await Print.printToFileAsync({ html, base64: false });
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
                        <Scanning width={64} height={64} color="#8B5CF6" style={{ marginBottom: 24 }} />
                        <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>Camera Access Needed</Text>
                        <Text style={[s.heroDesc, { paddingHorizontal: 40 }]}>
                            Skeeme needs your camera to scan equations and past questions instantly.
                        </Text>
                        <TouchableOpacity onPress={requestPermission} style={[s.primaryBtnShadow, { width: 200 }]}>
                            <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtnGradient}>
                                <Text style={s.primaryBtnText}>Grant Access</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={StyleSheet.absoluteFill}>
                        <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} enableTorch={enableTorch} />
                        
                        <View style={StyleSheet.absoluteFill}>
                            <View style={[s.overlayHeader, { paddingTop: Math.max(insets.top, 16) }]}>
                                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.overlayTopBtn}>
                                    <NavArrowLeft width={22} height={22} color="white" />
                                </TouchableOpacity>
                                <View style={{ width: 44 }} />
                            </View>

                            <View style={s.overlayDimmedFlex} />

                            <View style={s.cropRow}>
                                <View style={s.overlayDimmedSide} />
                                <View style={s.cropBox}>
                                    <View style={s.cropCornerTL} />
                                    <View style={s.cropCornerTR} />
                                    <View style={s.cropCornerBL} />
                                    <View style={s.cropCornerBR} />
                                </View>
                                <View style={s.overlayDimmedSide} />
                            </View>

                            <View style={s.overlayDimmedFlexBottom}>
                                <View style={s.captureControls}>
                                    <TouchableOpacity onPress={() => setEnableTorch(!enableTorch)} activeOpacity={0.8} style={s.secondaryActionCircle}>
                                        <Ionicons name={enableTorch ? "flash" : "flash-off"} size={22} color="#333" />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={handleCapture} activeOpacity={0.8} style={s.mainCaptureOuter}>
                                        <View style={s.mainCaptureInner}>
                                            <MathText content="" color="white" fontSize={18} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => pickImage(false)} activeOpacity={0.8} style={s.secondaryActionCircle}>
                                        <Ionicons name="images-outline" size={22} color="#333" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    }

    return (
        <GlowBackground isRoot={true}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={resetScan} activeOpacity={0.7} style={[s.headerBtn, isDark ? s.headerBtnDark : s.headerBtnLight]}>
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: isDark ? 'white' : 'black' }]}>Results</Text>
                <TouchableOpacity onPress={() => navigation.openDrawer()} activeOpacity={0.7} style={[s.headerBtn, isDark ? s.headerBtnDark : s.headerBtnLight]}>
                    <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {!!imageUri && results.length === 0 && (
                    <View style={s.previewContainer}>
                        <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={s.previewCard}>
                            <ExpoImage source={{ uri: imageUri }} style={s.previewImage} contentFit="cover" />
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

                {!!(results.length > 0) && (
                    <View>
                        {/* Captured Image Thumbnail */}
                        {!!imageUri && (
                            <View style={[s.capturedImageBar, isDark ? s.cardDark : s.cardLight]}>
                                <ExpoImage source={{ uri: imageUri }} style={s.capturedThumb} contentFit="cover" />
                            </View>
                        )}

                        {/* Metadata Bar: Credits Used + Accuracy */}
                        <View style={[s.metaBar, isDark ? s.cardDark : s.cardLight]}>
                            <View style={s.metaItem}>
                                <Sparks width={16} height={16} color="#8B5CF6" />
                                <Text style={[s.metaLabel, isDark ? s.textSlate400d : s.textSlate500l]}>Credits Used</Text>
                                <Text style={[s.metaValue, isDark ? s.textWhite : s.textSlate900]}>{lastScanCost ?? '—'}</Text>
                            </View>
                            <View style={s.metaDivider} />
                            <View style={s.metaItem}>
                                <Sparks width={16} height={16} color="#10b981" />
                                <Text style={[s.metaLabel, isDark ? s.textSlate400d : s.textSlate500l]}>Accuracy</Text>
                                <Text style={[s.metaValue, isDark ? s.textWhite : s.textSlate900]}>High</Text>
                            </View>
                        </View>

                        {/* Solutions */}
                        {results.map((item, index) => (
                            <View key={index} style={[s.answerCard, isDark ? s.cardDark : s.cardLight]}>
                                {/* Question Header */}
                                <View style={s.answerHeader}>
                                    <View style={s.qBadge}>
                                        <Text style={s.qBadgeText}>Q{index + 1}</Text>
                                    </View>
                                    {!!item.topic && (
                                        <Text style={[s.topicLabel, isDark ? s.textSlate400d : s.textSlate500l]}>{item.topic}</Text>
                                    )}
                                </View>

                                {/* Question Text */}
                                <MathText content={item.question} color={isDark ? '#e2e8f0' : '#0f172a'} fontSize={16} containerStyle={{ marginBottom: 20 }} />

                                {/* Divider */}
                                <View style={[s.answerDivider, isDark ? s.dividerDark : s.dividerLight]} />

                                {/* Answer Label */}
                                <View style={s.answerLabelRow}>
                                    <Text style={s.answerLabelIcon}>≡</Text>
                                    <Text style={[s.answerLabelText, isDark ? s.textWhite : s.textSlate900]}>Answer</Text>
                                </View>

                                {/* Step-by-step Solution */}
                                {!!(item.steps && item.steps.length > 0) && (
                                    <View style={s.stepsBlock}>
                                        {item.steps.map((step, i) => (
                                            <View key={i} style={s.stepItem}>
                                                <View style={[s.stepCircle, isDark ? s.stepCircleDark : s.stepCircleLight]}>
                                                    <Text style={s.stepCircleText}>{i + 1}</Text>
                                                </View>
                                                <MathText content={step} color={isDark ? '#cbd5e1' : '#334155'} fontSize={15} containerStyle={{ flex: 1 }} />
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Final Answer */}
                                <View style={[s.finalBox, isDark ? s.finalBoxDark : s.finalBoxLight]}>
                                    <Text style={s.finalLabel}>Answer:</Text>
                                    <MathText content={item.solution || item.summary || ''} color={isDark ? 'white' : '#0f172a'} fontSize={16} />
                                </View>

                                {/* Explanation (if present) */}
                                {!!item.explanation && (
                                    <View style={s.explanationBlock}>
                                        <MathText content={item.explanation} color={isDark ? '#94a3b8' : '#64748b'} fontSize={14} />
                                    </View>
                                )}

                                {/* Feedback Row */}
                                <View style={s.feedbackRow}>
                                    {feedback[index] ? (
                                        <Animated.View entering={FadeIn.duration(300)} style={s.feedbackDone}>
                                            <Text style={s.feedbackDoneIcon}>{feedback[index] === 'helpful' ? '👍' : '👎'}</Text>
                                            <Text style={[s.feedbackDoneText, { color: feedback[index] === 'helpful' ? '#10b981' : '#f59e0b' }]}>
                                                {feedback[index] === 'helpful' ? 'Thanks for the feedback!' : 'We\'ll improve this'}
                                            </Text>
                                        </Animated.View>
                                    ) : (
                                        <>
                                            <Text style={[s.feedbackPrompt, isDark ? s.textSlate400d : s.textSlate500l]}>Happy with the answer?</Text>
                                            <View style={s.feedbackBtns}>
                                                <TouchableOpacity 
                                                    onPress={() => {
                                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                        setFeedback(prev => ({ ...prev, [index]: 'helpful' }));
                                                    }}
                                                    activeOpacity={0.7} 
                                                    style={[s.feedbackBtn, isDark ? s.feedbackBtnDark : s.feedbackBtnLight]}
                                                >
                                                    <Text style={s.feedbackBtnIcon}>👍</Text>
                                                    <Text style={[s.feedbackBtnText, isDark ? s.textWhite : s.textSlate900]}>Helpful</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => {
                                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                                        setFeedback(prev => ({ ...prev, [index]: 'unhelpful' }));
                                                    }}
                                                    activeOpacity={0.7} 
                                                    style={[s.feedbackBtn, isDark ? s.feedbackBtnDark : s.feedbackBtnLight]}
                                                >
                                                    <Text style={s.feedbackBtnIcon}>👎</Text>
                                                    <Text style={[s.feedbackBtnText, isDark ? s.textWhite : s.textSlate900]}>Unhelpful</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Follow-up Input */}
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
                            <Text style={[s.followUpText, isDark ? s.textSlate400d : s.textSlate500l]}>Practice similar questions...</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 24 }} />
            </ScrollView>

            {/* Slim Bottom Actions */}
            {!!(results.length > 0) && (
                <View style={[s.slimFooter, isDark ? s.slimFooterDark : s.slimFooterLight]}>
                    <TouchableOpacity onPress={handleExport} disabled={loading} activeOpacity={0.7} style={s.slimFooterBtn}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        ) : (
                            <>
                                <Page width={18} height={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                                <Text style={[s.slimFooterBtnText, isDark ? s.textSlate400d : s.textSlate500l]}>Export</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={[s.slimFooterDivider, isDark ? s.dividerDark : s.dividerLight]} />
                    <TouchableOpacity onPress={resetScan} activeOpacity={0.7} style={s.slimFooterBtn}>
                        <Camera width={18} height={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                        <Text style={[s.slimFooterBtnText, isDark ? s.textSlate400d : s.textSlate500l]}>New Scan</Text>
                    </TouchableOpacity>
                </View>
            )}
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    headerBtnLight: { backgroundColor: 'rgba(255,255,255,0.6)' },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },

    heroTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center', letterSpacing: -1 },
    heroDesc: { color: '#64748b', textAlign: 'center', fontWeight: '600', fontSize: 14, marginBottom: 30, lineHeight: 22 },
    
    primaryBtnShadow: { height: 56, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 },

    // Live Camera Overlays
    overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
    overlayTopBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    overlayDimmedFlex: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    overlayDimmedFlexBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', paddingBottom: 60 },
    cropRow: { flexDirection: 'row', height: CROP_BOX_HEIGHT },
    overlayDimmedSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    cropBox: { width: CROP_BOX_WIDTH, height: CROP_BOX_HEIGHT, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
    cropCornerTL: { position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: 'white', borderTopLeftRadius: 16 },
    cropCornerTR: { position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: 'white', borderTopRightRadius: 16 },
    cropCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: 'white', borderBottomLeftRadius: 16 },
    cropCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: 'white', borderBottomRightRadius: 16 },
    captureControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
    mainCaptureOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: 'black', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.5, shadowRadius: 12 },
    mainCaptureInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
    secondaryActionCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },

    // Preview (before solve)
    previewContainer: { alignItems: 'center' },
    previewCard: { width: '100%', borderRadius: 24, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: 'rgba(139, 92, 246, 0.3)' },
    previewImage: { width: '100%', height: 350 },
    loadingCard: { alignItems: 'center', paddingVertical: 40, width: '100%', borderRadius: 24, marginTop: 24 },
    spinnerBox: { marginBottom: 20 },
    loadingStage: { fontWeight: '800', fontSize: 17, letterSpacing: -0.5 },
    loadingSub: { color: '#64748b', fontWeight: '600', fontSize: 13, marginTop: 4 },
    fullBtnGroup: { width: '100%', gap: 12, marginTop: 24 },
    fullBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    fullSecondaryBtnGlass: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    retakeText: { fontWeight: '800', fontSize: 15 },

    // === Minimalistic Results (Gauth-inspired) ===

    // Card containers
    cardDark: { backgroundColor: '#1a1c24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardLight: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' },

    // Captured image bar
    capturedImageBar: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
    capturedThumb: { width: '100%', height: 160 },

    // Metadata bar (Credits Used + Accuracy)
    metaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
    metaItem: { flex: 1, alignItems: 'center', gap: 4 },
    metaLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    metaDivider: { width: 1, height: 32, backgroundColor: 'rgba(148,163,184,0.2)' },

    // Answer cards
    answerCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
    answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    qBadge: { backgroundColor: 'rgba(139,92,246,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    qBadgeText: { color: '#8B5CF6', fontWeight: '900', fontSize: 12 },
    topicLabel: { fontSize: 13, fontWeight: '600' },

    // Divider
    answerDivider: { height: 1, marginBottom: 16 },
    dividerDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
    dividerLight: { backgroundColor: '#f1f5f9' },

    // Answer label ( ≡ Answer )
    answerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    answerLabelIcon: { fontSize: 18, color: '#8B5CF6', fontWeight: '900' },
    answerLabelText: { fontSize: 16, fontWeight: '800' },

    // Steps
    stepsBlock: { marginBottom: 16 },
    stepItem: { flexDirection: 'row', marginBottom: 14 },
    stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
    stepCircleDark: { backgroundColor: 'rgba(139,92,246,0.15)' },
    stepCircleLight: { backgroundColor: 'rgba(139,92,246,0.08)' },
    stepCircleText: { color: '#8B5CF6', fontWeight: '800', fontSize: 11 },

    // Final answer box
    finalBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
    finalBoxDark: { backgroundColor: 'rgba(139,92,246,0.08)' },
    finalBoxLight: { backgroundColor: '#faf5ff' },
    finalLabel: { color: '#8B5CF6', fontWeight: '800', fontSize: 13, marginBottom: 6 },

    // Explanation
    explanationBlock: { marginBottom: 16, paddingTop: 4 },

    // Feedback
    feedbackRow: { alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.1)' },
    feedbackPrompt: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
    feedbackBtns: { flexDirection: 'row', gap: 12 },
    feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    feedbackBtnDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
    feedbackBtnLight: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    feedbackBtnIcon: { fontSize: 16 },
    feedbackBtnText: { fontSize: 13, fontWeight: '700' },
    feedbackDone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 12 },
    feedbackDoneIcon: { fontSize: 18 },
    feedbackDoneText: { fontSize: 13, fontWeight: '700' },

    // Follow-up bar
    followUpBar: { borderRadius: 16, padding: 18, marginTop: 4 },
    followUpText: { fontSize: 14, fontWeight: '600' },

    // Slim footer
    slimFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingBottom: 36, borderTopWidth: 1 },
    slimFooterDark: { backgroundColor: '#0f1017', borderTopColor: 'rgba(255,255,255,0.06)' },
    slimFooterLight: { backgroundColor: '#ffffff', borderTopColor: '#f1f5f9' },
    slimFooterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 10 },
    slimFooterBtnText: { fontSize: 14, fontWeight: '700' },
    slimFooterDivider: { width: 1, height: 20 },

    // Text utilities
    textSlate400d: { color: '#94a3b8' },
    textSlate500l: { color: '#64748b' },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate600: { color: '#475569' },
});
