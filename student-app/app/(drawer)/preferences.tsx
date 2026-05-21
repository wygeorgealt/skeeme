import { Text } from '@/components/ui/Text';
import { useState, useEffect, useCallback } from 'react';

import {
    View, TextInput, TouchableOpacity, ScrollView, Alert,
    useColorScheme, StyleSheet, Platform
} from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import * as ExpoHaptics from 'expo-haptics';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
    Diploma, Notebook, MedalRibbonsStar, Case,
    LightbulbBolt, DocumentText, CupStar, Stars, Stopwatch,
    Settings, Heart, Rocket, Compass, Layers, AltArrowLeft,
    Book
} from '@solar-icons/react-native/Bold';

import { Colors } from '@/constants/theme';

// ─── Data ──────────────────────────────────────────────────────────────────────

const LEVELS = [
    { key: 'high_school',   label: 'High School',       emoji: '🎒', Icon: Diploma },
    { key: 'undergraduate', label: 'Undergraduate',      emoji: '📘', Icon: Notebook },
    { key: 'masters',       label: 'Masters / Grad',     emoji: '🎓', Icon: MedalRibbonsStar },
    { key: 'professional',  label: 'Professional',       emoji: '💼', Icon: Case },
];

const STYLES = [
    { key: 'simple',   label: 'Simple & Easy', desc: 'Everyday language, simplified analogies',  Icon: LightbulbBolt, gradient: ['#667eea', '#764ba2'] as const },
    { key: 'detailed', label: 'Detailed',       desc: 'In-depth academic breakdowns',             Icon: DocumentText,  gradient: ['#f093fb', '#f5576c'] as const },
];

const TONES = [
    { key: 'supportive', label: 'Supportive',  emoji: '🤗', Icon: CupStar },
    { key: 'strict',     label: 'Strict',      emoji: '📐', Icon: MedalRibbonsStar },
    { key: 'concise',    label: 'Concise',     emoji: '⚡', Icon: Stopwatch },
    { key: 'fun',        label: 'Fun & Witty', emoji: '😂', Icon: Stars },
];

const ANALOGIES = [
    { key: 'general',     label: 'Academic',   emoji: '📚', Icon: Diploma },
    { key: 'tech',        label: 'Tech',        emoji: '💻', Icon: Settings },
    { key: 'sports',      label: 'Sports',      emoji: '⚽', Icon: Heart },
    { key: 'gaming',      label: 'Gaming',      emoji: '🎮', Icon: Rocket },
    { key: 'pop_culture', label: 'Pop Culture', emoji: '🎬', Icon: Compass },
];

const GOALS = [
    { key: 'conceptual', label: 'Deep Dive',    desc: 'First-principles and core theory',    Icon: Book, gradient: ['#4facfe', '#00f2fe'] as const },
    { key: 'exam',       label: 'Exam Prep',    desc: 'High-yield tips, drills, traps',       Icon: MedalRibbonsStar, gradient: ['#f7971e', '#ffd200'] as const },
    { key: 'cheat',      label: 'Cheat Sheet',  desc: 'Mnemonics, recall, summaries',         Icon: DocumentText, gradient: ['#56ab2f', '#a8e063'] as const },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Chip pill — used for Academic Level, AI Tone, Analogy Focus */
function ChipButton({
    label, emoji, isSelected, onPress, isDark, C,
}: {
    label: string; emoji: string; isSelected: boolean;
    onPress: () => void; isDark: boolean; C: typeof Colors.light;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.chip,
                isSelected
                    ? { backgroundColor: '#007AFF', borderColor: '#007AFF' }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F8', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E4EF' },
            ]}
        >
            <Text style={styles.chipEmoji}>{emoji}</Text>
            <Text style={[styles.chipLabel, { color: isSelected ? '#fff' : C.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

/** Large gradient card — used for Learning Style and Study Goal */
function GradientCard({
    label, desc, isSelected, onPress, Icon, gradient,
}: {
    label: string; desc: string; isSelected: boolean;
    onPress: () => void; Icon: any;
    gradient: readonly [string, string];
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.gradCard}>
            <LinearGradient
                colors={isSelected ? gradient : ['#2C2C2E', '#1C1C1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradCardInner, isSelected && styles.gradCardSelected]}
            >
                <View style={styles.gradCardIconWrap}>
                    <Icon size={22} color={isSelected ? '#fff' : 'rgba(255,255,255,0.4)'} />
                </View>
                <Text style={[styles.gradCardLabel, !isSelected && { opacity: 0.55 }]}>{label}</Text>
                <Text style={[styles.gradCardDesc, !isSelected && { opacity: 0.35 }]}>{desc}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function PreferencesScreen() {
    const { user, updateUser } = useAuthStore();

    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );

    const prefs = user?.ai_preferences;

    const [level, setLevel] = useState<string>(prefs?.education_level || '');
    const [field, setField] = useState<string>(prefs?.field_of_study || '');
    const [style, setStyle] = useState<string>(prefs?.learning_style || '');
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
                { text: 'Got it', onPress: () => router.replace('/') },
            ]);
        } catch (e: any) {
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error, true);
            Alert.alert('Error', e.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: C.background }]}>

            {/* ── Hero Header ── */}
<Animated.View key={`hero-${animKey}`} entering={FadeInUp.duration(500)} style={[styles.hero, { paddingTop: Math.max(insets.top, 16) }]}>

                <TouchableOpacity
                    onPress={() => router.navigate({ pathname: '/(drawer)/account' })}
                    activeOpacity={0.7}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                >
                    <AltArrowLeft size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={[styles.heroTitle, { color: C.text }]}>Make your AI{'\n'}truly <Text style={{ color: '#007AFF' }}>yours</Text>.</Text>
                <Text style={[styles.heroSub, { color: C.textSecondary }]}>
                    Your tutor adapts its tone, depth, and analogies based on these settings.
                </Text>
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Academic Level ── */}
<Animated.View key={`lvl-${animKey}`} entering={FadeInDown.delay(80).duration(400)} style={styles.section}>

                    <SectionLabel label="🎓 Academic Level" />
                    <View style={styles.chipRow}>
                        {LEVELS.map(item => (
                            <ChipButton
                                key={item.key}
                                label={item.label}
                                emoji={item.emoji}
                                isSelected={level === item.key}
                                onPress={() => { haptics.selectionAsync(); setLevel(level === item.key ? '' : item.key); }}
                                isDark={isDark}
                                C={C}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── Field of Study ── */}
<Animated.View key={`field-${animKey}`} entering={FadeInDown.delay(160).duration(400)} style={styles.section}>

                    <SectionLabel label="📖 Field of Study" />
                    <View style={[styles.inputCard, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8F9FB',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8ECF4',
                    }]}>
                        <TextInput
                            value={field}
                            onChangeText={setField}
                            placeholder="E.g. Computer Science, Medicine..."
                            placeholderTextColor={C.textTertiary}
                            style={[styles.textInput, { color: C.text }]}
                        />
                    </View>
                </Animated.View>

                {/* ── Learning Style ── */}
<Animated.View key={`style-${animKey}`} entering={FadeInDown.delay(240).duration(400)} style={styles.section}>

                    <SectionLabel label="💡 Learning Style" />
                    <View style={styles.gradRow}>
                        {STYLES.map(item => (
                            <GradientCard
                                key={item.key}
                                label={item.label}
                                desc={item.desc}
                                isSelected={style === item.key}
                                onPress={() => { haptics.selectionAsync(); setStyle(style === item.key ? '' : item.key); }}
                                Icon={item.Icon}
                                gradient={item.gradient}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── AI Personality / Tone ── */}
<Animated.View key={`tone-${animKey}`} entering={FadeInDown.delay(320).duration(400)} style={styles.section}>

                    <SectionLabel label="🤖 AI Personality" />
                    <View style={styles.chipRow}>
                        {TONES.map(item => (
                            <ChipButton
                                key={item.key}
                                label={item.label}
                                emoji={item.emoji}
                                isSelected={tone === item.key}
                                onPress={() => { haptics.selectionAsync(); setTone(item.key); }}
                                isDark={isDark}
                                C={C}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── Analogy Focus ── */}
<Animated.View key={`anal-${animKey}`} entering={FadeInDown.delay(400).duration(400)} style={styles.section}>

                    <SectionLabel label="🔗 Analogy Style" />
                    <View style={styles.chipRow}>
                        {ANALOGIES.map(item => (
                            <ChipButton
                                key={item.key}
                                label={item.label}
                                emoji={item.emoji}
                                isSelected={analogyFocus === item.key}
                                onPress={() => { haptics.selectionAsync(); setAnalogyFocus(item.key); }}
                                isDark={isDark}
                                C={C}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── Study Goal ── */}
<Animated.View key={`goal-${animKey}`} entering={FadeInDown.delay(480).duration(400)} style={styles.section}>

                    <SectionLabel label="🎯 Study Goal" />
                    <View style={styles.gradRow}>
                        {GOALS.map(item => (
                            <GradientCard
                                key={item.key}
                                label={item.label}
                                desc={item.desc}
                                isSelected={academicGoal === item.key}
                                onPress={() => { haptics.selectionAsync(); setAcademicGoal(item.key); }}
                                Icon={item.Icon}
                                gradient={item.gradient}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── Custom Instructions ── */}
<Animated.View key={`custom-${animKey}`} entering={FadeInDown.delay(560).duration(400)} style={styles.section}>

                    <SectionLabel label="✍️ Custom Instructions" />
                    <View style={[styles.inputCard, styles.inputCardMulti, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8F9FB',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8ECF4',
                    }]}>
                        <TextInput
                            value={customWeakness}
                            onChangeText={setCustomWeakness}
                            placeholder={"E.g. Explain like I'm 5; focus on step-by-step math; use anime analogies..."}
                            placeholderTextColor={C.textTertiary}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                            style={[styles.textInput, styles.textInputMulti, { color: C.text }]}
                        />
                        <Text style={[styles.charCount, { color: C.textTertiary }]}>
                            {customWeakness.length}/500
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ── Sticky Save Footer ── */}
            <BlurView
                intensity={60}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 75 }]}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                    style={styles.saveBtn}
                >
                    <LinearGradient
                        colors={['#0A84FF', '#007AFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveBtnGrad}
                    >
                        {saving
                            ? <LoadingSpinner size={24} color="white" strokeWidth={3} />
                            : <Text style={styles.saveBtnText}>Save Preferences</Text>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

function SectionLabel({ label }: { label: string }) {
    return <Text style={styles.sectionLabel}>{label}</Text>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Hero Header
    hero: {
        paddingHorizontal: 22,
        paddingBottom: 24,
    },
    backBtn: {
        width: 42, height: 42, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,122,255,0.12)',
        borderRadius: 100,
        paddingHorizontal: 12, paddingVertical: 5,
        marginBottom: 12,
    },
    heroBadgeText: {
        color: '#007AFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.3,
    },
    heroTitle: {
        fontSize: 36, fontWeight: '900', letterSpacing: -1.2, lineHeight: 42, marginBottom: 10,
    },
    heroSub: {
        fontSize: 14, lineHeight: 21, fontWeight: '400',
    },

    // Sections
    section: { marginBottom: 30 },
    sectionLabel: {
        fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#007AFF',
    },

    // Chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 100, borderWidth: 1.5,
    },
    chipEmoji: { fontSize: 15 },
    chipLabel: { fontSize: 14, fontWeight: '600' },

    // Gradient Cards
    gradRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gradCard: { width: '47%' },
    gradCardInner: {
        borderRadius: 20, padding: 18, minHeight: 130,
        justifyContent: 'flex-end', overflow: 'hidden',
    },
    gradCardSelected: {
        shadowColor: '#007AFF',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    gradCardIconWrap: {
        width: 42, height: 42, borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
    },
    gradCardLabel: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    gradCardDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 },
    gradCardCheck: {
        position: 'absolute', top: 12, right: 12,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 100, padding: 4,
    },

    // Inputs
    inputCard: {
        borderRadius: 18, borderWidth: 1.5,
        paddingHorizontal: 16,
    },
    inputCardMulti: { paddingBottom: 10 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500' },
    textInputMulti: { height: 110, textAlignVertical: 'top', paddingTop: 14 },
    charCount: { fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    saveBtn: { borderRadius: 100, overflow: 'hidden' },
    saveBtnGrad: {
        height: 56, alignItems: 'center', justifyContent: 'center',
        borderRadius: 100,
    },
    saveBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
});
