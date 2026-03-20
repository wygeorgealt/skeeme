import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import {
    NavArrowLeft, Menu, Scanning, Camera,
    Album, Sparks, ShareAndroid, Flash,
    Refresh, Page, FireFlame
} from 'iconoir-react-native';
import { BlurView } from 'expo-blur';
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
    const navigation = useNavigation() as any;

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
        <GlowBackground>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header with drawer toggle */}
            <View className={`flex-row items-center justify-between px-5 pt-14 pb-3`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-xl items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                >
                    <NavArrowLeft width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Scan & Solve</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-xl items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <CreditStatusBar activeAction="scan" refreshKey={creditRefreshKey} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {!imageUri && results.length === 0 && (
                    <View className="items-center mt-5">
                        <View className={`w-48 h-48 rounded-[32px] items-center justify-center mb-8 ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-slate-100'}`}>
                            <Scanning width={72} height={72} color="#8B5CF6" strokeWidth={1.5} />
                        </View>

                        <Text className={`font-semibold text-[22px] text-center mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Scan Question(s)</Text>
                        <Text className="text-slate-500 text-center font-medium text-[14px] mb-10 px-5 leading-relaxed">
                            Snap a page or question. Skeeme will instantly detect and solve every sub-question (1a, 1b, etc).
                        </Text>

                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity onPress={() => pickImage(true)} activeOpacity={0.8} className="flex-1 h-[48px] bg-brand-primary rounded-xl items-center justify-center flex-row shadow-sm">
                                <Camera width={18} height={18} color="white" />
                                <Text className="text-white font-bold ml-2 text-[15px]">Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage(false)} activeOpacity={0.8} className={`flex-1 h-[48px] rounded-xl items-center justify-center flex-row border shadow-sm ${isDark ? 'bg-white/10 border-transparent' : 'bg-white border-slate-100'}`}>
                                <Album width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                                <Text className={`font-bold ml-2 text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        <View className={`mt-8 px-5 py-4 rounded-xl border flex-row items-center w-full justify-center ${isDark ? 'bg-[#13151B]/50 border-transparent' : 'bg-white border-slate-100'}`}>
                            <Flash width={16} height={16} color="#8B5CF6" />
                            <Text className="text-slate-500 font-semibold text-[12px] ml-2">
                                <Text className="text-[#8B5CF6]">{BASE_SCAN_COST} cr</Text> base + <Text className="text-[#8B5CF6]">{COST_PER_SOLUTION} cr</Text> per question
                            </Text>
                        </View>
                    </View>
                )}

                {imageUri && results.length === 0 && (
                    <View className="items-center">
                        <View className={`w-full rounded-[24px] overflow-hidden border mb-6 ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-200'}`}>
                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 350 }} contentFit="cover" />
                        </View>

                        {loading ? (
                            <View className={`items-center py-8 w-full rounded-[24px] border ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100'}`}>
                                <ActivityIndicator size="large" color="#8B5CF6" />
                                <Text className={`font-bold mt-5 text-[15px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{loadingStage || 'Processing...'}</Text>
                                <Text className="text-slate-500 font-medium text-sm mt-1">Skeeme AI is working hard</Text>
                            </View>
                        ) : (
                            <View className="w-full gap-3">
                                <TouchableOpacity onPress={handleSolve} activeOpacity={0.8} className="h-[48px] bg-brand-primary rounded-xl items-center flex-row justify-center shadow-sm">
                                    <Sparks width={18} height={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2 text-[15px]">Solve Everything</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={resetScan} activeOpacity={0.8} className={`h-[48px] rounded-xl items-center justify-center border ${isDark ? 'bg-white/10 border-transparent' : 'bg-slate-100 border-slate-200'}`}>
                                    <Text className={`font-bold text-[14px] ${isDark ? 'text-white' : 'text-slate-600'}`}>Retake Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {results.length > 0 && (
                    <View>
                        <View className={`flex-row items-center justify-between mb-8 p-4 rounded-2xl border ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <View>
                                <Text className={`font-bold text-[16px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{results.length} Extracted Questions</Text>
                                <Text className="text-slate-500 font-medium text-[12px] mt-0.5">Deep extraction complete</Text>
                            </View>
                            <View className="bg-brand-primary px-3 py-1.5 rounded-lg">
                                <Text className="text-white font-bold text-[11px] uppercase tracking-wider">-{lastScanCost} cr</Text>
                            </View>
                        </View>

                        {results.map((item, index) => (
                            <View key={index} className={`mb-8 w-full p-5 rounded-[24px] border ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <View className="flex-row items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-transparent">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Question {index + 1}</Text>
                                        <View className={`px-2 py-0.5 rounded-lg border ${item.type === 'theory' ? 'border-blue-500/20 bg-blue-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                                            <Text className={`font-bold text-[9px] uppercase tracking-widest ${item.type === 'theory' ? 'text-blue-500' : 'text-emerald-500'}`}>{item.type === 'theory' ? 'Theory' : 'Calc'}</Text>
                                        </View>
                                    </View>
                                    {item.topic && (
                                        <View className={`px-3 py-1 rounded-full border ${isDark ? 'bg-transparent border-transparent' : 'bg-slate-50 border-slate-200'}`}>
                                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{item.topic}</Text>
                                        </View>
                                    )}
                                </View>
                                <MathText content={item.question} color={isDark ? 'white' : '#121212'} fontSize={18} containerStyle={{ marginBottom: 24 }} />

                                {(item.type !== 'theory') && (
                                    <View className="gap-6">
                                        {item.steps && item.steps.length > 0 && (
                                            <View className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-transparent' : 'bg-slate-50 border-slate-100'}`}>
                                                <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-4">Solution Steps</Text>
                                                {item.steps.map((step, i) => (
                                                    <View key={i} className="flex-row mb-3">
                                                        <View className="w-6 h-6 rounded-full bg-emerald-500/10 items-center justify-center mr-3 mt-0.5">
                                                            <Text className="text-emerald-500 font-bold text-[11px]">{i + 1}</Text>
                                                        </View>
                                                        <MathText content={step} color={isDark ? '#cbd5e1' : '#475569'} fontSize={15} containerStyle={{ flex: 1 }} />
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                        <View className="bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/20">
                                            <Text className="text-brand-primary font-bold text-[11px] uppercase tracking-widest mb-2">Final Answer</Text>
                                            <MathText content={item.solution} color={isDark ? 'white' : '#121212'} fontSize={18} />
                                        </View>
                                    </View>
                                )}

                                {item.type === 'theory' && (
                                    <View className="gap-6">
                                        {item.explanation ? (
                                            <View className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-transparent' : 'bg-slate-50 border-slate-100'}`}>
                                                <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-3">Explanation</Text>
                                                <MathText content={item.explanation} color={isDark ? '#cbd5e1' : '#475569'} fontSize={15} containerStyle={{ flex: 1 }} />
                                            </View>
                                        ) : null}
                                        {item.summary ? (
                                            <View className="bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/20">
                                                <Text className="text-brand-primary font-bold text-[11px] uppercase tracking-widest mb-2">Key Takeaway</Text>
                                                <Text className={`font-semibold text-[15px] leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.summary}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
                <View className="h-6" />
            </ScrollView>

            {results.length > 0 && (
                <BlurView
                    intensity={isDark ? 40 : 80}
                    tint={isDark ? "dark" : "light"}
                    className={`absolute bottom-0 left-0 right-0 p-5 pb-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                >
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={() => {
                                const topics = results.map(r => r.topic).filter(Boolean);
                                const uniqueTopics = [...new Set(topics)];
                                const combinedTopic = uniqueTopics.join(', ') || 'General';
                                router.push({ pathname: '/generate', params: { topic: combinedTopic } });
                            }}
                            activeOpacity={0.8}
                            className="h-[48px] bg-brand-primary rounded-xl items-center flex-row justify-center shadow-sm"
                        >
                            <Sparks width={18} height={18} color="white" />
                            <Text className="text-white font-bold text-[15px] ml-2">Practice Similar Quiz</Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleExport}
                                disabled={loading}
                                activeOpacity={0.8}
                                className={`h-[48px] rounded-xl flex-1 items-center flex-row justify-center border shadow-sm ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#8B5CF6" />
                                ) : (
                                    <>
                                        <ShareAndroid width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                                        <Text className={`font-bold text-[15px] ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Share</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={resetScan}
                                activeOpacity={0.8}
                                className={`h-[48px] rounded-xl flex-1 items-center flex-row justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                            >
                                <Camera width={18} height={18} color={isDark ? '#fff' : '#0f172a'} />
                                <Text className={`font-bold text-[15px] ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Next Scan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            )}
            <OutOfCreditsModal
                visible={showOutOfCredits}
                onDismiss={() => setShowOutOfCredits(false)}
                featureAttempted="scan"
            />

        </GlowBackground>
    );
}
