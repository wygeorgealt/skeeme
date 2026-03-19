import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            await api.post('otp/send', { email: email.trim().toLowerCase(), type: 'password_reset' });
        } catch (e: any) {
            // Silently proceed to prevent enumeration. 
            // If they are on cooldown, the OTP screen handles it anyway.
        } finally {
            setIsLoading(false);
            router.push({
                pathname: '/otp',
                params: {
                    email: email.trim().toLowerCase(),
                    type: 'password_reset'
                }
            });
        }
    };

    const bgClass = isDark ? "bg-[#0f0f11]" : "bg-[#fafafa]";
    const textClass = isDark ? "text-white" : "text-slate-900";
    const subtextClass = isDark ? "text-slate-400" : "text-slate-500";
    const inputBg = isDark ? "bg-[#0f0f11]" : "bg-transparent";
    const inputBorder = isDark ? "border-slate-800" : "border-slate-200";
    const placeholderColor = isDark ? "#475569" : "#94a3b8";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgClass}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View className="px-6 pt-16 pb-2 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-10 pt-10">
                <View className="mb-12">
                    <Text className={`${textClass} text-[40px] font-bold tracking-tight leading-[46px] mb-3`}>
                        Reset.
                    </Text>
                    <Text className={`${subtextClass} text-[16px] font-medium leading-relaxed`}>
                        Enter your email and we'll send you a 6-digit reset code.
                    </Text>
                </View>

                <View className="mb-8">
                    <View className={`${inputBg} ${inputBorder} rounded-[24px] px-5 flex-row items-center border focus:border-slate-900 dark:focus:border-white`}>
                        <TextInput
                            className="flex-1 font-medium text-[17px] h-[64px]"
                            placeholder="Email address"
                            placeholderTextColor={placeholderColor}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            style={{ color: isDark ? 'white' : 'black' }}
                        />
                    </View>
                </View>

                <View className="mt-4">
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={isLoading || !email.trim()}
                        activeOpacity={0.9}
                        className={`w-full h-[64px] bg-brand-primary rounded-[24px] items-center justify-center shadow-lg shadow-brand-primary/20 ${(isLoading || !email.trim()) ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="font-bold text-[16px] text-white tracking-wide">Send Reset Code</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
