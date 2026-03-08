import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ScanResult = {
    question: string;
    topic: string;
    solution: string;
    steps: string[];
};

const BASE_SCAN_COST = 2;
const COST_PER_SOLUTION = 4;

export default function ScanScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#010100' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#0f172a';

    const { user, updateUser } = useAuthStore();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ScanResult[]>([]);
    const [lastScanCost, setLastScanCost] = useState<number | null>(null);

    const pickImage = async (useCamera: boolean) => {
        // Reset state for new scan
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
            quality: 0.5,       // High quality for math recognition
            base64: true,
            allowsEditing: true, // Lets user crop to just the question
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };

    const handleSolve = async () => {
        if (!imageBase64) return;

        // Min credit check (Base + 1 solution)
        const minCost = BASE_SCAN_COST + COST_PER_SOLUTION;
        if (!user?.is_unlimited && (user?.credits ?? 0) < minCost) {
            Alert.alert('Insufficient Credits', `You need at least ${minCost} credits to start a scan.`);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('scan/solve', { image: imageBase64 });

            // H1: Clear base64 immediately after upload to free ~5-15MB memory
            setImageBase64(null);

            const data = response.data;

            setResults(data.results || []);
            setLastScanCost(data.cost);

            // Update local credit count from sync'd server total
            if (!user?.is_unlimited && data.credits_remaining !== undefined) {
                updateUser({ credits: data.credits_remaining });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to solve. Try a clearer photo.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
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
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: tintColor,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {/* ─── No Image Yet ─── */}
                {!imageUri && results.length === 0 && (
                    <View className="items-center mt-6">
                        {/* Viewfinder icon flat style */}
                        <View className="w-48 h-48 border-4 border-dashed border-slate-300 dark:border-slate-600 rounded-[32px] items-center justify-center mb-8 bg-slate-50 dark:bg-slate-800/50">
                            <Ionicons name="scan-outline" size={72} color={isDark ? '#e2e8f0' : '#0f172a'} />
                            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Document Scanner</Text>
                        </View>

                        <Text className="text-slate-900 dark:text-white font-black text-2xl text-center mb-2 tracking-tight">
                            Scan Question(s)
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium text-sm mb-10 px-4 leading-relaxed">
                            Snap a page or question. Skeeme will instantly detect and solve every sub-question (1a, 1b, etc).
                        </Text>

                        {/* Camera + Gallery buttons flat */}
                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity
                                onPress={() => pickImage(true)}
                                className="flex-1 bg-slate-900 dark:bg-white rounded-xl py-[18px] items-center justify-center shadow-sm"
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="camera" size={20} color={isDark ? '#0f172a' : 'white'} />
                                    <Text className="text-white dark:text-slate-900 font-black ml-2 text-base">Camera</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl py-[18px] items-center justify-center border border-slate-200 dark:border-slate-700"
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="images" size={20} color={isDark ? '#e2e8f0' : '#334155'} />
                                    <Text className="text-slate-700 dark:text-slate-200 font-bold ml-2 text-base">Gallery</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Credit cost notice */}
                        <View className="flex-row items-center mt-8 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700/50 w-full justify-center">
                            <Ionicons name="flash" size={16} color={isDark ? '#cbd5e1' : '#64748b'} />
                            <Text className="text-slate-600 dark:text-slate-400 font-bold text-xs ml-2">
                                {BASE_SCAN_COST} credits base + {COST_PER_SOLUTION} per question
                            </Text>
                        </View>
                    </View>
                )}

                {/* ─── Image Preview (before solving) ─── */}
                {imageUri && results.length === 0 && (
                    <View className="items-center">
                        <View className="w-full rounded-[24px] overflow-hidden border-2 border-slate-200 dark:border-slate-700 mb-6 bg-slate-100 dark:bg-slate-900">
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: 350 }}
                                resizeMode="cover"
                            />
                        </View>

                        {loading ? (
                            <View className="items-center py-10 w-full bg-slate-50 dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700">
                                <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#0f172a'} />
                                <Text className="text-slate-900 dark:text-white font-black mt-5 text-[17px] tracking-tight">Extracting Questions...</Text>
                                <Text className="text-slate-500 font-medium text-sm mt-1">Skeeme AI is reading the image</Text>
                            </View>
                        ) : (
                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    onPress={handleSolve}
                                    className="bg-[#2EBD85] rounded-xl py-4 items-center flex-row justify-center shadow-sm"
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="sparkles" size={20} color="#fff" />
                                    <Text className="text-white font-black ml-2 text-[17px]">Solve Everything</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={resetScan}
                                    className="bg-slate-100 dark:bg-slate-800 rounded-xl py-4 items-center border border-slate-200 dark:border-slate-700"
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-[15px]">Retake Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* ─── Solutions Display ─── */}
                {results.length > 0 && (
                    <View>
                        {/* Cost summary flat */}
                        <View className="flex-row items-center justify-between mb-8 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <View>
                                <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{results.length} Results</Text>
                                <Text className="text-slate-500 font-medium text-xs mt-0.5">Deep extraction complete</Text>
                            </View>
                            <View className="bg-slate-900 dark:bg-white px-3 py-1.5 rounded-full">
                                <Text className="text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest">-{lastScanCost} cr</Text>
                            </View>
                        </View>

                        {/* Solutions List */}
                        {results.map((item, index) => (
                            <View key={index} className="mb-10 w-full pt-4 border-t-2 border-slate-100 dark:border-slate-800">
                                <View className="flex-row items-center justify-between mb-5">
                                    <Text className="text-slate-400 dark:text-slate-500 font-black text-[13px] uppercase tracking-widest">Question {index + 1}</Text>
                                    {item.topic && (
                                        <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            <Text className="text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{item.topic}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Detected question */}
                                <Text className="text-slate-900 dark:text-white text-[19px] leading-relaxed font-bold mb-6 tracking-tight">
                                    {item.question}
                                </Text>

                                {/* Steps */}
                                {item.steps && item.steps.length > 0 && (
                                    <View className="mb-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                        <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-3">Solution Steps</Text>
                                        {item.steps.map((step, i) => (
                                            <View key={i} className="flex-row mb-3">
                                                <Text className="text-slate-400 dark:text-slate-500 font-black text-sm w-5">{i + 1}.</Text>
                                                <Text className="flex-1 text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed font-medium">{step}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Final Answer flat block */}
                                <View className="bg-slate-100 dark:bg-slate-800 rounded-[16px] p-5 border border-slate-200 dark:border-slate-700">
                                    <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-2">Final Result</Text>
                                    <Text className="text-slate-900 dark:text-white font-black text-lg leading-snug tracking-tight">{item.solution}</Text>
                                </View>
                            </View>
                        ))}

                        <View className="h-px bg-slate-200 dark:bg-slate-800 w-full mb-8" />

                        {/* Scan Another */}
                        <TouchableOpacity
                            onPress={resetScan}
                            className="bg-slate-900 dark:bg-white rounded-xl py-4 items-center flex-row justify-center shadow-sm"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="camera" size={20} color={isDark ? '#0f172a' : 'white'} />
                            <Text className="text-white dark:text-slate-900 font-black ml-2 text-[17px]">Scan Next Page</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
