import React, { useState, useEffect } from 'react';
import { Pressable, View, ScrollView, Switch } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { appStorage } from '@/lib/storage';

export default function DailyStudyGoalScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const user = useAuthStore((s) => s.user);
    const streak = user?.streak?.current_streak ?? 0;

    // State
    const [quizzesEnabled, setQuizzesEnabled] = useState(true);
    const [quizQuestions, setQuizQuestions] = useState(15);
    const [decksEnabled, setDecksEnabled] = useState(true);
    const [deckSessions, setDeckSessions] = useState(3);

    useEffect(() => {
        appStorage.getItem('skeeme_daily_goal').then((val: string | null) => {
            if (val) {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed) && parsed > 0) {
                    setQuizQuestions(parsed);
                }
            }
        }).catch(() => {});
    }, []);

    const quizPresets = [10, 15, 20, 30];
    const deckPresets = [1, 2, 3, 5];

    const calculateTime = () => {
        let mins = 0;
        if (quizzesEnabled) mins += quizQuestions * 1.6; // ~1.6m per question
        if (decksEnabled) mins += deckSessions * 5; // ~5m per session
        return Math.round(mins);
    };

    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const innerBg = isDark ? 'rgba(255,255,255,0.05)' : '#F4F3F8';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#0D0D0D' : '#F2F2F7' }}>
            <ScrollView 
                contentContainerStyle={{ paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-6 flex-row items-center mb-6">
                    <Pressable 
                        onPress={() => router.back()} 
                        style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
                        className="w-11 h-11 rounded-full items-center justify-center shadow-sm"
                    >
                        <MaterialIcons name="arrow-back-ios-new" size={20} color="#007AFF" />
                    </Pressable>
                    <Text style={{ color: C.text }} className="flex-1 text-center font-bold text-xl mr-11">Settings</Text>
                </View>

                <Text style={{ color: C.text }} className="px-6 text-2xl font-bold tracking-tight mb-4">Daily Study Goal</Text>

                {/* Motivation Banner */}
                <View style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }} className="mx-6 rounded-3xl p-5 shadow-sm mb-6">
                    <View style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FEF3C7' }} className="self-start px-3 py-1.5 rounded-full flex-row items-center gap-1.5 mb-3 border">
                        <Text style={{ color: '#F59E0B' }} className="font-bold text-xs">🔥 {streak} Day Streak Active</Text>
                    </View>
                    <Text style={{ color: C.textSecondary }} className="text-sm leading-5">
                        Set your daily pace. Consistent micro-practice preserves knowledge retention and fuels your streak multiplier.
                    </Text>
                </View>

                <Text style={{ color: C.textSecondary }} className="px-6 text-xs font-bold tracking-widest mb-3 uppercase">GOAL COMPOSITION</Text>

                {/* Quizzes Card */}
                <View style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }} className="mx-6 rounded-3xl p-5 shadow-sm mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#E5F1FF' }} className="w-10 h-10 rounded-2xl items-center justify-center">
                                <MaterialIcons name="fact-check" size={20} color="#007AFF" />
                            </View>
                            <Text style={{ color: C.text }} className="font-bold text-base">Practice Quizzes</Text>
                        </View>
                        <Switch 
                            value={quizzesEnabled} 
                            onValueChange={setQuizzesEnabled}
                            trackColor={{ false: isDark ? '#3A3A3C' : '#E3E2E7', true: '#34C759' }}
                        />
                    </View>

                    {quizzesEnabled && (
                        <View>
                            <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' }} className="h-[1px] my-3" />
                            <Text style={{ color: C.textSecondary }} className="text-xs font-bold tracking-wider mb-3 uppercase">TARGET QUESTIONS</Text>
                            
                            <View style={{ backgroundColor: innerBg }} className="flex-row items-center justify-between p-2 rounded-2xl mb-4">
                                <Pressable 
                                    onPress={() => { haptics.impactAsync(); setQuizQuestions(Math.max(5, quizQuestions - 5)); }}
                                    style={{ backgroundColor: cardBg }}
                                    className="w-12 h-12 rounded-xl items-center justify-center shadow-sm"
                                >
                                    <MaterialIcons name="remove" size={24} color={C.text} />
                                </Pressable>
                                <Text className="text-accent-electric-blue text-3xl font-bold tracking-tighter">
                                    {quizQuestions}
                                </Text>
                                <Pressable 
                                    onPress={() => { haptics.impactAsync(); setQuizQuestions(quizQuestions + 5); }}
                                    style={{ backgroundColor: cardBg }}
                                    className="w-12 h-12 rounded-xl items-center justify-center shadow-sm"
                                >
                                    <MaterialIcons name="add" size={24} color={C.text} />
                                </Pressable>
                            </View>

                            <View className="flex-row gap-2 mb-4">
                                {quizPresets.map(preset => (
                                    <Pressable
                                        key={preset}
                                        onPress={() => { haptics.impactAsync(); setQuizQuestions(preset); }}
                                        style={{ backgroundColor: quizQuestions === preset ? '#007AFF' : innerBg }}
                                        className="flex-1 py-2 rounded-xl items-center justify-center"
                                    >
                                        <Text style={{ color: quizQuestions === preset ? '#FFFFFF' : C.textSecondary }} className="font-bold text-sm">
                                            {preset}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="schedule" size={16} color={C.textSecondary} />
                                <Text style={{ color: C.textSecondary }} className="text-xs">~{Math.round(quizQuestions * 1.6)} mins of focused practice</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Flashcards Card */}
                <View style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }} className="mx-6 rounded-3xl p-5 shadow-sm mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View style={{ backgroundColor: isDark ? 'rgba(88,86,214,0.2)' : '#E2DFFF' }} className="w-10 h-10 rounded-2xl items-center justify-center">
                                <MaterialIcons name="style" size={20} color="#5856D6" />
                            </View>
                            <Text style={{ color: C.text }} className="font-bold text-base">Flashcard Decks</Text>
                        </View>
                        <Switch 
                            value={decksEnabled} 
                            onValueChange={setDecksEnabled}
                            trackColor={{ false: isDark ? '#3A3A3C' : '#E3E2E7', true: '#34C759' }}
                        />
                    </View>

                    {decksEnabled && (
                        <View>
                            <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' }} className="h-[1px] my-3" />
                            <Text style={{ color: C.textSecondary }} className="text-xs font-bold tracking-wider mb-3 uppercase">TARGET SESSIONS</Text>
                            
                            <View style={{ backgroundColor: innerBg }} className="flex-row items-center justify-between p-2 rounded-2xl mb-4">
                                <Pressable 
                                    onPress={() => { haptics.impactAsync(); setDeckSessions(Math.max(1, deckSessions - 1)); }}
                                    style={{ backgroundColor: cardBg }}
                                    className="w-12 h-12 rounded-xl items-center justify-center shadow-sm"
                                >
                                    <MaterialIcons name="remove" size={24} color={C.text} />
                                </Pressable>
                                <Text style={{ color: isDark ? '#A5B4FC' : '#5856D6' }} className="text-3xl font-bold tracking-tighter">
                                    {deckSessions}
                                </Text>
                                <Pressable 
                                    onPress={() => { haptics.impactAsync(); setDeckSessions(deckSessions + 1); }}
                                    style={{ backgroundColor: cardBg }}
                                    className="w-12 h-12 rounded-xl items-center justify-center shadow-sm"
                                >
                                    <MaterialIcons name="add" size={24} color={C.text} />
                                </Pressable>
                            </View>

                            <View className="flex-row gap-2 mb-4">
                                {deckPresets.map(preset => (
                                    <Pressable
                                        key={preset}
                                        onPress={() => { haptics.impactAsync(); setDeckSessions(preset); }}
                                        style={{ backgroundColor: deckSessions === preset ? '#5856D6' : innerBg }}
                                        className="flex-1 py-2 rounded-xl items-center justify-center"
                                    >
                                        <Text style={{ color: deckSessions === preset ? '#FFFFFF' : C.textSecondary }} className="font-bold text-xs">
                                            {preset} Sess
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="layers" size={16} color={C.textSecondary} />
                                <Text style={{ color: C.textSecondary }} className="text-xs">~15 cards/sess ({deckSessions * 15} total reviews)</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Target Preview */}
                <View style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.12)' : '#EFF6FF', borderColor: isDark ? 'rgba(0,122,255,0.25)' : 'rgba(0,122,255,0.2)' }} className="mx-6 rounded-3xl p-5 shadow-sm border mb-6">
                    <View className="flex-row items-center gap-2 mb-2">
                        <MaterialIcons name="insights" size={18} color="#007AFF" />
                        <Text className="text-accent-electric-blue font-bold text-xs tracking-wider">DAILY TARGET PREVIEW</Text>
                    </View>
                    
                    <Text style={{ color: C.text }} className="font-bold text-xl mb-1">
                        {quizzesEnabled ? `${quizQuestions} Questions` : ''} 
                        {quizzesEnabled && decksEnabled ? ' + ' : ''}
                        {decksEnabled ? `${deckSessions} Flashcard Sessions` : ''}
                        {!quizzesEnabled && !decksEnabled ? 'No goals set' : ''}
                    </Text>
                    
                    <Text className="text-accent-electric-blue font-semibold mb-4">
                        ⏱️ ~{calculateTime()} min / day
                    </Text>

                    <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)' }} className="rounded-xl p-3 flex-row items-start gap-2">
                        <MaterialIcons name="shield" size={18} color="#007AFF" />
                        <Text style={{ color: C.text }} className="flex-1 text-xs leading-4">
                            <Text className="font-bold">Streak Shield:</Text> Achieving either goal counts toward your streak freeze protection!
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom CTA */}
            <View
                style={{
                    backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
                    borderTopColor: cardBorder,
                    paddingBottom: Math.max(insets.bottom, 24),
                }}
                className="absolute bottom-0 left-0 right-0 pt-4 px-6 border-t"
            >
                <Pressable 
                    onPress={async () => {
                        const targetVal = (quizzesEnabled ? quizQuestions : 0) + (decksEnabled ? deckSessions * 5 : 0) || 20;
                        await appStorage.setItem('skeeme_daily_goal', targetVal.toString()).catch(() => {});
                        haptics.notificationAsync('success' as any);
                        router.back();
                    }}
                    className="w-full h-[52px] bg-accent-electric-blue rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
                    style={{ shadowColor: '#007AFF', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 16 }}
                >
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold text-base">Save Daily Goal</Text>
                </Pressable>
            </View>
        </View>
    );
}
