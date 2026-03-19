import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const FIELDS = [
    { key: 'sciences', label: 'Sciences', icon: 'flask' as const },
    { key: 'engineering', label: 'Engineering', icon: 'construct' as const },
    { key: 'humanities', label: 'Humanities', icon: 'library' as const },
    { key: 'business', label: 'Business', icon: 'briefcase' as const },
    { key: 'law', label: 'Law', icon: 'document-text' as const },
    { key: 'medicine', label: 'Medicine', icon: 'medkit' as const },
    { key: 'other', label: 'Other', icon: 'apps' as const },
];

export default function FieldScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(3);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ field_of_study: key });
        setTimeout(() => {
            router.push('/(onboarding)/style');
        }, 350);
    };

    return (
        <View className={`flex-1 px-8 pt-16 pb-8 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Step indicator */}
            <View className="flex-row items-center mb-8 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-semibold tracking-tight leading-[34px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    What's your main subject area?
                </Text>
                <Text className={`text-[16px] font-normal leading-relaxed mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    We'll tailor examples and content to your discipline.
                </Text>
            </Animated.View>

            <View className="flex-row flex-wrap gap-3">
                {FIELDS.map((field, index) => {
                    const isSelected = selected === field.key;
                    return (
                        <Animated.View 
                            key={field.key} 
                            entering={FadeInDown.duration(400).delay(200 + index * 60)}
                            className={field.key === 'other' ? 'w-full' : 'w-[47.6%]'}
                        >
                            <TouchableOpacity
                                onPress={() => handleSelect(field.key)}
                                activeOpacity={0.7}
                                className={`items-center py-5 px-3 rounded-2xl border ${
                                    isSelected
                                        ? isDark ? 'border-white bg-[#1c1c1e]' : 'border-slate-900 bg-white shadow-sm'
                                        : isDark ? 'border-slate-800 bg-[#0f0f11]' : 'border-slate-200 bg-[#fafafa]'
                                }`}
                            >
                                <Ionicons 
                                    name={field.icon} 
                                    size={24} 
                                    color={isSelected ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8')} 
                                    className="mb-3"
                                />
                                <Text className={`font-medium text-[15px] ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                                    {field.label}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}
