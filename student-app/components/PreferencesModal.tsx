import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, useColorScheme, StyleSheet, Platform } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Diploma, Notebook, MedalRibbonsStar, Case, CheckCircle, LightbulbBolt, DocumentText } from '@solar-icons/react-native/Bold';
import { Colors } from '@/constants/theme';
import { Modal } from 'react-native-reanimated-modal';

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

const cardStyle = (C: typeof Colors.light) => ({
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: C.cardShadowColor,
    shadowOpacity: C.cardShadowOpacity,
    shadowRadius: C.cardShadowRadius,
    shadowOffset: C.cardShadowOffset,
    elevation: C.cardElevation,
});

interface PreferencesModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function PreferencesModal({ visible, onDismiss }: PreferencesModalProps) {
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
        if (visible && prefs) {
            setLevel(prefs.education_level || '');
            setField(prefs.field_of_study || '');
            setStyle(prefs.learning_style || '');
        }
    }, [visible, prefs]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('preferences', {
                education_level: level || null,
                field_of_study: field.trim() || null,
                learning_style: style || null,
            });
            updateUser({ ai_preferences: res.data.ai_preferences });
            onDismiss();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';

    return (
        <Modal
            visible={visible}
            onHide={onDismiss}
            animation={{ type: 'slide', duration: 300 }}
            swipe={{ enabled: true, directions: ['down'], threshold: 80 }}
            backdrop={false}
            contentContainerStyle={{
                flex: 1,
                backgroundColor: C.background,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                paddingTop: 16,
            }}
        >
            <View style={s.handle} />
            
            <View style={[s.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View>
                    <Text style={[s.title, { color: C.text }]}>Personalize</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>Tailor your AI experience.</Text>
                </View>
                <TouchableOpacity onPress={onDismiss} style={s.closeBtn}>
                    <Text style={{ fontSize: 28, fontWeight: '600', color: C.text }}>×</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={s.scrollView}
                contentContainerStyle={{ paddingBottom: 220 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(80)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>ACADEMIC LEVEL</Text>
                    <View style={cardStyle(C)}>
                        {LEVELS.map((item, index) => {
                            const isSelected = level === item.key;
                            const isLast = index === LEVELS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { setLevel(isSelected ? '' : item.key); }}
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
                                    {isSelected && <CheckCircle size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

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

                <Animated.View entering={FadeInDown.delay(240)} style={s.section}>
                    <Text style={[s.sectionLabel, { color: C.textTertiary }]}>LEARNING STYLE</Text>
                    <View style={cardStyle(C)}>
                        {STYLES.map((item, index) => {
                            const isSelected = style === item.key;
                            const isLast = index === STYLES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => { setStyle(isSelected ? '' : item.key); }}
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

            <BlurView
                intensity={50}
                tint={isDark ? 'dark' : 'light'}
                style={[s.footer, {
                    paddingBottom: Math.max(insets.bottom, 16),
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
        </Modal>
    );
}

const s = StyleSheet.create({
    handle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    header: { paddingHorizontal: 24, paddingBottom: 20 },
    closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
    subtitle: { fontSize: 14, fontWeight: '400' },
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
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
    saveBtn: { width: '100%', height: 56, borderRadius: 100, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
