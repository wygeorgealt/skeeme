import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, ScrollView, useColorScheme, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { CheckCircle, AltArrowLeft } from '@solar-icons/react-native/Bold';
import { getSavedQuizzes } from '@/lib/offlineSaved';
import { MCQCard } from '@/components/quiz/MCQCard';
import { TheoryCard } from '@/components/quiz/TheoryCard';

type SavedQuiz = Awaited<ReturnType<typeof getSavedQuizzes>>[number];

export default function SavedQuizOfflineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);

  // Runtime quiz state (offline)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [theoryResults, setTheoryResults] = useState<Record<number, boolean>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getSavedQuizzes();
        const found = all.find((q) => q.id === id);
        if (!mounted) return;
        setQuiz(found ?? null);
      } catch (e: any) {
        Alert.alert('Offline Error', 'Could not load saved quiz from offline storage.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const questions = useMemo(() => {
    if (!quiz?.questions) return [];
    // Stored shape in offline save will be same questions payload from generate.tsx:
    return (quiz.questions || []).map((q: any) => {
      const type = q.type === 'essay' ? 'essay' : (q.type || 'mcq');
      return {
        question_text: q.question_text ?? q.question ?? '',
        question_type: type === 'essay' ? 'essay' : 'mcq',
        options: q.options || [],
        correct_answer: q.correct_answer || '',
        explanation: q.explanation || '',
        explanation_right: q.explanation_right,
        explanation_wrong: q.explanation_wrong,
        id: q.id,
        difficulty_level: q.difficulty_level ?? q.difficulty ?? 'easy',
      };
    });
  }, [quiz]);

  const percentage = quiz?.percentage ?? 0;

  const isTheory = questions[currentQIndex]?.question_type === 'essay';

  const hasSelectedAction = useMemo(() => {
    if (!questions.length) return false;
    if (isTheory) return theoryResults[currentQIndex] !== undefined;
    return selectedAnswers[currentQIndex] !== undefined;
  }, [questions.length, isTheory, theoryResults, selectedAnswers, currentQIndex]);

  const onNext = () => {
    haptics.impactAsync();
    if (!quiz) return;
    if (!isRevealed && !isTheory) {
      setIsRevealed(true);
      return;
    }

    if (currentQIndex >= questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setIsRevealed(false);
    setCurrentQIndex((p) => p + 1);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 16 }]}>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>Loading saved quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AltArrowLeft size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 22, marginTop: 16 }}>Saved quiz not found</Text>
        <Text style={{ color: C.textSecondary, marginTop: 10, lineHeight: 20, paddingHorizontal: 16 }}>
          This item may have been deleted from offline storage.
        </Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, backgroundColor: C.background }}>
        <View style={[styles.resultCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>
          <View style={[styles.resultIcon, { backgroundColor: 'rgba(52,199,89,0.15)' }]}>
            <CheckCircle size={28} color="#34C759" />
          </View>
          <Text style={[styles.resultTitle, { color: C.text }]}>{Math.round(percentage)}% Saved Quiz</Text>
          <Text style={[styles.resultSub, { color: C.textSecondary }]}>
            Offline results are view-only for this saved session.
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.primaryBtn, { backgroundColor: '#007AFF' }]}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Back to Saved</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const q = questions[currentQIndex];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, backgroundColor: C.background }}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AltArrowLeft size={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textTertiary, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }}>
            Saved Offline Quiz
          </Text>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 18 }} numberOfLines={1}>
            {quiz.topic}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.progressPill, { borderColor: C.separator }]}>
        <Text style={{ color: C.text, fontWeight: '900' }}>
          Q {currentQIndex + 1}/{questions.length}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 26, lineHeight: 32 }}>{q.question_text}</Text>
      </View>

      <View style={{ marginTop: 16 }}>
        {!isTheory ? (
          <MCQCard
            q={q as any}
            qi={currentQIndex}
            quizFinished={isFinished}
            selectedAnswer={selectedAnswers[currentQIndex]}
            onAnswer={(qi, opt) => setSelectedAnswers((p) => ({ ...p, [qi]: opt }))}
          />
        ) : (
          <TheoryCard
            q={q as any}
            qi={currentQIndex}
            onGraded={(qi: number, passed: boolean) => setTheoryResults((p) => ({ ...p, [qi]: passed }))}
          />
        )}
      </View>

      <TouchableOpacity
        disabled={!hasSelectedAction}
        onPress={onNext}
        activeOpacity={0.85}
        style={[
          styles.primaryBtn,
          { backgroundColor: hasSelectedAction ? '#007AFF' : isDark ? '#2C2C2E' : '#E5E5EA' },
        ]}
      >
        <Text style={styles.primaryBtnText}>
          {isTheory ? (currentQIndex === questions.length - 1 ? 'Finish' : 'Next') : !isRevealed ? 'Check Answer' : currentQIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  progressPill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start' },
  primaryBtn: { marginTop: 18, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  resultCard: { borderRadius: 24, padding: 18 },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 22, fontWeight: '900', marginTop: 12 },
  resultSub: { marginTop: 10, lineHeight: 20, fontWeight: '600' },
});
