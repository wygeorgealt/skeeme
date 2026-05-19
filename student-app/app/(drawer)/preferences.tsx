import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { useAuthStore } from '@/store/authStore';
import * as ExpoHaptics from 'expo-haptics';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
    Diploma,
    Notebook,
    MedalRibbonsStar,
    Case,
    CheckCircle,
    LightbulbBolt,
    DocumentText,
    CupStar,
    Stars,
    Stopwatch,
    Settings,
    Heart,
    Rocket,
    Compass,
    Layers,
    AltArrowLeft
} from '@solar-icons/react-native/Bold';

import { Colors } from '@/constants/theme';

const LEVELS = [
    { key: 'high_school',   label: 'High School',      Icon: Diploma },
    { key: 'undergraduate', label: 'Undergraduate',     Icon: Notebook },
    { key: 'masters',       label: 'Masters / Graduate', Icon: MedalRibbonsStar },
    { key: 'professional',  label: 'Professional',       Icon: Case },
];

const STYLES = [
    { key: 'simple',   label: 'Simple & Easy', desc: 'Everyday language, simplified analogies', Icon: LightbulbBolt },
    { key: 'detailed', label: 'Detailed',       desc: 'In-depth academic breakdowns',          Icon: DocumentText },
] as const;

const TONES = [
    { key: 'supportive', label: 'Supportive Coach', desc: 'Warm, highly encouraging cheerleader', Icon: CupStar },
    { key: 'strict',     label: 'Strict Coach',     desc: 'Serious, rigorous, like a professor',   Icon: MedalRibbonsStar },
    { key: 'concise',    label: 'Concise & Direct', desc: 'Straight to the point, minimal chatter', Icon: Stopwatch },
    { key: 'fun',        label: 'Fun & Humorous',   desc: 'Witty, casual, uses pop references',    Icon: Stars },
];

const ANALOGIES = [
    { key: 'general',     label: 'General Academic', desc: 'Standard classroom illustrations',        Icon: Diploma },
    { key: 'tech',        label: 'Tech & Coding',     desc: 'Software, coding, hardware metaphors',    Icon: Settings },
    { key: 'sports',      label: 'Sports & Fitness', desc: 'Athletic, training, force and dynamics',   Icon: Heart },
    { key: 'gaming',      label: 'Gaming & Anime',   desc: 'Levels, RPG stats, gaming lore, fantasy', Icon: Rocket },
    { key: 'pop_culture', label: 'Pop Culture / Biz', desc: 'Coffee shops, trends, movies, business', Icon: Compass },
];

const GOALS = [
    { key: 'conceptual', label: 'Conceptual Deep-Dive', desc: 'First-principles and core theory focus',  Icon: Notebook },
    { key: 'exam',       label: 'Exam Prep Tactics',     desc: 'High-yield tips, drills, common traps', Icon: Layers },
    { key: 'cheat',      label: 'Quick Cheat-Sheet',     desc: 'Mnemonics, active recall, summaries',   Icon: DocumentText },
];

// ─── Card shadow helper ───────────────────────────────────────────────────────
const cardStyle = (C: typeof Colors.light) => ({
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: C.cardShadowColor,
    shadowOpacity: C.cardShadowOpacity,
    shadowRadius: C.cardShadowRadius,
    shadowOffset: C.cardShadowOffset,
    elevation: C.cardElevation,
});

export default function PreferencesScreen() {
    const { user, updateUser } = useAuthStore();
    const prefs = user?.ai_preferences;

    const [level, setLevel] = useState<string>(prefs?.education_level || '');
    const [field, setField] = useState<string>(prefs?.field_of_study || '');
    const [style, setStyle] = useState<string>(prefs?.learning_style || '');
    
    // New parameters
    const [tone, setTone] = useState<string>(prefs?.tone || 'supportive');
    const [analogyFocus, setAnalogyFocus] = useState<string>(prefs?.analogy_focus || 'general');
    const [academicGoal, setAcademicGoal] = useState<string>(prefs?.academic_goal || 'conceptual');
    const [customWeakness, setCustomWeakness] = useState<string>(prefs?.custom_weakness || '');

    const [saving, setSaving] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (prefs) {
            setLevel(prefs.education_level || '');
            setField(prefs.field_of_study || '');
            setStyle(prefs.learning_style || '');
            setTone(prefs.tone || 'supportive');
            setAnalogyFocus(prefs.analogy_focus || 'general');
            setAcademicGoal(prefs.academic_goal || 'conceptual');
            setCustomWeakness(prefs.custom_weakness || '');
        }
    }, [prefs]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('preferences', {
                education_level: level || null,
                field_of_study: field.trim() || null,
                learning_style: style || null,
                tone: tone || null,
                analogy_focus: analogyFocus || null,
                academic_goal: academicGoal || null,
                custom_weakness: customWeakness.trim() || null,
            });
            updateUser({ ai_preferences: res.data.ai_preferences });
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success, true);
            Alert.alert('Saved!', 'Your AI will now adapt to your preferences.', [
                { text: 'OK', onPress: () => router.replace('/') },
            ]);
        } catch (e: any) {
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error, true);
            Alert.alert('Error', e.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9'
                        }}
                    >
                        <AltArrowLeft size={24} color={C.text} />
                    </TouchableOpacity>
                    <Text style={[s.title, { color: C.text, marginBottom: 0 }]}>Personalize</Text>
                </View>
                <Text style={[s.subtitle, { color: C.textSecondary }]}>
                    Tailor your AI experience to match your academic level and learning preferences.
                </Text>
            </View>

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={{ paddingBottom: 220 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Academic Level */}
                <Animated.View entering={FadeInDown.delay(80)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>ACADEMIC LEVEL</Text>
                    <View style={cardStyle(C)}>
                        {LEVELS.map((item, index) => {
                            const isSelected = level === item.key;
                            const isLast = index === LEVELS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setLevel(isSelected ? '' : item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg }]}>
                                        <item.Icon size={20} color={isSelected ? '#007AFF' : '#007AFF'} />
                                    </View>
                                    <Text style={[s.rowLabel, { color: C.text }]}>{item.label}</Text>
                                    {isSelected && (
                                        <CheckCircle size={24} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Field of Study */}
                <Animated.View entering={FadeInDown.delay(160)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>FIELD OF STUDY</Text>
                    <View style={[cardStyle(C), s.inputCard]}>
                        <TextInput
                            value={field}
                            onChangeText={setField}
                            placeholder="E.g. Computer Science, Medicine..."
                            placeholderTextColor={C.textTertiary}
                            style={[s.textInput, { color: C.text }]}
                        />
                    </View>
                </Animated.View>

                {/* Learning Style */}
                <Animated.View entering={FadeInDown.delay(240)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>LEARNING STYLE</Text>
                    <View style={cardStyle(C)}>
                        {STYLES.map((item, index) => {
                            const isSelected = style === item.key;
                            const isLast = index === STYLES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setStyle(isSelected ? '' : item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        s.rowTall,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg }]}>
                                        <item.Icon size={20} color={isSelected ? '#007AFF' : '#007AFF'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.rowLabel, { color: C.text }]}>{item.label}</Text>
                                        <Text style={[s.rowDesc, { color: C.textSecondary }]}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* AI Tutor Personality */}
                <Animated.View entering={FadeInDown.delay(320)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>AI TUTOR PERSONALITY</Text>
                    <View style={cardStyle(C)}>
                        {TONES.map((item, index) => {
                            const isSelected = tone === item.key;
                            const isLast = index === TONES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setTone(item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        s.rowTall,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg }]}>
                                        <item.Icon size={20} color={isSelected ? '#007AFF' : '#007AFF'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.rowLabel, { color: C.text }]}>{item.label}</Text>
                                        <Text style={[s.rowDesc, { color: C.textSecondary }]}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Analogy Focus */}
                <Animated.View entering={FadeInDown.delay(400)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>ANALOGY FOCUS / INTERESTS</Text>
                    <View style={cardStyle(C)}>
                        {ANALOGIES.map((item, index) => {
                            const isSelected = analogyFocus === item.key;
                            const isLast = index === ANALOGIES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setAnalogyFocus(item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        s.rowTall,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg }]}>
                                        <item.Icon size={20} color={isSelected ? '#007AFF' : '#007AFF'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.rowLabel, { color: C.text }]}>{item.label}</Text>
                                        <Text style={[s.rowDesc, { color: C.textSecondary }]}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Academic Goal */}
                <Animated.View entering={FadeInDown.delay(480)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>STUDY GOAL & FOCUS</Text>
                    <View style={cardStyle(C)}>
                        {GOALS.map((item, index) => {
                            const isSelected = academicGoal === item.key;
                            const isLast = index === GOALS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setAcademicGoal(item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        s.rowTall,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg }]}>
                                        <item.Icon size={20} color={isSelected ? '#007AFF' : '#007AFF'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.rowLabel, { color: C.text }]}>{item.label}</Text>
                                        <Text style={[s.rowDesc, { color: C.textSecondary }]}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Custom Weakness / Instructions */}
                <Animated.View entering={FadeInDown.delay(560)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>WEAKNESSES / CUSTOM INSTRUCTIONS</Text>
                    <View style={[cardStyle(C), s.inputCard, { paddingVertical: 12 }]}>
                        <TextInput
                            value={customWeakness}
                            onChangeText={setCustomWeakness}
                            placeholder="E.g. Explain like I'm 5; focus on step-by-step math conversions; use analogies related to anime..."
                            placeholderTextColor={C.textTertiary}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                            style={[s.textInput, { color: C.text, height: 100, textAlignVertical: 'top' }]}
                        />
                        <Text style={{ alignSelf: 'flex-end', fontSize: 10, color: C.textTertiary, marginTop: 4 }}>
                            {customWeakness.length}/500 chars
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            <BlurView
                intensity={50}
                tint={isDark ? 'dark' : 'light'}
                style={[s.footer, {
                    paddingBottom: Math.max(insets.bottom, 16) + 75,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                }]}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                    style={s.saveBtn}
                >
                    {saving
                        ? <LoadingSpinner size={24} color="white" strokeWidth={3} />
                        : <Text style={s.saveBtnText}>Save Preferences</Text>
                    }
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 20 },
    title: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
    subtitle: { fontSize: 14, fontWeight: '400', lineHeight: 20 },

    scrollView: { flex: 1, paddingHorizontal: 16 },
    section: { marginBottom: 28 },
    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 },

    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, minHeight: 58 },
    rowTall: { paddingVertical: 16, minHeight: 72 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
    rowDesc: { fontSize: 13, marginTop: 2, fontFamily: 'Outfit-Regular' },

    inputCard: { paddingHorizontal: 16, paddingVertical: 4 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500', fontFamily: 'Outfit-Medium' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
    saveBtn: { width: '100%', height: 56, borderRadius: 100, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
