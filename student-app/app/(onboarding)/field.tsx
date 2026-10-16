import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const SUGGESTIONS = ['Computer Science', 'Medicine', 'Engineering', 'Business', 'Law', 'Economics'];
const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Programming', 'Chemistry', 'Biology', 'Data Structures'];

export default function FieldScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [fieldInput, setFieldInput] = useState('');
    const [major, setMajor] = useState<string | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics', 'Programming']);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectText, setNewSubjectText] = useState('');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

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

    const handleAddCustomSubject = () => {
        const trimmed = newSubjectText.trim();
        if (!trimmed) {
            setIsAddingSubject(false);
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (!availableSubjects.includes(trimmed)) {
            setAvailableSubjects(prev => [...prev, trimmed]);
        }
        if (!selectedSubjects.includes(trimmed)) {
            setSelectedSubjects(prev => [...prev, trimmed]);
        }
        setNewSubjectText('');
        setIsAddingSubject(false);
    };

    const handleNext = () => {
        if (!major && selectedSubjects.length === 0) return;
        
        setOnboardingData({ 
            field_of_study: major || fieldInput.trim() || 'Undeclared',
        });
        
        router.push('/(onboarding)/goal');
    };

    return (
        <OnboardingShell
            step={2}
            totalSteps={8}
            title="What do you study?"
            subtitle="Select your primary field and active subjects to calibrate your study plan."
            ctaDisabled={!major && selectedSubjects.length === 0}
            onCta={handleNext}
        >
            <View className="flex-col gap-6 pb-6">
                {/* Section 1: Major / Field of Study Card */}
                <View 
                    className="p-5 rounded-2xl flex-col gap-4"
                    style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }}
                >
                    <View className="flex-row items-center gap-2">
                        <Icon name="GraduationCap" size={20} color={major ? "primary" : "secondary"} />
                        <Text style={{ color: C.text }} className="text-[15px] font-semibold">Degree / Field of Study</Text>
                    </View>

                    {major ? (
                        <View 
                            className="flex-row items-center justify-between px-4 py-3 rounded-xl"
                            style={{
                                backgroundColor: isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF',
                                borderWidth: 1.5,
                                borderColor: '#007AFF',
                            }}
                        >
                            <View className="flex-row items-center gap-2 flex-1 mr-2">
                                <Icon name="BookOpen" size={18} color="primary" />
                                <Text style={{ color: '#007AFF' }} className="font-bold text-[15px] flex-1">
                                    {major}
                                </Text>
                            </View>
                            <Pressable 
                                onPress={removeMajor} 
                                className="w-8 h-8 items-center justify-center rounded-full active:opacity-60"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,122,255,0.12)' }}
                                accessibilityLabel="Change major"
                            >
                                <Icon name="X" size={16} color="primary" />
                            </Pressable>
                        </View>
                    ) : (
                        <View className="flex-col gap-3">
                            <View 
                                className="flex-row items-center px-3.5 h-13 rounded-xl"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F8FC',
                                    borderWidth: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                }}
                            >
                                <Icon name="Search" size={18} color="secondary" />
                                <TextInput
                                    className="flex-1 ml-2.5 text-[15px] font-medium"
                                    style={{ color: C.text }}
                                    placeholder="Search or enter major (e.g. Biology)..."
                                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                    value={fieldInput}
                                    onChangeText={setFieldInput}
                                    onSubmitEditing={() => {
                                        if (fieldInput.trim()) selectMajor(fieldInput.trim());
                                    }}
                                    returnKeyType="done"
                                />
                                {fieldInput.trim().length > 0 && (
                                    <Pressable 
                                        onPress={() => selectMajor(fieldInput.trim())}
                                        className="px-3 py-1.5 rounded-lg bg-accent-electric-blue active:opacity-80"
                                    >
                                        <Text className="text-white text-[13px] font-semibold">Select</Text>
                                    </Pressable>
                                )}
                            </View>

                            <View className="flex-col gap-2 mt-1">
                                <Text style={{ color: C.textSecondary }} className="text-[12px] font-semibold uppercase tracking-wider">
                                    Popular Fields
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {SUGGESTIONS.map(s => (
                                        <Pressable 
                                            key={s} 
                                            onPress={() => selectMajor(s)}
                                            className="px-3.5 py-2 rounded-full active:scale-95 transition-all"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F1F3F5',
                                                borderWidth: 1,
                                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <Text style={{ color: C.text }} className="text-[13px] font-medium">{s}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Section 2: Current Subjects Selection Card */}
                <View 
                    className="p-5 rounded-2xl flex-col gap-4"
                    style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Icon name="Layers" size={20} color="secondary" />
                            <Text style={{ color: C.text }} className="text-[15px] font-semibold">Active Subjects</Text>
                        </View>
                        <View 
                            className="px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#EBF5FF' }}
                        >
                            <Text className="text-[11px] font-bold text-accent-electric-blue">
                                {selectedSubjects.length} selected
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5">
                        {availableSubjects.map(sub => {
                            const isActive = selectedSubjects.includes(sub);
                            return (
                                <Pressable
                                    key={sub}
                                    onPress={() => toggleSubject(sub)}
                                    className="flex-row items-center px-4 py-2.5 rounded-xl transition-all active:scale-95"
                                    style={{
                                        backgroundColor: isActive 
                                            ? (isDark ? 'rgba(0,122,255,0.16)' : '#EBF5FF') 
                                            : (isDark ? 'rgba(255,255,255,0.06)' : '#F6F8FC'),
                                        borderWidth: 1.5,
                                        borderColor: isActive 
                                            ? '#007AFF' 
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                    }}
                                >
                                    <Text 
                                        style={{ 
                                            color: isActive ? '#007AFF' : C.text,
                                            fontWeight: isActive ? '700' : '500',
                                        }} 
                                        className="text-[14px]"
                                    >
                                        {sub}
                                    </Text>
                                </Pressable>
                            );
                        })}

                        {isAddingSubject ? (
                            <View 
                                className="flex-row items-center px-3 py-1.5 rounded-xl"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                                    borderWidth: 1.5,
                                    borderColor: '#007AFF',
                                    minWidth: 140,
                                }}
                            >
                                <TextInput
                                    className="text-[14px] font-medium p-0 flex-1 mr-2"
                                    style={{ color: C.text }}
                                    placeholder="Subject name"
                                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                    value={newSubjectText}
                                    onChangeText={setNewSubjectText}
                                    autoFocus
                                    onSubmitEditing={handleAddCustomSubject}
                                    returnKeyType="done"
                                />
                                <Pressable 
                                    onPress={handleAddCustomSubject}
                                    className="w-6 h-6 rounded-full bg-accent-electric-blue items-center justify-center"
                                >
                                    <Icon name="Check" size={14} color="white" />
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable 
                                onPress={() => setIsAddingSubject(true)}
                                className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl active:scale-95 transition-all"
                                style={{
                                    backgroundColor: isDark ? 'rgba(0,122,255,0.1)' : 'rgba(0,122,255,0.06)',
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    borderColor: isDark ? 'rgba(0,122,255,0.4)' : '#007AFF',
                                }}
                            >
                                <Icon name="Plus" size={16} color="primary" />
                                <Text className="font-semibold text-[13px] text-accent-electric-blue">Add Subject</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        </OnboardingShell>
    );
}
