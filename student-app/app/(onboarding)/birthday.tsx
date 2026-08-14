import { View, TouchableOpacity, useColorScheme, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import Checklist from '@/assets/icons/pikaicons/check-tick-square.svg';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Text } from '@/components/ui/Text';

export default function BirthdayScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const { setOnboardingStep, setOnboardingData } = useAuthStore();

    const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    useEffect(() => {
        setOnboardingStep(8);
    }, []);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setDate(selectedDate);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleNext = async () => {
        await setOnboardingData({
            next_exam_date: date.toISOString().split('T')[0],
            next_exam_title: 'Major Exam',
        });
        router.push('/(onboarding)/referral');
    };

    return (
        <OnboardingShell
            step={8}
            title="When is your next exam?"
            onCta={handleNext}
        >
            <Animated.View entering={FadeInDown.duration(500).delay(150)} style={s.inputGroup}>
                <Text style={[s.label, { color: C.text }]}>Target Date</Text>

                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}
                    style={[s.inputContainer, { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' 
                    }]}
                >
                    <AnimatedIcon 
                        source={require('@/assets/3dicons/3dicons-calendar-front-color.png')} 
                        size={24} 
                        style={s.icon} 
                        animationType="wobble" 
                    />
                    <Text style={[s.inputText, { color: C.text }]}>
                        {date.toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <View style={Platform.OS === 'ios' ? s.iosPickerContainer : null}>
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                            textColor={C.text}
                            themeVariant={isDark ? 'dark' : 'light'}
                        />
                    </View>
                )}

                <View style={s.infoRow}>
                    <Checklist width={20} height={20} color={C.textTertiary} />
                    <Text style={[s.infoText, { color: C.textSecondary }]}>
                        We’ll send gentle nudges before the day.
                    </Text>
                </View>
            </Animated.View>
        </OnboardingShell>
    );
}

const s = StyleSheet.create({
    inputGroup: { width: '100%' },
    label: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginLeft: 4 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 58,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    icon: { marginRight: 14 },
    inputText: { fontSize: 17, fontWeight: '600' },

    iosPickerContainer: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        marginTop: 8,
        overflow: 'hidden',
    },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
