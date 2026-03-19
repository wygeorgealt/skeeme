import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PasswordField } from '@/components/ui/PasswordField';

export default function NewPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { email, token } = useLocalSearchParams<{ email: string, token: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!email || !token) {
        router.replace('/login');
        return null;
    }

    const clearErrors = () => setErrorMsg('');

    // Password strength identical to signup
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

    const handleReset = async () => {
        clearErrors();

        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('auth/reset-password', {
                email,
                token,
                password,
                password_confirmation: confirmPassword
            });

            // Using push so they can't swipe back to the reset form nicely
            router.replace('/login?reset_success=true');
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const bgClass = isDark ? "bg-[#121212]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-slate-900";
    const subtextClass = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgClass}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View className="px-6 pt-16 pb-2 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.replace('/login')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-2" keyboardShouldPersistTaps="handled">
                <Text className={`${textClass} text-[32px] font-black tracking-tight leading-[38px] mb-2`}>
                    New password.
                </Text>
                <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    Your new password must be different from previously used passwords.
                </Text>

                {/* Password */}
                <View className="mb-4">
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); clearErrors(); }}
                        containerClassName=""
                        placeholder="New password"
                    />
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

                {/* Confirm Password */}
                <View className="mb-2">
                    <PasswordField
                        value={confirmPassword}
                        onChangeText={(t: string) => { setConfirmPassword(t); clearErrors(); }}
                        containerClassName=""
                        placeholder="Confirm new password"
                    />
                </View>

                {errorMsg ? (
                    <Text className="text-red-500 text-[14px] font-medium mt-2">{errorMsg}</Text>
                ) : null}

                <View className="mt-8" />

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleReset}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className={`w-full h-[56px] bg-brand-primary rounded-2xl items-center justify-center shadow-sm ${isLoading ? 'opacity-70' : ''}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="font-bold text-[16px] text-white">Reset Password</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
