import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const ANALOGIES = [
  { key: 'general', label: 'Academic', iconSource: require('@/assets/3dicons/3dicons-folder-front-color.png') },
  { key: 'tech', label: 'Tech', iconSource: require('@/assets/3dicons/3dicons-setting-front-color.png') },
  { key: 'sports', label: 'Sports', iconSource: require('@/assets/3dicons/3dicons-trophy-front-color.png') },
  { key: 'gaming', label: 'Gaming', iconSource: require('@/assets/3dicons/3dicons-flash-front-color.png') },
  { key: 'pop_culture', label: 'Pop Culture', iconSource: require('@/assets/3dicons/3dicons-sun-dynamic-color.png') },
];

export default function AnalogyScreen() {
  const router = useRouter();
  const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();
  const [selected, setSelected] = useState<string>(onboardingData?.analogy_focus || '');

  useEffect(() => {
    setOnboardingStep(6);
  }, []);

  const handleSelect = (key: string) => {
    setSelected(key);
    setOnboardingData({ analogy_focus: key });
  };

  const handleNext = () => {
    if (selected) router.push('/(onboarding)/goal' as any);
  };

  return (
    <OnboardingShell
      step={6}
      title="How should it explain tough stuff?"
      ctaDisabled={!selected}
      onCta={handleNext}
    >
      <View style={{ gap: 2 }}>
        {ANALOGIES.map((a, index) => (
          <SelectionCard
            key={a.key}
            iconSource={a.iconSource}
            label={a.label}
            isSelected={selected === a.key}
            onPress={() => handleSelect(a.key)}
            index={index}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
