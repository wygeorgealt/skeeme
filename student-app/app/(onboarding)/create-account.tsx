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

            {/* Progress */}
            <View className="flex-row gap-1.5 mb-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} className={`h-1 flex-1 rounded-full ${i <= 5 ? (isDark ? 'bg-white' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`} />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} className="mb-12">
                <View className={`w-16 h-16 rounded-[22px] items-center justify-center mb-8 shadow-sm ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-black/5'}`}>
                    <Ionicons name="sparkles" size={28} color="#D2B48C" />
                </View>
                <Text className={`text-[40px] font-bold tracking-tight leading-[46px] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Almost there.
                </Text>
                <Text className={`text-[16px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Create an account to save your progress and unlock your personal AI tutor.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(300)} className="gap-4">
                {/* Social Buttons */}
                <View className="gap-3">
                    <TouchableOpacity
                        onPress={() => {/* TODO: Wire Google sign-in */}}
                        activeOpacity={0.9}
                        className={`h-[64px] rounded-[24px] flex-row items-center justify-center border-2 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}
                    >
                        <Ionicons name="logo-google" size={22} color={isDark ? '#fff' : '#000'} />
                        <Text className={`font-bold text-[17px] ml-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Continue with Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => {/* TODO: Wire Apple sign-in */}}
                            activeOpacity={0.9}
                            className={`h-[64px] rounded-[24px] flex-row items-center justify-center shadow-md ${isDark ? 'bg-white' : 'bg-black'}`}
                        >
                            <Ionicons name="logo-apple" size={24} color={isDark ? '#000' : '#fff'} />
                            <Text className={`font-bold text-[17px] ml-3 ${isDark ? 'text-black' : 'text-white'}`}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View className="flex-row items-center my-4">
                    <View className={`flex-1 h-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <Text className={`px-6 font-bold text-[12px] uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>OR</Text>
                    <View className={`flex-1 h-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </View>

                {/* Email Signup */}
                <TouchableOpacity
                    onPress={() => router.push('/signup?from=onboarding')}
                    activeOpacity={0.9}
                    className="h-[64px] bg-brand-primary rounded-[24px] items-center justify-center flex-row shadow-lg shadow-brand-primary/25"
                >
                    <Ionicons name="mail" size={20} color="#fff" className="mr-2" />
                    <Text className="font-bold text-[17px] text-white tracking-wide">Signup with Email</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
