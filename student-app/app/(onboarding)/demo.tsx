import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Pre-generated sample result to show during onboarding (no auth needed)
const SAMPLE_RESULT = {
    explanation: 'This is a fundamental concept that connects energy, disorder, and the direction of natural processes.',
    steps: [
        'Entropy is a measure of the disorder or randomness in a system. The more ways particles can be arranged, the higher the entropy.',
        'The Second Law states that the total entropy of an isolated system can only increase over time. Natural processes tend to move toward maximum disorder.',
        'When you drop an ice cube into hot water, heat flows from the water to the ice (never the reverse spontaneously). This increases the overall entropy of the system.',
        'This law explains why perpetual motion machines are impossible and why time appears to flow in one direction.',
    ],
    summary: 'Entropy measures disorder. The second law guarantees that disorder always increases in isolated systems, defining the "arrow of time."',
};

export default function DemoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleGenerate = () => {
        if (!topic.trim()) return;
        setIsLoading(true);
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
                        <Text className={`text-[17px] font-bold mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {topic}
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
                    Type any topic and see how Skeeme breaks it down for you.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <View className={`p-5 rounded-2xl border-2 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                    <Text className={`font-black text-[15px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        What do you want to learn about?
                    </Text>
                    <View className={`rounded-xl border px-4 mb-3 ${isDark ? 'border-slate-700 bg-[#1c1c1e]' : 'border-slate-300 bg-white'}`}>
                        <TextInput
                            className="font-medium text-[15px] h-[48px]"
                            placeholder="e.g. Photosynthesis, Newton's 3rd law..."
                            placeholderTextColor={isDark ? '#555' : '#94a3b8'}
                            value={topic}
                            onChangeText={setTopic}
                            style={{ color: isDark ? 'white' : 'black' }}
                            autoCapitalize="sentences"
                            returnKeyType="go"
                            onSubmitEditing={handleGenerate}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!topic.trim()}
                        activeOpacity={0.8}
                        className={`h-12 rounded-xl items-center justify-center flex-row ${topic.trim() ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                    >
                        <Ionicons name="sparkles" size={18} color={topic.trim() ? '#fff' : isDark ? '#555' : '#94a3b8'} />
                        <Text className={`font-bold text-[14px] ml-2 ${topic.trim() ? 'text-white' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            Generate
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}
