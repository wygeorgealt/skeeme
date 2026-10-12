import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SUGGESTIONS = ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Law'];
const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Programming', 'Chemistry', 'Biology', 'Data Structures'];

export default function FieldScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [fieldInput, setFieldInput] = useState('');
    const [major, setMajor] = useState<string | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics', 'Programming']);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>(DEFAULT_SUBJECTS);

    useEffect(() => {
        setOnboardingStep(2);
    }, []);

    const selectMajor = (m: string) => {
        Haptics.selectionAsync();
        setMajor(m);
        setFieldInput('');
    };

    const removeMajor = () => {
        Haptics.selectionAsync();
        setMajor(null);
    };

    const toggleSubject = (sub: string) => {
        Haptics.selectionAsync();
        if (selectedSubjects.includes(sub)) {
            setSelectedSubjects(prev => prev.filter(s => s !== sub));
        } else {
            setSelectedSubjects(prev => [...prev, sub]);
        }
    };

    const handleNext = () => {
        if (!major && selectedSubjects.length === 0) return;
        
        setOnboardingData({ 
            field_of_study: major || fieldInput || 'Undeclared',
            // subjects could be stored in a new state property if added to the store later
        });
        
        router.push('/(onboarding)/goal');
    };

    return (
        <OnboardingShell
            step={2}
            totalSteps={9}
            title="What do you study?"
            subtitle="We'll tailor your practice sets and quizzes precisely to your curriculum."
            ctaDisabled={!major && selectedSubjects.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-6">
                {/* Field of study */}
                <View className="flex-col gap-2.5">
                    <Text className="text-[14px] font-semibold text-on-surface">Field of study</Text>
                    <View className="min-h-[48px] px-3 py-1.5 rounded-2xl bg-surface-container-low flex-row flex-wrap items-center gap-2">
                        {major && (
                            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-electric-blue shadow-sm">
                                <MaterialIcons name="school" size={18} color="#ffffff" />
                                <Text className="font-semibold text-[14px] text-on-primary">{major}</Text>
                                <Pressable onPress={removeMajor} className="w-5 h-5 items-center justify-center rounded-full opacity-80 active:opacity-50">
                                    <MaterialIcons name="close" size={16} color="#ffffff" />
                                </Pressable>
                            </View>
                        )}
                        {!major && (
                            <TextInput
                                className="flex-1 min-w-[120px] text-[15px] text-on-surface py-2"
                                placeholder="Add or search major..."
                                placeholderTextColor="#8e8e93"
                                value={fieldInput}
                                onChangeText={setFieldInput}
                                onSubmitEditing={() => {
                                    if (fieldInput.trim()) selectMajor(fieldInput.trim());
                                }}
                            />
                        )}
                    </View>
                    
                    {!major && (
                        <View className="flex-row items-center">
                            <Text className="text-[11px] font-bold text-outline mr-2 shrink-0">Suggestions:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 py-1">
                                <View className="flex-row gap-2">
                                    {SUGGESTIONS.map(s => (
                                        <Pressable 
                                            key={s} 
                                            onPress={() => selectMajor(s)}
                                            className="px-3 py-1.5 rounded-full bg-surface-container active:scale-95 transition-all"
                                        >
                                            <Text className="text-[11px] font-bold text-on-surface-variant">{s}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Social Proof Stats */}
                {major && (
                    <Animated.View entering={FadeInDown.duration(300)} className="p-3.5 rounded-2xl bg-surface-container-low flex-row items-center justify-between shadow-sm">
                        <View className="flex-row items-center gap-3 shrink-1 mr-2">
                            <View className="flex-row -space-x-2 shrink-0">
                                <View className="w-8 h-8 rounded-full bg-accent-electric-blue items-center justify-center border border-surface-container-low"><Text className="text-[11px] font-bold text-white">CS</Text></View>
                                <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center border border-surface-container-low"><Text className="text-[11px] font-bold text-white">AL</Text></View>
                                <View className="w-8 h-8 rounded-full bg-tertiary items-center justify-center border border-surface-container-low"><Text className="text-[11px] font-bold text-white">MK</Text></View>
                            </View>
                            <Text className="text-[13px] text-on-surface flex-shrink">
                                <Text className="font-semibold text-accent-electric-blue">3,420 students</Text> on Skeeme also study {major}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest shrink-0">
                            <View className="w-2 h-2 rounded-full bg-green-500" />
                            <Text className="text-[11px] font-bold text-on-surface-variant">Active</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Subjects Selection */}
                <View className="flex-col gap-2.5 mt-2">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[14px] font-semibold text-on-surface">What subjects are you taking?</Text>
                        <Text className="text-[11px] font-bold text-accent-electric-blue">{selectedSubjects.length} selected</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {availableSubjects.map(sub => {
                            const isActive = selectedSubjects.includes(sub);
                            return (
                                <Pressable
                                    key={sub}
                                    onPress={() => toggleSubject(sub)}
                                    className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all active:scale-95 ${
                                        isActive ? 'bg-accent-electric-blue shadow-sm' : 'bg-surface-container-low'
                                    }`}
                                >
                                    <MaterialIcons 
                                        name="check" 
                                        size={18} 
                                        color={isActive ? '#ffffff' : 'transparent'} 
                                    />
                                    <Text className={`font-semibold text-[14px] ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                                        {sub}
                                    </Text>
                                </Pressable>
                            );
                        })}
                        <Pressable 
                            className="flex-row items-center gap-1 px-3.5 py-2 rounded-xl bg-primary-container active:scale-95 transition-all"
                            // In real app, this would open a modal to add a subject. We just toggle 'New Subject' for demo.
                            onPress={() => {
                                Haptics.selectionAsync();
                                if (!availableSubjects.includes('New Subject')) {
                                    setAvailableSubjects([...availableSubjects, 'New Subject']);
                                    setSelectedSubjects([...selectedSubjects, 'New Subject']);
                                }
                            }}
                        >
                            <MaterialIcons name="add" size={18} color="#007aff" />
                            <Text className="font-semibold text-[14px] text-accent-electric-blue">Add Subject</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
