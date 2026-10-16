import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Icon } from '@/components/ui/Icon';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ExamDateScreen() {
    const router = useRouter();
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [hasExam, setHasExam] = useState<boolean>(true);
    const [courseName, setCourseName] = useState('');
    const [date, setDate] = useState(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

    const handleNext = () => {
        setOnboardingData({ 
            next_exam_title: hasExam ? courseName.trim() || 'Upcoming Exam' : null,
            next_exam_date: hasExam ? date.toISOString().split('T')[0] : null,
        } as any);
        
        router.push('/(onboarding)/notifications');
    };

    return (
        <OnboardingShell
            step={7}
            totalSteps={8}
            title="Any upcoming exam?"
            subtitle="Set your timeline so we can calibrate your study pace."
            onCta={handleNext}
            hasKeyboard
        >
            <View className="flex-col gap-6 pb-6">
                {/* Segmented Yes / No Selector */}
                <View 
                    className="p-1 rounded-2xl flex-row items-center gap-1"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E9ECEF' }}
                >
                    <Pressable
                        onPress={() => {
                            Haptics.selectionAsync();
                            setHasExam(true);
                        }}
                        className="flex-1 py-3 rounded-xl items-center justify-center transition-all"
                        style={{
                            backgroundColor: hasExam ? (isDark ? '#282C37' : '#FFFFFF') : 'transparent',
                            shadowColor: '#000',
                            shadowOpacity: hasExam ? 0.08 : 0,
                            shadowRadius: 4,
                            elevation: hasExam ? 2 : 0,
                        }}
                    >
                        <Text 
                            style={{ 
                                color: hasExam ? (isDark ? '#FFFFFF' : '#0F172A') : C.textSecondary,
                                fontWeight: hasExam ? '700' : '500',
                            }} 
                            className="text-[14px]"
                        >
                            Yes, I have an exam
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            Haptics.selectionAsync();
                            setHasExam(false);
                        }}
                        className="flex-1 py-3 rounded-xl items-center justify-center transition-all"
                        style={{
                            backgroundColor: !hasExam ? (isDark ? '#282C37' : '#FFFFFF') : 'transparent',
                            shadowColor: '#000',
                            shadowOpacity: !hasExam ? 0.08 : 0,
                            shadowRadius: 4,
                            elevation: !hasExam ? 2 : 0,
                        }}
                    >
                        <Text 
                            style={{ 
                                color: !hasExam ? (isDark ? '#FFFFFF' : '#0F172A') : C.textSecondary,
                                fontWeight: !hasExam ? '700' : '500',
                            }} 
                            className="text-[14px]"
                        >
                            No specific date
                        </Text>
                    </Pressable>
                </View>

                {/* Exam Details Card */}
                {hasExam ? (
                    <Animated.View 
                        entering={FadeInDown.duration(300)} 
                        layout={Layout.springify()} 
                        className="p-5 rounded-2xl flex-col gap-4"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        }}
                    >
                        <View className="flex-col gap-2">
                            <Text style={{ color: C.text }} className="text-[14px] font-semibold">Exam / Course Title</Text>
                            <View 
                                className="flex-row items-center rounded-xl px-3.5 h-13"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F8FC',
                                    borderWidth: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                }}
                            >
                                <Icon name="GraduationCap" size={18} color="secondary" />
                                <TextInput 
                                    className="flex-1 text-[15px] font-medium ml-2.5"
                                    style={{ color: C.text }}
                                    placeholder="e.g. MCAT, USMLE, Midterms..."
                                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                    value={courseName}
                                    onChangeText={setCourseName}
                                />
                            </View>
                        </View>

                        <View className="flex-col gap-2">
                            <Text style={{ color: C.text }} className="text-[14px] font-semibold">Target Date</Text>
                            <Pressable 
                                onPress={() => setShowPicker(true)}
                                className="flex-row items-center rounded-xl px-3.5 h-13"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F8FC',
                                    borderWidth: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                }}
                            >
                                <Icon name="Calendar" size={18} color="secondary" />
                                <Text style={{ color: C.text }} className="flex-1 font-semibold text-[15px] ml-2.5">
                                    {date.toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </Text>
                            </Pressable>
                            
                            {showPicker && (
                                <View className={Platform.OS === 'ios' ? 'mt-2 rounded-2xl overflow-hidden' : ''}>
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        themeVariant={isDark ? 'dark' : 'light'}
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
                ) : (
                    <Animated.View 
                        entering={FadeInDown.duration(300)}
                        className="p-5 rounded-2xl flex-row items-center gap-3.5"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        }}
                    >
                        <View 
                            className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
                            style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#EBF5FF' }}
                        >
                            <Icon name="Compass" size={20} color="primary" />
                        </View>
                        <View className="flex-1 min-w-0">
                            <Text style={{ color: C.text }} className="font-semibold text-[15px]">Continuous Study</Text>
                            <Text style={{ color: C.textSecondary }} className="text-[13px] leading-relaxed mt-0.5">
                                We'll focus on steady, self-paced mastery across your active subjects.
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </OnboardingShell>
    );
}
