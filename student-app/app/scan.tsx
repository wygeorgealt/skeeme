import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image,
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
    const { colorScheme } = require('nativewind').useColorScheme();
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
            const response = await api.post('/scan/solve', { image: imageBase64 });
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
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen options={{
                title: 'Scan & Solve',
                headerShown: true,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: tintColor,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

                {/* ─── No Image Yet ─── */}
                {!imageUri && results.length === 0 && (
                    <View className="items-center mt-8">
                        {/* Viewfinder icon */}
                        <View className="w-48 h-48 border-4 border-dashed border-indigo-400 dark:border-indigo-500 rounded-3xl items-center justify-center mb-8">
                            <Ionicons name="scan-outline" size={72} color={isDark ? '#818cf8' : '#6366f1'} />
                            <Text className="text-indigo-500 dark:text-indigo-400 font-bold text-sm mt-3">Scan Exam Paper</Text>
                        </View>

                        <Text className="text-slate-900 dark:text-white font-bold text-xl text-center mb-2">
                            Scan multiple questions
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 px-4">
                            Snap a full page — and get instant solutions for every question detected (1a, 1b, etc).
                        </Text>

                        {/* Camera + Gallery buttons */}
                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity
                                onPress={() => pickImage(true)}
                                className="flex-1 bg-indigo-600 rounded-2xl py-4 items-center flex-row justify-center"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text className="text-white font-bold ml-2">Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl py-4 items-center flex-row justify-center"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="images" size={20} color={isDark ? '#e2e8f0' : '#334155'} />
                                <Text className="text-slate-700 dark:text-slate-200 font-bold ml-2">Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Credit cost notice */}
                        <View className="flex-row items-center mt-6 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl">
                            <Ionicons name="flash" size={16} color="#f59e0b" />
                            <View className="ml-3">
                                <Text className="text-slate-700 dark:text-slate-200 font-bold text-xs">Dynamic Credit Pricing</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">
                                    {BASE_SCAN_COST} credits base + {COST_PER_SOLUTION} per question
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ─── Image Preview (before solving) ─── */}
                {imageUri && results.length === 0 && (
                    <View className="items-center">
                        <View className="w-full rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 mb-5">
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: 300 }}
                                resizeMode="contain"
                                className="bg-slate-100 dark:bg-slate-900"
                            />
                        </View>

                        {loading ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#6366f1" />
                                <Text className="text-indigo-500 dark:text-indigo-400 font-bold mt-4 text-sm">Identifying & solving every question...</Text>
                                <Text className="text-slate-400 text-xs mt-1">This may take a few seconds</Text>
                            </View>
                        ) : (
                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    onPress={handleSolve}
                                    className="bg-indigo-600 rounded-2xl py-4 items-center flex-row justify-center"
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="sparkles" size={20} color="#fff" />
                                    <Text className="text-white font-bold ml-2">Solve Everything</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={resetScan}
                                    className="bg-slate-200 dark:bg-slate-800 rounded-2xl py-3.5 items-center"
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-slate-600 dark:text-slate-300 font-bold">Retake Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* ─── Solutions Display ─── */}
                {results.length > 0 && (
                    <View>
                        {/* Cost summary */}
                        <View className="flex-row items-center justify-between mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                            <View>
                                <Text className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">{results.length} Questions Solved</Text>
                                <Text className="text-indigo-500/70 dark:text-indigo-400/50 text-[10px]">Full page depth analysis</Text>
                            </View>
                            <View className="bg-indigo-600 px-3 py-1.5 rounded-xl">
                                <Text className="text-white font-bold text-xs">-{lastScanCost} credits</Text>
                            </View>
                        </View>

                        {/* Solutions List */}
                        {results.map((item, index) => (
                            <View key={index} className="mb-10">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-8 h-8 bg-indigo-600 rounded-full items-center justify-center mr-3">
                                        <Text className="text-white font-black text-xs">{index + 1}</Text>
                                    </View>
                                    <Text className="text-slate-900 dark:text-white font-bold text-lg">Solution {index + 1}</Text>
                                    {item.topic && (
                                        <View className="ml-auto bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                            <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px]">{item.topic}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Detected question */}
                                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-slate-100 dark:border-slate-700">
                                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Question</Text>
                                    <Text className="text-slate-800 dark:text-slate-200 text-[15px] leading-6 font-medium">{item.question}</Text>
                                </View>

                                {/* Steps */}
                                {item.steps && item.steps.length > 0 && (
                                    <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-slate-100 dark:border-slate-700">
                                        <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-4">Process</Text>
                                        {item.steps.map((step, i) => (
                                            <View key={i} className="flex-row mb-3">
                                                <View className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 mr-3" />
                                                <Text className="flex-1 text-slate-700 dark:text-slate-300 text-[14px] leading-6">{step}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Final Answer */}
                                <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
                                    <Text className="text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider mb-2">Result</Text>
                                    <Text className="text-emerald-900 dark:text-emerald-100 font-bold text-base leading-7">{item.solution}</Text>
                                </View>
                            </View>
                        ))}

                        <View className="h-px bg-slate-200 dark:bg-slate-800 w-full mb-8" />

                        {/* Scan Another */}
                        <TouchableOpacity
                            onPress={resetScan}
                            className="bg-indigo-600 rounded-2xl py-4 items-center flex-row justify-center"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="camera" size={20} color="#fff" />
                            <Text className="text-white font-bold ml-2">Scan Another Page</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
