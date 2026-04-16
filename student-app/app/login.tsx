import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { PasswordField } from '@/components/ui/PasswordField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login, storedEmail } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    useEffect(() => {
        if (storedEmail) setEmail(storedEmail);
    }, [storedEmail]);

    const handleLogin = async () => {
        setEmailError(''); setPasswordError('');
        if (!email.trim()) return setEmailError('Please enter your email address.');
        if (!password) return setPasswordError('Please enter your password.');
        if (failedAttempts >= 5) return setPasswordError('Too many attempts. Please wait a moment.');

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
                
                {/* Close button */}
                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/entry')}
                        style={[s.closeBtn, { backgroundColor: C.card }]}
                        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    >
                        <IconSymbol name="xmark" size={20} color={C.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={s.heroSection}>
                        <Text style={[s.title, { color: C.text }]}>Welcome back</Text>
                        <Text style={[s.subtitle, { color: C.textSecondary }]}>Sign in to continue to Skeeme</Text>
                    </View>

                    <View style={[s.groupedList, { backgroundColor: C.card }]}>
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Email</Text>
                            <TextInput
                                style={[s.groupedInput, { color: C.text }]}
                                placeholder=""
                                placeholderTextColor={C.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
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
                                placeholder=""
                            />
                        </View>
                    </View>

                    {/* Footer / Errors */}
                    <View style={s.listFooter}>
                        <View style={{ flex: 1 }}>
                            {(!!emailError || !!passwordError) && (
                                <Text style={[s.errorFooter, { color: C.destructive }]}>
                                    {emailError || passwordError}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.7}>
                            <Text style={[s.forgotLink, { color: C.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: Spacing.xl }} />

                    <IosPillButton
                        label="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />

                    <TouchableOpacity onPress={() => router.push('/signup')} style={s.signupRow}>
                        <Text style={[s.signupText, { color: C.textSecondary }]}>
                            New to Skeeme?{' '}
                            <Text style={[s.signupText, { color: C.primary, fontWeight: '700' }]}>Create account</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    closeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
    
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 48 },
    
    heroSection: { marginBottom: Spacing.xxl },
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, textAlign: 'center', marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.body, textAlign: 'center', opacity: 0.8 },
    
    groupedList: { borderRadius: Radius.lg, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingRight: 8 },
    groupedLabel: { width: 100, fontSize: 16, fontWeight: '500', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 56 },
    separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
    
    listFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4, minHeight: 20 },
    errorFooter: { fontSize: 13, fontWeight: '500' },
    forgotLink: { fontSize: 13, fontWeight: '600' },

    signupRow: { marginTop: Spacing.xxl, alignItems: 'center' },
    signupText: { fontSize: FontSize.subhead },
});
