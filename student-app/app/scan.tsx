import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MathText } from '@/components/ui/MathText';

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { generateScanHTML } from '@/lib/pdfGenerator';
import CreditStatusBar from '@/components/CreditStatusBar';
import OutOfCreditsModal from '@/components/OutOfCreditsModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ScanResult = {
    question: string;
    topic: string;
    type: 'calculation' | 'theory';
    solution: string;
    steps: string[];
    explanation: string;
    summary: string;
};

const BASE_SCAN_COST = 2;
const COST_PER_SOLUTION = 4;

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';
    const router = useRouter();

    const { user, updateUser } = useAuthStore();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [results, setResults] = useState<ScanResult[]>([]);
    const [lastScanCost, setLastScanCost] = useState<number | null>(null);
    const [showOutOfCredits, setShowOutOfCredits] = useState(false);
    const [creditRefreshKey, setCreditRefreshKey] = useState(0);

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
            const response = await api.post('scan/solve', { image: imageBase64 });
            setImageBase64(null);
            const data = response.data;
            setResults(data.results || []);
            setLastScanCost(data.cost);
            if (!user?.is_unlimited && data.remaining_credits !== undefined) {
                updateUser({ credits: data.remaining_credits });
                setCreditRefreshKey(k => k + 1);
            }
        } catch (err: any) {
            let msg = 'Failed to solve. Try a clearer photo.';
            const data = err?.response?.data;
            if (data?.message) msg = data.message;
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
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <Stack.Screen options={{
                title: 'Scan & Solve',
                headerShown: true,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: { 
                    backgroundColor: bgColor,
                },
                headerTintColor: tintColor,
            }} />

            <CreditStatusBar activeAction="scan" refreshKey={creditRefreshKey} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {!imageUri && results.length === 0 && (
                    <View className="items-center mt-6">
                        <View className="w-48 h-48 border-4 border-dashed border-brand-primary/30 dark:border-brand-primary/50 rounded-[32px] items-center justify-center mb-8 bg-brand-primary/5 dark:bg-brand-primary/10">
                            <Ionicons name="scan-outline" size={72} color="#2EBD85" />
                            <Text className="text-brand-primary/60 dark:text-brand-primary/80 font-bold text-xs mt-3 uppercase tracking-widest">Document Scanner</Text>
                        </View>

                        <Text className="text-slate-900 dark:text-white font-black text-2xl text-center mb-2 tracking-tight">Scan Question(s)</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium text-sm mb-10 px-4 leading-relaxed">
                            Snap a page or question. Skeeme will instantly detect and solve every sub-question (1a, 1b, etc).
                        </Text>

                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity onPress={() => pickImage(true)} className="flex-1 bg-brand-primary rounded-xl py-[18px] items-center justify-center shadow-lg shadow-brand-primary/20" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Scan from Camera">
                                <View className="flex-row items-center">
                                    <Ionicons name="camera" size={20} color="white" />
                                    <Text className="text-white font-black ml-2 text-base">Camera</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl py-[18px] items-center justify-center border border-slate-200 dark:border-slate-700" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Choose from Gallery">
                                <View className="flex-row items-center">
                                    <Ionicons name="images" size={20} color={isDark ? '#e2e8f0' : '#334155'} />
                                    <Text className="text-slate-700 dark:text-slate-200 font-bold ml-2 text-base">Gallery</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center mt-8 bg-brand-primary/5 dark:bg-brand-primary/10 px-5 py-4 rounded-xl border border-brand-primary/20 dark:border-brand-primary/30 w-full justify-center">
                            <Ionicons name="flash" size={16} color="#2EBD85" />
                            <Text className="text-brand-primary font-bold text-xs ml-2">{BASE_SCAN_COST} credits base + {COST_PER_SOLUTION} per question</Text>
                        </View>
                    </View>
                )}

                {imageUri && results.length === 0 && (
                    <View className="items-center">
                        <View className="w-full rounded-[24px] overflow-hidden border-2 border-slate-200 dark:border-slate-700 mb-6 bg-slate-100 dark:bg-slate-900">
                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 350 }} contentFit="cover" />
                        </View>

                        {loading ? (
                            <View className="items-center py-10 w-full bg-brand-primary/5 rounded-[20px] border border-brand-primary/20">
                                <ActivityIndicator size="large" color="#2EBD85" />
                                <Text className="text-brand-primary font-black mt-5 text-[17px] tracking-tight">{loadingStage || 'Processing...'}</Text>
                                <Text className="text-brand-primary/60 font-medium text-sm mt-1">Skeeme AI is working hard</Text>
                            </View>
                        ) : (
                            <View className="w-full gap-3">
                                <TouchableOpacity onPress={handleSolve} className="bg-[#2EBD85] rounded-xl py-4 items-center flex-row justify-center shadow-sm" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Solve Everything">
                                    <Ionicons name="sparkles" size={20} color="#fff" />
                                    <Text className="text-white font-black ml-2 text-[17px]">Solve Everything</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={resetScan} className="bg-slate-100 dark:bg-slate-800 rounded-xl py-4 items-center border border-slate-200 dark:border-slate-700" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Retake Photo">
                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-[15px]">Retake Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {results.length > 0 && (
                    <View>
                        <View className="flex-row items-center justify-between mb-8 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <View>
                                <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{results.length} Results</Text>
                                <Text className="text-slate-500 font-medium text-xs mt-0.5">Deep extraction complete</Text>
                            </View>
                            <View className="bg-slate-900 dark:bg-white px-3 py-1.5 rounded-full">
                                <Text className="text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest">-{lastScanCost} cr</Text>
                            </View>
                        </View>

                        {results.map((item, index) => (
                            <View key={index} className="mb-10 w-full pt-4 border-t-2 border-slate-100 dark:border-slate-800">
                                <View className="flex-row items-center justify-between mb-5">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-slate-400 dark:text-slate-500 font-black text-[13px] uppercase tracking-widest">Question {index + 1}</Text>
                                        <View className={`px-2 py-0.5 rounded-full ${item.type === 'theory' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                            <Text className={`font-black text-[9px] uppercase tracking-widest ${item.type === 'theory' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{item.type === 'theory' ? 'Theory' : 'Calc'}</Text>
                                        </View>
                                    </View>
                                    {item.topic && (
                                        <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            <Text className="text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{item.topic}</Text>
                                        </View>
                                    )}
                                </View>
                                <MathText content={item.question} color={isDark ? 'white' : '#121212'} fontSize={19} containerStyle={{ marginBottom: 24 }} />

                                {/* ── Calculation: Step-by-step + Final Answer ── */}
                                {(item.type !== 'theory') && (
                                    <>
                                        {item.steps && item.steps.length > 0 && (
                                            <View className="mb-6 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                                <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-3">Solution Steps</Text>
                                                {item.steps.map((step, i) => (
                                                    <View key={i} className="flex-row mb-3">
                                                        <Text className="text-emerald-500 dark:text-emerald-400 font-black text-sm w-5">{i + 1}.</Text>
                                                        <MathText content={step} color={isDark ? '#cbd5e1' : '#334155'} fontSize={15} containerStyle={{ flex: 1 }} />
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                        <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[16px] p-5 border border-emerald-200 dark:border-emerald-800">
                                            <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-widest mb-2">Final Answer</Text>
                                            <MathText content={item.solution} color={isDark ? 'white' : '#121212'} fontSize={18} />
                                        </View>
                                    </>
                                )}

                                {/* ── Theory: Structured Explanation + Summary ── */}
                                {item.type === 'theory' && (
                                    <>
                                        {item.explanation ? (
                                            <View className="mb-6 pl-4 border-l-2 border-blue-300 dark:border-blue-700">
                                                <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-3">Explanation</Text>
                                                <MathText content={item.explanation} color={isDark ? '#cbd5e1' : '#334155'} fontSize={15} containerStyle={{ flex: 1 }} />
                                            </View>
                                        ) : null}
                                        {item.summary ? (
                                            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-[16px] p-5 border border-blue-200 dark:border-blue-800">
                                                <Text className="text-blue-600 dark:text-blue-400 font-bold text-[11px] uppercase tracking-widest mb-2">Key Takeaway</Text>
                                                <Text className="text-slate-900 dark:text-white font-bold text-[16px] leading-relaxed">{item.summary}</Text>
                                            </View>
                                        ) : null}
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                )}
                <View className="h-6" />
            </ScrollView>

            {results.length > 0 && (
                <BlurView 
                    intensity={80} 
                    tint={isDark ? "dark" : "light"} 
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom || 24, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                >
                    <View className="gap-3">
                        {/* Practice Similar Questions */}
                        <TouchableOpacity
                            onPress={() => {
                                const topics = results.map(r => r.topic).filter(Boolean);
                                const uniqueTopics = [...new Set(topics)];
                                const combinedTopic = uniqueTopics.join(', ') || 'General';
                                router.push({ pathname: '/generate', params: { topic: combinedTopic } });
                            }}
                            className="bg-brand-primary rounded-2xl py-4 items-center flex-row justify-center shadow-lg shadow-brand-primary/20"
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Practice Similar Questions"
                        >
                            <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-black text-[17px]">Practice Similar Questions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleExport} disabled={loading} className="bg-slate-900 dark:bg-white rounded-2xl py-4 items-center flex-row justify-center shadow-sm" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Save as PDF">
                            {loading ? <ActivityIndicator size="small" color={isDark ? '#121212' : 'white'} /> : <>
                                <Ionicons name="download-outline" size={20} color={isDark ? '#121212' : 'white'} style={{ marginRight: 8 }} />
                                <Text className="text-white dark:text-slate-900 font-black text-[17px]">Save as PDF</Text>
                            </>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={resetScan} className="bg-slate-100 dark:bg-slate-800 rounded-2xl py-4 items-center flex-row justify-center border border-slate-200 dark:border-slate-700" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Scan Next Page">
                            <Ionicons name="camera" size={20} color={isDark ? '#e2e8f0' : '#475569'} />
                            <Text className="text-slate-700 dark:text-slate-300 font-bold ml-2 text-[17px]">Scan Next Page</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            )}
            <OutOfCreditsModal
                visible={showOutOfCredits}
                onDismiss={() => setShowOutOfCredits(false)}
                featureAttempted="scan"
            />

        </View>
    );
}
