import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GraduationCap, Book, Flask, Medal, Check } from 'iconoir-react-native';

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: GraduationCap, desc: 'Secondary / A-Levels' },
    { key: 'undergraduate', label: 'Undergraduate', icon: Book, desc: "Bachelor's degree" },
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
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/field');
        }
    };

    const bgColor = isDark ? '#000000' : '#F2F2F7';
    const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#8E8E93';
    const iconColor = isDark ? '#FFFFFF' : '#000000';
    const separatorColor = isDark ? '#38383A' : '#C6C6C8';

    return (
        <SafeAreaView style={[s.container, { backgroundColor: bgColor }]}>
            
            <View style={s.headerSection}>
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
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={[s.listContainer, { backgroundColor: cardColor }]}>
                    {LEVELS.map((level, index) => {
                        const isSelected = selected === level.key;
                        const isLast = index === LEVELS.length - 1;

                        return (
                            <TouchableOpacity
                                key={level.key}
                                onPress={() => handleSelect(level.key)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.listItem, !isLast && { borderBottomColor: separatorColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                    
                                    <View style={s.listItemLeft}>
                                        <View style={[s.iconBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                            <level.icon width={22} height={22} color={iconColor} />
                                        </View>
                                        <View style={s.textStack}>
                                            <Text style={[s.optionLabel, { color: textColor }]}>{level.label}</Text>
                                            <Text style={[s.optionDesc, { color: subtextColor }]}>{level.desc}</Text>
                                        </View>
                                    </View>

                                    <View style={s.listItemRight}>
                                        {isSelected && (
                                            <Check width={24} height={24} color="#007AFF" strokeWidth={3} />
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={s.footer}>
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!selected}
                    activeOpacity={0.8}
                    style={[s.primaryBtn, !selected && s.primaryBtnDisabled]}
                >
                    <Text style={[s.primaryBtnText, !selected && { color: 'rgba(255,255,255,0.5)' }]}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    headerSection: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.41, marginBottom: 8 },
    heroSubtitle: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
    
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    listContainer: { borderRadius: 10, overflow: 'hidden' },
    
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingRight: 16, marginLeft: 16 },
    listItemLeft: { flexDirection: 'row', alignItems: 'center' },
    
    iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textStack: { justifyContent: 'center' },
    optionLabel: { fontSize: 17, fontWeight: '500', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '400' },
    
    listItemRight: { width: 24, alignItems: 'flex-end' },
    
    footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    primaryBtn: { backgroundColor: '#007AFF', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    primaryBtnDisabled: { backgroundColor: '#B0D4FF' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
});
