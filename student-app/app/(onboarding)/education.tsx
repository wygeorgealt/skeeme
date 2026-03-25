import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { GraduationCap, Book, Flask, Medal, Check } from 'iconoir-react-native';
import { GlowBackground } from '@/components/ui/GlowBackground';

const { width } = Dimensions.get('window');

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: GraduationCap, desc: 'Secondary / A-Levels' },
    { key: 'undergraduate', label: 'Undergraduate', icon: Book, desc: 'Bachelor\'s degree' },
    { key: 'masters_phd', label: 'Masters / PhD', icon: Flask, desc: 'Postgraduate research' },
    { key: 'professional', label: 'Professional Cert', icon: Medal, desc: 'ICAN, ACCA, PMP, etc.' },
];

export default function EducationScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(2);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ education_level: key });
        setTimeout(() => {
            router.push('/(onboarding)/field');
        }, 400);
    };

    return (
        <GlowBackground useSafeArea>
            <View style={s.flex1}>
                {/* Progress */}
                <View style={s.progressRow}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <View 
                            key={i} 
                            style={[
                                s.progressDot, 
                                i <= 2 
                                    ? (isDark ? s.bgWhite : s.bgSlate900) 
                                    : (isDark ? s.bgSlate800 : s.bgSlate100)
                            ]} 
                        />
                    ))}
                </View>

                <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                    <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                        Academic Level.
                    </Text>
                    <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                        This helps us calibrate the AI to your specific learning stage.
                    </Text>
                </Animated.View>

                <View style={s.optionsGap}>
                    {LEVELS.map((level, index) => (
                        <Animated.View key={level.key} entering={FadeInDown.duration(400).delay(200 + index * 80)}>
                            <TouchableOpacity
                                onPress={() => handleSelect(level.key)}
                                activeOpacity={0.9}
                                style={[
                                    s.optionCard,
                                    selected === level.key
                                        ? isDark ? s.optionActiveDark : s.optionActiveLight
                                        : isDark ? s.optionInactiveDark : s.optionInactiveLight
                                ]}
                            >
                                <View style={[
                                    s.iconBox,
                                    selected === level.key 
                                        ? isDark ? s.bgWhite : s.bgSlate900 
                                        : isDark ? s.bgSlate800 : s.bgSlate50
                                ]}>
                                    <level.icon width={18} height={18} color={selected === level.key ? (isDark ? '#000' : '#fff') : (isDark ? '#94a3b8' : '#64748b')} />
                                </View>
                                <View style={s.flex1}>
                                    <Text style={[s.optionLabel, isDark ? s.textWhite : s.textSlate900]}>{level.label}</Text>
                                    <Text style={[s.optionDesc, isDark ? s.textSlate400 : s.textSlate500]}>{level.desc}</Text>
                                </View>
                                {selected === level.key && (
                                    <Animated.View entering={FadeIn.duration(200)}>
                                        <View style={s.checkCircle}>
                                            <Check width={18} height={18} color="#fff" />
                                        </View>
                                    </Animated.View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </View>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32 },
    progressDot: { flex: 1, height: 4, borderRadius: 99 },
    
    headerSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    optionsGap: { gap: 12 },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 2 },
    optionActiveDark: { borderColor: 'white', backgroundColor: '#0f172a' },
    optionActiveLight: { borderColor: '#0f172a', backgroundColor: 'white' },
    optionInactiveDark: { borderColor: '#1e293b', backgroundColor: 'transparent' },
    optionInactiveLight: { borderColor: '#f1f5f9', backgroundColor: 'white' },
    
    iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    bgWhite: { backgroundColor: 'white' },
    bgSlate900: { backgroundColor: '#0f172a' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    
    optionLabel: { fontWeight: '700', fontSize: 15 },
    optionDesc: { fontWeight: '500', fontSize: 13, marginTop: 2 },
    
    checkCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
});
