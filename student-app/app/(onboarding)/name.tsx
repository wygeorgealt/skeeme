import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const LEVELS = [
    { key: 'high_school', label: 'High School', desc: 'Grades 9 – 12', icon: 'BookOpen' },
    { key: 'undergraduate', label: 'University', desc: 'Undergraduate degree', icon: 'Book' },
    { key: 'graduate', label: 'Grad School', desc: 'Masters & PhD', icon: 'GraduationCap' },
    { key: 'professional', label: 'Professional', desc: 'Certifications & career', icon: 'Briefcase' },
];

export default function NameScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData, updateUser, user } = useAuthStore();
    const [name, setName] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('undergraduate');
    const [isLoading, setIsLoading] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

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

            router.push('/(onboarding)/field');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OnboardingShell
            step={1}
            totalSteps={8}
            title="What's your name?"
            subtitle="Let's set up your profile and personalize your workspace."
            ctaTitle="Continue"
            ctaDisabled={!name.trim()}
            ctaLoading={isLoading}
            onCta={handleNext}
            showBack={true}
            hasKeyboard
        >
            <View className="flex-col gap-6">
                {/* Section 1: Name Input */}
                <View className="flex-col gap-2">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Your Name</Text>
                    
                    <View 
                        className="relative w-full rounded-2xl flex-row items-center h-14"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F8FC',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        }}
                    >
                        <View className="absolute left-4 z-10">
                            <Icon name="User" size={20} color="secondary" />
                        </View>
                        <TextInput
                            className="flex-1 h-full pl-12 pr-11 text-[16px] font-semibold"
                            style={{ color: C.text }}
                            placeholder="Enter your name"
                            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                        {name.length > 0 && (
                            <Pressable 
                                onPress={() => setName('')}
                                className="absolute right-3 w-8 h-8 rounded-full items-center justify-center active:opacity-60"
                            >
                                <Icon name="XCircle" size={18} color="secondary" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Section 2: Study Level Selection */}
                <View className="flex-col gap-3">
                    <Text style={{ color: C.text }} className="text-[14px] font-semibold">Current Level</Text>

                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {LEVELS.map((level) => {
                            const isSelected = selectedLevel === level.key;
                            return (
                                <Pressable
                                    key={level.key}
                                    onPress={() => handleSelectLevel(level.key)}
                                    className="w-[48%] relative flex-col justify-between p-4 rounded-2xl active:scale-[0.98] transition-all"
                                    style={{
                                        backgroundColor: isSelected 
                                            ? (isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF') 
                                            : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                                        borderWidth: 1.5,
                                        borderColor: isSelected 
                                            ? '#007AFF' 
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                        minHeight: 124,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between w-full mb-3">
                                        <View 
                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? (isDark ? 'rgba(0,122,255,0.22)' : '#D8E2FF') 
                                                    : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F3F5')
                                            }}
                                        >
                                            <Icon 
                                                name={level.icon as any} 
                                                size={20} 
                                                color={isSelected ? 'primary' : 'default'} 
                                            />
                                        </View>
                                    </View>
                                    <View className="flex-col gap-0.5">
                                        <Text 
                                            style={{ color: isSelected ? '#007AFF' : C.text }} 
                                            className="text-[15px] font-semibold leading-snug"
                                        >
                                            {level.label}
                                        </Text>
                                        <Text 
                                            style={{ color: C.textSecondary }} 
                                            className="text-[12px] leading-tight mt-0.5"
                                        >
                                            {level.desc}
                                        </Text>
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
