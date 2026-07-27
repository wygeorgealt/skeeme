import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, ScrollView, useColorScheme, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import CheckCircle from '@/assets/icons/pikaicons/check-tick-circle.svg';
import AltArrowLeft from '@/assets/icons/pikaicons/arrow-left.svg';
import { getSavedDecks } from '@/lib/offlineSaved';
import { AnimatedButton } from 'react-native-3d-animated-buttons';

type SavedDeck = Awaited<ReturnType<typeof getSavedDecks>>[number];

export default function SavedFlashcardsOfflineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<SavedDeck | null>(null);

  // Runtime deck state (offline)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getSavedDecks();
        const found = all.find((d) => d.id === id);
        if (!mounted) return;
        setDeck(found ?? null);
      } catch {
        Alert.alert('Offline Error', 'Could not load saved deck from offline storage.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    // Reset when deck id changes
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsFinished(false);
  }, [id]);

  const cards = useMemo(() => deck?.cards ?? [], [deck]);
  const cardCount = cards.length;
  const card = cards[currentIndex];

  const hasCard = !!card;

  const onNext = () => {
    haptics.impactAsync();
    if (!deck) return;

    if (!isRevealed) {
      setIsRevealed(true);
      return;
    }

    if (currentIndex >= cardCount - 1) {
      setIsFinished(true);
      return;
    }

    setIsRevealed(false);
    setCurrentIndex((p) => p + 1);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 16 }]}>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>Loading saved deck...</Text>
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AltArrowLeft width={22} height={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 22, marginTop: 16 }}>Saved deck not found</Text>
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
            <CheckCircle width={28} height={28} color="#34C759" />
          </View>
          <Text style={[styles.resultTitle, { color: C.text }]}>{cardCount} Cards Reviewed</Text>
          <Text style={[styles.resultSub, { color: C.textSecondary }]}>Offline results are view-only for this saved session.</Text>

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

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, backgroundColor: C.background }}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AltArrowLeft width={22} height={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textTertiary, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }}>
            Saved Offline Flashcards
          </Text>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 18 }} numberOfLines={1}>
            {deck.title}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.progressPill, { borderColor: C.separator }]}>
        <Text style={{ color: C.text, fontWeight: '900' }}>
          Card {currentIndex + 1}/{cardCount}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        disabled={!hasCard}
        onPress={() => {
          haptics.impactAsync();
          if (!isRevealed) setIsRevealed(true);
        }}
        style={[
          styles.cardWrap,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
        ]}
      >
        <Text style={[styles.cardType, { color: C.textTertiary }]}>{isRevealed ? 'ANSWER' : 'QUESTION'}</Text>
        <Text style={[styles.cardText, { color: C.text }]}>{isRevealed ? (card?.back ?? '') : (card?.front ?? '')}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 18, width: '100%' }}>
        <AnimatedButton
          title={isRevealed ? (currentIndex === cardCount - 1 ? 'Finish' : 'Next') : 'Reveal'}
          onPress={onNext}
          disabled={!hasCard}
          type="capsule"
          backgroundColor={hasCard ? '#007AFF' : isDark ? '#2C2C2E' : '#E5E5EA'}
          shadowColor={hasCard ? '#0066D6' : isDark ? '#1C1C1E' : '#D1D1D6'}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },

  progressPill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start' },

  cardWrap: {
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    minHeight: 220,
    justifyContent: 'center',
  },
  cardType: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardText: { fontSize: 20, fontWeight: '900', marginTop: 12, lineHeight: 28 },

  primaryBtn: { marginTop: 18, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  resultCard: { borderRadius: 24, padding: 18 },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 22, fontWeight: '900', marginTop: 12 },
  resultSub: { marginTop: 10, lineHeight: 20, fontWeight: '600' },
});

