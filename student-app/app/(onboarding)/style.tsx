import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SunLight, Compass, Check } from 'iconoir-react-native';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: 'Break it down like I\'m new to this topic.',
        icon: SunLight,
    },
    {
        key: 'detailed',
        label: 'Detailed & Academic',
        desc: 'Give me the full exam-level answer.',
        icon: Compass,
    },
];

export default function StyleScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(4);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ learning_style: key });
        setTimeout(() => {
            router.push('/(onboarding)/demo');
        }, 350);
    };

    return (
        <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Progress */}
            <View style={s.progressRow}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View 
                        key={i} 
                        style={[
                            s.progressDot, 
                            i <= 4 
                                ? (isDark ? s.bgWhite : s.bgSlate900) 
                                : (isDark ? s.bgSlate800 : s.bgSlate100)
                        ]} 
                    />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Learning Style.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    How do you like things explained? You can change this anytime.
                </Text>
            </Animated.View>

            <View style={s.stylesGap}>
                {STYLES.map((style, index) => {
                    const isSelected = selected === style.key;
                    return (
                        <Animated.View key={style.key} entering={FadeInDown.duration(400).delay(200 + index * 100)}>
                            <TouchableOpacity
                                onPress={() => handleSelect(style.key)}
                                activeOpacity={0.9}
                                style={[
                                    s.optionCard,
                                    isSelected
                                        ? isDark ? s.optionCardActiveDark : s.optionCardActiveLight
                                        : isDark ? s.optionCardInactiveDark : s.optionCardInactiveLight
                                ]}
                            >
                                <View style={s.cardHeader}>
                                    <View style={[
                                        s.iconBox,
                                        isSelected 
                                            ? isDark ? s.bgWhite : s.bgSlate900 
                                            : isDark ? s.bgSlate800 : s.bgSlate50
                                    ]}>
                                        <style.icon 
                                            width={18} 
                                            height={18} 
                                            color={isSelected ? (isDark ? '#000' : '#fff') : (isDark ? '#64748b' : '#94a3b8')} 
                                        />
                                    </View>
                                    <View style={s.flex1}>
                                        <Text style={[s.optionLabel, isSelected ? (isDark ? s.textWhite : s.textSlate900) : (isDark ? s.textSlate400 : s.textSlate600)]}>
                                            {style.label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Animated.View entering={FadeIn.duration(200)}>
                                            <View style={s.checkCircle}>
                                                <Check width={18} height={18} color="#fff" />
                                            </View>
                                        </Animated.View>
                                    )}
                                </View>
                                <Text style={[s.optionDesc, isDark ? s.textSlate400 : s.textSlate500]}>
                                    {style.desc}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32 },
    progressDot: { flex: 1, height: 4, borderRadius: 99 },
    
    headerSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    stylesGap: { gap: 16 },
    optionCard: { padding: 24, borderRadius: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    optionCardActiveLight: { borderColor: '#0f172a', backgroundColor: 'white' },
    optionCardActiveDark: { borderColor: 'white', backgroundColor: '#0f172a' },
    optionCardInactiveLight: { borderColor: '#f1f5f9', backgroundColor: 'white' },
    optionCardInactiveDark: { borderColor: '#1e293b', backgroundColor: 'transparent' },
    
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    bgWhite: { backgroundColor: 'white' },
    bgSlate900: { backgroundColor: '#0f172a' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textSlate600: { color: '#475569' },
    
    optionLabel: { fontWeight: '700', fontSize: 16 },
    optionDesc: { fontWeight: '500', fontSize: 14, lineHeight: 22, marginLeft: 76 },
    
    checkCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
});
