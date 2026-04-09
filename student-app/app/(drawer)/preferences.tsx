import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme, StyleSheet } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const LEVELS: { key: string; label: string; icon: IconSymbolName }[] = [
    { key: 'high_school', label: 'High School', icon: 'graduationcap.fill' },
    { key: 'undergraduate', label: 'Undergraduate', icon: 'book.fill' },
    { key: 'masters', label: 'Masters / Graduate', icon: 'medal.fill' },
    { key: 'professional', label: 'Professional', icon: 'briefcase.fill' },
];

const STYLES = [
    { key: 'simple', label: 'Simple & Easy', desc: 'Everyday language, no jargon' },
    { key: 'detailed', label: 'Detailed', desc: 'In-depth academic breakdowns' },
] as const;

export default function PreferencesScreen() {
    const { user, updateUser } = useAuthStore();
    const prefs = user?.ai_preferences;

    const [level, setLevel] = useState<string>(prefs?.education_level || '');
    const [field, setField] = useState<string>(prefs?.field_of_study || '');
    const [style, setStyle] = useState<string>(prefs?.learning_style || '');
    const [tone, setTone] = useState<string>(prefs?.tone || '');
    const [language, setLanguage] = useState<string>(prefs?.language || 'english');
    const [saving, setSaving] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    // Sync if user data changes
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
            const payload = {
                education_level: level || null,
                field_of_study: field.trim() || null,
                learning_style: style || null,
            };

            const res = await api.post('preferences', payload);
            updateUser({ ai_preferences: res.data.ai_preferences });
            Alert.alert('Saved!', 'Your AI will now adapt to your preferences.');
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const SelectionGroup = ({ options, selectedKey, onSelect, hasDesc = true }: any) => {
        return (
            <View style={[s.groupedList, { backgroundColor: C.card }]}>
                {options.map((item: any, index: number) => {
                    const isSelected = selectedKey === item.key;
                    const isLast = index === options.length - 1;
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => {
                                haptics.impactAsync();
                                onSelect(isSelected ? '' : item.key);
                            }}
                            activeOpacity={0.8}
                            style={[
                                s.groupedRow,
                                !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') }
                            ]}
                        >
                            {item.icon && (
                                <View style={[s.iconBoxRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                                    <IconSymbol name={item.icon} size={20} color="#007AFF" />
                                </View>
                            )}
                            <View style={s.cardContent}>
                                <Text style={[s.cardTitle, { color: C.text }]}>{item.label}</Text>
                                {hasDesc && item.desc && (
                                    <Text style={[s.cardDesc, { color: '#8E8E93' }]}>
                                        {item.desc}
                                    </Text>
                                )}
                            </View>
                            {isSelected && (
                                <View style={s.checkCircleFilled}>
                                    <IconSymbol name="checkmark" size={24} color="#007AFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={s.headerTextContainer}>
                    <Text style={[s.title, { color: C.text }]}>Personalize</Text>
                    <Text style={[s.subtitle, { color: C.textSecondary }]}>Tailor your AI experience to match your academic level and learning preferences.</Text>
                </View>
            </View>

            <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {/* Education Level */}
                <Animated.View entering={FadeInDown.delay(100)} style={s.section}>
                    <Text style={s.sectionLabel}>ACADEMIC LEVEL</Text>
                    <SelectionGroup options={LEVELS} selectedKey={level} onSelect={setLevel} hasDesc={false} />
                </Animated.View>

                {/* Field of Study */}
                <Animated.View entering={FadeInDown.delay(200)} style={s.section}>
                    <Text style={s.sectionLabel}>FIELD OF STUDY</Text>
                    <View style={[s.groupedList, { backgroundColor: C.card }]}>
                        <View style={[s.groupedRow, { paddingVertical: 4 }]}>
                            <TextInput
                                value={field}
                                onChangeText={setField}
                                placeholder="E.g. Computer Science, Medicine..."
                                placeholderTextColor="#8E8E93"
                                style={[s.textInput, { color: C.text }]}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Learning Style */}
                <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                    <Text style={s.sectionLabel}>LEARNING STYLE</Text>
                    <View style={{ gap: 12 }}>
                        {STYLES.map((item: any) => {
                            const isSelected = style === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => {
                                        haptics.impactAsync();
                                        setStyle(isSelected ? '' : item.key);
                                    }}
                                    activeOpacity={0.8}
                                    style={[
                                        s.separateCard,
                                        { backgroundColor: C.card }
                                    ]}
                                >
                                    <View style={s.cardContent}>
                                        <Text style={[s.cardTitle, { color: C.text }]}>{item.label}</Text>
                                        <Text style={[s.cardDesc, { color: '#8E8E93' }]}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <IconSymbol name="checkmark" size={24} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                <View style={s.bottomSpacer} />
            </ScrollView>

            {/* Sticky Save Button */}
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={s.stickyFooter}>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                    style={s.saveBtnShadow}
                >
                    {saving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={s.saveBtnText}>Save Preferences</Text>
                    )}
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTextContainer: { flex: 1, paddingRight: 16 },
    title: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
    subtitle: { color: '#8E8E93', fontWeight: '500', fontSize: 13, marginTop: 4 },

    scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 8, marginLeft: 16 },
    groupedList: { borderRadius: 16, overflow: 'hidden' },
    groupedRow: { flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 60 },
    iconBoxRow: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    
    separateCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, minHeight: 70 },

    cardContent: { flex: 1, paddingRight: 16 },
    cardTitle: { fontWeight: '600', fontSize: 17 },
    cardDesc: { fontSize: 14, marginTop: 4, fontWeight: '400' },
    
    checkCircleFilled: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    
    textInput: { height: 50, fontSize: 17, flex: 1 },

    stickyFooter: { position: 'absolute', bottom: 90, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    saveBtnShadow: { width: '100%', height: 56, borderRadius: 100, backgroundColor: '#007AFF', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    
    bottomSpacer: { height: 20 },
});
