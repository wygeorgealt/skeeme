import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const LEVELS = [
    { key: 'high_school', label: 'High School', iconSource: require('@/assets/3dicons/3dicons-bookmark-fav-front-color.png'), desc: 'Secondary / A-Levels' },
    { key: 'undergraduate', label: 'Undergraduate', iconSource: require('@/assets/3dicons/3dicons-folder-front-color.png'), desc: "Bachelor's degree" },
    { key: 'masters_phd', label: 'Masters / PhD', iconSource: require('@/assets/3dicons/3dicons-lab-front-color.png'), desc: 'Postgraduate research' },
    { key: 'professional', label: 'Professional Cert', iconSource: require('@/assets/3dicons/3dicons-trophy-front-color.png'), desc: 'ICAN, ACCA, PMP, etc.' },
];

export default function EducationScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(2);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ education_level: key });
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/field');
        }
    };

    return (
        <OnboardingShell
            step={2}
            title="What's your learning level?"
            ctaDisabled={!selected}
            onCta={handleNext}
        >
            <View style={{ gap: 2 }}>
                {LEVELS.map((level, index) => (
                    <SelectionCard
                        key={level.key}
                        iconSource={level.iconSource}
                        label={level.label}
                        desc={level.desc}
                        isSelected={selected === level.key}
                        onPress={() => handleSelect(level.key)}
                        index={index}
                    />
                ))}
            </View>
        </OnboardingShell>
    );
}
