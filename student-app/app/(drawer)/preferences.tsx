import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useAuthStore } from '@/store/authStore';
import * as ExpoHaptics from 'expo-haptics';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

// ─── Data ──────────────────────────────────────────────────────────────────────

const STYLES = [
    { key: 'simple', label: 'Simple', desc: 'Everyday language & analogies' },
    { key: 'detailed', label: 'Detailed', desc: 'In-depth academic breakdown' },
];

const TONES = [
    { key: 'supportive', label: 'Supportive', emoji: '🤗' },
    { key: 'strict', label: 'Strict', emoji: '📐' },
    { key: 'concise', label: 'Concise', emoji: '⚡' },
    { key: 'fun', label: 'Fun & Witty', emoji: '😂' },
];

const GOALS = [
    { key: 'conceptual', label: 'Deep Dive', desc: 'First-principles theory' },
    { key: 'exam', label: 'Exam Prep', desc: 'High-yield tips & traps' },
    { key: 'cheat', label: 'Cheat Sheet', desc: 'Quick summaries' },
];

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function PreferencesScreen() {
    const { user, updateUser } = useAuthStore();
    const [animKey, setAnimKey] = useState(0);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );

    const prefs = user?.ai_preferences;

    const [field, setField] = useState<string>(prefs?.field_of_study || '');
    const [style, setStyle] = useState<string>(prefs?.learning_style || '');
    const [tone, setTone] = useState<string>(prefs?.tone || 'supportive');
    const [academicGoal, setAcademicGoal] = useState<string>(prefs?.academic_goal || 'conceptual');
    const [saving, setSaving] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (prefs && !hasInitialized) {
            setField(prefs.field_of_study || '');
            setStyle(prefs.learning_style || '');
            setTone(prefs.tone || 'supportive');
            setAcademicGoal(prefs.academic_goal || 'conceptual');
            setHasInitialized(true);
        }
    }, [prefs, hasInitialized]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('preferences', {
                field_of_study: field.trim() || null,
                learning_style: style || null,
                tone: tone || null,
                academic_goal: academicGoal || null,
            });
            updateUser({ ai_preferences: res.data.ai_preferences });
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success, true);
            Alert.alert('Saved!', 'Your AI will now adapt to your preferences.', [
                { text: 'Got it', onPress: () => (router.canGoBack() ? router.back() : router.replace('/(drawer)' as any)) },
            ]);
        } catch {
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error, true);
            Alert.alert('Preferences not saved', 'Please try again when you are back online.');
        } finally {
            setSaving(false);
        }
    };

    const cardBg = C.card;
    const cardBorder = C.border;
    const innerBg = C.surfaceLow;

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScreenHeader 
                title="AI Personalization" 
                onBack={() => (router.canGoBack() ? router.back() : router.replace('/(drawer)/settings' as any))}
            />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
                {/* 1. Field of Study */}
                <Animated.View
                    key={`field-${animKey}`}
                    entering={FadeInDown.delay(80).duration(400)}
                    style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
                    className="rounded-3xl p-5 shadow-sm mb-6"
                >
                    <View className="flex-row items-center gap-3 mb-4">
                        <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }} className="w-8 h-8 rounded-full flex-row items-center justify-center">
                            <Text style={{ color: '#007AFF' }} className="font-bold text-xs">1</Text>
                        </View>
                        <Text style={{ color: C.text }} className="font-bold text-lg">Field of Study</Text>
                    </View>
                    <View style={{ backgroundColor: innerBg, borderColor: cardBorder }} className="rounded-2xl px-4 py-3 border">
                        <TextInput
                            value={field}
                            onChangeText={setField}
                            placeholder="E.g. Computer Science, Medicine..."
                            placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                            style={{ color: C.text }}
                            className="text-base"
                        />
                    </View>
                </Animated.View>

                {/* 2. Learning Style */}
                <Animated.View
                    key={`style-${animKey}`}
                    entering={FadeInDown.delay(160).duration(400)}
                    style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
                    className="rounded-3xl p-5 shadow-sm mb-6"
                >
                    <View className="flex-row items-center gap-3 mb-4">
                        <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }} className="w-8 h-8 rounded-full flex-row items-center justify-center">
                            <Text style={{ color: '#007AFF' }} className="font-bold text-xs">2</Text>
                        </View>
                        <Text style={{ color: C.text }} className="font-bold text-lg">Learning Style</Text>
                    </View>
                    <View className="flex-row gap-3">
                        {STYLES.map(item => {
                            const isSelected = style === item.key;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setStyle(item.key); }}
                                    style={{
                                        backgroundColor: isSelected ? (isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF') : innerBg,
                                        borderColor: isSelected ? '#007AFF' : 'transparent',
                                    }}
                                    className="flex-1 p-4 rounded-2xl border"
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text style={{ color: isSelected ? '#007AFF' : C.text }} className="font-bold">{item.label}</Text>
                                        {isSelected && <Icon name="CheckCircle2" size={16} color="primary" />}
                                    </View>
                                    <Text style={{ color: isSelected ? '#007AFF' : C.textSecondary }} className="text-xs">{item.desc}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* 3. AI Tone */}
                <Animated.View
                    key={`tone-${animKey}`}
                    entering={FadeInDown.delay(240).duration(400)}
                    style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
                    className="rounded-3xl p-5 shadow-sm mb-6"
                >
                    <View className="flex-row items-center gap-3 mb-4">
                        <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }} className="w-8 h-8 rounded-full flex-row items-center justify-center">
                            <Text style={{ color: '#007AFF' }} className="font-bold text-xs">3</Text>
                        </View>
                        <Text style={{ color: C.text }} className="font-bold text-lg">Tutor Personality</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {TONES.map(item => {
                            const isSelected = tone === item.key;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setTone(item.key); }}
                                    style={{
                                        backgroundColor: isSelected ? '#007AFF' : innerBg,
                                        borderColor: isSelected ? '#007AFF' : cardBorder,
                                    }}
                                    className="flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm"
                                >
                                    <Text>{item.emoji}</Text>
                                    <Text style={{ color: isSelected ? '#FFFFFF' : C.text }} className="font-bold">{item.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* 4. Study Goal */}
                <Animated.View
                    key={`goal-${animKey}`}
                    entering={FadeInDown.delay(320).duration(400)}
                    style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
                    className="rounded-3xl p-5 shadow-sm mb-6"
                >
                    <View className="flex-row items-center gap-3 mb-4">
                        <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }} className="w-8 h-8 rounded-full flex-row items-center justify-center">
                            <Text style={{ color: '#007AFF' }} className="font-bold text-xs">4</Text>
                        </View>
                        <Text style={{ color: C.text }} className="font-bold text-lg">Default Output Goal</Text>
                    </View>
                    <View className="gap-2">
                        {GOALS.map(item => {
                            const isSelected = academicGoal === item.key;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => { haptics.selectionAsync(); setAcademicGoal(item.key); }}
                                    style={{
                                        backgroundColor: isSelected ? (isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF') : innerBg,
                                        borderColor: isSelected ? '#007AFF' : 'transparent',
                                    }}
                                    className="flex-row items-center p-4 rounded-2xl border shadow-sm"
                                >
                                    <View className="flex-1">
                                        <Text style={{ color: isSelected ? '#007AFF' : C.text }} className="font-bold text-base mb-0.5">{item.label}</Text>
                                        <Text style={{ color: isSelected ? '#007AFF' : C.textSecondary }} className="text-xs">{item.desc}</Text>
                                    </View>
                                    {isSelected && <Icon name="CheckCircle2" size={24} color="primary" />}
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Sticky Save Footer */}
            <View
                style={{
                    backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
                    borderTopColor: cardBorder,
                    paddingBottom: Math.max(insets.bottom, 24),
                }}
                className="absolute bottom-0 left-0 right-0 border-t px-6 pt-4"
            >
                <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    style={{
                        backgroundColor: saving ? (isDark ? '#3A3A3C' : '#E3E2E7') : '#007AFF',
                        shadowColor: '#007AFF',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: saving ? 0 : 0.3,
                        shadowRadius: 16,
                    }}
                    className="w-full h-14 rounded-2xl flex-row items-center justify-center shadow-sm"
                >
                    <Text style={{ color: saving ? C.textSecondary : '#FFFFFF' }} className="font-bold text-base">
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
