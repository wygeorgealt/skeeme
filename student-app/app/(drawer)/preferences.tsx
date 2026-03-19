import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme } from 'react-native';
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

    const SelectionCard = ({ item, isSelected, onPress, hasDesc = true }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className={`p-6 rounded-[28px] border mb-3 flex-row items-center ${isSelected 
                ? (isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900') 
                : (isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm')}`}
        >
            {item.icon && (
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isSelected ? (isDark ? 'bg-slate-100' : 'bg-slate-800') : (isDark ? 'bg-slate-800' : 'bg-slate-50')}`}>
                    <Ionicons name={item.icon} size={22} color={isSelected ? (isDark ? '#0f0f11' : 'white') : '#D2B48C'} />
                </View>
            )}
            <View className="flex-1">
                <Text className={`font-bold text-[16px] ${isSelected ? (isDark ? 'text-slate-900' : 'text-white') : (isDark ? 'text-white' : 'text-slate-900')}`}>
                    {item.label}
                </Text>
                {hasDesc && item.desc && (
                    <Text className={`text-[12px] mt-1 ${isSelected ? (isDark ? 'text-slate-500' : 'text-slate-400') : 'text-slate-500'}`}>
                        {item.desc}
                    </Text>
                )}
            </View>
            {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#0f0f11' : '#D2B48C'} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`} showsVerticalScrollIndicator={false}>
            <View className="px-8 py-10 pb-32">
                {/* Header */}
                <View className="mb-10">
                    <Text className={`text-[36px] font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Personalize
                    </Text>
                    <Text className="text-slate-500 font-medium text-[16px] leading-relaxed">
                        Tailor your AI experience to match your academic level and learning preferences.
                    </Text>
                </View>

                {/* Education Level */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">Academic Level</Text>
                    {LEVELS.map(l => (
                        <SelectionCard 
                            key={l.key} 
                            item={l} 
                            isSelected={level === l.key} 
                            onPress={() => setLevel(level === l.key ? '' : l.key)} 
                            hasDesc={false}
                        />
                    ))}
                </View>

                {/* Field of Study */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">Field of Study</Text>
                    <TextInput
                        value={field}
                        onChangeText={setField}
                        placeholder="e.g. Computer Science, Medicine..."
                        placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                        className={`h-[64px] px-6 rounded-2xl border font-bold text-[16px] ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
                    />
                </View>

                {/* Learning Style */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">Learning Style</Text>
                    {STYLES.map(s => (
                        <SelectionCard 
                            key={s.key} 
                            item={s} 
                            isSelected={style === s.key} 
                            onPress={() => setStyle(style === s.key ? '' : s.key)} 
                        />
                    ))}
                </View>

                {/* AI Tone */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">Interaction Tone</Text>
                    {TONES.map(t => (
                        <SelectionCard 
                            key={t.key} 
                            item={t} 
                            isSelected={tone === t.key} 
                            onPress={() => setTone(tone === t.key ? '' : t.key)} 
                        />
                    ))}
                </View>

                {/* Language */}
                <View className="mb-12">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Primary Language</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {LANGUAGES.map(l => (
                            <TouchableOpacity
                                key={l.key}
                                onPress={() => setLanguage(l.key)}
                                activeOpacity={0.8}
                                className={`px-6 py-3 rounded-full border ${language === l.key 
                                    ? 'bg-brand-primary border-brand-primary' 
                                    : (isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm')}`}
                            >
                                <Text className={`font-bold text-[14px] ${language === l.key ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                                    {l.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                    className={`h-[64px] bg-brand-primary rounded-2xl items-center justify-center flex-row shadow-lg shadow-brand-primary/20 ${saving ? 'opacity-60' : ''}`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 10 }} />
                            <Text className="font-bold text-[17px] text-white">Update AI Preferences</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-slate-400 text-[12px] font-medium mt-8 leading-relaxed px-4">
                    Changes take effect immediately across all study tools.
                </Text>
            </View>
        </ScrollView>
    );
}
