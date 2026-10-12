import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

const GOALS = [
    { key: 'deep-learning', label: 'Really Understand It', desc: 'Learn how things work from the ground up with deep explanations.', emoji: '🧠' },
    { key: 'exam-prep', label: 'Ace My Exams', desc: 'Focus on high-yield test topics, rubrics, and practice drills.', emoji: '📝', recommended: true },
    { key: 'quick-revision', label: 'Quick Revision', desc: 'Distilled summaries, cheat formulas, and rapid visual memory cues.', emoji: '⚡' },
];

export default function ExamDateScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [selectedGoal, setSelectedGoal] = useState<string>('exam-prep');
    const [hasExam, setHasExam] = useState<boolean>(true);
    const [courseName, setCourseName] = useState('');
    const [date, setDate] = useState(new Date(Date.now() + 18 * 24 * 60 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

    const handleSelectGoal = (key: string) => {
        Haptics.selectionAsync();
        setSelectedGoal(key);
    };

    const handleNext = () => {
        if (!selectedGoal) return;
        
        setOnboardingData({ 
            // exam goal logic
            next_exam_title: hasExam ? courseName : null,
            next_exam_date: hasExam ? date.toISOString().split('T')[0] : null,
        } as any);
        
        router.push('/(onboarding)/notifications');
    };

    return (
        <OnboardingShell
            step={7}
            totalSteps={9}
            title="What are you studying for?"
            subtitle="Set your core target so Skeeme optimizes daily quiz lengths and flashcard difficulty."
            ctaDisabled={!selectedGoal}
            onCta={handleNext}
            hasKeyboard
        >
            <View className="flex-col gap-6 pb-4">
                
                {/* Primary Goal Cards */}
                <View className="flex-col gap-3">
                    {GOALS.map((g, index) => {
                        const isSelected = selectedGoal === g.key;
                        return (
                            <Animated.View key={g.key} entering={FadeInUp.delay(index * 40).duration(300)}>
                                <Pressable
                                    onPress={() => handleSelectGoal(g.key)}
                                    className={`relative p-4 rounded-xl flex-row items-start gap-3.5 transition-all active:scale-[0.99] ${
                                        isSelected 
                                            ? 'bg-surface-container-lowest shadow-md border border-accent-electric-blue' 
                                            : 'bg-surface-container-lowest shadow-sm border border-transparent hover:shadow-md'
                                    }`}
                                >
                                    <View className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        isSelected ? 'bg-primary-container' : 'bg-surface-container-low'
                                    }`}>
                                        <Text className="text-[24px]">{g.emoji}</Text>
                                    </View>
                                    <View className="flex-1 pr-6">
                                        <View className="flex-row items-center gap-1.5 mb-0.5">
                                            <Text className="font-semibold text-[16px] text-on-surface">{g.label}</Text>
                                            {g.recommended && (
                                                <View className="px-2 py-0.5 rounded-full bg-primary-container">
                                                    <Text className="text-[11px] font-bold text-accent-electric-blue">Recommended</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-[13px] text-on-surface-variant leading-relaxed">{g.desc}</Text>
                                    </View>
                                    
                                    <View className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-accent-electric-blue' : 'bg-surface-container-high'
                                    }`}>
                                        <MaterialIcons name="check" size={16} color={isSelected ? '#ffffff' : 'transparent'} style={{ fontWeight: 'bold' as any }} />
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Exam Segmented Control */}
                <View className="flex-col gap-3 pt-2">
                    <Text className="text-[16px] font-semibold text-on-surface">Do you have an exam coming up?</Text>
                    
                    <View className="p-1 rounded-full bg-surface-container-high flex-row items-center gap-1">
                        <Pressable 
                            onPress={() => { Haptics.selectionAsync(); setHasExam(true); }}
                            className={`flex-1 py-2 px-3 rounded-full flex-row items-center justify-center gap-1.5 transition-all ${
                                hasExam ? 'bg-surface-container-lowest shadow-sm' : ''
                            }`}
                        >
                            {hasExam && <View className="w-2 h-2 rounded-full bg-accent-electric-blue" />}
                            <Text className={`font-semibold text-[14px] ${hasExam ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>Yes, I do</Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => { Haptics.selectionAsync(); setHasExam(false); }}
                            className={`flex-1 py-2 px-3 rounded-full flex-row items-center justify-center gap-1.5 transition-all ${
                                !hasExam ? 'bg-surface-container-lowest shadow-sm' : ''
                            }`}
                        >
                            {!hasExam && <View className="w-2 h-2 rounded-full bg-accent-electric-blue" />}
                            <Text className={`font-semibold text-[14px] ${!hasExam ? 'text-accent-electric-blue' : 'text-on-surface-variant'}`}>No upcoming exam</Text>
                        </Pressable>
                    </View>

                    {/* Exam Details Expanded */}
                    {hasExam && (
                        <Animated.View entering={FadeInDown.duration(300)} layout={Layout.springify()} className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex-col gap-4 mt-1">
                            <View className="flex-col gap-1">
                                <Text className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Target Exam / Course</Text>
                                <View className="flex-row items-center rounded-xl bg-surface-container-low px-3 py-2.5 border border-transparent focus-within:border-accent-electric-blue/30">
                                    <MaterialIcons name="school" size={20} color="#8e8e93" className="mr-2" />
                                    <TextInput 
                                        className="flex-1 text-[15px] text-on-surface p-0 ml-2"
                                        placeholder="e.g. MCAT, USMLE, Midterms"
                                        placeholderTextColor="#8e8e93"
                                        value={courseName}
                                        onChangeText={setCourseName}
                                    />
                                </View>
                            </View>

                            <View className="flex-col gap-1">
                                <Text className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Target Date</Text>
                                <Pressable 
                                    onPress={() => setShowPicker(true)}
                                    className="flex-row items-center rounded-xl bg-surface-container-low px-3 py-3 border border-transparent"
                                >
                                    <MaterialIcons name="calendar-month" size={20} color="#007aff" className="mr-2" />
                                    <Text className="flex-1 font-semibold text-[15px] text-on-surface ml-2">
                                        {date.toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </Text>
                                </Pressable>
                                
                                {showPicker && (
                                    <View className={Platform.OS === 'ios' ? 'mt-2 rounded-2xl overflow-hidden' : ''}>
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={(e, d) => {
                                                if (Platform.OS === 'android') setShowPicker(false);
                                                if (d) setDate(d);
                                            }}
                                            minimumDate={new Date()}
                                        />
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    )}
                </View>

                {/* Decorative Prediction Card */}
                {hasExam && (
                    <Animated.View entering={FadeInDown.delay(150).duration(300)} className="p-4 rounded-xl flex-row items-center justify-between mt-2" style={{ backgroundColor: '#e5f1ff' }}>
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-full bg-accent-electric-blue/15 flex items-center justify-center">
                                <MaterialIcons name="insights" size={20} color="#007aff" />
                            </View>
                            <View className="flex-col">
                                <Text className="font-semibold text-[14px] text-on-surface">Predicted Mastery Retention</Text>
                                <Text className="text-[13px] text-on-surface-variant">Optimal space-repetition model applied</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Text className="font-bold text-[16px] text-accent-electric-blue">94%</Text>
                            <MaterialIcons name="trending-up" size={16} color="#007aff" />
                        </View>
                    </Animated.View>
                )}

            </View>
        </OnboardingShell>
    );
}
