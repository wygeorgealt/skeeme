import { Text } from '@/components/ui/Text';
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!email.trim()) return setError('Please enter your email address.');
        setError('');
        setIsLoading(true);
        try {
            await api.post('otp/send', { email: email.trim().toLowerCase(), type: 'password_reset' });
        } catch (e: any) {
            // Silently proceed or handle generic error
        } finally {
            setIsLoading(false);
            router.push({
                pathname: '/otp',
                params: {
                    email: email.trim().toLowerCase(),
                    type: 'password_reset'
                }
            });
        }
    };

    return (
        <View style={s.flex1}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={s.flex1}
            >
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header with Back Button */}
                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[s.backBtn, { backgroundColor: C.card }]}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <IconSymbol name="chevron.left" size={24} color={C.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={s.heroSection}>
                        <Text style={[s.heroTitle, { color: C.text }]}>Reset Password</Text>
                        <Text style={[s.heroSubtitle, { color: C.textSecondary }]}>
                            Enter your email address and we'll send you a 6-digit code to reset your account.
                        </Text>
                    </View>

                    {/* Form Grouped Item */}
                    <View style={[s.groupedList, { backgroundColor: C.card }]}>
                        <View style={s.groupedRow}>
                            <Text style={[s.groupedLabel, { color: C.text }]}>Email</Text>
                            <TextInput
                                style={[s.groupedInput, { color: C.text }]}
                                placeholder="you@example.com"
                                placeholderTextColor={C.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={t => { setEmail(t); setError(''); }}
                            />
                        </View>
                    </View>

                    {error ? (
                        <Text style={[s.errorText, { color: C.destructive }]}>{error}</Text>
                    ) : null}

                    <View style={{ height: Spacing.xl }} />

                    <IosPillButton
                        label="Send Reset Code"
                        onPress={handleSend}
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
    
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 48 },
    
    heroSection: { marginBottom: Spacing.xxl },
    heroTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, marginBottom: Spacing.sm },
    heroSubtitle: { fontSize: FontSize.body, lineHeight: 24, opacity: 0.8 },
    
    groupedList: { borderRadius: Radius.lg, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingRight: 16 },
    groupedLabel: { width: 80, fontSize: 16, fontWeight: '500', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 56 },
    
    errorText: { marginTop: Spacing.sm, fontSize: 13, paddingHorizontal: 4 },
});
