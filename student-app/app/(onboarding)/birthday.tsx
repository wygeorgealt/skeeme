import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, User } from 'iconoir-react-native';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { IosPillButton } from '@/components/ui/IosPillButton';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { calculateAge, formatDateDisplay } from '@/utils/dateUtils';

export default function BirthdayScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();
    
    // Default to 18 years ago if no date exists
    const initialDate = onboardingData.dob_year && onboardingData.dob_month 
        ? new Date(onboardingData.dob_year, onboardingData.dob_month - 1, 1)
        : new Date(new Date().getFullYear() - 18, 0, 1);

    const [date, setDate] = useState<Date>(initialDate);
    const [age, setAge] = useState<number>(calculateAge(initialDate));
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios'); // iOS shows inline/modal by default

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        
        if (selectedDate) {
            setDate(selectedDate);
            setAge(calculateAge(selectedDate));
        }
    };

    const handleNext = async () => {
        await setOnboardingData({ 
            dob_month: date.getMonth() + 1, 
            dob_year: date.getFullYear(), 
            age: age 
        });
        router.push('/(onboarding)/create-account');
    };

    const isValid = age > 0;

    return (
        <GlowBackground style={{ flex: 1 }}>
            <SafeAreaView style={s.container}>
                
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={[s.heroTitle, { color: C.text }]}>
                            A Little About You
                        </Text>
                        <Text style={[s.heroSubtitle, { color: C.textSecondary }]}>
                            This helps us personalize your learning experience.
                        </Text>
                    </Animated.View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={s.inputGroup}>
                        
                        <Text style={[s.label, { color: C.text }]}>Your Birthday</Text>
                        
                        <TouchableOpacity 
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.7}
                            style={[s.inputContainer, { backgroundColor: C.card, borderColor: C.separator, marginBottom: 12 }]}
                        >
                            <Calendar width={20} height={20} color={C.primary} style={s.icon} />
                            <Text style={[s.inputText, { color: C.text }]}>
                                {formatDateDisplay(date)}
                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <View style={Platform.OS === 'ios' ? s.iosPickerContainer : null}>
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                            </View>
                        )}

                        <View style={s.ageHighlight}>
                            <View style={[s.ageBadge, { backgroundColor: C.primary + '20' }]}>
                                <User width={16} height={16} color={C.primary} style={{ marginRight: 6 }} />
                                <Text style={[s.ageText, { color: C.primary }]}>
                                    Detected Age: {age} years old
                                </Text>
                            </View>
                        </View>

                    </Animated.View>
                </ScrollView>

                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <IosPillButton
                        label="Continue"
                        onPress={handleNext}
                        disabled={!isValid}
                        fullWidth
                        size="lg"
                    />
                </View>
            </SafeAreaView>
        </GlowBackground>
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
        overflow: 'hidden'
    },

    ageHighlight: {
        marginTop: 20,
        alignItems: 'center',
    },
    ageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    ageText: {
        fontSize: 14,
        fontWeight: '700',
    },
    
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
});

