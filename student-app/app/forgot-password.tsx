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
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            await api.post('forgot-password', { email: email.trim().toLowerCase() });
        } catch (e) {
            // Silently ignore — always show same message
        } finally {
            setIsLoading(false);
            setSent(true);
        }
    };

    const bgClass = isDark ? "bg-[#121212]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-slate-900";
    const subtextClass = isDark ? "text-slate-400" : "text-slate-500";
    const inputBg = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const inputBorder = isDark ? "border-[#2c2c2e]" : "border-slate-200";
    const placeholderColor = isDark ? "#8e8e93" : "#94a3b8";

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

            <View className="flex-1 px-8 pt-8">
                <Text className={`${textClass} text-[32px] font-black tracking-tight leading-[38px] mb-2`}>
                    Reset password.
                </Text>
                <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    Enter the email address linked to your account and we'll send you a reset link.
                </Text>

                {sent ? (
                    <View className="bg-brand-primary/10 border-2 border-brand-primary/30 rounded-2xl p-5">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="checkmark-circle" size={22} color="#2EBD85" />
                            <Text className="text-brand-primary font-black text-[15px] ml-2">Check your inbox</Text>
                        </View>
                        <Text className={`${subtextClass} text-[14px] font-medium leading-relaxed`}>
                            If that email is registered, a reset link is on its way. Check your email and follow the instructions.
                        </Text>

                        <TouchableOpacity onPress={() => router.push('/login')} className="mt-5">
                            <Text className="text-brand-primary font-bold text-[14px]">← Back to login</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View className={`${inputBg} ${inputBorder} rounded-2xl px-4 flex-row items-center border mb-6`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="Email address"
                                placeholderTextColor={placeholderColor}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={isLoading || !email.trim()}
                            activeOpacity={0.8}
                            className={`w-full bg-brand-primary rounded-2xl h-[56px] items-center justify-center shadow-lg shadow-brand-primary/30 ${(isLoading || !email.trim()) ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-[17px]">Send Reset Link</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
