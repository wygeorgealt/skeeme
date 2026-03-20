import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SunLight, Compass, Check } from 'iconoir-react-native';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: 'Break it down like I\'m new to this topic.',
        icon: SunLight,
    },
    {
        key: 'detailed',
        label: 'Detailed & Academic',
        desc: 'Give me the full exam-level answer.',
        icon: Compass,
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
        <View className={`flex-1 px-6 pt-16 pb-6 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Progress */}
            <View className="flex-row gap-1.5 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-10">
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Learning Style.
                </Text>
                <Text className={`text-[15px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    How do you like things explained? You can change this anytime.
                </Text>
            </Animated.View>

            <View className="gap-4">
                {STYLES.map((style, index) => {
                    const isSelected = selected === style.key;
                    return (
                        <Animated.View key={style.key} entering={FadeInDown.duration(400).delay(200 + index * 100)}>
                            <TouchableOpacity
                                onPress={() => handleSelect(style.key)}
                                activeOpacity={0.9}
                                className={`p-6 rounded-[24px] border-2 shadow-sm ${
                                    isSelected
                                        ? isDark ? 'border-white bg-slate-900' : 'border-slate-900 bg-white'
                                        : isDark ? 'border-slate-800 bg-transparent' : 'border-slate-100 bg-white'
                                }`}
                            >
                                <View className="flex-row items-center mb-4">
                                    <View className={`w-14 h-14 rounded-[18px] items-center justify-center mr-5 ${
                                        isSelected 
                                            ? isDark ? 'bg-white' : 'bg-slate-900' 
                                            : isDark ? 'bg-slate-800' : 'bg-slate-50'
                                    }`}>
                                        <style.icon 
                                            width={18} 
                                            height={18} 
                                            color={isSelected ? (isDark ? '#000' : '#fff') : (isDark ? '#64748b' : '#94a3b8')} 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-bold text-[16px] ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                                            {style.label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Animated.View entering={FadeIn.duration(200)}>
                                            <View className="w-8 h-8 rounded-full bg-brand-primary items-center justify-center shadow-lg shadow-brand-primary/20">
                                                <Check width={18} height={18} color="#fff" />
                                            </View>
                                        </Animated.View>
                                    )}
                                </View>
                                <Text className={`font-medium text-[14px] leading-relaxed ml-[76px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
