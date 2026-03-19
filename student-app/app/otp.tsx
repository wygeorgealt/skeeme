import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function OtpScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { email, type } = useLocalSearchParams<{ email: string, type: 'verification' | 'password_reset' }>();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [resendSuccess, setResendSuccess] = useState('');

    const inputs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (!email || !type) {
            router.replace('/login');
        }
    }, [email, type]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (text: string, index: number) => {
        setErrorMsg('');
        
        // Handle Paste
        if (text.length > 1) {
            const pastedCode = text.replace(/[^0-9]/g, '').slice(0, 6).split('');
            if (pastedCode.length === 6) {
                setCode(pastedCode);
                Keyboard.dismiss();
                verifyCode(pastedCode.join(''));
            }
            return;
        }

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto advance
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        // Auto submit
        if (newCode.every(char => char !== '') && index === 5) {
            Keyboard.dismiss();
            verifyCode(newCode.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
        }
    };

    const verifyCode = async (fullCode: string) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await api.post('otp/verify', { email, type, code: fullCode });
            const token = res.data.token;
            
            if (type === 'verification') {
                await api.post('auth/verify-account', { email, token });
                router.replace('/(onboarding)/streak-intro');
            } else {
                router.replace(`/new-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed. Please try again.';
            setErrorMsg(msg);
            
            if (msg.includes('Too many') || msg.includes('expired')) {
                setCode(['', '', '', '', '', '']);
                inputs.current[0]?.focus();
                setCountdown(0); // Activate resend immediately
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        
        setIsLoading(true);
        setErrorMsg('');
        setResendSuccess('');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();

        try {
            await api.post('otp/resend', { email, type });
            setCountdown(60);
            setResendSuccess('A new code has been sent.');
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (error: any) {
            if (error.response?.status === 429) {
                setCountdown(error.response.data.cooldown || 60);
            } else {
                setErrorMsg('Failed to resend code. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const bgClass = isDark ? "bg-[#121212]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-slate-900";
    const subtextClass = isDark ? "text-slate-400" : "text-slate-500";
    const boxBg = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const boxBgActive = isDark ? "bg-[#2c2c2e]" : "bg-white";
    const borderDefault = isDark ? "border-[#2c2c2e]" : "border-slate-200";

    const headline = type === 'verification' ? 'Verify your email' : 'Check your email';

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className={`flex-1 ${bgClass}`}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View className="px-6 pt-16 pb-2 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-8 pt-8">
                <Text className={`${textClass} text-[32px] font-black tracking-tight leading-[38px] mb-2`}>{headline}</Text>
                <Text className={`${subtextClass} text-[15px] font-medium leading-relaxed mb-8`}>
                    We sent a 6-digit code to <Text className={`${textClass} font-bold`}>{email}</Text>.
                </Text>

                <View className="flex-row justify-between mb-6">
                    {code.map((digit, index) => {
                        const hasValue = digit !== '';
                        return (
                            <TextInput
                                key={index}
                                ref={el => { inputs.current[index] = el; }}
                                value={digit}
                                onChangeText={t => handleChange(t, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={6}
                                selectTextOnFocus
                                className={`w-[48px] h-[56px] text-center text-[22px] font-black rounded-xl border-2
                                    ${textClass}
                                `}
                                style={{
                                    backgroundColor: hasValue ? (isDark ? '#2c2c2e' : '#ffffff') : (isDark ? '#1c1c1e' : '#f1f5f9'),
                                    borderColor: hasValue ? '#D2B48C' : (isDark ? '#2c2c2e' : '#e2e8f0'),
                                }}
                            />
                        );
                    })}
                </View>

                {isLoading && (
                    <View className="items-center mb-4">
                        <ActivityIndicator color="#D2B48C" />
                    </View>
                )}

                {errorMsg ? (
                    <Text className="text-red-500 text-[14px] font-medium text-center mb-4">{errorMsg}</Text>
                ) : null}

                {resendSuccess ? (
                    <Text className="text-brand-primary text-[14px] font-medium text-center mb-4">{resendSuccess}</Text>
                ) : null}

                <View className="flex-row items-center justify-center mt-4">
                    <Text className={`${subtextClass} font-medium mr-1`}>Didn't get it?</Text>
                    <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isLoading}>
                        <Text className={`font-bold ${countdown > 0 ? 'text-slate-400' : 'text-brand-primary'}`}>
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
