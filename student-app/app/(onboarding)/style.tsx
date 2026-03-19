import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: 'Break it down like I\'m new to this topic.',
        icon: 'sunny-outline' as const,
    },
    {
        key: 'detailed',
        label: 'Detailed & Academic',
        desc: 'Give me the full exam-level answer.',
        icon: 'compass-outline' as const,
    },
];

export default function StyleScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(4);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ learning_style: key });
        setTimeout(() => {
            router.push('/(onboarding)/demo');
        }, 400);
    };

    return (
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View className="flex-row gap-1.5 mb-3">
                {[1,2,3,4].map(i => (
                    <View key={i} className={`flex-1 h-1 rounded-full ${i <= 4 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How do you like{'\n'}things explained?
                </Text>
                <Text className={`text-[15px] font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Choose your preferred explanation style.
                </Text>
            </Animated.View>

            <View className="gap-4">
                {STYLES.map((style, index) => (
                    <Animated.View key={style.key} entering={FadeInDown.duration(400).delay(200 + index * 100)}>
                        <TouchableOpacity
                            onPress={() => handleSelect(style.key)}
                            activeOpacity={0.8}
                            className={`p-6 rounded-2xl border-2 ${
                                selected === style.key
                                    ? 'border-brand-primary bg-brand-primary/10'
                                    : isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                                    selected === style.key ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                                }`}>
                                    <Ionicons name={style.icon} size={24} color={selected === style.key ? '#fff' : isDark ? '#94a3b8' : '#64748b'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-black text-[17px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{style.label}</Text>
                                </View>
                                {selected === style.key && (
                                    <Animated.View entering={FadeIn.duration(200)}>
                                        <Ionicons name="checkmark-circle" size={24} color="#2EBD85" />
                                    </Animated.View>
                                )}
                            </View>
                            <Text className={`font-medium text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {style.desc}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(500)} className="mt-6">
                <Text className={`text-center text-[13px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    You can change this anytime in settings.
                </Text>
            </Animated.View>
        </View>
    );
}
