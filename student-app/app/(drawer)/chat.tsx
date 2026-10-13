import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pressable, View, Text, TextInput, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { streamScanFollowUpChat } from '@/lib/aiStream';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isStreaming?: boolean;
  /** The user prompt that produced this assistant reply (used for quiz eligibility + topic) */
  prompt?: string;
};

const PROMPTS = [
  'Got a question? Ask me',
  "Stuck on a problem? Let's solve it",
  'Need help studying? Fire away',
  'Curious about something? Ask away',
  "Got homework doubts? Let's break it down",
  'Prep time? Ask me anything',
  "Need a quick explanation? I'm here",
  'What are we learning today?',
];

const SMALL_TALK = /^(hi+|hey+|hello+|yo|sup|hola|thanks?|thank you|thx|ok(ay)?|cool|nice|great|good (morning|afternoon|evening|night)|how are you.*|what'?s up.*|who are you.*|bye|lol|hmm+)[\s!.?]*$/i;

/**
 * Decide whether an assistant reply actually taught something worth quizzing on.
 * Avoids showing "Quiz me" for greetings, one-liners, or quick factual answers.
 */
function isQuizWorthy(reply: string, prompt?: string): boolean {
  const text = (reply || '').trim();
  const userText = (prompt || '').trim();
  if (!text) return false;
  if (userText && (SMALL_TALK.test(userText) || userText.split(/\s+/).length < 3)) return false;

  const words = text.split(/\s+/).length;
  if (words < 90) return false;

  // Structural signals that a concept was explained
  const hasList = /(^|\n)\s*([-*•]|\d+[.)])\s+\S/.test(text);
  const hasHeadings = /(^|\n)#{1,4}\s+\S|\*\*[^*]{3,}\*\*/.test(text);
  const hasMath = /\$[^$]+\$|\\\(|\\\[|=\s*\S/.test(text);
  const hasTeachingCue = /\b(step\s*\d|for example|e\.g\.|in summary|key (points|idea|concept)|definition|formula|therefore|this means)\b/i.test(text);
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;

  const signals = [hasList, hasHeadings, hasMath, hasTeachingCue, paragraphs >= 3].filter(Boolean).length;
  return signals >= 2 || words >= 220;
}

/** Derive a short quiz topic from the user's question */
function deriveTopic(prompt?: string): string {
  const cleaned = (prompt || '')
    .replace(/^(can you|could you|please|pls|explain|tell me about|what is|what are|how does|how do|why does|why do|teach me|help me understand)\s+/i, '')
    .replace(/[?.!]+$/, '')
    .trim();
  return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned;
}

/** ChatGPT-style three bouncing dots */
function TypingDots({ color }: { color: string }) {
  return (
    <View className="flex-row items-center py-2 px-1" style={{ gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} delay={i * 160} color={color} />
      ))}
    </View>
  );
}

function Dot({ delay, color }: { delay: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 380 }), withTiming(0, { duration: 380 })),
        -1,
        false
      )
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.value * 0.65,
    transform: [{ translateY: -4 * progress.value }, { scale: 0.85 + progress.value * 0.2 }],
  }));

  return (
    <Animated.View
      style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]}
    />
  );
}

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
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Pick a fresh (different) greeting each time the screen is entered
  useFocusEffect(
    useCallback(() => {
      setPromptIndex((prev) => {
        let next = Math.floor(Math.random() * PROMPTS.length);
        if (next === prev) next = (next + 1) % PROMPTS.length;
        return next;
      });
    }, [])
  );

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
      prompt: text,
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

    // Stream from Go AI backend (uses active default provider e.g. DeepSeek)
    abortStreamRef.current = streamScanFollowUpChat(
      {
        messages: apiMessages,
        context:
          'You are Skeemy, an intelligent, patient, and expert AI tutor designed for high school and university students. Help the student understand core academic concepts, solve problems step-by-step, and prepare for exams. Break down explanations clearly with bullet points and bold terms. Use markdown formatting and valid LaTeX for mathematical equations.',
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
      <ScreenHeader
        title="Chat With Skeemy"
        subtitle="Online"
        onBack={handleBack}
        showBorder={true}
        rightAction={
          messages.length > 0 ? (
            <Pressable
              onPress={handleClearChat}
              hitSlop={8}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-high"
            >
              <Icon name="RotateCcw" size={20} color="textSecondary" />
            </Pressable>
          ) : undefined
        }
      />

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
            /* ── Minimal Animated Prompt Empty State ── */
            <View className="flex-1 items-center justify-center py-20 px-6">
              <Animated.View
                key={promptIndex}
                entering={FadeIn.duration(450)}
                className="items-center justify-center max-w-[320px]"
              >
                <Text
                  style={{ color: C.text }}
                  className="text-[25px] font-bold text-center tracking-tight leading-8"
                >
                  {PROMPTS[promptIndex]}
                </Text>
              </Animated.View>
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
              const showQuiz = !msg.isStreaming && isQuizWorthy(msg.content, msg.prompt);
              return (
                <View key={msg.id} className="flex-col w-full max-w-[95%] mb-5">
                  {msg.content ? (
                    <View
                      style={{
                        backgroundColor: C.card,
                        borderColor: C.border,
                      }}
                      className="rounded-3xl rounded-tl-md p-4 shadow-sm border"
                    >
                      <Text style={{ color: C.text }} className="text-[15px] leading-[23px] font-normal">
                        {msg.content}
                      </Text>

                      {!msg.isStreaming ? (
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
                          {showQuiz && (
                            <Animated.View entering={FadeIn.duration(300)}>
                              <Pressable
                                onPress={() => {
                                  haptics.selectionAsync();
                                  const topic = deriveTopic(msg.prompt);
                                  router.push({ pathname: '/(drawer)/generate', params: topic ? { topic } : {} } as any);
                                }}
                                style={{ backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E5F1FF' }}
                                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
                              >
                                <Icon name="HelpCircle" size={14} color="primary" />
                                <Text className="text-[11px] font-bold text-accent-electric-blue">Quiz me</Text>
                              </Pressable>
                            </Animated.View>
                          )}
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View
                      style={{ backgroundColor: C.card, borderColor: C.border, alignSelf: 'flex-start' }}
                      className="rounded-3xl rounded-tl-md px-4 py-3 shadow-sm border"
                    >
                      <TypingDots color={C.textSecondary} />
                    </View>
                  )}
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
                backgroundColor: '#007AFF',
                opacity: isGenerating || !inputVal.trim() ? 0.45 : 1,
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
