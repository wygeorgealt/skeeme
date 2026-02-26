import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { GradientButton } from '@/components/ui/GradientButton';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing Fields', 'Please fill in both email and password.');
            return;
        }
        if (!validateEmail(email.trim())) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/login', {
                email: email.trim().toLowerCase(),
                password,
                device_name: 'student_mobile_app',
            });

            const { user, token } = response.data;
            await setAuth(user, token);
            router.replace('/(drawer)');
        } catch (error: any) {
            let message = 'Invalid email or password. Please try again.';

            if (error.response?.data?.message) {
                // Server responded with an explicit error
                message = error.response.data.message;
            } else if (error.request && !error.response) {
                // The request was made but no response was received (Network Error)
                message = 'Network Error: Cannot connect to the server. Please check your internet connection or backend URL configuration.';
            }

            Alert.alert('Login Failed', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-brand-dark"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="px-6 py-12">
                    {/* Branding */}
                    <View className="mb-12 items-center">
                        <View className="size-20 bg-white dark:bg-slate-800 rounded-3xl items-center justify-center mb-5 shadow-lg shadow-indigo-500/10 overflow-hidden border border-slate-100 dark:border-brand-dark">
                            <Image
                                source={require('@/assets/images/icon.png')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Skeeme</Text>
                        <Text className="text-slate-500 dark:text-slate-400 font-medium text-center text-base">
                            AI-powered study companion
                        </Text>
                    </View>

                    {/* Form */}
                    <View>
                        <Text className="text-slate-500 dark:text-slate-300 font-bold text-xs ml-1 mb-2 uppercase tracking-wider">Email Address</Text>
                        <TextInput
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-medium text-base"
                            placeholder="student@example.com"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            returnKeyType="next"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text className="text-slate-500 dark:text-slate-300 font-bold text-xs ml-1 mb-2 mt-5 uppercase tracking-wider">Password</Text>
                        <View className="relative">
                            <TextInput
                                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-4 pr-14 rounded-2xl border border-slate-200 dark:border-slate-700 font-medium text-base"
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!showPassword}
                                autoComplete="password"
                                returnKeyType="done"
                                value={password}
                                onChangeText={setPassword}
                                onSubmitEditing={handleLogin}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-0 bottom-0 justify-center"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>

                        <GradientButton
                            onPress={handleLogin}
                            loading={isLoading}
                            containerStyle="mt-8">
                            Sign In
                        </GradientButton>

                        <View className="flex-row justify-center mt-8">
                            <Text className="text-slate-500 dark:text-slate-400 font-medium">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/signup')}>
                                <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
