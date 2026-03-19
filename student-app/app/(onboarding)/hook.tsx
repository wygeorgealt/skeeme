import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function HookScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    return (
        <View className={`flex-1 items-center justify-center px-8 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(600).delay(200)} className="items-center">
                {/* Logo / Brand Mark */}
                <View className="bg-brand-primary w-20 h-20 rounded-3xl items-center justify-center mb-8 shadow-lg shadow-brand-primary/30">
                    <Ionicons name="sparkles" size={36} color="#fff" />
                </View>

                <Text className={`text-[36px] font-black tracking-tight text-center leading-[42px] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    The AI that studies{'\n'}the way you think.
                </Text>

                <Text className={`text-[16px] font-medium text-center leading-relaxed mb-12 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generate quizzes, scan problems, and master any topic — powered by AI built for students.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(500)} className="w-full">
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/education')}
                    activeOpacity={0.9}
                    className="bg-brand-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/30 mb-6"
                >
                    <Text className="text-white font-black text-[17px]">Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')} className="items-center py-2">
                    <Text className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Already have an account? <Text className="text-brand-primary font-bold">Log in</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
