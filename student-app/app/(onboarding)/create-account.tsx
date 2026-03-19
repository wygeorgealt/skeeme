import { View, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function CreateAccountScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    return (
        <View className={`flex-1 px-6 pt-16 justify-center ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-10">
                <View className="bg-brand-primary/10 w-16 h-16 rounded-2xl items-center justify-center mb-6">
                    <Ionicons name="bookmark" size={28} color="#2EBD85" />
                </View>
                <Text className={`text-[30px] font-black tracking-tight leading-[36px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Save your results{'\n'}and build your streak.
                </Text>
                <Text className={`text-[15px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Your explanation is ready. Create an account to keep it.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)} className="gap-3">
                {/* Google Sign In */}
                <TouchableOpacity
                    onPress={() => {/* TODO: Wire Google sign-in */}}
                    activeOpacity={0.8}
                    className={`h-14 rounded-2xl flex-row items-center justify-center border-2 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}
                >
                    <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text className={`font-bold text-[15px] ml-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Sign In — iOS only */}
                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        onPress={() => {/* TODO: Wire Apple sign-in */}}
                        activeOpacity={0.8}
                        className={`h-14 rounded-2xl flex-row items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}
                    >
                        <Ionicons name="logo-apple" size={22} color={isDark ? '#000' : '#fff'} />
                        <Text className={`font-bold text-[15px] ml-3 ${isDark ? 'text-black' : 'text-white'}`}>Continue with Apple</Text>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                <View className="flex-row items-center my-2">
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <Text className={`px-4 font-medium text-[13px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>or</Text>
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </View>

                {/* Email Signup */}
                <TouchableOpacity
                    onPress={() => router.push('/signup?from=onboarding')}
                    activeOpacity={0.9}
                    className="bg-brand-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-brand-primary/30"
                >
                    <Text className="text-white font-black text-[15px]">Use email instead</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
