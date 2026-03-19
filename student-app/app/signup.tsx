import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PasswordField } from '@/components/ui/PasswordField';

export default function SignupScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const params = useLocalSearchParams<{ from?: string }>();
    const isFromOnboarding = params.from === 'onboarding';
    const { login, onboardingData } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Inline errors
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const clearErrors = () => { setNameError(''); setEmailError(''); setPasswordError(''); };

    // Password strength
    const getPasswordStrength = (): { label: string; color: string; width: string } => {
        if (!password) return { label: '', color: 'transparent', width: '0%' };
        if (password.length < 6) return { label: 'Too weak', color: '#ef4444', width: '20%' };
        if (password.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (score >= 2 && password.length >= 10) return { label: 'Strong', color: '#D2B48C', width: '100%' };
        if (score >= 1) return { label: 'Good', color: '#eab308', width: '70%' };
        return { label: 'Fair', color: '#f97316', width: '50%' };
    };
    const strength = getPasswordStrength();

    const handleSignup = async () => {
        clearErrors();
        let hasError = false;

        if (!name.trim()) { setNameError('Please enter your full name.'); hasError = true; }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Please enter a valid email address.'); hasError = true; }
        if (!password || password.length < 8) { setPasswordError('Password must be at least 8 characters.'); hasError = true; }
        if (hasError) return;

        setIsLoading(true);
        try {
            const response = await api.post('register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                password_confirmation: password,
                device_name: `${Platform.OS}_app`,
                // Pass onboarding prefs if available
                ...(onboardingData?.education_level && { education_level: onboardingData.education_level }),
                ...(onboardingData?.field_of_study && { field_of_study: onboardingData.field_of_study }),
                ...(onboardingData?.learning_style && { learning_style: onboardingData.learning_style }),
            });

            const { token, user } = response.data;
            await login(user, token);

            // Navigate to OTP verification screen instead of direct entry
            router.replace({
                pathname: '/otp',
                params: {
                    email: email.trim().toLowerCase(),
                    type: 'verification'
                }
            });
        } catch (error: any) {
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 422) {
                // Validation errors
                const errors = data?.errors || {};
                if (errors.email) {
                    if (errors.email[0]?.includes('already')) {
                        setEmailError('');
                        // Show custom inline message for existing account
                        setEmailError('exists');
                    } else {
                        setEmailError(errors.email[0]);
                    }
                }
                if (errors.password) setPasswordError(errors.password[0]);
                if (errors.name) setNameError(errors.name[0]);
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
                    <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-2" keyboardShouldPersistTaps="handled">
                <Text className={`${textClass} text-[32px] font-black tracking-tight leading-[38px] mb-2`}>
                    Create your account.
                </Text>
                <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    Start studying smarter with Skeeme.
                </Text>

                {/* Full Name */}
                <View className="mb-4">
                    <View className={`${inputBg} ${inputBorder} rounded-2xl px-4 flex-row items-center border ${nameError ? 'border-red-500' : ''}`}>
                        <TextInput
                            className="flex-1 font-medium text-[17px] h-[56px]"
                            placeholder="Full name"
                            placeholderTextColor={placeholderColor}
                            autoCapitalize="words"
                            value={name}
                            onChangeText={(t) => { setName(t); setNameError(''); }}
                            style={{ color: isDark ? 'white' : 'black' }}
                        />
                    </View>
                    {nameError ? <Text className="text-red-500 text-[13px] font-medium mt-1.5 ml-1">{nameError}</Text> : null}
                </View>

                {/* Email */}
                <View className="mb-4">
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
                    {emailError === 'exists' ? (
                        <View className="flex-row items-center mt-1.5 ml-1">
                            <Text className="text-red-500 text-[13px] font-medium">An account with this email already exists. </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text className="text-brand-primary font-bold text-[13px]">Log in instead →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : emailError ? (
                        <Text className="text-red-500 text-[13px] font-medium mt-1.5 ml-1">{emailError}</Text>
                    ) : null}
                </View>

                {/* Password */}
                <View className="mb-2">
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); setPasswordError(''); }}
                        containerClassName=""
                    />
                    {passwordError ? (
                        <Text className="text-red-500 text-[13px] font-medium mt-1.5 ml-1">{passwordError}</Text>
                    ) : null}
                </View>

                {/* Password Strength */}
                {password.length > 0 && (
                    <View className="mb-6 ml-1">
                        <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <View style={{ width: strength.width as any, backgroundColor: strength.color, height: '100%', borderRadius: 4 }} />
                        </View>
                        <Text style={{ color: strength.color }} className="text-[12px] font-bold mt-1">{strength.label}</Text>
                    </View>
                )}

                <View className="mt-2" />

                {/* Signup Button */}
                <TouchableOpacity
                    onPress={handleSignup}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className={`w-full h-[56px] bg-brand-primary rounded-2xl items-center justify-center shadow-sm ${isLoading ? 'opacity-70' : ''}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="font-bold text-[16px] text-white">Create Account</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')} className="mt-8 mb-12 items-center">
                    <Text className={`${subtextClass} font-medium`}>
                        Already have an account? <Text className="text-brand-primary font-bold">Log in</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
