import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: "Break it down like I'm new to this topic.",
        iconSource: require('@/assets/3dicons/3dicons-sun-dynamic-color.png'),
    },
    {
        key: 'detailed',
        label: 'Detailed & Academic',
        desc: 'Give me the full exam-level answer.',
        iconSource: require('@/assets/3dicons/3dicons-location-dynamic-color.png'),
    },
];

export default function StyleScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(4);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ learning_style: key });
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/tone' as any);
        }
    };

    return (
        <OnboardingShell
            step={4}
            title="What kind of explanations do you like?"
            ctaDisabled={!selected}
            onCta={handleNext}
        >
            <View style={{ gap: 2 }}>
                {STYLES.map((style, index) => (
                    <SelectionCard
                        key={style.key}
                        iconSource={style.iconSource}
                        label={style.label}
                        desc={style.desc}
                        isSelected={selected === style.key}
                        onPress={() => handleSelect(style.key)}
                        index={index}
                        iconSize={28}
                    />
                ))}
            </View>
        </OnboardingShell>
    );
}
