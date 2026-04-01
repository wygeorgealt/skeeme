import { Text } from '@/components/ui/Text';
import { useState } from 'react';
import {
    View, TextInput, TouchableOpacity, KeyboardAvoidingView,
    Platform, ScrollView, useColorScheme, StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { PasswordField } from '@/components/ui/PasswordField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

export default function SignupScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ from?: string }>();
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
        if (password.length < 6) return { label: 'Too weak', color: C.destructive, pct: 15 };
        if (password.length < 8) return { label: 'Weak', color: '#FF9500', pct: 35 };
        const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
        if (score >= 2 && password.length >= 10) return { label: 'Strong', color: C.success, pct: 100 };
        if (score >= 1) return { label: 'Good', color: '#FF9500', pct: 65 };
        return { label: 'Fair', color: '#FF9500', pct: 45 };
    };
    const strength = getPasswordStrength();

    const handleSignup = async () => {
        setNameError(''); setEmailError(''); setPasswordError('');
        let hasError = false;
        if (!name.trim()) { setNameError('Please enter your full name.'); hasError = true; }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Please enter a valid email.'); hasError = true; }
        if (!password || password.length < 8) { setPasswordError('Password must be at least 8 characters.'); hasError = true; }
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
            });
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: C.background }}>
                {/* Back button */}
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/hook')}
                    style={[s.backBtn, { top: insets.top + 8 }]}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                    <Ionicons name="chevron-back" size={20} color={C.textSecondary} />
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={[s.scroll, { paddingTop: insets.top + 72 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[s.title, { color: C.text }]}>Create account</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>Join Skeeme and study 5× faster</Text>

                    <View style={[s.groupedList, { backgroundColor: C.card }]}>
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
                                style={{ flex: 1, paddingRight: 4 }}
                                inputStyle={s.groupedInput}
                                placeholder="Required"
                            />
                        </View>
                    </View>

                    {/* Footer / Errors */}
                    <View style={s.listFooter}>
                        {(!!nameError || !!emailError || !!passwordError) ? (
                            <View style={{ flex: 1 }}>
                                {!!nameError && <Text style={[s.errorFooter, { color: C.destructive }]}>{nameError}</Text>}
                                {emailError === 'exists' ? (
                                    <Text style={[s.errorFooter, { color: C.destructive }]}>
                                        Account already exists.{' '}
                                        <Text onPress={() => router.push('/login')} style={{ color: C.primary, fontWeight: '600' }}>Log in →</Text>
                                    </Text>
                                ) : !!emailError && (
                                    <Text style={[s.errorFooter, { color: C.destructive }]}>{emailError}</Text>
                                )}
                                {!!passwordError && <Text style={[s.errorFooter, { color: C.destructive }]}>{passwordError}</Text>}
                            </View>
                        ) : password.length > 0 ? (
                            <View style={s.strengthRow}>
                                <View style={[s.strengthTrack, { backgroundColor: C.cardSecondary, flex: 1 }]}>
                                    <View style={{ width: `${strength.pct}%`, height: '100%', backgroundColor: strength.color, borderRadius: 4 }} />
                                </View>
                                <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                            </View>
                        ) : <View style={{ height: 20 }} />}
                    </View>

                    <View style={{ height: Spacing.md }} />

                    <IosPillButton label="Create Account" onPress={handleSignup} loading={isLoading} fullWidth size="lg" />

                    <TouchableOpacity onPress={() => router.push('/login')} style={s.loginRow}>
                        <Text style={[s.signupText, { color: C.textSecondary }]}>
                            Already have an account?{' '}
                            <Text style={[s.signupText, { color: C.primary, fontWeight: '600' }]}>Log in</Text>
                        </Text>
                    </TouchableOpacity>

                    <Text style={[s.terms, { color: C.textTertiary }]}>
                        By creating an account you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    backBtn: { position: 'absolute', left: Spacing.lg, zIndex: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 48 },
    logoCircle: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, alignSelf: 'center' },
    title: { fontSize: FontSize.title1, fontWeight: '700', letterSpacing: -0.5, textAlign: 'center', marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.subhead, textAlign: 'center', marginBottom: Spacing.xl },
    
    groupedList: { borderRadius: 10, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 12 },
    groupedLabel: { width: 100, fontSize: 16, fontWeight: '400', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 44 },
    separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
    
    listFooter: { marginTop: 8, paddingHorizontal: 16, minHeight: 20 },
    errorFooter: { fontSize: 13, fontWeight: '400', marginBottom: 4 },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    strengthTrack: { height: 4, borderRadius: 4, overflow: 'hidden' },
    strengthLabel: { fontSize: FontSize.caption2, fontWeight: '600', width: 60, textAlign: 'right' },
    loginRow: { marginTop: Spacing.xl, alignItems: 'center' },
    signupText: { fontSize: FontSize.subhead },
    terms: { fontSize: FontSize.caption2, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
});
