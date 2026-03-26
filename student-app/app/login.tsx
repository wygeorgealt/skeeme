import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Xmark, Google, Apple } from 'iconoir-react-native';
import { PasswordField } from '@/components/ui/PasswordField';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { login, storedEmail } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    // Pre-fill stored email from previous session
    useEffect(() => {
        if (storedEmail) setEmail(storedEmail);
    }, [storedEmail]);

    const clearErrors = () => {
        setEmailError('');
        setPasswordError('');
    };

    const handleLogin = async () => {
        clearErrors();

        if (!email.trim()) {
            setEmailError('Please enter your email address.');
            return;
        }
        if (!password) {
            setPasswordError('Please enter your password.');
            return;
        }
        if (failedAttempts >= 5) {
            setPasswordError('Too many attempts. Please wait a moment before trying again.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('login', {
                email: email.trim().toLowerCase(),
                password,
                device_name: `${Platform.OS}_app`,
            });
            const { token, user } = response.data;
            login(user, token);
            setFailedAttempts(0);
            router.replace('/(drawer)');
        } catch (error: any) {
            setFailedAttempts(prev => prev + 1);
            const status = error.response?.status;
            if (status === 401 || status === 404 || status === 422) {
                setPasswordError('Incorrect email or password.');
            } else if (status === 429) {
                setPasswordError('Too many attempts. Please wait 1 minute.');
            } else {
                setPasswordError('Something went wrong. Check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const placeholderColor = isDark ? "#475569" : "#94a3b8";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.flex1}
        >
            <GlowBackground useSafeArea>
                <View style={s.header}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/hook')}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Xmark width={28} height={28} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={s.flex1}
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={s.heroSection}>
                        <Text style={[isDark ? s.textWhite : s.textSlate900, s.heroTitle]}>
                            Log in.
                        </Text>
                        <Text style={[isDark ? s.textSlate400 : s.textSlate500, s.heroSubtitle]}>
                            Enter your details to access your dashboard.
                        </Text>
                    </View>

                {/* Social Login 
                <View style={s.socialRow}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[s.socialBtn, isDark ? s.socialBtnDark : s.socialBtnLight]}
                    >
                        <Google width={18} height={18} color={isDark ? '#fff' : '#000'} />
                        <Text style={[s.fontBold, s.textSmall, isDark ? s.textWhite : s.textSlate900, { marginLeft: 12 }]}>Continue with Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[s.socialBtn, isDark ? s.bgWhite : s.bgSlate900]}
                        >
                            <Apple width={18} height={18} color={isDark ? '#000' : '#fff'} />
                            <Text style={[s.fontBold, s.textSmall, { marginLeft: 12 }, isDark ? s.textBlack : s.textWhite]}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>
                */}

                {/* Divider 
                <View style={s.dividerContainer}>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                    <Text style={[s.dividerText, isDark ? s.textSlate600 : s.textSlate400]}>or use email</Text>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                </View>
                */}

                {/* Email */}
                <View style={s.inputContainer}>
                    <View style={[s.inputWrapper, isDark ? s.bgSlate900 : s.bgTransparent, isDark ? s.borderSlate800 : s.borderSlate200, emailError ? s.borderRed500 : null]}>
                        <TextInput
                            style={[s.flex1, s.fontMedium, s.textSmall, s.inputHeight, { color: isDark ? 'white' : 'black' }]}
                            placeholder="Email address"
                            placeholderTextColor={placeholderColor}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                        />
                    </View>
                    {emailError ? <Text style={s.errorText}>{emailError}</Text> : null}
                </View>

                {/* Password */}
                <View style={s.passwordContainer}>
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); setPasswordError(''); }}
                    />
                    <View style={s.passwordFooter}>
                        {passwordError ? (
                            <Text style={s.errorTextSmall}>{passwordError}</Text>
                        ) : <View />}
                        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                            <Text style={s.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={s.spacer} />

                {/* Login Button */}
                <View style={s.btnContainer}>
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        style={[s.mainBtn, isLoading && s.opacity70]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.mainBtnText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/signup')} style={s.signupLink}>
                    <Text style={[isDark ? s.textSlate400 : s.textSlate500, s.fontBold, s.textSmall]}>
                        New to Skeeme? <Text style={s.textBrandPrimary}>Create account</Text>
                    </Text>
                </TouchableOpacity>

                {/* DEV ONLY Reset Removed */}
            </ScrollView>
            </GlowBackground>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 40, paddingTop: 16 },
    heroSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    socialRow: { gap: 12, marginBottom: 32 },
    socialBtn: { height: 52, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
    socialBtnDark: { backgroundColor: 'transparent', borderColor: '#1e293b' },
    socialBtnLight: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    
    bgWhite: { backgroundColor: 'white' },
    bgSlate900: { backgroundColor: '#0f172a' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    bgTransparent: { backgroundColor: 'transparent' },
    
    textWhite: { color: 'white' },
    textBlack: { color: 'black' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textSlate600: { color: '#475569' },
    textBrandPrimary: { color: '#8B5CF6' },
    
    fontBold: { fontWeight: '700' },
    fontMedium: { fontWeight: '500' },
    textSmall: { fontSize: 14 },
    textTiny: { fontSize: 10 },
    
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    dividerLine: { flex: 1, height: 0.5 },
    dividerText: { paddingHorizontal: 20, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
    
    inputContainer: { marginBottom: 4 },
    inputWrapper: { borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
    inputHeight: { height: 48 },
    borderSlate800: { borderColor: '#1e293b' },
    borderSlate200: { borderColor: '#e2e8f0' },
    borderRed500: { borderColor: '#ef4444' },
    errorText: { color: '#ef4444', fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 4 },
    
    passwordContainer: { marginBottom: 4, marginTop: 12 },
    passwordFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 },
    errorTextSmall: { color: '#ef4444', fontSize: 12, fontWeight: '500', flex: 1 },
    forgotPasswordText: { color: '#8B5CF6', fontWeight: '700', fontSize: 12 },
    
    spacer: { marginTop: 24 },
    btnContainer: { marginTop: 20 },
    mainBtn: { width: '100%', height: 52, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    mainBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    opacity70: { opacity: 0.7 },
    
    signupLink: { marginTop: 40, marginBottom: 32, alignItems: 'center' },
    devReset: { marginBottom: 40, alignItems: 'center' },
    devResetText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
});
