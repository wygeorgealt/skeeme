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

            <Animated.View entering={FadeInDown.duration(600).delay(200)} className="flex-1 items-center justify-center -mt-10">
                <Image
                    source={require('@/assets/images/icon.png')}
                    className="w-16 h-16 rounded-2xl mb-8 opacity-90"
                    resizeMode="contain"
                />

                <Text className={`text-[36px] font-semibold tracking-tight text-center leading-[42px] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    The AI that studies{'\n'}the way you think.
                </Text>
                <Text className={`text-[16px] font-normal text-center leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Personalized explanations, instant answers, and guaranteed progress.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(500)} className="w-full pb-12">
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/education')}
                    activeOpacity={0.8}
                    className="h-[56px] bg-brand-primary rounded-2xl items-center justify-center mb-4"
                >
                    <Text className="font-bold text-[16px] text-white">Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/login')}
                    className="h-12 items-center justify-center"
                >
                    <Text className={`text-[15px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Already have an account? <Text className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>Log in</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
