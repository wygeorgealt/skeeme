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
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/hook')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-10 pt-4" 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-12">
                    <Text className={`${textClass} text-[40px] font-bold tracking-tight leading-[46px] mb-3`}>
                        Log in.
                    </Text>
                    <Text className={`${subtextClass} text-[16px] font-medium leading-relaxed`}>
                        Enter your details to access your dashboard.
                    </Text>
                </View>

                {/* Social Login */}
                <View className="gap-3 mb-10">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className={`h-[60px] rounded-[24px] items-center justify-center flex-row border ${isDark ? 'bg-transparent border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                    >
                        <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#000'} />
                        <Text className={`font-bold text-[15px] ml-3 ${textClass}`}>Continue with Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className={`h-[60px] rounded-[24px] items-center justify-center flex-row ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                        >
                            <Ionicons name="logo-apple" size={22} color={isDark ? '#000' : '#fff'} />
                            <Text className={`font-bold text-[15px] ml-3 ${isDark ? 'text-black' : 'text-white'}`}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View className="flex-row items-center mb-10">
                    <View className={`flex-1 h-[0.5px] ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <Text className={`px-6 font-bold text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>or use email</Text>
                    <View className={`flex-1 h-[0.5px] ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </View>

                {/* Email */}
                <View className="mb-1">
                    <View className={`${inputBg} ${inputBorder} rounded-2xl px-4 flex-row items-center border ${emailError ? 'border-red-500' : 'focus:border-slate-900 dark:focus:border-white'}`}>
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
                    <View className="flex-row justify-between items-center mt-2 px-1">
                        {passwordError ? (
                            <Text className="text-red-500 text-[13px] font-medium flex-1">{passwordError}</Text>
                        ) : <View />}
                        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                            <Text className="text-brand-primary font-bold text-[13px]">Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-8" />

                {/* Login Button */}
                <View className="mt-6">
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        className={`w-full h-[60px] bg-brand-primary rounded-[24px] items-center justify-center shadow-lg shadow-brand-primary/20 ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="font-bold text-[16px] text-white tracking-wide">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/signup')} className="mt-12 mb-10 items-center">
                    <Text className={`${subtextClass} font-bold text-[14px]`}>
                        New to Skeeme? <Text className="text-brand-primary">Create account</Text>
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
