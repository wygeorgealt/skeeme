import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pressable,
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { MathText } from '@/components/ui/MathText';
import { haptics } from '@/lib/haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { streamScanFollowUpChat } from '@/lib/aiStream';
import { scannerService, ScanResult } from '@/lib/scanner';
import { useAuthStore } from '@/store/authStore';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isStreaming?: boolean;
  /** Optional image URI attached by the user */
  imageUri?: string;
  /** The user prompt that produced this assistant reply */
  prompt?: string;
  /** Explicit topic extracted from scan or response */
  topic?: string;
};

const PROMPTS = [
  'Got a question or photo? Ask me',
  "Stuck on a problem? Snap or type it",
  'Need help studying? Fire away',
  'Curious about something? Ask away',
  "Got homework doubts? Let's break it down",
  'Prep time? Ask or scan anything',
  "Need a quick explanation? I'm here",
  'What are we learning today?',
];

const SMALL_TALK =
  /^(hi+|hey+|hello+|yo|sup|hola|thanks?|thank you|thx|ok(ay)?|cool|nice|great|good (morning|afternoon|evening|night)|how are you.*|what'?s up.*|who are you.*|bye|lol|hmm+)[\s!.?]*$/i;

const GENERIC_HEADINGS =
  /^(introduction|overview|summary|conclusion|key points|key takeaways|step \d+|steps|solution|answer|final answer|explanation|difference|differences|comparison|key differences|example|examples|definition|formula|formulas|in short|tl;?dr)$/i;

const MINOR_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'from',
  'by',
  'in',
  'of',
  'vs',
  'vs.',
  'with',
]);

function toTitleCaseTopic(raw: string): string {
  const cleaned = raw
    .replace(/[*_`~#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';

  const words = cleaned.split(' ');
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (lower === 'vs' || lower === 'versus') return 'and';
      if (index > 0 && index < words.length - 1 && MINOR_WORDS.has(lower)) {
        return lower;
      }
      // Preserve all-caps acronyms like HTTP, CPU, DNA, SQL, API
      if (word.length >= 2 && word.length <= 5 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Decide whether an assistant reply actually taught something worth quizzing on.
 */
function isQuizWorthy(reply: string, prompt?: string, hasTopic?: boolean): boolean {
  const text = (reply || '').trim();
  const userText = (prompt || '').trim();
  if (!text) return false;
  if (hasTopic && text.split(/\s+/).length >= 30) return true;
  if (userText && SMALL_TALK.test(userText)) return false;

  const words = text.split(/\s+/).length;
  if (words < 65) return false;

  const hasList = /(^|\n)\s*([-*•]|\d+[.)])\s+\S/.test(text);
  const hasHeadings = /(^|\n)#{1,4}\s+\S|\*\*[^*]{3,}\*\*/.test(text);
  const hasMath = /\$[^$]+\$|\\\(|\\\[|=\s*\S/.test(text);
  const hasTeachingCue =
    /\b(step\s*\d|for example|e\.g\.|in summary|key (points|idea|concept)|definition|formula|therefore|this means|difference)\b/i.test(
      text
    );
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;

  const signals = [hasList, hasHeadings, hasMath, hasTeachingCue, paragraphs >= 2].filter(Boolean).length;
  return signals >= 1 || words >= 160;
}

/**
 * Derive a clean, Title-Cased subject/topic of the answer (e.g. "Cache and Load Balancing")
 * rather than echoing the user's raw question string.
 */
function deriveTopic(reply: string, prompt?: string, explicitTopic?: string): string {
  // 1. If a structured scan topic was explicitly provided, use it
  if (explicitTopic && explicitTopic.trim().length > 2) {
    return toTitleCaseTopic(explicitTopic.trim()).slice(0, 75);
  }

  // 2. Inspect Markdown headings (## Heading) in the assistant's reply
  if (reply) {
    const headingMatches = Array.from(reply.matchAll(/(?:^|\n)#{1,3}\s+([^\n]+)/g));
    for (const match of headingMatches) {
      let candidate = (match[1] || '')
        .replace(/[*_`~]+/g, '')
        .replace(/^(topic|subject|concept)\s*:\s*/i, '')
        .replace(/[?.!]+$/, '')
        .trim();

      // Strip conversational prefixes if the heading echoed "Difference Between X and Y"
      candidate = candidate
        .replace(/^(the\s+)?(key\s+|main\s+)?(differences?\s+between|comparison\s+of|understanding|introduction\s+to|overview\s+of|what\s+is|what\s+are|how\s+to)\s+/i, '')
        .trim();

      if (
        candidate.length >= 3 &&
        candidate.length <= 68 &&
        !GENERIC_HEADINGS.test(candidate)
      ) {
        return toTitleCaseTopic(candidate);
      }
    }
  }

  // 3. Extract the core concept from the user's question by stripping question framing
  if (prompt) {
    let cleaned = prompt
      .replace(/\s+/g, ' ')
      .trim()
      .replace(
        /^(hey\s+skeemy[,!\s]*|hi[,!\s]*|hello[,!\s]*|can\s+you\s+|could\s+you\s+|would\s+you\s+|please\s+|pls\s+|help\s+me\s+|i\s+need\s+help\s+with\s+|i\s+want\s+to\s+know\s+|i\s+don'?t\s+understand\s+)+/i,
        ''
      )
      .replace(
        /^(explain\s+to\s+me\s+|explain\s+|tell\s+me\s+about\s+|teach\s+me\s+about\s+|teach\s+me\s+|describe\s+|define\s+|summarize\s+|break\s+down\s+|compare\s+and\s+contrast\s+|compare\s+|what\s+is\s+the\s+difference\s+between\s+|what\s+are\s+the\s+differences\s+between\s+|what'?s\s+the\s+difference\s+between\s+|difference\s+between\s+|differences\s+between\s+|what\s+is\s+the\s+meaning\s+of\s+|what\s+is\s+a\s+|what\s+is\s+an\s+|what\s+is\s+|what\s+are\s+|how\s+does\s+|how\s+do\s+|how\s+to\s+|why\s+does\s+|why\s+do\s+|why\s+is\s+|why\s+are\s+|solve\s+)+/i,
        ''
      )
      .replace(
        /\s+(work|works|working|in\s+detail|with\s+examples|simply|step\s+by\s+step|for\s+beginners|for\s+me|mean|means|used\s+for)[?.!]*$/i,
        ''
      )
      .replace(/^(the\s+|a\s+|an\s+)/i, '')
      .replace(/[?.!]+$/, '')
      .trim();

    if (cleaned.length >= 3 && cleaned.length <= 75) {
      return toTitleCaseTopic(cleaned);
    }
  }

  // 4. Fallback: first bolded key concept in the reply
  if (reply) {
    const boldMatch = reply.match(/\*\*([^*]{3,50})\*\*/);
    if (boldMatch && boldMatch[1]) {
      const candidate = boldMatch[1].replace(/[:.]+$/, '').trim();
      if (!GENERIC_HEADINGS.test(candidate)) {
        return toTitleCaseTopic(candidate);
      }
    }
  }

  return 'Core Concept Review';
}

function formatScanResultsToMarkdown(results: ScanResult[]): { markdown: string; topic?: string } {
  if (!results || results.length === 0) {
    return { markdown: '' };
  }
  const top = results[0];
  const parts: string[] = [];

  if (top.topic) {
    parts.push(`## ${top.topic.trim()}`);
  }

  if (top.question) {
    parts.push(`**Problem:** ${top.question.trim()}`);
  }

  if (top.steps && top.steps.length > 0) {
    const stepsMd = top.steps
      .map((s, idx) => `${idx + 1}. ${s.replace(/^\s*(?:step\s*\d+[:.)]|\d+[.)])\s*/i, '').trim()}`)
      .join('\n\n');
    parts.push(`### Step-by-Step Solution\n${stepsMd}`);
  } else if (top.explanation) {
    parts.push(top.explanation.trim());
  }

  if (top.solution) {
    parts.push(`**Final Answer:** ${top.solution.trim()}`);
  }

  if (top.summary) {
    parts.push(`> **Tip:** ${top.summary.trim()}`);
  }

  return {
    markdown: parts.join('\n\n'),
    topic: top.topic,
  };
}

/** ChatGPT-style three bouncing dots loader */
function TypingDots({ isDark }: { isDark: boolean }) {
  const dotColor = isDark ? '#60A5FA' : '#007AFF';
  return (
    <View style={styles.typingContainer}>
      <Dot index={0} color={dotColor} />
      <Dot index={1} color={dotColor} />
      <Dot index={2} color={dotColor} />
    </View>
  );
}

function Dot({ index, color }: { index: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 360, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 360, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
    }, index * 150);

    return () => clearTimeout(timer);
  }, [index, progress]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.value * 0.65,
    transform: [
      { translateY: -4 * progress.value },
      { scale: 0.9 + progress.value * 0.22 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        animatedDotStyle,
      ]}
    />
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openCamera?: string; prompt?: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleCreditsModal = useAuthStore((s) => s.toggleCreditsModal);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));

  // Image attachment state (ChatGPT / Claude / Gemini composer style)
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);

  const abortStreamRef = useRef<(() => void) | null>(null);

  // Pick a fresh greeting each time the screen is entered
  useFocusEffect(
    useCallback(() => {
      setPromptIndex((prev) => {
        let next = Math.floor(Math.random() * PROMPTS.length);
        if (next === prev) next = (next + 1) % PROMPTS.length;
        return next;
      });
    }, [])
  );

  // Auto-open camera if navigated with ?openCamera=1
  useEffect(() => {
    if (params.openCamera === '1' || params.openCamera === 'true') {
      handleOpenCamera();
      router.setParams({ openCamera: undefined } as any);
    }
  }, [params.openCamera]);

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

  const handleOpenCamera = async () => {
    try {
      await haptics.selectionAsync();
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission', 'Please allow camera access in Settings to take photos.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        setAttachedImageUri(res.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Camera Error', e?.message || 'Unable to open camera.');
    }
  };

  const handlePickImage = async () => {
    try {
      await haptics.selectionAsync();
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        setAttachedImageUri(res.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Gallery Error', e?.message || 'Could not pick image.');
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputVal).trim();
    const imageToSend = attachedImageUri;

    if ((!text && !imageToSend) || isGenerating) return;

    haptics.impactAsync();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const displayPrompt = text || (imageToSend ? 'Solve and explain this problem step-by-step' : '');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      imageUri: imageToSend || undefined,
      time: now,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      time: now,
      isStreaming: true,
      prompt: displayPrompt,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, assistantPlaceholder]);
    setInputVal('');
    setAttachedImageUri(null);
    setIsGenerating(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // ── Branch A: Image attached → Scan & Solve directly inside Chat ──
    if (imageToSend) {
      try {
        const manip = await manipulateAsync(
          imageToSend,
          [{ resize: { width: 1200 } }],
          { compress: 0.8, format: SaveFormat.JPEG, base64: true }
        );

        if (!manip.base64) {
          throw new Error('Could not encode image');
        }

        abortStreamRef.current = scannerService.streamSolve(manip.base64, 'deepseek', {
          onDelta: (partialResults) => {
            const { markdown, topic } = formatScanResultsToMarkdown(partialResults);
            if (markdown.trim().length > 0) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: markdown, topic: topic || m.topic }
                    : m
                )
              );
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          },
          onFullResult: (finalResults) => {
            const { markdown, topic } = formatScanResultsToMarkdown(finalResults);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content:
                        markdown.trim() ||
                        'Could not detect a clear question in that image. Please try snapping a clearer photo.',
                      topic: topic || m.topic,
                      isStreaming: false,
                    }
                  : m
              )
            );
          },
          onComplete: () => {
            setIsGenerating(false);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
            );
            abortStreamRef.current = null;
            checkAuth().catch(() => {});
            haptics.selectionAsync(true);
          },
          onError: (err, isInsufficientCredits) => {
            setIsGenerating(false);
            if (isInsufficientCredits) {
              toggleCreditsModal(true, 'scan');
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: isInsufficientCredits
                        ? 'You do not have enough credits to solve this scan. Please top up your credits.'
                        : m.content || `Unable to analyze the image right now (${err}). Please try again.`,
                      isStreaming: false,
                    }
                  : m
              )
            );
            abortStreamRef.current = null;
          },
        });
      } catch (e: any) {
        setIsGenerating(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: e?.message || 'Could not process the selected image.',
                  isStreaming: false,
                }
              : m
          )
        );
      }
      return;
    }

    // ── Branch B: Text message → Stream from Skeemy AI Tutor ──
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content || (m.imageUri ? '[Uploaded study image]' : ''),
    }));

    abortStreamRef.current = streamScanFollowUpChat(
      {
        messages: apiMessages,
        context:
          'You are Skeemy, an intelligent, patient, and expert AI tutor designed for high school and university students. Help the student understand core academic concepts, solve problems step-by-step, and prepare for exams. Whenever you explain an academic concept, topic, or comparison, begin your response with a concise "## Topic Title" markdown heading (2 to 5 words in Title Case, e.g. "## Cache and Load Balancing" or "## Newton\'s Second Law") that names the core subject of your answer. Use clean markdown formatting and valid LaTeX for mathematical equations.',
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
        onError: () => {
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

  const canSend = !isGenerating && (Boolean(inputVal.trim()) || Boolean(attachedImageUri));

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScreenHeader
        title="Chat With Skeemy"
        onBack={handleBack}
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
          contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
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
                      {msg.imageUri ? (
                        <View
                          style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            marginBottom: msg.content ? 6 : 0,
                            borderWidth: 1,
                            borderColor: C.border,
                          }}
                        >
                          <Image
                            source={{ uri: msg.imageUri }}
                            style={{ width: 210, height: 155 }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}
                      {msg.content ? (
                        <View className="bg-accent-electric-blue rounded-3xl rounded-tr-md px-4 py-3 shadow-sm">
                          <Text style={{ color: '#FFFFFF' }} className="text-[15px] leading-[22px] font-medium">
                            {msg.content}
                          </Text>
                        </View>
                      ) : null}
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
              const hasVisibleContent = msg.content.trim().length > 0;
              const showQuiz = !msg.isStreaming && isQuizWorthy(msg.content, msg.prompt, Boolean(msg.topic));

              return (
                <View key={msg.id} className="flex-col w-full max-w-[95%] mb-5">
                  {hasVisibleContent ? (
                    <View
                      style={{
                        backgroundColor: C.card,
                        borderColor: C.border,
                      }}
                      className="rounded-3xl rounded-tl-md p-4 shadow-sm border"
                    >
                      <MathText content={msg.content} color={C.text} fontSize={15} />

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
                                  const topic = deriveTopic(msg.content, msg.prompt, msg.topic);
                                  router.push({
                                    pathname: '/(drawer)/generate',
                                    params: topic ? { topic } : {},
                                  } as any);
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
                      style={[
                        styles.loaderBubble,
                        {
                          backgroundColor: C.card,
                          borderColor: C.border,
                        },
                      ]}
                    >
                      <TypingDots isDark={isDark} />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ── Bottom Multimodal Input Dock (ChatGPT / Claude / Gemini Style) ── */}
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, 12) + 74,
            backgroundColor: 'transparent',
          }}
          className="pt-2 px-4"
        >
          <View
            style={[
              styles.composerCard,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
          >
            {/* Attached Image Preview Tray inside the Composer */}
            {attachedImageUri ? (
              <View style={styles.attachmentTray}>
                <View style={[styles.attachmentThumbWrap, { borderColor: C.border }]}>
                  <Image
                    source={{ uri: attachedImageUri }}
                    style={styles.attachmentThumb}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => {
                      haptics.selectionAsync();
                      setAttachedImageUri(null);
                    }}
                    hitSlop={8}
                    style={styles.attachmentRemoveBtn}
                  >
                    <Icon name="X" size={12} color="white" />
                  </Pressable>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.text }}>
                    Photo ready to scan & solve
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textSecondary, marginTop: 1 }}>
                    Tap send to solve immediately, or add instructions below
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Input Row: Camera + Gallery + TextInput + Send */}
            <View style={styles.composerRow}>
              <Pressable
                onPress={handleOpenCamera}
                disabled={isGenerating}
                hitSlop={6}
                style={[styles.mediaIconBtn, { backgroundColor: C.surfaceLow }]}
              >
                <Icon name="Camera" size={18} color="default" />
              </Pressable>

              <Pressable
                onPress={handlePickImage}
                disabled={isGenerating}
                hitSlop={6}
                style={[styles.mediaIconBtn, { backgroundColor: C.surfaceLow }]}
              >
                <Icon name="Image" size={18} color="default" />
              </Pressable>

              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                onSubmitEditing={() => handleSend()}
                style={[styles.textInput, { color: C.text }]}
                placeholder={
                  attachedImageUri
                    ? 'Add a note or tap send to solve…'
                    : 'Ask or scan a study question…'
                }
                placeholderTextColor={C.textTertiary}
                returnKeyType="send"
                editable={!isGenerating}
              />

              <Pressable
                onPress={() => handleSend()}
                disabled={!canSend}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: '#007AFF',
                    opacity: canSend ? 1 : 0.4,
                  },
                ]}
              >
                <Icon name="ArrowUp" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderBubble: {
    alignSelf: 'flex-start',
    borderRadius: 24,
    borderTopLeftRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    minWidth: 68,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 18,
    minWidth: 40,
  },
  composerCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  attachmentTray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 10,
  },
  attachmentThumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentThumb: {
    width: '100%',
    height: '100%',
  },
  attachmentRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
