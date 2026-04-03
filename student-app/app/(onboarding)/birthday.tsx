import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, User } from 'iconoir-react-native';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { IosPillButton } from '@/components/ui/IosPillButton';

export default function BirthdayScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();
    
    const [month, setMonth] = useState(onboardingData.dob_month?.toString() || '');
    const [year, setYear] = useState(onboardingData.dob_year?.toString() || '');
    const [age, setAge] = useState(onboardingData.age?.toString() || '');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleNext = async () => {
        if (month && year && age) {
            await setOnboardingData({ 
                dob_month: parseInt(month, 10), 
                dob_year: parseInt(year, 10), 
                age: parseInt(age, 10) 
            });
            router.push('/(onboarding)/create-account');
        }
    };

    const isValid = month.length > 0 && year.length === 4 && age.length > 0;

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
                        <Text style={[s.label, { color: C.text }]}>Birth Month</Text>
                        <View style={[s.inputContainer, { backgroundColor: C.card, borderColor: C.separator }]}>
                            <Calendar width={20} height={20} color={C.primary} style={s.icon} />
                            <TextInput
                                placeholder="MM (e.g. 05)"
                                placeholderTextColor={C.textTertiary}
                                keyboardType="number-pad"
                                maxLength={2}
                                value={month}
                                onChangeText={setMonth}
                                style={[s.input, { color: C.text }]}
                            />
                        </View>

                        <Text style={[s.label, { color: C.text, marginTop: 24 }]}>Birth Year</Text>
                        <View style={[s.inputContainer, { backgroundColor: C.card, borderColor: C.separator }]}>
                            <Calendar width={20} height={20} color={C.primary} style={s.icon} />
                            <TextInput
                                placeholder="YYYY (e.g. 2004)"
                                placeholderTextColor={C.textTertiary}
                                keyboardType="number-pad"
                                maxLength={4}
                                value={year}
                                onChangeText={setYear}
                                style={[s.input, { color: C.text }]}
                            />
                        </View>

                        <Text style={[s.label, { color: C.text, marginTop: 24 }]}>Current Age</Text>
                        <View style={[s.inputContainer, { backgroundColor: C.card, borderColor: C.separator }]}>
                            <User width={20} height={20} color={C.primary} style={s.icon} />
                            <TextInput
                                placeholder="e.g. 19"
                                placeholderTextColor={C.textTertiary}
                                keyboardType="number-pad"
                                maxLength={2}
                                value={age}
                                onChangeText={setAge}
                                style={[s.input, { color: C.text }]}
                            />
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
    input: { flex: 1, fontSize: 17, fontWeight: '500' },
    
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
});
