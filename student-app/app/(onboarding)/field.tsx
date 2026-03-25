import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Flask, Tools, BookStack, Suitcase, Page, Plus, ViewGrid } from 'iconoir-react-native';

const FIELDS = [
    { key: 'sciences', label: 'Sciences', icon: Flask },
    { key: 'engineering', label: 'Engineering', icon: Tools },
    { key: 'humanities', label: 'Humanities', icon: BookStack },
    { key: 'business', label: 'Business', icon: Suitcase },
    { key: 'law', label: 'Law', icon: Page },
    { key: 'medicine', label: 'Medicine', icon: Plus },
    { key: 'other', label: 'Other', icon: ViewGrid },
];

export default function FieldScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(3);
    }, []);

    const handleSelect = (key: string) => {
        setSelected(key);
        setOnboardingData({ field_of_study: key });
        setTimeout(() => {
            router.push('/(onboarding)/style');
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
                            i <= 3 
                                ? (isDark ? s.bgWhite : s.bgSlate900) 
                                : (isDark ? s.bgSlate800 : s.bgSlate100)
                        ]} 
                    />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Focus Area.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    We'll tailor Skeeme's content to your specific discipline.
                </Text>
            </Animated.View>

            <View style={s.fieldsRow}>
                {FIELDS.map((field, index) => {
                    const isSelected = selected === field.key;
                    return (
                        <Animated.View 
                            key={field.key} 
                            entering={FadeInDown.duration(400).delay(200 + index * 60)}
                            style={field.key === 'other' ? s.fullWidth : s.halfWidth}
                        >
                            <TouchableOpacity
                                onPress={() => handleSelect(field.key)}
                                activeOpacity={0.9}
                                style={[
                                    s.optionCard,
                                    isSelected
                                        ? isDark ? s.optionCardActiveDark : s.optionCardActiveLight
                                        : isDark ? s.optionCardInactiveDark : s.optionCardInactiveLight
                                ]}
                            >
                                <View style={[
                                    s.iconBox,
                                    isSelected 
                                        ? isDark ? s.bgWhite : s.bgSlate900 
                                        : isDark ? s.bgSlate800 : s.bgSlate50
                                ]}>
                                    <field.icon 
                                        width={18} 
                                        height={18} 
                                        color={isSelected ? (isDark ? '#000' : '#fff') : (isDark ? '#64748b' : '#94a3b8')} 
                                    />
                                </View>
                                <Text style={[s.optionLabel, isSelected ? (isDark ? s.textWhite : s.textSlate900) : (isDark ? s.textSlate400 : s.textSlate600)]}>
                                    {field.label}
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
    
    fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    fullWidth: { width: '100%' },
    halfWidth: { width: '47.6%' },
    
    optionCard: { alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    optionCardActiveLight: { borderColor: '#0f172a', backgroundColor: 'white' },
    optionCardActiveDark: { borderColor: 'white', backgroundColor: '#0f172a' },
    optionCardInactiveLight: { borderColor: '#f1f5f9', backgroundColor: 'white' },
    optionCardInactiveDark: { borderColor: '#1e293b', backgroundColor: 'transparent' },
    
    iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    bgWhite: { backgroundColor: 'white' },
    bgSlate900: { backgroundColor: '#0f172a' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textSlate600: { color: '#475569' },
    
    optionLabel: { fontWeight: '700', fontSize: 14, textAlign: 'center' },
});
