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
        }, 400);
    };

    return (
        <View className={`flex-1 px-6 pt-16 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View className="flex-row gap-1.5 mb-3">
                {[1,2,3,4].map(i => (
                    <View key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <Text className={`text-[28px] font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    What's your main{'\n'}subject area?
                </Text>
                <Text className={`text-[15px] font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    We'll tailor examples and content to your discipline.
                </Text>
            </Animated.View>

            <View className="flex-row flex-wrap gap-3">
                {FIELDS.map((field, index) => (
                    <Animated.View key={field.key} entering={FadeInDown.duration(400).delay(200 + index * 60)}
                        style={{ width: field.key === 'other' ? '100%' : '47%' }}
                    >
                        <TouchableOpacity
                            onPress={() => handleSelect(field.key)}
                            activeOpacity={0.8}
                            className={`items-center py-5 px-4 rounded-2xl border-2 ${
                                selected === field.key
                                    ? 'border-brand-primary bg-brand-primary/10'
                                    : isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <View className={`w-11 h-11 rounded-xl items-center justify-center mb-2 ${
                                selected === field.key ? 'bg-brand-primary' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                            }`}>
                                <Ionicons name={field.icon} size={20} color={selected === field.key ? '#fff' : isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text className={`font-bold text-[14px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{field.label}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}
