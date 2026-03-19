import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: 'school-outline' as const, desc: 'Secondary / A-Levels' },
    { key: 'undergraduate', label: 'Undergraduate', icon: 'book-outline' as const, desc: 'Bachelor\'s degree' },
    { key: 'masters_phd', label: 'Masters / PhD', icon: 'flask-outline' as const, desc: 'Postgraduate research' },
    { key: 'professional', label: 'Professional Cert', icon: 'ribbon-outline' as const, desc: 'ICAN, ACCA, PMP, etc.' },
];

export default function EducationScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(2);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ education_level: key });
        setTimeout(() => {
            router.push('/(onboarding)/field');
        }, 400);
    };

    return (
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Progress */}
            <View className="flex-row gap-1.5 mb-10">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <View key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-12">
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Academic Level.
                </Text>
                <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    This helps us calibrate the AI to your specific learning stage.
                </Text>
            </Animated.View>

            <View className="gap-3">
                {LEVELS.map((level, index) => (
                    <Animated.View key={level.key} entering={FadeInDown.duration(400).delay(200 + index * 80)}>
                        <TouchableOpacity
                            onPress={() => handleSelect(level.key)}
                            activeOpacity={0.9}
                            className={`flex-row items-center p-6 rounded-[24px] border-2 shadow-sm ${
                                selected === level.key
                                    ? isDark ? 'border-white bg-slate-900' : 'border-slate-900 bg-white'
                                    : isDark ? 'border-slate-800 bg-transparent' : 'border-slate-100 bg-white'
                            }`}
                        >
                            <View className={`w-14 h-14 rounded-[18px] items-center justify-center mr-5 ${
                                selected === level.key 
                                    ? isDark ? 'bg-white' : 'bg-slate-900' 
                                    : isDark ? 'bg-slate-800' : 'bg-slate-50'
                            }`}>
                                <Ionicons 
                                    name={level.icon} 
                                    size={24} 
                                    color={selected === level.key ? (isDark ? '#000' : '#fff') : (isDark ? '#94a3b8' : '#64748b')} 
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-[17px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{level.label}</Text>
                                <Text className={`font-medium text-[14px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{level.desc}</Text>
                            </View>
                            {selected === level.key && (
                                <Animated.View entering={FadeIn.duration(200)}>
                                    <View className="w-8 h-8 rounded-full bg-brand-primary items-center justify-center shadow-lg shadow-brand-primary/20">
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    </View>
                                </Animated.View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}
