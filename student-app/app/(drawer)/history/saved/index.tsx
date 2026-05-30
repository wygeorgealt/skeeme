import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, SectionList, RefreshControl, useColorScheme, Platform, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { AltArrowRight, TrashBinTrash, DocumentText, Book, Copy } from '@solar-icons/react-native/Bold';

import { deleteSavedDeck, deleteSavedQuiz, getSavedDecks, getSavedQuizzes } from '@/lib/offlineSaved';

import { useAuthStore } from '@/store/authStore';

type TabKey = 'quizzes' | 'flashcards';

export default function SavedOfflineDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('quizzes');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const {
    data: savedQuizzes = [],
    refetch: refetchSavedQuizzes,
    isLoading: loadingQuizzes,
  } = useQuery({
    queryKey: ['offline-saved-quizzes'],
    queryFn: getSavedQuizzes,
    staleTime: 1000 * 30,
  });

  const {
    data: savedDecks = [],
    refetch: refetchSavedDecks,
    isLoading: loadingDecks,
  } = useQuery({
    queryKey: ['offline-saved-decks'],
    queryFn: getSavedDecks,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    // Redirect immediately on mount (same behavior as paid history)
    if (user?.plan_name === 'free') router.replace('/paywall');
  }, [user?.plan_name]);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['offline-saved-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['offline-saved-decks'] });
    }, [queryClient])
  );

  const onRefresh = useCallback(async () => {
    haptics.impactAsync();
    setRefreshing(true);
    try {
      if (activeTab === 'quizzes') await refetchSavedQuizzes();
      else await refetchSavedDecks();
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchSavedQuizzes, refetchSavedDecks]);

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'quiz' | 'flashcard' }) => {
      return type === 'quiz' ? deleteSavedQuiz(id) : deleteSavedDeck(id);
    },
    onSuccess: (_, variables) => {
      haptics.notificationAsync('success' as any);
      if (variables.type === 'quiz') queryClient.invalidateQueries({ queryKey: ['offline-saved-quizzes'] });
      else queryClient.invalidateQueries({ queryKey: ['offline-saved-decks'] });
    },
    onError: (err: any) => {
      Alert.alert('Delete Failed', err?.message || 'Could not delete saved item.');
    },
  });

  const handleDelete = (id: string, title: string, type: 'quiz' | 'flashcard') => {
    haptics.impactAsync();
    Alert.alert(
      'Delete Saved Item',
      `Delete "${title}" from offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id, type }) },
      ]
    );
  };

  const quizzes = savedQuizzes;
  const decks = savedDecks;

  const isLoading = activeTab === 'quizzes' ? loadingQuizzes : loadingDecks;

  const listItems = activeTab === 'quizzes'
    ? quizzes.map((q) => ({ id: q.id, type: 'quiz' as const, title: q.topic, subtitle: `${Math.round(q.percentage)}% • ${new Date(q.saved_at).toLocaleDateString()}`, payload: q }))
    : decks.map((d) => ({ id: d.id, type: 'flashcard' as const, title: d.title, subtitle: `${d.cards.length} cards • ${new Date(d.saved_at).toLocaleDateString()}`, payload: d }));

  const keyExtractor = (item: any, index: number) => item.id + '_' + index.toString();

  useEffect(() => {
    if (activeTab === 'quizzes' && quizzes.length === 0 && !loadingQuizzes) {
      // noop
    }
  }, [activeTab, quizzes.length, loadingQuizzes]);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Animated.View entering={FadeInUp.duration(500)} style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={[s.headerTitle, { color: C.text }] }>Saved (Offline)</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.tabContainer}>
        <View style={[s.segmentContainer, isDark ? s.segmentContainerDark : s.segmentContainerLight]}>
          {(['quizzes', 'flashcards'] as const).map(tab => {
            const isActive = activeTab === tab;
            const Icon = tab === 'quizzes' ? Book : Copy;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  haptics.impactAsync();
                  setActiveTab(tab);
                }}
                activeOpacity={0.9}
                style={[
                  s.segmentPill,
                    isActive && (isDark ? s.segmentPillActiveDark : s.segmentPillActiveLight),
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon size={14} color={isActive ? (isDark ? '#FFF' : '#000') : C.textTertiary} />
                  <Text
                    style={[
                      s.segmentText,
                      isActive ? { color: C.text, fontWeight: '700' } : { color: C.textTertiary, fontWeight: '500' },
                    ]}
                  >
                    {tab === 'quizzes' ? 'Quizzes' : 'Flashcards'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ flex: 1, paddingHorizontal: 20 }}>
        <SectionList
          sections={[
            {
              title: 'Saved',
              data: listItems,
            },
          ]}
          keyExtractor={keyExtractor}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary}/>}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <Text style={[s.sectionHeader, { color: C.textSecondary }] }>
              {section.title.toUpperCase()}
            </Text>
          )}
          renderItem={({ item }) => {
            const type = item.type;
            const rightActions = (
              <View style={{ width: 90 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#FF3B30',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: 200,
                    height: '100%',
                    position: 'absolute',
                    right: 0,
                  }}
                  onPress={() => handleDelete(item.id, item.title, type === 'quiz' ? 'quiz' : 'flashcard')}
                >
                  <View style={{ width: 90, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <TrashBinTrash size={22} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            );

            const openRoute = type === 'quiz'
              ? `/(drawer)/history/saved/quiz/${item.id}`
              : `/(drawer)/history/saved/flashcards/${item.id}`;

            return (
              <Swipeable renderRightActions={() => rightActions} overshootRight={false} containerStyle={{ marginBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    haptics.impactAsync();
                    router.push(openRoute as any);
                  }}
                  style={[
                    s.card,
                    isDark ? s.cardDark : s.cardLight,
                  ]}
                >
                  <View style={s.cardBody}>
                    <View style={[s.iconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                      {type === 'quiz' ? <DocumentText size={20} color={C.primary} /> : <DocumentText size={20} color={C.primary} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: C.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[s.cardSub, { color: C.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <AltArrowRight size={18} color={C.textTertiary} />
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
          ListEmptyComponent={() => {
            if (isLoading) return null;
            return (
              <View style={s.emptyContainer}>
                <View style={[s.emptyIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                  <DocumentText size={32} color={C.textTertiary} />
                </View>
                <Text style={[s.emptyTitle, { color: C.text }] }>No saved items yet</Text>
                <Text style={[s.emptySub, { color: C.textSecondary }]}>
                  Use "Save for offline" after finishing a quiz or deck.
                </Text>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },

  tabContainer: { paddingHorizontal: 20, marginBottom: 16 },
  segmentContainer: { flexDirection: 'row', borderRadius: 999, padding: 4 },
  segmentContainerLight: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFFFFF' },
  segmentContainerDark: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  segmentPill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
  segmentPillActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  segmentPillActiveDark: { backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
  segmentText: { fontSize: 14, letterSpacing: -0.2 },

  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 16, marginBottom: 16, paddingLeft: 4 },

  card: { borderRadius: 24, padding: 16, borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.06)' },
  cardDark: { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.08)' },

  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, fontWeight: '500' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
