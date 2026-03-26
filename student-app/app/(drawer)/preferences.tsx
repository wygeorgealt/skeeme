import { Text } from '@/components/ui/Text';
import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme, StyleSheet } from 'react-native';
import { Menu, Sparks, CheckCircle, GraduationCap, Book, Medal, Suitcase } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router, useNavigation } from 'expo-router';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: GraduationCap },
    { key: 'undergraduate', label: 'Undergraduate', icon: Book },
    { key: 'masters', label: 'Masters / Graduate', icon: Medal },
    { key: 'professional', label: 'Professional', icon: Suitcase },
] as const;

const STYLES = [
    { key: 'simple', label: 'Simple & Easy', desc: 'Everyday language, no jargon' },
    { key: 'detailed', label: 'Detailed', desc: 'In-depth academic breakdowns' },
    { key: 'analogies', label: 'Analogies', desc: 'Real-world examples & comparisons' },
] as const;

const TONES = [
    { key: 'encouraging', label: '😊 Encouraging', desc: 'Warm and supportive' },
    { key: 'strict', label: '📏 Strict', desc: 'Formal and rigorous' },
    { key: 'concise', label: '⚡ Concise', desc: 'Short and direct' },
] as const;

const LANGUAGES = [
    { key: 'english', label: 'English' },
    { key: 'spanish', label: 'Spanish' },
    { key: 'french', label: 'French' },
    { key: 'arabic', label: 'Arabic' },
    { key: 'portuguese', label: 'Portuguese' },
    { key: 'german', label: 'German' },
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
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();

    // Sync if user data changes
    useEffect(() => {
        if (prefs) {
            setLevel(prefs.education_level || '');
            setField(prefs.field_of_study || '');
            setStyle(prefs.learning_style || '');
            setTone(prefs.tone || '');
            setLanguage(prefs.language || 'english');
        }
    }, [prefs]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                education_level: level || null,
                field_of_study: field.trim() || null,
                learning_style: style || null,
                tone: tone || null,
                language: language || 'english',
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

    const SelectionCard = ({ item, isSelected, onPress, hasDesc = true }: any) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={s.cardWrapper}
            >
                <BlurView 
                    intensity={isSelected ? (isDark ? 50 : 80) : (isDark ? 10 : 30)} 
                    tint={isDark ? 'dark' : 'light'} 
                    style={[
                        s.card, 
                        isSelected && s.cardSelected
                    ]}
                >
                    {isSelected && (
                        <LinearGradient
                            colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.1)']}
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                    {Icon && (
                        <View style={[
                            s.iconBox,
                            isSelected ? s.iconBoxSelected : (isDark ? s.bgWhite10 : s.bgWhite60)
                        ]}>
                            <Icon width={18} height={18} color={isSelected ? 'white' : '#8B5CF6'} />
                        </View>
                    )}
                    <View style={s.cardContent}>
                        <Text style={[
                            s.cardTitle,
                            isDark ? s.textWhite : s.textSlate900
                        ]}>
                            {item.label}
                        </Text>
                        {hasDesc && item.desc && (
                            <Text style={[
                                s.cardDesc,
                                isDark ? s.textSlate400 : s.textSlate600
                            ]}>
                                {item.desc}
                            </Text>
                        )}
                    </View>
                    {isSelected ? (
                        <View style={s.checkCircleFilled}>
                            <CheckCircle width={18} height={18} color="white" />
                        </View>
                    ) : (
                        <View style={[s.checkCircleEmpty, isDark ? s.borderWhite10 : s.borderSlate200]} />
                    )}
                </BlurView>
            </TouchableOpacity>
        );
    };

    return (
        <GlowBackground isRoot={true}>
            <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={s.headerTextContainer}>
                    <Text style={[s.title, isDark ? s.textWhite : s.textSlate900]}>Personalize</Text>
                    <Text style={s.subtitle}>Tailor your AI experience to match your academic level and learning preferences.</Text>
                </View>
                {prefs?.education_level && (
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        activeOpacity={0.7}
                        style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}
                    >
                        <Menu width={20} height={20} color={isDark ? 'white' : '#1e293b'} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {/* Education Level */}
                <Animated.View entering={FadeInDown.delay(100)} style={s.section}>
                    <Text style={s.sectionLabel}>Academic Level</Text>
                    <BlurView intensity={isDark ? 10 : 20} tint={isDark ? 'dark' : 'light'} style={s.sectionGlass}>
                        {LEVELS.map(l => (
                            <SelectionCard 
                                key={l.key} 
                                item={l} 
                                isSelected={level === l.key} 
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setLevel(level === l.key ? '' : l.key);
                                }} 
                                hasDesc={false}
                            />
                        ))}
                    </BlurView>
                </Animated.View>

                {/* Field of Study */}
                <Animated.View entering={FadeInDown.delay(200)} style={s.section}>
                    <Text style={s.sectionLabel}>Field of Study</Text>
                    <BlurView intensity={isDark ? 10 : 20} tint={isDark ? 'dark' : 'light'} style={s.inputGlass}>
                        <TextInput
                            value={field}
                            onChangeText={setField}
                            placeholder="e.g. Computer Science, Medicine..."
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            style={[s.textInput, { color: isDark ? 'white' : '#0f172a' }]}
                        />
                    </BlurView>
                </Animated.View>

                {/* Learning Style */}
                <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                    <Text style={s.sectionLabel}>Learning Style</Text>
                    <BlurView intensity={isDark ? 10 : 20} tint={isDark ? 'dark' : 'light'} style={s.sectionGlass}>
                        {STYLES.map(sItem => (
                            <SelectionCard 
                                key={sItem.key} 
                                item={sItem} 
                                isSelected={style === sItem.key} 
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setStyle(style === sItem.key ? '' : sItem.key);
                                }} 
                            />
                        ))}
                    </BlurView>
                </Animated.View>

                {/* AI Tone */}
                <Animated.View entering={FadeInDown.delay(400)} style={s.section}>
                    <Text style={s.sectionLabel}>Interaction Tone</Text>
                    <BlurView intensity={isDark ? 10 : 20} tint={isDark ? 'dark' : 'light'} style={s.sectionGlass}>
                        {TONES.map(t => (
                            <SelectionCard 
                                key={t.key} 
                                item={t} 
                                isSelected={tone === t.key} 
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setTone(tone === t.key ? '' : t.key);
                                }} 
                            />
                        ))}
                    </BlurView>
                </Animated.View>

                {/* Language */}
                <Animated.View entering={FadeInDown.delay(500)} style={s.languageSection}>
                    <Text style={s.sectionLabel}>Primary Language</Text>
                    <BlurView intensity={isDark ? 10 : 20} tint={isDark ? 'dark' : 'light'} style={s.languageGlass}>
                        <View style={s.languageGrid}>
                            {LANGUAGES.map(l => (
                                <TouchableOpacity
                                    key={l.key}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setLanguage(l.key);
                                    }}
                                    activeOpacity={0.8}
                                    style={[s.langBtn, language === l.key ? s.langBtnSelected : (isDark ? s.bgWhite10 : s.bgWhite60)]}
                                >
                                    {language === l.key && (
                                        <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                                    )}
                                    <Text style={[s.langText, language === l.key ? s.textWhite : (isDark ? s.textSlate400 : s.textSlate600)]}>
                                        {l.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </BlurView>
                </Animated.View>

                <View style={s.bottomSpacer} />
            </ScrollView>

            {/* Sticky Save Button */}
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={s.stickyFooter}>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                    style={s.saveBtnShadow}
                >
                    <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGradient}>
                        {saving ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Sparks width={20} height={20} color="white" />
                                <View style={{ width: 10 }} />
                                <Text style={s.saveBtnText}>Update My AI Assistant</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTextContainer: { flex: 1, paddingRight: 16 },
    title: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
    subtitle: { color: '#64748b', fontWeight: '600', fontSize: 13, marginTop: 4 },
    menuBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: 'rgba(255,255,255,0.6)' },

    scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
    sectionGlass: { borderRadius: 32, overflow: 'hidden', padding: 8 },
    inputGlass: { borderRadius: 20, overflow: 'hidden', padding: 4 },
    languageGlass: { borderRadius: 24, overflow: 'hidden', padding: 16 },

    cardWrapper: { marginBottom: 8 },
    card: { padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
    cardSelected: { borderBottomWidth: 2, borderBottomColor: 'rgba(139, 92, 246, 0.3)' },

    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconBoxSelected: { backgroundColor: '#8B5CF6' },
    
    cardContent: { flex: 1 },
    cardTitle: { fontWeight: '800', fontSize: 15 },
    cardDesc: { fontSize: 11, marginTop: 2, fontWeight: '500' },
    
    checkCircleFilled: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
    checkCircleEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
    
    textInput: { height: 50, paddingHorizontal: 16, fontWeight: '700', fontSize: 15 },
    
    languageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    langBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, overflow: 'hidden' },
    langBtnSelected: { elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    langText: { fontWeight: '800', fontSize: 13 },

    stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    saveBtnShadow: { height: 56, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    saveBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '900', fontSize: 16, marginLeft: 10, letterSpacing: -0.3 },
    
    footerNote: { textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    bottomSpacer: { height: 20 },

    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
    bgWhite60: { backgroundColor: 'rgba(255,255,255,0.6)' },
    bgBlack20: { backgroundColor: 'rgba(0,0,0,0.2)' },
    borderWhite10: { borderColor: 'rgba(255,255,255,0.1)' },
    borderSlate200: { borderColor: '#E2E8F0' },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate600: { color: '#475569' },
    languageSection: { marginBottom: 40 },
});
