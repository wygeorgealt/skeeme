import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, ScrollView } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CheckCircle } from '@solar-icons/react-native/Bold';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';

const STYLES = [
    {
        key: 'simple',
        label: 'Simple & Clear',
        desc: "Break it down like I'm new to this topic.",
        iconSource: require('@/assets/3dicons/3dicons-sun-dynamic-color.png'),
    },
    {
        key: 'detailed',
        label: 'Detailed & Academic',
        desc: 'Give me the full exam-level answer.',
        iconSource: require('@/assets/3dicons/3dicons-location-dynamic-color.png'),
    },
];

export default function StyleScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, setOnboardingData } = useAuthStore();
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        setOnboardingStep(4);
    }, []);

    const handleSelect = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(key);
        setOnboardingData({ learning_style: key });
    };

    const handleNext = () => {
        if (selected) {
            router.push('/(onboarding)/tone' as any);
        }
    };

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const iconColor = '#007AFF';

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={s.container}>
                
                <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <View style={s.stepRow}>
                            <Text style={[s.stepText, { color: iconColor }]}>Step 4 of 8</Text>
                            <View style={s.progressBar}>
                                <View style={[s.progressFill, { width: '57%', backgroundColor: iconColor }]} />
                            </View>
                        </View>
                        <Text style={[s.heroTitle, { color: textColor }]}>What kind of explanations do you like?</Text>
                    </Animated.View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={s.optionsGap}>
                        {STYLES.map((style, index) => {
                            const isSelected = selected === style.key;

                            return (
                                <Animated.View 
                                    key={style.key}
                                    entering={FadeInDown.duration(600).delay(200 + index * 150)}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleSelect(style.key)}
                                        activeOpacity={0.8}
                                        style={[
                                            s.card, 
                                            isDark ? s.cardDark : s.cardLight,
                                            isSelected && s.cardSelected
                                        ]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7' }]}>
                                            <AnimatedIcon source={style.iconSource} size={28} animationType="wobble" />
                                        </View>
                                        <View style={s.textStack}>
                                            <Text style={[s.optionLabel, { color: textColor }]}>{style.label}</Text>
                                            <Text style={[s.optionDesc, { color: subtextColor }]}>{style.desc}</Text>
                                        </View>
                                        {isSelected && (
                                            <CheckCircle size={26} color="#007AFF" />
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <AnimatedButton
                        title="Continue"
                        onPress={handleNext}
                        disabled={!selected}
                        type="capsule"
                        backgroundColor="#007AFF"
                        shadowColor="#0066D6"
                        fullWidth
                    />
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
    optionsGap: { gap: 16 },

    // Glass Card System
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardLight: { 
        backgroundColor: '#FFFFFF', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.06, 
        shadowRadius: 16, 
        elevation: 4,
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
    
    iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    textStack: { flex: 1, justifyContent: 'center' },
    optionLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    optionDesc: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    
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
