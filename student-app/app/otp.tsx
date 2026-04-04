import { Text } from '@/components/ui/Text';
import { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, useColorScheme, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { NavArrowLeft, Mail } from 'iconoir-react-native';
import { StatusBar } from 'expo-status-bar';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IosPillButton } from '@/components/ui/IosPillButton';

export default function OtpScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { email, type } = useLocalSearchParams<{ email: string, type: 'verification' | 'password_reset' }>();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [resendSuccess, setResendSuccess] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(0);

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

                // Show Paywall/Upgrade screen immediately after account creation
                router.replace('/upgrade');
            } else {
                router.replace(`/new-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed. Please try again.';
            setErrorMsg(msg);
            
            if (msg.includes('Too many') || msg.includes('expired')) {
                setCode(['', '', '', '', '', '']);
                inputs.current[0]?.focus();
                setCountdown(0);
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
                setErrorMsg('Failed to resend code.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GlowBackground style={s.flex1}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex1}>
                <StatusBar style={isDark ? "light" : "dark"} />

                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <View style={[s.backBtn, { backgroundColor: C.card }]}>
                            <NavArrowLeft width={24} height={24} color={C.text} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[s.iconCircle, { backgroundColor: C.primaryLight }]}>
                        <Mail width={32} height={32} color={C.primary} strokeWidth={2} />
                    </View>

                    <Text style={[s.title, { color: C.text }]}>Check your email</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        We've sent a 6-digit code to <Text style={{ color: C.text, fontWeight: '700' }}>{email}</Text>.
                    </Text>

                    <View style={s.otpRow}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={el => { inputs.current[index] = el; }}
                                value={digit}
                                onChangeText={t => handleChange(t, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                onFocus={() => setFocusedIndex(index)}
                                keyboardType="number-pad"
                                maxLength={6}
                                selectTextOnFocus
                                style={[
                                    s.otpInput,
                                    { 
                                        color: C.text,
                                        backgroundColor: C.card,
                                        borderColor: focusedIndex === index ? C.primary : (digit ? C.primaryLight : C.separator),
                                        borderWidth: (focusedIndex === index || digit) ? 2 : 1.5,
                                    }
                                ]}
                            />
                        ))}
                    </View>

                    {errorMsg ? (
                        <View style={[s.alert, { backgroundColor: C.destructive + '15', borderColor: C.destructive + '30' }]}>
                            <Text style={{ color: C.destructive, fontSize: 13, textAlign: 'center', fontWeight: '500' }}>{errorMsg}</Text>
                        </View>
                    ) : null}

                    {resendSuccess ? (
                        <View style={[s.alert, { backgroundColor: C.successLight, borderColor: C.success + '30' }]}>
                            <Text style={{ color: C.success, fontSize: 13, textAlign: 'center', fontWeight: '500' }}>{resendSuccess}</Text>
                        </View>
                    ) : null}

                    <View style={s.resendContainer}>
                        <Text style={[s.resendText, { color: C.textSecondary }]}>Didn't receive the code?</Text>
                        <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isLoading}>
                            <Text style={[s.resendLink, { color: countdown > 0 ? C.textTertiary : C.primary }]}>
                                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: Spacing.xl }} />

                    <IosPillButton
                        label="Verify Code"
                        onPress={() => verifyCode(code.join(''))}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </GlowBackground>
    );
}

const SCREEN_W = Dimensions.get('window').width;

const s = StyleSheet.create({
    flex1: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 48, alignItems: 'center' },
    
    iconCircle: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
    
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, textAlign: 'center', marginBottom: Spacing.sm },
    subtitle: { fontSize: FontSize.body, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16, marginBottom: Spacing.xxl },
    
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10, marginBottom: Spacing.xl },
    otpInput: { width: (SCREEN_W - (Spacing.xl * 2) - 50) / 6, height: 60, borderRadius: Radius.md, textAlign: 'center', fontSize: 24, fontWeight: '700' },
    
    alert: { width: '100%', padding: 16, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.lg },
    
    resendContainer: { alignItems: 'center', marginBottom: Spacing.xl },
    resendText: { fontSize: 13, marginBottom: 4 },
    resendLink: { fontSize: 15, fontWeight: '700' },
});
