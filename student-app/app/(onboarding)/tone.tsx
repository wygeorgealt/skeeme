import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const TONES = [
    { key: 'supportive', label: 'Supportive', iconSource: require('@/assets/3dicons/3dicons-trophy-front-color.png') },
    { key: 'strict', label: 'Strict', iconSource: require('@/assets/3dicons/3dicons-medal-front-color.png') },
    { key: 'concise', label: 'Concise', iconSource: require('@/assets/3dicons/3dicons-clock-front-color.png') },
    { key: 'fun', label: 'Fun & Witty', iconSource: require('@/assets/3dicons/3dicons-bookmark-fav-front-color.png') },
];

export default function ToneScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string>(onboardingData?.tone || onboardingData?.ai_tone || '');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ tone: key });
    };

    const handleNext = () => {
        if (selected) router.push('/(onboarding)/analogy');
    };

    return (
        <OnboardingShell
            step={5}
            title="How should your tutor feel?"
            ctaDisabled={!selected}
            onCta={handleNext}
        >
            <View style={{ gap: 2 }}>
                {TONES.map((t, index) => (
                    <SelectionCard
                        key={t.key}
                        iconSource={t.iconSource}
                        label={t.label}
                        isSelected={selected === t.key}
                        onPress={() => handleSelect(t.key)}
                        index={index}
                    />
                ))}
            </View>
        </OnboardingShell>
    );
}
