import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar01Icon, Task01Icon } from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/theme';

export default function ExamDateScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    
    const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 1 week from now
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowPicker(Platform.OS === 'ios');
        setDate(currentDate);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleNext = () => {
        setOnboardingData({ 
            next_exam_date: date.toISOString().split('T')[0],
            next_exam_title: 'Major Exam' 
        });
        router.push('/(onboarding)/birthday');
    };

    const handleSkip = () => {
        router.push('/(onboarding)/birthday');
    };

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const iconColor = '#007AFF';

    return (
        <View style={{ flex: 1, backgroundColor: C.secondaryBackground }}>
            <SafeAreaView style={s.container}>
                
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <View style={s.stepRow}>
                            <Text style={[s.stepText, { color: iconColor }]}>Step 5 of 7</Text>
                            <View style={s.progressBar}>
                                <View style={[s.progressFill, { width: '71%', backgroundColor: iconColor }]} />
                            </View>
                        </View>
                        <Text style={[s.heroTitle, { color: textColor }]}>
                            Next Exam?
                        </Text>
                        <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                            Tell us when your next big test is, and we'll help you stay prepared.
                        </Text>
                    </Animated.View>
                </View>

                <View style={s.content}>
                    <Animated.View 
                        entering={FadeInDown.duration(600).delay(300)}
                        style={[s.pickerCard, isDark ? s.cardDark : s.cardLight]}
                    >
                        <View style={s.iconHeader}>
                            <HugeiconsIcon icon={Calendar01Icon} size={32} color={iconColor} />
                        </View>
                        
                        <Text style={[s.dateLabel, { color: textColor }]}>
                            Target Date
                        </Text>

                        {Platform.OS === 'android' && (
                            <TouchableOpacity 
                                onPress={() => setShowPicker(true)}
                                style={s.androidPickerTrigger}
                            >
                                <Text style={[s.dateDisplay, { color: iconColor }]}>
                                    {date.toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChange}
                                minimumDate={new Date()}
                                textColor={textColor}
                                style={s.picker}
                            />
                        )}
                    </Animated.View>

                    <Animated.View 
                        entering={FadeInDown.duration(600).delay(500)}
                        style={s.infoRow}
                    >
                        <HugeiconsIcon icon={Task01Icon} size={20} color={subtextColor} />
                        <Text style={[s.infoText, { color: subtextColor }]}>
                            We'll send gentle reminders to keep your streak alive as the date approaches.
                        </Text>
                    </Animated.View>
                </View>

                {/* Bottom Buttons */}
                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        onPress={handleNext}
                        activeOpacity={0.8}
                        style={s.primaryBtn}
                    >
                        <Text style={s.primaryBtnText}>
                            Set Exam Date
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        activeOpacity={0.7}
                        style={s.skipBtn}
                    >
                        <Text style={[s.skipBtnText, { color: subtextColor }]}>
                            I don't have an exam yet
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    headerSection: { paddingHorizontal: 24, paddingBottom: 24 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
    heroSubtitle: { fontSize: 17, fontWeight: '500', lineHeight: 24, opacity: 0.8 },
    
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    
    pickerCard: {
        padding: 24,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 24,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    cardDark: {
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    
    iconHeader: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(0,122,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    androidPickerTrigger: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'rgba(0,122,255,0.05)',
    },
    dateDisplay: {
        fontSize: 20,
        fontWeight: '600',
    },
    picker: {
        width: '100%',
        height: 200,
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },

    footer: { paddingHorizontal: 24, gap: 12 },
    primaryBtn: { 
        backgroundColor: '#007AFF', 
        height: 56, 
        borderRadius: 100, 
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.41 },
    
    skipBtn: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },

    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    stepText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
});
