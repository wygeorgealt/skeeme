import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
    Platform, ActivityIndicator, useColorScheme, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavArrowLeft, Mail } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            return Alert.alert('Required', 'Please describe what happened so we can help.');
        }

        if (message.length < 10) {
            return Alert.alert('Too short', 'Please provide a bit more detail (at least 10 characters).');
        }

        setIsSubmitting(true);
        try {
            await api.post('support/contact', { message: message.trim() });
            Alert.alert('Message Sent', 'Our support team will get back to you shortly.', [
                { text: 'Okay', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Send Failed', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <GlowBackground>
                {/* Header */}
                <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={[s.backBtn, isDark ? s.backBtnDark : s.backBtnLight]}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <NavArrowLeft width={24} height={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Contact Support</Text>
                    <View style={{ width: 40 }} /> {/* spacer for center alignment */}
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                        How can we help?
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        Describe the issue or feedback below. We will reply to your registered email address.
                    </Text>

                    <View style={[s.card, isDark ? s.cardDark : s.cardLight]}>
                        <View style={s.userInfoBadge}>
                            <Text style={s.userInfoText}>
                                Sending as <Text style={{ fontWeight: '700' }}>{user?.name}</Text> ({user?.email})
                            </Text>
                        </View>

                        <Text style={s.inputLabel}>What Happened?</Text>
                        <TextInput
                            style={[
                                s.textArea,
                                isDark ? s.inputDark : s.inputLight
                            ]}
                            placeholder="Please describe your issue, bug, or feature request in detail..."
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                            style={[s.submitBtn, isSubmitting && { opacity: 0.7 }]}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Mail width={18} height={18} color="white" style={{ marginRight: 8 }} />
                                    <Text style={s.submitBtnText}>Send Message</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </GlowBackground>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    backBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent' },
    backBtnLight: { backgroundColor: '#fff', borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    heroTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22, marginBottom: 32 },

    card: { borderRadius: 24, padding: 24, borderWidth: 1 },
    cardDark: { backgroundColor: 'rgba(15,23,42,0.4)', borderColor: 'rgba(255,255,255,0.1)' },
    cardLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },

    userInfoBadge: { backgroundColor: 'rgba(139,92,246,0.1)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 24 },
    userInfoText: { color: '#8B5CF6', fontSize: 13, fontWeight: '500', textAlign: 'center' },

    inputLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    textArea: { height: 160, borderRadius: 16, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, fontSize: 15, fontWeight: '500', borderWidth: 1, marginBottom: 24 },
    inputDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' },
    inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#0f172a' },

    submitBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    submitBtnText: { fontWeight: '700', fontSize: 15, color: '#fff' },

    textWhite: { color: '#fff' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
});
