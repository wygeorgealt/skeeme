import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pressable,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  Modal,
  Dimensions,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
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
import { appStorage } from '@/lib/storage';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

/** Smooth greyish fading "Thinking..." indicator */
function ThinkingLoader({ isDark }: { isDark: boolean }) {
  const fadeAnim = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        RNAnimated.timing(fadeAnim, {
          toValue: 0.28,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim]);

  return (
    <RNAnimated.View style={[styles.thinkingWrap, { opacity: fadeAnim }]}>
      <Text
        style={[
          styles.thinkingText,
          { color: isDark ? '#98989F' : '#6E6E73' },
        ]}
      >
        Thinking...
      </Text>
    </RNAnimated.View>
  );
}

/** Get deterministic YYYY-MM-DD key in local time */
const getTodayDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDailyChatKey = (userId?: number | string) =>
  `skeeme_daily_chat_count_${getTodayDateKey()}_${userId || 'guest'}`;

export const getDailyChatCount = async (userId?: number | string): Promise<number> => {
  try {
    const val = await appStorage.getItem(getDailyChatKey(userId));
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const incrementDailyChatCount = async (userId?: number | string): Promise<number> => {
  try {
    const key = getDailyChatKey(userId);
    const current = await getDailyChatCount(userId);
    const next = current + 1;
    await appStorage.setItem(key, String(next));
    return next;
  } catch {
    return 1;
  }
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openCamera?: string; prompt?: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const user = useAuthStore((s) => s.user);
  const toggleCreditsModal = useAuthStore((s) => s.toggleCreditsModal);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const isPro = user?.plan_name === 'pro' || user?.plan_name === 'max';
  const isOutOfCredits = !isPro && (user?.credits ?? 0) <= 0;

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [dailyChatCount, setDailyChatCount] = useState<number>(0);

  const isOutOfFreeMessages = !isPro && dailyChatCount >= 2;

  // Image attachment state (ChatGPT / Claude / Gemini composer style)
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [attachModalVisible, setAttachModalVisible] = useState(false);

  const abortStreamRef = useRef<(() => void) | null>(null);

  // Pick a fresh greeting and sync daily chat count each time the screen is entered
  useFocusEffect(
    useCallback(() => {
      setPromptIndex((prev) => {
        let next = Math.floor(Math.random() * PROMPTS.length);
        if (next === prev) next = (next + 1) % PROMPTS.length;
        return next;
      });
      getDailyChatCount(user?.id).then((count) => {
        setDailyChatCount(count);
      });
    }, [user?.id])
  );

  // Auto-open camera if navigated with ?openCamera=1
  useEffect(() => {
    if (params.openCamera === '1' || params.openCamera === 'true') {
      if (isOutOfCredits) {
        router.setParams({ openCamera: undefined } as any);
        router.push('/paywall');
      } else {
        handleOpenCamera();
        router.setParams({ openCamera: undefined } as any);
      }
    }
  }, [params.openCamera, isOutOfCredits]);

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
    if (isOutOfCredits) {
      router.push('/paywall');
      return;
    }
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
    if (isOutOfCredits) {
      router.push('/paywall');
      return;
    }
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
    if (isGenerating) return;

    // Free users: 2 free messages per day (do not use credits to chat)
    const isPro = user?.plan_name === 'pro' || user?.plan_name === 'max';
    if (!isPro) {
      const todayCount = await getDailyChatCount(user?.id);
      setDailyChatCount(todayCount);
      if (todayCount >= 2) {
        haptics.impactAsync();
        toggleCreditsModal(true, 'chat');
        return;
      }
    }

    const text = (textToSend !== undefined ? textToSend : inputVal).trim();
    const imageToSend = attachedImageUri;

    if (!text && !imageToSend) return;

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

    if (!isPro) {
      const nextCount = await incrementDailyChatCount(user?.id);
      setDailyChatCount(nextCount);
    }

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
              toggleCreditsModal(true, isPro ? 'scan' : 'chat');
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: isInsufficientCredits
                        ? (!isPro ? 'Ur limit has reached. Please upgrade to Pro to continue.' : 'You do not have enough credits to solve this scan. Please top up your credits.')
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
        onError: (err?: string, isInsufficient?: boolean) => {
          setIsGenerating(false);
          if (isInsufficient || err?.includes('limit_reached') || err?.includes('limit')) {
            toggleCreditsModal(true, 'chat');
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      (isInsufficient || err?.includes('limit_reached'))
                        ? 'Ur limit has reached. Please upgrade to Pro to continue chatting.'
                        : m.content || "I'm having trouble connecting to the study server. Please verify your connection or try again in a moment.",
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

  const canSend = !isGenerating && (isOutOfFreeMessages || Boolean(inputVal.trim()) || Boolean(attachedImageUri));

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScreenHeader
        title=""
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
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
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

              // Assistant message — wait until visible text (not just leading # or *) has arrived
              const hasVisibleContent =
                msg.content.replace(/^[#*\-\s>`~_]+/g, '').trim().length > 0;
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
                    <ThinkingLoader isDark={isDark} />
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ── Bottom Multimodal Input Dock (ChatGPT / Claude / Gemini Style) ── */}
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: C.background,
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

            {/* Input Row: Plus Button + TextInput + Send */}
            <View style={styles.composerRow}>
              <Pressable
                onPress={() => {
                  haptics.selectionAsync();
                  setAttachModalVisible(true);
                }}
                disabled={isGenerating}
                hitSlop={6}
                style={[styles.mediaIconBtn, { backgroundColor: C.surfaceLow }]}
              >
                <Icon name="Plus" size={20} color="default" />
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

      {/* ── Attachment Bottom Sheet Modal ── */}
      {attachModalVisible && (
        <Modal
          transparent
          visible={attachModalVisible}
          animationType="none"
          onRequestClose={() => setAttachModalVisible(false)}
        >
          <View style={styles.sheetContainer}>
            {/* Backdrop */}
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(150)}
              style={StyleSheet.absoluteFill}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setAttachModalVisible(false)}
              >
                <BlurView
                  intensity={5}
                  blurMethod="dimezisBlurView"
                  style={StyleSheet.absoluteFill}
                  tint={isDark ? 'dark' : 'light'}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0,0,0,0.18)' },
                  ]}
                />
              </Pressable>
            </Animated.View>

            {/* Bottom Sheet */}
            <Animated.View
              entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
              exiting={SlideOutDown.duration(180).easing(Easing.in(Easing.cubic))}
              style={[
                styles.sheet,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              <View
                style={[
                  styles.sheetHandle,
                  { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' },
                ]}
              />

              <View style={styles.sheetContent}>
                <View style={styles.attachGrid}>
                  {/* Square 1: Camera */}
                  <TouchableOpacity
                    activeOpacity={isOutOfCredits ? 0.7 : 0.85}
                    onPress={() => {
                      if (isOutOfCredits) {
                        haptics.impactAsync();
                        setAttachModalVisible(false);
                        router.push('/paywall');
                        return;
                      }
                      haptics.selectionAsync();
                      setAttachModalVisible(false);
                      setTimeout(() => {
                        handleOpenCamera();
                      }, 220);
                    }}
                    style={[
                      styles.attachSquare,
                      {
                        backgroundColor: isDark ? '#252528' : '#F8F9FA',
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                      },
                      isOutOfCredits && {
                        opacity: 0.45,
                        backgroundColor: isDark ? '#1E1E20' : '#F0F1F3',
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    {isOutOfCredits && (
                      <View style={styles.attachLockBadge}>
                        <Icon name="Lock" size={13} color="muted" />
                      </View>
                    )}
                    <View style={styles.attachIconWrap}>
                      <Icon
                        name="Camera"
                        size={26}
                        color={isOutOfCredits ? 'muted' : 'default'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.attachSquareTitle,
                        { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                        isOutOfCredits && { color: isDark ? '#8E8E93' : '#8E8E93' },
                      ]}
                    >
                      Camera
                    </Text>
                  </TouchableOpacity>

                  {/* Square 2: Photos */}
                  <TouchableOpacity
                    activeOpacity={isOutOfCredits ? 0.7 : 0.85}
                    onPress={() => {
                      if (isOutOfCredits) {
                        haptics.impactAsync();
                        setAttachModalVisible(false);
                        router.push('/paywall');
                        return;
                      }
                      haptics.selectionAsync();
                      setAttachModalVisible(false);
                      setTimeout(() => {
                        handlePickImage();
                      }, 220);
                    }}
                    style={[
                      styles.attachSquare,
                      {
                        backgroundColor: isDark ? '#252528' : '#F8F9FA',
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                      },
                      isOutOfCredits && {
                        opacity: 0.45,
                        backgroundColor: isDark ? '#1E1E20' : '#F0F1F3',
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    {isOutOfCredits && (
                      <View style={styles.attachLockBadge}>
                        <Icon name="Lock" size={13} color="muted" />
                      </View>
                    )}
                    <View style={styles.attachIconWrap}>
                      <Icon
                        name="Image"
                        size={26}
                        color={isOutOfCredits ? 'muted' : 'default'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.attachSquareTitle,
                        { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                        isOutOfCredits && { color: isDark ? '#8E8E93' : '#8E8E93' },
                      ]}
                    >
                      Photos
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thinkingWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  thinkingText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
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
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: SCREEN_WIDTH,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  attachGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  attachSquare: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  attachIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attachSquareTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  attachLockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
