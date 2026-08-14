import { View, TextInput, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';

export default function NameScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const { setOnboardingStep, setOnboardingData, updateUser, user } = useAuthStore();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    const handleNext = async () => {
        if (!name.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);

        try {
            setOnboardingData({ name: name.trim() });

            if (user) {
                try {
                    await api.patch('profile', { name: name.trim(), phone_number: '' });
                    updateUser({ name: name.trim() });
                } catch (e) {
                    console.error('Failed to update name on backend', e);
                }
            }

            router.push('/(onboarding)/education');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OnboardingShell
            step={1}
            title="What should we call you?"
            subtitle="Enter your display name. You can change this later."
            showBack={false}
            ctaTitle="Continue"
            ctaDisabled={!name.trim() || isLoading}
            ctaLoading={isLoading}
            onCta={handleNext}
            hasKeyboard
        >
            <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={s.inputContainer}>
                <TextInput
                    style={[s.input, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                        color: C.text,
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
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
        </OnboardingShell>
    );
}

const s = StyleSheet.create({
    inputContainer: {
        marginTop: 8,
    },
    input: {
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: 17,
        fontWeight: '600',
        borderWidth: 1.5,
    },
});
