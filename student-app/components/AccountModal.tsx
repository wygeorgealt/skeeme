import { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Platform,
    useColorScheme,
    Image,
    StyleSheet,
    Switch,
    KeyboardAvoidingView,
    Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, AccountModalView } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AltArrowRight,
    Pen,
    Bill,
    RoundArrowUp,
    Settings,
    Bell,
    QuestionCircle,
    CheckCircle,
    DocumentText,
    Logout,
    TrashBinTrash,
    CloseCircle,
    Gallery,
    Letter,
    Diploma,
    Notebook,
    MedalRibbonsStar,
    Case,
    LightbulbBolt,
    Copy,
    Forward,
    UsersGroupTwoRounded,
    WalletMoney,
    Stars,
    Stopwatch,
    Heart,
    Rocket,
    Compass,
    Layers
} from '@solar-icons/react-native/Bold';
import { Colors, Radius } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Modal } from 'react-native';
import { Modal as ReanimatedModal } from 'react-native-reanimated-modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import PreferencesModal from './PreferencesModal';
import SupportModal from './SupportModal';
import { CupStar } from '@solar-icons/react-native/Bold';
import { Share, Clipboard } from 'react-native';



const s = StyleSheet.create({
    scroll: { paddingHorizontal: 16 },
    profileSection: { alignItems: 'center', marginBottom: 32 },
    avatarCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarInitial: { fontSize: 36, fontWeight: '700' },
    profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
    profileEmail: { fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },
    sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
});

function SettingsRow({
    icon: Icon,
    iconBg,
    label,
    value,
    onPress,
    isLast = false,
    isDark,
    destructive = false,
    hasSwitch = false,
    switchValue = false,
    onSwitch = () => {},
}: {
    icon?: any;
    iconBg?: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
    isDark: boolean;
    destructive?: boolean;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitch?: (val: boolean) => void;
}) {
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <TouchableOpacity
            onPress={hasSwitch ? undefined : onPress}
            activeOpacity={hasSwitch ? 1 : 0.7}
            style={[s.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}
        >
            {Icon && iconBg && (
                <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
                    <Icon size={18} color="#fff" />
                </View>
            )}

            <Text
                style={{
                    ...s.rowLabel,
                    color: destructive ? C.destructive : C.text,
                    marginLeft: Icon ? 0 : 16,
                    textAlign: destructive ? 'center' : 'left',
                }}
                numberOfLines={1}
            >
                {label}
            </Text>

            {value ? <Text style={{ ...s.rowValue, color: C.textSecondary }}>{value}</Text> : null}

            {hasSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitch}
                    trackColor={{ false: '#767577', true: '#34C759' }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#f4f3f4'}
                />
            ) : (
                !!onPress && !destructive && Icon && <AltArrowRight size={18} color={C.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

function GroupedCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: Radius.lg,
                overflow: 'hidden',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: isDark ? C.glassBorder : 'transparent',
            }}
        >
            <View style={{ paddingLeft: 16 }}>{children}</View>
        </View>
    );
}

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

function PreferencesView({ onBack }: { onBack: () => void }) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
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

    const [isSaving, setIsSaving] = useState(false);

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

    const insets = useSafeAreaInsets();

    const handleSave = async () => {
        setIsSaving(true);
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
            Alert.alert('Success', 'Preferences updated successfully.');
            onBack();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to update preferences.';
            Alert.alert('Error', msg);
        } finally {
            setIsSaving(false);
        }
    };

    const iconBg = isDark ? 'rgba(0,122,255,0.15)' : '#EBF3FF';

    return (
        <View style={{ flex: 1 }}>
            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 180 }} 
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(300)}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8, letterSpacing: -0.5 }}>Personalization</Text>
                    <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24 }}>Tailor your AI experience to match your academic level and learning preferences.</Text>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>ACADEMIC LEVEL</Text>
                    <GroupedCard isDark={isDark}>
                        {LEVELS.map((item, index) => {
                            const isSelected = level === item.key;
                            const isLast = index === LEVELS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setLevel(isSelected ? '' : item.key)}
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 16, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <item.Icon size={20} color="#007AFF" />
                                    </View>
                                    <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: C.text }}>{item.label}</Text>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>FIELD OF STUDY</Text>
                    <GroupedCard isDark={isDark}>
                        <View style={{ paddingVertical: 8, paddingRight: 16 }}>
                            <TextInput
                                value={field}
                                onChangeText={setField}
                                placeholder="E.g. Computer Science, Medicine..."
                                placeholderTextColor={C.textTertiary}
                                style={{ height: 48, color: C.text, fontSize: 16, fontWeight: '500' }}
                            />
                        </View>
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>LEARNING STYLE</Text>
                    <GroupedCard isDark={isDark}>
                        {STYLES.map((item, index) => {
                            const isSelected = style === item.key;
                            const isLast = index === STYLES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setStyle(isSelected ? '' : item.key)}
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingRight: 16, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <item.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>AI TUTOR PERSONALITY</Text>
                    <GroupedCard isDark={isDark}>
                        {TONES.map((item, index) => {
                            const isSelected = tone === item.key;
                            const isLast = index === TONES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setTone(item.key)}
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingRight: 16, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <item.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>ANALOGY FOCUS / INTERESTS</Text>
                    <GroupedCard isDark={isDark}>
                        {ANALOGIES.map((item, index) => {
                            const isSelected = analogyFocus === item.key;
                            const isLast = index === ANALOGIES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setAnalogyFocus(item.key)}
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingRight: 16, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <item.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>STUDY GOAL & FOCUS</Text>
                    <GroupedCard isDark={isDark}>
                        {GOALS.map((item, index) => {
                            const isSelected = academicGoal === item.key;
                            const isLast = index === GOALS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setAcademicGoal(item.key)}
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingRight: 16, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? 'rgba(0,122,255,0.15)' : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <item.Icon size={20} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{item.desc}</Text>
                                    </View>
                                    {isSelected && <CheckCircle size={22} color="#007AFF" />}
                                </TouchableOpacity>
                            );
                        })}
                    </GroupedCard>

                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 }}>WEAKNESSES / CUSTOM INSTRUCTIONS</Text>
                    <GroupedCard isDark={isDark}>
                        <View style={{ paddingVertical: 12, paddingRight: 16 }}>
                            <TextInput
                                value={customWeakness}
                                onChangeText={setCustomWeakness}
                                placeholder="E.g. Explain like I'm 5; focus on step-by-step math conversions..."
                                placeholderTextColor={C.textTertiary}
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                                style={{ color: C.text, fontSize: 16, fontWeight: '500', height: 100, textAlignVertical: 'top' }}
                            />
                            <Text style={{ alignSelf: 'flex-end', fontSize: 10, color: C.textTertiary, marginTop: 4 }}>
                                {customWeakness.length}/500 chars
                            </Text>
                        </View>
                    </GroupedCard>
                </Animated.View>
            </ScrollView>

            <BlurView
                intensity={50}
                tint={isDark ? 'dark' : 'light'}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 16) + 16,
                    backgroundColor: 'transparent',
                }}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.8}
                    style={{ 
                        height: 56, 
                        backgroundColor: C.primary, 
                        borderRadius: 28, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        shadowColor: C.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6
                    }}
                >
                    {isSaving ? <LoadingSpinner size={24} color="#FFF" /> : <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Save Preferences</Text>}
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

function SupportView({ onBack }: { onBack: () => void }) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { user } = useAuthStore();
    const [message, setMessage] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const insets = useSafeAreaInsets();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setScreenshot(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!message.trim()) return Alert.alert('Required', 'Please describe the issue.');
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('message', message.trim());
            if (screenshot) {
                const filename = screenshot.split('/').pop() || 'screenshot.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                formData.append('screenshot', { uri: screenshot, name: filename, type } as any);
            }
            await api.post('support/contact', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('Sent', 'We received your report. Thank you!', [{ text: 'Okay', onPress: onBack }]);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to send report.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 140 }} 
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(300)}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8, letterSpacing: -0.5 }}>Report Issue</Text>
                    <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24 }}>Let us know if something isn't working right.</Text>

                    <GroupedCard isDark={isDark}>
                        <View style={{ paddingVertical: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 12, marginLeft: 4 }}>DESCRIPTION</Text>
                            <TextInput
                                style={{ height: 160, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderRadius: 16, padding: 16, color: C.text, fontSize: 16, fontWeight: '500', textAlignVertical: 'top' }}
                                placeholder="What's going on?"
                                placeholderTextColor={C.textTertiary}
                                multiline
                                value={message}
                                onChangeText={setMessage}
                            />
                        </View>

                        <View style={{ paddingVertical: 16, paddingRight: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 12, marginLeft: 4 }}>SCREENSHOT (OPTIONAL)</Text>
                            {screenshot ? (
                                <View style={{ position: 'relative' }}>
                                    <Image source={{ uri: screenshot }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" />
                                    <TouchableOpacity onPress={() => setScreenshot(null)} style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}>
                                        <CloseCircle size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={pickImage} style={{ height: 120, borderStyle: 'dashed', borderWidth: 2, borderColor: C.separator, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Gallery size={24} color={C.textTertiary} />
                                    <Text style={{ color: C.textTertiary, fontSize: 14, fontWeight: '600' }}>Add a screenshot</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </GroupedCard>
                </Animated.View>
            </ScrollView>

            <BlurView
                intensity={50}
                tint={isDark ? 'dark' : 'light'}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 16) + 16,
                    backgroundColor: 'transparent',
                }}
            >
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                    style={{ 
                        height: 56, 
                        backgroundColor: C.primary, 
                        borderRadius: 28, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        shadowColor: C.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6
                    }}
                >
                    {isSubmitting ? <LoadingSpinner size={24} color="#FFF" /> : <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Send Report</Text>}
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

function ReferralView({ onBack }: { onBack: () => void }) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    
    const [referralData, setReferralData] = useState<{ referral_code: string; share_text: string } | null>(null);
    const [stats, setStats] = useState<{ total_referrals: number; credits_earned: number } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [codeRes, statsRes] = await Promise.all([
                api.get('referral/my-code'),
                api.get('referral/stats')
            ]);
            setReferralData(codeRes.data);
            setStats(statsRes.data);
        } catch (e) {
            console.error('Failed to fetch referral data', e);
        }
    };

    const handleCopy = () => {
        if (referralData?.referral_code) {
            Clipboard.setString(referralData.referral_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (referralData?.share_text) {
            try {
                await Share.share({ message: referralData.share_text });
            } catch (e) {}
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 140 }} 
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(300)}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8, letterSpacing: -0.5 }}>Earn More Credits</Text>
                    <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24 }}>Invite friends to Skeeme and get rewarded when they start studying.</Text>

                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                        {[
                            { val: '200', label: 'Direct Refer' },
                            { val: '50', label: 'Friend of Friend' },
                            { val: '100', label: "Friend's Bonus" }
                        ].map((tier, i) => (
                            <View key={i} style={{ flex: 1, padding: 12, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', borderWidth: 1, borderColor: isDark ? C.glassBorder : 'transparent' }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#007AFF', marginBottom: 2 }}>{tier.val}</Text>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: C.textTertiary, textAlign: 'center' }}>{tier.label}</Text>
                            </View>
                        ))}
                    </View>

                    <GroupedCard isDark={isDark}>
                        <View style={{ padding: 20 }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: C.textTertiary, letterSpacing: 1, marginBottom: 8 }}>YOUR UNIQUE CODE</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: 2 }}>
                                    {referralData?.referral_code || '------'}
                                </Text>
                                <TouchableOpacity 
                                    onPress={handleCopy} 
                                    style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {copied ? <CheckCircle size={20} color="#34C759" /> : <Copy size={20} color="#007AFF" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </GroupedCard>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <UsersGroupTwoRounded size={18} color={C.textSecondary} />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textSecondary }}>{stats?.total_referrals || 0} Joins</Text>
                        </View>
                        <View style={{ width: 1, height: 16, backgroundColor: C.separator }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <WalletMoney size={18} color={C.textSecondary} />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textSecondary }}>{stats?.credits_earned || 0} Earned</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <BlurView
                intensity={50}
                tint={isDark ? 'dark' : 'light'}
                style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 16) + 16,
                }}
            >
                <TouchableOpacity
                    onPress={handleShare}
                    activeOpacity={0.8}
                    style={{ 
                        height: 56, backgroundColor: '#007AFF', borderRadius: 28, 
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                        shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6
                    }}
                >
                    <Forward size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>Share Invite Link</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

interface AccountModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function AccountModal({ visible, onDismiss }: AccountModalProps) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    const { user, logout, theme, setTheme, hapticsEnabled, setHapticsEnabled, notificationsEnabled, setNotificationsEnabled } = useAuthStore();

    const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Internal Navigation View
    const { accountModalView, toggleAccountModal } = useAuthStore();
    const [activeView, setActiveView] = useState<AccountModalView>('main');

    useEffect(() => {
        if (visible) {
            setActiveView(accountModalView);
        }
    }, [visible, accountModalView]);

    const bottomInset = insets.bottom ?? 0;

    useEffect(() => {
        if (activeView !== 'delete_account') return;
        setDeleteConfirmationCode(`DELETE-${Math.floor(1000 + Math.random() * 9000)}`);
        setDeleteInput('');
    }, [activeView]);

    const handleDeleteAccount = async () => {
        if (deleteInput !== deleteConfirmationCode) return;
        setIsDeleting(true);
        try {
            await api.delete('profile');
            Alert.alert('Account Deleted', 'Your account has been deleted permanently.');
            logout();
            router.replace('/login');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete account. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post('logout');
                    } catch {}
                    logout();
                    router.replace('/login');
                },
            },
        ]);
    };

    if (!user) return null;

    const firstChar = user.name?.trim()?.charAt(0) ?? '';

    return (
        <>
            <ReanimatedModal
                visible={visible}
                onHide={onDismiss}
                animation={{
                    type: 'slide',
                    duration: 300,
                }}
                swipe={{
                    enabled: activeView === 'main',
                    directions: ['down'],
                    threshold: 80,
                }}
                backdrop={false}
                contentContainerStyle={{
                    flex: 1,
                    backgroundColor: C.background,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    paddingHorizontal: 0,
                    paddingTop: 16,
                    paddingBottom: 0,
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 4,
                        backgroundColor: isDark ? '#475569' : '#CBD5E1',
                        borderRadius: 2,
                        alignSelf: 'center',
                        marginBottom: 16,
                    }}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 }}>
                    {activeView !== 'main' ? (
                        <TouchableOpacity 
                            onPress={() => setActiveView('main')} 
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                            <View style={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: 16, 
                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <AltArrowRight size={18} color={C.text} style={{ transform: [{ rotate: '180deg' }] }} />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>Back</Text>
                        </TouchableOpacity>
                    ) : <View />}

                    <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={{ fontSize: 28, fontWeight: '600', color: C.text }}>×</Text>
                    </TouchableOpacity>
                </View>

                {activeView === 'main' && (
                    <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 8, paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
                        <Animated.View entering={FadeIn.duration(200)}>
                            <View style={s.profileSection}>
                                <View style={[s.avatarCircle, { backgroundColor: C.primaryLight ?? '#F3E8FF' }]}>
                                    {user.avatar || user.avatar_url ? (
                                        <Image source={{ uri: user.avatar || user.avatar_url }} style={s.avatarImg} />
                                    ) : (
                                        <Text style={[s.avatarInitial, { color: C.primary }]}>{firstChar || ' '}</Text>
                                    )}
                                </View>

                                <Text style={[s.profileName, { color: C.text }]}>{user.name}</Text>
                                <Text style={[s.profileEmail, { color: C.textSecondary }]}>{user.email}</Text>
                            </View>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={Bill}
                                    iconBg="#007AFF"
                                    label="Subscription"
                                    value={user.plan_name === 'max' || user.is_unlimited ? 'Skeeme Max' : user.plan_name === 'pro' ? 'Skeeme Pro' : 'Skeeme Free'}
                                    isLast={user.plan_name === 'max' || user.is_unlimited}
                                    isDark={isDark}
                                />
                                {user.plan_name === 'free' && (
                                    <SettingsRow
                                        icon={RoundArrowUp}
                                        iconBg="#FF9500"
                                        label="Upgrade"
                                        onPress={() => {
                                            try {
                                                onDismiss();
                                                router.push('/paywall');
                                            } catch {}
                                        }}
                                        isDark={isDark}
                                    />
                                )}
                                <SettingsRow
                                    icon={CupStar}
                                    iconBg="#34C759"
                                    label="Refer a Friend"
                                    onPress={() => setActiveView('referral')}
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Preferences</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={Settings}
                                    iconBg="#5E5CE6"
                                    label="Personalization"
                                    onPress={() => {
                                        setActiveView('preferences');
                                    }}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Bell}
                                    iconBg="#FF2D55"
                                    label="Notifications"
                                    hasSwitch
                                    switchValue={notificationsEnabled}
                                    onSwitch={(v) => {
                                        void setNotificationsEnabled(v);
                                    }}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Settings}
                                    iconBg="#FF9500"
                                    label="Haptic Feedback"
                                    hasSwitch
                                    switchValue={hapticsEnabled}
                                    onSwitch={(v) => {
                                        void setHapticsEnabled(v);
                                    }}
                                    isDark={isDark}
                                />

                                <View style={{ paddingVertical: 12, paddingRight: 16 }}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {(['light', 'dark', 'system'] as const).map((t) => (
                                            <TouchableOpacity
                                                key={t}
                                                onPress={() => setTheme(t)}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 8,
                                                    borderRadius: 8,
                                                    alignItems: 'center',
                                                    backgroundColor:
                                                        theme === t
                                                            ? C.primary
                                                            : isDark
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : '#F1F5F9',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: '700',
                                                        color: theme === t ? '#FFF' : C.text,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {t}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </GroupedCard>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Support</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={QuestionCircle}
                                    iconBg="#8E8E93"
                                    label="Report Issue"
                                    onPress={() => {
                                        setActiveView('support');
                                    }}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={CheckCircle}
                                    iconBg="#8E8E93"
                                    label="Privacy Policy"
                                    onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={DocumentText}
                                    iconBg="#8E8E93"
                                    label="Terms of Service"
                                    onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Logout}
                                    iconBg="#34C759"
                                    label="Sign Out"
                                    onPress={handleSignOut}
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>

                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={TrashBinTrash}
                                    iconBg="#EF4444"
                                    label="Delete Account"
                                    onPress={() => setActiveView('delete_account')}
                                    destructive
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>
                        </Animated.View>
                    </ScrollView>
                )}

                {activeView === 'preferences' && <PreferencesView onBack={() => setActiveView('main')} />}
                {activeView === 'support' && <SupportView onBack={() => setActiveView('main')} />}
                {activeView === 'referral' && <ReferralView onBack={() => setActiveView('main')} />}
                {activeView === 'delete_account' && (
                    <DeleteAccountView 
                        onBack={() => setActiveView('main')}
                        deleteConfirmationCode={deleteConfirmationCode}
                        deleteInput={deleteInput}
                        setDeleteInput={setDeleteInput}
                        isDeleting={isDeleting}
                        handleDeleteAccount={handleDeleteAccount}
                        isDark={isDark}
                        C={C}
                    />
                )}
            </ReanimatedModal>
        </>
    );
}

function DeleteAccountView({ onBack, deleteConfirmationCode, deleteInput, setDeleteInput, isDeleting, handleDeleteAccount, isDark, C }: any) {
    return (
        <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#EF4444', marginBottom: 12, letterSpacing: -0.5 }}>Delete Account</Text>
            <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, lineHeight: 22 }}>
                This is a permanent action. To confirm, please type the following code exactly:
                {"\n\n"}
                <Text style={{ fontWeight: '800', color: C.text, fontSize: 18, letterSpacing: 1 }}>{deleteConfirmationCode}</Text>
            </Text>
            
            <TextInput
                placeholder="Type the code here..."
                placeholderTextColor={C.textTertiary}
                value={deleteInput}
                onChangeText={setDeleteInput}
                autoCapitalize="characters"
                style={{
                    height: 56,
                    borderWidth: 2,
                    borderColor: deleteInput === deleteConfirmationCode ? '#34C759' : C.separator,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    fontWeight: '600',
                    color: C.text,
                    marginBottom: 24,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.7}
                    style={{
                        flex: 1,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: C.text, fontSize: 15, fontWeight: '700' }}>Keep Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDeleteAccount}
                    disabled={deleteInput !== deleteConfirmationCode || isDeleting}
                    activeOpacity={0.8}
                    style={{
                        flex: 1,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: deleteInput === deleteConfirmationCode ? '#EF4444' : (isDark ? '#471a1a' : '#fee2e2'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: deleteInput === deleteConfirmationCode ? 1 : 0.6,
                    }}
                >
                    {isDeleting ? (
                        <LoadingSpinner size={20} color="#fff" />
                    ) : (
                        <Text style={{ color: deleteInput === deleteConfirmationCode ? '#fff' : '#ef4444', fontSize: 15, fontWeight: '800' }}>Confirm Delete</Text>
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}
