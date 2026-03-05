import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle, signInWithApple } from '@/lib/socialAuth';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setIsSocialLoading(true);
        try {
            const signInFn = provider === 'google' ? signInWithGoogle : signInWithApple;
            const result = await signInFn();
            if (result) {
                login(result.user, result.token);
                router.replace('/(drawer)');
            }
        } finally {
            setIsSocialLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            return Alert.alert('Missing Details', 'Please provide both your email and password.');
        }

        setIsLoading(true);
        try {
            const response = await api.post('/student/login', {
                email: email.trim().toLowerCase(),
                password,
                device_name: `${Platform.OS}_app`,
            });
            const { token, user } = response.data;
            login(user, token);
            router.replace('/(drawer)');
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid credentials or network issue.'
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
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-8" keyboardShouldPersistTaps="handled">
                <Text className="text-white text-[34px] font-black tracking-tight leading-[40px] mb-2">
                    Welcome back
                </Text>
                <Text className="text-slate-400 text-[15px] font-medium leading-relaxed mb-8">
                    Enter your details to sign in to Skeeme.
                </Text>

                {/* Email Input */}
                <View className="mb-4">
                    <View className="bg-[#2c2c2e] rounded-[16px] px-4 flex-row items-center border border-[#3a3a3c] focus:border-[#6366f1]">
                        <TextInput
                            className="flex-1 text-white font-medium text-[17px] h-[56px]"
                            placeholder="Email address"
                            placeholderTextColor="#8e8e93"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View className="bg-[#2c2c2e] rounded-[16px] px-4 flex-row items-center border border-[#3a3a3c] mb-8 focus:border-[#6366f1]">
                    <TextInput
                        className="flex-1 text-white font-medium text-[17px] h-[56px]"
                        placeholder="Password"
                        placeholderTextColor="#8e8e93"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#8e8e93" />
                    </TouchableOpacity>
                </View>

                {/* Social Auth Separator */}
                <View className="flex-row items-center mb-8">
                    <View className="flex-1 h-[1px] bg-[#3a3a3c]" />
                    <Text className="text-[#8e8e93] font-medium px-4 text-[13px]">or sign in with</Text>
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
                            <Text className="text-white font-medium text-[15px] ml-3">Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSocialLogin('apple')}
                    disabled={isSocialLoading}
                    className="w-full bg-[#1c1c1e] py-[16px] rounded-[12px] flex-row items-center justify-center border border-[#2c2c2e] mb-8"
                >
                    <Ionicons name="logo-apple" size={20} color="white" />
                    <Text className="text-white font-medium text-[15px] ml-3">Continue with Apple</Text>
                </TouchableOpacity>

                {/* Primary Action */}
                <TouchableOpacity
                    onPress={handleLogin}
                    className={`w-full py-[18px] rounded-[12px] items-center justify-center flex-row ${email.length > 5 && password.length > 0 && !isLoading ? 'bg-white' : 'bg-white/30'}`}
                    disabled={email.length <= 5 || password.length === 0 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Text className={`font-bold text-[17px] tracking-tight ${email.length > 5 && password.length > 0 ? 'text-black' : 'text-black/50'}`}>Sign In</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
