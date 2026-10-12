import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const LEVELS = [
    { key: 'high_school', label: 'High School', desc: 'Grades 9 – 12 prep', icon: 'backpack' },
    { key: 'undergraduate', label: 'University', desc: 'Undergraduate', icon: 'menu-book' },
    { key: 'graduate', label: 'Grad School', desc: 'Masters & PhD focus', icon: 'school' },
    { key: 'professional', label: 'Professional', desc: 'Certifications & career', icon: 'work' },
];

export default function NameScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData, updateUser, user } = useAuthStore();
    const [name, setName] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('undergraduate');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    const handleSelectLevel = (key: string) => {
        Haptics.selectionAsync();
        setSelectedLevel(key);
    };

    const handleNext = async () => {
        if (!name.trim() || !selectedLevel) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);

        try {
            setOnboardingData({ 
                name: name.trim(),
                education_level: selectedLevel 
            });

            if (user) {
                try {
                    await api.patch('profile', { name: name.trim(), phone_number: '' });
                    updateUser({ name: name.trim() });
                } catch (e) {
                    console.error('Failed to update name on backend', e);
                }
            }

            // In Stitch design, step 2 goes straight to what do you study (field of study).
            router.push('/(onboarding)/field');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OnboardingShell
            step={1}
            totalSteps={9}
            title="Let's get to know you"
            subtitle="Personalize Skeeme to calibrate study paces, synthetic flashcards, and peer academic tone."
            ctaTitle="Continue"
            ctaDisabled={!name.trim()}
            ctaLoading={isLoading}
            onCta={handleNext}
            showBack={true}
            hasKeyboard
        >
            <View className="flex-col gap-8">
                {/* Section 1: Name Input */}
                <View className="flex-col gap-2">
                    <View className="flex-row items-center gap-1">
                        <Text className="text-[14px] font-semibold text-on-surface">What should we call you?</Text>
                        <Text className="text-accent-electric-blue text-[10px]">●</Text>
                    </View>
                    
                    <View className="relative w-full rounded-2xl bg-surface-container-low transition-colors focus-within:bg-surface-container-lowest focus-within:shadow-sm flex-row items-center h-14 border border-transparent focus-within:border-accent-electric-blue/20">
                        <View className="absolute left-4 z-10">
                            <MaterialIcons name="badge" size={22} color="#8e8e93" />
                        </View>
                        <TextInput
                            className="flex-1 h-full pl-12 pr-11 text-[17px] text-on-surface font-semibold"
                            placeholder="Your preferred name"
                            placeholderTextColor="#8e8e93"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                        {name.length > 0 && (
                            <Pressable 
                                onPress={() => setName('')}
                                className="absolute right-3 w-8 h-8 rounded-full items-center justify-center active:bg-surface-container"
                            >
                                <Ionicons name="close-circle" size={20} color="#8e8e93" />
                            </Pressable>
                        )}
                    </View>
                    <Text className="text-[13px] text-outline pl-1 mt-1">This will appear on your collaborative boards and session digests.</Text>
                </View>

                {/* Section 2: Study Level Selection */}
                <View className="flex-col gap-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[14px] font-semibold text-on-surface">What level are you studying at?</Text>
                        <View className="bg-primary-container px-2.5 py-1 rounded-full">
                            <Text className="text-[11px] font-bold text-accent-electric-blue">Adaptive Pace</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {LEVELS.map((level, idx) => {
                            const isSelected = selectedLevel === level.key;
                            return (
                                <Pressable
                                    key={level.key}
                                    onPress={() => handleSelectLevel(level.key)}
                                    className={`w-[48%] relative flex-col justify-between p-4 rounded-2xl bg-surface-container-lowest transition-all ${
                                        isSelected ? 'shadow-md border border-accent-electric-blue/10' : 'shadow-sm border border-transparent'
                                    }`}
                                >
                                    <View className="flex-row items-center justify-between w-full mb-3">
                                        <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                                            isSelected ? 'bg-primary-container' : 'bg-surface-container'
                                        }`}>
                                            <MaterialIcons 
                                                name={level.icon as any} 
                                                size={22} 
                                                color={isSelected ? '#007aff' : '#48484a'} 
                                            />
                                        </View>
                                        <View className={`w-6 h-6 rounded-full items-center justify-center ${
                                            isSelected ? 'bg-accent-electric-blue shadow-sm' : 'bg-surface-container'
                                        }`}>
                                            {isSelected && <MaterialIcons name="check" size={16} color="#ffffff" />}
                                        </View>
                                    </View>
                                    <View className="flex-col gap-0.5">
                                        <Text className="text-[16px] font-semibold text-on-surface leading-tight">{level.label}</Text>
                                        <Text className="text-[13px] text-on-surface-variant line-clamp-1" numberOfLines={1}>{level.desc}</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
