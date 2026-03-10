import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle, signInWithApple } from '@/lib/socialAuth';
import { PasswordField } from '@/components/ui/PasswordField';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();
    const [failedAttempts, setFailedAttempts] = useState(0);

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setIsSocialLoading(true);
        try {
            const signInFn = provider === 'google' ? signInWithGoogle : signInWithApple;
            const result = await signInFn();
            if (result) {
                login(result.user, result.token);
                router.replace('/(drawer)');
            }
        } catch (error: any) {
            if (__DEV__) console.error('[Social Login] Error:', error);
            Alert.alert('Auth Error', 'Social sign-in failed. Please try again.');
        } finally {
            setIsSocialLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            return Alert.alert('Missing Details', 'Please provide both your email and password.');
        }

        // H6: Throttle after 3 failed attempts
        if (failedAttempts >= 3) {
            Alert.alert('Too Many Attempts', `Please wait a moment before trying again.`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        setIsLoading(true);
        try {
            const response = await api.post('login', {
                email: email.trim().toLowerCase(),
                password,
                device_name: `${Platform.OS}_app`,
            });
            const { token, user } = response.data;
            login(user, token);
            setFailedAttempts(0);
            router.replace('/(drawer)');
        } catch (error: any) {
            if (__DEV__) console.error('[Login] Error:', error.message);
            setFailedAttempts(prev => prev + 1);

            let msg = 'Invalid credentials or network issue.';
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 401 || status === 404) {
                msg = 'Email not found or password incorrect.';
            } else if (status === 422) {
                msg = data?.message || 'Account not found or invalid details.';
            } else if (status === 429) {
                msg = 'Too many attempts. Please wait 1 minute.';
            }

            Alert.alert('Login Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Theme-based colors
    const bgClass = isDark ? "bg-[#282828]" : "bg-white";
    const textTitleClass = isDark ? "text-white" : "text-black";
    const textSubClass = isDark ? "text-slate-400" : "text-slate-500";
    const inputBgClass = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const inputBorderClass = isDark ? "border-[#2c2c2e]" : "border-slate-200";
    const inputTextColor = isDark ? "white" : "black";
    const placeholderColor = isDark ? "#8e8e93" : "#94a3b8";
    const iconColor = isDark ? "white" : "black";
    const socialBtnBg = isDark ? "bg-[#1c1c1e]" : "bg-white";
    const separatorClass = isDark ? "bg-[#3a3a3c]" : "bg-slate-200";
    const primaryBtnClass = (email.length > 5 && password.length > 0 && !isLoading)
        ? (isDark ? 'bg-white' : 'bg-black')
        : (isDark ? 'bg-white/30' : 'bg-black/30');
    const primaryBtnTextClass = isDark ? 'text-black' : 'text-white';
    const primaryBtnTextDisabledClass = isDark ? 'text-black/50' : 'text-white/50';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgClass}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Back Button / Header Navigation */}
            <View className="px-6 pt-16 pb-4 flex-row justify-between items-center z-10">
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/welcome')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color={iconColor} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-8" keyboardShouldPersistTaps="handled">
                <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2`}>
                    Welcome back
                </Text>
                <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    Enter your details to sign in to Skeeme.
                </Text>

                {/* Email Input */}
                <View className="mb-4">
                    <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 flex-row items-center border focus:border-brand-primary`}>
                        <TextInput
                            className={`flex-1 text-${inputTextColor} font-medium text-[17px] h-[56px]`}
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

                {/* Password Input */}
                <PasswordField value={password} onChangeText={setPassword} containerClassName="mb-1" />

                <View className="mb-8" />

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className={`w-full bg-brand-primary rounded-[16px] h-[56px] items-center justify-center shadow-lg shadow-brand-primary/30 ${isLoading ? 'opacity-70' : ''}`}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black text-[17px] tracking-wide">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Social Sign In (Hidden for now)
                <View className="flex-row items-center mb-8 mt-8">
                    <View className={`flex-1 h-[1px] ${separatorClass}`} />
                    <Text className={`${textSubClass} font-medium px-4 text-[13px]`}>or sign in with</Text>
                    <View className={`flex-1 h-[1px] ${separatorClass}`} />
                </View>

                <TouchableOpacity
                    onPress={() => handleSocialLogin('google')}
                    disabled={isSocialLoading}
                    className={`w-full ${socialBtnBg} py-[16px] rounded-[12px] flex-row items-center justify-center mb-4 border ${inputBorderClass}`}
                >
                    {isSocialLoading ? (
                        <ActivityIndicator color={isDark ? "white" : "black"} size="small" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color={iconColor} />
                            <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSocialLogin('apple')}
                    disabled={isSocialLoading}
                    className={`w-full ${socialBtnBg} py-[16px] rounded-[12px] flex-row items-center justify-center border ${inputBorderClass} mb-8`}
                >
                    <Ionicons name="logo-apple" size={20} color={iconColor} />
                    <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Continue with Apple</Text>
                </TouchableOpacity>
                */}



                <TouchableOpacity onPress={() => router.push('/signup')} className="mt-8 mb-12 items-center">
                    <Text className={`${textSubClass} font-medium`}>
                        Don't have an account? <Text className="text-brand-primary font-bold">Sign up</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView >
        </KeyboardAvoidingView >
    );
}
