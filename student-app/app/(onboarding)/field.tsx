import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Flask, Tools, BookStack, Suitcase, Page, Plus, ViewGrid } from 'iconoir-react-native';

const FIELDS = [
    { key: 'sciences', label: 'Sciences', icon: Flask },
    { key: 'engineering', label: 'Engineering', icon: Tools },
    { key: 'humanities', label: 'Humanities', icon: BookStack },
    { key: 'business', label: 'Business', icon: Suitcase },
    { key: 'law', label: 'Law', icon: Page },
    { key: 'medicine', label: 'Medicine', icon: Plus },
    { key: 'other', label: 'Other', icon: ViewGrid },
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
        <View className={`flex-1 px-6 pt-16 pb-6 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Progress */}
            <View className="flex-row gap-1.5 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-10">
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Focus Area.
                </Text>
                <Text className={`text-[15px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    We'll tailor Skeeme's content to your specific discipline.
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
                                activeOpacity={0.9}
                                className={`items-center justify-center p-5 rounded-[24px] border-2 shadow-sm ${
                                    isSelected
                                        ? isDark ? 'border-white bg-slate-900' : 'border-slate-900 bg-white'
                                        : isDark ? 'border-slate-800 bg-transparent' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className={`w-12 h-12 rounded-[16px] items-center justify-center mb-3 ${
                                    isSelected 
                                        ? isDark ? 'bg-white' : 'bg-slate-900' 
                                        : isDark ? 'bg-slate-800' : 'bg-slate-50'
                                }`}>
                                    <field.icon 
                                        width={18} 
                                        height={18} 
                                        color={isSelected ? (isDark ? '#000' : '#fff') : (isDark ? '#64748b' : '#94a3b8')} 
                                    />
                                </View>
                                <Text className={`font-bold text-[14px] text-center ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
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
