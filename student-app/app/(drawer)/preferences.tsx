import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';

const LEVELS = [
    { key: 'high_school', label: 'High School', icon: 'school-outline' },
    { key: 'undergraduate', label: 'Undergraduate', icon: 'book-outline' },
    { key: 'masters', label: 'Masters / Graduate', icon: 'ribbon-outline' },
    { key: 'professional', label: 'Professional', icon: 'briefcase-outline' },
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

    return (
        <ScrollView className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <View className="px-6 py-8">
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Personalize AI
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium text-[15px] leading-relaxed">
                        Tell us about your academic needs so the AI can tailor quizzes, flashcards, and explanations just for you.
                    </Text>
                </View>

                {/* Education Level */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Education Level
                    </Text>
                    <View className="gap-2">
                        {LEVELS.map(l => (
                            <TouchableOpacity
                                key={l.key}
                                onPress={() => setLevel(level === l.key ? '' : l.key)}
                                className={`flex-row items-center p-4 rounded-2xl border ${level === l.key
                                    ? 'bg-brand-primary/10 border-brand-primary/50'
                                    : 'bg-white/70 dark:bg-white/5 border-slate-100 dark:border-slate-800'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={l.icon as any}
                                    size={22}
                                    color={level === l.key ? '#D2B48C' : '#94a3b8'}
                                />
                                <Text className={`ml-3 font-bold text-[15px] ${level === l.key
                                    ? 'text-brand-primary'
                                    : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {l.label}
                                </Text>
                                {level === l.key && (
                                    <Ionicons name="checkmark-circle" size={20} color="#D2B48C" style={{ marginLeft: 'auto' }} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Study Language */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Study Language
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {LANGUAGES.map(l => (
                            <TouchableOpacity
                                key={l.key}
                                onPress={() => setLanguage(l.key)}
                                className={`px-4 py-2.5 rounded-full border ${language === l.key
                                    ? 'bg-brand-primary border-brand-primary'
                                    : 'bg-white/70 dark:bg-white/5 border-slate-200 dark:border-slate-800'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-bold text-sm ${language === l.key
                                    ? 'text-white'
                                    : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {l.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Field of Study */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Field of Study
                    </Text>
                    <TextInput
                        value={field}
                        onChangeText={setField}
                        placeholder="e.g. Computer Science, Nursing, Business..."
                        placeholderTextColor="#94a3b8"
                        className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white font-medium focus:border-brand-primary"
                    />
                </View>

                {/* Learning Style */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Learning Style
                    </Text>
                    <View className="gap-2">
                        {STYLES.map(s => (
                            <TouchableOpacity
                                key={s.key}
                                onPress={() => setStyle(style === s.key ? '' : s.key)}
                                className={`p-4 rounded-2xl border ${style === s.key
                                    ? 'bg-brand-primary/10 border-brand-primary/50'
                                    : 'bg-white/70 dark:bg-white/5 border-slate-100 dark:border-slate-800'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-bold text-[15px] ${style === s.key
                                    ? 'text-brand-primary'
                                    : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {s.label}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                                    {s.desc}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* AI Tone */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        AI Tone
                    </Text>
                    <View className="gap-2">
                        {TONES.map(t => (
                            <TouchableOpacity
                                key={t.key}
                                onPress={() => setTone(tone === t.key ? '' : t.key)}
                                className={`p-4 rounded-2xl border ${tone === t.key
                                    ? 'bg-brand-primary/10 border-brand-primary/50'
                                    : 'bg-white/70 dark:bg-white/5 border-slate-100 dark:border-slate-800'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-bold text-[15px] ${tone === t.key
                                    ? 'text-brand-primary'
                                    : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {t.label}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                                    {t.desc}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`h-[56px] bg-brand-primary rounded-2xl items-center justify-center flex-row shadow-sm ${saving ? 'opacity-60' : ''}`}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color="white" />
                            <Text className="font-bold text-[16px] text-white ml-2">Save Preferences</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-slate-400 dark:text-slate-500 text-xs font-medium mt-4 px-4 leading-relaxed">
                    These preferences shape how the AI generates quizzes, flashcards, and explanations. You can change them anytime.
                </Text>
            </View>
        </ScrollView>
    );
}
