import { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { AltArrowLeft, CloseCircle, Gallery, Letter } from '@solar-icons/react-native/Bold';


import { Text } from '@/components/ui/Text';

export default function SupportScreen() {
    const router = useRouter();

    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { user } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [message, setMessage] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setScreenshot(result.assets[0].uri);
        }
    };

    const removeScreenshot = () => {
        setScreenshot(null);
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            return Alert.alert('Required', 'Please describe what happened so we can help.');
        }

        if (message.length < 10) {
            return Alert.alert('Too short', 'Please provide a bit more detail (at least 10 characters).');
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('message', message.trim());

            if (screenshot) {
                const filename = screenshot.split('/').pop() || 'screenshot.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('screenshot', {
                    uri: screenshot,
                    name: filename,
                    type,
                } as any);
            }

            await api.post('support/contact', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Message Sent', 'Our support team will get back to you shortly.', [
                { text: 'Okay', onPress: () => router.navigate({ pathname: '/(drawer)/account' }) }
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
            style={{ flex: 1, backgroundColor: C.background }}
        >
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <Animated.View key={`header-${animKey}`} entering={FadeInUp.duration(500)} style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <TouchableOpacity
                    onPress={() => router.navigate({ pathname: '/(drawer)/account' })}
                    activeOpacity={0.7}
                    style={[s.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}
                >
                    <AltArrowLeft size={24} color={C.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Support</Text>
                <View style={{ width: 44 }} />
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 110 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View key={`hero-${animKey}`} entering={FadeInDown.delay(80).duration(400)}>
                    <Text style={[s.heroTitle, { color: C.text }]}>
                        How can we help?
                    </Text>
                    <Text style={[s.heroSubtitle, { color: C.textSecondary }]}>
                        Describe the issue or feedback below
                    </Text>
                </Animated.View>

                <Animated.View key={`card-${animKey}`} entering={FadeInDown.delay(160).duration(400)} style={[s.card, { backgroundColor: C.card, borderColor: C.separator }]}>
                    <TextInput
                        style={[
                            s.textArea,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: C.separator, color: C.text }
                        ]}
                        placeholder="Describe your issue or feedback..."
                        placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    {/* Screenshot Attachment */}
                    <Text style={[s.inputLabel, { color: C.textSecondary }]}>Screenshot (optional)</Text>
                    {screenshot ? (
                        <View style={s.screenshotPreview}>
                            <Image source={{ uri: screenshot }} style={s.screenshotImage} resizeMode="cover" />
                            <TouchableOpacity
                                onPress={removeScreenshot}
                                activeOpacity={0.7}
                                style={s.removeScreenshotBtn}
                            >
                                <CloseCircle size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={pickImage}
                            activeOpacity={0.7}
                            style={[
                                s.attachBtn,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: C.separator }
                            ]}
                        >
                            <Gallery size={22} color={isDark ? '#6b7280' : '#94a3b8'} />
                            <Text style={[s.attachBtnText, { color: isDark ? '#9ca3af' : '#64748b' }]}>
                                Add a screenshot
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                        style={[s.submitBtn, { backgroundColor: C.primary }, isSubmitting && { opacity: 0.7 }]}
                    >
                        {isSubmitting ? (
                            <LoadingSpinner size={24} color="white" strokeWidth={3} />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Letter size={18} color="white" />

                                <View style={{ width: 10 }} />
                                <Text style={s.submitBtnText}>Send Message</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700' },

    heroTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
    heroSubtitle: { fontSize: 16, lineHeight: 22, marginBottom: 32 },

    card: { borderRadius: Radius.lg, padding: 20, borderWidth: StyleSheet.hairlineWidth },

    userInfoBadge: { alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.1)' },
    userInfoText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
    userInfoSub: { fontSize: 13, marginTop: 2 },

    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginLeft: 4 },
    textArea: { height: 160, borderRadius: 16, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, fontSize: 16, fontWeight: '500', borderWidth: StyleSheet.hairlineWidth, marginBottom: 24 },

    // Screenshot attachment
    attachBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    attachBtnText: { fontSize: 15, fontWeight: '600' },

    screenshotPreview: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    screenshotImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    removeScreenshotBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    submitBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    submitBtnText: { fontWeight: '700', fontSize: 16, color: '#fff' },
});