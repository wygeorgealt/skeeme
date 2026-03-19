import { View, Text, TouchableOpacity, useColorScheme, Image } from 'react-native';
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
        <View className={`flex-1 px-8 pt-20 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(200)} className="flex-1 items-center justify-center -mt-20">
                <View className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-black/5 items-center justify-center mb-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <Image
                        source={require('@/assets/images/icon.png')}
                        className="w-16 h-16 opacity-90"
                        resizeMode="contain"
                    />
                </View>

                <Text className={`text-[44px] font-bold tracking-tight text-center leading-[50px] mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Study with{'\n'}Skeeme.
                </Text>
                <Text className={`text-[17px] font-medium text-center leading-relaxed px-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    The world's most powerful AI tutor, personalized exactly for you.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(600)} className="w-full pb-16">
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/education')}
                    activeOpacity={0.9}
                    className="h-[64px] bg-brand-primary rounded-[24px] items-center justify-center mb-6 shadow-lg shadow-brand-primary/25"
                >
                    <Text className="font-bold text-[17px] text-white tracking-wide">Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/login')}
                    className="h-12 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Text className={`text-[15px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Already have an account? <Text className="text-brand-primary">Log in</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
