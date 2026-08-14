import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const FIELDS = [
    { key: 'sciences', label: 'Sciences', iconSource: require('@/assets/3dicons/3dicons-lab-front-color.png') },
    { key: 'engineering', label: 'Engineering', iconSource: require('@/assets/3dicons/3dicons-setting-front-color.png') },
    { key: 'humanities', label: 'Humanities', iconSource: require('@/assets/3dicons/3dicons-folder-front-color.png') },
    { key: 'business', label: 'Business', iconSource: require('@/assets/3dicons/3dicons-wallet-front-color.png') },
    { key: 'law', label: 'Law', iconSource: require('@/assets/3dicons/3dicons-bookmark-iso-color.png') },
    { key: 'medicine', label: 'Medicine', iconSource: require('@/assets/3dicons/3dicons-plus-dynamic-color.png') },
    { key: 'other', label: 'Other', iconSource: require('@/assets/3dicons/3dicons-pin-front-color.png') },
];

export default function FieldScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(3);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ field_of_study: key });
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/style');
        }
    };

    return (
        <OnboardingShell
            step={3}
            title="What do you want to study?"
            ctaDisabled={!selected}
            onCta={handleNext}
        >
            <View style={{ gap: 2 }}>
                {FIELDS.map((field, index) => (
                    <SelectionCard
                        key={field.key}
                        iconSource={field.iconSource}
                        label={field.label}
                        isSelected={selected === field.key}
                        onPress={() => handleSelect(field.key)}
                        index={index}
                    />
                ))}
            </View>
        </OnboardingShell>
    );
}
