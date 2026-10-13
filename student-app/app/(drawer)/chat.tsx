import React, { useState, useRef, useEffect } from 'react';
import { Pressable, View, Text, TextInput, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { streamScanFollowUpChat } from '@/lib/aiStream';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isStreaming?: boolean;
};

const SUGGESTIONS = [
  'Quiz me on Bayes Theorem with a 4-choice question',
  'Summarize core kinematics formulas in Physics',
  'Practice problem on calculus derivatives & chain rule',
];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (abortStreamRef.current) {
        abortStreamRef.current();
      }
    };
  }, []);

  const handleBack = () => {
    haptics.selectionAsync(true);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(drawer)' as any);
    }
  };

  const handleCopy = async (id: string, textToCopy: string) => {
    haptics.impactAsync();
    try {
      await Clipboard.setStringAsync(textToCopy);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isGenerating) return;

    haptics.impactAsync();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      time: now,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      time: now,
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, assistantPlaceholder]);
    setInputVal('');
    setIsGenerating(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Prepare API history for backend stream
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Stream from backend Node AI service
    abortStreamRef.current = streamScanFollowUpChat(
      {
        messages: apiMessages,
        context:
          'You are Skeemy, an intelligent, patient, and expert AI tutor designed for high school and university students. Help the student understand core academic concepts, solve problems step-by-step, and prepare for exams. Break down explanations clearly with bullet points and bold terms. Use markdown formatting and valid LaTeX for mathematical equations.',
        provider: 'anthropic',
      },
      {
        onToken: (token: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m
            )
          );
          scrollViewRef.current?.scrollToEnd({ animated: false });
        },
        onComplete: (fullText: string) => {
          setIsGenerating(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullText || m.content, isStreaming: false }
                : m
            )
          );
          abortStreamRef.current = null;
          haptics.selectionAsync(true);
        },
        onError: (err: string) => {
          setIsGenerating(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      m.content ||
                      "I'm having trouble connecting to the study server. Please verify your connection or try again in a moment.",
                    isStreaming: false,
                  }
                : m
            )
          );
          abortStreamRef.current = null;
        },
      }
    );
  };

  const handleClearChat = () => {
    haptics.impactAsync();
    Alert.alert('Clear Chat', 'Start a fresh conversation thread with Skeemy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          if (abortStreamRef.current) {
            abortStreamRef.current();
            abortStreamRef.current = null;
          }
          setMessages([]);
          setIsGenerating(false);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header (Starts flush from screen top, padding for status bar) ── */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 10),
          borderBottomColor: C.border,
          backgroundColor: C.card,
        }}
        className="px-4 pb-3 flex-row items-center justify-between border-b z-50 shadow-xs"
      >
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={handleBack}
            className="w-11 h-11 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <Icon name="ArrowLeft" size={20} color="text" />
          </Pressable>
          <View className="flex-row items-center gap-3">
            <View className="relative items-center justify-center w-10 h-10 rounded-full bg-primary-container">
              <Icon name="Brain" size={22} color="primary" />
              <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary border-[2px] border-surface" />
            </View>
            <View className="flex-col">
              <Text style={{ color: C.text }} className="text-[16px] font-bold">
                Chat With Skeemy
              </Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                <Text style={{ color: C.textSecondary }} className="text-[11px] font-bold">
                  Online
                </Text>
              </View>
            </View>
          </View>
        </View>

        {messages.length > 0 && (
          <Pressable
            onPress={handleClearChat}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <Icon name="RotateCcw" size={20} color="textSecondary" />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Chat Stream ── */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            /* ── Welcome Empty State ── */
            <View className="flex-1 items-center justify-center py-10 px-4">
              <View className="w-20 h-20 rounded-full bg-primary-container items-center justify-center mb-5 shadow-sm">
                <Icon name="Sparkles" size={38} color="primary" />
              </View>
              <Text style={{ color: C.text }} className="text-[22px] font-bold text-center mb-2">
                Hi! I'm Skeemy 👋
              </Text>
              <Text style={{ color: C.textSecondary }} className="text-[14px] text-center max-w-[300px] leading-[20px] mb-8">
                Your personal AI study partner. Ask me any conceptual question, get step-by-step problem derivations, or practice for exams.
              </Text>

              {/* Suggestions */}
              <View className="w-full gap-2.5">
                <Text style={{ color: C.textSecondary }} className="text-[12px] font-bold uppercase tracking-wider px-1 mb-1">
                  Suggested Questions
                </Text>
                {SUGGESTIONS.map((item, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSend(item)}
                    style={{
                      backgroundColor: C.card,
                      borderColor: C.border,
                    }}
                    className="p-3.5 rounded-2xl border flex-row items-center justify-between active:scale-[0.99] shadow-xs"
                  >
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <Icon name="MessageSquare" size={18} color="primary" />
                      <Text style={{ color: C.text }} className="text-[13px] font-semibold flex-1">
                        {item}
                      </Text>
                    </View>
                    <Icon name="ArrowRight" size={16} color="textSecondary" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            /* ── Active Conversation Stream ── */
            messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <View key={msg.id} className="flex-row justify-end w-full pl-8 mb-5">
                    <View className="flex-col items-end max-w-[88%]">
                      <View className="bg-accent-electric-blue rounded-3xl rounded-tr-md px-4 py-3 shadow-sm">
                        <Text style={{ color: '#FFFFFF' }} className="text-[15px] leading-[22px] font-medium">
                          {msg.content}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1 mt-1 mr-2">
                        <Text style={{ color: C.textSecondary }} className="text-[11px] font-bold">
                          {msg.time}
                        </Text>
                        <Icon name="CheckCheck" size={14} color="primary" />
                      </View>
                    </View>
                  </View>
                );
              }

              // Assistant message
              return (
                <View key={msg.id} className="flex-row items-start gap-2.5 w-full pr-2 mb-5">
                  <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center mt-1 shrink-0">
                    <Icon name="Sparkles" size={18} color="primary" />
                  </View>
                  <View className="flex-col w-full max-w-[92%] gap-1">
                    <View
                      style={{
                        backgroundColor: C.card,
                        borderColor: C.border,
                      }}
                      className="rounded-3xl rounded-tl-md p-4 shadow-sm border"
                    >
                      {msg.content ? (
                        <Text style={{ color: C.text }} className="text-[15px] leading-[23px] font-normal">
                          {msg.content}
                        </Text>
                      ) : (
                        <View className="flex-row items-center gap-2 py-1">
                          <ActivityIndicator size="small" color="#007AFF" />
                          <Text style={{ color: C.textSecondary }} className="text-[13px] font-medium">
                            Skeemy is thinking…
                          </Text>
                        </View>
                      )}

                      {!msg.isStreaming && msg.content ? (
                        <View
                          style={{ borderTopColor: C.border }}
                          className="flex-row flex-wrap items-center gap-2 pt-3 mt-3 border-t"
                        >
                          <Pressable
                            onPress={() => handleCopy(msg.id, msg.content)}
                            style={{ backgroundColor: C.surfaceLow }}
                            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
                          >
                            <Icon name="Copy" size={14} color="textSecondary" />
                            <Text style={{ color: C.text }} className="text-[11px] font-bold">
                              {copiedId === msg.id ? 'Copied!' : 'Copy'}
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => router.push('/(drawer)/generate')}
                            style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }}
                            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
                          >
                            <Icon name="HelpCircle" size={14} color="primary" />
                            <Text className="text-[11px] font-bold text-accent-electric-blue">Quiz me</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                    <Text style={{ color: C.textSecondary }} className="text-[11px] font-bold pl-2 mt-0.5">
                      Skeemy AI • {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ── Bottom Input Dock (Full-width clean dock without tab bar) ── */}
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: C.card,
            borderTopColor: C.border,
          }}
          className="border-t pt-2.5 px-4 shadow-sm"
        >
          <View
            style={{
              backgroundColor: C.surfaceLow,
            }}
            className="mb-2 rounded-full p-1.5 flex-row items-center"
          >
            <TextInput
              value={inputVal}
              onChangeText={setInputVal}
              onSubmitEditing={() => handleSend()}
              style={{ color: C.text }}
              className="flex-1 px-4 py-2 text-[15px]"
              placeholder="Ask Skeemy a study question…"
              placeholderTextColor={C.textTertiary}
              returnKeyType="send"
              editable={!isGenerating}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={isGenerating || !inputVal.trim()}
              style={{
                backgroundColor: isGenerating || !inputVal.trim() ? (isDark ? '#3A3A3C' : '#93C5FD') : '#007AFF',
              }}
              className="w-10 h-10 rounded-full items-center justify-center mr-0.5 active:scale-90"
            >
              <Icon name="ArrowUp" size={20} color="white" />
            </Pressable>
          </View>

          <Text style={{ color: C.textSecondary }} className="text-center text-[10px] font-semibold pb-1">
            Skeemy can make mistakes. Verify critical academic formulas.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
