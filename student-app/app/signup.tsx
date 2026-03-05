import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle, signInWithApple } from '@/lib/socialAuth';

// ─── REVOLUT-INSPIRED MULTI-STEP SIGNUP ────────────────────────────────────

export default function SignupScreen() {
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

        try {
            const response = await api.post('/student/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                password_confirmation: confirmPassword,
                device_name: `${Platform.OS}_app`,
            });

            const { token, user } = response.data;
            login(user, token);

            // Directly push to upgrade ad post-registration per plan
            router.replace('/upgrade');

        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message || 'Check your details and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-brand-dark"
        >
            <StatusBar style="light" />

            {/* Back Button / Header Navigation */}
            <View className="px-6 pt-16 pb-4 flex-row justify-between items-center z-10">
                <TouchableOpacity
                    onPress={() => step > 1 ? setStep(step - 1) : router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Ionicons name="help-circle-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8" keyboardShouldPersistTaps="handled">
                {/* Step 1: Email */}
                {step === 1 && (
                    <AnimatedStep>
                        <Text className="text-white text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4">
                            Create your Skeeme account
                        </Text>
                        <Text className="text-slate-400 text-[15px] font-medium leading-relaxed mb-8">
                            Enter your email address to get started.
                        </Text>

                        <View className="bg-[#2c2c2e] rounded-[16px] px-4 py-1 flex-row items-center border border-[#3a3a3c] focus:border-[#6366f1]">
                            <TextInput
                                className="flex-1 text-white font-medium text-[17px] h-[56px]"
                                placeholder="name@example.com"
                                placeholderTextColor="#8e8e93"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoFocus
                            />
                            {email.length > 0 && (
                                <TouchableOpacity onPress={() => setEmail('')}>
                                    <Ionicons name="close-circle" size={20} color="#8e8e93" />
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
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center mb-8 ${email.length > 3 ? 'bg-white' : 'bg-white/30'}`}
                            disabled={email.length <= 3}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${email.length > 3 ? 'text-black' : 'text-black/50'}`}>Continue</Text>
                        </TouchableOpacity>

                        {/* Social Auth Separator placeholder */}
                        <View className="flex-row items-center mb-8">
                            <View className="flex-1 h-[1px] bg-[#3a3a3c]" />
                            <Text className="text-[#8e8e93] font-medium px-4 text-[13px]">or sign up with</Text>
                            <View className="flex-1 h-[1px] bg-[#3a3a3c]" />
                        </View>

                        {/* Social Buttons */}
                        <TouchableOpacity
                            onPress={() => handleSocialLogin('google')}
                            disabled={isSocialLoading}
                            className="w-full bg-[#1c1c1e] py-[16px] rounded-[12px] flex-row items-center justify-center mb-4 border border-[#2c2c2e]"
                        >
                            {isSocialLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="logo-google" size={20} color="white" />
                                    <Text className="text-white font-medium text-[15px] ml-3">Sign up with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleSocialLogin('apple')}
                            disabled={isSocialLoading}
                            className="w-full bg-[#1c1c1e] py-[16px] rounded-[12px] flex-row items-center justify-center border border-[#2c2c2e]"
                        >
                            <Ionicons name="logo-apple" size={20} color="white" />
                            <Text className="text-white font-medium text-[15px] ml-3">Sign up with Apple</Text>
                        </TouchableOpacity>
                    </AnimatedStep>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                    <AnimatedStep>
                        <Text className="text-white text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4">
                            Secure your account
                        </Text>
                        <Text className="text-slate-400 text-[15px] font-medium leading-relaxed mb-8">
                            Choose a strong password with at least 8 characters.
                        </Text>

                        <View className="bg-[#2c2c2e] rounded-[16px] px-4 py-1 flex-row items-center border border-[#3a3a3c] mb-4">
                            <TextInput
                                className="flex-1 text-white font-medium text-[17px] h-[56px]"
                                placeholder="Password"
                                placeholderTextColor="#8e8e93"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoFocus
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#8e8e93" />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-[#2c2c2e] rounded-[16px] px-4 py-1 flex-row items-center border border-[#3a3a3c] mb-12">
                            <TextInput
                                className="flex-1 text-white font-medium text-[17px] h-[56px]"
                                placeholder="Confirm Password"
                                placeholderTextColor="#8e8e93"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center ${password.length >= 8 && confirmPassword === password ? 'bg-white' : 'bg-white/30'}`}
                            disabled={password.length < 8 || confirmPassword !== password}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${password.length >= 8 && confirmPassword === password ? 'text-black' : 'text-black/50'}`}>Continue</Text>
                        </TouchableOpacity>
                    </AnimatedStep>
                )}

                {/* Step 3: Name */}
                {step === 3 && (
                    <AnimatedStep>
                        <Text className="text-white text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4">
                            What's your name?
                        </Text>
                        <Text className="text-slate-400 text-[15px] font-medium leading-relaxed mb-8">
                            This is how you will appear inside Skeeme.
                        </Text>

                        <View className="bg-[#2c2c2e] rounded-[16px] px-4 py-1 flex-row items-center border border-[#3a3a3c] mb-12">
                            <TextInput
                                className="flex-1 text-white font-medium text-[17px] h-[56px]"
                                placeholder="First & Last Name"
                                placeholderTextColor="#8e8e93"
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                            {name.length > 0 && (
                                <TouchableOpacity onPress={() => setName('')}>
                                    <Ionicons name="close-circle" size={20} color="#8e8e93" />
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
                    </AnimatedStep>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Simple wrapper for animating step transitions (Fade/Slide would be ideal here if reanimated was strictly requested per component, 
// but sticking to native View for raw performance in forms based on Revolut flow)
function AnimatedStep({ children }: { children: React.ReactNode }) {
    return <View className="flex-1">{children}</View>;
}
