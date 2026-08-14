import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectionCard } from '@/components/onboarding/SelectionCard';

const GOALS = [
  { key: 'conceptual', label: 'Deep Dive', desc: 'First-principles and core theory.', iconSource: require('@/assets/3dicons/3dicons-lab-front-color.png') },
  { key: 'exam', label: 'Exam Prep', desc: 'High-yield tips, drills, traps.', iconSource: require('@/assets/3dicons/3dicons-medal-front-color.png') },
  { key: 'cheat', label: 'Cheat Sheet', desc: 'Mnemonics, recall, summaries.', iconSource: require('@/assets/3dicons/3dicons-bookmark-iso-color.png') },
];

export default function GoalScreen() {
  const router = useRouter();
  const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();
  const [selected, setSelected] = useState<string>(onboardingData?.academic_goal || '');

  useEffect(() => {
    setOnboardingStep(7);
  }, []);

  const handleSelect = (key: string) => {
    setSelected(key);
    setOnboardingData({ academic_goal: key });
  };

  const handleNext = () => {
    if (selected) router.push('/(onboarding)/birthday');
  };

  return (
    <OnboardingShell
      step={7}
      title="What's your study goal?"
      ctaDisabled={!selected}
      onCta={handleNext}
    >
      <View style={{ gap: 2 }}>
        {GOALS.map((g, index) => (
          <SelectionCard
            key={g.key}
            iconSource={g.iconSource}
            label={g.label}
            desc={g.desc}
            isSelected={selected === g.key}
            onPress={() => handleSelect(g.key)}
            index={index}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
