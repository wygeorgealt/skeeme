import React, { useState } from 'react';
import { 
    Pressable, 
    View,
    Text,
    TextInput,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface Props {
    onGenerate: (data: { topic?: string; count: number; contentFocus: string[] }) => Promise<void>;
    onPickFile?: () => Promise<void>;
    initialTopic?: string;
}

const SUGGESTIONS = [
    'Cell Biology',
    'Microeconomics',
    'Calculus',
    'World War II',
];

const FOCUS_OPTIONS = [
    { id: 'concepts', title: 'Key Concepts & Definitions', icon: 'BookOpen' as const, desc: 'Essential terms and clear definitions' },
    { id: 'formulas', title: 'Formulas & Problem Solving', icon: 'Sigma' as const, desc: 'Equations and step-by-step applications' },
    { id: 'traps', title: 'High-Yield Exam Traps', icon: 'Zap' as const, desc: 'Common test pitfalls and edge cases' },
    { id: 'qa', title: 'Q&A Scenario Practice', icon: 'Brain' as const, desc: 'Real-world prompt and scenario drills' },
] as const;

export function FlashcardEditor({ onGenerate, onPickFile, initialTopic }: Props) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const [mode, setMode] = useState<'topic' | 'file'>('topic');
    const [topic, setTopic] = useState(initialTopic || '');
    const [count, setCount] = useState(15);
    const [contentFocus, setContentFocus] = useState<string[]>(['concepts', 'traps']);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await haptics.impactAsync();
            await onGenerate({ 
                topic: mode === 'topic' ? topic : undefined, 
                count, 
                contentFocus 
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleFocus = (id: string) => {
        haptics.selectionAsync();
        setContentFocus(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: C.background }}
            contentContainerStyle={{ 
                paddingBottom: Math.max(insets.bottom, 20) + 24, 
                paddingHorizontal: 16, 
                paddingTop: 12, 
                gap: 20 
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Segmented Source Toggle */}
            <View 
                style={{ 
                    backgroundColor: C.surfaceLow, 
                    borderColor: C.border, 
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 4,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <Pressable
                    onPress={() => {
                        haptics.selectionAsync();
                        setMode('topic');
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: mode === 'topic' ? C.card : 'transparent',
                        borderWidth: mode === 'topic' && isDark ? 1 : 0,
                        borderColor: C.border,
                    }}
                >
                    <Icon
                        name="PenTool"
                        size={18}
                        color={mode === 'topic' ? C.primary : C.textSecondary}
                    />
                    <Text
                        style={{ 
                            fontSize: 14, 
                            fontWeight: '600',
                            color: mode === 'topic' ? C.primary : C.textSecondary
                        }}
                    >
                        Input Topic
                    </Text>
                </Pressable>

                <Pressable
                    onPress={async () => {
                        haptics.selectionAsync();
                        setMode('file');
                        if (onPickFile) await onPickFile();
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: mode === 'file' ? C.card : 'transparent',
                        borderWidth: mode === 'file' && isDark ? 1 : 0,
                        borderColor: C.border,
                    }}
                >
                    <Icon
                        name="UploadCloud"
                        size={18}
                        color={mode === 'file' ? C.primary : C.textSecondary}
                    />
                    <Text
                        style={{ 
                            fontSize: 14, 
                            fontWeight: '600',
                            color: mode === 'file' ? C.primary : C.textSecondary
                        }}
                    >
                        Upload Notes
                    </Text>
                </Pressable>
            </View>

            {/* Dynamic Source Panel */}
            {mode === 'topic' ? (
                <View 
                    style={{ 
                        backgroundColor: C.card, 
                        borderColor: C.border, 
                        borderWidth: 1,
                        borderRadius: 24,
                        padding: 18,
                    }}
                >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 8 }}>
                        Study Subject or Topic
                    </Text>
                    <TextInput
                        placeholder="e.g. Organic Chemistry: Reactions, or AP US History 1920s..."
                        value={topic}
                        onChangeText={setTopic}
                        placeholderTextColor={C.textTertiary}
                        multiline
                        numberOfLines={3}
                        style={{ 
                            backgroundColor: C.surfaceLow,
                            color: C.text,
                            borderColor: C.border,
                            borderWidth: 1,
                            borderRadius: 16,
                            padding: 14,
                            fontSize: 15, 
                            textAlignVertical: 'top', 
                            minHeight: 88,
                            marginBottom: 12
                        }}
                    />

                    {/* Suggestions */}
                    <Text style={{ fontSize: 12, fontWeight: '500', color: C.textSecondary, marginBottom: 8 }}>
                        Popular suggestions:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {SUGGESTIONS.map((item) => (
                            <Pressable
                                key={item}
                                onPress={() => {
                                    haptics.selectionAsync();
                                    setTopic(item);
                                }}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    backgroundColor: C.surfaceLow,
                                    borderColor: C.border,
                                    borderWidth: 1,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary }}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : (
                <View 
                    style={{ 
                        backgroundColor: C.card, 
                        borderColor: C.border, 
                        borderWidth: 1,
                        borderRadius: 24,
                        padding: 18,
                    }}
                >
                    <View 
                        style={{
                            backgroundColor: C.surfaceLow,
                            borderRadius: 16,
                            padding: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <Icon name="UploadCloud" size={26} color="default" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }} numberOfLines={1}>
                                    Attach Lecture Slides or Notes
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '400', color: C.textSecondary, marginTop: 2 }} numberOfLines={1}>
                                    PDF, DOCX, TXT (Max 25MB)
                                </Text>
                            </View>
                        </View>
                        <Pressable 
                            onPress={onPickFile}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(0, 122, 255, 0.16)' : '#EBF5FF',
                                borderColor: C.primary,
                                borderWidth: 1,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary }}>Add Doc</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Card Count Stepper & Presets */}
            <View 
                style={{ 
                    backgroundColor: C.card, 
                    borderColor: C.border, 
                    borderWidth: 1,
                    borderRadius: 24,
                    padding: 18,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>
                            Number of Cards
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '400', color: C.textSecondary, marginTop: 2 }}>
                            Min 5 • Max 20 cards per deck
                        </Text>
                    </View>
                </View>

                {/* Stepper Controller */}
                <View 
                    style={{
                        backgroundColor: C.surfaceLow,
                        padding: 8,
                        borderRadius: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12
                    }}
                >
                    <Pressable
                        onPress={() => {
                            haptics.selectionAsync();
                            setCount(Math.max(5, count - 1));
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: C.card,
                            borderColor: C.border,
                            borderWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon name="Minus" size={18} color="default" />
                    </Pressable>

                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.4, color: C.text }}>
                            {count}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.textSecondary, textTransform: 'uppercase' }}>
                            Cards
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => {
                            haptics.selectionAsync();
                            setCount(Math.min(20, count + 1));
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: C.card,
                            borderColor: C.border,
                            borderWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon name="Plus" size={18} color="default" />
                    </Pressable>
                </View>

                {/* Preset Pills */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[5, 10, 15, 20].map((num) => {
                        const isSelected = count === num;
                        return (
                            <Pressable
                                key={num}
                                onPress={() => {
                                    haptics.selectionAsync();
                                    setCount(num);
                                }}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isSelected ? C.primary : C.surfaceLow,
                                    borderColor: isSelected ? C.primary : C.border,
                                    borderWidth: 1,
                                }}
                            >
                                <Text
                                    style={{ 
                                        fontSize: 14, 
                                        fontWeight: '700',
                                        color: isSelected ? '#FFFFFF' : C.textSecondary 
                                    }}
                                >
                                    {num}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Card Content Focus Section */}
            <View style={{ flexDirection: 'column', gap: 10 }}>
                <View style={{ paddingHorizontal: 2, marginBottom: 2 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', letterSpacing: -0.2, color: C.text }}>
                        Card Content Focus
                    </Text>
                </View>

                {FOCUS_OPTIONS.map((opt) => {
                    const isActive = contentFocus.includes(opt.id);
                    return (
                        <Pressable
                            key={opt.id}
                            onPress={() => toggleFocus(opt.id)}
                            style={{
                                backgroundColor: isActive ? (isDark ? 'rgba(0, 122, 255, 0.12)' : '#F0F7FF') : C.card,
                                borderColor: isActive ? C.primary : C.border,
                                borderWidth: isActive ? 1.5 : 1,
                                padding: 14,
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 14
                            }}
                        >
                            <View 
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isActive ? (isDark ? 'rgba(0, 122, 255, 0.22)' : '#DBEAFE') : C.surfaceLow,
                                }}
                            >
                                <Icon name={opt.icon} size={22} color={isActive ? "primary" : "secondary"} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{opt.title}</Text>
                                    <View 
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: 11,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: isActive ? C.primary : 'transparent',
                                            borderColor: isActive ? C.primary : C.border,
                                            borderWidth: isActive ? 0 : 1.5,
                                        }}
                                    >
                                        {isActive && <Icon name="Check" size={13} color="white" strokeWidth={2.8} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: '400', color: C.textSecondary, lineHeight: 18 }}>
                                    {opt.desc}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Primary CTA Button */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
                <AnimatedButton
                    title="Generate Flashcards"
                    onPress={handleGenerate}
                    loading={loading}
                    type="capsule"
                    backgroundColor="#007AFF"
                    shadowColor="#0066D6"
                    fullWidth
                />
            </View>

        </ScrollView>
    );
}
