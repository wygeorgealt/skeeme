import { Text } from '@/components/ui/Text';
import { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { PasswordField } from '@/components/ui/PasswordField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { AltArrowLeft } from '@solar-icons/react-native/Bold';

import { StatusBar } from 'expo-status-bar';
import { posthog, isPostHogEnabled } from '@/lib/posthog';
import { openLegalLink, PRIVACY_URL, TERMS_URL } from '@/lib/legalLinks';

export default function SignupScreen() {
    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login, onboardingData } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const getPasswordStrength = () => {
        if (!password) return { label: '', color: 'transparent', pct: 0 };
        if (password.length < 8) return { label: 'Too weak', color: C.destructive, pct: 15 };
        if (password.length < 10) return { label: 'Weak', color: '#FF9500', pct: 35 };
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score === 3 && password.length >= 10) return { label: 'Strong', color: C.success, pct: 100 };
        if (score >= 2) return { label: 'Good', color: '#FF9500', pct: 65 };
        return { label: 'Fair', color: '#FF9500', pct: 45 };
    };
    const strength = getPasswordStrength();

    const handleSignup = async () => {
        setNameError(''); setEmailError(''); setPasswordError('');
        let hasError = false;
        if (!name.trim()) { setNameError('Please enter your full name.'); hasError = true; }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Please enter a valid email.'); hasError = true; }
        
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        if (!password || password.length < 10 || !hasUpper || !hasNumber || !hasSpecial) {
            setPasswordError('Password must be at least 10 characters and contain uppercase, number, and special character.');
            hasError = true;
        }
        if (hasError) return;

        setIsLoading(true);
        try {
            await api.post('register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                password_confirmation: password,
                device_name: `${Platform.OS}_app`,
                ...(onboardingData?.education_level && { education_level: onboardingData.education_level }),
                ...(onboardingData?.field_of_study && { field_of_study: onboardingData.field_of_study }),
                ...(onboardingData?.learning_style && { learning_style: onboardingData.learning_style }),
                ...(onboardingData?.dob_month && { dob_month: onboardingData.dob_month }),
                ...(onboardingData?.dob_year && { dob_year: onboardingData.dob_year }),
                ...(onboardingData?.age && { age: onboardingData.age }),
            });
            if (isPostHogEnabled) {
                posthog.capture('account_created');
            }
            router.replace({ pathname: '/otp', params: { email: email.trim().toLowerCase(), type: 'verification' } });
        } catch (error: any) {
            const status = error.response?.status;
            const errors = error.response?.data?.errors || {};
            if (status === 422) {
                if (errors.email) setEmailError(errors.email[0]?.includes('already') ? 'exists' : errors.email[0]);
                if (errors.password) setPasswordError(errors.password[0]);
                if (errors.name) setNameError(errors.name[0]);
            } else {
                setPasswordError('Something went wrong. Check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={s.flex1}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex1}>
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header with Back Button */}
                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/auth-select')}
                        style={[s.backBtn, { backgroundColor: C.card }]}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <AltArrowLeft size={24} color={C.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View key={`hero-${animKey}`} entering={FadeInUp.duration(500)} style={s.heroSection}>
                        <Text style={[s.title, { color: C.text }]}>Create account</Text>
                        <Text style={[s.subtitle, { color: C.textSecondary }]}>Join Skeeme and study 5× faster</Text>
                    </Animated.View>

                    <Animated.View key={`grouped-${animKey}`} entering={FadeInDown.delay(80).duration(400)} style={[s.groupedList, { backgroundColor: C.card }]}> 
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Name</Text>
                            <TextInput
                                style={[s.groupedInput, { color: C.text }]}
                                placeholder="Your full name"
                                placeholderTextColor={C.textTertiary}
                                autoCapitalize="words"
                                value={name}
                                onChangeText={t => { setName(t); setNameError(''); }}
                            />
                        </View>
                        <View style={[s.separator, { backgroundColor: C.separator }]} />
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Email</Text>
                            <TextInput
                                style={[s.groupedInput, { color: C.text }]}
                                placeholder="you@example.com"
                                placeholderTextColor={C.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={t => { setEmail(t); setEmailError(''); }}
                            />
                        </View>
                        <View style={[s.separator, { backgroundColor: C.separator }]} />
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Password</Text>
                            <PasswordField
                                value={password}
                                onChangeText={(t: string) => { setPassword(t); setPasswordError(''); }}
                                style={{ flex: 1 }}
                                inputStyle={[s.groupedInput, { color: C.text }]}
                                placeholder="Required"
                            />
                        </View>
                        <View style={[s.separator, { backgroundColor: C.separator }]} />
                    </Animated.View>

                    {/* Footer / Errors / Strength */}
                    <Animated.View key={`footer-${animKey}`} entering={FadeInDown.delay(160).duration(400)} style={s.listFooter}>
                        {(!!nameError || !!emailError || !!passwordError) ? (
                            <View style={{ flex: 1 }}>
                                {!!nameError && <Text style={[s.errorFooter, { color: C.destructive }]}>{nameError}</Text>}
                                {emailError === 'exists' ? (
                                    <Text style={[s.errorFooter, { color: C.destructive }]}>
                                        Account already exists.{' '}
                                        <Text onPress={() => router.push('/login')} style={{ color: C.primary, fontWeight: '700' }}>Log in →</Text>
                                    </Text>
                                ) : !!emailError && (
                                    <Text style={[s.errorFooter, { color: C.destructive }]}>{emailError}</Text>
                                )}
                                {!!passwordError && <Text style={[s.errorFooter, { color: C.destructive }]}>{passwordError}</Text>}
                            </View>
                        ) : password.length > 0 ? (
                            <View style={s.strengthArea}>
                                <View style={[s.strengthTrack, { backgroundColor: C.separator }]}>
                                    <View style={{ width: `${strength.pct}%`, height: '100%', backgroundColor: strength.color, borderRadius: 4 }} />
                                </View>
                                <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                            </View>
                        ) : <View style={{ height: 20 }} />}
                    </Animated.View>

                    <View style={{ height: Spacing.xl }} />

                    <Animated.View key={`cta-${animKey}`} entering={FadeInDown.delay(240).duration(400)}>
                        <IosPillButton 
                            label="Create Account" 
                            onPress={handleSignup} 
                            loading={isLoading} 
                            fullWidth 
                            size="lg" 
                        />
                    </Animated.View>

                    <Animated.View key={`login-${animKey}`} entering={FadeInDown.delay(320).duration(400)}>
                        <TouchableOpacity onPress={() => router.push('/login')} style={s.loginRow}>
                            <Text style={[s.signupText, { color: C.textSecondary }]}>
                                Already have an account?{' '}
                                <Text style={[s.signupText, { color: C.primary, fontWeight: '700' }]}>Log in</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View key={`terms-${animKey}`} entering={FadeInDown.delay(360).duration(400)}>
                        <Text style={[s.terms, { color: C.textTertiary }]}>
                            By creating an account you agree to our{' '}
                            <Text
                                style={[s.linkText, { color: C.primary }]}
                                onPress={() => openLegalLink(TERMS_URL)}
                            >
                                Terms of Service
                            </Text>
                            {' '}and confirm you have read our{' '}
                            <Text
                                style={[s.linkText, { color: C.primary }]}
                                onPress={() => openLegalLink(PRIVACY_URL)}
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 48 },
    
    heroSection: { marginBottom: Spacing.xxl },
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, textAlign: 'center', marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.body, textAlign: 'center', opacity: 0.8 },
    
    groupedList: { borderRadius: Radius.lg, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingRight: 8 },
    groupedLabel: { width: 100, fontSize: 16, fontWeight: '500', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 56 },
    separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
    
    listFooter: { marginTop: 12, paddingHorizontal: 16, minHeight: 20 },
    errorFooter: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    
    strengthArea: { width: '100%' },
    strengthTrack: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden', marginBottom: 8 },
    strengthLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    loginRow: { marginTop: Spacing.xxl, alignItems: 'center' },
    signupText: { fontSize: FontSize.subhead },
    terms: { fontSize: FontSize.caption2, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18, paddingHorizontal: 24 },
    linkText: { fontWeight: '600' },
});
