import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Pre-generated sample result to show during onboarding (no auth needed)
const generateSampleResult = (title: string) => {
    // If it's the scanned question, simulate scanning a physics/thermodynamics question.
    if (title === 'Scanned Question') {
        return {
            explanation: 'This is a fundamental concept that connects energy, disorder, and the direction of natural processes.',
            steps: [
                'Entropy is a measure of the disorder or randomness in a system. The more ways particles can be arranged, the higher the entropy.',
                'The Second Law states that the total entropy of an isolated system can only increase over time. Natural processes tend to move toward maximum disorder.',
                'When you drop an ice cube into hot water, heat flows from the water to the ice (never the reverse spontaneously). This increases the overall entropy of the system.',
                'This law explains why perpetual motion machines are impossible and why time appears to flow in one direction.',
            ],
            summary: 'Entropy measures disorder. The second law guarantees that disorder always increases in isolated systems, defining the "arrow of time."',
        };
    }

    // For typed topics, generate a smart, generic response incorporating their topic!
    return {
        explanation: `Here is a step-by-step breakdown of the core concepts behind ${title}.`,
        steps: [
            `The most fundamental principle of ${title} relies on understanding its structural foundation and core mechanics.`,
            `When applying ${title} in real-world scenarios, it systematically follows a predictable set of rules and patterns.`,
            `A common misconception about ${title} is that it's overly complex, but breaking it down reveals its highly intuitive nature.`,
            `Once you master ${title}, you unlock the ability to apply these exact same principles to much more advanced topics in the field.`,
        ],
        summary: `The essence of ${title} involves recognizing these underlying patterns and applying its core principles systematically.`,
    };
};

export default function DemoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState<'choose' | 'generate'>('choose');
    const [displayTitle, setDisplayTitle] = useState('');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleScanAndSolve = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Camera Access', 'Camera permission is needed to scan questions.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
            // Immediately proceed to create account
            router.push('/(onboarding)/create-account');
        }
    };

    const handleGenerate = () => {
        if (!topic.trim()) return;
        // Immediately proceed to create account
        router.push('/(onboarding)/create-account');
    };

    // Generate mode — show text input
    if (mode === 'generate') {
        return (
            <View className={`flex-1 px-8 pt-16 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
                <StatusBar style={isDark ? 'light' : 'dark'} />

                {/* Back button */}
                <TouchableOpacity onPress={() => setMode('choose')} className="mb-6" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>

                <Animated.View entering={FadeInDown.duration(600)}>
                    <View className="mb-10">
                        <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Type any topic.
                        </Text>
                        <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Skeeme will break it down step by step using your personalized context.
                        </Text>
                    </View>

                    <View className={`rounded-[24px] border-2 px-6 mb-6 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white shadow-sm'}`}>
                        <TextInput
                            className="font-bold text-[18px] h-[72px]"
                            placeholder="e.g. Photosynthesis, Newton's 3rd law..."
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            value={topic}
                            onChangeText={setTopic}
                            style={{ color: isDark ? 'white' : 'black' }}
                            autoCapitalize="sentences"
                            autoFocus
                            returnKeyType="go"
                            onSubmitEditing={handleGenerate}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!topic.trim()}
                        activeOpacity={0.9}
                        className={`h-[64px] rounded-[24px] items-center justify-center flex-row shadow-lg ${topic.trim() ? 'bg-brand-primary shadow-brand-primary/25' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                    >
                        <Ionicons name="sparkles" size={20} color={topic.trim() ? '#fff' : isDark ? '#52525b' : '#a1a1aa'} />
                        <Text className={`font-bold text-[17px] ml-2 tracking-wide ${topic.trim() ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Generate Explanation
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    // Choose mode — pick between Scan & Solve or Generate
    return (
        <View className={`flex-1 px-8 pt-16 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-12">
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Experience it.
                </Text>
                <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Pick any topic or scan a question. See how Skeeme transforms your learning.
                </Text>
            </Animated.View>

            <View className="gap-4">
                {/* Scan & Solve */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <TouchableOpacity
                        onPress={handleScanAndSolve}
                        activeOpacity={0.9}
                        className={`p-8 rounded-[24px] border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-14 h-14 rounded-[18px] items-center justify-center mr-5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Ionicons name="camera" size={26} color={isDark ? '#fff' : '#0f172a'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-[18px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Scan & Solve</Text>
                                <Text className={`font-medium text-[14px] leading-relaxed mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Point your camera at any question</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={isDark ? '#3f3f46' : '#d1d5db'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View className="flex-row items-center py-4">
                    <View className={`flex-1 h-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <Text className={`px-6 font-bold text-[12px] uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>or</Text>
                    <View className={`flex-1 h-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </View>

                {/* Generate from Topic */}
                <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                    <TouchableOpacity
                        onPress={() => setMode('generate')}
                        activeOpacity={0.9}
                        className={`p-8 rounded-[24px] border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-14 h-14 rounded-[18px] items-center justify-center mr-5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Ionicons name="sparkles" size={26} color={isDark ? '#fff' : '#0f172a'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-[18px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Type a Topic</Text>
                                <Text className={`font-medium text-[14px] leading-relaxed mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generate an AI instant lesson</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={isDark ? '#3f3f46' : '#d1d5db'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
