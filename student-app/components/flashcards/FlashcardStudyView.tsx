import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Card = { id: string | number; front: string; back: string };

type Props = {
  cards: Card[];
  onRate?: (index: number, rating: 'again'|'hard'|'good'|'easy') => void;
};

export default function FlashcardStudyView({ cards = [], onRate }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const progress = useSharedValue(0);
  const C = Colors.light;

  useMemo(() => {
    progress.value = withTiming(cards.length ? (index + 1) / cards.length : 0, { duration: 300 });
  }, [index, cards.length]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round((progress.value || 0) * 100)}%`
  }));

  const next = () => { setFlipped(false); if (index < cards.length - 1) setIndex(i => i + 1); };
  const prev = () => { setFlipped(false); if (index > 0) setIndex(i => i - 1); };

  if (!cards.length) return <View style={styles.empty}><Text>No cards</Text></View>;

  const card = cards[index];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.counterText}>{index + 1} / {cards.length}</Text>
        <View style={styles.progressBg}><Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: C.primary }]} /></View>
      </View>

      <TouchableOpacity activeOpacity={0.95} onPress={() => setFlipped(f => !f)} style={styles.cardArea}>
        <View style={[styles.card, { width: SCREEN_WIDTH - 48 }]}> 
          <Text style={styles.cardText}>{flipped ? card.back : card.front}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={prev} style={styles.controlBtn}><Text>Prev</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { onRate?.(index, 'good'); next(); }} style={[styles.actionBtn, { backgroundColor: '#007AFF' }]}><Text style={{ color: '#fff' }}>Good</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { onRate?.(index, 'easy'); next(); }} style={styles.controlBtn}><Text>Easy</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 12, flex: 1 },
  headerRow: { marginBottom: 12 },
  counterText: { fontWeight: '700', marginBottom: 8 },
  progressBg: { height: 8, backgroundColor: '#f0eef6', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, padding: 28, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width:0, height:8 }, elevation: 6 },
  cardText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  controlBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#f3f3f6' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  empty: { padding: 24, alignItems: 'center', justifyContent: 'center' }
});
