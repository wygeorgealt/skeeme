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
        }, 350);
    };

    return (
        <View className={`flex-1 px-8 pt-16 pb-8 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Step indicator */}
            <View className="flex-row items-center mb-8 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-semibold tracking-tight leading-[34px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How do you like things explained?
                </Text>
                <Text className={`text-[16px] font-normal leading-relaxed mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Choose your preferred explanation style. You can change this anytime.
                </Text>
            </Animated.View>

            <View className="gap-4">
                {STYLES.map((style, index) => {
                    const isSelected = selected === style.key;
                    return (
                        <Animated.View key={style.key} entering={FadeInDown.duration(400).delay(200 + index * 100)}>
                            <TouchableOpacity
                                onPress={() => handleSelect(style.key)}
                                activeOpacity={0.7}
                                className={`p-6 rounded-2xl border ${
                                    isSelected
                                        ? isDark ? 'border-white bg-[#1c1c1e]' : 'border-slate-900 bg-white shadow-sm'
                                        : isDark ? 'border-slate-800 bg-[#0f0f11]' : 'border-slate-200 bg-[#fafafa]'
                                }`}
                            >
                                <View className="flex-row items-center mb-3">
                                    <Ionicons 
                                        name={style.icon} 
                                        size={24} 
                                        color={isSelected ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8')} 
                                        className="mr-4"
                                    />
                                    <View className="flex-1">
                                        <Text className={`font-medium text-[17px] ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                                            {style.label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Animated.View entering={FadeIn.duration(200)}>
                                            <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#0f172a'} />
                                        </Animated.View>
                                    )}
                                </View>
                                <Text className={`font-normal text-[15px] leading-relaxed ml-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {style.desc}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}
