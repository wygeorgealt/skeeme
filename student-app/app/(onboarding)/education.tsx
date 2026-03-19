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
            <View className="flex-row gap-1.5 mb-3">
                {[1,2,3,4].map(i => (
                    <View key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    What level are you{'\n'}studying at?
                </Text>
                <Text className={`text-[15px] font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    This helps us calibrate the AI to your level.
                </Text>
            </Animated.View>

            <View className="gap-3">
                {LEVELS.map((level, index) => (
                    <Animated.View key={level.key} entering={FadeInDown.duration(400).delay(200 + index * 80)}>
                        <TouchableOpacity
                            onPress={() => handleSelect(level.key)}
                            activeOpacity={0.8}
                            className={`flex-row items-center p-5 rounded-2xl border-2 ${
                                selected === level.key
                                    ? 'border-brand-primary bg-brand-primary/10'
                                    : isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                                selected === level.key ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                            }`}>
                                <Ionicons name={level.icon} size={22} color={selected === level.key ? '#fff' : isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-[16px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{level.label}</Text>
                                <Text className={`font-medium text-[13px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{level.desc}</Text>
                            </View>
                            {selected === level.key && (
                                <Animated.View entering={FadeIn.duration(200)}>
                                    <Ionicons name="checkmark-circle" size={24} color="#D2B48C" />
                                </Animated.View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}
