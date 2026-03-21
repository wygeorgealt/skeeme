import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { NavArrowLeft, Google, Apple } from 'iconoir-react-native';
import { StatusBar } from 'expo-status-bar';
import { PasswordField } from '@/components/ui/PasswordField';

export default function SignupScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const params = useLocalSearchParams<{ from?: string }>();
    const isFromOnboarding = params.from === 'onboarding';
    const { login, onboardingData } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Inline errors
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const clearErrors = () => { setNameError(''); setEmailError(''); setPasswordError(''); };

    // Password strength
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

    const handleSignup = async () => {
        clearErrors();
        let hasError = false;

        if (!name.trim()) { setNameError('Please enter your full name.'); hasError = true; }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Please enter a valid email address.'); hasError = true; }
        if (!password || password.length < 8) { setPasswordError('Password must be at least 8 characters.'); hasError = true; }
        if (hasError) return;

        setIsLoading(true);
        try {
            const response = await api.post('register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                password_confirmation: password,
                device_name: `${Platform.OS}_app`,
                // Pass onboarding prefs if available
                ...(onboardingData?.education_level && { education_level: onboardingData.education_level }),
                ...(onboardingData?.field_of_study && { field_of_study: onboardingData.field_of_study }),
                ...(onboardingData?.learning_style && { learning_style: onboardingData.learning_style }),
            });

            const { token, user } = response.data;
            await login(user, token);

            // Navigate to OTP verification screen instead of direct entry
            router.replace({
                pathname: '/otp',
                params: {
                    email: email.trim().toLowerCase(),
                    type: 'verification'
                }
            });
        } catch (error: any) {
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 422) {
                // Validation errors
                const errors = data?.errors || {};
                if (errors.email) {
                    if (errors.email[0]?.includes('already')) {
                        setEmailError('');
                        // Show custom inline message for existing account
                        setEmailError('exists');
                    } else {
                        setEmailError(errors.email[0]);
                    }
                }
                if (errors.password) setPasswordError(errors.password[0]);
                if (errors.name) setNameError(errors.name[0]);
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
            style={[s.flex1, isDark ? s.bgDark : s.bgLight]}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/hook')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <NavArrowLeft width={28} height={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={s.scrollView} 
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={s.heroSection}>
                    <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                        Join Skeeme.
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        Create an account to start studying 5x faster.
                    </Text>
                </View>

                {/* Social Login */}
                <View style={[s.socialRow, { marginBottom: 32 }]}>
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
                            style={[s.socialBtn, isDark ? s.bgWhite : s.bgSlate900, { marginTop: 12 }]}
                        >
                            <Apple width={18} height={18} color={isDark ? '#000' : '#fff'} />
                            <Text style={[s.fontBold, s.textSmall, { marginLeft: 12 }, isDark ? s.textBlack : s.textWhite]}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View style={s.dividerContainer}>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                    <Text style={[s.dividerText, isDark ? s.textSlate600 : s.textSlate400]}>or use email</Text>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                </View>

                {/* Full Name */}
                <View style={s.inputContainer}>
                    <View style={[
                        s.inputWrapper, 
                        isDark ? s.bgDark : s.bgTransparent,
                        isDark ? s.borderSlate800 : s.borderSlate200,
                        nameError ? s.borderRed : null
                    ]}>
                        <TextInput
                            style={[s.textInput, { color: isDark ? 'white' : 'black' }]}
                            placeholder="Full name"
                            placeholderTextColor={placeholderColor}
                            autoCapitalize="words"
                            value={name}
                            onChangeText={(t) => { setName(t); setNameError(''); }}
                        />
                    </View>
                    {nameError ? <Text style={s.errorText}>{nameError}</Text> : null}
                </View>

                {/* Email */}
                <View style={s.inputContainer}>
                    <View style={[
                        s.inputWrapper, 
                        isDark ? s.bgDark : s.bgTransparent,
                        isDark ? s.borderSlate800 : s.borderSlate200,
                        emailError ? s.borderRed : null
                    ]}>
                        <TextInput
                            style={[s.textInput, { color: isDark ? 'white' : 'black' }]}
                            placeholder="Email address"
                            placeholderTextColor={placeholderColor}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                        />
                    </View>
                    {emailError === 'exists' ? (
                        <View style={s.errorRow}>
                            <Text style={s.errorText}>An account with this email already exists. </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={s.linkText}>Log in →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : emailError ? (
                        <Text style={s.errorText}>{emailError}</Text>
                    ) : null}
                </View>

                {/* Password */}
                <View style={s.passwordContainer}>
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); setPasswordError(''); }}
                    />
                    {passwordError ? (
                        <Text style={s.errorText}>{passwordError}</Text>
                    ) : null}
                </View>

                {/* Password Strength */}
                {password.length > 0 && (
                    <View style={s.strengthContainer}>
                        <View style={[s.strengthTrack, isDark ? s.bgSlate800 : s.bgSlate100]}>
                            <View style={{ width: strength.width as any, backgroundColor: strength.color, height: '100%', borderRadius: 4 }} />
                        </View>
                        <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                    </View>
                )}

                <View style={s.spacer} />

                {/* Signup Button */}
                <View style={s.btnContainer}>
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        style={[s.submitBtn, isLoading && s.opacity70]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.submitBtnText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/login')} style={s.loginLink}>
                    <Text style={[s.loginLinkText, isDark ? s.textSlate400 : s.textSlate500]}>
                        Already have an account? <Text style={s.linkText}>Log in</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    bgTransparent: { backgroundColor: 'transparent' },
    
    header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 40, paddingTop: 16 },
    
    heroSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate50: { color: '#f8fafc' },
    textSlate500: { color: '#64748b' },
    textSlate600: { color: '#475569' },
    textSlate400: { color: '#94a3b8' },
    
    inputContainer: { marginBottom: 16 },
    inputWrapper: { borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
    borderSlate800: { borderColor: '#1e293b' },
    borderSlate200: { borderColor: '#e2e8f0' },
    borderRed: { borderColor: '#ef4444' },
    textInput: { flex: 1, fontWeight: '500', fontSize: 15, height: 48 },
    errorText: { color: '#ef4444', fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 4 },
    errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 4 },
    linkText: { color: '#8B5CF6', fontWeight: '700' },
    
    passwordContainer: { marginBottom: 8 },
    strengthContainer: { marginBottom: 20, marginLeft: 4 },
    strengthTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    strengthLabel: { fontSize: 10, fontWeight: '700', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
    
    spacer: { height: 16 },
    btnContainer: { marginTop: 24 },
    submitBtn: { width: '100%', height: 52, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    submitBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    opacity70: { opacity: 0.7 },
    
    loginLink: { marginTop: 40, marginBottom: 32, alignItems: 'center' },
    loginLinkText: { fontWeight: '700', fontSize: 13 },

    socialRow: { width: '100%' },
    socialBtn: { height: 52, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
    socialBtnDark: { backgroundColor: 'transparent', borderColor: '#1e293b' },
    socialBtnLight: { backgroundColor: 'white', borderColor: '#f1f5f9' },
    bgWhite: { backgroundColor: 'white' },
    bgSlate900: { backgroundColor: '#0f172a' },
    fontBold: { fontWeight: '700' },
    textSmall: { fontSize: 14 },
    textBlack: { color: 'black' },
    
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    dividerLine: { flex: 1, height: 0.5 },
    dividerText: { paddingHorizontal: 20, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
});
