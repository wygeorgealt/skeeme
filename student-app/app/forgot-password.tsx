import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { NavArrowLeft } from 'iconoir-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            await api.post('otp/send', { email: email.trim().toLowerCase(), type: 'password_reset' });
        } catch (e: any) {
            // Silently proceed to prevent enumeration. 
            // If they are on cooldown, the OTP screen handles it anyway.
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

    const placeholderColor = isDark ? "#475569" : "#94a3b8";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[s.flex1, isDark ? s.bgDark : s.bgLight]}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <NavArrowLeft width={28} height={28} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <View style={s.heroSection}>
                    <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                        Reset.
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        Enter your email and we'll send you a 6-digit reset code.
                    </Text>
                </View>

                <View style={s.inputContainer}>
                    <View style={[
                        s.inputWrapper, 
                        isDark ? s.bgDark : s.bgTransparent,
                        isDark ? s.borderSlate800 : s.borderSlate200
                    ]}>
                        <TextInput
                            style={[s.textInput, { color: isDark ? 'white' : 'black' }]}
                            placeholder="Email address"
                            placeholderTextColor={placeholderColor}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <View style={s.btnContainer}>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={isLoading || !email.trim()}
                        activeOpacity={0.9}
                        style={[s.submitBtn, (isLoading || !email.trim()) && s.opacity70]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.submitBtnText}>Send Reset Code</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    bgTransparent: { backgroundColor: 'transparent' },
    
    header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
    content: { flex: 1, paddingHorizontal: 40, paddingTop: 40 },
    
    heroSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    
    inputContainer: { marginBottom: 24 },
    inputWrapper: { borderRadius: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
    borderSlate800: { borderColor: '#1e293b' },
    borderSlate200: { borderColor: '#e2e8f0' },
    textInput: { flex: 1, fontWeight: '500', fontSize: 15, height: 56 },
    
    btnContainer: { marginTop: 16 },
    submitBtn: { width: '100%', height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    submitBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    opacity70: { opacity: 0.7 },
});
