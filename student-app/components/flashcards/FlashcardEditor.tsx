import React, { useState } from 'react';
import { Pressable, 
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { haptics } from '@/lib/haptics';

interface Props {
    onGenerate: (data: { topic?: string; count: number; contentFocus: string[] }) => Promise<void>;
    onPickFile?: () => Promise<void>;
}

const SUGGESTIONS = [
    'Cell Biology',
    'Microeconomics',
    'Calculus',
    'World War II',
];

const FOCUS_OPTIONS = [
    { id: 'concepts', title: 'Key Concepts & Definitions', icon: 'auto-stories', desc: 'Term on front, clear definitions and core contextual clues on back.' },
    { id: 'formulas', title: 'Formulas & Problem Solving', icon: 'functions', desc: 'Equations, variable breakdowns, and step-by-step numerical applications.' },
    { id: 'traps', title: 'High-Yield Exam Traps', icon: 'bolt', desc: 'Common misconceptions, tricky edge cases, and test designer pitfalls.' },
    { id: 'qa', title: 'Q&A Scenario Practice', icon: 'psychology', desc: 'Real-world scenario cases and prompt questions designed for vocal review.' },
] as const;

export function FlashcardEditor({ onGenerate, onPickFile }: Props) {
    const insets = useSafeAreaInsets();
    
    const [mode, setMode] = useState<'topic' | 'file'>('topic');
    const [topic, setTopic] = useState('');
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
            className="flex-1 bg-surface" 
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 16, paddingHorizontal: 16, paddingTop: 16, gap: 24 }}
        >
            {/* Header Context */}
            <View className="flex-col gap-1">
                <Text style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.5 }} className="text-on-surface">
                    Generate Flashcards
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">
                    Transform complex lectures or study topics into active-recall flashcard decks.
                </Text>
            </View>

            {/* Segmented Source Toggle */}
            <View className="p-1 rounded-2xl bg-surface-container flex-row items-center">
                <Pressable
                    onPress={() => {
                        haptics.selectionAsync();
                        setMode('topic');
                    }}
                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${mode === 'topic' ? 'bg-surface-container-lowest shadow-sm' : ''}`}
                >
                    <MaterialIcons
                        name="edit-note"
                        size={18}
                        color={mode === 'topic' ? '#007AFF' : '#8E8E93'}
                    />
                    <Text
                        style={{ fontSize: 14, fontWeight: '600' }}
                        className={mode === 'topic' ? 'text-accent-electric-blue' : 'text-on-surface-variant'}
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
                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${mode === 'file' ? 'bg-surface-container-lowest shadow-sm' : ''}`}
                >
                    <MaterialIcons
                        name="upload-file"
                        size={18}
                        color={mode === 'file' ? '#007AFF' : '#8E8E93'}
                    />
                    <Text
                        style={{ fontSize: 14, fontWeight: '600' }}
                        className={mode === 'file' ? 'text-accent-electric-blue' : 'text-on-surface-variant'}
                    >
                        Upload Notes
                    </Text>
                </Pressable>
            </View>

            {/* Dynamic Source Panel */}
            {mode === 'topic' ? (
                <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
                    <Text style={{ fontSize: 15, fontWeight: '700' }} className="text-on-surface mb-2">
                        Study Subject or Topic
                    </Text>
                    <TextInput
                        placeholder="e.g. Organic Chemistry: Reactions, or AP US History 1920s..."
                        value={topic}
                        onChangeText={setTopic}
                        placeholderTextColor="#8E8E93"
                        multiline
                        numberOfLines={3}
                        className="bg-surface-container-low rounded-2xl p-4 text-on-surface mb-3"
                        style={{ fontSize: 15, textAlignVertical: 'top', minHeight: 84 }}
                    />

                    {/* Suggestions */}
                    <Text style={{ fontSize: 12, fontWeight: '400' }} className="text-on-surface-variant mb-2">Popular suggestions:</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {SUGGESTIONS.map((item) => (
                            <Pressable
                                key={item}
                                
                                onPress={() => {
                                    haptics.selectionAsync();
                                    setTopic(item);
                                }}
                                className="px-3 py-1.5 rounded-full bg-surface-container-low"
                            >
                                <Text style={{ fontSize: 12, fontWeight: '500' }} className="text-on-surface-variant">{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : (
                <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
                    <View className="bg-surface-container-low rounded-2xl p-4 flex-row items-center justify-between gap-3">
                        <View className="flex-row items-center gap-3 flex-1">
                            <View className="w-10 h-10 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm">
                                <MaterialIcons name="cloud-upload" size={22} color="#007AFF" />
                            </View>
                            <View className="flex-1">
                                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-on-surface" numberOfLines={1}>
                                    Attach Lecture Slides or Notes
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant" numberOfLines={1}>
                                    PDF, DOCX, TXT (Max 25MB)
                                </Text>
                            </View>
                        </View>
                        <Pressable 
                            onPress={onPickFile}
                            className="px-3 py-2 rounded-xl bg-surface-container-lowest shadow-sm"
                        >
                            <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-accent-electric-blue">Add Doc</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Card Count Stepper & Presets */}
            <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: '700' }} className="text-on-surface">
                            Number of Cards
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '400' }} className="text-on-surface-variant">
                            Min 5 • Max 20 cards per deck
                        </Text>
                    </View>
                </View>

                {/* Stepper Controller */}
                <View className="bg-surface-container-low p-2 rounded-2xl flex-row items-center justify-between mb-3">
                    <Pressable
                        
                        onPress={() => {
                            haptics.selectionAsync();
                            setCount(Math.max(5, count - 1));
                        }}
                        className="w-12 h-12 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                    >
                        <MaterialIcons name="remove" size={20} color="#1C1C1E" className="text-on-surface" />
                    </Pressable>

                    <View className="items-center justify-center">
                        <Text style={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.4 }} className="text-on-surface">
                            {count}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface-variant uppercase">
                            Cards
                        </Text>
                    </View>

                    <Pressable
                        
                        onPress={() => {
                            haptics.selectionAsync();
                            setCount(Math.min(20, count + 1));
                        }}
                        className="w-12 h-12 rounded-xl bg-surface-container-lowest items-center justify-center shadow-sm"
                    >
                        <MaterialIcons name="add" size={20} color="#1C1C1E" className="text-on-surface" />
                    </Pressable>
                </View>

                {/* Preset Pills */}
                <View className="flex-row gap-2">
                    {[5, 10, 15, 20].map((num) => (
                        <Pressable
                            key={num}
                            
                            onPress={() => {
                                haptics.selectionAsync();
                                setCount(num);
                            }}
                            className={`flex-1 py-2 rounded-xl items-center justify-center ${count === num ? 'bg-accent-electric-blue shadow-sm' : 'bg-surface-container-low'}`}
                        >
                            <Text
                                style={{ fontSize: 14, fontWeight: '600' }}
                                className={count === num ? 'text-on-primary' : 'text-on-surface-variant'}
                            >
                                {num}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Card Content Focus Section */}
            <View className="flex-col gap-3">
                <View className="px-1 mb-1">
                    <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: -0.2 }} className="text-on-surface">Card Content Focus</Text>
                    <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">Choose what to emphasize for spaced retention</Text>
                </View>

                {FOCUS_OPTIONS.map((opt) => {
                    const isActive = contentFocus.includes(opt.id);
                    return (
                        <Pressable
                            key={opt.id}
                            
                            onPress={() => toggleFocus(opt.id)}
                            className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex-row items-start gap-3.5"
                        >
                            <View className={`w-11 h-11 rounded-2xl items-center justify-center mt-0.5 ${isActive ? 'bg-primary-container' : 'bg-surface-container-low'}`}>
                                <MaterialIcons name={opt.icon as any} size={24} color={isActive ? '#0058BC' : '#8E8E93'} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-0.5">
                                    <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-on-surface">{opt.title}</Text>
                                    <View className={`w-6 h-6 rounded-full items-center justify-center ${isActive ? 'bg-accent-electric-blue' : 'bg-surface-container-low'}`}>
                                        {isActive && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">{opt.desc}</Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Primary CTA Button */}
            <Pressable
                disabled={loading}
                
                onPress={handleGenerate}
                className="w-full h-14 rounded-2xl bg-accent-electric-blue items-center justify-center flex-row gap-2 mt-2"
                style={{
                    shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 24,
                    elevation: 8,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Text style={{ fontSize: 16, fontWeight: '700' }} className="text-on-primary">Generate Flashcards</Text>
                        <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
                    </>
                )}
            </Pressable>

        </ScrollView>
    );
}
