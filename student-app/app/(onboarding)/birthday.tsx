import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, ScrollView, Platform } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Checklist } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

export default function BirthdayScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const { setOnboardingStep, setOnboardingData } = useAuthStore();

    const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios'); // iOS shows inline/modal by default

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
        <View style={{ flex: 1, backgroundColor: C.secondaryBackground }}>
            <SafeAreaView style={s.container}>
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <View style={s.stepRow}>
                            <Text style={[s.stepText, { color: C.primary }]}>Step 8 of 8</Text>
                            <View style={s.progressBar}>
                                <View style={[s.progressFill, { width: '85%', backgroundColor: C.primary }]} />
                            </View>
                        </View>
                        <Text style={[s.heroTitle, { color: C.text }]}>When is your next exam?</Text>
                    </Animated.View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={s.inputGroup}>
                        <Text style={[s.label, { color: C.text }]}>Target Date</Text>

                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.7}
                            style={[s.inputContainer, { backgroundColor: C.card, borderColor: C.separator, marginBottom: 12 }]}
                        >
                            <AnimatedIcon 
                                source={require('@/assets/3dicons/3dicons-calendar-front-color.png')} 
                                size={24} 
                                style={[s.icon, { marginRight: 16 }]} 
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
                            <Checklist size={20} color={C.textTertiary} />
                            <Text style={[s.infoText, { color: C.textSecondary }]}>
                                We’ll send gentle nudges before the day.
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>

                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24), paddingHorizontal: 24 }]}>
                    <AnimatedButton
                        title="Continue"
                        onPress={handleNext}
                        type="capsule"
                        backgroundColor="#007AFF"
                        shadowColor="#0066D6"
                        fullWidth
                    />
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

    scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },

    inputGroup: { width: '100%' },
    label: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginLeft: 4 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    icon: { marginRight: 12 },
    inputText: { fontSize: 17, fontWeight: '500' },

    iosPickerContainer: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        marginTop: 8,
        overflow: 'hidden',
    },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 0 },

    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    stepText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },

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
});

