import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PasswordField } from '@/components/ui/PasswordField';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { login, storedEmail } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    // Pre-fill stored email from previous session
    useEffect(() => {
        if (storedEmail) setEmail(storedEmail);
    }, [storedEmail]);

    const clearErrors = () => {
        setEmailError('');
        setPasswordError('');
    };

    const handleLogin = async () => {
        clearErrors();

        if (!email.trim()) {
            setEmailError('Please enter your email address.');
            return;
        }
        if (!password) {
            setPasswordError('Please enter your password.');
            return;
        }
        if (failedAttempts >= 5) {
            setPasswordError('Too many attempts. Please wait a moment before trying again.');
            return;
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
            setFailedAttempts(prev => prev + 1);
            const status = error.response?.status;
            if (status === 401 || status === 404 || status === 422) {
                setPasswordError('Incorrect email or password.');
            } else if (status === 429) {
                setPasswordError('Too many attempts. Please wait 1 minute.');
            } else {
                setPasswordError('Something went wrong. Check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
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
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/hook')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-4" keyboardShouldPersistTaps="handled">
                {/* Logo */}
                <Image
                    source={require('@/assets/images/icon.png')}
                    className="w-14 h-14 rounded-2xl mb-6"
                    resizeMode="contain"
                />

                <Text className={`${textClass} text-[32px] font-black tracking-tight leading-[38px] mb-2`}>
                    Welcome back.
                </Text>
                <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    Sign in to pick up where you left off.
                </Text>

                {/* Google Sign In */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    className={`h-[56px] rounded-2xl items-center justify-center flex-row shadow-sm mb-3 ${isDark ? 'bg-[#1c1c1e] border border-slate-800' : 'bg-white border border-slate-200'}`}
                >
                    <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text className={`font-medium text-[16px] ml-3 ${textClass}`}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Sign In — iOS only */}
                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`h-[56px] rounded-2xl items-center justify-center flex-row shadow-sm mb-3 ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                    >
                        <Ionicons name="logo-apple" size={22} color={isDark ? '#000' : '#fff'} />
                        <Text className={`font-medium text-[16px] ml-3 ${isDark ? 'text-black' : 'text-white'}`}>Continue with Apple</Text>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                <View className="flex-row items-center my-5">
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <Text className={`px-4 font-medium text-[13px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>or sign in with email</Text>
                    <View className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </View>

                {/* Email */}
                <View className="mb-1">
                    <View className={`${inputBg} ${inputBorder} rounded-2xl px-4 flex-row items-center border ${emailError ? 'border-red-500' : ''}`}>
                        <TextInput
                            className="flex-1 font-medium text-[17px] h-[56px]"
                            placeholder="Email address"
                            placeholderTextColor={placeholderColor}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                            style={{ color: isDark ? 'white' : 'black' }}
                        />
                    </View>
                    {emailError ? <Text className="text-red-500 text-[13px] font-medium mt-1.5 ml-1">{emailError}</Text> : null}
                </View>

                {/* Password */}
                <View className="mb-1 mt-3">
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); setPasswordError(''); }}
                        containerClassName=""
                    />
                    <View className="flex-row justify-between items-center mt-1.5">
                        {passwordError ? (
                            <Text className="text-red-500 text-[13px] font-medium ml-1 flex-1">{passwordError}</Text>
                        ) : <View />}
                        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                            <Text className="text-brand-primary font-bold text-[13px]">Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-6" />

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className={`w-full h-[56px] bg-brand-primary rounded-2xl items-center justify-center shadow-sm ${isLoading ? 'opacity-70' : ''}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="font-bold text-[16px] text-white">Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(onboarding)/hook')} className="mt-8 mb-4 items-center">
                    <Text className={`${subtextClass} font-medium`}>
                        Don't have an account? <Text className="text-brand-primary font-bold">Get started</Text>
                    </Text>
                </TouchableOpacity>

                {__DEV__ && (
                    <TouchableOpacity onPress={() => { useAuthStore.getState().devReset(); router.replace('/(onboarding)/hook'); }} className="mb-12 items-center">
                        <Text className="text-red-500 text-xs font-bold">DEV ONLY: Reset Storage</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
