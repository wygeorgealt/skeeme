import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Xmark } from 'iconoir-react-native';
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

        if (score >= 2 && password.length >= 10) return { label: 'Strong', color: '#8B5CF6', width: '100%' };
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

    const bgClass = isDark ? "bg-[#0f0f11]" : "bg-[#fafafa]";
    const textClass = isDark ? "text-white" : "text-slate-900";
    const subtextClass = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgClass}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View className="px-5 pt-16 pb-2 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.replace('/login')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Xmark width={28} height={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-10 pt-4" 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-10">
                    <Text className={`${textClass} text-[40px] font-bold tracking-tight leading-[46px] mb-3`}>
                        Security.
                    </Text>
                    <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed`}>
                        Create a strong password to protect your account.
                    </Text>
                </View>

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
                        <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <View style={{ width: strength.width as any, backgroundColor: strength.color, height: '100%', borderRadius: 4 }} />
                        </View>
                        <Text style={{ color: strength.color }} className="text-[10px] font-bold mt-2 uppercase tracking-widest">{strength.label}</Text>
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
                    <Text className="text-red-500 text-[13px] font-medium mt-3 ml-1">{errorMsg}</Text>
                ) : null}

                <View className="mt-6" />

                {/* Submit Button */}
                <View className="mt-6">
                    <TouchableOpacity
                        onPress={handleReset}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        className={`w-full h-[56px] bg-brand-primary rounded-[24px] items-center justify-center shadow-lg shadow-brand-primary/20 ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="font-bold text-[15px] text-white tracking-wide">Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
