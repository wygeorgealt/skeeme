import { Text } from '@/components/ui/Text';
import { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusBar } from 'expo-status-bar';
import { PasswordField } from '@/components/ui/PasswordField';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IosPillButton } from '@/components/ui/IosPillButton';

export default function NewPasswordScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
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

    const getPasswordStrength = (): { label: string; color: string; width: string } => {
        if (!password) return { label: '', color: 'transparent', width: '0%' };
        if (password.length < 6) return { label: 'Too weak', color: C.destructive, width: '20%' };
        if (password.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (score >= 2 && password.length >= 10) return { label: 'Strong', color: C.success, width: '100%' };
        if (score >= 1) return { label: 'Good', color: '#eab308', width: '70%' };
        return { label: 'Fair', color: '#f97316', width: '50%' };
    };
    const strength = getPasswordStrength();

    const handleReset = async () => {
        clearErrors();
        if (password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
        if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');

        setIsLoading(true);
        try {
            await api.post('auth/reset-password', {
                email,
                token,
                password,
                password_confirmation: confirmPassword
            });
            router.replace('/login?reset_success=true');
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={s.flex1}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex1}>
                <StatusBar style={isDark ? "light" : "dark"} />

                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={() => router.replace('/login')}>
                        <View style={[s.backBtn, { backgroundColor: C.card }]}>
                            <IconSymbol name="xmark" size={24} color={C.text} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[s.iconCircle, { backgroundColor: C.primaryLight }]}>
                        <IconSymbol name="key.fill" size={32} color={C.primary} />
                    </View>

                    <Text style={[s.title, { color: C.text }]}>Security</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        Create a strong password to protect your account.
                    </Text>

                    <View style={[s.groupedList, { backgroundColor: C.card }]}>
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>New</Text>
                            <PasswordField
                                value={password}
                                onChangeText={(t: string) => { setPassword(t); clearErrors(); }}
                                placeholder="Required"
                                inputStyle={[s.groupedInput, { color: C.text }]}
                                style={{ flex: 1 }}
                            />
                        </View>
                        <View style={[s.separator, { backgroundColor: C.separator }]} />
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Confirm</Text>
                            <PasswordField
                                value={confirmPassword}
                                onChangeText={(t: string) => { setConfirmPassword(t); clearErrors(); }}
                                placeholder="Required"
                                inputStyle={[s.groupedInput, { color: C.text }]}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {password.length > 0 && (
                        <View style={s.strengthArea}>
                            <View style={[s.strengthTrack, { backgroundColor: C.separator }]}>
                                <View style={{ width: strength.width as any, backgroundColor: strength.color, height: '100%', borderRadius: 4 }} />
                            </View>
                            <Text style={[s.strengthText, { color: strength.color }]}>{strength.label}</Text>
                        </View>
                    )}

                    {errorMsg ? (
                        <View style={[s.alert, { backgroundColor: C.destructive + '15', borderColor: C.destructive + '30' }]}>
                            <Text style={{ color: C.destructive, fontSize: 13, textAlign: 'center', fontWeight: '500' }}>{errorMsg}</Text>
                        </View>
                    ) : null}

                    <View style={{ height: Spacing.xl }} />

                    <IosPillButton
                        label="Reset Password"
                        onPress={handleReset}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 48, alignItems: 'center' },
    
    iconCircle: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
    
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, textAlign: 'center', marginBottom: Spacing.sm },
    subtitle: { fontSize: FontSize.body, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16, marginBottom: Spacing.xxl },

    groupedList: { borderRadius: Radius.lg, overflow: 'hidden', width: '100%', marginBottom: Spacing.md },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingRight: 8 },
    groupedLabel: { width: 100, fontSize: 16, fontWeight: '500', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 56 },
    separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },

    strengthArea: { width: '100%', paddingHorizontal: 4, marginBottom: Spacing.xl },
    strengthTrack: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden', marginBottom: 8 },
    strengthText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    
    alert: { width: '100%', padding: 16, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.sm },
});
