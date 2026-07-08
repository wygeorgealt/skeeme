import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CheckCircle } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

import { Colors } from '@/constants/theme';

const FIELDS = [
    { key: 'sciences', label: 'Sciences', iconSource: require('@/assets/3dicons/3dicons-lab-front-color.png') },
    { key: 'engineering', label: 'Engineering', iconSource: require('@/assets/3dicons/3dicons-setting-front-color.png') },
    { key: 'humanities', label: 'Humanities', iconSource: require('@/assets/3dicons/3dicons-folder-front-color.png') },
    { key: 'business', label: 'Business', iconSource: require('@/assets/3dicons/3dicons-wallet-front-color.png') },
    { key: 'law', label: 'Law', iconSource: require('@/assets/3dicons/3dicons-bookmark-iso-color.png') },
    { key: 'medicine', label: 'Medicine', iconSource: require('@/assets/3dicons/3dicons-plus-dynamic-color.png') },
    { key: 'other', label: 'Other', iconSource: require('@/assets/3dicons/3dicons-pin-front-color.png') },
];

export default function FieldScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(3);
    }, []);

    const handleSelect = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(key);
        setOnboardingData({ field_of_study: key });
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/style');
        }
    };

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const iconColor = '#007AFF';

    return (
        <View style={{ flex: 1, backgroundColor: C.secondaryBackground }}>
            <SafeAreaView style={s.container}>
                
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <View style={s.stepRow}>
                            <Text style={[s.stepText, { color: iconColor }]}>Step 3 of 8</Text>
                            <View style={s.progressBar}>
                                <View style={[s.progressFill, { width: '42%', backgroundColor: iconColor }]} />
                            </View>
                        </View>
                        <Text style={[s.heroTitle, { color: textColor }]}>What do you want to study?</Text>
                    </Animated.View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={s.optionsGap}>
                        {FIELDS.map((field, index) => {
                            const isSelected = selected === field.key;

                            return (
                                <Animated.View 
                                    key={field.key}
                                    entering={FadeInDown.duration(600).delay(200 + index * 50)}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleSelect(field.key)}
                                        activeOpacity={0.8}
                                        style={[
                                            s.card, 
                                            isDark ? s.cardDark : s.cardLight,
                                            isSelected && s.cardSelected
                                        ]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7' }]}>
                                            <AnimatedIcon source={field.iconSource} size={24} animationType="pop" />
                                        </View>
                                        <Text style={[s.optionLabel, { color: textColor }]}>{field.label}</Text>
                                        {isSelected && (
                                            <CheckCircle size={24} color="#007AFF" />
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
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    headerSection: { paddingHorizontal: 24, paddingBottom: 24 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
    heroSubtitle: { fontSize: 17, fontWeight: '500', lineHeight: 24, opacity: 0.8 },
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
    optionsGap: { gap: 10 },

    // Glass Card System
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardLight: { 
        backgroundColor: '#FFFFFF', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 10, 
        elevation: 2,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardDark: { 
        backgroundColor: '#1C1C1E', 
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardSelected: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    optionLabel: { fontSize: 17, fontWeight: '700', flex: 1 },
    
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

    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    stepText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
});
