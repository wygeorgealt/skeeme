import { Text } from '@/components/ui/Text';
import { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { IosPillButton } from '@/components/ui/IosPillButton';
import { AltArrowLeft } from '@solar-icons/react-native/Bold';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ForgotPasswordScreen() {
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

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!email.trim()) return setError('Please enter your email address.');
        setError('');
        setIsLoading(true);
        try {
            await api.post('otp/send', { email: email.trim().toLowerCase(), type: 'password_reset' });
            // API responded (200/201) — proceed to OTP regardless of whether the email
            // exists (avoids email enumeration while still giving transport feedback).
            router.push({
                pathname: '/otp',
                params: {
                    email: email.trim().toLowerCase(),
                    type: 'password_reset'
                }
            });
        } catch (e: any) {
            const isNetworkOrServer = !e.response || (e.response?.status >= 500);
            if (isNetworkOrServer) {
                // Transport failure: server unreachable or crashed — safe to tell the user.
                setError("We couldn't send that right now. Check your connection and try again.");
            } else {
                // 4xx (e.g. 422 validation) — still proceed to OTP screen; the server
                // returned a structured response so the request itself succeeded.
                router.push({
                    pathname: '/otp',
                    params: {
                        email: email.trim().toLowerCase(),
                        type: 'password_reset'
                    }
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={s.flex1} key={`forgot-${animKey}`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={s.flex1}
            >
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header with Back Button */}
                <Animated.View key={`header-${animKey}`} entering={FadeInUp.duration(400)} style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[s.backBtn, { backgroundColor: C.card }]}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <AltArrowLeft size={24} color={C.text} />
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView 
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View key={`hero-${animKey}`} entering={FadeInDown.delay(80).duration(400)} style={s.heroSection}>
                        <Text style={[s.heroTitle, { color: C.text }]}>Reset Password</Text>
                        <Text style={[s.heroSubtitle, { color: C.textSecondary }]}>
                            Enter your email address and we&apos;ll send you a 6-digit code to reset your account.
                        </Text>
                    </Animated.View>

                    {/* Form Grouped Item */}
                    <Animated.View key={`form-${animKey}`} entering={FadeInDown.delay(140).duration(400)} style={[s.groupedList, { backgroundColor: C.card }]}>
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
                    </Animated.View>

                    {error ? (
                        <Text style={[s.errorText, { color: C.destructive }]}>{error}</Text>
                    ) : null}

                    <View style={{ height: Spacing.xl }} />

                    <Animated.View key={`cta-${animKey}`} entering={FadeInDown.delay(220).duration(400)}>
                        <IosPillButton
                            label="Send Reset Code"
                        onPress={handleSend}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />
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
    heroTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', letterSpacing: -1, marginBottom: Spacing.sm },
    heroSubtitle: { fontSize: FontSize.body, lineHeight: 24, opacity: 0.8 },
    
    groupedList: { borderRadius: Radius.lg, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingRight: 16 },
    groupedLabel: { width: 80, fontSize: 16, fontWeight: '500', paddingLeft: 16 },
    groupedInput: { flex: 1, fontSize: 16, height: 56 },
    
    errorText: { marginTop: Spacing.sm, fontSize: 13, paddingHorizontal: 4 },
});
