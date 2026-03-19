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
        <View className={`flex-1 px-8 pt-16 justify-center ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-12">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-6 shadow-sm ${isDark ? 'bg-[#1c1c1e] border border-slate-800' : 'bg-white border border-slate-100'}`}>
                    <Ionicons name="bookmark-outline" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </View>
                <Text className={`text-[28px] font-semibold tracking-tight leading-[34px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Save your results and build your streak.
                </Text>
                <Text className={`text-[16px] font-normal leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Your explanation is ready. Create an account to keep it.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)} className="gap-3">
                {/* Google Sign In */}
                <TouchableOpacity
                    onPress={() => {/* TODO: Wire Google sign-in */}}
                    activeOpacity={0.8}
                    className={`h-[56px] rounded-2xl flex-row items-center justify-center border shadow-sm ${isDark ? 'border-slate-800 bg-[#1c1c1e]' : 'border-slate-200 bg-white'}`}
                >
                    <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text className={`font-medium text-[16px] ml-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Sign In — iOS only */}
                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        onPress={() => {/* TODO: Wire Apple sign-in */}}
                        activeOpacity={0.8}
                        className={`h-[56px] rounded-2xl flex-row items-center justify-center shadow-sm ${isDark ? 'bg-white' : 'bg-black'}`}
                    >
                        <Ionicons name="logo-apple" size={22} color={isDark ? '#000' : '#fff'} />
                        <Text className={`font-medium text-[16px] ml-3 ${isDark ? 'text-black' : 'text-white'}`}>Continue with Apple</Text>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                <View className="flex-row items-center my-3">
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <Text className={`px-4 font-normal text-[14px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or</Text>
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </View>

                {/* Email Signup */}
                <TouchableOpacity
                    onPress={() => router.push('/signup?from=onboarding')}
                    activeOpacity={0.8}
                    className="h-[56px] bg-brand-primary rounded-2xl items-center justify-center flex-row shadow-sm"
                >
                    <Ionicons name="mail-outline" size={20} color="#fff" className="mr-2" />
                    <Text className="font-bold text-[16px] text-white">Continue with Email</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
