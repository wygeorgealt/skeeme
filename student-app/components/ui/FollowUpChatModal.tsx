import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import AltArrowLeft from '@/assets/icons/pikaicons/arrow-left.svg';
import AltArrowRight from '@/assets/icons/pikaicons/arrow-right.svg';
import { useAuthStore } from '@/store/authStore';
import { streamScanFollowUpChat } from '@/lib/aiStream';
import { Colors } from '@/constants/theme';
import { ScanResult } from '@/lib/scanner';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface FollowUpChatModalProps {
    visible: boolean;
    onClose: () => void;
    scanContext: ScanResult[];
    provider?: 'deepseek' | 'anthropic';
}

export function FollowUpChatModal({ visible, onClose, scanContext, provider }: FollowUpChatModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
    const { user } = useAuthStore();
    const isPro = (user?.plan_name ?? 'free') !== 'free';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questionsAsked, setQuestionsAsked] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const abortStreamRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (visible) {
            setMessages([]);
            setQuestionsAsked(0);
            setInput('');
        }
    }, [visible]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!isPro && questionsAsked >= 1) {
            useAuthStore.getState().toggleCreditsModal(true, 'scan');
            return;
        }

        const userMsg: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setQuestionsAsked(prev => prev + 1);

        const currentHistory = [...messages, userMsg];

        const contextStr = scanContext.map(r => 
            `Topic: ${r.topic || 'Unknown'}\nSolution: ${r.solution || r.summary || ''}\nSteps: ${r.steps?.join('\n') || ''}\nExplanation: ${r.explanation || ''}`
        ).join('\n\n');

        let assistantMsg: Message = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMsg]);

        const abort = streamScanFollowUpChat(
            { messages: currentHistory, context: contextStr, provider },
            {
                onToken: (token) => {
                    assistantMsg.content += token;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                        return newMsgs;
                    });
                },
                onComplete: () => {
                    setIsLoading(false);
                    abortStreamRef.current = null;
                },
                onError: (err) => {
                    setIsLoading(false);
                    assistantMsg.content = `Error: ${err}`;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                        return newMsgs;
                    });
                }
            }
        );

        abortStreamRef.current = abort;
    };

    const handleClose = () => {
        if (abortStreamRef.current) {
            abortStreamRef.current();
        }
        onClose();
    };

    const limitReached = !isPro && questionsAsked >= 1;

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
            <KeyboardAvoidingView style={[s.container, { backgroundColor: C.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[s.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <TouchableOpacity onPress={handleClose} style={s.backBtn}>
                        <AltArrowLeft width={24} height={24} color={C.text} />
                    </TouchableOpacity>
                    <Text style={[s.title, { color: C.text }]}>Ask a Follow-up</Text>
                    <View style={s.backBtn} />
                </View>

                <ScrollView 
                    ref={scrollViewRef}
                    style={s.chatContainer}
                    contentContainerStyle={s.chatContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.length === 0 && (
                        <View style={s.emptyState}>
                            <Text style={[s.emptyStateText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                                Ask anything about the solution to get more help.
                            </Text>
                        </View>
                    )}
                    
                    {messages.map((msg, i) => (
                        <View key={i} style={[s.messageRow, msg.role === 'user' ? s.userRow : s.aiRow]}>
                            <View style={[
                                s.bubble, 
                                msg.role === 'user' 
                                    ? [s.userBubble, { backgroundColor: C.primary }] 
                                    : [s.aiBubble, isDark ? { backgroundColor: '#1C1C1E' } : { backgroundColor: '#F1F5F9' }]
                            ]}>
                                <Text style={[
                                    s.messageText,
                                    msg.role === 'user' ? { color: 'white' } : { color: C.text }
                                ]}>
                                    {msg.content}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {isLoading && (
                        <View style={[s.messageRow, s.aiRow]}>
                            <View style={[s.bubble, s.aiBubble, isDark ? { backgroundColor: '#1C1C1E' } : { backgroundColor: '#F1F5F9' }, { padding: 12 }]}>
                                <ActivityIndicator size="small" color={C.primary} />
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={[s.inputContainer, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', backgroundColor: C.background }]}>
                    {limitReached ? (
                        <TouchableOpacity 
                            style={[s.upgradeBtn, { backgroundColor: C.primary }]}
                            onPress={() => useAuthStore.getState().toggleCreditsModal(true, 'scan')}
                        >
                            <Text style={s.upgradeText}>Upgrade to Pro for unlimited questions</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[s.inputWrapper, isDark ? { backgroundColor: '#1C1C1E' } : { backgroundColor: '#F1F5F9' }]}>
                            <TextInput
                                style={[s.input, { color: C.text }]}
                                placeholder="Ask a question..."
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                value={input}
                                onChangeText={setInput}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity 
                                onPress={handleSend}
                                disabled={!input.trim() || isLoading}
                                style={[s.sendBtn, (!input.trim() || isLoading) && { opacity: 0.5 }]}
                            >
                                <AltArrowRight width={24} height={24} color={C.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1 },
    backBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700' },
    chatContainer: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 40 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyStateText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
    messageRow: { width: '100%', marginBottom: 16 },
    userRow: { alignItems: 'flex-end' },
    aiRow: { alignItems: 'flex-start' },
    bubble: { maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    userBubble: { borderBottomRightRadius: 4 },
    aiBubble: { borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 24 },
    inputContainer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1 },
    inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
    input: { flex: 1, maxHeight: 100, minHeight: 40, fontSize: 16, paddingTop: 10, paddingBottom: 10 },
    sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
    upgradeBtn: { width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    upgradeText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
