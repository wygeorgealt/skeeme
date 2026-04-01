import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SunLight, Compass, Check } from 'iconoir-react-native';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: "Break it down like I'm new to this topic.",
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
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/create-account');
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
                        Learning Style
                    </Text>
                    <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                        How should Skeeme explain concepts to you?
                    </Text>
                </Animated.View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={[s.listContainer, { backgroundColor: cardColor }]}>
                    {STYLES.map((style, index) => {
                        const isSelected = selected === style.key;
                        const isLast = index === STYLES.length - 1;

                        return (
                            <TouchableOpacity
                                key={style.key}
                                onPress={() => handleSelect(style.key)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.listItem, !isLast && { borderBottomColor: separatorColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                    
                                    <View style={s.listItemLeft}>
                                        <View style={[s.iconBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                            <style.icon width={22} height={22} color={iconColor} />
                                        </View>
                                        <View style={s.textStack}>
                                            <Text style={[s.optionLabel, { color: textColor }]}>{style.label}</Text>
                                            <Text style={[s.optionDesc, { color: subtextColor }]}>{style.desc}</Text>
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
    
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingRight: 16, marginLeft: 16 },
    listItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    
    iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textStack: { flex: 1, justifyContent: 'center', paddingRight: 16 },
    optionLabel: { fontSize: 17, fontWeight: '500', marginBottom: 2 },
    optionDesc: { fontSize: 13, fontWeight: '400' },
    
    listItemRight: { width: 24, alignItems: 'flex-end' },
    
    footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    primaryBtn: { backgroundColor: '#007AFF', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    primaryBtnDisabled: { backgroundColor: '#B0D4FF' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
});
