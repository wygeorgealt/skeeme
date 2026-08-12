import { Text } from '@/components/ui/Text';
import { View, TextInput, useColorScheme, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';

import { Colors, FontSize } from '@/constants/theme';

export default function NameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const { setOnboardingStep, setOnboardingData, updateUser, user } = useAuthStore();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setOnboardingStep(1); // Set this as step 1
    }, []);

    const handleNext = async () => {
        if (!name.trim()) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);
        
        try {
            setOnboardingData({ name: name.trim() });
            
            // If user is logged in, immediately update their profile
            if (user) {
                try {
                    await api.patch('profile', { name: name.trim(), phone_number: '' });
                    updateUser({ name: name.trim() });
                } catch (e) {
                    console.error('Failed to update name on backend', e);
                    // We continue anyway so onboarding isn't blocked
                }
            }
            
            router.push('/(onboarding)/education');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[s.container, { backgroundColor: C.background }]}>
            <ScrollView 
                contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
            >
                <Animated.View entering={FadeInDown.duration(600).springify()} style={s.header}>
                    <Text style={[s.title, { color: C.text }]}>What should we call you?</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>
                        Enter your display name. You can change this later.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={s.inputContainer}>
                    <TextInput
                        style={[s.input, { 
                            backgroundColor: C.card,
                            color: C.text,
                            borderColor: C.separator
                        }]}
                        placeholder="Your name"
                        placeholderTextColor={C.textTertiary}
                        autoCapitalize="words"
                        autoFocus
                        value={name}
                        onChangeText={setName}
                        onSubmitEditing={handleNext}
                    />
                </Animated.View>
                
                <View style={{ flex: 1 }} />
                
                <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={s.footer}>
                    <AnimatedButton
                        title="Continue"
                        onPress={handleNext}
                        loading={isLoading}
                        disabled={!name.trim() || isLoading}
                        fullWidth
                        type="capsule"
                        backgroundColor={C.primary}
                        shadowColor="#0066D6"
                    />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: FontSize.title1,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSize.body,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 30,
    },
    input: {
        height: 60,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: FontSize.subhead,
        fontWeight: '600',
        borderWidth: 1,
    },
    footer: {
        marginTop: 'auto',
    }
});
