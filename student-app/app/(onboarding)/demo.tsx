import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Pre-generated sample questions mapped to each field
const SAMPLE_QUESTIONS: Record<string, { question: string; topic: string }> = {
    sciences: { question: 'Explain the relationship between entropy and the second law of thermodynamics.', topic: 'Thermodynamics' },
    engineering: { question: 'What is the difference between stress and strain in materials science?', topic: 'Materials Engineering' },
    humanities: { question: 'Analyse the impact of the Renaissance on modern Western thought.', topic: 'History of Ideas' },
    business: { question: 'Explain the concept of opportunity cost with a real-world example.', topic: 'Microeconomics' },
    law: { question: 'What is the doctrine of judicial precedent and how does it work?', topic: 'Legal Systems' },
    medicine: { question: 'Describe the Frank-Starling mechanism of the heart.', topic: 'Cardiovascular Physiology' },
    other: { question: 'How does compound interest differ from simple interest?', topic: 'Mathematics' },
};

// Pre-generated sample result to show during onboarding (no auth needed)
const SAMPLE_RESULT = {
    explanation: 'This is a fundamental concept that connects energy, disorder, and the direction of natural processes.',
    steps: [
        '**Definition:** Entropy is a measure of the disorder or randomness in a system. The more ways particles can be arranged, the higher the entropy.',
        '**The Second Law:** States that the total entropy of an isolated system can only increase over time. Natural processes tend to move toward maximum disorder.',
        '**Real-World Example:** When you drop an ice cube into hot water, heat flows from the water to the ice (never the reverse spontaneously). This increases the overall entropy of the system.',
        '**Key Implication:** This law explains why perpetual motion machines are impossible and why time appears to flow in one direction.',
    ],
    summary: 'Entropy measures disorder. The second law guarantees that disorder always increases in isolated systems, defining the "arrow of time."',
};

export default function DemoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, onboardingData } = useAuthStore();
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const field = onboardingData?.field_of_study || 'sciences';
    const sample = SAMPLE_QUESTIONS[field] || SAMPLE_QUESTIONS.sciences;

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleTryQuestion = () => {
        setIsLoading(true);
        // Simulate AI processing with a realistic delay
        setTimeout(() => {
            setIsLoading(false);
            setShowResult(true);
        }, 2200);
    };

    if (isLoading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <Animated.View entering={FadeIn.duration(400)} className="items-center px-8">
                    <View className="bg-brand-primary/10 w-20 h-20 rounded-full items-center justify-center mb-6">
                        <ActivityIndicator size="large" color="#2EBD85" />
                    </View>
                    <Text className={`text-[22px] font-black tracking-tight text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Skeeme is thinking...
                    </Text>
                    <Text className={`text-[15px] font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Breaking down your question step by step.
                    </Text>
                </Animated.View>
            </View>
        );
    }

    if (showResult) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <ScrollView className="flex-1 px-6 pt-16" showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(500)}>
                        <View className="flex-row items-center mb-4">
                            <View className="bg-brand-primary w-8 h-8 rounded-lg items-center justify-center mr-3">
                                <Ionicons name="sparkles" size={16} color="#fff" />
                            </View>
                            <Text className={`font-black text-[13px] uppercase tracking-widest ${isDark ? 'text-brand-primary' : 'text-brand-primary'}`}>
                                AI Explanation
                            </Text>
                        </View>

                        <Text className={`text-[17px] font-bold mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {sample.question}
                        </Text>

                        <Text className={`text-[15px] font-medium leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {SAMPLE_RESULT.explanation}
                        </Text>

                        {SAMPLE_RESULT.steps.map((step, i) => (
                            <Animated.View key={i} entering={FadeInDown.duration(400).delay(200 + i * 100)}>
                                <View className={`flex-row mb-4 p-4 rounded-2xl ${isDark ? 'bg-slate-900/80' : 'bg-slate-50'}`}>
                                    <View className="bg-brand-primary w-7 h-7 rounded-lg items-center justify-center mr-3 mt-0.5">
                                        <Text className="text-white font-black text-[12px]">{i + 1}</Text>
                                    </View>
                                    <Text className={`flex-1 text-[14px] font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {step}
                                    </Text>
                                </View>
                            </Animated.View>
                        ))}

                        <View className={`p-4 rounded-2xl border-2 border-brand-primary/30 bg-brand-primary/5 mb-8`}>
                            <Text className="text-brand-primary font-black text-[12px] uppercase tracking-widest mb-2">Key Takeaway</Text>
                            <Text className={`text-[14px] font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {SAMPLE_RESULT.summary}
                            </Text>
                        </View>
                    </Animated.View>

                    <View className="pb-8">
                        <TouchableOpacity
                            onPress={() => router.push('/(onboarding)/create-account')}
                            activeOpacity={0.9}
                            className="bg-brand-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/30 flex-row"
                        >
                            <Text className="text-white font-black text-[16px] mr-2">Save this and keep studying</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Try it right now.
                </Text>
                <Text className={`text-[15px] font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    See how Skeeme breaks down a real question for you.
                </Text>
            </Animated.View>

            <View className="gap-4">
                {/* Sample Question Option */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <TouchableOpacity
                        onPress={handleTryQuestion}
                        activeOpacity={0.8}
                        className={`p-6 rounded-2xl border-2 ${isDark ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-brand-primary/30 bg-brand-primary/5'}`}
                    >
                        <View className="flex-row items-center mb-3">
                            <View className="bg-brand-primary w-11 h-11 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="document-text" size={22} color="#fff" />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-[16px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Try a sample question</Text>
                                <Text className="text-brand-primary font-bold text-[12px] mt-0.5">{sample.topic}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#2EBD85" />
                        </View>
                        <Text className={`text-[14px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            "{sample.question}"
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Camera Scan Option */}
                <Animated.View entering={FadeInDown.duration(400).delay(350)}>
                    <TouchableOpacity
                        onPress={handleTryQuestion}
                        activeOpacity={0.8}
                        className={`p-6 rounded-2xl border-2 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <Ionicons name="camera" size={22} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-[16px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Scan with camera</Text>
                                <Text className={`font-medium text-[12px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Point at any question or problem</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={isDark ? '#475569' : '#94a3b8'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
