import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: 'graduationcap.fill', desc: 'Secondary / A-Levels' },
    { key: 'undergraduate', label: 'Undergraduate', icon: 'book.fill', desc: "Bachelor's degree" },
    { key: 'masters_phd', label: 'Masters / PhD', icon: 'flask.fill', desc: 'Postgraduate research' },
    { key: 'professional', label: 'Professional Cert', icon: 'medal.fill', desc: 'ICAN, ACCA, PMP, etc.' },
];

export default function EducationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/field');
        }
    };

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const iconColor = '#007AFF';

    return (
        <GlowBackground style={{ flex: 1 }}>
            <SafeAreaView style={s.container}>
                
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={[s.heroTitle, { color: textColor }]}>
                            Academic Level
                        </Text>
                        <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                            This helps us calibrate the AI to your specific learning stage.
                        </Text>
                    </Animated.View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={s.optionsGap}>
                        {LEVELS.map((level, index) => {
                            const isSelected = selected === level.key;
                            const iconName = level.icon;

                            return (
                                <Animated.View 
                                    key={level.key}
                                    entering={FadeInDown.duration(600).delay(200 + index * 100)}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleSelect(level.key)}
                                        activeOpacity={0.8}
                                        style={[
                                            s.card, 
                                            isDark ? s.cardDark : s.cardLight,
                                            isSelected && s.cardSelected
                                        ]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7' }]}>
                                            <IconSymbol name={iconName as any} size={22} color={iconColor} />
                                        </View>
                                        <View style={s.textStack}>
                                            <Text style={[s.optionLabel, { color: textColor }]}>{level.label}</Text>
                                            <Text style={[s.optionDesc, { color: subtextColor }]}>{level.desc}</Text>
                                        </View>
                                        {isSelected && (
                                            <IconSymbol name="checkmark.circle.fill" size={24} color="#007AFF" />
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={!selected}
                        activeOpacity={0.8}
                        style={[s.primaryBtn, !selected && s.primaryBtnDisabled]}
                    >
                        <Text style={[s.primaryBtnText, !selected && { color: 'rgba(255,255,255,0.5)' }]}>
                            Continue
                        </Text>
                    </TouchableOpacity>
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
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
    optionsGap: { gap: 12 },

    // Glass Card System
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardLight: { 
        backgroundColor: '#FFFFFF', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 12, 
        elevation: 3,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardDark: { 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardSelected: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textStack: { flex: 1, justifyContent: 'center' },
    optionLabel: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '500' },
    
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
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
    primaryBtnDisabled: { backgroundColor: '#A2C9F4' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.41 },
});
