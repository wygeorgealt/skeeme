import { Text } from '@/components/ui/Text';
import { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, StyleSheet } from 'react-native';
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[s.flex1, isDark ? s.bgDark : s.bgLight]}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.replace('/login')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Xmark width={28} height={28} color={isDark ? '#fff' : '#000'} />
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
                        Security.
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        Create a strong password to protect your account.
                    </Text>
                </View>

                {/* Password */}
                <View style={s.inputContainer}>
                    <PasswordField
                        value={password}
                        onChangeText={(t: string) => { setPassword(t); clearErrors(); }}
                        placeholder="New password"
                    />
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

                {/* Confirm Password */}
                <View style={s.confirmContainer}>
                    <PasswordField
                        value={confirmPassword}
                        onChangeText={(t: string) => { setConfirmPassword(t); clearErrors(); }}
                        placeholder="Confirm new password"
                    />
                </View>

                {errorMsg ? (
                    <Text style={s.errorText}>{errorMsg}</Text>
                ) : null}

                <View style={s.spacer} />

                {/* Submit Button */}
                <View style={s.btnContainer}>
                    <TouchableOpacity
                        onPress={handleReset}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        style={[s.submitBtn, isLoading && s.opacity70]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.submitBtnText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 40, paddingTop: 16 },
    
    heroSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    
    inputContainer: { marginBottom: 16 },
    confirmContainer: { marginBottom: 8 },
    
    strengthContainer: { marginBottom: 24, marginLeft: 4 },
    strengthTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    strengthLabel: { fontSize: 10, fontWeight: '700', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
    
    errorText: { color: '#ef4444', fontSize: 13, fontWeight: '500', marginTop: 12, marginLeft: 4 },
    spacer: { height: 24 },
    btnContainer: { marginTop: 24, marginBottom: 40 },
    submitBtn: { width: '100%', height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    submitBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    opacity70: { opacity: 0.7 },
});
