import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Diploma, Notebook, MedalRibbonsStar, Case, CheckCircle, LightbulbBolt, DocumentText } from '@solar-icons/react-native/Bold';

import { Colors } from '@/constants/theme';

const LEVELS = [
    { key: 'high_school',   label: 'High School',      Icon: Diploma },
    { key: 'undergraduate', label: 'Undergraduate',     Icon: Notebook },
    { key: 'masters',       label: 'Masters / Graduate', Icon: MedalRibbonsStar },
    { key: 'professional',  label: 'Professional',       Icon: Case },
];

const STYLES = [
    { key: 'simple',   label: 'Simple & Easy', desc: 'Everyday language, no jargon',    Icon: LightbulbBolt },
    { key: 'detailed', label: 'Detailed',       desc: 'In-depth academic breakdowns',    Icon: DocumentText },
] as const;

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
        }
    }, [prefs]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('preferences', {
                education_level: level || null,
                field_of_study: field.trim() || null,
                learning_style: style || null,
            });
            updateUser({ ai_preferences: res.data.ai_preferences });
            Alert.alert('Saved!', 'Your AI will now adapt to your preferences.', [
                { text: 'OK', onPress: () => router.replace('/') },
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={[s.title, { color: C.text }]}>Personalize</Text>
                <Text style={[s.subtitle, { color: C.textSecondary }]}>
                    Tailor your AI experience to match your academic level and learning preferences.
                </Text>
            </View>

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={{ paddingBottom: 150 }}
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
                                    onPress={() => { haptics.impactAsync(); setLevel(isSelected ? '' : item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: iconBg }]}>
                                        <item.Icon size={20} color="#007AFF" />
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
                                    onPress={() => { haptics.impactAsync(); setStyle(isSelected ? '' : item.key); }}
                                    activeOpacity={0.75}
                                    style={[
                                        s.row,
                                        s.rowTall,
                                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                                    ]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: iconBg }]}>
                                        <item.Icon size={20} color="#007AFF" />
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
            </ScrollView>

            {/* Sticky Save Button */}
            <BlurView
                intensity={Platform.OS === 'ios' ? 100 : 0}
                tint={isDark ? 'dark' : 'light'}
                style={[s.footer, {
                    paddingBottom: Math.max(insets.bottom, 16) + 75,
                    backgroundColor: isDark
                        ? (Platform.OS === 'android' ? '#0D0D0D' : 'rgba(13,13,13,0.85)')
                        : (Platform.OS === 'android' ? '#F0F2F7' : 'rgba(240,242,247,0.9)'),
                    borderTopColor: C.separator,
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
    rowDesc: { fontSize: 13, marginTop: 2 },

    inputCard: { paddingHorizontal: 16, paddingVertical: 4 },
    textInput: { height: 52, fontSize: 16, fontWeight: '500' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
    saveBtn: { width: '100%', height: 56, borderRadius: 100, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
