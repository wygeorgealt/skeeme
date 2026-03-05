import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
    ScrollView, useColorScheme
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle, signInWithApple } from '@/lib/socialAuth';

export default function SignupScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { login } = useAuthStore();

    // Steps: 1 = Email, 2 = Password, 3 = Profile (Name)
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setIsSocialLoading(true);
        try {
            const signInFn = provider === 'google' ? signInWithGoogle : signInWithApple;
            const result = await signInFn();
            if (result) {
                login(result.user, result.token);
                if (result.isNewUser) {
                    router.replace('/upgrade');
                } else {
                    router.replace('/(drawer)');
                }
            }
        } catch (error: any) {
            console.error('[Social Signup] Error:', error);
            Alert.alert('Auth Error', 'Social sign-up failed. Please try again.');
        } finally {
            setIsSocialLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                return Alert.alert('Invalid Email', 'Please enter a valid email address.');
            }
            setStep(2);
        } else if (step === 2) {
            if (!password || password.length < 8) {
                return Alert.alert('Too Short', 'Password must be at least 8 characters.');
            }
            if (password !== confirmPassword) {
                return Alert.alert('Mismatch', 'Passwords do not match.');
            }
            setStep(3);
        }
    };

    const handleSignup = async () => {
        if (!name.trim()) return Alert.alert('Required', 'Please enter your full name.');
        setIsLoading(true);

        const payload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            password_confirmation: confirmPassword,
            device_name: `${Platform.OS}_app`,
        };

        console.log('[Signup] Sending payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await api.post('/register', payload);
            console.log('[Signup] Success');
            const { token, user } = response.data;
            login(user, token);
            router.replace('/upgrade');
        } catch (error: any) {
            console.error('[Signup] Error status:', error.response?.status);
            console.error('[Signup] Error data:', JSON.stringify(error.response?.data, null, 2));
            console.error('[Signup] Error message:', error.message);

            let errorMessage = error.response?.data?.message || 'Check your details and try again.';
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstKey = Object.keys(errors)[0];
                errorMessage = errors[firstKey][0];
            }
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Theme-based colors
    const bgClass = isDark ? "bg-[#010100]" : "bg-white";
    const textTitleClass = isDark ? "text-white" : "text-black";
    const textSubClass = isDark ? "text-slate-400" : "text-slate-500";
    const inputBgClass = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const inputBorderClass = isDark ? "border-[#2c2c2e]" : "border-slate-200";
    const placeholderColor = isDark ? "#8e8e93" : "#94a3b8";
    const iconColor = isDark ? "white" : "black";
    const socialBtnBg = isDark ? "bg-[#1c1c1e]" : "bg-white";
    const separatorClass = isDark ? "bg-[#3a3a3c]" : "bg-slate-200";

    const primaryBtnClass = (email.length > 3 && !isLoading)
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
                    onPress={() => step > 1 ? setStep(step - 1) : router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="arrow-back" size={24} color={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Ionicons name="help-circle-outline" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8" keyboardShouldPersistTaps="handled">
                {/* Step 1: Email */}
                {step === 1 && (
                    <View className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            Create your Skeeme account
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Enter your email address to get started.
                        </Text>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border focus:border-[#6366f1]`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="name@example.com"
                                placeholderTextColor={placeholderColor}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoFocus
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            {email.length > 0 && (
                                <TouchableOpacity onPress={() => setEmail('')}>
                                    <Ionicons name="close-circle" size={20} color={placeholderColor} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity onPress={() => router.push('/login')} className="mt-6 mb-12">
                            <Text className="text-[#6366f1] font-bold text-[15px]">
                                Already have a Skeeme account?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center mb-8 ${primaryBtnClass}`}
                            disabled={email.length <= 3}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${email.length > 3 ? primaryBtnTextClass : primaryBtnTextDisabledClass}`}>Continue</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-8">
                            <View className={`flex-1 h-[1px] ${separatorClass}`} />
                            <Text className={`${textSubClass} font-medium px-4 text-[13px]`}>or sign up with</Text>
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
                                    <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Sign up with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleSocialLogin('apple')}
                            disabled={isSocialLoading}
                            className={`w-full ${socialBtnBg} py-[16px] rounded-[12px] flex-row items-center justify-center border ${inputBorderClass} mb-8`}
                        >
                            <Ionicons name="logo-apple" size={20} color={iconColor} />
                            <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Sign up with Apple</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                    <View className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            Secure your account
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Choose a strong password with at least 8 characters.
                        </Text>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-4`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="Password"
                                placeholderTextColor={placeholderColor}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoFocus
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={placeholderColor} />
                            </TouchableOpacity>
                        </View>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-12`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="Confirm Password"
                                placeholderTextColor={placeholderColor}
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center ${password.length >= 8 && confirmPassword === password ? primaryBtnClass : (isDark ? 'bg-white/30' : 'bg-black/30')}`}
                            disabled={password.length < 8 || confirmPassword !== password}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${password.length >= 8 && confirmPassword === password ? primaryBtnTextClass : primaryBtnTextDisabledClass}`}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Name */}
                {step === 3 && (
                    <View className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            What's your name?
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            This is how you will appear inside Skeeme.
                        </Text>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-12`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="First & Last Name"
                                placeholderTextColor={placeholderColor}
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            {name.length > 0 && (
                                <TouchableOpacity onPress={() => setName('')}>
                                    <Ionicons name="close-circle" size={20} color={placeholderColor} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleSignup}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center flex-row ${name.length > 1 && !isLoading ? 'bg-[#6366f1]' : 'bg-[#6366f1]/50'}`}
                            disabled={name.length <= 1 || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-bold text-[17px] tracking-tight text-white">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
