import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { NavArrowLeft, Sparks, Camera, NavArrowRight } from 'iconoir-react-native';
import * as ImagePicker from 'expo-image-picker';

// Pre-generated sample result to show during onboarding (no auth needed)
const generateSampleResult = (title: string) => {
    // If it's the scanned question, simulate scanning a physics/thermodynamics question.
    if (title === 'Scanned Question') {
        return {
            explanation: 'This is a fundamental concept that connects energy, disorder, and the direction of natural processes.',
            steps: [
                'Entropy is a measure of the disorder or randomness in a system. The more ways particles can be arranged, the higher the entropy.',
                'The Second Law states that the total entropy of an isolated system can only increase over time. Natural processes tend to move toward maximum disorder.',
                'When you drop an ice cube into hot water, heat flows from the water to the ice (never the reverse spontaneously). This increases the overall entropy of the system.',
                'This law explains why perpetual motion machines are impossible and why time appears to flow in one direction.',
            ],
            summary: 'Entropy measures disorder. The second law guarantees that disorder always increases in isolated systems, defining the "arrow of time."',
        };
    }

    // For typed topics, generate a smart, generic response incorporating their topic!
    return {
        explanation: `Here is a step-by-step breakdown of the core concepts behind ${title}.`,
        steps: [
            `The most fundamental principle of ${title} relies on understanding its structural foundation and core mechanics.`,
            `When applying ${title} in real-world scenarios, it systematically follows a predictable set of rules and patterns.`,
            `A common misconception about ${title} is that it's overly complex, but breaking it down reveals its highly intuitive nature.`,
            `Once you master ${title}, you unlock the ability to apply these exact same principles to much more advanced topics in the field.`,
        ],
        summary: `The essence of ${title} involves recognizing these underlying patterns and applying its core principles systematically.`,
    };
};

export default function DemoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState<'choose' | 'generate'>('choose');

    useEffect(() => {
        setOnboardingStep(5);
    }, []);

    const handleScanAndSolve = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Camera Access', 'Camera permission is needed to scan questions.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
            // Immediately proceed to create account
            router.push('/(onboarding)/create-account');
        }
    };

    const handleGenerate = () => {
        if (!topic.trim()) return;
        // Immediately proceed to create account
        router.push('/(onboarding)/create-account');
    };

    // Generate mode — show text input
    if (mode === 'generate') {
        return (
            <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />

                {/* Back button */}
                <TouchableOpacity onPress={() => setMode('choose')} style={s.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <NavArrowLeft width={18} height={18} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>

                <Animated.View entering={FadeInDown.duration(600)}>
                    <View style={s.headerSection}>
                        <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                            Type any topic.
                        </Text>
                        <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                            Skeeme will break it down step by step using your personalized context.
                        </Text>
                    </View>

                    <View style={[s.inputWrapper, isDark ? s.inputWrapperDark : s.inputWrapperLight]}>
                        <TextInput
                            style={[s.textInput, { color: isDark ? 'white' : 'black' }]}
                            placeholder="e.g. Photosynthesis, Newton's 3rd law..."
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            value={topic}
                            onChangeText={setTopic}
                            autoCapitalize="sentences"
                            autoFocus
                            returnKeyType="go"
                            onSubmitEditing={handleGenerate}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!topic.trim()}
                        activeOpacity={0.9}
                        style={[
                            s.mainBtn,
                            topic.trim() ? s.mainBtnActive : (isDark ? s.mainBtnDisabledDark : s.mainBtnDisabledLight)
                        ]}
                    >
                        <Sparks width={18} height={18} color={topic.trim() ? '#fff' : isDark ? '#52525b' : '#a1a1aa'} />
                        <Text style={[s.mainBtnText, topic.trim() ? s.textWhite : (isDark ? s.textSlate500 : s.textSlate400)]}>
                            Generate Explanation
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    // Choose mode — pick between Scan & Solve or Generate
    return (
        <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Experience it.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    Pick any topic or scan a question. See how Skeeme transforms your learning.
                </Text>
            </Animated.View>

            <View style={s.optionsGap}>
                {/* Scan & Solve */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <TouchableOpacity
                        onPress={handleScanAndSolve}
                        activeOpacity={0.9}
                        style={[s.optionCard, isDark ? s.optionCardDark : s.optionCardLight]}
                    >
                        <View style={s.flexRow}>
                            <View style={[s.iconBox, isDark ? s.bgSlate800 : s.bgSlate50]}>
                                <Camera width={26} height={26} color={isDark ? '#fff' : '#0f172a'} />
                            </View>
                            <View style={s.flex1}>
                                <Text style={[s.optionLabel, isDark ? s.textWhite : s.textSlate900]}>Scan & Solve</Text>
                                <Text style={[s.optionDesc, isDark ? s.textSlate400 : s.textSlate500]}>Point your camera at any question</Text>
                            </View>
                            <NavArrowRight width={18} height={18} color={isDark ? '#3f3f46' : '#d1d5db'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={s.dividerRow}>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                    <Text style={[s.dividerText, isDark ? s.textSlate600 : s.textSlate400]}>or</Text>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                </View>

                {/* Generate from Topic */}
                <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                    <TouchableOpacity
                        onPress={() => setMode('generate')}
                        activeOpacity={0.9}
                        style={[s.optionCard, isDark ? s.optionCardDark : s.optionCardLight]}
                    >
                        <View style={s.flexRow}>
                            <View style={[s.iconBox, isDark ? s.bgSlate800 : s.bgSlate50]}>
                                <Sparks width={26} height={26} color={isDark ? '#fff' : '#0f172a'} />
                            </View>
                            <View style={s.flex1}>
                                <Text style={[s.optionLabel, isDark ? s.textWhite : s.textSlate900]}>Type a Topic</Text>
                                <Text style={[s.optionDesc, isDark ? s.textSlate400 : s.textSlate500]}>Generate an AI instant lesson</Text>
                            </View>
                            <NavArrowRight width={18} height={18} color={isDark ? '#3f3f46' : '#d1d5db'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    backBtn: { marginBottom: 20 },
    headerSection: { marginBottom: 40 },
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    inputWrapper: { borderRadius: 24, borderWidth: 2, paddingHorizontal: 20, marginBottom: 20 },
    inputWrapperLight: { borderColor: '#f1f5f9', backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    inputWrapperDark: { borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
    textInput: { fontWeight: '700', fontSize: 16, height: 72 },
    
    mainBtn: { height: 56, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    mainBtnActive: { backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    mainBtnDisabledLight: { backgroundColor: '#f1f5f9' },
    mainBtnDisabledDark: { backgroundColor: '#1e293b' },
    mainBtnText: { fontWeight: '700', fontSize: 15, marginLeft: 8, letterSpacing: 0.5 },
    
    optionsGap: { gap: 16 },
    optionCard: { padding: 24, borderRadius: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    optionCardLight: { borderColor: '#f1f5f9', backgroundColor: 'white' },
    optionCardDark: { borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
    
    flexRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate700: { color: '#334155' },
    textSlate500: { color: '#64748b' },
    textSlate400: { color: '#94a3b8' },
    textSlate600: { color: '#475569' },
    
    optionLabel: { fontWeight: '700', fontSize: 16 },
    optionDesc: { fontWeight: '500', fontSize: 13, lineHeight: 18, marginTop: 4 },
    
    dividerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 20, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 },
});
