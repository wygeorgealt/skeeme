import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, useColorScheme, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { NavArrowLeft, Mail } from 'iconoir-react-native';
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
                const verifyRes = await api.post('auth/verify-account', { 
                    email, 
                    token,
                    device_name: `${Platform.OS}_app` 
                });
                
                const { user: authedUser, token: authToken } = verifyRes.data;
                const { login } = useAuthStore.getState();
                await login(authedUser, authToken);

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

    const headline = type === 'verification' ? 'Verify your email' : 'Check your email';

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <NavArrowLeft width={28} height={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <View style={[s.iconBox, isDark ? s.bgBrandPrimary10 : s.bgBrandPrimary10]}>
                    <Mail width={32} height={32} color="#8B5CF6" />
                </View>

                <View style={s.heroSection}>
                    <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                        {headline}.
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        We sent a 6-digit code to <Text style={[s.textBold, isDark ? s.textWhite : s.textSlate900]}>{email}</Text>.
                    </Text>
                </View>

                <View style={s.otpRow}>
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
                                style={[
                                    s.otpInput,
                                    isDark ? s.textWhite : s.textSlate900,
                                    {
                                        backgroundColor: isDark ? '#0f0f11' : 'transparent',
                                        borderColor: hasValue ? (isDark ? '#fff' : '#000') : (isDark ? '#1e293b' : '#e2e8f0'),
                                        borderWidth: hasValue ? 2 : 1,
                                    }
                                ]}
                            />
                        );
                    })}
                </View>

                {isLoading && (
                    <View style={s.loaderContainer}>
                        <ActivityIndicator color="#8B5CF6" />
                    </View>
                )}

                {errorMsg ? (
                    <View style={[s.alert, isDark ? s.alertErrorDark : s.alertErrorLight]}>
                        <Text style={[s.alertText, isDark ? s.textRed400 : s.textRed600]}>{errorMsg}</Text>
                    </View>
                ) : null}

                {resendSuccess ? (
                    <View style={s.alertSuccess}>
                        <Text style={s.textBrandPrimarySmall}>{resendSuccess}</Text>
                    </View>
                ) : null}

                <View style={s.resendRow}>
                    <Text style={[s.resendText, isDark ? s.textSlate400 : s.textSlate500]}>Didn't get it?</Text>
                    <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isLoading}>
                        <Text style={[s.resendLink, countdown > 0 ? s.textSlate400 : s.textBrandPrimary]}>
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    content: { flex: 1, paddingHorizontal: 40, paddingTop: 40 },
    
    iconBox: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    bgBrandPrimary10: { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
    
    heroSection: { marginBottom: 32 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    textBold: { fontWeight: '700' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    otpInput: { width: 48, height: 56, textAlign: 'center', fontSize: 20, fontWeight: '700', borderRadius: 18 },
    
    loaderContainer: { alignItems: 'center', marginBottom: 20 },
    
    alert: { padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1 },
    alertErrorLight: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
    alertErrorDark: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
    alertText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
    textRed600: { color: '#dc2626' },
    textRed400: { color: '#f87171' },
    
    alertSuccess: { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)', borderWidth: 1, padding: 16, borderRadius: 12, marginBottom: 20 },
    textBrandPrimarySmall: { color: '#8B5CF6', fontSize: 13, fontWeight: '500', textAlign: 'center' },
    
    resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    resendText: { fontWeight: '700', fontSize: 12, marginRight: 8 },
    resendLink: { fontWeight: '900', fontSize: 12 },
    textBrandPrimary: { color: '#8B5CF6' },
});
