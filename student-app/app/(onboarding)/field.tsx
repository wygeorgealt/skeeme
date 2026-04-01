import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flask, Tools, BookStack, Suitcase, Page, Plus, ViewGrid, Check } from 'iconoir-react-native';

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
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/style');
        }
    };

    const bgColor = isDark ? '#000000' : '#F2F2F7';
    const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const iconColor = isDark ? '#FFFFFF' : '#000000';
    const separatorColor = isDark ? '#38383A' : '#C6C6C8';
    const subtextColor = isDark ? '#8E8E93' : '#8E8E93';

    return (
        <SafeAreaView style={[s.container, { backgroundColor: bgColor }]}>
            
            <View style={s.headerSection}>
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <Text style={[s.heroTitle, { color: textColor }]}>
                        Focus Area
                    </Text>
                    <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                        We'll tailor Skeeme's content to your specific discipline.
                    </Text>
                </Animated.View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={[s.listContainer, { backgroundColor: cardColor }]}>
                    {FIELDS.map((field, index) => {
                        const isSelected = selected === field.key;
                        const isLast = index === FIELDS.length - 1;

                        return (
                            <TouchableOpacity
                                key={field.key}
                                onPress={() => handleSelect(field.key)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.listItem, !isLast && { borderBottomColor: separatorColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                    
                                    <View style={s.listItemLeft}>
                                        <View style={[s.iconBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                            <field.icon width={18} height={18} color={iconColor} />
                                        </View>
                                        <Text style={[s.optionLabel, { color: textColor }]}>{field.label}</Text>
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
    
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingRight: 16, marginLeft: 16 },
    listItemLeft: { flexDirection: 'row', alignItems: 'center' },
    
    iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    optionLabel: { fontSize: 17, fontWeight: '500' },
    
    listItemRight: { width: 24, alignItems: 'flex-end' },
    
    footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    primaryBtn: { backgroundColor: '#007AFF', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    primaryBtnDisabled: { backgroundColor: '#B0D4FF' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
});
